"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { universities as staticUniversities } from "../data/universities";
import { getUniversities, type University } from "../../utils/universities";

/* ─── Types ─────────────────────────────────────── */
type LifestyleData = { pros: string[]; cons: string[]; summary: string };

/* ─── Lifestyle database ────────────────────────── */
const LIFESTYLE: Record<string, LifestyleData> = {
  maastricht:       { pros: ["Exceptional international community", "Strong social bonds from PBL groups", "Compact, walkable student city"], cons: ["Limited nightlife vs big cities", "Very competitive academically"], summary: "Ideal for strong social ties and international environment" },
  amsterdam:        { pros: ["World-class nightlife and cultural scene", "Fully international student body", "Unmatched career network in finance/tech"], cons: ["Very expensive housing (start early)", "Large, impersonal university feeling"], summary: "Best for vibrant city life and cosmopolitan culture" },
  erasmus:          { pros: ["Rotterdam is modern, energetic and multicultural", "Strong business networking events", "Good work-life balance"], cons: ["Less prestigious brand outside Europe", "City less romantic than Amsterdam"], summary: "Balanced student experience with dynamic urban energy" },
  groningen:        { pros: ["Cheapest and most student-friendly city in NL", "Very tight-knit student community", "Excellent cycling culture"], cons: ["Smaller city — limited big-city opportunities", "Fewer English speakers in daily life"], summary: "Ultimate student-first city with great work-life balance" },
  "lmu-munich":     { pros: ["Outstanding quality of life", "World-class academic prestige", "Very safe and clean city"], cons: ["High cost of living for Germany", "Most programmes in German at bachelor level"], summary: "Premium quality of life with strong academic focus" },
  "tu-munich":      { pros: ["#1 technical university in Germany", "Strong ties to BMW, Siemens, MAN", "Free tuition (just admin fees)"], cons: ["Very demanding — heavy workload", "Bachelor programmes mostly in German"], summary: "Best for engineering careers and technical excellence" },
  "humboldt-berlin": { pros: ["Berlin: Europe's #1 nightlife and cultural capital", "Incredibly diverse and international city", "Cheapest capital in Western Europe"], cons: ["University has limited campus life", "High competition for affordable housing"], summary: "Europe's cultural capital — nightlife and diversity at its peak" },
  barcelona:        { pros: ["Beach, sun, and legendary social scene", "Best quality of life among European student cities", "Strong Erasmus and international community"], cons: ["Living costs rising fast", "Spanish required for full integration"], summary: "Unmatched lifestyle: beach, sun and legendary social scene" },
  complutense:      { pros: ["Authentic Spanish student experience", "Great nightlife and food culture", "Medicine and law faculty are renowned"], cons: ["Most programmes in Spanish only", "Large, bureaucratic institution"], summary: "Authentic Spanish student life with strong cultural roots" },
  "ie-university":  { pros: ["Elite international network (82% non-Spanish)", "Fully English, dynamic MBA-style culture", "Exceptional career placement"], cons: ["Very expensive — limited aid for non-top students", "Less integration with local Spanish culture"], summary: "Elite international bubble with elite networking" },
  "sciences-po":    { pros: ["World's best political science brand", "Extraordinary alumni network (presidents, ministers)", "Highly international cohort"], cons: ["Extremely demanding — no time for a social life", "Paris living costs are very high"], summary: "Academically intense with world-class cultural immersion" },
  sorbonne:         { pros: ["Oldest and most prestigious brand in France", "Near-free tuition (EU students)", "Paris: unparalleled cultural access"], cons: ["Very traditional, lecture-heavy format", "Large university — can feel anonymous"], summary: "Intellectual prestige in the heart of Paris" },
  lyon:             { pros: ["Affordable — France's best value city", "Excellent food, culture and quality of life", "CAF housing subsidy available"], cons: ["Less prestigious internationally than Paris schools", "Fewer English-taught programmes at bachelor level"], summary: "France's best-kept secret: affordable, lively, authentic" },
  bocconi:          { pros: ["Best business university in Italy and top 5 in Europe", "Elite networking — consulting, finance, McKinsey/BCG pipeline", "8 bachelor programmes fully in English"], cons: ["Very high academic pressure", "Milan is expensive"], summary: "Intense, career-driven with Italy's best networking" },
  bologna:          { pros: ["Italy's most vibrant and legendary student city", "World's oldest university (founded 1088)", "Affordable cost of living"], cons: ["Programmes mostly in Italian at bachelor level", "Less international than northern European unis"], summary: "Italy's most legendary student city — welcoming and vibrant" },
  polimi:           { pros: ["World top 20 for engineering and design", "Milan: fashion, design and tech capital of Italy", "Excellent industry partnerships"], cons: ["Extremely demanding — brutal first year", "Milan is expensive (€1,200–€1,600/mo)"], summary: "Design & tech powerhouse in fashion capital Milan" },
  lisbon:           { pros: ["One of Europe's trendiest and most liveable capitals", "Warm climate, excellent food and nightlife", "Living costs still accessible"], cons: ["Housing market very tight — start searching early", "Weaker international brand vs northern Europe"], summary: "Europe's hippest capital — warm, creative and growing fast" },
  porto:            { pros: ["Extraordinary quality of life on a tight budget", "Among the safest and most welcoming cities in Europe", "Beautiful, UNESCO-listed city"], cons: ["Fewer English-taught programmes", "Smaller job market vs Lisbon"], summary: "Charming, safe and deeply student-friendly Atlantic city" },
  "tu-delft":       { pros: ["Top 50 globally for engineering", "Very international campus (25% non-Dutch)", "Affordable city close to Rotterdam and The Hague"], cons: ["Bachelor degrees transitioning to English — check programme", "Extremely demanding curriculum"], summary: "World's best engineering campus — focused and highly international" },
  leiden:           { pros: ["Prestigious law, humanities, international relations", "Close to The Hague (UN, ICC, NATO)", "Charming, safe and affordable student city"], cons: ["Fewer English bachelor programmes", "Smaller campus community"], summary: "Netherlands' oldest university — prestigious and intimate" },
  "eth-zurich":     { pros: ["Consistently top 5 worldwide — Einstein's alma mater", "Extraordinary research facilities and faculty", "Low fees (~€750/semester) for world-class education"], cons: ["Zurich is the most expensive city in Europe", "Bachelor programmes in German — master's in English", "Extremely competitive and demanding"], summary: "Academic excellence above all — elite and demanding" },
  "ku-leuven":      { pros: ["Belgium's best and one of Europe's oldest universities", "Affordable, compact and safe student city", "Top research output (medical and engineering)"], cons: ["Most bachelor programmes in Dutch", "Less international than Dutch/Nordic unis"], summary: "Belgium's hidden gem: strong academics and great student life" },
  vienna:           { pros: ["One of the world's most liveable cities", "Rich culture, music, architecture", "Low fees for EU students (~€726/semester)"], cons: ["Many bachelor programmes in German", "Slower job market than western hubs"], summary: "Imperial city with affordable student life and rich culture" },
  copenhagen:       { pros: ["Europe's best work-life balance", "Excellent welfare system — stipend available", "Clean, safe and progressive city"], cons: ["Among the most expensive cities in Europe", "Most bachelor degrees in Danish"], summary: "Best work-life balance in Europe — clean, safe, progressive" },
  dtu:              { pros: ["Top 150 globally for engineering", "Strong Novo Nordisk, Vestas industry ties", "Excellent welfare and quality of life"], cons: ["BSc in Danish — MSc in English", "High cost of living in Copenhagen"], summary: "Top engineering environment with Nordic quality of life" },
  aarhus:           { pros: ["Denmark's best student city — compact, affordable and safe", "Tight-knit community with great work-life balance", "Strong business and social science programmes"], cons: ["Small international community at bachelor level", "Fewer global opportunities than Copenhagen"], summary: "Denmark's student city par excellence — tight-knit and safe" },
  kth:              { pros: ["Top 100 globally — Stockholm startup and tech hub", "Strong Ericsson, Spotify, Volvo connections", "Free tuition for EU students"], cons: ["Bachelor in Swedish — MSc in English", "High cost of living in Stockholm"], summary: "Elite engineering in one of Europe's most liveable cities" },
  lund:             { pros: ["Top 100 QS in one of Europe's best student towns", "Very affordable for Scandinavia", "Safe, international and welcoming"], cons: ["Most bachelor programmes in Swedish", "Can feel isolated vs a capital city"], summary: "Perfect student city: small, international and welcoming" },
  stockholm:        { pros: ["Capital opportunities — startups, culture, career", "International community and vibrant creative scene", "Free tuition for EU students"], cons: ["High cost of living", "Most bachelor programmes in Swedish"], summary: "Nordic innovation hub with strong startup and creative scene" },
  uppsala:          { pros: ["Sweden's oldest university — top 150 QS", "40 min from Stockholm, more affordable", "Exceptional medicine, law and science programmes"], cons: ["Most bachelor programmes in Swedish", "Academic city — limited nightlife vs capital"], summary: "Historic, traditional Swedish student life at its finest" },
};

