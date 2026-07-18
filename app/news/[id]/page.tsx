"use client";

import { useParams } from "next/navigation";
import { TransitionLink } from "../../components/PageTransition";
import { news } from "../../data/news";

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const item = news.find((n) => n.id === id);

  if (!item) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <p style={{ color: "var(--text-2)", fontFamily: "var(--font-mono)", fontSize: 13 }}>Article not found.</p>
        <TransitionLink href="/" className="btn-ghost" style={{ fontSize: 13 }}>← Back home</TransitionLink>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* Hero image */}
      <div style={{ position: "relative", height: "55vh", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(10,10,10,0.95) 100%)" }} />

        {/* Back button */}
        <div style={{ position: "absolute", top: 24, left: 32 }}>
          <TransitionLink
            href="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 8,
              background: "rgba(10,10,10,0.65)", backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "var(--text-2)", fontSize: 12, fontWeight: 600,
              textDecoration: "none", letterSpacing: "0.05em",
              transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
          >
            ← Back
          </TransitionLink>
        </div>

        {/* Tag + date over image */}
        <div style={{ position: "absolute", bottom: 36, left: 0, right: 0, maxWidth: 800, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 6,
              background: "var(--accent-dim)", color: "var(--accent)",
              textTransform: "uppercase", letterSpacing: "0.1em",
            }}>
              {item.flag} {item.tag}
            </span>
            {item.university && (
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
                {item.university}
              </span>
            )}
            <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              {item.date}
            </span>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 32px 100px" }}>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(28px, 4vw, 48px)",
          fontWeight: 800,
          color: "var(--text-1)",
          lineHeight: 1.15,
          letterSpacing: "-1px",
          margin: "0 0 28px",
        }}>
          {item.title}
        </h1>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--border)", marginBottom: 32 }} />

        {/* Summary / lead */}
        <p style={{
          fontSize: 18,
          color: "rgba(237,237,237,0.75)",
          lineHeight: 1.8,
          margin: "0 0 32px",
          fontWeight: 400,
        }}>
          {item.summary}
        </p>

        {/* Placeholder body */}
        <div style={{
          padding: "24px 28px",
          borderRadius: 14,
          border: "1px dashed var(--border-strong)",
          background: "var(--surface)",
          marginBottom: 40,
        }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>
            Full article
          </p>
          <p style={{ fontSize: 14, color: "var(--text-3)", margin: 0, lineHeight: 1.6 }}>
            The full article content will appear here once the backend is connected.
          </p>
        </div>

        {/* Ask AI CTA */}
        <div style={{
          padding: "32px 36px",
          borderRadius: 18,
          border: "1px solid var(--accent-border)",
          background: "var(--accent-dim)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}>
          <div>
            <p style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--accent)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 6px" }}>
              Got questions?
            </p>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)", margin: 0, lineHeight: 1.4 }}>
              Ask our AI about this article
            </p>
            <p style={{ fontSize: 13, color: "var(--text-2)", margin: "4px 0 0" }}>
              Deadlines, eligibility, how to apply — get instant answers.
            </p>
          </div>
          <TransitionLink
            href={`/chat?news=${encodeURIComponent(item.title)}`}
            className="btn-primary"
            style={{ fontSize: 14, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            Ask AI about this
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </TransitionLink>
        </div>

      </div>
    </div>
  );
}