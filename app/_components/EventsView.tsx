"use client";

import { useState, useEffect, useMemo } from "react";
import type { Event, Category, Borough } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";
import { haversineDistance, BOROUGHS, BOROUGH_CENTERS } from "@/lib/utils";
import EventCard from "./EventCard";

interface Props {
  events: Event[];
}

type LocationStatus = "idle" | "requesting" | "granted" | "denied";

export default function EventsView({ events }: Props) {
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [selectedBorough, setSelectedBorough] = useState<Borough | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [costFilter, setCostFilter] = useState<"all" | "free" | "paid">("all");
  const [sortBy, setSortBy] = useState<"date" | "distance">("date");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLocationStatus("granted");
        setSortBy("distance");
      },
      () => {
        setLocationStatus("denied");
      },
      { timeout: 8000 }
    );
  }, []);

  const effectiveLat = useMemo(() => {
    if (userLat !== null) return userLat;
    if (selectedBorough) return BOROUGH_CENTERS[selectedBorough].lat;
    return null;
  }, [userLat, selectedBorough]);

  const effectiveLng = useMemo(() => {
    if (userLng !== null) return userLng;
    if (selectedBorough) return BOROUGH_CENTERS[selectedBorough].lng;
    return null;
  }, [userLng, selectedBorough]);

  const eventsWithDistance = useMemo(() => {
    return events.map((e) => ({
      event: e,
      distance:
        effectiveLat !== null && effectiveLng !== null
          ? haversineDistance(effectiveLat, effectiveLng, e.venue.lat, e.venue.lng)
          : undefined,
    }));
  }, [events, effectiveLat, effectiveLng]);

  const filtered = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

    let result = eventsWithDistance.filter(({ event }) => {
      if (event.isCanceled) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(event.category)) return false;
      if (costFilter === "free" && event.cost !== "Free") return false;
      if (costFilter === "paid" && event.cost === "Free") return false;
      if (selectedBorough && !userLat && event.venue.borough !== selectedBorough) return false;
      if (words.length > 0) {
        const haystack = [
          event.title,
          event.description,
          event.venue.name,
          event.venue.address,
          event.venue.borough,
          CATEGORIES.find((c) => c.value === event.category)?.label ?? event.category,
        ]
          .join(" ")
          .toLowerCase();
        if (!words.every((w) => haystack.includes(w))) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === "distance" && a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      const dateA = new Date(`${a.event.date}T${a.event.startTime}`).getTime();
      const dateB = new Date(`${b.event.date}T${b.event.startTime}`).getTime();
      return dateA - dateB;
    });

    return result;
  }, [eventsWithDistance, selectedCategories, costFilter, sortBy, selectedBorough, userLat, query]);

  function toggleCategory(cat: Category) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  const hasLocation = locationStatus === "granted" || selectedBorough !== null;

  return (
    <div className="flex flex-col gap-0">
      {/* Location bar */}
      <div className="bg-emerald-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-3">
          {locationStatus === "requesting" && (
            <div className="flex items-center gap-2 text-sm">
              <span className="animate-spin text-emerald-300">⟳</span>
              <span className="text-emerald-100">Finding events near you...</span>
            </div>
          )}
          {locationStatus === "granted" && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-emerald-300">◉</span>
              <span className="text-emerald-50">Showing events sorted by distance from your location</span>
            </div>
          )}
          {(locationStatus === "denied" || locationStatus === "idle") && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-sm text-emerald-100">Browse by borough:</span>
              <div className="flex gap-2 flex-wrap">
                {BOROUGHS.map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      setSelectedBorough(b === selectedBorough ? null : b);
                      setSortBy(b === selectedBorough ? "date" : "distance");
                    }}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      selectedBorough === b
                        ? "bg-white text-emerald-800 border-white font-medium"
                        : "border-emerald-600 text-emerald-100 hover:border-white hover:text-white"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border-b border-stone-200 sticky top-14 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3">
          {/* Keyword search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none">
              🔍
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events, venues, keywords..."
              aria-label="Search events by keyword"
              className="w-full rounded-full border border-stone-300 pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 text-sm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategories([])}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedCategories.length === 0
                  ? "bg-emerald-800 text-white border-emerald-800"
                  : "border-stone-300 text-stone-600 hover:border-stone-400"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => toggleCategory(cat.value)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedCategories.includes(cat.value)
                    ? "bg-emerald-800 text-white border-emerald-800"
                    : "border-stone-300 text-stone-600 hover:border-stone-400"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Cost + Sort */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs">
              {(["all", "free", "paid"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setCostFilter(opt)}
                  className={`px-2.5 py-1 rounded-full border capitalize transition-colors ${
                    costFilter === opt
                      ? "bg-stone-800 text-white border-stone-800"
                      : "border-stone-200 text-stone-500 hover:border-stone-400"
                  }`}
                >
                  {opt === "all" ? "Any cost" : opt === "free" ? "Free only" : "Paid"}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-1 text-xs">
              <span className="text-stone-400">Sort:</span>
              {(["date", "distance"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  disabled={opt === "distance" && !hasLocation}
                  className={`px-2.5 py-1 rounded-full border capitalize transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    sortBy === opt
                      ? "bg-stone-800 text-white border-stone-800"
                      : "border-stone-200 text-stone-500 hover:border-stone-400"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto w-full px-4 py-6">
        <p className="text-sm text-stone-500 mb-4">
          {filtered.length === 0
            ? query.trim()
              ? `No events match “${query.trim()}” with your filters.`
              : "No events match your filters."
            : `${filtered.length} event${filtered.length !== 1 ? "s" : ""}${
                selectedBorough && !userLat ? ` in ${selectedBorough}` : ""
              }${query.trim() ? ` matching “${query.trim()}”` : ""}`}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ event, distance }) => (
            <EventCard key={event.id} event={event} distance={distance} />
          ))}
        </div>
      </div>
    </div>
  );
}
