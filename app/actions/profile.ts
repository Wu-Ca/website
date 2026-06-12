"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { updateProfileDisplayName } from "@/lib/db";

export type ProfileFormState =
  | { error?: string; saved?: boolean }
  | undefined;

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await requireUser("/profile");
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (displayName.length > 80) {
    return { error: "Display name must be 80 characters or fewer." };
  }

  await updateProfileDisplayName(user.id, displayName || null);
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { saved: true };
}
