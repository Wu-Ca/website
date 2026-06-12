"use client";

import { useState } from "react";

interface Props {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(
        `Check out this event: ${title}\n\n${url}`
      )}`,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context); leave button as-is.
    }
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-xs text-stone-400 mr-1">Share:</span>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium px-2.5 py-1 rounded-full border border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
        >
          {link.label}
        </a>
      ))}
      <button
        onClick={copyLink}
        className="text-xs font-medium px-2.5 py-1 rounded-full border border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
      >
        {copied ? "✓ Copied" : "Copy link"}
      </button>
    </div>
  );
}
