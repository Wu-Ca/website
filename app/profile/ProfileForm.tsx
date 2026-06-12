"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileFormState } from "@/app/actions/profile";

interface Props {
  email: string;
  initialDisplayName: string;
}

export default function ProfileForm({ email, initialDisplayName }: Props) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(
    updateProfile,
    undefined
  );

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-500"
        />
        <p className="mt-1 text-xs text-stone-400">
          Your email is your sign-in and can&apos;t be changed here.
        </p>
      </div>
      <div>
        <label
          htmlFor="displayName"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Display name
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          maxLength={80}
          defaultValue={initialDisplayName}
          placeholder="e.g. Christian"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.saved && !pending && (
        <p className="text-sm text-emerald-700">✓ Profile saved</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-emerald-800 text-white font-semibold text-sm py-2.5 hover:bg-emerald-700 transition-colors disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
