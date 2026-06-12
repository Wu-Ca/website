"use client";

import { useActionState } from "react";
import { requestMagicLink, type LoginState } from "@/app/actions/auth";

interface Props {
  next: string | null;
  initialError?: string;
}

export default function LoginForm({ next, initialError }: Props) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    requestMagicLink,
    undefined
  );

  if (state?.sent) {
    return (
      <div className="mt-6 flex flex-col gap-4">
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
          <p className="text-sm font-semibold text-emerald-900">
            ✉️ Check your email
          </p>
          <p className="mt-1 text-sm text-emerald-800">
            We sent a sign-in link to <strong>{state.email}</strong>. It
            expires in 15 minutes.
          </p>
        </div>
        {state.devLink && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
              Development mode
            </p>
            <p className="mt-1 text-sm text-amber-800">
              No email provider is configured, so here&apos;s your link:
            </p>
            <a
              href={state.devLink}
              className="mt-2 inline-block text-sm font-medium text-amber-900 underline break-all"
            >
              {state.devLink}
            </a>
          </div>
        )}
        <a
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="text-sm text-stone-500 hover:text-stone-800"
        >
          ← Use a different email
        </a>
      </div>
    );
  }

  const error = state?.error ?? initialError;

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-emerald-800 text-white font-semibold text-sm py-2.5 hover:bg-emerald-700 transition-colors disabled:opacity-60"
      >
        {pending ? "Sending link..." : "Send magic link"}
      </button>
    </form>
  );
}
