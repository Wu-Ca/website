import type { Metadata } from "next";
import Link from "next/link";
import { getOrigin, requireUser } from "@/lib/auth";
import {
  getOrganizationByOwner,
  getUserById,
  listEventRegistrations,
  listOrgEvents,
} from "@/lib/db";
import { formatFullDate, formatTime } from "@/lib/utils";
import { cancelOrgEvent, restoreOrgEvent } from "@/app/actions/org";
import Header from "@/app/_components/Header";
import CreateOrgForm from "./CreateOrgForm";
import ShareButtons from "./_components/ShareButtons";
import type { Event } from "@/lib/types";

export const metadata: Metadata = {
  title: "Organization dashboard — CommonGround NYC",
};

export default async function OrgPage() {
  const user = await requireUser("/org");
  const org = getOrganizationByOwner(user.id);

  if (!org) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-stone-50">
          <div className="max-w-md mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8">
              <h1 className="text-xl font-bold text-stone-900">
                Set up your organization
              </h1>
              <p className="mt-1 text-sm text-stone-500">
                Create an organization profile to publish events, track
                sign-ups, and share with your community.
              </p>
              <CreateOrgForm />
            </div>
          </div>
        </main>
      </>
    );
  }

  const origin = await getOrigin();
  const events = listOrgEvents(org.id).sort((a, b) =>
    `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`)
  );

  return (
    <>
      <Header />
      <main className="flex-1 bg-stone-50">
        <div className="bg-emerald-900 text-white">
          <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight">{org.name}</h1>
              <p className="mt-1 text-emerald-200 text-sm">
                Organization dashboard
                {org.description ? ` — ${org.description}` : ""}
              </p>
            </div>
            <Link
              href="/org/events/new"
              className="shrink-0 rounded-full bg-white text-emerald-900 font-semibold text-sm px-5 py-2.5 hover:bg-emerald-50 transition-colors text-center"
            >
              + Add event
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {events.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
              <p className="text-sm text-stone-500">
                You haven&apos;t published any events yet.
              </p>
              <Link
                href="/org/events/new"
                className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-900"
              >
                Publish your first event →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {events.map((event) => (
                <OrgEventRow key={event.id} event={event} origin={origin} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function OrgEventRow({ event, origin }: { event: Event; origin: string }) {
  const registrations = listEventRegistrations(event.id);
  const eventUrl = `${origin}/events/${event.id}`;
  const isPast = event.date < new Date().toISOString().slice(0, 10);

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/events/${event.id}`}
              className="font-semibold text-stone-900 hover:text-emerald-800"
            >
              {event.title}
            </Link>
            {event.isCanceled ? (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                Canceled
              </span>
            ) : isPast ? (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
                Past
              </span>
            ) : (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Upcoming
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-stone-500">
            {formatFullDate(event.date)} · {formatTime(event.startTime)}–
            {formatTime(event.endTime)} · {event.venue.name},{" "}
            {event.venue.borough}
          </p>
        </div>
        <div className="shrink-0">
          {event.isCanceled ? (
            <form action={restoreOrgEvent}>
              <input type="hidden" name="eventId" value={event.id} />
              <button
                type="submit"
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-stone-300 text-stone-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
              >
                Restore event
              </button>
            </form>
          ) : (
            <form action={cancelOrgEvent}>
              <input type="hidden" name="eventId" value={event.id} />
              <button
                type="submit"
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-stone-300 text-stone-600 hover:border-red-300 hover:text-red-700 transition-colors"
              >
                Cancel event
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-stone-100">
        <details className="flex-1 text-sm">
          <summary className="cursor-pointer font-medium text-stone-700 hover:text-emerald-800">
            {registrations.length}{" "}
            {registrations.length === 1 ? "person" : "people"} registered
          </summary>
          {registrations.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1 text-stone-600">
              {registrations.map((r) => {
                const registrant = getUserById(r.userId);
                return (
                  <li key={r.id} className="flex items-center gap-2">
                    <span className="text-emerald-700">•</span>
                    <span>{registrant?.email ?? "Unknown user"}</span>
                    <span className="text-xs text-stone-400">
                      signed up{" "}
                      {new Date(r.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </details>
        <ShareButtons url={eventUrl} title={event.title} />
      </div>
    </div>
  );
}
