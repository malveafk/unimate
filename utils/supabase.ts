import { createClient } from "@supabase/supabase-js";

// Anonymous, read-only client for public catalogue data (utils/universities.ts).
// It must not manage a session: the app's real auth client is the one in
// utils/supabase/client.ts. Two session-managing clients on the same storage
// key log "Multiple GoTrueClient instances" and can race each other on token
// refresh or on reading the auth code from the URL.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: "sb-public-catalogue",
    },
  },
);
