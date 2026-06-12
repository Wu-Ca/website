"use server";

import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/server";
import { getOrigin, sanitizeNextPath } from "@/lib/auth";

export type LoginState =
  | {
      error?: string;
      sent?: boolean;
      email?: string;
    }
  | undefined;

export async function requestMagicLink(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const next = sanitizeNextPath(String(formData.get("next") ?? ""));

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const origin = await getOrigin();
  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback${
        next ? `?next=${encodeURIComponent(next)}` : ""
      }`,
    },
  });

  if (error) {
    console.error("Failed to send magic link:", error.message);
    return {
      error:
        error.status === 429
          ? "Too many requests — please wait a minute and try again."
          : "We couldn't send the email. Please try again.",
    };
  }

  return { sent: true, email };
}

export async function logout(): Promise<void> {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/");
}
