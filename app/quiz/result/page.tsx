"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { universities } from "../../data/universities";

const FACULTY_LABELS: Record<string, { name: string; icon: string; description: string }> = {
  business:    { name: "Business & Economics", icon: "📈", description: "Finance, management, consulting, international trade" },
  engineering: { name: "Engineering & Technology", icon: "⚙️", description: "Software, mechanical, electrical, civil engineering" },
  medicine:    { name: "Medicine & Health", icon: "🏥", description: "Medicine, nursing, pharmacy, public health" },
  law:         { name: "Law & Political Science", icon: "⚖️", description: "Law, international relations, diplomacy, political theory" },
  humanities:  { name: "Humanities & Social Sciences", icon: "📚", description: "Philosophy, history, sociology, communication" },
  design:      { name: "Design & Architecture", icon: "🎨", description: "Industrial design, architecture, UX, creative arts" },
  science:     { name: "Natural Sciences", icon: "🔬", description: "Physics, chemistry, biology, mathematics" },
};

const MATCH_LABELS = [
  { min: 85, label: "Perfect match", color: "#34d399" },
  { min: 70, label: "Strong match", color: "#c9a35c" },
  { min: 55, label: "Good match", color: "#60a5fa" },
  { min: 0,  label: "Partial match", color: "#888888" },
];

function getMatchLabel(score: number) {
  return MATCH_LABELS.find((l) => score >= l.min) ?? MATCH_LABELS[MATCH_LABELS.length - 1];
}

function ScoreRing({ score }: { score: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const match = getMatchLabel(score);
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" style={{ flexShrink: 0 }}>
      <circle cx="28" cy="28" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="4" />
      <circle
        cx="28" cy="28" r={r}
        fill="none"
        stroke={match.color}
        strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
      />
      <text x="28" y="32" textAnchor="middle" fontSize="12" fontWeight="700" fill={match.color} fontFamily="inherit">
        {score}%
      </text>
    </svg>
  );
}

