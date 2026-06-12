import type { Metadata } from "next";
import { EVENTS } from "@/lib/mock-data";
import Header from "./_components/Header";
import EventsView from "./_components/EventsView";

export const metadata: Metadata = {
  title: "CommonGround NYC — Free & Low-Cost Events at NYC Libraries",
  description:
    "Discover free workshops, readings, classes, and events at NYPL, Brooklyn Public Library, and Queens Public Library near you.",
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-stone-50">
        <div className="bg-emerald-900 text-white">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Free events at NYC libraries
            </h1>
            <p className="mt-2 text-emerald-200 text-sm sm:text-base max-w-xl">
              Workshops, readings, classes, and more — all free or low-cost, at
              NYPL, Brooklyn Public Library, and Queens Public Library branches
              near you.
            </p>
          </div>
        </div>
        <EventsView events={EVENTS} />
      </main>
    </>
  );
}
