"use client";

import { useState } from "react";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // yyyy-mm-dd
  startTime: string; // HH:mm
}

interface Props {
  events: CalendarEvent[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
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
 * Compact month calendar of the user's registrations. Days with an event get
 * a filled check mark. Selection is controlled by the parent, which shows
 * the selected day's events alongside.
 */
export default function RegistrationsCalendar({
  events,
  selectedDate,
  onSelectDate,
}: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const eventDates = new Set(events.map((e) => e.date));
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
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-stone-700">{monthLabel}</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="w-7 h-7 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="w-7 h-7 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-[10px] font-medium text-stone-400 py-1">
            {d}
          </div>
        ))}
        {Array.from({ length: firstWeekday }, (_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const key = dateKey(year, month, day);
          const hasEvents = eventDates.has(key);
          const isToday = key === today;
          const isSelected = key === selectedDate;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(isSelected ? null : key)}
              className={`relative flex flex-col items-center justify-start gap-0.5 rounded-md py-1 text-xs transition-colors ${
                isSelected
                  ? "bg-emerald-50 ring-2 ring-emerald-600"
                  : "hover:bg-stone-50"
              } ${isToday ? "font-bold text-emerald-800" : "text-stone-700"}`}
            >
              <span>{day}</span>
              {hasEvents ? (
                <span
                  className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-600 text-white text-[9px] leading-none shadow-sm"
                  aria-label="You have an event this day"
                >
                  ✓
                </span>
              ) : (
                <span className="w-3.5 h-3.5" aria-hidden />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-stone-400">
        <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-600 text-white text-[9px] leading-none">
          ✓
        </span>
        <span>Registered event</span>
      </div>
    </div>
  );
}