function ResultsContent() {
  const params = useSearchParams();
  const topParam = params.get("top") ?? "";
  const facParam = params.get("fac") ?? "";

  const topUnis = topParam
    .split(",")
    .map((s) => {
      const [id, score] = s.split(":");
      const uni = universities.find((u) => u.id === id);
      return uni ? { uni, score: parseInt(score, 10) } : null;
    })
    .filter(Boolean) as { uni: (typeof universities)[0]; score: number }[];

  const topFaculties = facParam
    .split(",")
    .map((s) => {
      const [faculty] = s.split(":");
      return FACULTY_LABELS[faculty] ? { faculty, ...FACULTY_LABELS[faculty] } : null;
    })
    .filter(Boolean) as { faculty: string; name: string; icon: string; description: string }[];

  if (topUnis.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <p style={{ color: "var(--text-3)" }}>No results found.</p>
        <Link href="/quiz" className="btn-primary" style={{ marginTop: 24, display: "inline-flex" }}>Retake quiz</Link>
      </div>
    );
  }

  const [best, ...rest] = topUnis;
  const bestMatch = getMatchLabel(best.score);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px 100px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "5px 14px", borderRadius: 99,
          background: "var(--accent-dim)", border: "1px solid var(--accent-border)",
          fontSize: 12, fontWeight: 600, color: "var(--accent)",
          marginBottom: 20,
        }}>
          Quiz complete
        </div>
        <h1 style={{
          fontSize: "clamp(32px, 5vw, 52px)",
          fontWeight: 800,
          letterSpacing: "-1px",
          lineHeight: 1.1,
          color: "var(--text-1)",
          margin: "0 0 16px",
        }}>
          Your university profile
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 480, margin: "0 auto" }}>
          Based on your answers, here are your top matches across Europe.
        </p>
      </div>

      {/* Best match hero */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--accent-border)",
        borderRadius: 20,
        padding: "32px",
        marginBottom: 16,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, right: 0, width: 200, height: 200,
          background: "radial-gradient(circle at 80% 20%, var(--accent-dim) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
          <span style={{
            fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em",
            color: "var(--accent)", fontWeight: 600,
          }}>Best match</span>
        </div>

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 200 }}>
            <span style={{ fontSize: 44, lineHeight: 1 }}>{best.uni.flag}</span>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.4px" }}>
                {best.uni.name}
              </h2>
              <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>
                {best.uni.city} · {best.uni.country}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {best.uni.strengths.slice(0, 3).map((s) => (
                  <span key={s} style={{
                    padding: "2px 9px", borderRadius: 6,
                    background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                    fontSize: 11, color: "var(--text-3)",
                  }}>{s}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <ScoreRing score={best.score} />
            <span style={{ fontSize: 11, color: bestMatch.color, fontWeight: 600 }}>{bestMatch.label}</span>
          </div>
        </div>

        <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, margin: "20px 0 0", maxWidth: 560 }}>
          {best.uni.description}
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <Link
            href={`/universities/${best.uni.id}`}
            style={{
              padding: "11px 20px", borderRadius: 10, background: "var(--text-1)", color: "var(--bg)",
              fontSize: 13, fontWeight: 700, textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 6, transition: "opacity 0.15s",
            }}
          >
            Explore programmes →
          </Link>
          <Link
            href="/compare"
            style={{
              padding: "11px 20px", borderRadius: 10, background: "transparent", color: "var(--text-2)",
              fontSize: 13, fontWeight: 500, textDecoration: "none",
              border: "1px solid var(--border)", display: "inline-flex", alignItems: "center", gap: 6, transition: "border-color 0.15s, color 0.15s",
            }}
          >
            Compare
          </Link>
        </div>
      </div>

      {/* Other 4 matches */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 56 }}>
        {rest.map(({ uni, score }, i) => {
          const match = getMatchLabel(score);
          return (
            <Link
              key={uni.id}
              href={`/universities/${uni.id}`}
              style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "18px 22px", borderRadius: 14,
                background: "var(--surface)", border: "1px solid var(--border)",
                textDecoration: "none", transition: "border-color 0.15s, transform 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-strong)";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateX(4px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateX(0)";
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-3)", width: 20, textAlign: "center", flexShrink: 0 }}>
                #{i + 2}
              </span>
              <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{uni.flag}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>{uni.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{uni.city} · {uni.country}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: match.color }}>{score}%</span>
                <span style={{ fontSize: 11, color: "var(--text-3)" }}>{match.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Faculty recommendations */}
      {topFaculties.length > 0 && (
        <div style={{ marginBottom: 56 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 8 }}>
              Fields of study
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.4px" }}>
              Your top faculties
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {topFaculties.map((f, i) => (
              <div
                key={f.faculty}
                style={{
                  padding: "20px", borderRadius: 14,
                  background: i === 0 ? "var(--accent-dim)" : "var(--surface)",
                  border: `1px solid ${i === 0 ? "var(--accent-border)" : "var(--border)"}`,
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 6 }}>{f.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.6 }}>{f.description}</div>
                {i === 0 && (
                  <div style={{
                    marginTop: 10, fontSize: 10, fontWeight: 600, color: "var(--accent)",
                    fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em",
                  }}>
                    Best fit
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{
        padding: "28px 32px", borderRadius: 16,
        background: "var(--surface)", border: "1px solid var(--border)",
        display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>Want deeper guidance?</div>
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>Ask the AI assistant to explain your results in detail.</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/chat" className="btn-primary" style={{ fontSize: 13 }}>Ask AI assistant</Link>
          <Link href="/quiz" style={{
            padding: "11px 20px", borderRadius: 10, background: "transparent", color: "var(--text-2)",
            fontSize: 13, fontWeight: 500, textDecoration: "none", border: "1px solid var(--border)",
          }}>
            Retake quiz
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ fontSize: 14, color: "var(--text-3)" }}>Loading results…</div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
