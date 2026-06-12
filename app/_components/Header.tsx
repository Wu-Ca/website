import Link from "next/link";

export default function Header() {
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
        <nav className="flex items-center gap-4">
          <span className="text-xs text-stone-400 hidden sm:block">
            Free &amp; low-cost events at NYC libraries
          </span>
        </nav>
      </div>
    </header>
  );
}
