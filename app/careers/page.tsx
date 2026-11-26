"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getUniversities, type University } from "../../utils/universities";
import {
  fields,
  fieldById,
  fieldForProgramme,
  reportedOutcomeFor,
  ENTRY_LABEL,
  type Entry,
  type Field,
  type ReportedOutcome,
} from "../data/careerOutcomes";

/* ─── Shared styles ─────────────────────────────── */
const MONO: React.CSSProperties = {
  fontSize: 10,
  fontFamily: "var(--font-mono)",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--text-3)",
};

const CARD: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
};

const SELECT: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "10px 36px 10px 14px",
  fontSize: 14,
  fontFamily: "inherit",
  color: "var(--text-1)",
  outline: "none",
  cursor: "pointer",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23888' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  width: "100%",
};

const ENTRY_COLOR: Record<Entry, { fg: string; bg: string; border: string }> = {
  bachelor: { fg: "var(--green)", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)" },
  master: { fg: "var(--accent)", bg: "var(--accent-dim)", border: "var(--accent-border)" },
  licence: { fg: "#93a5ff", bg: "rgba(147,165,255,0.1)", border: "rgba(147,165,255,0.3)" },
};

function SectionTitle({ kicker, title, note }: { kicker: string; title: string; note?: string }) {
  return (
    <div style={{ margin: "56px 0 18px" }}>
      <div style={{ ...MONO, color: "var(--accent)", marginBottom: 8 }}>{kicker}</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.4px", color: "var(--text-1)", margin: 0 }}>{title}</h2>
      {note && <p style={{ fontSize: 13, color: "var(--text-2)", margin: "8px 0 0", lineHeight: 1.6 }}>{note}</p>}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ padding: "4px 10px", borderRadius: 6, background: "var(--chip)", border: "1px solid var(--border)", fontSize: 12.5, color: "var(--text-2)" }}>
      {children}
    </span>
  );
}

/* ─── Programme picked from the catalogue ───────── */
type Picked = { uni: University; bachelorId: string; bachelorName: string };

type CatalogueEntry = { uni: University; bachelorId: string; name: string; field: Field; reported: boolean };

/* ─── Reported outcomes card ────────────────────── */
function ReportedCard({ outcome, picked }: { outcome: ReportedOutcome; picked: Picked }) {
  return (
    <div style={{ ...CARD, padding: "28px 28px 24px", borderColor: "rgba(52,211,153,0.3)" }}>
      <div style={{ ...MONO, color: "var(--green)", marginBottom: 8 }}>Reported by the source · checked {outcome.checkedOn}</div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", margin: "0 0 8px", letterSpacing: "-0.3px" }}>
        Published graduate outcomes · {picked.uni.name}
      </h3>
      {/* The population line says exactly who was measured: the programme, a
          whole department, or the faculty's master's graduates. */}
      <p style={{ fontSize: 13.5, color: "var(--text-1)", margin: "0 0 22px", lineHeight: 1.6 }}>
        <span style={{ color: "var(--text-3)" }}>Who was measured: </span>{outcome.population}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 10, marginBottom: 24 }}>
        {outcome.figures.map((f) => (
          <div key={f.label} style={{ background: "var(--surface-2)", borderRadius: 10, padding: "16px 16px 14px" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.6px", lineHeight: 1.1 }}>{f.value}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-2)", marginTop: 6, lineHeight: 1.45 }}>{f.label}</div>
          </div>
        ))}
      </div>

      {outcome.sectors && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ ...MONO, marginBottom: 12 }}>Sectors</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {outcome.sectors.map((s) => (
              <div key={s.name} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 56px", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-1)", marginBottom: 5 }}>{s.name}</div>
                  <div style={{ height: 6, borderRadius: 3, background: "var(--chip-strong)", overflow: "hidden" }}>
                    <div style={{ width: s.share, height: "100%", background: "var(--green)", borderRadius: 3 }} />
                  </div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", textAlign: "right" }}>{s.share}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {outcome.roles && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...MONO, marginBottom: 10 }}>Job titles</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{outcome.roles.map((r) => <Chip key={r}>{r}</Chip>)}</div>
        </div>
      )}

      {outcome.employers && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...MONO, marginBottom: 10 }}>Top employers, most frequent first</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{outcome.employers.map((e) => <Chip key={e}>{e}</Chip>)}</div>
        </div>
      )}

      {outcome.caveat && (
        <p style={{ fontSize: 12.5, color: "var(--text-3)", margin: "0 0 10px", lineHeight: 1.6 }}>{outcome.caveat}</p>
      )}
      <a href={outcome.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: "var(--accent)", textDecoration: "none" }}>
        Source: {outcome.source} ↗
      </a>
    </div>
  );
}

