"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  createOrganization as createOrganizationDb,
  createOrgEvent as createOrgEventDb,
  getOrganizationByOwner,
  getOrgEventById,
  setOrgEventCanceled,
} from "@/lib/db";
import { BOROUGHS, BOROUGH_CENTERS } from "@/lib/utils";
import { CATEGORIES } from "@/lib/categories";
import type { Borough, Category, Event } from "@/lib/types";

export type OrgFormState = { errors?: Record<string, string> } | undefined;

export async function createOrganization(
  _prev: OrgFormState,
  formData: FormData
): Promise<OrgFormState> {
  const user = await requireUser("/org");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  let website = String(formData.get("website") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const address = String(formData.get("address") ?? "").trim();

  const errors: Record<string, string> = {};
  if (name.length < 2) {
    errors.name = "Organization name must be at least 2 characters.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a contact email for your organization.";
  }
  if (website) {
    if (!/^https?:\/\//i.test(website)) website = `https://${website}`;
    try {
      new URL(website);
    } catch {
      errors.website = "Enter a valid website URL, or leave it blank.";
    }
  }
  if (phone && !/^[\d\s()+.-]{7,20}$/.test(phone)) {
    errors.phone = "Enter a valid phone number, or leave it blank.";
  }
  if (Object.keys(errors).length > 0) {
    return { errors };
  }
  if (await getOrganizationByOwner(user.id)) {
    return { errors: { name: "You already manage an organization." } };
  }

  await createOrganizationDb({
    name,
    description,
    website: website || null,
    phone: phone || null,
    email,
    address: address || null,
    ownerUserId: user.id,
  });
  revalidatePath("/org");
  return undefined;
}

export type EventFormState =
  | { errors?: Record<string, string>; values?: Record<string, string> }
  | undefined;

export async function createOrgEvent(
  _prev: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const user = await requireUser("/org/events/new");
  const org = await getOrganizationByOwner(user.id);
  if (!org) redirect("/org");

  const values = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    date: String(formData.get("date") ?? "").trim(),
    startTime: String(formData.get("startTime") ?? "").trim(),
    endTime: String(formData.get("endTime") ?? "").trim(),
    venueName: String(formData.get("venueName") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    borough: String(formData.get("borough") ?? "").trim(),
    zip: String(formData.get("zip") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    cost: String(formData.get("cost") ?? "").trim(),
    contactEmail: String(formData.get("contactEmail") ?? "").trim(),
  };

  const errors: Record<string, string> = {};
  if (values.title.length < 3) errors.title = "Title must be at least 3 characters.";
  if (values.description.length < 10)
    errors.description = "Description must be at least 10 characters.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date)) {
    errors.date = "Please pick a date.";
  } else if (values.date < new Date().toISOString().slice(0, 10)) {
    errors.date = "Date can't be in the past.";
  }
  if (!/^\d{2}:\d{2}$/.test(values.startTime)) errors.startTime = "Pick a start time.";
  if (!/^\d{2}:\d{2}$/.test(values.endTime)) {
    errors.endTime = "Pick an end time.";
  } else if (values.startTime && values.endTime <= values.startTime) {
    errors.endTime = "End time must be after the start time.";
  }
  if (!values.venueName) errors.venueName = "Venue name is required.";
  if (!values.address) errors.address = "Address is required.";
  if (!(BOROUGHS as readonly string[]).includes(values.borough))
    errors.borough = "Pick a borough.";
  if (!/^\d{5}$/.test(values.zip)) errors.zip = "Enter a 5-digit ZIP code.";
  if (!CATEGORIES.some((c) => c.value === values.category))
    errors.category = "Pick a category.";
  let cost: "Free" | number = "Free";
  if (values.cost) {
    const parsed = Number(values.cost);
    if (!Number.isFinite(parsed) || parsed < 0) {
      errors.cost = "Cost must be a positive number, or blank for free.";
    } else if (parsed > 0) {
      cost = parsed;
    }
  }
  if (values.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail))
    errors.contactEmail = "Enter a valid email, or leave blank.";

  if (Object.keys(errors).length > 0) {
    return { errors, values };
  }

  const borough = values.borough as Borough;
  const center = BOROUGH_CENTERS[borough];
  const event: Event = {
    id: `org-${randomUUID().slice(0, 8)}`,
    title: values.title,
    description: values.description,
    source: "COMMUNITY",
    venue: {
      name: values.venueName,
      address: values.address,
      borough,
      zip: values.zip,
      lat: center.lat,
      lng: center.lng,
    },
    date: values.date,
    startTime: values.startTime,
    endTime: values.endTime,
    cost,
    category: values.category as Category,
    contactEmail: values.contactEmail || undefined,
    isCanceled: false,
    sourceEventId: `org-${org.id}`,
    interestedCount: 0,
    organizationId: org.id,
  };
  await createOrgEventDb(event);

  revalidatePath("/");
  revalidatePath("/org");
  redirect("/org");
}

async function setCanceled(formData: FormData, isCanceled: boolean): Promise<void> {
  const user = await requireUser("/org");
  const org = await getOrganizationByOwner(user.id);
  const eventId = String(formData.get("eventId") ?? "");
  const event = await getOrgEventById(eventId);
  if (!org || !event || event.organizationId !== org.id) return;

  await setOrgEventCanceled(eventId, isCanceled);
  revalidatePath("/");
  revalidatePath("/org");
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/dashboard");
}

export async function cancelOrgEvent(formData: FormData): Promise<void> {
  await setCanceled(formData, true);
}

export async function restoreOrgEvent(formData: FormData): Promise<void> {
  await setCanceled(formData, false);
}
