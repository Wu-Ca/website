"use client";

import { useState } from "react";

interface Props {
  heading: string;
  description: string;
  feedUrl: string;
  webcalUrl: string;
  googleUrl: string;
  outlookUrl: string;
}

const buttonClass =
  "text-xs font-medium px-3 py-1.5 rounded-full border border-stone-300 text-stone-600 hover:border-emerald-400 hover:text-emerald-800 transition-colors";

/**
 * Subscribe-to-calendar card. The feed is a standard ICS URL, so Google,
 * Apple, Outlook, and anything else that speaks iCalendar can stay in sync
 * automatically.
 */
export default function CalendarSyncCard({
  heading,
  description,
  feedUrl,
  webcalUrl,
  googleUrl,
  outlookUrl,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function copyFeedUrl() {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — leave URL visible.
    }
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <h2 className="text-base font-semibold text-stone-700">{heading}</h2>
      <p className="mt-1 text-sm text-stone-500">{description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          Google Calendar
        </a>
        <a href={webcalUrl} className={buttonClass}>
          Apple Calendar
        </a>
        <a
          href={outlookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          Outlook
        </a>
        <button type="button" onClick={copyFeedUrl} className={buttonClass}>
          {copied ? "✓ Copied" : "Copy feed URL"}
        </button>
      </div>
      <p className="mt-3 text-xs text-stone-400">
        Anyone with this link can see the calendar — share it carefully. New
        events appear automatically; calendar apps refresh feeds every few
        hours.
      </p>
    </div>
  );
}
