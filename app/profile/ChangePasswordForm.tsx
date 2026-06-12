"use client";

import { useActionState } from "react";
import {
  changePassword,
  type PasswordFormState,
} from "@/app/actions/profile";

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600";

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState<PasswordFormState, FormData>(
    changePassword,
    undefined
  );

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <div>
        <label
          htmlFor="currentPassword"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Current password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>
      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          New password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className={inputClass}
        />
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.saved && !pending && (
        <p className="text-sm text-emerald-700">✓ Password changed</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full border border-emerald-800 text-emerald-800 font-semibold text-sm py-2.5 hover:bg-emerald-50 transition-colors disabled:opacity-60"
      >
        {pending ? "Changing..." : "Change password"}
      </button>
    </form>
  );
}
