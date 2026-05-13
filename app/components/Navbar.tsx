"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { TransitionLink } from "./PageTransition";

const SECTIONS = [
  {
    href: "/",
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
    href: "/compare",
    label: "Compare",
    step: "03",
    desc: "Place universities side-by-side to compare costs, programmes and living expenses.",
    accentRgb: "251,191,36",
  },
  {
    href: "/chat",
    label: "Chat AI",
    step: "04",
    desc: "Your personal AI assistant — ask anything about studying abroad in Europe.",
    accentRgb: "96,165,250",
  },
];

// ─── 3D tilt card ──────────────────────────────────────────────────────────
function NavCard({ section, index }: { section: typeof SECTIONS[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rgb = section.accentRgb;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    el.style.transition = "transform 0.06s ease";
    el.style.transform = `perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 12}deg) translateZ(16px)`;
  }

  function handleLeave() {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = "transform 0.55s cubic-bezier(0.22,1,0.36,1)";
    el.style.transform = "";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 48, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.96 }}
      transition={{ duration: 0.42, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <TransitionLink href={section.href} style={{ textDecoration: "none", display: "block" }}>
        <div
          ref={cardRef}
          style={{
            padding: "36px 32px",
            borderRadius: 22,
            border: `1px solid rgba(${rgb},0.3)`,
            background: `rgba(${rgb},0.07)`,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            minHeight: 230,
            cursor: "pointer",
            willChange: "transform",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = `rgba(${rgb},0.55)`;
            e.currentTarget.style.boxShadow = `0 0 40px rgba(${rgb},0.12)`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = `rgba(${rgb},0.3)`;
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10,
              color: `rgb(${rgb})`, letterSpacing: "0.12em", opacity: 0.75,
            }}>
              {section.step}
            </span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 13L13 3M13 3H5.5M13 3V10.5"
                stroke={`rgba(${rgb},0.5)`} strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 800,
              color: "var(--text-1)", margin: "0 0 14px",
              letterSpacing: "-0.8px", lineHeight: 1,
            }}>
              {section.label}
            </h2>
            <p style={{
              fontSize: 13, color: "var(--text-2)",
              lineHeight: 1.7, margin: 0,
            }}>
              {section.desc}
            </p>
          </div>

          {/* CTA */}
          <div style={{
            fontSize: 12, fontWeight: 600,
            color: `rgb(${rgb})`, opacity: 0.8,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            Explore <span style={{ fontSize: 15 }}>→</span>
          </div>
        </div>
      </TransitionLink>
    </motion.div>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [open, setOpen] = useState(false);
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

  const activeSection = SECTIONS.find(s =>
    s.href === "/" ? pathname === "/" : pathname.startsWith(s.href)
  );

  return (
    <>
      {/* ── Minimal top bar ─────────────────────────────────────── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
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
            U
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text-1)", letterSpacing: "-0.3px" }}>
            Unimate
          </span>
        </TransitionLink>

        {/* Center step indicator */}
        <AnimatePresence mode="wait">
          {!open && activeSection && (
            <motion.span
              key={activeSection.step}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute", left: "50%", transform: "translateX(-50%)",
                fontFamily: "var(--font-mono)", fontSize: 11,
                color: "var(--text-3)", letterSpacing: "0.12em",
                pointerEvents: "none",
              }}
            >
              {activeSection.step} / 04
            </motion.span>
          )}
        </AnimatePresence>

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
      </nav>

      {/* ── Full-screen navigation overlay ──────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
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
              padding: "80px 48px 48px",
              overflowY: "auto",
            }}
          >
            {/* Section label */}
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              style={{
                fontFamily: "var(--font-mono)", fontSize: 10,
                color: "var(--text-3)", letterSpacing: "0.18em",
                textTransform: "uppercase", margin: "0 auto 28px",
                maxWidth: 1100, width: "100%",
              }}
            >
              Navigate · Unimate
            </motion.p>

            {/* 4-card grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 14,
                maxWidth: 1100,
                margin: "0 auto",
                width: "100%",
              }}
            >
              {SECTIONS.map((section, i) => (
                <NavCard key={section.href} section={section} index={i} />
              ))}
            </div>

            {/* ESC hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.45 }}
              style={{
                textAlign: "center",
                marginTop: 44,
                fontFamily: "var(--font-mono)", fontSize: 10,
                color: "var(--text-3)", letterSpacing: "0.14em",
              }}
            >
              ESC TO CLOSE
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
