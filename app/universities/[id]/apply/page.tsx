"use client";

import { use, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { universities } from "../../../data/universities";
import { universityMeta } from "../../../data/universityMeta";
import ApplyPageLayout from "../../../components/ApplyPageLayout";

// ── Helpers ───────────────────────────────────────────────────────

const MONTH_NAMES = ["","January","February","March","April","May","June","July","August","September","October","November","December"];

function daysUntil(deadline: string): number | null {
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}

// ── Application steps definition ─────────────────────────────────

type Step = {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: "done" | "current" | "pending";
};

// ── Chat panel (right column) ─────────────────────────────────────

type Msg = { role: "user" | "assistant"; content: string };

const IS_PREMIUM = false; // toggle this when auth is wired up

function AiChatPanel({ uniName, programme }: { uniName: string; programme: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content: `Hi! I'm your 4UNI assistant 👋\n\nI can help you with your application to **${uniName}**. Ask me anything — documents needed, motivation letter tips, deadlines, housing, or what student life is like there.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
          context: `The student is applying to ${uniName}, programme: ${programme}.`,
        }),
      });
      const data = await res.json();
      if (data.error === "daily_limit") {
        setMsgs(m => [...m, { role: "assistant", content: data.message }]);
      } else {
        setMsgs(m => [...m, { role: "assistant", content: data.content ?? "Sorry, something went wrong." }]);
      }
    } catch {
      setMsgs(m => [...m, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  if (!IS_PREMIUM) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 0 }}>
        {/* Header */}
        <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgb(167,139,250)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>4UNI AI</div>
            <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>PREMIUM FEATURE</div>
          </div>
        </div>

        {/* Locked state */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center", gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(167,139,250)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-1)", marginBottom: 8, letterSpacing: "-0.3px" }}>AI Assistant — Premium</div>
            <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.7, margin: 0 }}>
              Get personalised help with your application — motivation letter tips, document checklists, deadline reminders, and more.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
            {[
              "✍️  Review my motivation letter",
              "📋  What documents do I need?",
              "🏠  Find housing in this city",
              "💰  Scholarships I can apply for",
            ].map(s => (
              <div key={s} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", fontSize: 12, color: "var(--text-3)", textAlign: "left", opacity: 0.6 }}>{s}</div>
            ))}
          </div>
          <Link
            href="/pricing"
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, background: "linear-gradient(135deg, rgb(167,139,250), rgb(96,165,250))", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", textAlign: "center", display: "block", transition: "opacity 0.15s" }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.88")}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
          >
            Unlock Premium →
          </Link>
          <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0 }}>Or try 5 free questions in the <Link href="/chat" style={{ color: "var(--text-2)", textDecoration: "underline" }}>AI Chat</Link></p>
        </div>
      </div>
    );
  }

  // ── Premium: full chat ──
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgb(167,139,250)" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>4UNI AI</div>
          <div style={{ fontSize: 10, color: "rgb(52,211,153)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>● ONLINE</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", gap: 8, alignItems: "flex-end" }}>
            {m.role === "assistant" && (
              <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: "rgba(167,139,250,0.18)", border: "1px solid rgba(167,139,250,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>4</div>
            )}
            <div style={{ maxWidth: "80%" }}>
              <div style={{
                padding: "10px 13px",
                borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: m.role === "user" ? "rgba(167,139,250,0.18)" : "rgba(255,255,255,0.06)",
                border: m.role === "user" ? "1px solid rgba(167,139,250,0.3)" : "1px solid rgba(255,255,255,0.08)",
                fontSize: 13, color: "var(--text-1)", lineHeight: 1.6, whiteSpace: "pre-wrap",
              }}>{m.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(167,139,250,0.18)", border: "1px solid rgba(167,139,250,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>4</div>
            <div style={{ padding: "12px 16px", borderRadius: "16px 16px 16px 4px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 5, alignItems: "center" }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-3)", animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask anything about this application…"
          style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "var(--text-1)", fontSize: 13, outline: "none", fontFamily: "inherit", transition: "border-color 0.15s" }}
          onFocus={e => (e.target.style.borderColor = "rgba(167,139,250,0.5)")}
          onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
        />
        <button onClick={send} disabled={!input.trim() || loading} style={{ width: 38, height: 38, borderRadius: 10, border: "none", cursor: input.trim() && !loading ? "pointer" : "default", background: input.trim() && !loading ? "rgba(167,139,250,0.9)" : "rgba(255,255,255,0.07)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const uni = universities.find(u => u.id === id);
  if (!uni) notFound();

  const meta = universityMeta[uni.id];
  const [activeStep, setActiveStep] = useState(0);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [selectedProgramme, setSelectedProgramme] = useState(uni.bachelors[0]?.id ?? "");

  const programme = uni.bachelors.find(b => b.id === selectedProgramme) ?? uni.bachelors[0];

  const deadline = meta?.applicationDeadline ?? "Check university website";
  const days = meta?.applicationDeadline ? daysUntil(meta.applicationDeadline) : null;

  const STEPS = [
    {
      id: "eligibility",
      label: "Check eligibility",
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    },
    {
      id: "programme",
      label: "Choose programme",
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    },
    {
      id: "documents",
      label: "Prepare documents",
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    },
    {
      id: "language",
      label: "Language proof",
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    },
    {
      id: "submit",
      label: "Submit application",
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    },
    {
      id: "housing",
      label: "Sort housing",
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    },
    {
      id: "response",
      label: "Wait for response",
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
  ];

  // Step content
  const CONTENT: Record<string, React.ReactNode> = {
    eligibility: (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>Admission requirements</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(meta?.requirements ?? ["Check the university website for requirements"]).map((r: string, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgb(52,211,153)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{ fontSize: 14, color: "var(--text-1)", lineHeight: 1.55 }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
        {meta?.scholarships && (
          <div style={{ padding: "16px 18px", borderRadius: 12, border: "1px solid rgba(251,191,36,0.25)", background: "rgba(251,191,36,0.05)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgb(251,191,36)", marginBottom: 5 }}>🎓 Scholarships available</div>
            <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0, lineHeight: 1.6 }}>
              {uni.name} offers merit and need-based scholarships for international students. Ask the AI assistant on the right for details.
            </p>
          </div>
        )}
      </div>
    ),

    programme: (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>Available programmes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {uni.bachelors.map(b => (
              <div
                key={b.id}
                onClick={() => setSelectedProgramme(b.id)}
                style={{
                  padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                  border: selectedProgramme === b.id ? "1px solid rgba(167,139,250,0.5)" : "1px solid var(--border)",
                  background: selectedProgramme === b.id ? "rgba(167,139,250,0.07)" : "var(--surface)",
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
        </div>
        {programme && (
          <div style={{ padding: "18px 20px", borderRadius: 14, border: "1px solid rgba(167,139,250,0.3)", background: "rgba(167,139,250,0.05)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgb(167,139,250)", marginBottom: 10 }}>Selected: {programme.name}</div>
            <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65, margin: "0 0 14px" }}>{programme.description}</p>
            {programme.courses.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Year 1 courses</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {programme.courses.filter(c => c.year === 1).map(c => (
                    <span key={c.name} style={{ padding: "3px 9px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 11, color: "var(--text-3)", background: "rgba(255,255,255,0.02)" }}>{c.name}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    ),

    documents: (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>What to prepare</div>
        {[
          { icon: "🎓", title: "Diploma / High school certificate", desc: "Official copy of your secondary school diploma. If not in English, Dutch, French or German — get a certified translation.", required: true },
          { icon: "📊", title: "Official grade transcripts", desc: "Complete academic record from your secondary school, showing all subjects and grades.", required: true },
          { icon: "✍️", title: "Motivation letter", desc: "500–800 words explaining why this programme and why this university. Be specific — mention the curriculum, teaching method and your goals.", required: true },
          { icon: "📋", title: "CV / Résumé", desc: "Academic and extracurricular achievements. Keep it to 1 page.", required: true },
          { icon: "🌐", title: "Language certificate", desc: "IELTS, TOEFL, Cambridge or equivalent. Check language step for minimum scores.", required: true },
          { icon: "🪪", title: "Passport / ID copy", desc: "Valid government-issued photo ID.", required: true },
          { icon: "📝", title: "Reference letter", desc: "One or two letters from teachers or professors. Optional for most programmes but recommended.", required: false },
          { icon: "💰", title: "Proof of funds (if required)", desc: "Some universities require evidence you can cover living costs. Check the university website.", required: false },
        ].map(({ icon, title, desc, required }) => (
          <div key={title} style={{ display: "flex", gap: 14, padding: "16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)" }}>
            <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{title}</span>
                <span style={{
                  fontSize: 9, padding: "2px 6px", borderRadius: 4, fontFamily: "var(--font-mono)", letterSpacing: "0.06em", fontWeight: 700,
                  background: required ? "rgba(248,113,113,0.12)" : "rgba(255,255,255,0.05)",
                  border: required ? "1px solid rgba(248,113,113,0.3)" : "1px solid var(--border)",
                  color: required ? "rgb(248,113,113)" : "var(--text-3)",
                }}>{required ? "REQUIRED" : "OPTIONAL"}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0, lineHeight: 1.6 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),

    language: (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
          Language of instruction
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          {uni.languages.map(l => (
            <span key={l} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(96,165,250,0.3)", background: "rgba(96,165,250,0.08)", fontSize: 13, fontWeight: 700, color: "rgb(96,165,250)" }}>{l}</span>
          ))}
        </div>
        {uni.languages.includes("English") && (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>Accepted English certificates</div>
            {[
              { test: "IELTS Academic", score: "6.0 overall (no band below 5.5)", color: "52,211,153" },
              { test: "TOEFL iBT",      score: "80 overall",                      color: "96,165,250" },
              { test: "Cambridge B2",   score: "B2 First (FCE) or above",          color: "167,139,250" },
              { test: "Duolingo",       score: "105+ (check programme page)",      color: "251,191,36" },
            ].map(({ test, score, color }) => (
              <div key={test} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: `rgb(${color})`, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 2 }}>{test}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)" }}>{score}</div>
                </div>
              </div>
            ))}
            <div style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(251,191,36,0.2)", background: "rgba(251,191,36,0.04)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
              💡 <strong style={{ color: "var(--text-1)" }}>Tip:</strong> If you studied in an English-medium school for 3+ years, many universities will waive the language test. Check your specific programme requirements.
            </div>
          </>
        )}
      </div>
    ),

    submit: (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Deadline banner */}
        <div style={{
          padding: "20px 22px", borderRadius: 14,
          border: `1px solid ${days !== null && days < 30 ? "rgba(248,113,113,0.4)" : "rgba(52,211,153,0.3)"}`,
          background: `${days !== null && days < 30 ? "rgba(248,113,113,0.06)" : "rgba(52,211,153,0.05)"}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Application deadline</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px" }}>{deadline}</div>
          </div>
          {days !== null && (
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: days < 30 ? "rgb(248,113,113)" : "rgb(52,211,153)", letterSpacing: "-1px" }}>{days}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>DAYS LEFT</div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>How to submit</div>
          {[
            { num: "01", title: "Create a Studielink account", desc: "For Dutch universities, applications go through Studielink (studielink.nl). For other countries, apply directly on the university portal.", color: "96,165,250" },
            { num: "02", title: "Fill in your personal details", desc: "Your name, address, nationality, and secondary education details. Have your passport and diploma ready.", color: "96,165,250" },
            { num: "03", title: "Select your programme", desc: `Choose ${uni.name} → ${programme?.name ?? "your programme"}. Double-check the start date (September intake).`, color: "96,165,250" },
            { num: "04", title: "Upload all documents", desc: "Upload each required document as a PDF. Scans are fine — just make sure they're legible and complete.", color: "96,165,250" },
            { num: "05", title: "Pay the application fee (if any)", desc: "Some universities charge €50–100. Check the university website. EU/EEA students are sometimes exempt.", color: "96,165,250" },
          ].map(({ num, title, desc, color }) => (
            <div key={num} style={{ display: "flex", gap: 14, padding: "14px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: `rgb(${color})`, flexShrink: 0, marginTop: 2 }}>{num}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>{title}</div>
                <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0, lineHeight: 1.6 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
        {meta?.applicationLink && (
          <a href={meta.applicationLink} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 0", borderRadius: 12, background: "var(--text-1)", color: "var(--bg)", fontSize: 14, fontWeight: 700, textDecoration: "none", transition: "opacity 0.15s" }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}>
            Apply on {uni.name} website →
          </a>
        )}
      </div>
    ),

    housing: (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ padding: "18px 20px", borderRadius: 14, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.05)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "rgb(248,113,113)", marginBottom: 6 }}>⚠️ Start housing NOW</div>
          <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0, lineHeight: 1.65 }}>
            Student housing in {uni.city} is extremely competitive. Waitlists at official student housing can be 6–12 months. Start searching the moment you get your offer letter.
          </p>
        </div>
        {[
          { icon: "🏫", title: "University housing", desc: `Check ${uni.name}'s official student housing portal first. It's usually cheaper, safer, and easier for first-arrivals.`, color: "52,211,153" },
          { icon: "🤝", title: "Find a roommate on 4UNI", desc: "Browse student profiles looking for a flatmate in the same city and budget range. Verified profiles only.", color: "167,139,250", link: `/housing?city=${uni.city}` },
          { icon: "🏠", title: "Private platforms", desc: "Kamernet, WG-Gesucht, HousingAnywhere and Facebook groups. Never pay a deposit before viewing.", color: "96,165,250" },
        ].map(({ icon, title, desc, color, link }) => (
          <div key={title} style={{ display: "flex", gap: 14, padding: "16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)" }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>{title}</div>
              <p style={{ fontSize: 13, color: "var(--text-2)", margin: "0 0 8px", lineHeight: 1.6 }}>{desc}</p>
              {link && <Link href={link} style={{ fontSize: 12, fontWeight: 700, color: `rgb(${color})`, textDecoration: "none" }}>Browse roommates →</Link>}
            </div>
          </div>
        ))}
        <div style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--text-1)" }}>Estimated costs in {uni.city}:</strong>{" "}
          {meta ? `€${meta.livingCostMin}–€${meta.livingCostMax}/month` : "Check university website"} including rent, food, transport and personal expenses.
        </div>
      </div>
    ),

    response: (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>What happens next</div>
        {[
          { icon: "📧", title: "Confirmation email", desc: "You'll receive an automatic confirmation when your application is received. Check your spam folder." },
          { icon: "⏳", title: "Review period (4–10 weeks)", desc: "The admissions team reviews your documents. Some programmes are selective, others are first-come-first-served." },
          { icon: "✅", title: "Conditional offer", desc: "If accepted, you'll receive a conditional offer. This means you need to provide proof of your final diploma once you graduate." },
          { icon: "🎓", title: "Enrolment", desc: "After accepting your offer, you'll receive enrolment instructions. Pay tuition and register at the student services office." },
          { icon: "🏠", title: "Practical tasks", desc: "Register at the city hall (BRP in Netherlands), get health insurance, open a local bank account. The AI assistant can guide you through each one." },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{ display: "flex", gap: 14, padding: "14px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)" }}>
            <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>{title}</div>
              <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0, lineHeight: 1.6 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  };

  const stepKeys = STEPS.map(s => s.id);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-5px); }
        }
      `}</style>

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
        <span style={{ fontSize: 13, color: "var(--text-3)" }}>{uni.name}</span>
        <span style={{ color: "var(--border)", fontSize: 14 }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>Apply</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>Deadline: <strong style={{ color: "var(--text-1)" }}>{deadline}</strong></span>
          {days !== null && (
            <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 5, fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.06em", background: days < 30 ? "rgba(248,113,113,0.12)" : "rgba(52,211,153,0.1)", border: days < 30 ? "1px solid rgba(248,113,113,0.3)" : "1px solid rgba(52,211,153,0.25)", color: days < 30 ? "rgb(248,113,113)" : "rgb(52,211,153)" }}>
              {days}d left
            </span>
          )}
        </div>
      </div>

      {/* 3-column resizable layout */}
      <div style={{ height: "calc(100vh - 57px)" }}>
      <ApplyPageLayout
        storageKey="apply-layout-v1"
        left={
        /* ── LEFT: Sidebar checklist ── */
        <div style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
          {/* University header */}
          <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{uni.flag}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.3px", lineHeight: 1.25 }}>{uni.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 3 }}>{uni.city} · {uni.country}</div>
          </div>

          {/* Progress */}
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Progress</span>
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>{checkedSteps.size}/{STEPS.length}</span>
            </div>
            <div style={{ height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(checkedSteps.size / STEPS.length) * 100}%`, background: "rgb(52,211,153)", borderRadius: 2, transition: "width 0.4s ease" }} />
            </div>
          </div>

          {/* Steps */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
            {STEPS.map((s, i) => {
              const isActive = activeStep === i;
              const isDone = checkedSteps.has(i);
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveStep(i)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                    borderRadius: 10, cursor: "pointer", marginBottom: 2,
                    background: isActive ? "rgba(255,255,255,0.07)" : "transparent",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                >
                  {/* Check / step icon */}
                  <div
                    onClick={e => { e.stopPropagation(); setCheckedSteps(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; }); }}
                    style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      border: isDone ? "1px solid rgba(52,211,153,0.5)" : isActive ? "1px solid rgba(255,255,255,0.3)" : "1px solid var(--border)",
                      background: isDone ? "rgba(52,211,153,0.12)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: isDone ? "rgb(52,211,153)" : isActive ? "var(--text-1)" : "var(--text-3)",
                      transition: "all 0.15s", cursor: "pointer",
                    }}
                  >
                    {isDone
                      ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      : s.icon
                    }
                  </div>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? "var(--text-1)" : isDone ? "var(--text-3)" : "var(--text-2)", transition: "color 0.15s", textDecoration: isDone ? "line-through" : "none", opacity: isDone ? 0.6 : 1 }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div style={{ padding: "16px", borderTop: "1px solid var(--border)" }}>
            {meta?.applicationLink ? (
              <a href={meta.applicationLink} target="_blank" rel="noopener noreferrer" style={{ display: "block", width: "100%", padding: "11px 0", borderRadius: 10, background: "var(--text-1)", color: "var(--bg)", fontSize: 13, fontWeight: 700, textDecoration: "none", textAlign: "center", boxSizing: "border-box", transition: "opacity 0.15s" }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}>
                Apply now →
              </a>
            ) : (
              <a href={uni.website} target="_blank" rel="noopener noreferrer" style={{ display: "block", width: "100%", padding: "11px 0", borderRadius: 10, background: "var(--text-1)", color: "var(--bg)", fontSize: 13, fontWeight: 700, textDecoration: "none", textAlign: "center", boxSizing: "border-box" }}>
                Visit website →
              </a>
            )}
          </div>
        </div>
        }
        center={
          <div style={{ overflowY: "auto", height: "100%", padding: "32px 40px" }}>
            <div style={{ maxWidth: 680 }}>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>
                  Step {activeStep + 1} of {STEPS.length}
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.6px", margin: "0 0 6px" }}>
                  {STEPS[activeStep].label}
                </h1>
                <div style={{ height: 1, background: "var(--border)", marginTop: 20 }} />
              </div>

              {CONTENT[stepKeys[activeStep]]}

              {/* Step navigation */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
                {activeStep > 0 ? (
                  <button onClick={() => setActiveStep(s => s - 1)} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 18px", cursor: "pointer", color: "var(--text-2)", fontSize: 13, fontWeight: 600, fontFamily: "inherit", transition: "border-color 0.15s, color 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}>
                    ← Previous
                  </button>
                ) : <div />}
                {activeStep < STEPS.length - 1 && (
                  <button onClick={() => { setCheckedSteps(prev => { const n = new Set(prev); n.add(activeStep); return n; }); setActiveStep(s => s + 1); }} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--text-1)", border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer", color: "var(--bg)", fontSize: 13, fontWeight: 700, fontFamily: "inherit", transition: "opacity 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                    Mark done & continue →
                  </button>
                )}
              </div>
            </div>
          </div>
        }
        right={
          <div style={{ borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden", height: "100%", background: "rgba(255,255,255,0.01)" }}>
            <AiChatPanel uniName={uni.name} programme={programme?.name ?? ""} />
          </div>
        }
      />
      </div>
    </div>
  );
}
