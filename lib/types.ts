export type Borough =
  | "Manhattan"
  | "Brooklyn"
  | "Queens"
  | "Bronx"
  | "Staten Island";

export type Source = "NYPL" | "BPL" | "QPL" | "COMMUNITY";

export type Category =
  | "arts-crafts"
  | "photography"
  | "literature"
  | "poetry"
  | "music"
  | "tech-digital-skills"
  | "test-prep-education"
  | "fitness"
  | "kids-teens"
  | "careers";

export interface Venue {
  name: string;
  address: string;
  borough: Borough;
  zip: string;
  lat: number;
  lng: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  source: Source;
  venue: Venue;
  date: string;
  startTime: string;
  endTime: string;
  cost: "Free" | number;
  category: Category;
  registrationUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  isCanceled: boolean;
  sourceEventId: string;
  interestedCount: number;
  /** Set when the event was created by a community organization on this site. */
  organizationId?: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  calendarToken: string;
  ownerUserId: string;
  createdAt: string;
}

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  createdAt: string;
  canceledAt: string | null;
}

export interface FilterState {
  categories: Category[];
  cost: "all" | "free" | "paid";
  sortBy: "date" | "distance";
  borough: Borough | null;
}
