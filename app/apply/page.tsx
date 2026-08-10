"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUniversities, type University, type Bachelor } from "../../utils/universities";

/* ─── University search picker — type-to-filter combobox ───────────────
   Same pattern as the one on the Compare page, single-select. ────────── */
function UniversityPicker({
  universities,
  value,
  onChange,
}: {
  universities: University[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = universities.find((u) => u.id === value) ?? null;

  // The dropdown caps how many results it renders at once (a long unfiltered
  // list would be unusable) — but that's just a display cap, not the actual
  // dataset. Typing searches the full list, not just what's currently shown.
  const RESULT_CAP = 12;
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return universities.slice(0, RESULT_CAP);
    return universities
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.city.toLowerCase().includes(q) ||
          u.country.toLowerCase().includes(q)
      )
      .slice(0, RESULT_CAP);
  }, [query, universities]);
  const showCapHint = query.trim() === "" && universities.length > RESULT_CAP;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function pick(id: string) {
    onChange(id);
    setQuery("");
    setOpen(false);
  }

  function openForEditing() {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      {selected && !open ? (
        <button
          onClick={openForEditing}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 8, padding: "13px 14px 13px 16px", borderRadius: 12,
            border: "1px solid var(--accent-border)", background: "var(--accent-dim)",
            textAlign: "left", cursor: "pointer", fontFamily: "inherit", fontSize: 15,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{selected.flag}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-1)", fontWeight: 600 }}>{selected.name}</span>
            <span style={{ color: "var(--text-3)", fontSize: 13, flexShrink: 0 }}>· {selected.city}</span>
          </span>
          <span
            onClick={(e) => { e.stopPropagation(); onChange(""); setQuery(""); }}
            style={{ color: "var(--text-3)", fontSize: 16, padding: "0 2px", flexShrink: 0, lineHeight: 1 }}
          >
            ×
          </span>
        </button>
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search by name, city or country…"
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          style={{
            width: "100%", padding: "13px 16px", borderRadius: 12,
            border: "1px solid var(--border)", background: "var(--surface)",
            fontSize: 15, color: "var(--text-1)", outline: "none", fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
      )}

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 50,
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10,
          boxShadow: "0 8px 20px rgba(0,0,0,0.35)", maxHeight: 280, overflowY: "auto",
        }}>
          {results.length === 0 ? (
            <div style={{ padding: 14, fontSize: 13, color: "var(--text-3)" }}>No matches for &ldquo;{query}&rdquo;</div>
          ) : (
            results.map((u) => (
              <button
                key={u.id}
                onClick={() => pick(u.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                  padding: "10px 14px", border: "none", textAlign: "left", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 14, background: u.id === value ? "var(--surface-2)" : "transparent",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = u.id === value ? "var(--surface-2)" : "transparent")}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{u.flag}</span>
                <span style={{ color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</span>
                <span style={{ color: "var(--text-3)", flexShrink: 0 }}>· {u.city}</span>
              </button>
            ))
          )}
          {showCapHint && (
            <div style={{ padding: "7px 14px", fontSize: 11, color: "var(--text-3)", borderTop: "1px solid var(--border)" }}>
              Showing {RESULT_CAP} of {universities.length} — keep typing to search all
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApplyGuidePicker() {
  const router = useRouter();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [uniId, setUniId] = useState("");
  const [programmeId, setProgrammeId] = useState("");

  useEffect(() => {
    getUniversities().then(setUniversities).finally(() => setLoading(false));
  }, []);

  const uni = useMemo(() => universities.find((u) => u.id === uniId) ?? null, [universities, uniId]);

  // Reset the programme choice whenever the university changes.
  useEffect(() => {
    setProgrammeId("");
  }, [uniId]);

  const canContinue = !!uniId && !!programmeId;

  function handleContinue() {
    if (!canContinue) return;
    router.push(`/universities/${uniId}/apply?programme=${programmeId}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Top bar */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "16px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link
          href="/universities"
          style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-3)", fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "color 0.15s" }}
          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-1)")}
          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-3)")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Universities
        </Link>
        <span style={{ color: "var(--border)", fontSize: 14 }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>Application Guide</span>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "64px 24px 80px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999,
          background: "var(--accent-dim)", border: "1px solid var(--accent-border)",
          fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 16,
        }}>
          Application Guide
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Let&rsquo;s get you applying.
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-3)", lineHeight: 1.6, margin: "0 0 36px" }}>
          Pick your university and programme, and we&rsquo;ll build a step-by-step guide — eligibility, documents, language proof, deadlines and housing — tailored to exactly what you need.
        </p>

        {loading ? (
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>Loading universities…</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Step 1 — university */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                1. Choose your university
              </span>
              <UniversityPicker universities={universities} value={uniId} onChange={setUniId} />
            </div>

            {/* Step 2 — programme */}
            {uni && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  2. Choose your programme
                </span>
                {uni.bachelors.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--text-3)" }}>No programmes listed for {uni.name} yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {uni.bachelors.map((b: Bachelor) => (
                      <div
                        key={b.id}
                        onClick={() => setProgrammeId(b.id)}
                        style={{
                          padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                          border: programmeId === b.id ? "1px solid rgba(201,163,92,0.5)" : "1px solid var(--border)",
                          background: programmeId === b.id ? "rgba(201,163,92,0.07)" : "var(--surface)",
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{b.name}</span>
                          <div style={{ display: "flex", gap: 6 }}>
                            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-3)" }}>{b.duration}</span>
                            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)", color: "rgb(96,165,250)" }}>{b.language}</span>
                          </div>
                        </div>
                        <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{b.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Continue */}
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              style={{
                marginTop: 8, padding: "14px 22px", borderRadius: 12, border: "none",
                background: canContinue ? "var(--accent)" : "var(--surface-2)",
                color: canContinue ? "#1a1410" : "var(--text-3)",
                fontSize: 14, fontWeight: 700, cursor: canContinue ? "pointer" : "not-allowed",
                fontFamily: "inherit", transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={e => { if (canContinue) e.currentTarget.style.transform = "scale(1.02)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              Continue to my guide →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
