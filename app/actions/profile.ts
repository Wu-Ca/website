"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { updateProfileDetails } from "@/lib/db";
import { createAuthClient } from "@/lib/supabase/server";
import { BOROUGHS } from "@/lib/utils";

export type ProfileFormState =
  | { error?: string; saved?: boolean }
  | undefined;

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await requireUser("/profile");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const borough = String(formData.get("borough") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (displayName.length > 80) {
    return { error: "Display name must be 80 characters or fewer." };
  }
  if (phone && !/^[\d\s()+.-]{7,20}$/.test(phone)) {
    return { error: "Please enter a valid phone number, or leave it blank." };
  }
  if (borough && !(BOROUGHS as readonly string[]).includes(borough)) {
    return { error: "Please pick a borough from the list." };
  }
  if (bio.length > 500) {
    return { error: "About me must be 500 characters or fewer." };
  }

  await updateProfileDetails(user.id, {
    displayName: displayName || null,
    phone: phone || null,
    borough: borough || null,
    bio: bio || null,
  });
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export type PasswordFormState =
  | { error?: string; saved?: boolean }
  | undefined;

export async function changePassword(
  _prev: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  const user = await requireUser("/profile");
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword) {
    return { error: "Please enter your current password." };
  }
  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New passwords don't match." };
  }

  const supabase = await createAuthClient();

  // Re-verify the current password before allowing a change, so a stolen
  // open session can't silently take over the account.
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) {
    return { error: "Your current password is incorrect." };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    if (error.code === "same_password") {
      return { error: "New password must be different from the current one." };
    }
    console.error("Failed to change password:", error.message);
    return { error: "We couldn't change your password. Please try again." };
  }

  return { saved: true };
}
