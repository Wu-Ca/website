"use client";

import { useState } from "react";

interface Props {
  title: string;
  description: string;
  dateLabel: string;
  location: string;
  eventUrl: string;
}

// Luma and Partiful don't offer public URL-prefill or write APIs, so the
// best cross-posting flow is: copy a ready-to-paste event summary to the
// clipboard, then open their event-creation page.
export default function CrossPostButtons({
  title,
  description,
  dateLabel,
  location,
  eventUrl,
}: Props) {
  const [copiedFor, setCopiedFor] = useState<string | null>(null);

  async function crossPost(service: "Luma" | "Partiful", createUrl: string) {
    const details = `${title}\n\nWhen: ${dateLabel}\nWhere: ${location}\n\n${description}\n\nRSVP also available at: ${eventUrl}`;
    try {
      await navigator.clipboard.writeText(details);
      setCopiedFor(service);
      setTimeout(() => setCopiedFor(null), 4000);
    } catch {
      // Clipboard unavailable — still open the create page.
    }
    window.open(createUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-xs text-stone-400 mr-1">Also create on:</span>
      <button
        onClick={() => crossPost("Luma", "https://lu.ma/create")}
        className="text-xs font-medium px-2.5 py-1 rounded-full border border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
      >
        Luma
      </button>
      <button
        onClick={() => crossPost("Partiful", "https://partiful.com/create")}
        className="text-xs font-medium px-2.5 py-1 rounded-full border border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
      >
        Partiful
      </button>
      {copiedFor && (
        <span className="text-xs text-emerald-700">
          ✓ Event details copied — paste them into {copiedFor}
        </span>
      )}
    </div>
  );
}
