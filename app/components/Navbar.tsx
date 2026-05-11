"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/",            label: "News" },
  { href: "/universities",label: "Universities" },
  { href: "/compare",     label: "Compare" },
  { href: "/chat",        label: "Chat AI" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 60,
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
        background: scrolled ? "rgba(10,10,10,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        transition: "background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "var(--text-1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--bg)", fontWeight: 800, fontSize: 14, flexShrink: 0,
            transition: "transform 0.2s ease",
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            U
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text-1)", letterSpacing: "-0.3px" }}>
            Unimate
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 3, border: "1px solid var(--border)" }}>
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: "6px 16px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: isActive(href) ? 600 : 400,
                textDecoration: "none",
                color: isActive(href) ? "var(--bg)" : "var(--text-2)",
                background: isActive(href) ? "var(--text-1)" : "transparent",
                transition: "all 0.15s ease",
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/chat"
          className="btn-primary"
          style={{ padding: "7px 18px", fontSize: 13 }}
        >
          Get started
        </Link>
      </div>
    </nav>
  );
}
