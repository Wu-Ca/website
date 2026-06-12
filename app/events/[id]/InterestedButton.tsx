"use client";

import { useState, useEffect } from "react";

interface Props {
  eventId: string;
  initialCount: number;
}

export default function InterestedButton({ eventId, initialCount }: Props) {
  const storageKey = `cg-interested-${eventId}`;
  const [interested, setInterested] = useState(false);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setInterested(localStorage.getItem(storageKey) === "1");
  }, [storageKey]);

  function toggle() {
    const next = !interested;
    setInterested(next);
    setCount((c) => (next ? c + 1 : c - 1));
    if (next) {
      localStorage.setItem(storageKey, "1");
    } else {
      localStorage.removeItem(storageKey);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={toggle}
        className={`w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-sm transition-all ${
          interested
            ? "bg-emerald-800 text-white hover:bg-emerald-700"
            : "bg-emerald-50 text-emerald-800 border-2 border-emerald-800 hover:bg-emerald-100"
        }`}
      >
        {interested ? "✓ I'm interested" : "I'm interested"}
      </button>
      <p className="text-xs text-stone-400">{count} people interested</p>
    </div>
  );
}
