import type { Event } from "@/lib/types";
import { googleCalendarUrl, outlookCalendarUrl } from "@/lib/calendar";

interface Props {
  event: Event;
  /** Absolute URL of the event page, included in calendar entries. */
  eventUrl: string;
}

const linkClass =
  "text-xs font-medium px-2.5 py-1 rounded-full border border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors";

export default function AddToCalendar({ event, eventUrl }: Props) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-xs text-stone-400 mr-1">Add to calendar:</span>
      <a
        href={googleCalendarUrl(event, eventUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        Google
      </a>
      <a
        href={outlookCalendarUrl(event, eventUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        Outlook
      </a>
      <a href={`/events/${event.id}/ics`} className={linkClass}>
        Apple / iCloud (.ics)
      </a>
    </div>
  );
}
