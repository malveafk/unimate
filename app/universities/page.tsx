"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { countries, faculties } from "../data/universities";
import { universityMeta } from "../data/universityMeta";
import { getUniversities, type University } from "../../utils/universities";

const NAV_ITEMS = [
  {
    label: "News",
    href: "/news",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
        <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>
      </svg>
    ),
  },
  {
    label: "Compare",
    href: "/compare",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
      </svg>
    ),
  },
  {
    label: "AI Chat",
    href: "/chat",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
];

const TUITION_BRACKETS = [
  { label: "Any", value: "any" },
  { label: "Free – €500", value: "free", max: 500 },
  { label: "€500 – €3k", value: "low", min: 500, max: 3000 },
  { label: "€3k – €10k", value: "mid", min: 3000, max: 10000 },
  { label: "€10k+", value: "high", min: 10000 },
];

const LIVING_BRACKETS = [
  { label: "Any", value: "any" },
  { label: "Under €900", value: "budget", max: 900 },
  { label: "€900 – €1,200", value: "moderate", min: 900, max: 1200 },
  { label: "€1,200+", value: "high", min: 1200 },
];

const DEADLINE_BRACKETS = [
  { label: "Any", value: "any" },
  { label: "Jan – Mar", value: "q1", min: 1, max: 3 },
  { label: "Apr – Jun", value: "q2", min: 4, max: 6 },
  { label: "Jul – Sep", value: "q3", min: 7, max: 9 },
  { label: "Rolling", value: "rolling" },
];

