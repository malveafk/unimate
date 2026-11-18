import Link from "next/link";

// Site-wide 404. Also rendered when a client page calls notFound()
// (e.g. /universities/<unknown-id>).
export default function NotFound() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "80px 24px", textAlign: "center" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-3)", margin: 0 }}>
        404
      </p>
      <h1 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-1px", color: "var(--text-1)", margin: 0 }}>
        This page doesn&apos;t exist
      </h1>
      <p style={{ fontSize: 15, color: "var(--text-2)", maxWidth: 420, lineHeight: 1.6, margin: 0 }}>
        The link may be outdated, or the university or article may have moved.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
        <Link href="/" className="btn-primary" style={{ fontSize: 14 }}>Back home</Link>
        <Link href="/universities" className="btn-ghost" style={{ fontSize: 14 }}>Browse universities</Link>
      </div>
    </div>
  );
}
