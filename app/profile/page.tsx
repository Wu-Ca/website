import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/db";
import { BOROUGHS } from "@/lib/utils";
import Header from "@/app/_components/Header";
import ProfileForm from "./ProfileForm";
import ChangePasswordForm from "./ChangePasswordForm";

export const metadata: Metadata = {
  title: "My profile — CommonGround NYC",
};

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const profile = await getProfile(user.id);

  return (
    <>
      <Header />
      <main className="flex-1 bg-stone-50">
        <div className="max-w-md mx-auto px-4 py-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-5"
          >
            <span>←</span>
            <span>My events</span>
          </Link>
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8">
            <h1 className="text-xl font-bold text-stone-900">My profile</h1>
            <p className="mt-1 text-sm text-stone-500">
              Your display name is shown to organizations when you register
              for their events.
            </p>
            <ProfileForm
              email={user.email}
              boroughs={BOROUGHS}
              initialDisplayName={profile?.displayName ?? ""}
              initialPhone={profile?.phone ?? ""}
              initialBorough={profile?.borough ?? ""}
              initialBio={profile?.bio ?? ""}
            />
          </div>
          <div className="mt-6 bg-white rounded-2xl border border-stone-200 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-stone-900">
              Change password
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Pick a new password for signing in. You&apos;ll need your
              current one to confirm.
            </p>
            <ChangePasswordForm />
          </div>
          <p className="mt-4 text-xs text-stone-400 text-center">
            Member since{" "}
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </main>
    </>
  );
}
