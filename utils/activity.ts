import { createClient } from "@/utils/supabase/client";

// Records that the logged-in user opened something (foundation of the
// chatbot's memory). Non-logged-in visitors are never tracked. De-duplication
// is handled by the unique constraint on (user_id, activity_type, target_id):
// re-opening the same target just refreshes last_seen_at.
export async function trackUniversityView(universityId: string, universityName?: string) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return; // only track logged-in users

  const { error } = await supabase.from("user_activity").upsert(
    {
      user_id: user.id,
      activity_type: "university_view",
      target_id: universityId,
      target_label: universityName ?? null,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "user_id,activity_type,target_id" }
  );

  // Tracking is best-effort: never let a logging failure disrupt the page.
  if (error) console.error("Failed to track university view:", error.message);
}

// Records that the logged-in user compared a set of universities (foundation of
// the chatbot's memory). Non-logged-in visitors are never tracked. The target_id
// is a stable identifier of the compared set (ids sorted + joined), so the same
// comparison in any order de-duplicates into one row and just refreshes
// last_seen_at.
export async function trackComparison(universities: { id: string; name: string }[]) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return; // only track logged-in users

  const sorted = [...universities].sort((a, b) => a.id.localeCompare(b.id));
  const targetId = sorted.map((u) => u.id).join("+");
  const targetLabel = sorted.map((u) => u.name).join(" vs ");

  const { error } = await supabase.from("user_activity").upsert(
    {
      user_id: user.id,
      activity_type: "comparison",
      target_id: targetId,
      target_label: targetLabel,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "user_id,activity_type,target_id" }
  );

  // Tracking is best-effort: never let a logging failure disrupt the page.
  if (error) console.error("Failed to track comparison:", error.message);
}
