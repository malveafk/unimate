import { createClient } from "@supabase/supabase-js";

export async function logAction(action: string, ip: string): Promise<boolean> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase.from("logs").insert([{ action, ip }]);
  if (error) {
    console.error("Failed to write log:", error.message);
    return false;
  }
  return true;
}
