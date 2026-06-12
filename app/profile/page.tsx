import type { Metadata } from "next";
import Link from "next/link";
import { getOrigin, requireUser } from "@/lib/auth";
import { getOrganizationByOwner, getProfile } from "@/lib/db";
import { calendarSubscribeLinks } from "@/lib/calendar";
import { BOROUGHS } from "@/lib/utils";
import Header from "@/app/_components/Header";
import CalendarSyncCard from "@/app/_components/CalendarSyncCard";
import ProfileForm from "./ProfileForm";
import ChangePasswordForm from "./ChangePasswordForm";

export const metadata: Metadata = {
  title: "My profile — CommonGround NYC",
};

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const profile = await getProfile(user.id);
  const org = await getOrganizationByOwner(user.id);
  const origin = await getOrigin();

  const feedLinks = profile?.calendarToken
    ? calendarSubscribeLinks(
        `${origin}/calendar/me/${profile.calendarToken}`,
        "My CommonGround NYC events"
      )
    : null;

  return (
    <>
      <Header />
      <main className="flex-1 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-5"
          >
            <span>←</span>
            <span>My events</span>
          </Link>
          <div className="grid gap-6 lg:grid-cols-2 items-start">
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

            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8">
                <h2 className="text-lg font-bold text-stone-900">
                  Change password
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Pick a new password for signing in. You&apos;ll need your
                  current one to confirm.
                </p>
                <ChangePasswordForm />
              </div>

              {feedLinks && (
                <CalendarSyncCard
                  heading="Sync with your calendar"
                  description="Subscribe once and every event you register for shows up in Google, Apple, or Outlook calendar automatically."
                  feedUrl={feedLinks.feedUrl}
                  webcalUrl={feedLinks.webcal}
                  googleUrl={feedLinks.google}
                  outlookUrl={feedLinks.outlook}
                />
              )}

              <div className="bg-white rounded-xl border border-stone-200 p-5">
                <h2 className="text-base font-semibold text-stone-700">
                  {org ? org.name : "Run an organization?"}
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  {org
                    ? "Manage your organization's events, see who's registered, and share them."
                    : "Create an organization profile to publish your own events and track sign-ups."}
                </p>
                <Link
                  href="/org"
                  className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-900"
                >
                  {org
                    ? "Go to organization dashboard →"
                    : "Set up your organization →"}
                </Link>
              </div>
            </div>
          </div>
          <p className="mt-6 text-xs text-stone-400 text-center">
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
