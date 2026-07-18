"use client";

import React, { useEffect, useRef, useState } from "react";
import { TransitionLink } from "./components/PageTransition";
import { universities } from "./data/universities";

// Hero-only accent — a warm muted gold, distinct from the site's purple.
// Scoped to this file only so it doesn't touch Core Features or anywhere else.
const HERO_ACCENT = "201,163,92";

/* ─── Hero slideshow ──────────────────────────────── */
const ALL_SLIDES = [
  "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1516550893435-5b0e6bfe3bc1?auto=format&fit=crop&w=1920&q=80",
];


function HeroSlideshow() {
  const [slides, setSlides] = useState(ALL_SLIDES);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  function handleError(failedSrc: string) {
    setSlides((prev) => {
      const next = prev.filter((s) => s !== failedSrc);
      return next.length > 0 ? next : prev;
    });
    setCurrent((p) => Math.max(0, p - 1));
  }

  if (slides.length === 0) return null;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
      <div style={{
        display: "flex",
        width: `${slides.length * 100}%`,
        height: "100%",
        transform: `translateX(-${(current * 100) / slides.length}%)`,
        transition: "transform 0.85s cubic-bezier(0.77, 0, 0.175, 1)",
        willChange: "transform",
      }}>
        {slides.map((src) => (
          <div key={src} style={{ width: `${100 / slides.length}%`, height: "100%", flexShrink: 0, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" aria-hidden="true"
              className="kenBurns-img"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={() => handleError(src)}
            />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.58)" }} />
    </div>
  );
}

/* ─── Intersection Observer hook ─────────────────── */
function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("is-visible"); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─── Animated headline ───────────────────────────── */
function AnimatedHeadline({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <span key={i} className="word-animate" style={{ animationDelay: `${i * 90}ms`, marginRight: i < words.length - 1 ? "0.28em" : 0 }}>
          {word}
        </span>
      ))}
    </>
  );
}

/* ─── 3D tilt helpers ─────────────────────────────── */
function onTiltMove(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
  const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
  el.style.transition = "transform 0.08s ease, border-color 0.2s ease, box-shadow 0.2s ease";
  el.style.transform = `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 10}deg) translateZ(12px)`;
}
function onTiltLeave(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  el.style.transition = "transform 0.55s cubic-bezier(0.22,1,0.36,1), border-color 0.2s ease, box-shadow 0.2s ease";
  el.style.transform = "";
}

