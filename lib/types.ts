export type Borough =
  | "Manhattan"
  | "Brooklyn"
  | "Queens"
  | "Bronx"
  | "Staten Island";

export type Source = "NYPL" | "BPL" | "QPL";

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
}

export interface FilterState {
  categories: Category[];
  cost: "all" | "free" | "paid";
  sortBy: "date" | "distance";
  borough: Borough | null;
}
