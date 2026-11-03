import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // The proxy refreshes the Supabase session, which costs an auth round-trip.
  // Excluded:
  //   api   -> Route Handlers can write cookies (unlike Server Components), so
  //            their own getUser() refreshes the session by itself.
  //   auth  -> /auth/callback runs its own exchangeCodeForSession; having the
  //            proxy write session cookies just before it is a known source of
  //            flaky OAuth logins.
  //   files -> static assets under /public (housing-map.html, *.svg).
  // PAGES stay matched on purpose: Server Components cannot refresh the
  // session themselves (see the swallowed cookie write in utils/supabase/server.ts).
  matcher: [
    "/((?!api|auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|html)$).*)",
  ],
};
