import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, sanitizeNextPath } from "@/lib/auth";
import Header from "@/app/_components/Header";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in — CommonGround NYC",
};

const ERROR_MESSAGES: Record<string, string> = {
  "invalid-link":
    "That sign-in link couldn't be verified. Links expire after a short time and must be opened in the same browser that requested them — request a fresh one below.",
};

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
            <LoginForm
              next={nextPath}
              initialError={error ? ERROR_MESSAGES[error] : undefined}
            />
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