const FALLBACK_LIFESTYLE: LifestyleData = {
  pros: ["Solid academic reputation", "International student community", "Good quality of life"],
  cons: ["Check programme language requirements", "Research housing early"],
  summary: "A well-rounded European university experience",
};

/* ─── Helpers ───────────────────────────────────── */
function parseCost(s: string): number {
  const m = s.match(/(\d[\d.,]*)/);
  if (!m) return 0;
  return parseInt(m[1].replace(/[.,]/g, ""), 10);
}

// The Supabase-backed `bachelors` table has no `courses` column, so the
// curriculum is sourced from the static data file that seeds it instead.
function getCourses(universityId: string, bachelorId: string) {
  return (
    staticUniversities
      .find((u) => u.id === universityId)
      ?.bachelors.find((b) => b.id === bachelorId)?.courses ?? []
  );
}

const SELECT_STYLE: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "10px 36px 10px 14px",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  cursor: "pointer",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23555' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  width: "100%",
};

const MONO: React.CSSProperties = {
  fontSize: 10,
  fontFamily: "var(--font-mono)",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--text-2)",
  fontWeight: 600,
};

/* ─── Section header ─────────────────────────────── */
function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "14px 20px",
      background: "var(--surface-2)",
      borderRadius: 10,
      marginBottom: 2,
    }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-2)", fontWeight: 600 }}>{title}</span>
    </div>
  );
}

