// Reporting a listing, from the browser.
// Tables and policies: supabase/housing_reports_blocks.sql.
//
// Every write here goes through the ordinary anon client, because RLS already
// says what each user may do (file a report as themselves). There is nothing for a server action to add — it would only be a
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
  target: { target_type: "listing"; listing_id: string },
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
