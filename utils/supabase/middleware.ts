import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// How long we are willing to wait for the session refresh before giving up.
// See the comment on the Promise.race below for why this bound exists.
const REFRESH_TIMEOUT_MS = 2000;

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request: { headers: request.headers } });

  // Anonymous visitors carry no Supabase session cookie, so there is no session
  // to refresh: skip the auth round-trip entirely rather than pay it on every
  // request. Supabase cookies are always prefixed "sb-".
  const hasSessionCookie = request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-"));
  if (!hasSessionCookie) return supabaseResponse;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Calling getUser() (not getSession()) forces a round-trip that refreshes
  // the session and triggers the cookie sync above via setAll — without
  // this call the client above is otherwise never used, and sessions are
  // never refreshed by this middleware.
  //
  // Bounded by a timeout because that round-trip is a hard dependency on
  // Supabase being reachable. When it is not (the free-tier project pauses
  // after a week of inactivity), postgrest/gotrue retry internally and this
  // call hangs: measured ~25s TTFB on EVERY page for a user whose access
  // token had expired. Giving up early only means the session is not
  // refreshed on this request — the page still renders and the next request
  // tries again.
  await Promise.race([
    supabase.auth.getUser(),
    new Promise((resolve) => setTimeout(resolve, REFRESH_TIMEOUT_MS)),
  ]);

  return supabaseResponse;
};
