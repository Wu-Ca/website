"use client";

import { useActionState } from "react";
import { createOrganization, type OrgFormState } from "@/app/actions/org";

export default function CreateOrgForm() {
  const [state, action, pending] = useActionState<OrgFormState, FormData>(
    createOrganization,
    undefined
  );

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Organization name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g. Crown Heights Poetry Collective"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
        />
        {state?.errors?.name && (
          <p className="mt-1 text-sm text-red-600">{state.errors.name}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Description <span className="text-stone-400">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="What does your organization do?"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-emerald-800 text-white font-semibold text-sm py-2.5 hover:bg-emerald-700 transition-colors disabled:opacity-60"
      >
        {pending ? "Creating..." : "Create organization"}
      </button>
    </form>
  );
}
