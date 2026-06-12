import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/actions/auth";

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-emerald-800 tracking-tight">
            CommonGround
          </span>
          <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
            NYC
          </span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-stone-600 hover:text-emerald-800"
              >
                My events
              </Link>
              <Link
                href="/org"
                className="text-sm font-medium text-stone-600 hover:text-emerald-800"
              >
                Organization
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium text-stone-600 hover:text-emerald-800"
              >
                {user.displayName ?? "Profile"}
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-sm font-medium text-stone-400 hover:text-stone-700"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-700 px-4 py-1.5 rounded-full transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
