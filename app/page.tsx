"use client";

import { useState, useEffect, useRef } from "react";

/* ─── Hero slideshow ──────────────────────────────── */
const ALL_SLIDES = [
  "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1920&q=80", // grand library wooden desks
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1920&q=80", // library tall bookshelves
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80", // university lecture hall
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1920&q=80", // amphitheatre lecture hall
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1920&q=80", // university hallway arches
  "https://images.unsplash.com/photo-1571167366136-b57e03af7a98?auto=format&fit=crop&w=1920&q=80", // campus at dusk
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
          <div key={src} style={{ width: `${100 / slides.length}%`, height: "100%", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" aria-hidden="true"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={() => handleError(src)}
            />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.62)" }} />
    </div>
  );
}
import Link from "next/link";
import { news, newsCountries, newsTags, NewsItem } from "./data/news";


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
        <span
          key={i}
          className="word-animate"
          style={{ animationDelay: `${i * 90}ms` }}
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </>
  );
}

/* ─── Counter ─────────────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const dur = 1200;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          setVal(Math.round(ease * to));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [to]);

  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─── Featured card ───────────────────────────────── */
function FeaturedCard({ item }: { item: NewsItem }) {
  return (
    <div
      className="reveal"
      style={{
        position: "relative",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: "var(--surface)",
        transition: "border-color 0.2s ease",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      {/* Image */}
      <div style={{ aspectRatio: "21/9", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease", display: "block" }}
          onMouseEnter={e => ((e.target as HTMLImageElement).style.transform = "scale(1.04)")}
          onMouseLeave={e => ((e.target as HTMLImageElement).style.transform = "scale(1)")}
        />
      </div>

      {/* Gradient overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)", pointerEvents: "none" }} />

      {/* Content */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "32px 36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ padding: "3px 10px", borderRadius: 5, background: "var(--text-1)", color: "var(--bg)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Featured
          </span>
          <span style={{ padding: "3px 10px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.15)", color: "var(--text-2)", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {item.tag}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 12, color: "var(--text-2)" }}>
          {item.university && <span style={{ color: "rgba(237,237,237,0.7)", fontWeight: 500 }}>{item.university}</span>}
          <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 11 }}>{item.date}</span>
        </div>

        <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, color: "var(--text-1)", lineHeight: 1.3, marginBottom: 12, letterSpacing: "-0.3px", maxWidth: 680 }}>
          {item.title}
        </h2>

        <p style={{ fontSize: 14, color: "rgba(237,237,237,0.55)", marginBottom: 24, lineHeight: 1.7, maxWidth: 560, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.summary}
        </p>

        <Link href={`/chat?news=${encodeURIComponent(item.title)}`} className="btn-primary" style={{ fontSize: 13 }}>
          Ask AI about this
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
      </div>
    </div>
  );
}

/* ─── News card ───────────────────────────────────── */
function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  return (
    <div
      className={`card reveal reveal-d${Math.min(index + 1, 6)}`}
      style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      {/* Image */}
      <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", display: "block" }}
          onMouseEnter={e => ((e.target as HTMLImageElement).style.transform = "scale(1.06)")}
          onMouseLeave={e => ((e.target as HTMLImageElement).style.transform = "scale(1)")}
        />
      </div>

      {/* Body */}
      <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ padding: "3px 9px", borderRadius: 5, border: "1px solid var(--border)", color: "var(--text-3)", fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {item.tag}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)" }}>{item.date}</span>
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", lineHeight: 1.45, letterSpacing: "-0.2px", margin: 0, flex: 1 }}>
          {item.title}
        </h3>

        <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.summary}
        </p>

        <Link
          href={`/chat?news=${encodeURIComponent(item.title)}`}
          style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, marginTop: 4, transition: "color 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-2)")}
        >
          Explore details <span>→</span>
        </Link>
      </div>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────── */
export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedTag, setSelectedTag] = useState("All");
  useReveal();

  const filtered = news.filter((n) => {
    const matchCountry = selectedCountry === "all" || n.country === selectedCountry;
    const matchTag = selectedTag === "All" || n.tag === selectedTag;
    return matchCountry && matchTag;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <>
      {/* ── Hero — full viewport width ─────────────── */}
      <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--border)" }}>
        <HeroSlideshow />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "88px 32px 72px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 760 }}>

          <span className="label" style={{ color: "var(--accent)" }}>
            Unimate · Study Abroad Intelligence
          </span>

          <h1 style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            color: "var(--text-1)",
            margin: 0,
          }}>
            <AnimatedHeadline text="The Hub for International Students." />
          </h1>

          <p style={{ fontSize: "clamp(15px, 1.8vw, 18px)", color: "var(--text-2)", lineHeight: 1.7, maxWidth: 520, margin: 0, opacity: 0, animation: "fadeUp 0.6s ease-out 0.7s forwards" }}>
            Admissions, scholarships, housing and visa news — curated for students moving to Europe.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", opacity: 0, animation: "fadeUp 0.6s ease-out 0.9s forwards" }}>
            <Link href="/universities" className="btn-primary">
              Browse universities
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <Link href="/chat" className="btn-ghost">
              Ask AI assistant
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          display: "flex", gap: 48, marginTop: 60, flexWrap: "wrap",
          opacity: 0, animation: "fadeUp 0.6s ease-out 1.1s forwards",
        }}>
          {[
            { value: 24, suffix: "+", label: "Universities" },
            { value: 12, suffix: "", label: "Countries" },
            { value: 8, suffix: "", label: "Faculties" },
          ].map(({ value, suffix, label }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px", fontVariantNumeric: "tabular-nums" }}>
                <Counter to={value} suffix={suffix} />
              </span>
              <span className="label">{label}</span>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* ── Rest of page ───────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 80px" }}>

      {/* ── Filters ────────────────────────────────── */}
      <section style={{ padding: "32px 0 24px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Countries */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span className="label" style={{ marginRight: 8, flexShrink: 0 }}>Country</span>
          {newsCountries.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelectedCountry(c.code)}
              className={`pill${selectedCountry === c.code ? " active" : ""}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span className="label" style={{ marginRight: 8, flexShrink: 0 }}>Topic</span>
          {newsTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`pill${selectedTag === tag ? " active" : ""}`}
            >
              {tag === "All" ? "All topics" : tag}
            </button>
          ))}
        </div>
      </section>

      {/* ── Content ────────────────────────────────── */}
      <section style={{ paddingTop: 48, display: "flex", flexDirection: "column", gap: 48 }}>

        {filtered.length === 0 && (
          <div style={{ padding: "80px 0", textAlign: "center", color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
            No news found for these filters.
          </div>
        )}

        {featured && <FeaturedCard item={featured} />}

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
        }}>
          {rest.map((item, i) => (
            <NewsCard key={item.id} item={item} index={i % 6} />
          ))}
        </div>
      </section>
      </div>
    </>
  );
}
