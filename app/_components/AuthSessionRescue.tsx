"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Recovers magic-link sign-ins that land with the session in the URL
 * fragment (`#access_token=...`). That happens when Supabase falls back to
 * the implicit flow — e.g. the redirect URL wasn't in the allowlist and the
 * user was sent to the Site URL instead. Servers never see URL fragments,
 * so without this the user looks signed out despite a successful sign-in.
 *
 * The browser client (cookie-based via @supabase/ssr) detects the fragment,
 * persists the session into cookies, and we refresh so the server picks
 * it up. Renders nothing and does nothing when no fragment is present.
 */
export default function AuthSessionRescue() {
  const router = useRouter();

  useEffect(() => {
    if (!window.location.hash.includes("access_token")) return;

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

  return null;
}
