"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { TransitionLink, usePageTransition } from "./PageTransition";

const SECTIONS = [
  {
    href: "/news",
    label: "News",
    step: "01",
    desc: "Latest admissions, scholarships and visa news curated for students moving to Europe.",
    accentRgb: "167,139,250",
  },
  {
    href: "/universities",
    label: "Universities",
    step: "02",
    desc: "Browse and filter 24+ universities across 12 European countries by tuition and faculty.",
    accentRgb: "52,211,153",
  },
  {
    href: "/housing",
    label: "Housing",
    step: "03",
    desc: "Find apartments and roommates across Europe — filtered by city, budget and move-in date.",
    accentRgb: "96,165,250",
  },
  {
    href: "/compare",
    label: "Compare",
    step: "04",
    desc: "Place universities side-by-side to compare costs, programmes and living expenses.",
    accentRgb: "251,191,36",
  },
  {
    href: "/chat",
    label: "Chat AI",
    step: "05",
    desc: "Your personal AI assistant — ask anything about studying abroad in Europe.",
    accentRgb: "167,139,250",
  },
];

// ─── Nav row item ───────────────────────────────────────────────────────────
function NavCard({ section, index, onNavigate }: { section: typeof SECTIONS[0]; index: number; onNavigate: (href: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const rgb = section.accentRgb;

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.32, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        onClick={() => onNavigate(section.href)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
          width: "100%",
          padding: "22px 0",
          background: "none",
          border: "none",
          borderBottom: "1px solid var(--border)",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
          transition: "gap 0.2s ease",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Step number */}
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 11,
          color: hovered ? `rgb(${rgb})` : "var(--text-3)",
          letterSpacing: "0.14em", flexShrink: 0, width: 28,
          transition: "color 0.2s",
        }}>
          {section.step}
        </span>

        {/* Label */}
        <span style={{
          fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 800,
          color: hovered ? `rgb(${rgb})` : "var(--text-1)",
          letterSpacing: "-1.5px", lineHeight: 1,
          transition: "color 0.2s",
          flex: 1,
        }}>
          {section.label}
        </span>

        {/* Description — visible on hover */}
        <span style={{
          fontSize: 13, color: "var(--text-2)",
          lineHeight: 1.6, maxWidth: 260, textAlign: "right",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(12px)",
          transition: "opacity 0.2s, transform 0.2s",
        }}>
          {section.desc}
        </span>

        {/* Arrow */}
        <span style={{
          fontSize: 20,
          color: hovered ? `rgb(${rgb})` : "var(--text-3)",
          transform: hovered ? "translateX(4px)" : "translateX(0)",
          transition: "color 0.2s, transform 0.2s",
          flexShrink: 0,
        }}>→</span>
      </button>
    </motion.div>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { go } = usePageTransition();
  const pathname = usePathname();

  // Close when route changes
  useEffect(() => { setOpen(false); }, [pathname]);

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock scroll while menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);


  return (
    <>
      {/* ── Minimal top bar ─────────────────────────────────────── */}
      <nav
        style={{
          position: "sticky",
          top: 36,
          zIndex: 1000,
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          background: open ? "transparent" : "rgba(10,10,10,0.88)",
          backdropFilter: open ? "none" : "blur(16px)",
          WebkitBackdropFilter: open ? "none" : "blur(16px)",
          borderBottom: `1px solid ${open ? "transparent" : "var(--border)"}`,
          transition: "background 0.25s ease, border-color 0.25s ease",
        }}
      >
        {/* Logo */}
        <TransitionLink
          href="/"
          style={{
            display: "flex", alignItems: "center", gap: 10,
            textDecoration: "none", position: "relative", zIndex: 1001,
          }}
        >
          <div
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: "var(--text-1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--bg)", fontWeight: 800, fontSize: 14, flexShrink: 0,
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1) rotate(-4deg)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "")}
          >
            4
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text-1)", letterSpacing: "-0.3px" }}>
            4UNI
          </span>
        </TransitionLink>


        {/* Right side: menu toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative", zIndex: 1001 }}>
          {/* Menu toggle */}
          <button
          onClick={() => setOpen(v => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          style={{
            position: "relative", zIndex: 1001,
            display: "flex", alignItems: "center", gap: 10,
            background: "transparent",
            border: `1px solid ${open ? "rgba(255,255,255,0.14)" : "var(--border)"}`,
            borderRadius: 8, padding: "7px 16px",
            cursor: "pointer",
            color: open ? "var(--text-1)" : "var(--text-2)",
            fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
            fontFamily: "inherit",
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
            e.currentTarget.style.color = "var(--text-1)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = open ? "rgba(255,255,255,0.14)" : "var(--border)";
            e.currentTarget.style.color = open ? "var(--text-1)" : "var(--text-2)";
          }}
        >
          {/* Hamburger icon */}
          <div style={{ width: 18, height: 13, position: "relative", flexShrink: 0 }}>
            <motion.span
              animate={{ rotate: open ? 45 : 0, y: open ? 6 : 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute", top: 0, left: 0, right: 0,
                height: 1.5, background: "currentColor", borderRadius: 1,
                transformOrigin: "center", display: "block",
              }}
            />
            <motion.span
              animate={{ opacity: open ? 0 : 1, scaleX: open ? 0.5 : 1 }}
              transition={{ duration: 0.18 }}
              style={{
                position: "absolute", top: 5.5, left: 0, right: 0,
                height: 1.5, background: "currentColor", borderRadius: 1,
                display: "block",
              }}
            />
            <motion.span
              animate={{ rotate: open ? -45 : 0, y: open ? -6 : 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: 1.5, background: "currentColor", borderRadius: 1,
                transformOrigin: "center", display: "block",
              }}
            />
          </div>

          {/* Label */}
          <motion.span
            key={open ? "close" : "menu"}
            initial={{ opacity: 0, y: open ? 6 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16 }}
          >
            {open ? "CLOSE" : "MENU"}
          </motion.span>
          </button>
        </div>
      </nav>

      {/* ── Full-screen navigation overlay ──────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999,
              background: "rgba(6,6,6,0.97)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "80px 64px 64px",
              overflowY: "auto",
            }}
          >
            <div style={{ maxWidth: 1000, width: "100%", margin: "0 auto" }}>
              {/* Label */}
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.04 }}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: "var(--text-3)", letterSpacing: "0.18em",
                  textTransform: "uppercase", margin: "0 0 8px",
                }}
              >
                Navigate · 4UNI
              </motion.p>

              {/* Nav rows */}
              <div>
                {SECTIONS.map((section, i) => (
                  <NavCard
                    key={section.href}
                    section={section}
                    index={i}
                    onNavigate={(href) => {
                      setOpen(false);
                      go(href);
                    }}
                  />
                ))}
              </div>

              {/* ESC hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.38 }}
                style={{
                  marginTop: 32,
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: "var(--text-3)", letterSpacing: "0.14em",
                }}
              >
                ESC TO CLOSE
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
