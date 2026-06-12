"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // yyyy-mm-dd
  startTime: string; // HH:mm
}

interface Props {
  events: CalendarEvent[];
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayKey(): string {
  const now = new Date();
  return dateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Month calendar of the user's registrations. Days with an event get a
 * filled check mark; clicking a day lists that day's events below.
 */
export default function RegistrationsCalendar({ events }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string | null>(null);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return map;
  }, [events]);

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayKey();

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function shiftMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
    setSelected(null);
  }

  const selectedEvents = selected ? (eventsByDate.get(selected) ?? []) : [];

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-stone-700">{monthLabel}</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="w-8 h-8 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="w-8 h-8 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-xs font-medium text-stone-400 py-1">
            {d}
          </div>
        ))}
        {Array.from({ length: firstWeekday }, (_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const key = dateKey(year, month, day);
          const hasEvents = eventsByDate.has(key);
          const isToday = key === today;
          const isSelected = key === selected;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(isSelected ? null : key)}
              className={`relative flex flex-col items-center justify-start gap-0.5 rounded-lg py-1.5 text-sm transition-colors ${
                isSelected
                  ? "bg-emerald-50 ring-2 ring-emerald-600"
                  : "hover:bg-stone-50"
              } ${isToday ? "font-bold text-emerald-800" : "text-stone-700"}`}
            >
              <span>{day}</span>
              {hasEvents ? (
                <span
                  className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] leading-none shadow-sm"
                  aria-label="You have an event this day"
                >
                  ✓
                </span>
              ) : (
                <span className="w-4 h-4" aria-hidden />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-stone-400">
        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] leading-none">
          ✓
        </span>
        <span>You&apos;re registered for an event that day</span>
      </div>

      {selected && (
        <div className="mt-4 pt-4 border-t border-stone-100">
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-stone-500">
              No events on{" "}
              {new Date(`${selected}T12:00:00`).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
              .
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {selectedEvents.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.id}`}
                    className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
                  >
                    {event.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
