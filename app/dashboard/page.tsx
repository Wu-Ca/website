import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getUserRegistrationsWithEvents } from "@/lib/events";
import { getOrganizationByOwner } from "@/lib/db";
import { cancelRegistration } from "@/app/actions/registrations";
import { formatFullDate, formatTime } from "@/lib/utils";
import { getCategoryMeta } from "@/lib/categories";
import Header from "@/app/_components/Header";
import type { RegistrationWithEvent } from "@/lib/events";

export const metadata: Metadata = {
  title: "My events — CommonGround NYC",
};

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const registrations = getUserRegistrationsWithEvents(user.id);
  const org = getOrganizationByOwner(user.id);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = registrations.filter(({ event }) => event.date >= today);
  const past = registrations.filter(({ event }) => event.date < today);

  return (
    <>
      <Header />
      <main className="flex-1 bg-stone-50">
        <div className="bg-emerald-900 text-white">
          <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold tracking-tight">My events</h1>
            <p className="mt-1 text-emerald-200 text-sm">
              Signed in as {user.email}
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-10">
          <section>
            <h2 className="text-base font-semibold text-stone-700 mb-4">
              Upcoming registrations
            </h2>
            {upcoming.length === 0 ? (
              <div className="bg-white rounded-xl border border-stone-200 p-6 text-center">
                <p className="text-sm text-stone-500">
                  You haven&apos;t registered for any upcoming events yet.
                </p>
                <Link
                  href="/"
                  className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-900"
                >
                  Browse events →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {upcoming.map((item) => (
                  <RegistrationRow key={item.registration.id} item={item} canCancel />
                ))}
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-stone-700 mb-4">
                Past events
              </h2>
              <div className="flex flex-col gap-3 opacity-70">
                {past.map((item) => (
                  <RegistrationRow key={item.registration.id} item={item} />
                ))}
              </div>
            </section>
          )}

          <section className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="text-base font-semibold text-stone-700">
              {org ? org.name : "Run an organization?"}
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              {org
                ? "Manage your organization's events, see who's registered, and share them."
                : "Create an organization profile to publish your own events and track sign-ups."}
            </p>
            <Link
              href="/org"
              className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-900"
            >
              {org ? "Go to organization dashboard →" : "Set up your organization →"}
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}

function RegistrationRow({
  item,
  canCancel,
}: {
  item: RegistrationWithEvent;
  canCancel?: boolean;
}) {
  const { registration, event } = item;
  const categoryMeta = getCategoryMeta(event.category);

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/events/${event.id}`}
            className="font-semibold text-stone-900 hover:text-emerald-800 leading-snug"
          >
            {event.title}
          </Link>
          {event.isCanceled && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
              Event canceled
            </span>
          )}
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              categoryMeta?.color ?? "bg-stone-100 text-stone-600"
            }`}
          >
            {categoryMeta?.label ?? event.category}
          </span>
        </div>
        <p className="mt-1 text-sm text-stone-500">
          {formatFullDate(event.date)} · {formatTime(event.startTime)}–
          {formatTime(event.endTime)} · {event.venue.name},{" "}
          {event.venue.borough}
        </p>
      </div>
      {canCancel && (
        <form action={cancelRegistration} className="shrink-0">
          <input type="hidden" name="registrationId" value={registration.id} />
          <input type="hidden" name="eventId" value={event.id} />
          <button
            type="submit"
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-stone-300 text-stone-600 hover:border-red-300 hover:text-red-700 transition-colors"
          >
            Cancel registration
          </button>
        </form>
      )}
    </div>
  );
}
