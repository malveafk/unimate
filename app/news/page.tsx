"use client";

import React, { useEffect, useState } from "react";
import { TransitionLink } from "../components/PageTransition";
import { news, newsCountries, newsTags } from "../data/news";

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

export default function NewsPage() {
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedTag, setSelectedTag] = useState("All");
  useReveal();

  const filtered = news.filter((n) => {
    const matchCountry = selectedCountry === "all" || n.country === selectedCountry;
    const matchTag = selectedTag === "All" || n.tag === selectedTag;
    return matchCountry && matchTag;
  });
  const lead = filtered[0];
  const secondary = filtered.slice(1, 4);

  return (
    <div style={{ position: "relative", zIndex: 10, background: "var(--bg)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 32px 120px" }}>

        {/* Masthead */}
        <div className="reveal" style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", paddingBottom: 16, borderBottom: "3px solid var(--text-1)", marginBottom: 24 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, margin: 0, letterSpacing: "-1.5px", color: "var(--text-1)" }}>
              Student News
            </h2>
            <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.12em" }}>
              {filtered.length} / {news.length} stories
            </span>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 24, alignItems: "center", paddingBottom: 20, borderBottom: "1px solid var(--border)", marginBottom: 36, flexWrap: "wrap" }}>
            {/* Country filter */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 4 }}>Country</span>
              {newsCountries.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setSelectedCountry(c.code)}
                  style={{
                    padding: "4px 12px", borderRadius: 4,
                    border: selectedCountry === c.code ? "1px solid var(--text-1)" : "1px solid var(--border)",
                    background: selectedCountry === c.code ? "var(--text-1)" : "transparent",
                    color: selectedCountry === c.code ? "var(--bg)" : "var(--text-3)",
                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Topic filter */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 4 }}>Topic</span>
              {newsTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  style={{
                    padding: "4px 12px", borderRadius: 4,
                    border: selectedTag === tag ? "1px solid var(--accent)" : "1px solid var(--border)",
                    background: selectedTag === tag ? "var(--accent-dim)" : "transparent",
                    color: selectedTag === tag ? "var(--accent)" : "var(--text-3)",
                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}
                >
                  {tag === "All" ? "All topics" : tag}
                </button>
              ))}
            </div>

            {/* Clear */}
            {(selectedCountry !== "all" || selectedTag !== "All") && (
              <button
                onClick={() => { setSelectedCountry("all"); setSelectedTag("All"); }}
                style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4, transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
              >
                Clear filters ×
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-3)", fontSize: 14 }}>
            No stories match these filters.
          </div>
        )}

        {/* Lead story — FT style */}
        {lead && (
          <div className="reveal" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 40, paddingBottom: 36, borderBottom: "1px solid var(--border)", marginBottom: 36 }}>
            {/* Text */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ padding: "2px 8px", borderRadius: 3, background: "var(--text-1)", color: "var(--bg)", fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Top Story
                </span>
                <button onClick={() => setSelectedCountry(lead.country)} style={{ padding: "3px 10px", borderRadius: 4, border: "1px solid var(--border)", background: "transparent", color: "var(--text-3)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-3)"; }}>
                  {lead.flag} {lead.country}
                </button>
                <button onClick={() => setSelectedTag(lead.tag)} style={{ padding: "3px 10px", borderRadius: 4, border: "1px solid var(--accent-border)", background: "var(--accent-dim)", color: "var(--accent)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "0.75"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
                  {lead.tag}
                </button>
              </div>

              <h2 style={{ fontSize: "clamp(22px, 2.6vw, 36px)", fontWeight: 800, color: "var(--text-1)", lineHeight: 1.15, letterSpacing: "-0.8px", margin: "0 0 16px" }}>
                {lead.title}
              </h2>

              <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.8, margin: "0 0 auto", paddingBottom: 20 }}>
                {lead.summary}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 16, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                {lead.university && <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>{lead.university}</span>}
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", marginLeft: "auto" }}>{lead.date}</span>
                <TransitionLink href={`/chat?news=${encodeURIComponent(lead.title)}`} className="btn-primary" style={{ fontSize: 12, padding: "7px 14px" }}>
                  Ask AI →
                </TransitionLink>
              </div>
            </div>

            {/* Image */}
            <div style={{ overflow: "hidden", borderRadius: 6 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lead.image} alt={lead.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.6s ease" }}
                onMouseEnter={e => ((e.target as HTMLImageElement).style.transform = "scale(1.04)")}
                onMouseLeave={e => ((e.target as HTMLImageElement).style.transform = "scale(1)")}
              />
            </div>
          </div>
        )}

        {/* Secondary stories — FT list style */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
          {secondary.map((item, i) => (
            <div
              key={item.id}
              className={`reveal reveal-d${i + 1}`}
              style={{
                padding: "24px 20px",
                borderRight: i < 2 ? "1px solid var(--border)" : "none",
                display: "flex", flexDirection: "column", gap: 12,
              }}
            >
              {/* Small image */}
              <div style={{ aspectRatio: "16/9", overflow: "hidden", borderRadius: 4, flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease" }}
                  onMouseEnter={e => ((e.target as HTMLImageElement).style.transform = "scale(1.06)")}
                  onMouseLeave={e => ((e.target as HTMLImageElement).style.transform = "scale(1)")}
                />
              </div>

              {/* Badges */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => setSelectedCountry(item.country)} style={{ padding: "2px 8px", borderRadius: 3, border: "1px solid var(--border)", background: "transparent", color: "var(--text-3)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "var(--text-1)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
                  {item.flag} {item.country}
                </button>
                <button onClick={() => setSelectedTag(item.tag)} style={{ padding: "2px 8px", borderRadius: 3, border: "1px solid var(--accent-border)", background: "var(--accent-dim)", color: "var(--accent)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                  {item.tag}
                </button>
                <span style={{ fontWeight: 700, marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-3)", alignSelf: "center" }}>{item.date}</span>
              </div>

              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", lineHeight: 1.4, letterSpacing: "-0.3px", margin: 0, flex: 1 }}>
                {item.title}
              </h3>

              <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {item.summary}
              </p>

              <TransitionLink
                href={`/chat?news=${encodeURIComponent(item.title)}`}
                style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
              >
                Ask AI about this →
              </TransitionLink>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
