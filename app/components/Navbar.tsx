"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "News" },
  { href: "/universities", label: "Universities" },
  { href: "/compare", label: "Compare" },
  { href: "/chat", label: "Chat AI" },
];

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 h-16 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-bold text-lg transition-transform group-hover:scale-105">
            U
          </div>
          <span className="font-semibold text-lg tracking-tight">Unimate</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(href)
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <Link
          href="/chat"
          className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold transition-all hover:bg-zinc-200 active:scale-95"
        >
          Get started
        </Link>
      </div>
    </nav>
  );
}
