import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getOrganizationByOwner } from "@/lib/db";
import Header from "@/app/_components/Header";
import EventForm from "./EventForm";

export const metadata: Metadata = {
  title: "Add event — CommonGround NYC",
};

export default async function NewEventPage() {
  const user = await requireUser("/org/events/new");
  const org = await getOrganizationByOwner(user.id);
  if (!org) redirect("/org");

  return (
    <>
      <Header />
      <main className="flex-1 bg-stone-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link
            href="/org"
            className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-5"
          >
            <span>←</span>
            <span>Organization dashboard</span>
          </Link>
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8">
            <h1 className="text-xl font-bold text-stone-900">Add an event</h1>
            <p className="mt-1 text-sm text-stone-500">
              Publish a new event for {org.name}. It will appear in the public
              event listings right away.
            </p>
            <EventForm />
          </div>
        </div>
      </main>
    </>
  );
}
