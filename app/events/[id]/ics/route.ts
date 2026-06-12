import type { NextRequest } from "next/server";
import { getEvent } from "@/lib/events";
import { eventToIcs } from "@/lib/calendar";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) {
    return new Response("Event not found", { status: 404 });
  }

  const eventUrl = new URL(`/events/${event.id}`, request.nextUrl).toString();
  const ics = eventToIcs(event, eventUrl);

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.id}.ics"`,
    },
  });
}
