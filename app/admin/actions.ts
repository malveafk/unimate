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
