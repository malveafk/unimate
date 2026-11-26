import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Permanently deletes the signed-in user's account and everything tied to it
// (GDPR "right to erasure"). Runs server-side with the service role, because a
// user cannot delete their own auth record from the browser.
//
// What goes, in order:
//   1. Their listing photos (stored under a folder named after the user id).
//   2. Their apartment listings. The foreign key is ON DELETE SET NULL, so
//      without this step the listings would stay on the map with no owner.
//   3. Their AI-chat quota row.
//   4. The auth user itself. Everything else that points at auth.users
//      (profiles, AI chats, activity) is ON DELETE CASCADE and disappears
//      with it.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const admin = createAdminClient();
  const uid = user.id;

  try {
    const { data: files, error } = await admin.storage.from("housing-photos").list(uid, { limit: 1000 });
    if (error) throw error;
    const paths = (files ?? []).map((f) => `${uid}/${f.name}`);
    if (paths.length > 0) {
      const { error: removeError } = await admin.storage.from("housing-photos").remove(paths);
      if (removeError) throw removeError;
    }

    const { error: listingsError } = await admin.from("housing_listings").delete().eq("created_by", uid);
    if (listingsError) throw listingsError;

    // Not linked to auth.users by a foreign key, so it would not cascade.
    // Best-effort: the table may not exist in every environment.
    await admin.from("message_quota").delete().eq("identifier", uid);

    const { error: userError } = await admin.auth.admin.deleteUser(uid);
    if (userError) throw userError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Account deletion failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "We couldn't delete your account. Please try again, or email us and we'll do it for you." },
      { status: 500 }
    );
  }
}
