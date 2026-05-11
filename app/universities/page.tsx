"use client";

import { useState } from "react";
import Link from "next/link";
import { universities, countries, faculties } from "../data/universities";

export default function Universities() {
  const [selected, setSelected] = useState("all");
  const [selectedFaculty, setSelectedFaculty] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = universities.filter((u) => {
    const matchCountry = selected === "all" || u.country === selected;
    const matchSearch =
      search === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.city.toLowerCase().includes(search.toLowerCase()) ||
      u.strengths.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const facultyDef = faculties.find(f => f.code === selectedFaculty);
    const matchFaculty =
      selectedFaculty === "all" ||
      (facultyDef?.keywords ?? []).some(kw =>
        u.strengths.some(s => s.toLowerCase().includes(kw.toLowerCase()))
      );
    return matchCountry && matchSearch && matchFaculty;
  });

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 80px" }}>

      {/* ── Hero ──────────────────────────────────── */}
      <div style={{ padding: "72px 0 56px", borderBottom: "1px solid var(--border)", maxWidth: 680 }}>
        <h1 style={{
          fontSize: "clamp(36px, 5vw, 60px)",
          fontWeight: 800,
          letterSpacing: "-1.2px",
          lineHeight: 1.1,
          color: "var(--text-1)",
          margin: "0 0 16px",
        }}>
          Find your university<br />in Europe.
        </h1>
        <p style={{ fontSize: 17, color: "var(--text-2)", lineHeight: 1.7, margin: "0 0 32px", maxWidth: 520 }}>
          Explore tuition, cost of living and academic strengths across {universities.length} universities.
        </p>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, city or subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 18px 14px 44px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-1)",
              fontSize: 15,
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={e => (e.target.style.borderColor = "var(--border-strong)")}
            onBlur={e => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
      </div>

      {/* ── Filters ───────────────────────────────── */}
      <div style={{ padding: "28px 0 32px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span className="label" style={{ marginRight: 8, flexShrink: 0 }}>Country</span>
          {countries.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelected(c.code)}
              className={`pill${selected === c.code ? " active" : ""}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span className="label" style={{ marginRight: 8, flexShrink: 0 }}>Faculty</span>
          {faculties.map((f) => (
            <button
              key={f.code}
              onClick={() => setSelectedFaculty(f.code)}
              className={`pill${selectedFaculty === f.code ? " active" : ""}`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results count ─────────────────────────── */}
      {(selected !== "all" || selectedFaculty !== "all" || search !== "") && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0 4px" }}>
          <span style={{ fontSize: 13, color: "var(--text-3)" }}>
            <span style={{ color: "var(--text-1)", fontWeight: 600 }}>{filtered.length}</span> universities found
          </span>
          <button
            onClick={() => { setSelected("all"); setSelectedFaculty("all"); setSearch(""); }}
            style={{ fontSize: 12, color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
          >
            Clear all
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      {/* ── Grid ──────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
        gap: 24,
        paddingTop: 40,
      }}>
        {filtered.map((uni) => (
          <div
            key={uni.id}
            style={{
              background: "var(--surface)",
              borderRadius: 18,
              border: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: "border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.borderColor = "var(--border-strong)";
              el.style.transform = "translateY(-3px)";
              el.style.boxShadow = "0 24px 64px rgba(0,0,0,0.5)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.borderColor = "var(--border)";
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "none";
            }}
          >
            {/* Card top — identity */}
            <div style={{ padding: "28px 28px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 32, lineHeight: 1 }}>{uni.flag}</span>
                  <div>
                    <h2 style={{
                      margin: 0,
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--text-1)",
                      letterSpacing: "-0.3px",
                      lineHeight: 1.25,
                    }}>
                      {uni.name}
                    </h2>
                    <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 3, fontWeight: 400 }}>
                      {uni.city} · {uni.country}
                    </div>
                  </div>
                </div>
                {uni.ranking && (
                  <div style={{
                    padding: "4px 10px",
                    borderRadius: 7,
                    background: "var(--accent-dim)",
                    border: "1px solid var(--accent-border)",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--accent)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}>
                    {uni.ranking}
                  </div>
                )}
              </div>

              {/* Description */}
              <p style={{
                margin: "0 0 24px",
                fontSize: 14,
                color: "var(--text-2)",
                lineHeight: 1.75,
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {uni.description}
              </p>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 5 }}>Tuition / yr</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--green)", letterSpacing: "-0.2px" }}>{uni.tuition}</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 5 }}>Living / mo</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.2px" }}>{uni.livingCost}</div>
                </div>
              </div>

              {/* Teaching pill */}
              <div style={{ marginBottom: 20 }}>
                <span style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  fontSize: 12,
                  color: "var(--text-2)",
                  background: "rgba(255,255,255,0.03)",
                }}>
                  {uni.teaching}
                </span>
              </div>

              {/* Strengths */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
                {uni.strengths.slice(0, 4).map((s) => (
                  <span key={s} style={{
                    padding: "3px 10px",
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border)",
                    fontSize: 12,
                    color: "var(--text-3)",
                  }}>
                    {s}
                  </span>
                ))}
                {uni.strengths.length > 4 && (
                  <span style={{ fontSize: 12, color: "var(--text-3)", alignSelf: "center" }}>
                    +{uni.strengths.length - 4}
                  </span>
                )}
              </div>
            </div>

            {/* Languages */}
            <div style={{ padding: "0 28px 20px", display: "flex", gap: 6, flexWrap: "wrap" }}>
              {uni.languages.map((l) => (
                <span key={l} style={{
                  padding: "3px 9px",
                  borderRadius: 6,
                  background: "var(--accent-dim)",
                  border: "1px solid var(--accent-border)",
                  fontSize: 12,
                  color: "var(--accent)",
                  fontWeight: 500,
                }}>
                  {l}
                </span>
              ))}
            </div>

            {/* CTA strip */}
            <div style={{
              padding: "16px 28px 24px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: 10,
              marginTop: "auto",
            }}>
              <Link
                href={`/universities/${uni.id}`}
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  borderRadius: 10,
                  background: "var(--text-1)",
                  color: "var(--bg)",
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "none",
                  textAlign: "center",
                  transition: "opacity 0.15s, transform 0.15s",
                  display: "block",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88"; (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.02)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)"; }}
              >
                View programmes →
              </Link>
              <a
                href={uni.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "11px 16px",
                  borderRadius: 10,
                  background: "transparent",
                  color: "var(--text-2)",
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
                  border: "1px solid var(--border)",
                  transition: "border-color 0.15s, color 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-2)"; }}
              >
                Official site
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ padding: "80px 0", textAlign: "center", border: "1px dashed var(--border)", borderRadius: 20, marginTop: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🔍</div>
          <p style={{ fontSize: 15, color: "var(--text-3)", marginBottom: 20 }}>No universities match your filters.</p>
          <Link href="/chat" className="btn-primary" style={{ fontSize: 13 }}>Ask AI assistant</Link>
        </div>
      )}
    </div>
  );
}
