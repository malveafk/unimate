import type { Metadata } from "next";
import Link from "next/link";

// Listings are no longer posted from the site: the owner emails us the details
// and we publish the place ourselves. This page says what to send and opens a
// pre-filled email with the same list, so nothing has to be asked twice.

const LISTINGS_EMAIL = "admin1@4uni.online";

export const metadata: Metadata = {
  title: "List an apartment | 4UNI",
  description: "Email us the details of your apartment or room and we will publish it on the 4UNI housing map.",
};

const DETAILS: { label: string; hint: string }[] = [
  { label: "City and address", hint: "At least the neighbourhood, so we can place it on the map." },
  { label: "Monthly rent", hint: "In euros, and what it includes (bills, internet, service costs)." },
  { label: "The place", hint: "Number of rooms and bathrooms, size in m², furnished or not." },
  { label: "Available from", hint: "The first day a student can move in, and any minimum stay." },
  { label: "Description", hint: "A few lines on the place, the area and who it suits." },
  { label: "Photos", hint: "Attach them to the email. Bright, recent photos of every room." },
  { label: "How students contact you", hint: "A website, an email address, a phone or WhatsApp number." },
];

const BODY = [
  "Hi 4UNI, I'd like to list a place on the housing map.",
  "",
  // Photos are attachments, not a line to fill in.
  ...DETAILS.filter(d => d.label !== "Photos").map(d => `${d.label}: `),
  "",
  "(Photos attached)",
].join("\n");

const MAILTO = `mailto:${LISTINGS_EMAIL}?subject=${encodeURIComponent("Apartment listing")}&body=${encodeURIComponent(BODY)}`;

export default function PostListingPage() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 32px 80px" }}>

      {/* ── Hero ──────────────────────────────────── */}
      <div style={{ padding: "72px 0 40px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgb(96,165,250)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Housing · 4UNI
        </span>
        <h1 style={{
          fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 800, letterSpacing: "-1px",
          lineHeight: 1.1, color: "var(--text-1)", margin: "12px 0 16px",
        }}>
          List your apartment.
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-2)", margin: "0 0 28px", maxWidth: 540, lineHeight: 1.6 }}>
          Send us the details by email. We check every place before it goes on
          the map, then publish it for students looking for a home in your city.
        </p>

        <a
          href={MAILTO}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "13px 24px", borderRadius: 12, textDecoration: "none",
            background: "var(--text-1)", color: "var(--bg)", fontSize: 14, fontWeight: 700,
          }}
        >
          Email {LISTINGS_EMAIL} →
        </a>
        <p style={{ fontSize: 12, color: "var(--text-3)", margin: "12px 0 0", lineHeight: 1.6 }}>
          The button opens an email with the list below already in it. If it
          doesn&apos;t open, write to <strong style={{ color: "var(--text-2)" }}>{LISTINGS_EMAIL}</strong>.
        </p>
      </div>

      {/* ── What to include ───────────────────────── */}
      <div style={{ padding: "36px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontWeight: 700, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 18 }}>
          What to include
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {DETAILS.map((d, i) => (
            <div key={d.label} style={{
              display: "flex", gap: 16, padding: "14px 18px", borderRadius: 12,
              border: "1px solid var(--border)", background: "var(--surface)",
            }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgb(96,165,250)", flexShrink: 0, letterSpacing: "0.1em", marginTop: 2 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 3 }}>{d.label}</div>
                <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{d.hint}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── What happens next ─────────────────────── */}
      <div style={{ padding: "32px 0 0", fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>
        We reply if anything is missing. Once the listing is live you can ask us
        by email to change it or take it down at any time. Questions first?{" "}
        <Link href="/contact" style={{ color: "rgb(96,165,250)", textDecoration: "none", fontWeight: 600 }}>Contact us →</Link>
      </div>
    </div>
  );
}
