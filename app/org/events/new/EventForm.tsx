"use client";

import { useActionState } from "react";
import { createOrgEvent, type EventFormState } from "@/app/actions/org";
import { CATEGORIES } from "@/lib/categories";
import { BOROUGHS } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600";

export default function EventForm() {
  const [state, action, pending] = useActionState<EventFormState, FormData>(
    createOrgEvent,
    undefined
  );
  const values = state?.values ?? {};
  const errors = state?.errors ?? {};

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <Field label="Event title" error={errors.title}>
        <input
          name="title"
          type="text"
          required
          defaultValue={values.title}
          placeholder="e.g. Community Garden Volunteer Day"
          className={inputClass}
        />
      </Field>

      <Field label="Description" error={errors.description}>
        <textarea
          name="description"
          rows={4}
          required
          defaultValue={values.description}
          placeholder="What should attendees know about this event?"
          className={inputClass}
        />
      </Field>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Date" error={errors.date}>
          <input
            name="date"
            type="date"
            required
            defaultValue={values.date}
            className={inputClass}
          />
        </Field>
        <Field label="Start time" error={errors.startTime}>
          <input
            name="startTime"
            type="time"
            required
            defaultValue={values.startTime}
            className={inputClass}
          />
        </Field>
        <Field label="End time" error={errors.endTime}>
          <input
            name="endTime"
            type="time"
            required
            defaultValue={values.endTime}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Venue name" error={errors.venueName}>
        <input
          name="venueName"
          type="text"
          required
          defaultValue={values.venueName}
          placeholder="e.g. Prospect Park Picnic House"
          className={inputClass}
        />
      </Field>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Field label="Street address" error={errors.address}>
            <input
              name="address"
              type="text"
              required
              defaultValue={values.address}
              placeholder="e.g. 95 Prospect Park West"
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="ZIP code" error={errors.zip}>
          <input
            name="zip"
            type="text"
            inputMode="numeric"
            required
            defaultValue={values.zip}
            placeholder="11215"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Borough" error={errors.borough}>
          <select
            name="borough"
            required
            defaultValue={values.borough ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Select a borough
            </option>
            {BOROUGHS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category" error={errors.category}>
          <select
            name="category"
            required
            defaultValue={values.category ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Select a category
            </option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Cost in dollars (leave blank if free)"
          error={errors.cost}
        >
          <input
            name="cost"
            type="number"
            min="0"
            step="0.01"
            defaultValue={values.cost}
            placeholder="Free"
            className={inputClass}
          />
        </Field>
        <Field
          label="Contact email (optional)"
          error={errors.contactEmail}
        >
          <input
            name="contactEmail"
            type="email"
            defaultValue={values.contactEmail}
            placeholder="events@yourorg.org"
            className={inputClass}
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-full bg-emerald-800 text-white font-semibold text-sm py-2.5 hover:bg-emerald-700 transition-colors disabled:opacity-60"
      >
        {pending ? "Publishing..." : "Publish event"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
