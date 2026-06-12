"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Completes magic-link sign-ins that arrive with the session in the URL
 * fragment (`#access_token=...`) — the implicit flow used by our sign-in
 * emails. Fragments are only visible to the browser, so this runs on every
 * page: it persists the session into cookies, then refreshes so the server
 * sees the signed-in user. Also surfaces fragment-style auth errors
 * (expired/used links) on the login page.
 *
 * Renders nothing unless a sign-in is actually being completed.
 */
export default function AuthSessionRescue() {
  const router = useRouter();
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;

    if (hash.includes("error=")) {
      const params = new URLSearchParams(hash.slice(1));
      const code = params.get("error_code") ?? params.get("error") ?? "invalid-link";
      router.replace(`/login?error=${encodeURIComponent(code)}`);
      return;
    }

    if (!hash.includes("access_token")) return;
    setCompleting(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (!completing) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-50/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 bg-white rounded-2xl border border-stone-200 px-10 py-8">
        <span className="animate-spin text-2xl text-emerald-700">⟳</span>
        <p className="text-sm font-medium text-stone-700">Completing sign-in…</p>
      </div>
    </div>
  );
}
