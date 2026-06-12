import type { Metadata } from "next";
import Link from "next/link";
import { getOrigin, requireUser } from "@/lib/auth";
import { getUserRegistrationsWithEvents } from "@/lib/events";
import { getOrganizationByOwner, listOrgEvents } from "@/lib/db";
import { formatFullDate, formatTime } from "@/lib/utils";
import { getCategoryMeta } from "@/lib/categories";
import Header from "@/app/_components/Header";
import UpcomingPanel from "./UpcomingPanel";
import type { RegistrationWithEvent } from "@/lib/events";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "My events — CommonGround NYC",
};

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const origin = await getOrigin();
  const registrations = await getUserRegistrationsWithEvents(user.id);
  const org = await getOrganizationByOwner(user.id);
  const hostedEvents = org ? await listOrgEvents(org.id) : [];

  const today = new Date().toISOString().slice(0, 10);
  const past = registrations.filter(({ event }) => event.date < today);

  const panelItems = registrations.map(({ registration, event }) => ({
    registrationId: registration.id,
    event,
  }));

  return (
    <>
      <Header />
      <main className="flex-1 bg-stone-50">
        <div className="bg-emerald-900 text-white">
          <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight">
                {user.displayName ? `Hi, ${user.displayName}` : "My events"}
              </h1>
              <p className="mt-1 text-emerald-200 text-sm">
                Signed in as {user.email}
              </p>
            </div>
            <Link
              href="/profile"
              className="shrink-0 text-sm font-medium text-emerald-100 border border-emerald-600 rounded-full px-4 py-1.5 hover:border-white hover:text-white transition-colors text-center"
            >
              Edit profile
            </Link>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-10">
          <section>
            <UpcomingPanel items={panelItems} origin={origin} today={today} />
          </section>

          {hostedEvents.length > 0 && org && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-stone-700">
                  Events you&apos;re hosting
                </h2>
                <Link
                  href="/org"
                  className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
                >
                  Manage →
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                {hostedEvents
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((event) => (
                    <HostedEventRow key={event.id} event={event} />
                  ))}
              </div>
            </section>
          )}

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
        </div>
      </main>
    </>
  );
}

function RegistrationRow({ item }: { item: RegistrationWithEvent }) {
  const { event } = item;
  const categoryMeta = getCategoryMeta(event.category);

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
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
        {formatTime(event.endTime)} · {event.venue.name}, {event.venue.borough}
      </p>
    </div>
  );
}

function HostedEventRow({ event }: { event: Event }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-3">
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
              Canceled
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-stone-500">
          {formatFullDate(event.date)} · {formatTime(event.startTime)}–
          {formatTime(event.endTime)}
        </p>
      </div>
    </div>
  );
}