/* ─── Row ─────────────────────────────────────────── */
function Row({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "160px 1fr 1fr",
      borderBottom: last ? "none" : "1px solid var(--border)",
    }}>
      <div style={{ padding: "16px 12px 16px 20px", display: "flex", alignItems: "flex-start" }}>
        <span style={MONO}>{label}</span>
      </div>
      {children}
    </div>
  );
}

/* ─── Cell ─────────────────────────────────────────── */
function Cell({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <div style={{
      padding: "16px 20px",
      borderLeft: "1px solid var(--border)",
      background: highlight ? "rgba(52,211,153,0.04)" : "transparent",
    }}>
      {children}
    </div>
  );
}

/* ─── Cost bar ────────────────────────────────────── */
function CostBar({ value, max, best }: { value: number; max: number; best: boolean }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", marginTop: 8 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: best ? "var(--green)" : "rgba(255,255,255,0.18)", borderRadius: 99 }} />
    </div>
  );
}

/* ─── Main ──────────────────────────────────────── */
export default function Compare() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [ids, setIds] = useState<[string, string]>(["", ""]);
  const [progIds, setProgIds] = useState<[string, string]>(["", ""]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    getUniversities()
      .then(setUniversities)
      .finally(() => setLoading(false));
  }, []);

  const unis = useMemo(
    () => ids.map((id) => (id ? universities.find((u) => u.id === id) ?? null : null)),
    [ids, universities]
  );

  const progs = useMemo(
    () => unis.map((uni, i) => uni?.bachelors.find((b) => b.id === progIds[i]) ?? null),
    [unis, progIds]
  );

  const colCount = unis.filter(Boolean).length;
  const bothProgs = progs[0] !== null && progs[1] !== null;

  // Available years across both selected programmes
  const availableYears = useMemo(() => {
    if (!bothProgs) return [];
    const years = new Set<number>();
    progs.forEach((p, i) => {
      const uniId = unis[i]?.id;
      if (!p || !uniId) return;
      getCourses(uniId, p.id).forEach((c) => { if (c.year) years.add(c.year); });
    });
    return Array.from(years).sort();
  }, [progs, bothProgs, unis]);

  // Reset year selection when programmes change
  const setId = (idx: number, val: string) => {
    setIds((prev) => { const n = [...prev] as [string, string]; n[idx] = val; return n; });
    setProgIds((prev) => { const n = [...prev] as [string, string]; n[idx] = ""; return n; });
    setSelectedYear(null);
  };

  const setProgId = (idx: number, val: string) => {
    setProgIds((prev) => { const n = [...prev] as [string, string]; n[idx] = val; return n; });
    setSelectedYear(null);
  };

  const tuitions  = unis.map((u) => (u ? parseCost(u.tuition) : 0));
  const livings   = unis.map((u) => (u ? parseCost(u.livingCost.split("–")[1] || u.livingCost) : 0));
  const maxTuition = Math.max(...tuitions, 1);
  const maxLiving  = Math.max(...livings, 1);
  const minTuition = Math.min(...tuitions.filter(Boolean));
  const minLiving  = Math.min(...livings.filter(Boolean));

  // Years to display (filtered or all)
  const yearsToShow = selectedYear !== null ? [selectedYear] : availableYears;

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", color: "var(--text-3)", fontSize: 15 }}>
      Loading universities…
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px 80px" }}>

      {/* ── Header ──────────────────────────────── */}
      <div style={{ padding: "72px 0 48px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-1px", color: "var(--text-1)", margin: "0 0 10px" }}>
          Compare universities.
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-2)", margin: 0 }}>
          Pick two universities and optionally compare their programmes side by side.
        </p>
      </div>

      {/* ── Selectors ───────────────────────────── */}
      <div style={{ padding: "32px 0 36px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* University selectors */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {([0, 1] as const).map((idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={MONO}>University {String.fromCharCode(65 + idx)}</span>
              <select
                value={ids[idx]}
                onChange={(e) => setId(idx, e.target.value)}
                style={{ ...SELECT_STYLE, color: ids[idx] ? "var(--text-1)" : "var(--text-3)" }}
              >
                <option value="">— Select university —</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id} disabled={ids.includes(u.id) && ids[idx] !== u.id}>
                    {u.flag} {u.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Programme selectors — only shown when at least one uni selected */}
        {colCount >= 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 4 }}>
            {([0, 1] as const).map((idx) => {
              const uni = unis[idx];
              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ ...MONO, opacity: uni ? 1 : 0.3 }}>Programme {String.fromCharCode(65 + idx)}</span>
                  <select
                    value={progIds[idx]}
                    onChange={(e) => setProgId(idx, e.target.value)}
                    disabled={!uni}
                    style={{
                      ...SELECT_STYLE,
                      color: progIds[idx] ? "var(--text-1)" : "var(--text-3)",
                      border: `1px solid ${progIds[idx] ? "var(--accent-border)" : "var(--border)"}`,
                      opacity: uni ? 1 : 0.3,
                      cursor: uni ? "pointer" : "not-allowed",
                    }}
                  >
                    <option value="">— Select programme (optional) —</option>
                    {uni?.bachelors.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Empty state ──────────────────────────── */}
      {colCount === 0 && (
        <div style={{ padding: "100px 0", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚖️</div>
          <p style={{ fontSize: 16, color: "var(--text-2)", marginBottom: 6 }}>Select two universities to compare them.</p>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>Costs, academics, lifestyle and programmes — side by side.</p>
        </div>
      )}

      {/* ── Comparison ───────────────────────────── */}
      {colCount >= 1 && (
        <div style={{ paddingTop: 40, display: "flex", flexDirection: "column", gap: 4 }}>

          {/* ── University headers ─────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr", marginBottom: 20 }}>
            <div />
            {unis.map((uni, idx) => {
              if (!uni) return <div key={idx} style={{ borderLeft: "1px solid var(--border)", padding: "20px" }}><span style={{ ...MONO }}>—</span></div>;
              const lifestyle = LIFESTYLE[uni.id] ?? FALLBACK_LIFESTYLE;
              return (
                <div key={uni.id} style={{
                  borderLeft: "1px solid var(--border)",
                  padding: "20px 20px 16px",
                  background: "var(--surface)",
                  borderRadius: idx === 0 ? "12px 0 0 12px" : "0 12px 12px 0",
                  border: "1px solid var(--border)",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 28, lineHeight: 1 }}>{uni.flag}</span>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>{uni.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{uni.city} · {uni.country}</div>
                      </div>
                    </div>
                    {uni.ranking && (
                      <span style={{ padding: "2px 8px", borderRadius: 5, background: "var(--accent-dim)", border: "1px solid var(--accent-border)", fontSize: 10, fontWeight: 600, color: "var(--accent)", flexShrink: 0 }}>
                        {uni.ranking}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 12, color: "var(--accent)", fontStyle: "italic", lineHeight: 1.5, marginBottom: 14 }}>
                    &ldquo;{lifestyle.summary}&rdquo;
                  </div>

                  <button
                    onClick={() => setId(idx, "")}
                    style={{ width: "100%", padding: "6px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--text-3)", fontSize: 11, cursor: "pointer", fontFamily: "inherit", transition: "color 0.15s, border-color 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "var(--text-1)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── COSTS ──────────────────────────────── */}
          <SectionHeader icon="💰" title="Costs" />
          <div style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 12 }}>
            <Row label="Tuition / year">
              {unis.map((uni, idx) => {
                if (!uni) return <Cell key={idx}><span style={{ color: "var(--text-3)" }}>—</span></Cell>;
                const val = tuitions[idx];
                const isBest = val === minTuition && colCount > 1;
                return (
                  <Cell key={uni.id} highlight={isBest}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: isBest ? "var(--green)" : "var(--text-1)", letterSpacing: "-0.3px" }}>{uni.tuition}</span>
                      {isBest && colCount > 1 && <span style={{ fontSize: 9, fontWeight: 700, color: "var(--green)", background: "rgba(52,211,153,0.15)", padding: "2px 6px", borderRadius: 4 }}>LOWEST</span>}
                    </div>
                    <CostBar value={val} max={maxTuition} best={isBest} />
                  </Cell>
                );
              })}
            </Row>
            <Row label="Living / month" last>
              {unis.map((uni, idx) => {
                if (!uni) return <Cell key={idx}><span style={{ color: "var(--text-3)" }}>—</span></Cell>;
                const val = livings[idx];
                const isBest = val === minLiving && colCount > 1;
                return (
                  <Cell key={uni.id} highlight={isBest}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: isBest ? "var(--green)" : "var(--text-1)", letterSpacing: "-0.3px" }}>{uni.livingCost}</span>
                      {isBest && colCount > 1 && <span style={{ fontSize: 9, fontWeight: 700, color: "var(--green)", background: "rgba(52,211,153,0.15)", padding: "2px 6px", borderRadius: 4 }}>CHEAPER</span>}
                    </div>
                    <CostBar value={val} max={maxLiving} best={isBest} />
                  </Cell>
                );
              })}
            </Row>
          </div>

          {/* ── ACADEMICS ──────────────────────────── */}
          <SectionHeader icon="📚" title="Academics" />
          <div style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 12 }}>
            <Row label="Languages">
              {unis.map((uni, idx) => (
                <Cell key={uni?.id ?? idx}>
                  {uni ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {uni.languages.map((l) => (
                        <span key={l} style={{ padding: "3px 9px", borderRadius: 6, background: "var(--accent-dim)", border: "1px solid var(--accent-border)", fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>{l}</span>
                      ))}
                    </div>
                  ) : <span style={{ color: "var(--text-3)" }}>—</span>}
                </Cell>
              ))}
            </Row>
            <Row label="Strengths">
              {unis.map((uni, idx) => (
                <Cell key={uni?.id ?? idx}>
                  {uni ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {uni.strengths.map((s) => (
                        <span key={s} style={{ padding: "3px 9px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", fontSize: 12, color: "var(--text-2)" }}>{s}</span>
                      ))}
                    </div>
                  ) : <span style={{ color: "var(--text-3)" }}>—</span>}
                </Cell>
              ))}
            </Row>
            <Row label="Teaching method">
              {unis.map((uni, idx) => (
                <Cell key={uni?.id ?? idx}>
                  {uni ? (
                    <span style={{ fontSize: 13, color: "var(--text-2)" }}>{uni.teaching}</span>
                  ) : <span style={{ color: "var(--text-3)" }}>—</span>}
                </Cell>
              ))}
            </Row>
            <Row label="Programmes" last>
              {unis.map((uni, idx) => (
                <Cell key={uni?.id ?? idx}>
                  {uni ? (
                    <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>
                      {uni.bachelors.length}
                      <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-3)", marginLeft: 5 }}>bachelors listed</span>
                    </span>
                  ) : <span style={{ color: "var(--text-3)" }}>—</span>}
                </Cell>
              ))}
            </Row>
          </div>

          {/* ── LIFESTYLE ──────────────────────────── */}
          <SectionHeader icon="🌆" title="Lifestyle" />
          <div style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 12 }}>
            <Row label="Pros">
              {unis.map((uni, idx) => {
                const ls = uni ? (LIFESTYLE[uni.id] ?? FALLBACK_LIFESTYLE) : null;
                return (
                  <Cell key={uni?.id ?? idx}>
                    {ls ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {ls.pros.map((p, i) => (
                          <div key={i} style={{ display: "flex", gap: 8 }}>
                            <span style={{ color: "var(--green)", fontWeight: 700, flexShrink: 0, lineHeight: 1.6 }}>+</span>
                            <span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{p}</span>
                          </div>
                        ))}
                      </div>
                    ) : <span style={{ color: "var(--text-3)" }}>—</span>}
                  </Cell>
                );
              })}
            </Row>
            <Row label="Cons" last>
              {unis.map((uni, idx) => {
                const ls = uni ? (LIFESTYLE[uni.id] ?? FALLBACK_LIFESTYLE) : null;
                return (
                  <Cell key={uni?.id ?? idx}>
                    {ls ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {ls.cons.map((c, i) => (
                          <div key={i} style={{ display: "flex", gap: 8 }}>
                            <span style={{ color: "#f87171", fontWeight: 700, flexShrink: 0, lineHeight: 1.6 }}>−</span>
                            <span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{c}</span>
                          </div>
                        ))}
                      </div>
                    ) : <span style={{ color: "var(--text-3)" }}>—</span>}
                  </Cell>
                );
              })}
            </Row>
          </div>

          {/* ── PROGRAMME COMPARISON ─────────────── */}
          {bothProgs && (
            <>
              <SectionHeader icon="🎓" title="Programme comparison" />
              <div style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 12 }}>
                <Row label="Programme">
                  {progs.map((prog, idx) => (
                    <Cell key={idx}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", lineHeight: 1.3 }}>{prog?.name ?? "—"}</span>
                    </Cell>
                  ))}
                </Row>
                <Row label="Duration">
                  {progs.map((prog, idx) => (
                    <Cell key={idx}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{prog?.duration ?? "—"}</span>
                    </Cell>
                  ))}
                </Row>
                <Row label="Taught in">
                  {progs.map((prog, idx) => (
                    <Cell key={idx}>
                      {prog ? (
                        <span style={{ padding: "3px 9px", borderRadius: 6, background: "var(--accent-dim)", border: "1px solid var(--accent-border)", fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>
                          {prog.language}
                        </span>
                      ) : "—"}
                    </Cell>
                  ))}
                </Row>
                <Row label="Overview" last>
                  {progs.map((prog, idx) => (
                    <Cell key={idx}>
                      <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>{prog?.description ?? "—"}</p>
                    </Cell>
                  ))}
                </Row>
              </div>

              {/* Year filter + courses */}
              {availableYears.length > 0 && (
                <>
                  {/* Year filter pills */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0 12px" }}>
                    <span style={{ ...MONO, marginRight: 4 }}>Courses — Year</span>
                    <button
                      onClick={() => setSelectedYear(null)}
                      className={`pill${selectedYear === null ? " active" : ""}`}
                      style={{ fontSize: 12 }}
                    >
                      All
                    </button>
                    {availableYears.map((y) => (
                      <button
                        key={y}
                        onClick={() => setSelectedYear(selectedYear === y ? null : y)}
                        className={`pill${selectedYear === y ? " active" : ""}`}
                        style={{ fontSize: 12 }}
                      >
                        Year {y}
                      </button>
                    ))}
                  </div>

                  <div style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 12 }}>
                    {yearsToShow.map((year, yi) => (
                      <Row key={year} label={`Year ${year}`} last={yi === yearsToShow.length - 1}>
                        {progs.map((prog, idx) => {
                          const uniId = unis[idx]?.id;
                          const courses = prog && uniId
                            ? getCourses(uniId, prog.id).filter((c) => c.year === year)
                            : [];
                          return (
                            <Cell key={idx}>
                              {courses.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                  {courses.map((c, ci) => (
                                    <div key={ci} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                                      <span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>{c.name}</span>
                                      {c.credits && (
                                        <span style={{ fontSize: 10, color: "var(--text-3)", flexShrink: 0, fontFamily: "var(--font-mono)" }}>{c.credits}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span style={{ fontSize: 12, color: "var(--text-3)" }}>No courses listed</span>
                              )}
                            </Cell>
                          );
                        })}
                      </Row>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── CTA ──────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr", marginTop: 8 }}>
            <div />
            {unis.map((uni, idx) => (
              <div key={uni?.id ?? idx} style={{ padding: idx === 0 ? "0 8px 0 0" : "0 0 0 8px", display: "flex", flexDirection: "column", gap: 8 }}>
                {uni ? (
                  <>
                    <Link href={`/universities/${uni.id}`} className="btn-primary" style={{ justifyContent: "center", fontSize: 13 }}>
                      View {uni.name.split(" ")[0]} →
                    </Link>
                    <Link href={`/chat`} className="btn-ghost" style={{ justifyContent: "center", fontSize: 12 }}>
                      Ask AI about this
                    </Link>
                  </>
                ) : null}
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
