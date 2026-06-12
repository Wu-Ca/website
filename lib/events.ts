import type { Event, Registration } from "./types";
import { EVENTS } from "./mock-data";
import { listAllOrgEvents, getOrgEventById, listUserRegistrations } from "./db";

/** All events: aggregated library events plus community-organization events. */
export function getAllEvents(): Event[] {
  return [...EVENTS, ...listAllOrgEvents()];
}

export function getEvent(id: string): Event | undefined {
  return EVENTS.find((e) => e.id === id) ?? getOrgEventById(id);
}

export function getRelatedEvents(event: Event, limit = 3): Event[] {
  return getAllEvents()
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

export function getUserRegistrationsWithEvents(
  userId: string
): RegistrationWithEvent[] {
  return listUserRegistrations(userId)
    .map((registration) => {
      const event = getEvent(registration.eventId);
      return event ? { registration, event } : null;
    })
    .filter((r): r is RegistrationWithEvent => r !== null)
    .sort((a, b) =>
      `${a.event.date}T${a.event.startTime}`.localeCompare(
        `${b.event.date}T${b.event.startTime}`
      )
    );
}
