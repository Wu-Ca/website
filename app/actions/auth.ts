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
  // Implicit flow: the magic link returns the session in the URL fragment,
  // picked up client-side by AuthSessionRescue. No PKCE verifier cookie
  // needed, so the link works from any browser or device. Redirect to
  // /login, which forwards signed-in users to their destination.
  const supabase = await createAuthClient({ flowType: "implicit" });
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/login${
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
