import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/server";

const PROTECTED_PREFIXES = ["/dashboard", "/org", "/profile"];

// Refreshes the Supabase session cookie on every request (Server Components
// can't write cookies) and optimistically redirects signed-out visitors away
// from protected routes. Real authorization happens in lib/auth.ts and the
// server actions, close to the data.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function proxy(request: NextRequest) {
  // If a magic-link redirect lands anywhere other than /auth/callback
  // (e.g. Supabase fell back to the bare Site URL because the callback
  // wasn't in the redirect allowlist), route it to the callback so the
  // sign-in still completes instead of being silently ignored.
  const search = request.nextUrl.searchParams;
  const strayCode = search.get("code");
  const strayTokenHash = search.get("token_hash");
  if (
    request.nextUrl.pathname !== "/auth/callback" &&
    ((strayCode && UUID_RE.test(strayCode)) || strayTokenHash)
  ) {
    const callbackUrl = new URL("/auth/callback", request.nextUrl);
    for (const [key, value] of search) callbackUrl.searchParams.set(key, value);
    if (!search.has("next") && request.nextUrl.pathname !== "/") {
      callbackUrl.searchParams.set("next", request.nextUrl.pathname);
    }
    return NextResponse.redirect(callbackUrl);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );

  if (!user && isProtected) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // All routes except static assets — the session refresh must run broadly.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
