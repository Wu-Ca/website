import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/auth";

// Completes magic-link sign-in. Handles both Supabase redirect styles:
// `?token_hash=&type=` (custom email template, works across browsers) and
// `?code=` (PKCE, default email template, same-browser only).
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = sanitizeNextPath(searchParams.get("next")) ?? "/dashboard";

  // The session cookies written during verification must ride on the exact
  // response we return, so bind the client's cookie writes to it directly
  // rather than relying on the framework to merge cookie-store mutations
  // into a manually constructed redirect.
  const response = NextResponse.redirect(new URL(next, request.nextUrl));
  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  let reason: string | null = null;
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (error) reason = error.code ?? `verify_failed_${error.status ?? "unknown"}`;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) reason = error.code ?? `exchange_failed_${error.status ?? "unknown"}`;
  } else {
    reason = "missing_token";
  }

  if (reason) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("error", reason);
    if (next !== "/dashboard") loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
