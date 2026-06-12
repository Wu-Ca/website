"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getEvent } from "@/lib/events";
import {
  upsertRegistration,
  cancelRegistration as cancelRegistrationDb,
} from "@/lib/db";

export async function registerForEvent(formData: FormData): Promise<void> {
  const eventId = String(formData.get("eventId") ?? "");
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/events/${eventId}`)}`);
  }

  const event = getEvent(eventId);
  if (!event || event.isCanceled) return;

  upsertRegistration(user.id, eventId);
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/dashboard");
  revalidatePath("/org");
}

export async function cancelRegistration(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const registrationId = String(formData.get("registrationId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  cancelRegistrationDb(registrationId, user.id);

  if (eventId) revalidatePath(`/events/${eventId}`);
  revalidatePath("/dashboard");
  revalidatePath("/org");
}
