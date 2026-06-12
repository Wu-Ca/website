import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  return url;
}

export function getSupabaseAnonKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY;
  if (!key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.");
  return key;
}

/**
 * Cookie-bound client for auth (sign in, get current user). Use from
 * Server Components, Server Actions, and Route Handlers.
 *
 * `flowType: "implicit"` makes magic links carry the session in the URL
 * fragment, completed client-side by AuthSessionRescue. Unlike the default
 * PKCE flow it requires no verifier cookie, so links work from any browser,
 * device, or domain alias.
 */
export async function createAuthClient(options?: {
  flowType?: "pkce" | "implicit";
}): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: options?.flowType ? { flowType: options.flowType } : undefined,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — session refresh is handled
          // by proxy.ts, so writes can be safely ignored here.
        }
      },
    },
  });
}

/**
 * Service-role client for application data. RLS locks the tables down to
 * everyone else; every caller in lib/db.ts is reached only through
 * auth-checked code paths (see lib/auth.ts and the server actions).
 * Server-only — never expose this client or its key to the browser.
 */
export function createServiceClient(): SupabaseClient {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
  return createClient(getSupabaseUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
