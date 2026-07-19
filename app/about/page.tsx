const VALUES = [
  {
    title: "Built from experience",
    desc: "We've been through the process ourselves — the confusing application portals, the housing scramble, the paperwork nobody explains properly. 4UNI exists because we wished something like it existed when we needed it.",
  },
  {
    title: "No sponsored rankings",
    desc: "Universities don't pay to be featured or ranked higher. What you see is based on real tuition, cost of living, and programme data — not advertising budgets.",
  },
  {
    title: "Made for internationals",
    desc: "Every feature is built around the specific problems international students face: language requirements, visa timelines, and finding housing in a city you've maybe never visited.",
  },
];

export default function About() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px 80px" }}>

      {/* ── Hero ──────────────────────────────────── */}
      <div style={{ padding: "72px 0 48px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{
          fontSize: "clamp(32px, 4.5vw, 52px)",
          fontWeight: 800,
          letterSpacing: "-1px",
          lineHeight: 1.1,
          color: "var(--text-1)",
          margin: "0 0 16px",
        }}>
          About 4UNI.
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-2)", margin: 0, maxWidth: 600, lineHeight: 1.6 }}>
          Made by students, for students — a single place to find the right university
          and somewhere to live, without ten browser tabs and three group chats.
        </p>
      </div>

      {/* ── Story ─────────────────────────────────── */}
      <div style={{ padding: "48px 0", borderBottom: "1px solid var(--border)" }}>
        <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.85, margin: "0 0 18px" }}>
          Moving abroad for university means comparing tuition, programmes, and cities
          across a dozen different national systems, then figuring out housing in a
          place you may have never set foot in. Most of that information is scattered
          across university websites, forums, and outdated PDFs.
        </p>
        <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.85, margin: 0 }}>
          4UNI puts university data, real tuition and living costs, and a housing
          board in one place, so the decision is about where you actually want to
          study — not about how many tabs you have open.
        </p>
      </div>

      {/* ── Values ────────────────────────────────── */}
      <div style={{ padding: "48px 0" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.4px", margin: "0 0 28px" }}>
          What we care about
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {VALUES.map((v) => (
            <div key={v.title} style={{ borderLeft: "2px solid var(--accent)", paddingLeft: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", marginBottom: 6 }}>{v.title}</div>
              <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, margin: 0 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────── */}
      <div style={{ padding: "32px 0 0", display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href="/universities" className="btn-primary">Browse universities →</a>
        <a href="/contact" className="btn-ghost">Get in touch</a>
      </div>
    </div>
  );
}
