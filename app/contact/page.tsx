"use client";

import { useState } from "react";

const CONTACT_EMAIL = "admin1@4uni.online";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    name ? `Message from ${name}` : "Message from the 4UNI site"
  )}&body=${encodeURIComponent(
    `${message}\n\n${email ? `Reply to: ${email}` : ""}`
  )}`;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 32px 80px" }}>

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
          Get in touch.
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-2)", margin: 0, maxWidth: 520, lineHeight: 1.6 }}>
          Questions, feedback, or something not working right — we read everything
          that comes through here.
        </p>
      </div>

      {/* ── Direct contact ───────────────────────── */}
      <div style={{ padding: "32px 0", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "var(--text-3)" }}>
          Email
        </span>
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)", textDecoration: "none" }}>
          {CONTACT_EMAIL}
        </a>
      </div>

      {/* ── Form ──────────────────────────────────── */}
      <form
        onSubmit={(e) => { e.preventDefault(); window.location.href = mailtoHref; }}
        style={{ padding: "32px 0 0", display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="contact-name" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>Name</label>
          <input
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-1)", fontSize: 14, fontFamily: "inherit", outline: "none" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="contact-email" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>Your email</label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-1)", fontSize: 14, fontFamily: "inherit", outline: "none" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="contact-message" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>Message</label>
          <textarea
            id="contact-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's on your mind?"
            required
            rows={5}
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-1)", fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical" }}
          />
        </div>
        <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start" }}>
          Send message →
        </button>
        <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>
          Opens your email app with this pre-filled — nothing is sent from this page directly.
        </p>
      </form>
    </div>
  );
}
