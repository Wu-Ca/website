import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Event, Organization, Registration, User } from "./types";

// Minimal JSON-file persistence for the MVP. Swap for a real database by
// reimplementing the exported functions — callers only see typed records.

export interface LoginToken {
  tokenHash: string;
  email: string;
  expiresAt: string;
  usedAt: string | null;
}

interface DbData {
  users: User[];
  organizations: Organization[];
  orgEvents: Event[];
  registrations: Registration[];
  loginTokens: LoginToken[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const EMPTY: DbData = {
  users: [],
  organizations: [],
  orgEvents: [],
  registrations: [],
  loginTokens: [],
};

function readDb(): DbData {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<DbData>) };
  } catch {
    return { ...EMPTY };
  }
}

function writeDb(data: DbData): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DB_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, DB_PATH);
}

// --- Users ---

export function getUserById(id: string): User | undefined {
  return readDb().users.find((u) => u.id === id);
}

export function findOrCreateUser(email: string): User {
  const db = readDb();
  const existing = db.users.find((u) => u.email === email);
  if (existing) return existing;
  const user: User = {
    id: randomUUID(),
    email,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  writeDb(db);
  return user;
}

// --- Login tokens (magic links) ---

export function createLoginToken(token: LoginToken): void {
  const db = readDb();
  const now = Date.now();
  // Prune expired tokens while we're here.
  db.loginTokens = db.loginTokens.filter(
    (t) => new Date(t.expiresAt).getTime() > now && !t.usedAt
  );
  db.loginTokens.push(token);
  writeDb(db);
}

/** Marks the token used and returns its email, or null if invalid/expired/used. */
export function consumeLoginToken(tokenHash: string): string | null {
  const db = readDb();
  const token = db.loginTokens.find((t) => t.tokenHash === tokenHash);
  if (!token || token.usedAt || new Date(token.expiresAt).getTime() < Date.now()) {
    return null;
  }
  token.usedAt = new Date().toISOString();
  writeDb(db);
  return token.email;
}

// --- Organizations ---

export function getOrganizationById(id: string): Organization | undefined {
  return readDb().organizations.find((o) => o.id === id);
}

export function getOrganizationByOwner(userId: string): Organization | undefined {
  return readDb().organizations.find((o) => o.ownerUserId === userId);
}

export function createOrganization(input: {
  name: string;
  description: string;
  ownerUserId: string;
}): Organization {
  const db = readDb();
  const org: Organization = {
    id: randomUUID(),
    name: input.name,
    description: input.description,
    ownerUserId: input.ownerUserId,
    createdAt: new Date().toISOString(),
  };
  db.organizations.push(org);
  writeDb(db);
  return org;
}

// --- Organization events ---

export function listAllOrgEvents(): Event[] {
  return readDb().orgEvents;
}

export function listOrgEvents(organizationId: string): Event[] {
  return readDb().orgEvents.filter((e) => e.organizationId === organizationId);
}

export function getOrgEventById(id: string): Event | undefined {
  return readDb().orgEvents.find((e) => e.id === id);
}

export function createOrgEvent(event: Event): Event {
  const db = readDb();
  db.orgEvents.push(event);
  writeDb(db);
  return event;
}

export function setOrgEventCanceled(id: string, isCanceled: boolean): void {
  const db = readDb();
  const event = db.orgEvents.find((e) => e.id === id);
  if (!event) return;
  event.isCanceled = isCanceled;
  writeDb(db);
}

// --- Registrations ---

export function getActiveRegistration(
  userId: string,
  eventId: string
): Registration | undefined {
  return readDb().registrations.find(
    (r) => r.userId === userId && r.eventId === eventId && !r.canceledAt
  );
}

export function listUserRegistrations(userId: string): Registration[] {
  return readDb().registrations.filter((r) => r.userId === userId && !r.canceledAt);
}

export function listEventRegistrations(eventId: string): Registration[] {
  return readDb().registrations.filter((r) => r.eventId === eventId && !r.canceledAt);
}

export function countEventRegistrations(eventId: string): number {
  return listEventRegistrations(eventId).length;
}

/** Creates a registration, reactivating a previously canceled one if present. */
export function upsertRegistration(userId: string, eventId: string): Registration {
  const db = readDb();
  const active = db.registrations.find(
    (r) => r.userId === userId && r.eventId === eventId && !r.canceledAt
  );
  if (active) return active;
  const registration: Registration = {
    id: randomUUID(),
    userId,
    eventId,
    createdAt: new Date().toISOString(),
    canceledAt: null,
  };
  db.registrations.push(registration);
  writeDb(db);
  return registration;
}

export function cancelRegistration(registrationId: string, userId: string): boolean {
  const db = readDb();
  const registration = db.registrations.find(
    (r) => r.id === registrationId && r.userId === userId && !r.canceledAt
  );
  if (!registration) return false;
  registration.canceledAt = new Date().toISOString();
  writeDb(db);
  return true;
}
