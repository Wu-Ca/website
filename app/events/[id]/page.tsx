import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getEvent, getRelatedEvents } from "@/lib/events";
import {
  countEventRegistrations,
  getActiveRegistration,
  getOrganizationById,
} from "@/lib/db";
import { getCurrentUser, getOrigin } from "@/lib/auth";
import { getCategoryMeta } from "@/lib/categories";
import { formatFullDate, formatTime, SOURCE_LABELS } from "@/lib/utils";
import {
  registerForEvent,
  cancelRegistration,
} from "@/app/actions/registrations";
import Header from "@/app/_components/Header";
import EventCard from "@/app/_components/EventCard";
import AddToCalendar from "@/app/_components/AddToCalendar";
import InterestedButton from "./InterestedButton";
import type { Event, Registration, User } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return {};
  return {
    title: `${event.title} — CommonGround NYC`,
    description: event.description.slice(0, 160),
  };
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const user = await getCurrentUser();
  const registration = user
    ? await getActiveRegistration(user.id, event.id)
    : undefined;
  const registeredCount = await countEventRegistrations(event.id);
  const eventUrl = `${await getOrigin()}/events/${event.id}`;
  const hostOrg = event.organizationId
    ? await getOrganizationById(event.organizationId)
    : undefined;

  const related = await getRelatedEvents(event);
  const categoryMeta = getCategoryMeta(event.category);

  const SOURCE_BADGE: Record<string, string> = {
    NYPL: "bg-red-50 text-red-700 border border-red-200",
    BPL: "bg-blue-50 text-blue-700 border border-blue-200",
    QPL: "bg-purple-50 text-purple-700 border border-purple-200",
    COMMUNITY: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-stone-50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-5"
          >
            <span>←</span>
            <span>All events</span>
          </Link>

          {event.isCanceled && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm font-semibold text-red-800">
                This event has been canceled
              </p>
              <p className="mt-0.5 text-sm text-red-700">
                Registration is closed. If you were registered, you don&apos;t
                need to do anything.
              </p>
            </div>
          )}

          <article className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="bg-emerald-900 px-6 py-8 text-white">
              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 text-white`}
                >
                  {categoryMeta?.label ?? event.category}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    SOURCE_BADGE[event.source] ?? "bg-white/10 text-white"
                  }`}
                >
                  {hostOrg?.name ?? SOURCE_LABELS[event.source] ?? event.source}
                </span>
              </div>
              <h1 className="text-2xl font-bold leading-tight">{event.title}</h1>
              {hostOrg && (
                <p className="mt-2 text-sm text-emerald-200">
                  Hosted by {hostOrg.name}
                </p>
              )}
            </div>

            <div className="px-6 py-6 flex flex-col gap-6">
              {/* Key details */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Detail
                  icon="📅"
                  label="Date"
                  value={formatFullDate(event.date)}
                />
                <Detail
                  icon="🕐"
                  label="Time"
                  value={`${formatTime(event.startTime)} – ${formatTime(event.endTime)}`}
                />
                <Detail
                  icon="📍"
                  label="Location"
                  value={`${event.venue.name}, ${event.venue.address}, ${event.venue.borough}, NY ${event.venue.zip}`}
                />
                <Detail
                  icon="💰"
                  label="Cost"
                  value={event.cost === "Free" ? "Free" : `$${event.cost}`}
                  highlight={event.cost === "Free"}
                />
              </div>

              <hr className="border-stone-100" />

              {/* Description */}
              <div>
                <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-2">
                  About this event
                </h2>
                <p className="text-stone-700 leading-relaxed">{event.description}</p>
              </div>

              {/* Contact / Registration */}
              {(event.registrationUrl || event.contactEmail || event.contactPhone) && (
                <>
                  <hr className="border-stone-100" />
                  <div>
                    <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">
                      Contact &amp; Registration
                    </h2>
                    <div className="flex flex-col gap-2">
                      {event.registrationUrl && (
                        <a
                          href={event.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-900"
                        >
                          Register on {SOURCE_LABELS[event.source] ?? event.source} website →
                        </a>
                      )}
                      {event.contactEmail && (
                        <a
                          href={`mailto:${event.contactEmail}`}
                          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900"
                        >
                          ✉ {event.contactEmail}
                        </a>
                      )}
                      {event.contactPhone && (
                        <a
                          href={`tel:${event.contactPhone}`}
                          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900"
                        >
                          ☎ {event.contactPhone}
                        </a>
                      )}
                    </div>
                  </div>
                </>
              )}

              <hr className="border-stone-100" />

              {/* Register / Interested */}
              <div className="flex flex-col items-center gap-5">
                <RegistrationSection
                  event={event}
                  user={user}
                  registration={registration}
                  registeredCount={registeredCount}
                  eventUrl={eventUrl}
                />
                <InterestedButton
                  eventId={event.id}
                  initialCount={event.interestedCount}
                />
              </div>
            </div>
          </article>

          {/* Related events */}
          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="text-base font-semibold text-stone-700 mb-4">
                More events you might like
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

function RegistrationSection({
  event,
  user,
  registration,
  registeredCount,
  eventUrl,
}: {
  event: Event;
  user: User | null;
  registration: Registration | undefined;
  registeredCount: number;
  eventUrl: string;
}) {
  if (event.isCanceled) {
    return (
      <p className="text-sm text-stone-400">
        This event has been canceled — registration is closed.
      </p>
    );
  }

  if (registration) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full bg-emerald-800 text-white font-semibold text-sm px-8 py-3">
          ✓ You&apos;re registered
        </div>
        <AddToCalendar event={event} eventUrl={eventUrl} />
        <form action={cancelRegistration}>
          <input type="hidden" name="registrationId" value={registration.id} />
          <input type="hidden" name="eventId" value={event.id} />
          <button
            type="submit"
            className="text-xs text-stone-400 hover:text-red-600 underline"
          >
            Cancel my registration
          </button>
        </form>
        <p className="text-xs text-stone-400">
          {registeredCount} {registeredCount === 1 ? "person" : "people"}{" "}
          registered
        </p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col items-center gap-2">
        <form action={registerForEvent} className="w-full sm:w-auto">
          <input type="hidden" name="eventId" value={event.id} />
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-sm bg-emerald-800 text-white hover:bg-emerald-700 transition-colors"
          >
            Register for this event
          </button>
        </form>
        <p className="text-xs text-stone-400">
          {registeredCount} {registeredCount === 1 ? "person" : "people"}{" "}
          registered
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Link
        href={`/login?next=${encodeURIComponent(`/events/${event.id}`)}`}
        className="w-full sm:w-auto text-center px-8 py-3 rounded-full font-semibold text-sm bg-emerald-800 text-white hover:bg-emerald-700 transition-colors"
      >
        Sign in to register
      </Link>
      <p className="text-xs text-stone-400">
        {registeredCount} {registeredCount === 1 ? "person" : "people"}{" "}
        registered
      </p>
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
  highlight,
}: {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">{label}</p>
        <p className={`text-sm mt-0.5 ${highlight ? "font-semibold text-emerald-700" : "text-stone-700"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
