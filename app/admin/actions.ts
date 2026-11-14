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
  const { error } = await admin.from("housing_listings").update({ status }).eq("id", id);
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
