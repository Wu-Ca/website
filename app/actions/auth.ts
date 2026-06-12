"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { createLoginToken } from "@/lib/db";
import { hashToken, sanitizeNextPath, deleteSession } from "@/lib/session";
import { sendMagicLinkEmail } from "@/lib/email";
import { getOrigin } from "@/lib/auth";

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;

export type LoginState =
  | {
      error?: string;
      sent?: boolean;
      email?: string;
      /** Shown in development when no email provider is configured. */
      devLink?: string;
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

  const token = crypto.randomBytes(32).toString("base64url");
  createLoginToken({
    tokenHash: hashToken(token),
    email,
    expiresAt: new Date(Date.now() + MAGIC_LINK_TTL_MS).toISOString(),
    usedAt: null,
  });

  const origin = await getOrigin();
  const url = `${origin}/auth/verify?token=${token}${
    next ? `&next=${encodeURIComponent(next)}` : ""
  }`;

  try {
    const { delivered } = await sendMagicLinkEmail(email, url);
    return {
      sent: true,
      email,
      devLink:
        !delivered && process.env.NODE_ENV === "development" ? url : undefined,
    };
  } catch (error) {
    console.error("Failed to send magic link:", error);
    return { error: "We couldn't send the email. Please try again." };
  }
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/");
}
