"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileFormState } from "@/app/actions/profile";

interface Props {
  email: string;
  boroughs: readonly string[];
  initialDisplayName: string;
  initialPhone: string;
  initialBorough: string;
  initialBio: string;
}

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600";

export default function ProfileForm({
  email,
  boroughs,
  initialDisplayName,
  initialPhone,
  initialBorough,
  initialBio,
}: Props) {
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
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Phone <span className="text-stone-400">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={initialPhone}
            placeholder="(212) 555-0100"
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="borough"
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Borough <span className="text-stone-400">(optional)</span>
          </label>
          <select
            id="borough"
            name="borough"
            defaultValue={initialBorough}
            className={inputClass}
          >
            <option value="">Select a borough</option>
            {boroughs.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          About me <span className="text-stone-400">(optional)</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          maxLength={500}
          defaultValue={initialBio}
          placeholder="Tell organizers a little about yourself"
          className={inputClass}
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-emerald-800 text-white font-semibold text-sm py-2.5 hover:bg-emerald-700 transition-colors disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save profile"}
      </button>
      <p className="text-xs text-stone-400 text-center">
        Saving takes you to your events dashboard.
      </p>
    </form>
  );
}
