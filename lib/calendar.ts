import type { Event } from "./types";

// Calendar export helpers. NYC events are fixed to America/New_York.

const TZID = "America/New_York";

function compactDateTime(date: string, time: string): string {
  return `${date.replaceAll("-", "")}T${time.replaceAll(":", "")}00`;
}

export function eventLocation(event: Event): string {
  const v = event.venue;
  return `${v.name}, ${v.address}, ${v.borough}, NY ${v.zip}`;
}

export function googleCalendarUrl(event: Event, eventUrl: string): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${compactDateTime(event.date, event.startTime)}/${compactDateTime(event.date, event.endTime)}`,
    ctz: TZID,
    details: `${event.description}\n\n${eventUrl}`,
    location: eventLocation(event),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function outlookCalendarUrl(event: Event, eventUrl: string): string {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    startdt: `${event.date}T${event.startTime}:00`,
    enddt: `${event.date}T${event.endTime}:00`,
    body: `${event.description}\n\n${eventUrl}`,
    location: eventLocation(event),
  });
  return `https://outlook.live.com/calendar/0/action/compose?${params}`;
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

// RFC 5545 lines should be folded at 75 octets; fold conservatively.
function foldIcsLine(line: string): string {
  const chunks: string[] = [];
  let rest = line;
  while (rest.length > 73) {
    chunks.push(rest.slice(0, 73));
    rest = ` ${rest.slice(73)}`;
  }
  chunks.push(rest);
  return chunks.join("\r\n");
}

function eventToVEventLines(
  event: Event,
  eventUrl: string,
  dtStamp: string
): string[] {
  return [
    "BEGIN:VEVENT",
    `UID:${event.id}@commonground.nyc`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;TZID=${TZID}:${compactDateTime(event.date, event.startTime)}`,
    `DTEND;TZID=${TZID}:${compactDateTime(event.date, event.endTime)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(`${event.description}\n\n${eventUrl}`)}`,
    `LOCATION:${escapeIcsText(eventLocation(event))}`,
    `URL:${eventUrl}`,
    `STATUS:${event.isCanceled ? "CANCELLED" : "CONFIRMED"}`,
    "END:VEVENT",
  ];
}

function icsDtStamp(): string {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

/** iCalendar file content — works with Apple/iCloud Calendar, Google, Outlook. */
export function eventToIcs(event: Event, eventUrl: string): string {
  return eventsToIcsFeed("CommonGround NYC", [event], () => eventUrl);
}

/**
 * Multi-event iCalendar feed for live calendar subscriptions. Calendar apps
 * poll the feed URL, so newly registered events show up automatically.
 */
export function eventsToIcsFeed(
  calendarName: string,
  events: Event[],
  eventUrl: (event: Event) => string
): string {
  const dtStamp = icsDtStamp();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CommonGround NYC//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    `X-WR-TIMEZONE:${TZID}`,
    ...events.flatMap((event) =>
      eventToVEventLines(event, eventUrl(event), dtStamp)
    ),
    "END:VCALENDAR",
  ];
  return lines.map(foldIcsLine).join("\r\n") + "\r\n";
}

/** Subscription links for the major calendar apps, given an ICS feed URL. */
export function calendarSubscribeLinks(feedUrl: string, name: string) {
  const webcal = feedUrl.replace(/^https?:\/\//, "webcal://");
  return {
    feedUrl,
    webcal,
    google: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`,
    outlook: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(feedUrl)}&name=${encodeURIComponent(name)}`,
  };
}
