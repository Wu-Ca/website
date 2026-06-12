import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthClient } from "./supabase/server";
import type { User } from "./types";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  return { id: user.id, email: user.email, createdAt: user.created_at };
});

export async function requireUser(nextPath: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

/** Absolute origin of the running site, for magic links and share URLs. */
export async function getOrigin(): Promise<string> {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

/** Only allows same-site relative paths for post-login redirects. */
export function sanitizeNextPath(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.startsWith("/") && !value.startsWith("//") ? value : null;
}
