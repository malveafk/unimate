"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { isAdminEmail } from "@/utils/adminEmails";

/**
 * Decide on a housing listing that is waiting in the review queue.
 *
 * A Server Action is a public endpoint: Next.js gives it a URL, and anyone who
 * finds that URL can call it with any id they like. Rendering the buttons only
 * for an admin is therefore NOT a security measure — it only hides them. So the
 * caller is authenticated and checked against ADMIN_EMAILS again here, exactly
 * as app/admin/page.tsx does before rendering, and the service-role client is
 * only created after that check passes.
 *
 * The service role is what makes the write go through: the trigger in
 * supabase/housing_listing_review.sql refuses a status change from any other
 * role, which is the whole point of the queue.
 */
async function setListingStatus(id: string, status: "approved" | "rejected"): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) throw new Error("not-an-admin");

  const admin = createAdminClient();
  // reviewed_at is the decision time shown under "Recently decided"; updated_at
  // can't serve, since it moves on every later write to the row.
  const { error } = await admin
    .from("housing_listings")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;

  // The queue and the map both change as a result of this decision.
  revalidatePath("/admin");
  revalidatePath("/housing");
}

/** Reads the id out of the submitted form and rejects anything that isn't a uuid. */
function listingIdFrom(formData: FormData): string {
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error("bad-listing-id");
  }
  return id;
}

export async function approveListing(formData: FormData): Promise<void> {
  await setListingStatus(listingIdFrom(formData), "approved");
}

export async function rejectListing(formData: FormData): Promise<void> {
  await setListingStatus(listingIdFrom(formData), "rejected");
}

// ── Reports ──────────────────────────────────────────────────────────────────
//
// Same shape as the listing decisions above, and the same reason for it: a
// Server Action is a public URL, so the admin check is repeated here rather
// than trusted from the fact that the page rendered the button.
//
// A report is evidence, never an instruction. Nothing a reporter wrote reaches
// the database through these: the admin's decision is the only input, and
// `reason`/`details` are shown on the page for a human to read and weigh.

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) throw new Error("not-an-admin");
  return createAdminClient();
}

function uuidFrom(formData: FormData, field: string): string {
  const value = String(formData.get(field) ?? "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error(`bad-${field}`);
  }
  return value;
}

async function setReportStatus(admin: ReturnType<typeof createAdminClient>, id: string, status: "actioned" | "dismissed") {
  const { error } = await admin.from("housing_reports").update({ status }).eq("id", id);
  if (error) throw error;
}

/** Looked at it, nothing wrong. The report stays on file. */
export async function dismissReport(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  await setReportStatus(admin, uuidFrom(formData, "id"), "dismissed");
  revalidatePath("/admin");
}

/**
 * Agreed with the report and acted on it.
 *
 * For a listing that means taking it off the map, which is the same
 * 'rejected' state the review queue uses — one way for a listing to be
 * unpublished, not two, so the owner's account page keeps telling them the
 * truth with no extra code. For a profile there is nothing to unpublish
 * (personal blocks are the students' own), so this only records the verdict.
 */
export async function actionReport(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = uuidFrom(formData, "id");
  const listingId = String(formData.get("listingId") ?? "");

  if (listingId) {
    const { error } = await admin
      .from("housing_listings")
      .update({ status: "rejected" })
      .eq("id", uuidFrom(formData, "listingId"));
    if (error) throw error;
  }

  await setReportStatus(admin, id, "actioned");
  revalidatePath("/admin");
  revalidatePath("/housing");
}

/**
 * Decide on a person's ID check (supabase/housing_id_checks.sql).
 *
 * Same guard as setListingStatus: a Server Action is a public endpoint, so the
 * caller is checked against ADMIN_EMAILS here, before the service role exists.
 *
 * The decision is recorded and the document is deleted in the same step,
 * because nothing needs the file after it: the badge reads the status, and the
 * privacy policy promises the document goes once it has been checked. The file
 * is deleted FIRST. If that fails the check stays pending and the admin can
 * press the button again; the opposite order could record a decision and then
 * leave an ID document in storage with nothing pointing at it.
 *
 * The badge on the person's profile and listings follows by itself: the
 * housing_id_checks_sync trigger copies the new status onto them.
 */
async function decideIdCheck(userId: string, status: "verified" | "rejected"): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) throw new Error("not-an-admin");

  const admin = createAdminClient();
  const { data: check, error: readError } = await admin
    .from("housing_id_checks")
    .select("file_path, status")
    .eq("user_id", userId)
    .maybeSingle();
  if (readError) throw readError;
  // Only a check that is waiting can be decided: a double click, or two admins
  // at once, must not turn a verification into a rejection or the reverse.
  if (!check || check.status !== "pending") return;

  if (check.file_path) {
    const { error: removeError } = await admin.storage.from("housing-ids").remove([check.file_path]);
    if (removeError) throw removeError;
  }

  const { error } = await admin
    .from("housing_id_checks")
    .update({ status, reviewed_at: new Date().toISOString(), file_path: null })
    .eq("user_id", userId)
    .eq("status", "pending");
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/housing");
}

/** Reads the user id out of the submitted form and rejects anything that isn't a uuid. */
function userIdFrom(formData: FormData): string {
  const id = String(formData.get("userId") ?? "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error("bad-user-id");
  }
  return id;
}

export async function verifyIdCheck(formData: FormData): Promise<void> {
  await decideIdCheck(userIdFrom(formData), "verified");
}

export async function rejectIdCheck(formData: FormData): Promise<void> {
  await decideIdCheck(userIdFrom(formData), "rejected");
}
