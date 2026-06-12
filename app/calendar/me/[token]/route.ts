import { NextRequest, NextResponse } from "next/server";
import { getProfileByCalendarToken } from "@/lib/db";
import { getUserRegistrationsWithEvents } from "@/lib/events";
import { eventsToIcsFeed } from "@/lib/calendar";
import { getOrigin } from "@/lib/auth";

// Personal iCalendar subscription feed: every event the user is registered
// for. The URL carries a private token, so it needs no session — calendar
// apps (Google, Apple, Outlook) poll it directly.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const profile = await getProfileByCalendarToken(token);
  if (!profile) {
    return new NextResponse("Calendar not found", { status: 404 });
  }

  const origin = await getOrigin();
  const registrations = await getUserRegistrationsWithEvents(profile.id);
  const events = registrations
    .map(({ event }) => event)
    .filter((event) => !event.isCanceled);

  const ics = eventsToIcsFeed(
    "My CommonGround NYC events",
    events,
    (event) => `${origin}/events/${event.id}`
  );

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "private, max-age=300",
    },
  });
}
