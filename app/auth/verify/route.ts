import { NextRequest, NextResponse } from "next/server";
import { consumeLoginToken, findOrCreateUser } from "@/lib/db";
import {
  SESSION_COOKIE,
  createSessionToken,
  hashToken,
  sanitizeNextPath,
  sessionCookieOptions,
} from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const next = sanitizeNextPath(request.nextUrl.searchParams.get("next"));

  const email = token ? consumeLoginToken(hashToken(token)) : null;
  if (!email) {
    const loginUrl = new URL("/login?error=invalid-link", request.nextUrl);
    if (next) loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl);
  }

  const user = findOrCreateUser(email);
  const response = NextResponse.redirect(
    new URL(next ?? "/dashboard", request.nextUrl)
  );
  const { token: sessionToken, expiresAt } = createSessionToken(user.id);
  response.cookies.set(
    SESSION_COOKIE,
    sessionToken,
    sessionCookieOptions(expiresAt)
  );
  return response;
}
