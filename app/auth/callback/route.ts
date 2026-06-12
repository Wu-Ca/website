import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createAuthClient } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/auth";

// Completes magic-link sign-in. Handles both Supabase redirect styles:
// `?code=` (PKCE, default email template) and `?token_hash=&type=` (custom
// email template, works across browsers/devices).
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = sanitizeNextPath(searchParams.get("next")) ?? "/dashboard";

  const supabase = await createAuthClient();

  let failed = true;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    failed = !!error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    failed = !!error;
  }

  if (failed) {
    const loginUrl = new URL("/login?error=invalid-link", request.nextUrl);
    if (next !== "/dashboard") loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(next, request.nextUrl));
}
