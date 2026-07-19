import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { isAdminEmail } from "@/utils/adminEmails";

// Returns whether the current user is premium. The is_premium flag lives in
// message_quota, which RLS hides from the browser, so we read it here with the
// service role. Best-effort: any failure just reports non-premium.
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ premium: false });

    // Admin emails are always premium, regardless of the DB flag.
    if (isAdminEmail(user.email)) return NextResponse.json({ premium: true });

    const admin = createAdminClient();
    const { data } = await admin
      .from("message_quota")
      .select("is_premium")
      .eq("identifier", user.id)
      .maybeSingle();

    return NextResponse.json({ premium: data?.is_premium ?? false });
  } catch (error) {
    console.error("Failed to resolve premium status:", error);
    return NextResponse.json({ premium: false });
  }
}
