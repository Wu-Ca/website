"use client";

import { useActionState } from "react";
import { createOrganization, type OrgFormState } from "@/app/actions/org";

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

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
          className={inputClass}
        />
        <FieldError message={state?.errors?.name} />
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
          className={inputClass}
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Contact email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="hello@yourorg.org"
          className={inputClass}
        />
        <FieldError message={state?.errors?.email} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="website"
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Website <span className="text-stone-400">(optional)</span>
          </label>
          <input
            id="website"
            name="website"
            type="text"
            inputMode="url"
            placeholder="yourorg.org"
            className={inputClass}
          />
          <FieldError message={state?.errors?.website} />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Telephone <span className="text-stone-400">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(212) 555-0100"
            className={inputClass}
          />
          <FieldError message={state?.errors?.phone} />
        </div>
      </div>
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Address <span className="text-stone-400">(optional)</span>
        </label>
        <input
          id="address"
          name="address"
          type="text"
          autoComplete="street-address"
          placeholder="123 Eastern Pkwy, Brooklyn, NY 11238"
          className={inputClass}
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
