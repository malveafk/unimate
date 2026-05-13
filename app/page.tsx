"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { TransitionLink } from "./components/PageTransition";
import { news, newsCountries, newsTags, NewsItem } from "./data/news";

/* ─── Hero slideshow ──────────────────────────────── */
const ALL_SLIDES = [
  "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1571167366136-b57e03af7a98?auto=format&fit=crop&w=1920&q=80",
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
        <span
          key={i}
          className="word-animate"
          style={{ animationDelay: `${i * 90}ms` }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
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

/* ─── Quick-nav tile ─────────────────────────────── */
type NavTileItem = { href: string; label: string; step: string; hint: string; rgb: string };

function NavTile({ item }: { item: NavTileItem }) {
  const [hovered, setHovered] = useState(false);
  const [arrowHovered, setArrowHovered] = useState(false);

  return (
    <Link href={item.href} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          padding: "14px 20px",
          borderRadius: 14,
          border: `1px solid rgba(${item.rgb},${hovered ? 0.45 : 0.2})`,
          background: `rgba(${item.rgb},${hovered ? 0.14 : 0.07})`,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          minWidth: 130,
          textAlign: "left",
          cursor: "pointer",
          boxShadow: hovered
            ? `0 0 20px rgba(${item.rgb},0.2), 0 12px 40px rgba(${item.rgb},0.18)`
            : "none",
          transform: hovered ? "scale(1.03)" : "scale(1)",
          transition: "all 0.22s cubic-bezier(0.22,1,0.36,1)",
        }}
        onMouseMove={(e) => {
          if (!hovered) return;
          const el = e.currentTarget;
          const r = el.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
          const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
          el.style.transition = "transform 0.08s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.22s ease";
          el.style.transform = `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 10}deg) translateZ(12px) scale(1.03)`;
        }}
        onMouseEnter={() => { setHovered(true); setArrowHovered(true); }}
        onMouseLeave={(e) => {
          setHovered(false);
          setArrowHovered(false);
          const el = e.currentTarget;
          el.style.transition = "all 0.22s cubic-bezier(0.22,1,0.36,1)";
          el.style.transform = "";
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: `rgb(${item.rgb})`, letterSpacing: "0.12em", opacity: 0.8 }}>
          {item.step}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>
          {item.label}
        </span>
        <span style={{ fontSize: 11, color: "rgba(237,237,237,0.4)", display: "flex", alignItems: "center", gap: 2 }}>
          {item.hint}
          {" "}
          <span style={{
            display: "inline-block",
            transform: arrowHovered ? "translateX(4px)" : "translateX(0)",
            transition: "transform 0.2s ease",
          }}>
            →
          </span>
        </span>
      </div>
    </Link>
  );
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
        willChange: "transform",
      }}
      onMouseMove={onTiltMove}
      onMouseLeave={(e) => { onTiltLeave(e); e.currentTarget.style.borderColor = "var(--border)"; }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
    >
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

      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)", pointerEvents: "none" }} />

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

        <TransitionLink href={`/chat?news=${encodeURIComponent(item.title)}`} className="btn-primary" style={{ fontSize: 13 }}>
          Ask AI about this
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </TransitionLink>
      </div>
    </div>
  );
}

/* ─── News card ───────────────────────────────────── */
function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  return (
    <div
      className={`card reveal reveal-d${Math.min(index + 1, 6)}`}
      style={{ display: "flex", flexDirection: "column", overflow: "hidden", willChange: "transform" }}
      onMouseMove={onTiltMove}
      onMouseLeave={onTiltLeave}
    >
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

        <TransitionLink
          href={`/chat?news=${encodeURIComponent(item.title)}`}
          style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, marginTop: 4, transition: "color 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-2)")}
        >
          Explore details <span>→</span>
        </TransitionLink>
      </div>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────── */
