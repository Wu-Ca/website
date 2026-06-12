"use server";

import { redirect } from "next/navigation";
import { createAuthClient, createServiceClient } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/auth";

export type AuthFormState =
  | {
      error?: string;
      email?: string;
    }
  | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
    password: String(formData.get("password") ?? ""),
    next: sanitizeNextPath(String(formData.get("next") ?? "")),
  };
}

export async function signIn(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const { email, password, next } = readCredentials(formData);

  if (!EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address.", email };
  }
  if (!password) {
    return { error: "Please enter your password.", email };
  }

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "invalid_credentials") {
      return { error: "Incorrect email or password.", email };
    }
    console.error("Sign-in failed:", error.message);
    return {
      error:
        error.status === 429
          ? "Too many attempts — please wait a minute and try again."
          : "We couldn't sign you in. Please try again.",
      email,
    };
  }

  redirect(next ?? "/dashboard");
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const { email, password, next } = readCredentials(formData);
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address.", email };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      email,
    };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords don't match.", email };
  }

  // Create the account via the admin API with the email pre-confirmed, so
  // sign-up never depends on a verification email arriving.
  const admin = createServiceClient();
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    if (createError.code === "email_exists") {
      return {
        error:
          "An account with this email already exists — sign in with your password instead.",
        email,
      };
    }
    console.error("Failed to create account:", createError.message);
    return { error: "We couldn't create your account. Please try again.", email };
  }

  const supabase = await createAuthClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    // Account was created but the session didn't start — let them sign in.
    console.error("Post-signup sign-in failed:", signInError.message);
    redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }

  // New accounts land on the profile page to set a display name, unless
  // they were on their way somewhere (e.g. registering for an event).
  redirect(next ?? "/profile");
}

export async function logout(): Promise<void> {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/");
}
