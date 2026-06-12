import { NextRequest, NextResponse } from "next/server";
import { getOrganizationByCalendarToken, listOrgEvents } from "@/lib/db";
import { eventsToIcsFeed } from "@/lib/calendar";
import { getOrigin } from "@/lib/auth";

// Organization iCalendar subscription feed: every event the organization
// has published. Calendar apps poll this URL, so new events appear in
// subscribers' calendars automatically.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const org = await getOrganizationByCalendarToken(token);
  if (!org) {
    return new NextResponse("Calendar not found", { status: 404 });
  }

  const origin = await getOrigin();
  const events = (await listOrgEvents(org.id)).filter(
    (event) => !event.isCanceled
  );

  const ics = eventsToIcsFeed(
    `${org.name} — events`,
    events,
    (event) => `${origin}/events/${event.id}`
  );

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
