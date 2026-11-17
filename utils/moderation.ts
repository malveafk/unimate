// Reporting and blocking, from the browser.
// Tables and policies: supabase/housing_reports_blocks.sql.
//
// Every write here goes through the ordinary anon client, because RLS already
// says what each user may do (file a report as themselves, block on their own
// behalf). There is nothing for a server action to add — it would only be a
// second place to get the same check wrong.

import { createClient } from "@/utils/supabase/client";
import { type ReportReason } from "@/utils/reportReasons";

// Re-exported so a caller that already imports this module does not need a
// second import for the type. The list itself lives in utils/reportReasons.ts
// because the admin Server Component needs it without the browser client.
export { REPORT_REASONS, type ReportReason } from "@/utils/reportReasons";

// ── Error codes the UI can act on ────────────────────────────────────────────
// Thrown as plain Error messages so a caller can switch on them. Anything else
// bubbles up as the raw Postgres error.
//
//   already-reported  this person already reported this target (unique index)
//   not-signed-in     no session
//   not-set-up        supabase/housing_reports_blocks.sql has not been run here

const UNIQUE_VIOLATION = "23505";
// A missing table reaches us as PGRST205, not Postgres's 42P01: PostgREST
// checks its schema cache and refuses the request before any SQL runs. 42P01
// is kept for a query that does reach Postgres (e.g. through a function).
const UNDEFINED_TABLE = new Set(["PGRST205", "42P01"]);

function translate(error: { code?: string; message: string }): Error {
  if (error.code === UNIQUE_VIOLATION) return new Error("already-reported");
  if (error.code && UNDEFINED_TABLE.has(error.code)) return new Error("not-set-up");
  return new Error(error.message);
}

async function requireUserId(): Promise<string> {
  const { data: { user } } = await createClient().auth.getUser();
  if (!user) throw new Error("not-signed-in");
  return user.id;
}

// ── Reports ──────────────────────────────────────────────────────────────────

async function fileReport(
  target: { target_type: "listing"; listing_id: string } | { target_type: "profile"; profile_user_id: string },
  reason: ReportReason,
  details: string,
): Promise<void> {
  const supabase = createClient();
  const reporterId = await requireUserId();

  const { error } = await supabase.from("housing_reports").insert({
    reporter_id: reporterId,
    ...target,
    reason,
    // An empty textarea is no information, so it is stored as null rather than
    // as "" — the admin queue can then show the box only when there is one.
    details: details.trim() || null,
  });
  if (error) throw translate(error);
}

export function reportListing(listingId: string, reason: ReportReason, details: string): Promise<void> {
  return fileReport({ target_type: "listing", listing_id: listingId }, reason, details);
}

export function reportProfile(userId: string, reason: ReportReason, details: string): Promise<void> {
  return fileReport({ target_type: "profile", profile_user_id: userId }, reason, details);
}

// ── Blocks ───────────────────────────────────────────────────────────────────

export async function blockUser(userId: string): Promise<void> {
  const supabase = createClient();
  const blockerId = await requireUserId();
  if (blockerId === userId) throw new Error("cannot-block-yourself");

  // Blocking someone already blocked is a no-op, not an error: the UI may be
  // showing a stale state, and the outcome the user asked for already holds.
  const { error } = await supabase
    .from("housing_blocks")
    .upsert({ blocker_id: blockerId, blocked_id: userId }, { onConflict: "blocker_id,blocked_id" });
  if (error) throw translate(error);
}

export async function unblockUser(userId: string): Promise<void> {
  const supabase = createClient();
  const blockerId = await requireUserId();

  const { error } = await supabase
    .from("housing_blocks")
    .delete()
    .eq("blocker_id", blockerId)
    .eq("blocked_id", userId);
  if (error) throw translate(error);
}

// ── Reading my own blocks ────────────────────────────────────────────────────
//
// Fails OPEN, and that is a deliberate asymmetry with the policies in the SQL
// file, which fail closed.
//
// This list only decides what to HIDE from a map. If the query fails — the
// migration has not been run on this database, the network blipped — returning
// an empty list means a blocked profile stays visible for one page load.
// Throwing instead would take down the entire housing map for everyone,
// trading a small failure for a total one. The rule that actually matters,
// "this person cannot contact me", lives in the database and is not affected
// by anything that happens here.

export async function fetchBlockedUserIds(): Promise<string[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("housing_blocks")
      .select("blocked_id")
      .eq("blocker_id", user.id);
    if (error) throw error;

    return (data ?? []).map(row => row.blocked_id as string);
  } catch {
    return [];
  }
}

export type BlockedUser = {
  userId: string;
  // From their roommate profile, which is public. Null when they never made
  // one — there is no other name to show, since `profiles` (which holds the
  // email) is readable only by its owner.
  name: string | null;
  city: string | null;
  blockedAt: string;
};

// The account page's "Blocked accounts" list. Two queries rather than a join,
// because housing_blocks has no foreign key into housing_profiles (it points
// at auth.users) and PostgREST can only embed along a declared relationship.
export async function fetchBlockedUsers(): Promise<BlockedUser[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("housing_blocks")
    .select("blocked_id, created_at")
    .eq("blocker_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw translate(error);

  const rows = data ?? [];
  if (rows.length === 0) return [];

  const { data: profiles } = await supabase
    .from("housing_profiles")
    .select("user_id, first_name, city")
    .in("user_id", rows.map(r => r.blocked_id as string));

  const byUser = new Map((profiles ?? []).map(p => [p.user_id as string, p]));

  return rows.map(row => {
    const profile = byUser.get(row.blocked_id as string);
    return {
      userId: row.blocked_id as string,
      name: (profile?.first_name as string | undefined) ?? null,
      city: (profile?.city as string | undefined) ?? null,
      blockedAt: row.created_at as string,
    };
  });
}
