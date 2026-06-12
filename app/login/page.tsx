import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, sanitizeNextPath } from "@/lib/auth";
import Header from "@/app/_components/Header";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in — CommonGround NYC",
};

const ERROR_MESSAGES: Record<string, string> = {
  otp_expired:
    "That sign-in link has expired or was already used — request a fresh one below.",
  missing_token:
    "That sign-in link was incomplete. Try copying the full link from the email, or request a fresh one below.",
  flow_state_not_found:
    "Sign-in links must be opened in the same browser that requested them. Request a fresh link from this browser, or open the original link where you first entered your email.",
  flow_state_expired:
    "That sign-in attempt expired — request a fresh link below.",
  bad_code_verifier:
    "Sign-in links must be opened in the same browser that requested them. Request a fresh link from this browser.",
  "invalid-link":
    "That sign-in link couldn't be verified — request a fresh one below.",
};

function errorMessage(code: string | undefined): string | undefined {
  if (!code) return undefined;
  return (
    ERROR_MESSAGES[code] ??
    `Sign-in failed (reason: ${code}). Request a fresh link below — if this keeps happening, send us that reason code.`
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const nextPath = sanitizeNextPath(next);

  const user = await getCurrentUser();
  if (user) redirect(nextPath ?? "/dashboard");

  return (
    <>
      <Header />
      <main className="flex-1 bg-stone-50">
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8">
            <h1 className="text-xl font-bold text-stone-900">Sign in</h1>
            <p className="mt-1 text-sm text-stone-500">
              Enter your email and we&apos;ll send you a magic link — no
              password needed.
            </p>
            <LoginForm next={nextPath} initialError={errorMessage(error)} />
          </div>
          <p className="mt-4 text-xs text-stone-400 text-center">
            Signing in lets you register for events and, if you run an
            organization, publish your own.
          </p>
        </div>
      </main>
    </>
  );
}
