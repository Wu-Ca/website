import type { Event, Registration } from "./types";
import { EVENTS } from "./mock-data";
import {
  listAllOrgEvents,
  getOrgEventById,
  getOrgEventsByIds,
  listUserRegistrations,
} from "./db";

/**
 * All events: aggregated library events plus community-organization events.
 * If the database is unreachable, degrades to library events only rather
 * than failing the whole listing.
 */
export async function getAllEvents(): Promise<Event[]> {
  try {
    return [...EVENTS, ...(await listAllOrgEvents())];
  } catch (error) {
    console.error("Failed to load community events; serving library events only:", error);
    return [...EVENTS];
  }
}

export async function getEvent(id: string): Promise<Event | undefined> {
  return EVENTS.find((e) => e.id === id) ?? (await getOrgEventById(id));
}

export async function getRelatedEvents(event: Event, limit = 3): Promise<Event[]> {
  return (await getAllEvents())
    .filter(
      (e) =>
        e.id !== event.id &&
        !e.isCanceled &&
        (e.category === event.category || e.venue.borough === event.venue.borough)
    )
    .slice(0, limit);
}

export interface RegistrationWithEvent {
  registration: Registration;
  event: Event;
}

export async function getUserRegistrationsWithEvents(
  userId: string
): Promise<RegistrationWithEvent[]> {
  const registrations = await listUserRegistrations(userId);
  const orgEventIds = registrations
    .map((r) => r.eventId)
    .filter((id) => !EVENTS.some((e) => e.id === id));
  const orgEvents = await getOrgEventsByIds(orgEventIds);
  const eventById = new Map<string, Event>([
    ...EVENTS.map((e) => [e.id, e] as const),
    ...orgEvents.map((e) => [e.id, e] as const),
  ]);

  return registrations
    .map((registration) => {
      const event = eventById.get(registration.eventId);
      return event ? { registration, event } : null;
    })
    .filter((r): r is RegistrationWithEvent => r !== null)
    .sort((a, b) =>
      `${a.event.date}T${a.event.startTime}`.localeCompare(
        `${b.event.date}T${b.event.startTime}`
      )
    );
}
