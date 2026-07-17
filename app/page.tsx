"use client";

import React, { useEffect, useRef, useState } from "react";
import { TransitionLink } from "./components/PageTransition";
import { universities } from "./data/universities";

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
          padding: "7px 16px 7px 12px",
          borderRadius: 100,
          border: "1px solid rgba(255,255,255,0.18)",
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          opacity: 0,
          animation: "fadeIn 0.5s ease-out 0.15s forwards",
        }}>
          <span style={{ fontSize: 15, lineHeight: 1 }}>🎓</span>
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

        {/* Motto — the emphasized tagline */}
        <p style={{
          fontSize: "clamp(19px, 2.6vw, 28px)",
          fontWeight: 700,
          letterSpacing: "-0.5px",
          margin: 0,
          background: "linear-gradient(135deg, #ffffff 20%, rgba(167,139,250,0.9) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          opacity: 0,
          animation: "fadeUp 0.6s ease-out 0.55s forwards",
        }}>
          One click away from your future.
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
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 32px 80px" }}>
          <div className="reveal" style={{ marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", letterSpacing: "0.2em", textTransform: "uppercase" }}>How it works</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>
            <h2 style={{ fontSize: "clamp(38px, 5vw, 64px)", fontWeight: 800, margin: 0, letterSpacing: "-2px", lineHeight: 1.05, background: "linear-gradient(135deg, #ffffff 30%, rgba(167,139,250,0.85) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Core Features
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-2)", margin: "12px 0 0", lineHeight: 1.6, maxWidth: 500 }}>
              Everything you need to plan your move to Europe — in one place.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Find Your University column */}
            <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ borderRadius: 20, border: "1px solid rgba(52,211,153,0.25)", background: "rgba(52,211,153,0.06)", padding: "32px 32px 28px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgb(52,211,153)", letterSpacing: "0.18em", textTransform: "uppercase" }}>01</span>
                <h3 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px", margin: "12px 0 10px" }}>Find Your University</h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, margin: 0 }}>Browse 24+ European universities filtered by country, faculty and language. Each profile includes tuition fees, living costs, entry requirements and available programmes — everything in one place before you apply.</p>
                <TransitionLink href="/universities" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 20, fontSize: 13, fontWeight: 600, color: "rgb(52,211,153)", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>Explore universities →</TransitionLink>
              </div>
              {[
                { delay: "d1", accent: "rgba(52,211,153,0.3)", iconColor: "rgb(52,211,153)", bg: "rgba(52,211,153,0.1)", title: "Side-by-side Compare", desc: "Put two universities next to each other and compare tuition, living costs, teaching style and strengths at a glance.", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" stroke="rgb(52,211,153)" strokeWidth="2" strokeLinecap="round"/></svg> },
                { delay: "d2", accent: "rgba(167,139,250,0.3)", iconColor: "rgba(167,139,250,0.9)", bg: "rgba(167,139,250,0.1)", title: "AI Assistant", desc: "Ask anything — deadlines, required documents, language requirements, scholarship eligibility. Get instant, accurate answers.", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="rgba(167,139,250,0.9)"/></svg> },
                { delay: "d3", accent: "rgba(251,191,36,0.3)", iconColor: "rgba(251,191,36,0.9)", bg: "rgba(251,191,36,0.1)", title: "Costs & Application Requirements", desc: "Every university profile shows tuition fees, monthly living costs, required documents and language certificates — no more digging through official websites.", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="rgba(251,191,36,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              ].map(({ delay, accent, iconColor: _ic, bg, title, desc, icon }) => (
                <div key={title} className={`reveal ${delay}`} style={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", padding: "22px 24px", display: "flex", gap: 16, alignItems: "flex-start", transition: "border-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = accent)} onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
                  <div><div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>{title}</div><div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{desc}</div></div>
                </div>
              ))}
            </div>

            {/* Find Your Apartment column */}
            <div className="reveal reveal-d1" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ borderRadius: 20, border: "1px solid rgba(96,165,250,0.25)", background: "rgba(96,165,250,0.06)", padding: "32px 32px 28px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgb(96,165,250)", letterSpacing: "0.18em", textTransform: "uppercase" }}>02</span>
                <h3 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px", margin: "12px 0 10px" }}>Find Your Apartment</h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, margin: 0 }}>Housing is one of the biggest challenges for international students. Our AI guides you through the best platforms, average costs per city, student housing options and tips to avoid the most common scams.</p>
                <TransitionLink href="/housing" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 20, fontSize: 13, fontWeight: 600, color: "rgb(96,165,250)", textDecoration: "none" }} onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>Browse housing →</TransitionLink>
              </div>
              {[
                { delay: "d2", filters: null, title: "City Cost Guides", desc: "Average rent, utilities and transport costs for Amsterdam, Berlin, Paris, Barcelona and more — updated and broken down by neighbourhood." },
                { delay: "d3", filters: null, title: "Best Platforms by Country", desc: "Kamernet, HousingAnywhere, Uniplaces, student halls — we tell you which platforms work best in each country and what to watch out for." },
                { delay: "d4", filters: null, title: "Waiting Lists & Timelines", desc: "Student housing waiting lists can be 6–12 months. We tell you exactly when to register and how to maximise your chances of getting a room in time." },
                { delay: "d5", filters: ["City", "Budget", "Size", "Furnished", "Distance to uni"], title: "Find an Apartment — with Filters", desc: "Filter by city, budget, size, furnished/unfurnished and distance to university. We surface the right listings from trusted platforms." },
                { delay: "d6", filters: ["University", "Nationality", "Budget", "Lifestyle", "Language"], title: "Find a Roommate — with Filters", desc: "Splitting rent makes everything more affordable. Filter potential roommates by university, nationality, lifestyle habits and budget to find someone truly compatible." },
              ].map(({ delay, filters, title, desc }) => (
                <div key={title} className={`reveal ${delay}`} style={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", padding: "22px 24px", display: "flex", gap: 16, alignItems: "flex-start", transition: "border-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.3)")} onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(96,165,250,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="rgb(96,165,250)" strokeWidth="2"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>{title}</div>
                    <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{desc}</div>
                    {filters && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                        {filters.map(f => <span key={f} style={{ fontSize: 10, padding: "3px 9px", borderRadius: 99, border: "1px solid rgba(96,165,250,0.25)", color: "rgb(96,165,250)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>{f}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </>
  );
}
