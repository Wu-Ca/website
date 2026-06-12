import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventById, getRelatedEvents, EVENTS } from "@/lib/mock-data";
import { getCategoryMeta } from "@/lib/categories";
import { formatFullDate, formatTime, SOURCE_LABELS } from "@/lib/utils";
import Header from "@/app/_components/Header";
import EventCard from "@/app/_components/EventCard";
import InterestedButton from "./InterestedButton";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return EVENTS.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) return {};
  return {
    title: `${event.title} — CommonGround NYC`,
    description: event.description.slice(0, 160),
  };
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) notFound();

  const related = getRelatedEvents(event);
  const categoryMeta = getCategoryMeta(event.category);

  const SOURCE_BADGE: Record<string, string> = {
    NYPL: "bg-red-50 text-red-700 border border-red-200",
    BPL: "bg-blue-50 text-blue-700 border border-blue-200",
    QPL: "bg-purple-50 text-purple-700 border border-purple-200",
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
                  {SOURCE_LABELS[event.source] ?? event.source}
                </span>
              </div>
              <h1 className="text-2xl font-bold leading-tight">{event.title}</h1>
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

              {/* Interested button */}
              <InterestedButton
                eventId={event.id}
                initialCount={event.interestedCount}
              />
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
