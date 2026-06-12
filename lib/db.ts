import { createServiceClient } from "./supabase/server";
import type { Event, Organization, Registration } from "./types";

// Data access for application tables in Supabase Postgres. All functions
// run server-side with the service-role key; callers are responsible for
// auth checks (enforced via lib/auth.ts and the server actions).

interface EventRow {
  id: string;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  venue_name: string;
  address: string;
  borough: string;
  zip: string;
  lat: number;
  lng: number;
  cost: number | null;
  category: string;
  contact_email: string | null;
  is_canceled: boolean;
  organization_id: string;
}

const EVENT_COLUMNS =
  "id, title, description, date, start_time, end_time, venue_name, address, borough, zip, lat, lng, cost, category, contact_email, is_canceled, organization_id";

function rowToEvent(row: EventRow): Event {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    source: "COMMUNITY",
    venue: {
      name: row.venue_name,
      address: row.address,
      borough: row.borough as Event["venue"]["borough"],
      zip: row.zip,
      lat: row.lat,
      lng: row.lng,
    },
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    cost: row.cost == null || Number(row.cost) === 0 ? "Free" : Number(row.cost),
    category: row.category as Event["category"],
    contactEmail: row.contact_email ?? undefined,
    isCanceled: row.is_canceled,
    sourceEventId: `org-${row.organization_id}`,
    interestedCount: 0,
    organizationId: row.organization_id,
  };
}

function eventToRow(event: Event): EventRow {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    start_time: event.startTime,
    end_time: event.endTime,
    venue_name: event.venue.name,
    address: event.venue.address,
    borough: event.venue.borough,
    zip: event.venue.zip,
    lat: event.venue.lat,
    lng: event.venue.lng,
    cost: event.cost === "Free" ? null : event.cost,
    category: event.category,
    contact_email: event.contactEmail ?? null,
    is_canceled: event.isCanceled,
    organization_id: event.organizationId!,
  };
}

function check<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(`Database error: ${result.error.message}`);
  return result.data;
}

// --- Organizations ---

export async function getOrganizationById(
  id: string
): Promise<Organization | undefined> {
  const db = createServiceClient();
  const data = check(
    await db.from("organizations").select("*").eq("id", id).maybeSingle()
  );
  return data ? mapOrganization(data) : undefined;
}

export async function getOrganizationByOwner(
  userId: string
): Promise<Organization | undefined> {
  const db = createServiceClient();
  const data = check(
    await db
      .from("organizations")
      .select("*")
      .eq("owner_user_id", userId)
      .maybeSingle()
  );
  return data ? mapOrganization(data) : undefined;
}

interface OrganizationRow {
  id: string;
  name: string;
  description: string;
  owner_user_id: string;
  created_at: string;
}

function mapOrganization(row: OrganizationRow): Organization {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    ownerUserId: row.owner_user_id,
    createdAt: row.created_at,
  };
}

export async function createOrganization(input: {
  name: string;
  description: string;
  ownerUserId: string;
}): Promise<Organization> {
  const db = createServiceClient();
  const data = check(
    await db
      .from("organizations")
      .insert({
        name: input.name,
        description: input.description,
        owner_user_id: input.ownerUserId,
      })
      .select("*")
      .single()
  );
  return mapOrganization(data);
}

// --- Organization events ---

export async function listAllOrgEvents(): Promise<Event[]> {
  const db = createServiceClient();
  const data = check(await db.from("events").select(EVENT_COLUMNS));
  return (data as EventRow[]).map(rowToEvent);
}

export async function listOrgEvents(organizationId: string): Promise<Event[]> {
  const db = createServiceClient();
  const data = check(
    await db
      .from("events")
      .select(EVENT_COLUMNS)
      .eq("organization_id", organizationId)
  );
  return (data as EventRow[]).map(rowToEvent);
}

export async function getOrgEventById(id: string): Promise<Event | undefined> {
  const db = createServiceClient();
  const data = check(
    await db.from("events").select(EVENT_COLUMNS).eq("id", id).maybeSingle()
  );
  return data ? rowToEvent(data as EventRow) : undefined;
}

export async function getOrgEventsByIds(ids: string[]): Promise<Event[]> {
  if (ids.length === 0) return [];
  const db = createServiceClient();
  const data = check(
    await db.from("events").select(EVENT_COLUMNS).in("id", ids)
  );
  return (data as EventRow[]).map(rowToEvent);
}

export async function createOrgEvent(event: Event): Promise<Event> {
  const db = createServiceClient();
  check(await db.from("events").insert(eventToRow(event)));
  return event;
}

export async function setOrgEventCanceled(
  id: string,
  isCanceled: boolean
): Promise<void> {
  const db = createServiceClient();
  check(await db.from("events").update({ is_canceled: isCanceled }).eq("id", id));
}

// --- Registrations ---

interface RegistrationRow {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
  canceled_at: string | null;
}

function mapRegistration(row: RegistrationRow): Registration {
  return {
    id: row.id,
    userId: row.user_id,
    eventId: row.event_id,
    createdAt: row.created_at,
    canceledAt: row.canceled_at,
  };
}

export async function getActiveRegistration(
  userId: string,
  eventId: string
): Promise<Registration | undefined> {
  const db = createServiceClient();
  const data = check(
    await db
      .from("registrations")
      .select("*")
      .eq("user_id", userId)
      .eq("event_id", eventId)
      .is("canceled_at", null)
      .maybeSingle()
  );
  return data ? mapRegistration(data) : undefined;
}

export async function listUserRegistrations(
  userId: string
): Promise<Registration[]> {
  const db = createServiceClient();
  const data = check(
    await db
      .from("registrations")
      .select("*")
      .eq("user_id", userId)
      .is("canceled_at", null)
  );
  return (data as RegistrationRow[]).map(mapRegistration);
}

export interface Registrant {
  registrationId: string;
  email: string;
  createdAt: string;
}

export async function listEventRegistrants(
  eventId: string
): Promise<Registrant[]> {
  const db = createServiceClient();
  const data = check(
    await db
      .from("registrations")
      .select("id, created_at, profiles(email)")
      .eq("event_id", eventId)
      .is("canceled_at", null)
      .order("created_at", { ascending: true })
  );
  return (
    data as unknown as {
      id: string;
      created_at: string;
      profiles: { email: string } | null;
    }[]
  ).map((row) => ({
    registrationId: row.id,
    email: row.profiles?.email ?? "Unknown user",
    createdAt: row.created_at,
  }));
}

export async function countEventRegistrations(eventId: string): Promise<number> {
  const db = createServiceClient();
  const { count, error } = await db
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .is("canceled_at", null);
  if (error) throw new Error(`Database error: ${error.message}`);
  return count ?? 0;
}

export async function createRegistration(
  userId: string,
  eventId: string
): Promise<void> {
  const db = createServiceClient();
  const { error } = await db
    .from("registrations")
    .insert({ user_id: userId, event_id: eventId });
  // 23505: already actively registered (partial unique index) — fine.
  if (error && error.code !== "23505") {
    throw new Error(`Database error: ${error.message}`);
  }
}

export async function cancelRegistration(
  registrationId: string,
  userId: string
): Promise<void> {
  const db = createServiceClient();
  check(
    await db
      .from("registrations")
      .update({ canceled_at: new Date().toISOString() })
      .eq("id", registrationId)
      .eq("user_id", userId)
      .is("canceled_at", null)
  );
}
