"use client";

import { useState } from "react";
import Link from "next/link";
import type { Event } from "@/lib/types";
import { cancelRegistration } from "@/app/actions/registrations";
import { getCategoryMeta } from "@/lib/categories";
import { formatFullDate, formatTime } from "@/lib/utils";
import AddToCalendar from "@/app/_components/AddToCalendar";
import RegistrationsCalendar from "@/app/_components/RegistrationsCalendar";

export interface PanelItem {
  registrationId: string;
  event: Event;
}

interface Props {
  items: PanelItem[];
  origin: string;
  /** Server-rendered yyyy-mm-dd so upcoming/past agree with the rest of the page. */
  today: string;
}

/**
 * Calendar + registrations side by side. The right card lists upcoming
 * registrations; picking an event (from the list or by clicking a calendar
 * day) fills the card with that event's details.
 */
export default function UpcomingPanel({ items, origin, today }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const calendarEvents = items
    .filter(({ event }) => !event.isCanceled)
    .map(({ event }) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      startTime: event.startTime,
    }));

  const upcoming = items
    .filter(({ event }) => event.date >= today)
    .sort((a, b) =>
      `${a.event.date}T${a.event.startTime}`.localeCompare(
        `${b.event.date}T${b.event.startTime}`
      )
    );

  const dayItems = selectedDate
    ? items.filter(({ event }) => event.date === selectedDate)
    : [];
  const selectedItem =
    items.find(({ event }) => event.id === selectedEventId) ?? null;

  function handleSelectDate(date: string | null) {
    setSelectedDate(date);
    if (!date) {
      setSelectedEventId(null);
      return;
    }
    const first = items.find(({ event }) => event.date === date);
    setSelectedEventId(first?.event.id ?? null);
  }

  function handleSelectEvent(item: PanelItem) {
    setSelectedEventId(item.event.id);
    setSelectedDate(item.event.date);
  }

  function clearSelection() {
    setSelectedDate(null);
    setSelectedEventId(null);
  }

  return (
    <div className="grid gap-4 md:grid-cols-5 items-start">
      <div className="md:col-span-2">
        <RegistrationsCalendar
          events={calendarEvents}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
        />
      </div>

      <div className="md:col-span-3 bg-white rounded-xl border border-stone-200 p-5">
        {selectedItem ? (
          <EventDetail
            item={selectedItem}
            siblings={dayItems}
            onPick={handleSelectEvent}
            onBack={clearSelection}
            origin={origin}
            isUpcoming={selectedItem.event.date >= today}
          />
        ) : selectedDate ? (
          <div>
            <BackButton onBack={clearSelection} />
            <p className="mt-3 text-sm text-stone-500">
              No registered events on{" "}
              {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
                "en-US",
                { weekday: "long", month: "long", day: "numeric" }
              )}
              .
            </p>
            <Link
              href="/"
              className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-900"
            >
              Browse events →
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-base font-semibold text-stone-700 mb-3">
              Upcoming registrations
            </h2>
            {upcoming.length === 0 ? (
              <div className="text-center py-6">
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
              <ul className="flex flex-col divide-y divide-stone-100">
                {upcoming.map((item) => (
                  <li key={item.registrationId}>
                    <button
                      type="button"
                      onClick={() => handleSelectEvent(item)}
                      className="w-full text-left py-3 group"
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-stone-900 group-hover:text-emerald-800 leading-snug">
                          {item.event.title}
                        </span>
                        {item.event.isCanceled && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                            Canceled
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-xs text-stone-500">
                        {formatFullDate(item.event.date)} ·{" "}
                        {formatTime(item.event.startTime)} ·{" "}
                        {item.event.venue.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="text-sm text-stone-500 hover:text-stone-800"
    >
      ← All upcoming
    </button>
  );
}

function EventDetail({
  item,
  siblings,
  onPick,
  onBack,
  origin,
  isUpcoming,
}: {
  item: PanelItem;
  siblings: PanelItem[];
  onPick: (item: PanelItem) => void;
  onBack: () => void;
  origin: string;
  isUpcoming: boolean;
}) {
  const { event, registrationId } = item;
  const categoryMeta = getCategoryMeta(event.category);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <BackButton onBack={onBack} />
        {siblings.length > 1 && (
          <div className="flex gap-1">
            {siblings.map((s, i) => (
              <button
                key={s.registrationId}
                type="button"
                onClick={() => onPick(s)}
                aria-label={s.event.title}
                className={`w-6 h-6 rounded-full text-xs border transition-colors ${
                  s.event.id === event.id
                    ? "bg-emerald-800 text-white border-emerald-800"
                    : "border-stone-300 text-stone-500 hover:border-stone-400"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            categoryMeta?.color ?? "bg-stone-100 text-stone-600"
          }`}
        >
          {categoryMeta?.label ?? event.category}
        </span>
        {event.isCanceled && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
            Event canceled
          </span>
        )}
        {!isUpcoming && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
            Past
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold text-stone-900 leading-snug">
        {event.title}
      </h3>

      <div className="text-sm text-stone-600 flex flex-col gap-1">
        <p>
          📅 {formatFullDate(event.date)} · {formatTime(event.startTime)}–
          {formatTime(event.endTime)}
        </p>
        <p>
          📍 {event.venue.name}, {event.venue.address}, {event.venue.borough}
        </p>
        <p>
          💰 {event.cost === "Free" ? "Free" : `$${event.cost}`}
        </p>
      </div>

      <p className="text-sm text-stone-500 leading-relaxed line-clamp-3">
        {event.description}
      </p>

      <Link
        href={`/events/${event.id}`}
        className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
      >
        View event page →
      </Link>

      {isUpcoming && !event.isCanceled && (
        <div className="pt-3 border-t border-stone-100 flex flex-col gap-3">
          <AddToCalendar
            event={event}
            eventUrl={`${origin}/events/${event.id}`}
          />
          <form action={cancelRegistration}>
            <input type="hidden" name="registrationId" value={registrationId} />
            <input type="hidden" name="eventId" value={event.id} />
            <button
              type="submit"
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-stone-300 text-stone-600 hover:border-red-300 hover:text-red-700 transition-colors"
            >
              Cancel registration
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