export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedTag, setSelectedTag] = useState("All");
  const heroContentRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  useReveal();

  /* Scroll-driven hero parallax */
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      if (heroContentRef.current) {
        const progress = Math.min(scrollY / vh, 1);
        heroContentRef.current.style.opacity = String(Math.max(0, 1 - progress * 2.2));
        heroContentRef.current.style.transform = `translateY(${-progress * 55}px)`;
      }

      if (scrollIndicatorRef.current) {
        scrollIndicatorRef.current.style.opacity = String(Math.max(0, 1 - scrollY / 90));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filtered = news.filter((n) => {
    const matchCountry = selectedCountry === "all" || n.country === selectedCountry;
    const matchTag = selectedTag === "All" || n.tag === selectedTag;
    return matchCountry && matchTag;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <>
      {/* ── Fixed background only (no content, no pointer-event conflict) ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <HeroSlideshow />
      </div>

      {/* ── Hero content — normal document flow, fully interactive ────── */}
      {/* height:100svh replaces the old spacer div; position:relative lets  */}
      {/* the absolute scroll-indicator be anchored here instead of the      */}
      {/* fixed section. zIndex:5 puts this above the fixed bg (z:0) and    */}
      {/* below the news panel (z:10) so the panel slides over it correctly. */}
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
          gap: 24,
        }}
      >
        <span className="label" style={{ color: "var(--accent)", opacity: 0, animation: "fadeIn 0.5s ease-out 0.3s forwards" }}>
          Unimate · Study Abroad Intelligence
        </span>

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

        <p style={{
          fontSize: "clamp(15px, 1.8vw, 19px)",
          color: "rgba(237,237,237,0.65)",
          lineHeight: 1.7,
          maxWidth: 480,
          margin: 0,
          opacity: 0,
          animation: "fadeUp 0.6s ease-out 0.7s forwards",
        }}>
          Admissions, scholarships, housing and visa news — curated for students moving to Europe.
        </p>

        {/* Stats */}
        <div style={{
          display: "flex",
          gap: 48,
          flexWrap: "wrap",
          justifyContent: "center",
          opacity: 0,
          animation: "fadeUp 0.6s ease-out 1.1s forwards",
          marginTop: 8,
        }}>
          {[
            { value: 24, suffix: "+", label: "Universities" },
            { value: 12, suffix: "", label: "Countries" },
            { value: 8, suffix: "", label: "Faculties" },
          ].map(({ value, suffix, label }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px", fontVariantNumeric: "tabular-nums" }}>
                <Counter to={value} suffix={suffix} />
              </span>
              <span className="label">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Quick-nav destination tiles ───────────── */}
        <div style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "center",
          opacity: 0,
          animation: "fadeUp 0.6s ease-out 1.35s forwards",
          marginTop: 16,
        }}>
          {([
            { href: "/universities", label: "Universities", step: "02", hint: "24+ universities", rgb: "52,211,153" },
            { href: "/compare",      label: "Compare",      step: "03", hint: "Side by side",     rgb: "251,191,36" },
            { href: "/chat",         label: "Chat AI",      step: "04", hint: "AI assistant",     rgb: "96,165,250" },
          ] as NavTileItem[]).map((item) => (
            <NavTile key={item.href} item={item} />
          ))}
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollIndicatorRef}
          style={{
            position: "absolute",
            bottom: 36,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            opacity: 0,
            animation: "fadeIn 0.5s ease-out 1.6s forwards",
          }}
        >
          <span className="label" style={{ color: "rgba(255,255,255,0.35)" }}>scroll</span>
          <div className="scroll-chevron" />
        </div>
      </div>

      {/* ── News panel slides over the hero ──────────── */}
      <div style={{
        position: "relative",
        zIndex: 10,
        background: "var(--bg)",
        borderRadius: "28px 28px 0 0",
        boxShadow: "0 -28px 80px rgba(0,0,0,0.9), 0 -1px 0 rgba(255,255,255,0.07)",
      }}>
        {/* Drag handle */}
        <div style={{
          width: 40, height: 4,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 2,
          margin: "14px auto 0",
        }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 80px" }}>

          {/* ── Filters ────────────────────────────── */}
          <section style={{ padding: "28px 0 20px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 18 }}>
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

          {/* ── Content ────────────────────────────── */}
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
      </div>
    </>
  );
}
