import type { Metadata } from "next";
import Link from "next/link";

// Target of every "Unlock Premium" link. Premium has no checkout yet, so this
// page says what it will include and points back to what is free today.
export const metadata: Metadata = {
  title: "4UNI Premium — Coming soon",
};

const GOLD = "rgb(201,163,92)";

const FEATURES = [
  {
    title: "AI assistant on every application",
    body: "Help next to each application page: documents to prepare, motivation letter feedback, deadlines and housing for that city.",
  },
  {
    title: "Keep chatting past the free limit",
    body: "No cap on messages to the 4UNI AI, so you can work through a whole application in one go.",
  },
  {
    title: "Your chat history",
    body: "Reopen, rename and continue past conversations instead of starting over each time.",
  },
];

export default function Pricing() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 96px" }}>
      {/* ── Hero ── */}
      <div style={{ padding: "80px 0 40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, border: "1px solid rgba(201,163,92,0.35)", background: "rgba(201,163,92,0.1)", color: GOLD, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD }} />
          Coming soon
        </span>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.1, color: "var(--text-1)", margin: 0 }}>
          4UNI Premium is on its way.
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-2)", maxWidth: 520, lineHeight: 1.6, margin: 0 }}>
          We&apos;re still building it, so it can&apos;t be bought yet. Everything else on 4UNI stays free in the meantime.
        </p>
      </div>

      {/* ── What it will include ── */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)" }}>
          What Premium will include
        </div>
        {FEATURES.map((f, i) => (
          <div key={f.title} style={{ display: "flex", gap: 14, padding: "18px 20px", borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>{f.title}</div>
              <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, margin: 0 }}>{f.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── What to do now ── */}
      <div style={{ marginTop: 40, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <p style={{ fontSize: 14, color: "var(--text-3)", margin: 0 }}>
          Until then, you can ask the AI a few free questions every day.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/chat" className="btn-primary">Try the free AI Chat</Link>
          <Link href="/universities" className="btn-ghost">Browse universities</Link>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: "8px 0 0" }}>
          Questions about Premium? <Link href="/contact" style={{ color: "var(--text-2)", textDecoration: "underline" }}>Get in touch</Link>
        </p>
      </div>
    </div>
  );
}
