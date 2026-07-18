// Real user-to-user messaging on top of housing_conversations/housing_messages
// (created by supabase/housing.sql). RLS restricts every query to conversations
// the signed-in user takes part in.

import { createClient } from "@/utils/supabase/client";
import { fetchRoommatePinsByUserIds } from "@/utils/housing";
import { type RoommatePin } from "@/app/data/housing-cities";

export type ChatMessage = {
  from: "me" | "them";
  text: string;
  time: string;
};

export type RealConversation = {
  id: string;
  otherUserId: string;
  // The other participant's roommate profile, or null if they haven't created
  // one (the UI falls back to a neutral placeholder).
  profile: RoommatePin | null;
  messages: ChatMessage[];
  unread: number;
};

function toTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// Find (or start) the one conversation between me and another user.
export async function getOrCreateConversation(otherUserId: string): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not-signed-in");
  if (user.id === otherUserId) throw new Error("self-conversation");

  // RLS already limits rows to my own conversations, so matching the other
  // participant on either column is enough.
  const { data: existing, error: findError } = await supabase
    .from("housing_conversations")
    .select("id")
    .or(`participant_a.eq.${otherUserId},participant_b.eq.${otherUserId}`)
    .limit(1);
  if (findError) throw findError;
  if (existing && existing.length > 0) return existing[0].id;

  const { data: created, error: insertError } = await supabase
    .from("housing_conversations")
    .insert({ participant_a: user.id, participant_b: otherUserId })
    .select("id")
    .single();
  if (insertError) {
    // A parallel insert from the other side can win the unique-pair race;
    // fall back to looking the conversation up again.
    const { data: retry } = await supabase
      .from("housing_conversations")
      .select("id")
      .or(`participant_a.eq.${otherUserId},participant_b.eq.${otherUserId}`)
      .limit(1);
    if (retry && retry.length > 0) return retry[0].id;
    throw insertError;
  }
  return created.id;
}

// All my conversations with the other participant's profile, full message
// history and unread count. Small scale by design; revisit if inboxes grow.
export async function listConversations(): Promise<RealConversation[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: convs, error: convError } = await supabase
    .from("housing_conversations")
    .select("id, participant_a, participant_b")
    .order("created_at", { ascending: false });
  if (convError) throw convError;
  if (!convs || convs.length === 0) return [];

  const otherIds = convs.map(c => (c.participant_a === user.id ? c.participant_b : c.participant_a));
  const profiles = await fetchRoommatePinsByUserIds(otherIds);
  const profileByUser = new Map(profiles.map(p => [p.userId!, p]));

  const { data: msgs, error: msgError } = await supabase
    .from("housing_messages")
    .select("conversation_id, sender_id, content, created_at, read_at")
    .in("conversation_id", convs.map(c => c.id))
    .order("created_at", { ascending: true });
  if (msgError) throw msgError;

  return convs.map(c => {
    const otherUserId = c.participant_a === user.id ? c.participant_b : c.participant_a;
    const mine = (msgs ?? []).filter(m => m.conversation_id === c.id);
    return {
      id: c.id,
      otherUserId,
      profile: profileByUser.get(otherUserId) ?? null,
      messages: mine.map(m => ({
        from: m.sender_id === user.id ? ("me" as const) : ("them" as const),
        text: m.content,
        time: toTime(m.created_at),
      })),
      unread: mine.filter(m => m.sender_id !== user.id && !m.read_at).length,
    };
  });
}

export async function sendHousingMessage(conversationId: string, text: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not-signed-in");
  const { error } = await supabase.from("housing_messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: text,
  });
  if (error) throw error;
}

// Mark everything the other side sent as read.
export async function markConversationRead(conversationId: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("housing_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .is("read_at", null);
}