export default function Universities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("all");
  const [selectedFaculty, setSelectedFaculty] = useState("all");
  const [search, setSearch] = useState("");
  const [tuitionFilter, setTuitionFilter] = useState("any");
  const [livingFilter, setLivingFilter] = useState("any");
  const [deadlineFilter, setDeadlineFilter] = useState("any");
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    getUniversities()
      .then((data) => setUniversities(data))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const filtered = universities.filter((u) => {
    const meta = universityMeta[u.id];

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

    const matchTuition = (() => {
      if (tuitionFilter === "any" || !meta) return true;
      const b = TUITION_BRACKETS.find(x => x.value === tuitionFilter);
      if (!b) return true;
      const t = meta.tuitionPerYear;
      if (b.min !== undefined && t < b.min) return false;
      if (b.max !== undefined && t >= b.max) return false;
      return true;
    })();

    const matchLiving = (() => {
      if (livingFilter === "any" || !meta) return true;
      const b = LIVING_BRACKETS.find(x => x.value === livingFilter);
      if (!b) return true;
      const avg = (meta.livingCostMin + meta.livingCostMax) / 2;
      if (b.min !== undefined && avg < b.min) return false;
      if (b.max !== undefined && avg >= b.max) return false;
      return true;
    })();

    const matchDeadline = (() => {
      if (deadlineFilter === "any" || !meta) return true;
      if (deadlineFilter === "rolling") return meta.applicationDeadlineMonth === null;
      const b = DEADLINE_BRACKETS.find(x => x.value === deadlineFilter);
      if (!b || b.min === undefined) return true;
      if (meta.applicationDeadlineMonth === null) return false;
      return meta.applicationDeadlineMonth >= b.min! && meta.applicationDeadlineMonth <= b.max!;
    })();

    return matchCountry && matchSearch && matchFaculty && matchTuition && matchLiving && matchDeadline;
  });

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", color: "var(--text-3)", fontSize: 15 }}>
      Loading universities…
    </div>
  );

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
      <div style={{ borderBottom: "1px solid var(--border)" }}>
        {/* Filter header row with toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0 0" }}>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Filters
          </span>
          <button
            onClick={() => setFiltersVisible(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "transparent", border: "1px solid var(--border)",
              borderRadius: 8, padding: "5px 12px", cursor: "pointer",
              color: "var(--text-3)", fontSize: 11, fontWeight: 600,
              letterSpacing: "0.08em", fontFamily: "inherit",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-1)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-3)"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {filtersVisible
                ? <><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="18" x2="12" y2="18"/></>
                : <><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></>
              }
            </svg>
            {filtersVisible ? "Hide filters" : "Show filters"}
          </button>
        </div>

        {/* Collapsible filter body */}
        <div style={{
          overflow: "hidden",
          maxHeight: filtersVisible ? "400px" : "0px",
          opacity: filtersVisible ? 1 : 0,
          transition: "max-height 0.3s ease, opacity 0.25s ease",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "20px 0 28px" }}>
            {/* Row 1: Country + Faculty */}
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span className="label" style={{ marginRight: 6, flexShrink: 0 }}>Country</span>
                {countries.map((c) => (
                  <button key={c.code} onClick={() => setSelected(c.code)} className={`pill${selected === c.code ? " active" : ""}`}>{c.name}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span className="label" style={{ marginRight: 6, flexShrink: 0 }}>Faculty</span>
                {faculties.map((f) => (
                  <button key={f.code} onClick={() => setSelectedFaculty(f.code)} className={`pill${selectedFaculty === f.code ? " active" : ""}`}>{f.name}</button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "var(--border)" }} />

            {/* Row 2: Cost + Deadline */}
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span className="label" style={{ marginRight: 6, flexShrink: 0 }}>Tuition / yr</span>
                {TUITION_BRACKETS.map((b) => (
                  <button key={b.value} onClick={() => setTuitionFilter(b.value)} className={`pill${tuitionFilter === b.value ? " active" : ""}`}>{b.label}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span className="label" style={{ marginRight: 6, flexShrink: 0 }}>Living / mo</span>
                {LIVING_BRACKETS.map((b) => (
                  <button key={b.value} onClick={() => setLivingFilter(b.value)} className={`pill${livingFilter === b.value ? " active" : ""}`}>{b.label}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span className="label" style={{ marginRight: 6, flexShrink: 0 }}>Deadline</span>
                {DEADLINE_BRACKETS.map((b) => (
                  <button key={b.value} onClick={() => setDeadlineFilter(b.value)} className={`pill${deadlineFilter === b.value ? " active" : ""}`}>{b.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Results count ─────────────────────────── */}
      {(selected !== "all" || selectedFaculty !== "all" || search !== "" || tuitionFilter !== "any" || livingFilter !== "any" || deadlineFilter !== "any") && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0 4px" }}>
          <span style={{ fontSize: 13, color: "var(--text-3)" }}>
            <span style={{ color: "var(--text-1)", fontWeight: 600 }}>{filtered.length}</span> universities found
          </span>
          <button
            onClick={() => { setSelected("all"); setSelectedFaculty("all"); setSearch(""); setTuitionFilter("any"); setLivingFilter("any"); setDeadlineFilter("any"); }}
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
        {filtered.map((uni) => {
          const isExpanded = expandedId === uni.id;
          const meta = universityMeta[uni.id];

          return (
            <div
              key={uni.id}
              style={{
                background: "var(--surface)",
                borderRadius: 18,
                border: `1px solid ${isExpanded ? "var(--border-strong)" : "var(--border)"}`,
                display: "flex",
                flexDirection: isExpanded ? "row" : "column",
                overflow: "hidden",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease, grid-column 0.2s ease",
                boxShadow: isExpanded ? "0 32px 80px rgba(0,0,0,0.6)" : "none",
                gridColumn: isExpanded ? "1 / -1" : "auto",
                cursor: isExpanded ? "default" : "pointer",
              }}
              onClick={() => { if (!isExpanded) setExpandedId(uni.id); }}
              onMouseEnter={e => {
                if (!isExpanded) {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "var(--border-strong)";
                  el.style.transform = "translateY(-3px)";
                  el.style.boxShadow = "0 24px 64px rgba(0,0,0,0.5)";
                }
              }}
              onMouseLeave={e => {
                if (!isExpanded) {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = "var(--border)";
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                }
              }}
            >
              {/* ── COLLAPSED VIEW ── */}
              {!isExpanded && (
                <>
                  {/* Card top — identity */}
                  <div style={{ padding: "28px 28px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <span style={{ fontSize: 32, lineHeight: 1 }}>{uni.flag}</span>
                        <div>
                          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.3px", lineHeight: 1.25 }}>
                            {uni.name}
                          </h2>
                          <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 3 }}>
                            {uni.city} · {uni.country}
                          </div>
                        </div>
                      </div>
                      {uni.ranking && (
                        <div style={{ padding: "4px 10px", borderRadius: 7, background: "var(--accent-dim)", border: "1px solid var(--accent-border)", fontSize: 11, fontWeight: 600, color: "var(--accent)", whiteSpace: "nowrap", flexShrink: 0 }}>
                          {uni.ranking}
                        </div>
                      )}
                    </div>

                    <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--text-2)", lineHeight: 1.75, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {uni.description}
                    </p>

                    {/* Stats row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
                      <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 5 }}>Tuition / yr</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--green)", letterSpacing: "-0.2px" }}>
                          {meta ? (meta.tuitionPerYear === 0 ? "Free" : `€${meta.tuitionPerYear.toLocaleString()}`) : uni.tuition}
                        </div>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 5 }}>Living / mo</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.2px" }}>
                          {meta ? `€${meta.livingCostMin}–€${meta.livingCostMax}` : uni.livingCost}
                        </div>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 5 }}>Deadline</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(251,191,36,0.9)", letterSpacing: "-0.1px", lineHeight: 1.3 }}>
                          {meta ? (meta.applicationDeadlineMonth === null ? "Rolling" : meta.applicationDeadline) : "—"}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                      <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 12, color: "var(--text-2)", background: "rgba(255,255,255,0.03)" }}>
                        {uni.teaching}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
                      {uni.strengths.slice(0, 4).map((s) => (
                        <span key={s} style={{ padding: "3px 10px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", fontSize: 12, color: "var(--text-3)" }}>{s}</span>
                      ))}
                      {uni.strengths.length > 4 && <span style={{ fontSize: 12, color: "var(--text-3)", alignSelf: "center" }}>+{uni.strengths.length - 4}</span>}
                    </div>
                  </div>

                  <div style={{ padding: "0 28px 20px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {uni.languages.map((l) => (
                      <span key={l} style={{ padding: "3px 9px", borderRadius: 6, background: "var(--accent-dim)", border: "1px solid var(--accent-border)", fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>{l}</span>
                    ))}
                  </div>

                  <div style={{ padding: "14px 28px 20px", borderTop: "1px solid var(--border)", marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "var(--text-3)" }}>Click to expand</span>
                    <span style={{ fontSize: 18, color: "var(--text-3)" }}>↓</span>
                  </div>
                </>
              )}

              {/* ── EXPANDED VIEW ── */}
              {isExpanded && (
                <>
                  {/* Left column */}
                  <div style={{ flex: "0 0 380px", padding: "36px 32px", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <span style={{ fontSize: 40, lineHeight: 1 }}>{uni.flag}</span>
                        <div>
                          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px", lineHeight: 1.2 }}>{uni.name}</h2>
                          <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>{uni.city} · {uni.country}</div>
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setExpandedId(null); }}
                        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid var(--border)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-2)", flexShrink: 0, transition: "background 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>

                    {uni.ranking && (
                      <div style={{ display: "inline-flex" }}>
                        <div style={{ padding: "4px 12px", borderRadius: 7, background: "var(--accent-dim)", border: "1px solid var(--accent-border)", fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>{uni.ranking}</div>
                      </div>
                    )}

                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 10, padding: "14px", border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 6 }}>Tuition / yr</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--green)" }}>
                          {meta ? (meta.tuitionPerYear === 0 ? "Free" : `€${meta.tuitionPerYear.toLocaleString()}`) : uni.tuition}
                        </div>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 10, padding: "14px", border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 6 }}>Living / mo</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-1)" }}>
                          {meta ? `€${meta.livingCostMin}–€${meta.livingCostMax}` : uni.livingCost}
                        </div>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 10, padding: "14px", border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 6 }}>Deadline</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(251,191,36,0.9)", lineHeight: 1.3 }}>
                          {meta ? (meta.applicationDeadlineMonth === null ? "Rolling" : meta.applicationDeadline) : "—"}
                        </div>
                      </div>
                    </div>

                    {/* Teaching */}
                    <div>
                      <span style={{ display: "inline-block", padding: "5px 12px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 12, color: "var(--text-2)", background: "rgba(255,255,255,0.03)" }}>
                        {uni.teaching}
                      </span>
                    </div>

                    {/* Languages */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {uni.languages.map((l) => (
                        <span key={l} style={{ padding: "4px 10px", borderRadius: 6, background: "var(--accent-dim)", border: "1px solid var(--accent-border)", fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>{l}</span>
                      ))}
                    </div>

                    {/* CTAs */}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: "auto", paddingTop: 8 }}>
                      <a href={uni.website} target="_blank" rel="noopener noreferrer"
                        style={{ padding: "11px 18px", borderRadius: 10, border: "1px solid var(--border)", color: "var(--text-2)", fontSize: 13, fontWeight: 500, textDecoration: "none", transition: "border-color 0.15s, color 0.15s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-1)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-2)"; }}
                      >Official site</a>
                      {meta?.applicationLink && (
                        <a href={meta.applicationLink} target="_blank" rel="noopener noreferrer"
                          style={{ flex: 1, padding: "11px 18px", borderRadius: 10, background: "var(--accent-dim)", color: "var(--accent)", fontSize: 13, fontWeight: 700, textDecoration: "none", border: "1px solid var(--accent-border)", textAlign: "center", transition: "opacity 0.15s" }}
                          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.75")}
                          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
                        >Apply →</a>
                      )}
                    </div>
                  </div>

                  {/* Right column */}
                  <div style={{ flex: 1, padding: "36px 36px", display: "flex", flexDirection: "column", gap: 28, overflowY: "auto", maxHeight: 600 }}>
                    {/* Full description */}
                    <div>
                      <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-3)", marginBottom: 12 }}>About</div>
                      <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.8, margin: 0 }}>{uni.description}</p>
                    </div>

                    {/* All strengths */}
                    <div>
                      <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-3)", marginBottom: 12 }}>Academic strengths</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {uni.strengths.map((s) => (
                          <span key={s} style={{ padding: "5px 12px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", fontSize: 13, color: "var(--text-2)" }}>{s}</span>
                        ))}
                      </div>
                    </div>

                    {/* Requirements */}
                    {meta && (
                      <div>
                        <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--text-3)", marginBottom: 12 }}>What you need to apply</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          {meta.requirements.map((req) => (
                            <div key={req} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                              <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1, fontSize: 14 }}>✓</span>
                              {req}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ask AI */}
                    <div style={{ marginTop: "auto", paddingTop: 8 }}>
                      <Link
                        href={`/chat?q=Tell me more about ${encodeURIComponent(uni.name)}`}
                        onClick={e => e.stopPropagation()}
                        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, background: "var(--text-1)", color: "var(--bg)", fontSize: 13, fontWeight: 700, textDecoration: "none", transition: "opacity 0.15s" }}
                        onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")}
                        onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        Ask AI about {uni.name} →
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ padding: "80px 0", textAlign: "center", border: "1px dashed var(--border)", borderRadius: 20, marginTop: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🔍</div>
          <p style={{ fontSize: 15, color: "var(--text-3)", marginBottom: 20 }}>No universities match your filters.</p>
          <Link href="/chat" className="btn-primary" style={{ fontSize: 13 }}>Ask AI assistant</Link>
        </div>
      )}

      {/* ── Right nav toolbar ─────────────────────── */}
      <div style={{
        position: "fixed",
        right: 24,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        background: "rgba(28, 28, 32, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 18,
        padding: 8,
        boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.06) inset",
      }}>
        {NAV_ITEMS.map(({ label, href, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "12px 14px",
                borderRadius: 12,
                textDecoration: "none",
                color: active ? "#ffffff" : "rgba(255,255,255,0.5)",
                background: active ? "rgba(255,255,255,0.12)" : "transparent",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                transition: "background 0.15s, color 0.15s",
                minWidth: 52,
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                }
              }}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
