import Link from "next/link";
import type { Event } from "@/lib/types";
import { getCategoryMeta } from "@/lib/categories";
import { formatEventDate, SOURCE_BADGE_LABELS, formatDistance } from "@/lib/utils";

interface Props {
  event: Event;
  distance?: number;
}

const SOURCE_BADGE: Record<string, string> = {
  NYPL: "bg-red-50 text-red-700 border border-red-200",
  BPL: "bg-blue-50 text-blue-700 border border-blue-200",
  QPL: "bg-purple-50 text-purple-700 border border-purple-200",
  COMMUNITY: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

export default function EventCard({ event, distance }: Props) {
  const categoryMeta = getCategoryMeta(event.category);
  const dateLabel = formatEventDate(event.date, event.startTime, event.endTime);

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block bg-white rounded-xl border border-stone-200 hover:border-emerald-300 hover:shadow-md transition-all duration-150 overflow-hidden"
    >
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
              categoryMeta?.color ?? "bg-stone-100 text-stone-600"
            }`}
          >
            {categoryMeta?.label ?? event.category}
          </span>
          <span
            className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
              SOURCE_BADGE[event.source] ?? "bg-stone-100 text-stone-600"
            }`}
          >
            {SOURCE_BADGE_LABELS[event.source] ?? event.source}
          </span>
        </div>

        <div>
          <h3 className="font-semibold text-stone-900 leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2">
            {event.title}
          </h3>
          <p className="mt-1 text-sm text-stone-500 line-clamp-2">
            {event.description}
          </p>
        </div>

        <div className="flex flex-col gap-1 text-sm text-stone-600">
          <div className="flex items-center gap-1.5">
            <CalendarIcon />
            <span>{dateLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <LocationIcon />
            <span className="truncate">
              {event.venue.name} · {event.venue.borough}
            </span>
            {distance !== undefined && (
              <span className="shrink-0 ml-auto text-xs text-stone-400">
                {formatDistance(distance)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-emerald-700">
            {event.cost === "Free" ? "Free" : `$${event.cost}`}
          </span>
          <span className="text-xs text-stone-400">
            {event.interestedCount} interested
          </span>
        </div>
      </div>
    </Link>
  );
}

function CalendarIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 shrink-0 text-stone-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 shrink-0 text-stone-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}
