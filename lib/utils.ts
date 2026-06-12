export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(miles: number): string {
  if (miles < 0.1) return "< 0.1 mi";
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

export function formatEventDate(dateStr: string, startTime: string, endTime: string): string {
  const date = new Date(`${dateStr}T${startTime}`);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const dayLabel = isToday
    ? "Today"
    : isTomorrow
    ? "Tomorrow"
    : date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const start = formatTime(startTime);
  const end = formatTime(endTime);
  return `${dayLabel} · ${start}–${end}`;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}${ampm}` : `${hour}:${m.toString().padStart(2, "0")}${ampm}`;
}

export function formatFullDate(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const BOROUGHS = [
  "Manhattan",
  "Brooklyn",
  "Queens",
  "Bronx",
  "Staten Island",
] as const;

export const SOURCE_LABELS: Record<string, string> = {
  NYPL: "NY Public Library",
  BPL: "Brooklyn Public Library",
  QPL: "Queens Public Library",
  COMMUNITY: "Community",
};

export const SOURCE_BADGE_LABELS: Record<string, string> = {
  NYPL: "NYPL",
  BPL: "BPL",
  QPL: "QPL",
  COMMUNITY: "Community",
};

export const BOROUGH_CENTERS: Record<
  (typeof BOROUGHS)[number],
  { lat: number; lng: number }
> = {
  Manhattan: { lat: 40.7831, lng: -73.9712 },
  Brooklyn: { lat: 40.6782, lng: -73.9442 },
  Queens: { lat: 40.7282, lng: -73.7949 },
  Bronx: { lat: 40.8448, lng: -73.8648 },
  "Staten Island": { lat: 40.5795, lng: -74.1502 },
};