/* ─── Main page ───────────────────────────────────── */
export default function Home() {
  const heroContentRef = useRef<HTMLDivElement>(null);
  useReveal();

  useEffect(() => {
    const handleScroll = () => {
      if (heroContentRef.current) {
        const progress = Math.min(window.scrollY / window.innerHeight, 1);
        heroContentRef.current.style.opacity = String(Math.max(0, 1 - progress * 2.2));
        heroContentRef.current.style.transform = `translateY(${-progress * 55}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Real numbers pulled straight from the data — no more placeholder "X"
  const totalUniversities = universities.length;
  const totalCountries = new Set(universities.map((u) => u.country)).size;
  const totalProgrammes = universities.reduce((sum, u) => sum + (u.bachelors?.length ?? 0), 0);
  const stats = [
    { value: `${totalUniversities}+`, label: "Universities" },
    { value: `${totalCountries}`, label: "Countries" },
    { value: `${totalProgrammes}+`, label: "Programmes" },
  ];

  return (
    <>
      {/* Fixed background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <HeroSlideshow />
      </div>

      {/* Fixed quick-action bar — Universities / Housing icons, up near the top */}
      <div style={{
        position: "fixed",
        top: 100,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        opacity: 0,
        animation: "fadeIn 0.5s ease-out 0.5s forwards",
        display: "flex",
        alignItems: "stretch",
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.22)",
        borderRadius: 100,
        padding: 5,
        gap: 4,
      }}>
        {[
          {
            label: "Universities",
            sub: "Browse 30+ unis across Europe",
            href: "/universities",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            ),
          },
          {
            label: "Housing",
            sub: "Rooms & roommates across Europe",
            href: "/housing",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            ),
          },
        ].map(({ label, sub, href, icon }, i) => (
          <React.Fragment key={href}>
            {i > 0 && (
              <div style={{
                width: 1,
                background: "rgba(255,255,255,0.15)",
                alignSelf: "stretch",
                margin: "8px 0",
              }} />
            )}
            <TransitionLink
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 24px",
                borderRadius: 100,
                color: "rgba(255,255,255,0.9)",
                textDecoration: "none",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {icon}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.2px", whiteSpace: "nowrap" }}>
                  {label}
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>
                  {sub}
                </span>
              </div>
              <span style={{ opacity: 0.35, fontSize: 16, marginLeft: 4 }}>→</span>
            </TransitionLink>
          </React.Fragment>
        ))}
      </div>

      {/* Hero */}
      <div
        ref={heroContentRef}
        style={{
          position: "relative",
          height: "100svh",
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "80px 32px 40px",
          gap: 20,
        }}
      >
        {/* Badge — made by students, for students */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 14px 7px 11px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.16)",
          background: "rgba(255,255,255,0.04)",
          opacity: 0,
          animation: "fadeIn 0.5s ease-out 0.15s forwards",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={`rgb(${HERO_ACCENT})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.02em", color: "rgba(255,255,255,0.85)" }}>
            Made by students, for students
          </span>
        </div>

        <h1 style={{
          fontSize: "clamp(44px, 7vw, 88px)",
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: "-2px",
          color: "var(--text-1)",
          margin: 0,
          maxWidth: 900,
        }}>
          <AnimatedHeadline text="The Hub for International Students." />
        </h1>

        {/* Motto — the emphasized tagline (solid color, no gradient-text) */}
        <p style={{
          fontSize: "clamp(19px, 2.6vw, 28px)",
          fontWeight: 700,
          letterSpacing: "-0.5px",
          margin: 0,
          color: "rgba(255,255,255,0.92)",
          opacity: 0,
          animation: "fadeUp 0.6s ease-out 0.55s forwards",
        }}>
          One click away from your <span style={{ color: `rgb(${HERO_ACCENT})` }}>future</span>.
        </p>

        <p style={{
          fontSize: "clamp(15px, 1.8vw, 19px)",
          color: "rgba(237,237,237,0.65)",
          lineHeight: 1.7,
          maxWidth: 480,
          margin: 0,
          opacity: 0,
          animation: "fadeUp 0.6s ease-out 0.8s forwards",
        }}>
          Find your university, compare costs, and make your move — Europe is closer than you think.
        </p>

        {/* Stats — real numbers pulled from our data */}
        <div style={{
          display: "flex",
          gap: 48,
          flexWrap: "wrap",
          justifyContent: "center",
          opacity: 0,
          animation: "fadeUp 0.6s ease-out 1.05s forwards",
          marginTop: 4,
        }}>
          {stats.map(({ value, label }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px" }}>{value}</span>
              <span className="label" style={{ color: "rgba(255,255,255,0.75)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Core Features — comes first ───────────────── */}
      <div style={{
        position: "relative",
        zIndex: 10,
        background: "var(--bg)",
        borderRadius: "28px 28px 0 0",
        boxShadow: "0 -28px 80px rgba(0,0,0,0.9), 0 -1px 0 rgba(255,255,255,0.07)",
      }}>
        <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, margin: "16px auto 0" }} />

        {/* CORE FEATURES CONTENT — inline below the handle */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 32px 88px" }}>
          {/* Header — plain heading, one word per feature highlighted in its own color, no eyebrow tag, no gradient-text */}
          <div className="reveal" style={{ marginBottom: 64, maxWidth: 620 }}>
            <h2 style={{ fontSize: "clamp(32px, 4.2vw, 48px)", fontWeight: 800, margin: 0, letterSpacing: "-1.3px", lineHeight: 1.15, color: "var(--text-1)" }}>
              Two things stand between you and studying abroad: <span style={{ color: "rgb(52,211,153)" }}>the right school</span>, and <span style={{ color: "rgb(96,165,250)" }}>somewhere to live</span>.
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-2)", margin: "16px 0 0", lineHeight: 1.7, maxWidth: 460 }}>
              Unimate handles both — real listings, real numbers, no guesswork.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>
            {/* Find Your University column */}
            <div className="reveal">
              <div style={{ borderLeft: "2px solid rgb(52,211,153)", paddingLeft: 20, marginBottom: 8 }}>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.4px", margin: "0 0 8px" }}>Find Your University</h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, margin: 0 }}>Browse 24+ European universities filtered by country, faculty and language. Tuition fees, living costs, entry requirements and available programmes — before you apply.</p>
                <TransitionLink href="/universities" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16, fontSize: 13, fontWeight: 600, color: "rgb(52,211,153)", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>Explore universities →</TransitionLink>
              </div>
              <div>
                {[
                  { title: "Side-by-side Compare", desc: "Put two universities next to each other and compare tuition, living costs, teaching style and strengths at a glance." },
                  { title: "AI Assistant", desc: "Ask anything — deadlines, required documents, language requirements, scholarship eligibility. Get instant, accurate answers." },
                  { title: "Costs & Application Requirements", desc: "Every university profile shows tuition fees, monthly living costs, required documents and language certificates — no more digging through official websites." },
                ].map(({ title, desc }) => (
                  <div key={title} style={{ padding: "18px 0", borderTop: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>{title}</div>
                    <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Find Your Apartment column */}
            <div className="reveal reveal-d1">
              <div style={{ borderLeft: "2px solid rgb(96,165,250)", paddingLeft: 20, marginBottom: 8 }}>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.4px", margin: "0 0 8px" }}>Find Your Apartment</h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, margin: 0 }}>Housing is one of the biggest challenges for international students. Best platforms, average costs per city, student housing options and how to avoid the common scams.</p>
                <TransitionLink href="/housing" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16, fontSize: 13, fontWeight: 600, color: "rgb(96,165,250)", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>Browse housing →</TransitionLink>
              </div>
              <div>
                {[
                  { filters: null, title: "City Cost Guides", desc: "Average rent, utilities and transport costs for Amsterdam, Berlin, Paris, Barcelona and more — updated and broken down by neighbourhood." },
                  { filters: null, title: "Best Platforms by Country", desc: "Kamernet, HousingAnywhere, Uniplaces, student halls — we tell you which platforms work best in each country and what to watch out for." },
                  { filters: null, title: "Waiting Lists & Timelines", desc: "Student housing waiting lists can be 6–12 months. We tell you exactly when to register and how to maximise your chances of getting a room in time." },
                  { filters: ["City", "Budget", "Size", "Furnished", "Distance to uni"], title: "Find an Apartment — with Filters", desc: "Filter by city, budget, size, furnished/unfurnished and distance to university. We surface the right listings from trusted platforms." },
                  { filters: ["University", "Nationality", "Budget", "Lifestyle", "Language"], title: "Find a Roommate — with Filters", desc: "Splitting rent makes everything more affordable. Filter potential roommates by university, nationality, lifestyle habits and budget to find someone truly compatible." },
                ].map(({ filters, title, desc }) => (
                  <div key={title} style={{ padding: "18px 0", borderTop: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>{title}</div>
                    <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{desc}</div>
                    {filters && (
                      <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 8 }}>
                        {filters.join(" · ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

    </>
  );
}