/* ─── Field detail ──────────────────────────────── */
function FieldDetail({ field }: { field: Field }) {
  return (
    <>
      <SectionTitle kicker="Roles" title="What graduates actually do" note="The jobs graduates of this field hold, and what each one realistically requires beyond the bachelor." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
        {field.roles.map((r) => {
          const c = ENTRY_COLOR[r.entry];
          return (
            <div key={r.title} style={{ ...CARD, padding: "18px 18px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.2px" }}>{r.title}</div>
              <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55, flex: 1 }}>{r.what}</div>
              <span style={{ alignSelf: "flex-start", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 5, color: c.fg, background: c.bg, border: `1px solid ${c.border}` }}>
                {ENTRY_LABEL[r.entry]}
              </span>
            </div>
          );
        })}
      </div>

      <SectionTitle kicker="Employers" title="Who hires them" note="Examples of organisations that recruit graduates of this field across Europe, grouped by sector. They are not a claim about any single university." />
      <div style={{ ...CARD, overflow: "hidden" }}>
        {field.employers.map((g, i) => (
          <div key={g.sector} style={{ padding: "16px 20px", borderBottom: i === field.employers.length - 1 ? "none" : "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: "10px 20px", alignItems: "baseline" }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-1)", minWidth: 220, flex: "0 0 auto" }}>{g.sector}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flex: 1, minWidth: 0 }}>
              {g.examples.map((e) => <Chip key={e}>{e}</Chip>)}
            </div>
          </div>
        ))}
      </div>

      <SectionTitle kicker="Careers" title="Realistic career paths" note="Typical progressions from first job to senior level. Timing varies with country, employer and performance." />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {field.paths.map((p) => (
          <div key={p.name} style={{ ...CARD, padding: "16px 20px" }}>
            <div style={{ ...MONO, marginBottom: 12 }}>{p.name}</div>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
              {p.stages.map((s, i) => (
                <li key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize: 13, padding: "6px 12px", borderRadius: 8,
                    background: i === p.stages.length - 1 ? "var(--accent-dim)" : "var(--surface-2)",
                    border: `1px solid ${i === p.stages.length - 1 ? "var(--accent-border)" : "var(--border)"}`,
                    color: i === p.stages.length - 1 ? "var(--accent)" : "var(--text-1)",
                  }}>{s}</span>
                  {i < p.stages.length - 1 && <span aria-hidden style={{ color: "var(--text-3)" }}>→</span>}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <SectionTitle kicker="Reality check" title="What to know before you choose" />
      <div style={{ ...CARD, padding: "8px 20px" }}>
        {field.realityCheck.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i === field.realityCheck.length - 1 ? "none" : "1px solid var(--border)" }}>
            <span style={{ color: "var(--accent)", fontWeight: 700, flexShrink: 0, lineHeight: 1.6 }}>!</span>
            <span style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>{r}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── Page ──────────────────────────────────────── */
export default function CareersPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [fieldId, setFieldId] = useState<string>(fields[0].id);
  const [uniId, setUniId] = useState("");
  const [bachelorId, setBachelorId] = useState("");

  // Deep links: /careers?field=law or /careers?uni=maastricht&programme=psychology
  // (the programme page links here). Applied once the catalogue has loaded.
  useEffect(() => {
    getUniversities()
      .then((list) => {
        setUniversities(list);
        const p = new URLSearchParams(window.location.search);
        const f = p.get("field");
        if (f && fieldById[f]) setFieldId(f);
        const u = p.get("uni");
        if (u) {
          setUniId(u);
          setBachelorId(p.get("programme") ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const catalogue: CatalogueEntry[] = useMemo(
    () =>
      universities.flatMap((uni) =>
        uni.bachelors.map((b) => ({
          uni,
          bachelorId: b.id,
          name: b.name,
          field: fieldForProgramme(uni.id, b.id, b.name),
          reported: !!reportedOutcomeFor(uni.id, b.id),
        }))
      ),
    [universities]
  );

  const uni = universities.find((u) => u.id === uniId) ?? null;
  const bachelor = uni?.bachelors.find((b) => b.id === bachelorId) ?? null;
  const picked: Picked | null = uni && bachelor ? { uni, bachelorId: bachelor.id, bachelorName: bachelor.name } : null;

  // A picked programme decides the field; otherwise the field chip does.
  const field = picked ? fieldForProgramme(picked.uni.id, picked.bachelorId, picked.bachelorName) : fieldById[fieldId];
  const reported = picked ? reportedOutcomeFor(picked.uni.id, picked.bachelorId) : undefined;
  const inField = catalogue.filter((c) => c.field.id === field.id);

  // Keep the URL shareable without triggering a navigation.
  // Waits for the catalogue, otherwise it would overwrite a deep link before
  // the loader above has read it.
  useEffect(() => {
    if (loading) return;
    const p = new URLSearchParams();
    if (picked) {
      p.set("uni", picked.uni.id);
      p.set("programme", picked.bachelorId);
    } else {
      p.set("field", fieldId);
    }
    window.history.replaceState(null, "", `/careers?${p.toString()}`);
  }, [loading, picked?.uni.id, picked?.bachelorId, fieldId]); // eslint-disable-line react-hooks/exhaustive-deps

  const universitiesByCountry = useMemo(() => {
    const groups: Record<string, University[]> = {};
    for (const u of universities) (groups[u.country] ??= []).push(u);
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [universities]);

  const pickField = (id: string) => {
    setFieldId(id);
    setUniId("");
    setBachelorId("");
  };

  const pickProgramme = (u: string, b: string) => {
    setUniId(u);
    setBachelorId(b);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(16px, 4vw, 32px) 96px" }}>
      {/* ── Header ──────────────────────────────── */}
      <div style={{ padding: "72px 0 40px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ ...MONO, color: "var(--accent)", marginBottom: 14 }}>Career outcomes</div>
        <h1 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-1px", color: "var(--text-1)", margin: "0 0 12px", lineHeight: 1.05 }}>
          Where does this degree lead?
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-2)", margin: 0, maxWidth: 680, lineHeight: 1.6 }}>
          Choosing a university is choosing a career. Pick a field or a specific programme to see the roles graduates hold, the employers that hire them and the careers they can realistically build.
        </p>
      </div>

      {/* ── Pickers ─────────────────────────────── */}
      <div style={{ padding: "32px 0 8px" }}>
        <div style={{ ...MONO, marginBottom: 12 }}>Start from a field</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(150px, 45%), 1fr))", gap: 8 }}>
          {fields.map((f) => {
            const active = f.id === field.id;
            const count = catalogue.filter((c) => c.field.id === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => pickField(f.id)}
                aria-pressed={active}
                style={{
                  textAlign: "left", fontFamily: "inherit", cursor: "pointer",
                  padding: "14px 14px 12px", borderRadius: 10,
                  background: active ? "var(--accent-dim)" : "var(--surface)",
                  border: `1px solid ${active ? "var(--accent-border)" : "var(--border)"}`,
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: active ? "var(--accent)" : "var(--text-1)", marginBottom: 4 }}>{f.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.45 }}>{f.short}</div>
                {!loading && <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 8 }}>{count} programme{count === 1 ? "" : "s"} on 4UNI</div>}
              </button>
            );
          })}
        </div>

        <div style={{ ...MONO, margin: "28px 0 12px" }}>Or a specific programme</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
          <select
            aria-label="University"
            value={uniId}
            onChange={(e) => { setUniId(e.target.value); setBachelorId(""); }}
            disabled={loading}
            style={{ ...SELECT, color: uniId ? "var(--text-1)" : "var(--text-3)" }}
          >
            <option value="">{loading ? "Loading universities…" : "Choose a university"}</option>
            {universitiesByCountry.map(([country, list]) => (
              <optgroup key={country} label={country}>
                {list.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </optgroup>
            ))}
          </select>
          <select
            aria-label="Programme"
            value={bachelorId}
            onChange={(e) => setBachelorId(e.target.value)}
            disabled={!uni}
            style={{ ...SELECT, color: bachelorId ? "var(--text-1)" : "var(--text-3)", opacity: uni ? 1 : 0.4, cursor: uni ? "pointer" : "not-allowed" }}
          >
            <option value="">Choose a programme</option>
            {uni?.bachelors.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      {/* ── Selected field / programme ──────────── */}
      <div style={{ marginTop: 40, paddingTop: 40, borderTop: "1px solid var(--border)" }}>
        {picked && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>{picked.uni.flag}</span>
            <span style={{ fontSize: 14, color: "var(--text-2)" }}>{picked.uni.name} · {picked.bachelorName}</span>
            <Link href={`/universities/${picked.uni.id}/${picked.bachelorId}`} style={{ fontSize: 12.5, color: "var(--accent)", textDecoration: "none" }}>Programme page →</Link>
          </div>
        )}
        <h2 style={{ fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 800, letterSpacing: "-0.8px", color: "var(--text-1)", margin: "0 0 12px" }}>{field.name}</h2>
        <p style={{ fontSize: 15.5, color: "var(--text-2)", margin: "0 0 28px", maxWidth: 760, lineHeight: 1.7 }}>{field.summary}</p>

        {picked && reported && <ReportedCard outcome={reported} picked={picked} />}
        {picked && !reported && (
          <div style={{ ...CARD, padding: "16px 20px", fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.6 }}>
            {picked.uni.name} does not publish graduate outcomes for this programme that we have been able to verify yet. Below is what {field.name.toLowerCase()} graduates go on to do across Europe.
          </div>
        )}

        <FieldDetail field={field} />

        {/* ── Where to study it ──────────────────── */}
        <SectionTitle
          kicker="Where to study it"
          title={`${inField.length} ${field.name} programme${inField.length === 1 ? "" : "s"} on 4UNI`}
          note="Programmes marked with published outcomes have figures reported by the university or by official graduate surveys."
        />
        {loading ? (
          <div style={{ color: "var(--text-3)", fontSize: 14 }}>Loading programmes…</div>
        ) : (
          <div style={{ ...CARD, overflow: "hidden" }}>
            {inField
              .slice()
              .sort((a, b) => Number(b.reported) - Number(a.reported) || a.uni.country.localeCompare(b.uni.country) || a.uni.name.localeCompare(b.uni.name))
              .map((c, i, arr) => {
                const active = picked?.uni.id === c.uni.id && picked?.bachelorId === c.bachelorId;
                return (
                  <button
                    key={`${c.uni.id}/${c.bachelorId}`}
                    onClick={() => pickProgramme(c.uni.id, c.bachelorId)}
                    style={{
                      width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
                      background: active ? "var(--accent-dim)" : "transparent",
                      border: "none", borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--border)",
                    }}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{c.uni.flag}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 14, color: "var(--text-1)", fontWeight: 600 }}>{c.name}</span>
                      <span style={{ display: "block", fontSize: 12.5, color: "var(--text-3)" }}>{c.uni.name} · {c.uni.city}</span>
                    </span>
                    {c.reported && (
                      <span style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 700, color: "var(--green)", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", padding: "3px 8px", borderRadius: 5 }}>
                        Published outcomes
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        )}

        {/* ── Method ─────────────────────────────── */}
        <div style={{ marginTop: 56, padding: "20px 22px", borderRadius: 12, background: "var(--panel)", border: "1px solid var(--border)" }}>
          <div style={{ ...MONO, marginBottom: 10 }}>How this page is built</div>
          <p style={{ fontSize: 13, color: "var(--text-2)", margin: "0 0 8px", lineHeight: 1.7 }}>
            Two kinds of information, kept separate. Roles, employers, career paths and the reality check describe the European job market for each field; they are written by 4UNI and apply to every programme in that field. Figures in the green box come from the university or from official graduate surveys, with the source linked and the date we checked it.
          </p>
          <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0, lineHeight: 1.7 }}>
            Most continental European universities publish outcomes only for master&apos;s graduates, because most of their bachelor graduates continue studying. When that is the case we say so.
          </p>
        </div>
      </div>
    </div>
  );
}
