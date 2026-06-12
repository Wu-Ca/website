"use client";

import { useState } from "react";
import { useActionState } from "react";
import { signIn, signUp, type AuthFormState } from "@/app/actions/auth";

type Mode = "signin" | "signup";

interface Props {
  next: string | null;
  initialMode?: Mode;
}

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600";

export default function LoginForm({ next, initialMode = "signin" }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [signInState, signInAction, signInPending] = useActionState<
    AuthFormState,
    FormData
  >(signIn, undefined);
  const [signUpState, signUpAction, signUpPending] = useActionState<
    AuthFormState,
    FormData
  >(signUp, undefined);

  const isSignUp = mode === "signup";
  const state = isSignUp ? signUpState : signInState;
  const pending = isSignUp ? signUpPending : signInPending;

  return (
    <form
      action={isSignUp ? signUpAction : signInAction}
      className="mt-6 flex flex-col gap-4"
    >
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
          defaultValue={state?.email}
          className={inputClass}
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={isSignUp ? 8 : undefined}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          placeholder={isSignUp ? "At least 8 characters" : "Your password"}
          className={inputClass}
        />
      </div>
      {isSignUp && (
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            className={inputClass}
          />
        </div>
      )}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-emerald-800 text-white font-semibold text-sm py-2.5 hover:bg-emerald-700 transition-colors disabled:opacity-60"
      >
        {pending
          ? isSignUp
            ? "Creating account..."
            : "Signing in..."
          : isSignUp
            ? "Create account"
            : "Sign in"}
      </button>
      <p className="text-sm text-stone-500 text-center">
        {isSignUp ? "Already have an account?" : "New to CommonGround?"}{" "}
        <button
          type="button"
          onClick={() => setMode(isSignUp ? "signin" : "signup")}
          className="font-medium text-emerald-700 hover:text-emerald-900"
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </button>
      </p>
    </form>
  );
}
