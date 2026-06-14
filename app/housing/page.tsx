"use client";

import { useEffect, useRef, useState } from "react";
import { TransitionLink } from "../components/PageTransition";
import {
  roommates, listings, housingCities,
  BUDGET_BRACKETS, MOVE_IN_BRACKETS,
  type Roommate,
} from "../data/housing";

type Tab = "roommates" | "listings";

type Message = {
  from: "me" | "them";
  text: string;
  time: string;
};

const INITIAL_MESSAGES: Record<string, Message[]> = Object.fromEntries(
  roommates.map((r) => [
    r.id,
    [
      {
        from: "them",
        text: `Hey! I saw your profile on 4UNI 👋 I'm ${r.name}, currently looking for a flatmate in ${r.city}. My budget is around €${r.budgetMin}–€${r.budgetMax}/month and I'm planning to move in ${r.moveInDate}. Feel free to ask me anything!`,
        time: "Just now",
      },
    ],
  ])
);

function now() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/* ── Chat panel ────────────────────────────────── */
function ChatPanel({ roommate, onClose }: { roommate: Roommate; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES[roommate.id] ?? []);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send() {
    const text = input.trim();
    if (!text) return;
    const myMsg: Message = { from: "me", text, time: now() };
    setMessages((prev) => [...prev, myMsg]);
    setInput("");

    // Mock auto-reply after a short delay
    setTimeout(() => {
      const replies = [
        `Sounds good! When are you planning to move to ${roommate.city}?`,
        "That works for me! Would you prefer a shared flat or a studio?",
        "Nice to meet you! What are you studying?",
        "Cool! I'm also open to checking out different neighbourhoods. Any preferences?",
        "Great question! I usually keep the place tidy and I'm pretty flexible about guests.",
        `My move-in date is ${roommate.moveInDate} — does that timeline work for you?`,
      ];
      const reply: Message = {
        from: "them",
        text: replies[Math.floor(Math.random() * replies.length)],
        time: now(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1000 + Math.random() * 800);
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 360,
        height: 520,
        zIndex: 500,
        background: "rgba(18,18,22,0.97)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 20,
        boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "slideUpChat 0.28s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <style>{`
        @keyframes slideUpChat {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
          background: `rgba(${roommate.avatarColor},0.2)`,
          border: `1.5px solid rgba(${roommate.avatarColor},0.45)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 800, color: `rgb(${roommate.avatarColor})`,
        }}>
          {roommate.initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{roommate.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-3)" }}>{roommate.city} · {roommate.university.split(" ").slice(0, 3).join(" ")}</div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", color: "var(--text-2)", transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Demo notice */}
      <div style={{ padding: "7px 14px", background: "rgba(251,191,36,0.08)", borderBottom: "1px solid rgba(251,191,36,0.15)", fontSize: 10, color: "rgba(251,191,36,0.8)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textAlign: "center" }}>
        DEMO — messages are not saved or sent
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", flexDirection: msg.from === "me" ? "row-reverse" : "row", alignItems: "flex-end", gap: 8 }}>
            {msg.from === "them" && (
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: `rgba(${roommate.avatarColor},0.18)`,
                border: `1px solid rgba(${roommate.avatarColor},0.35)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 800, color: `rgb(${roommate.avatarColor})`,
              }}>
                {roommate.initials}
              </div>
            )}
            <div style={{ maxWidth: "72%" }}>
              <div style={{
                padding: "9px 13px", borderRadius: msg.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: msg.from === "me"
                  ? `rgba(${roommate.avatarColor},0.22)`
                  : "rgba(255,255,255,0.07)",
                border: msg.from === "me"
                  ? `1px solid rgba(${roommate.avatarColor},0.35)`
                  : "1px solid rgba(255,255,255,0.1)",
                fontSize: 13, color: "var(--text-1)", lineHeight: 1.55,
              }}>
                {msg.text}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 3, textAlign: msg.from === "me" ? "right" : "left", fontFamily: "var(--font-mono)" }}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="text"
          placeholder="Type a message…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") send(); }}
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)",
            color: "var(--text-1)", fontSize: 13, outline: "none", fontFamily: "inherit",
            transition: "border-color 0.15s",
          }}
          onFocus={e => (e.target.style.borderColor = `rgba(${roommate.avatarColor},0.5)`)}
          onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          style={{
            width: 38, height: 38, borderRadius: 10, border: "none", cursor: input.trim() ? "pointer" : "default",
            background: input.trim() ? `rgba(${roommate.avatarColor},0.9)` : "rgba(255,255,255,0.08)",
            color: input.trim() ? "#fff" : "var(--text-3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s, transform 0.1s", flexShrink: 0,
          }}
          onMouseEnter={e => { if (input.trim()) e.currentTarget.style.transform = "scale(1.08)"; }}
          onMouseLeave={e => (e.currentTarget.style.transform = "")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("is-visible"); }),
      { threshold: 0.06 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ── Housing Landing Page ─────────────────────────── */
function HousingLanding({ onEnter }: { onEnter: (tab: Tab) => void }) {
  useReveal();

  const SECURITY = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      color: "52,211,153",
      title: "Verified profiles",
      desc: "Students can verify their university email to get a verified badge. Unverified profiles are clearly marked.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
      color: "167,139,250",
      title: "Safe messaging",
      desc: "Never share personal contact details in chat. Use our in-app messaging until you feel comfortable.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
      color: "251,191,36",
      title: "Scam awareness",
      desc: "We flag suspicious listings and remind you of the most common rental scams targeting international students.",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      color: "96,165,250",
      title: "Student community",
      desc: "Only students moving abroad for university can post a profile — keeping the community relevant and safe.",
    },
  ];

  const FEATURES = [
    {
      tab: "roommates" as Tab,
      icon: "🤝",
      accentRgb: "167,139,250",
      label: "Find a Roommate",
      step: "01",
      desc: "Connect with other international students looking for a flatmate. Filter by city, budget and move-in date, then message them directly.",
      stats: [
        { value: `${roommates.length}`, label: "Active profiles" },
        { value: "8", label: "Cities covered" },
        { value: "Free", label: "Always" },
      ],
      cta: "Browse roommates →",
    },
    {
      tab: "listings" as Tab,
      icon: "🏠",
      accentRgb: "96,165,250",
      label: "Apartment Listings",
      step: "02",
      desc: "Curated listings from Kamernet, WG-Gesucht, HousingAnywhere and more — all in one place. Filter by city, price and move-in date.",
      stats: [
        { value: `${listings.length}`, label: "Listings" },
        { value: "4", label: "Platforms" },
        { value: "Live", label: "Updated daily" },
      ],
      cta: "Browse apartments →",
    },
  ];

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>

      {/* ── Hero ─────────────────────────────────────── */}
      <div style={{
        position: "relative",
        minHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "100px 32px 80px",
        overflow: "hidden",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(96,165,250,0.07) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", height: 1, background: "var(--border)", zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 780, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10, color: "rgb(96,165,250)",
            letterSpacing: "0.22em", textTransform: "uppercase",
            opacity: 0, animation: "fadeIn 0.5s ease-out 0.2s forwards",
          }}>
            Housing · 4UNI
          </span>

          <h1 style={{
            fontSize: "clamp(44px, 7vw, 84px)",
            fontWeight: 800,
            lineHeight: 1.06,
            letterSpacing: "-2.5px",
            color: "var(--text-1)",
            margin: 0,
            opacity: 0,
            animation: "fadeIn 0.6s ease-out 0.35s forwards",
          }}>
            Your home<br />
            <span style={{
              background: "linear-gradient(135deg, rgb(96,165,250) 0%, rgb(167,139,250) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              in Europe.
            </span>
          </h1>

          <p style={{
            fontSize: "clamp(15px, 1.8vw, 18px)",
            color: "var(--text-2)",
            lineHeight: 1.75,
            maxWidth: 520,
            margin: 0,
            opacity: 0,
            animation: "fadeUp 0.6s ease-out 0.5s forwards",
          }}>
            Find a trusted flatmate or browse apartments across Europe — built for international students, with safety first.
          </p>

          {/* Two main CTAs */}
          <div style={{
            display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center",
            opacity: 0, animation: "fadeUp 0.6s ease-out 0.7s forwards",
            marginTop: 8,
          }}>
            <button
              onClick={() => onEnter("roommates")}
              style={{
                padding: "16px 32px", borderRadius: 14,
                background: "rgba(167,139,250,0.14)",
                border: "1px solid rgba(167,139,250,0.35)",
                color: "rgb(167,139,250)", fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 10,
                transition: "background 0.2s, transform 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(167,139,250,0.22)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(167,139,250,0.14)"; e.currentTarget.style.transform = ""; }}
            >
              🤝 Find a Roommate
            </button>
            <button
              onClick={() => onEnter("listings")}
              style={{
                padding: "16px 32px", borderRadius: 14,
                background: "rgba(96,165,250,0.14)",
                border: "1px solid rgba(96,165,250,0.35)",
                color: "rgb(96,165,250)", fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 10,
                transition: "background 0.2s, transform 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(96,165,250,0.22)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(96,165,250,0.14)"; e.currentTarget.style.transform = ""; }}
            >
              🏠 Browse Apartments
            </button>
          </div>

          {/* Trust bar */}
          <div style={{
            display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center", marginTop: 16,
            opacity: 0, animation: "fadeIn 0.6s ease-out 0.9s forwards",
          }}>
            {["✓ Verified student profiles", "✓ Safe in-app messaging", "✓ Scam warnings included", "✓ Free to use"].map((t) => (
              <span key={t} style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{
          position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          opacity: 0, animation: "fadeIn 0.5s ease-out 1.2s forwards",
        }}>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.14em" }}>SCROLL TO EXPLORE</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        </div>
      </div>

      {/* ── Feature cards ─────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 32px" }}>
        <div className="reveal" style={{ marginBottom: 56, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", letterSpacing: "0.2em", textTransform: "uppercase" }}>What we offer</span>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 800, margin: "10px 0 0", letterSpacing: "-1.5px", color: "var(--text-1)", lineHeight: 1.1 }}>
              Two ways to find<br />your home.
            </h2>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {FEATURES.map(({ tab, icon, accentRgb, label, step, desc, stats, cta }) => (
            <div
              key={tab}
              className="reveal"
              style={{
                borderRadius: 20, border: `1px solid rgba(${accentRgb},0.2)`,
                background: `rgba(${accentRgb},0.05)`,
                padding: "36px 36px 32px",
                display: "flex", flexDirection: "column", gap: 24,
                cursor: "pointer", transition: "border-color 0.2s, background 0.2s, transform 0.2s",
              }}
              onClick={() => onEnter(tab)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(${accentRgb},0.45)`; e.currentTarget.style.background = `rgba(${accentRgb},0.1)`; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `rgba(${accentRgb},0.2)`; e.currentTarget.style.background = `rgba(${accentRgb},0.05)`; e.currentTarget.style.transform = ""; }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: `rgb(${accentRgb})`, letterSpacing: "0.18em" }}>{step}</span>
                  <div style={{ fontSize: 36, marginTop: 8 }}>{icon}</div>
                </div>
                <span style={{
                  padding: "5px 12px", borderRadius: 7,
                  background: `rgba(${accentRgb},0.12)`,
                  border: `1px solid rgba(${accentRgb},0.3)`,
                  fontSize: 12, fontWeight: 700, color: `rgb(${accentRgb})`,
                }}>Enter →</span>
              </div>

              <div>
                <h3 style={{ fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.8px", margin: "0 0 12px", lineHeight: 1.15 }}>{label}</h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75, margin: 0 }}>{desc}</p>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 10 }}>
                {stats.map(({ value, label: l }) => (
                  <div key={l} style={{ flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: `rgb(${accentRgb})`, letterSpacing: "-0.3px" }}>{value}</div>
                    <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: `rgb(${accentRgb})`, display: "flex", alignItems: "center", gap: 6 }}>
                {cta}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Safety section ────────────────────────────── */}
      <div style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 32px" }}>
          <div className="reveal" style={{ marginBottom: 52 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgb(52,211,153)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Safety first</span>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, margin: "10px 0 0", letterSpacing: "-1.5px", color: "var(--text-1)", lineHeight: 1.1 }}>
              Built with your<br />security in mind.
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-2)", margin: "14px 0 0", lineHeight: 1.7, maxWidth: 500 }}>
              Moving abroad is already stressful. We make sure finding housing is not a source of risk on top of it.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {SECURITY.map(({ icon, color, title, desc }, i) => (
              <div
                key={title}
                className={`reveal reveal-d${i + 1}`}
                style={{
                  borderRadius: 16, border: "1px solid var(--border)",
                  background: "var(--surface)", padding: "24px",
                  display: "flex", flexDirection: "column", gap: 14,
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = `rgba(${color},0.4)`)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `rgba(${color},0.12)`,
                  border: `1px solid rgba(${color},0.25)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: `rgb(${color})`, flexShrink: 0,
                }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", marginBottom: 6 }}>{title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tips section ──────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 32px 100px" }}>
        <div className="reveal" style={{ marginBottom: 40 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Good to know</span>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 800, margin: "10px 0 0", letterSpacing: "-1.2px", color: "var(--text-1)" }}>
            Before you start searching.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { num: "01", color: "251,191,36", title: "Start 6 months early", desc: "Student housing waitlists in Amsterdam, Paris and Munich can be 6–12 months long. Register as soon as you have your offer letter." },
            { num: "02", color: "248,113,113", title: "Never pay before viewing", desc: "Legitimate landlords will not ask for a deposit before you have viewed the property. Wire transfers to overseas accounts are a major red flag." },
            { num: "03", color: "52,211,153", title: "Use university housing first", desc: "Most universities have official student housing. It is usually cheaper, safer and easier to navigate for first-arrivals — always check there first." },
          ].map(({ num, color, title, desc }) => (
            <div key={num} className="reveal" style={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", padding: "24px 26px", display: "flex", gap: 18 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: `rgb(${color})`, flexShrink: 0, letterSpacing: "0.1em", marginTop: 2 }}>{num}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 7 }}>{title}</div>
                <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA row */}
        <div className="reveal" style={{ marginTop: 56, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => onEnter("roommates")}
            style={{ padding: "15px 32px", borderRadius: 12, background: "var(--text-1)", color: "var(--bg)", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            🤝 Find a Roommate
          </button>
          <button
            onClick={() => onEnter("listings")}
            style={{ padding: "15px 32px", borderRadius: 12, background: "transparent", color: "var(--text-1)", border: "1px solid var(--border)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "border-color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            🏠 Browse Apartments
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HousingPage() {
  const [showLanding, setShowLanding] = useState(true);
  const [tab, setTab] = useState<Tab>("roommates");
  const [city, setCity] = useState("all");
  const [budget, setBudget] = useState("any");
  const [moveIn, setMoveIn] = useState("any");
  const [search, setSearch] = useState("");
  const [furnished, setFurnished] = useState<boolean | null>(null);
  const [activeChat, setActiveChat] = useState<Roommate | null>(null);
  useReveal();

  function enterSection(t: Tab) {
    setTab(t);
    setShowLanding(false);
  }

  if (showLanding) {
    return <HousingLanding onEnter={enterSection} />;
  }

  /* ─ Filtered roommates ─ */
  const filteredRoomates = roommates.filter((r) => {
    const matchCity = city === "all" || r.city === city;
    const matchSearch =
      search === "" ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.university.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase()) ||
      r.lookingFor.toLowerCase().includes(search.toLowerCase());
    const matchBudget = (() => {
      if (budget === "any") return true;
      const b = BUDGET_BRACKETS.find((x) => x.value === budget);
      if (!b) return true;
      if (b.min !== undefined && r.budgetMax < b.min) return false;
      if (b.max !== undefined && r.budgetMin > b.max) return false;
      return true;
    })();
    const matchMoveIn = (() => {
      if (moveIn === "any") return true;
      const b = MOVE_IN_BRACKETS.find((x) => x.value === moveIn);
      if (!b || b.min === undefined) return true;
      return r.moveInMonth >= b.min! && r.moveInMonth <= b.max!;
    })();
    return matchCity && matchSearch && matchBudget && matchMoveIn;
  });

  /* ─ Filtered listings ─ */
  const filteredListings = listings.filter((l) => {
    const matchCity = city === "all" || l.city === city;
    const matchSearch =
      search === "" ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase()) ||
      l.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchBudget = (() => {
      if (budget === "any") return true;
      const b = BUDGET_BRACKETS.find((x) => x.value === budget);
      if (!b) return true;
      if (b.min !== undefined && l.price < b.min) return false;
      if (b.max !== undefined && l.price >= b.max) return false;
      return true;
    })();
    const matchMoveIn = (() => {
      if (moveIn === "any") return true;
      const b = MOVE_IN_BRACKETS.find((x) => x.value === moveIn);
      if (!b || b.min === undefined) return true;
      return l.availableFromMonth >= b.min! && l.availableFromMonth <= b.max!;
    })();
    const matchFurnished = furnished === null || l.furnished === furnished;
    return matchCity && matchSearch && matchBudget && matchMoveIn && matchFurnished;
  });

  const resetFilters = () => { setCity("all"); setBudget("any"); setMoveIn("any"); setSearch(""); setFurnished(null); };
  const hasFilters = city !== "all" || budget !== "any" || moveIn !== "any" || search !== "" || furnished !== null;

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 100px" }}>

      {/* ── Hero ── */}
      <div style={{ padding: "72px 0 48px", borderBottom: "1px solid var(--border)", maxWidth: 680 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Housing</span>
        <h1 style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, letterSpacing: "-1.2px", lineHeight: 1.1, color: "var(--text-1)", margin: "12px 0 16px" }}>
          Find your home<br />in Europe.
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.7, margin: "0 0 32px", maxWidth: 520 }}>
          Browse apartments from trusted platforms, or connect with students looking for a flatmate — all in one place.
        </p>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder={tab === "roommates" ? "Search by name, university or city…" : "Search by city, title or feature…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "14px 18px 14px 44px", borderRadius: 12,
              border: "1px solid var(--border)", background: "var(--surface)",
              color: "var(--text-1)", fontSize: 15, outline: "none",
              fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.15s",
            }}
            onFocus={e => (e.target.style.borderColor = "var(--border-strong)")}
            onBlur={e => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
      </div>

      {/* ── Tabs + Filters ── */}
      <div style={{ padding: "24px 0 0", borderBottom: "1px solid var(--border)" }}>
        {/* Tab row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 4, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 4 }}>
            {([
              { key: "roommates", label: "🤝 Find a Roommate", count: filteredRoomates.length },
              { key: "listings", label: "🏠 Apartments", count: filteredListings.length },
            ] as const).map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  padding: "9px 20px", borderRadius: 9, border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                  background: tab === key ? "var(--text-1)" : "transparent",
                  color: tab === key ? "var(--bg)" : "var(--text-3)",
                  transition: "background 0.15s, color 0.15s",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                {label}
                <span style={{
                  fontSize: 10, fontFamily: "var(--font-mono)",
                  background: tab === key ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.08)",
                  borderRadius: 4, padding: "1px 6px",
                  color: tab === key ? "var(--bg)" : "var(--text-3)",
                }}>{count}</span>
              </button>
            ))}
          </div>

          {hasFilters && (
            <button
              onClick={resetFilters}
              style={{ fontSize: 12, color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4, transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
            >
              Clear filters ×
            </button>
          )}
        </div>

        {/* Filter row */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", paddingBottom: 20 }}>
          {/* City */}
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 2 }}>City</span>
            {housingCities.map((c) => (
              <button key={c.code} onClick={() => setCity(c.code)}
                style={{
                  padding: "4px 11px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  border: city === c.code ? "1px solid var(--text-1)" : "1px solid var(--border)",
                  background: city === c.code ? "var(--text-1)" : "transparent",
                  color: city === c.code ? "var(--bg)" : "var(--text-3)",
                }}
              >{c.name}</button>
            ))}
          </div>
        </div>

        {/* Second filter row */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", paddingBottom: 24 }}>
          {/* Budget */}
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 2 }}>Budget / mo</span>
            {BUDGET_BRACKETS.map((b) => (
              <button key={b.value} onClick={() => setBudget(b.value)}
                style={{
                  padding: "4px 11px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  border: budget === b.value ? "1px solid var(--accent)" : "1px solid var(--border)",
                  background: budget === b.value ? "var(--accent-dim)" : "transparent",
                  color: budget === b.value ? "var(--accent)" : "var(--text-3)",
                }}
              >{b.label}</button>
            ))}
          </div>

          {/* Move-in */}
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 2 }}>Move-in</span>
            {MOVE_IN_BRACKETS.map((b) => (
              <button key={b.value} onClick={() => setMoveIn(b.value)}
                style={{
                  padding: "4px 11px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  border: moveIn === b.value ? "1px solid var(--accent)" : "1px solid var(--border)",
                  background: moveIn === b.value ? "var(--accent-dim)" : "transparent",
                  color: moveIn === b.value ? "var(--accent)" : "var(--text-3)",
                }}
              >{b.label}</button>
            ))}
          </div>

          {/* Furnished (listings only) */}
          {tab === "listings" && (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 2 }}>Furnished</span>
              {[{ label: "Any", value: null }, { label: "Yes", value: true }, { label: "No", value: false }].map(({ label, value }) => (
                <button key={label} onClick={() => setFurnished(value)}
                  style={{
                    padding: "4px 11px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                    border: furnished === value ? "1px solid var(--accent)" : "1px solid var(--border)",
                    background: furnished === value ? "var(--accent-dim)" : "transparent",
                    color: furnished === value ? "var(--accent)" : "var(--text-3)",
                  }}
                >{label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Results count ── */}
      <div style={{ padding: "16px 0 8px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, color: "var(--text-3)" }}>
          <span style={{ color: "var(--text-1)", fontWeight: 600 }}>{tab === "roommates" ? filteredRoomates.length : filteredListings.length}</span>{" "}
          {tab === "roommates" ? "roommates found" : "listings found"}
        </span>
        {tab === "roommates" && (
          <span style={{ fontSize: 11, color: "var(--text-3)", marginLeft: "auto", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
            Real data coming soon — these are example profiles
          </span>
        )}
      </div>

      {/* ══════════════════════════════════════════════
           ROOMMATES TAB
         ══════════════════════════════════════════════ */}
      {tab === "roommates" && (
        <>
          {filteredRoomates.length === 0 ? (
            <EmptyState tab="roommates" />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20, paddingTop: 28 }}>
              {filteredRoomates.map((r, i) => (
                <div
                  key={r.id}
                  className={`reveal reveal-d${(i % 4) + 1}`}
                  style={{
                    background: "var(--surface)", borderRadius: 18, border: "1px solid var(--border)",
                    padding: "28px", display: "flex", flexDirection: "column", gap: 16,
                    transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                >
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                      background: `rgba(${r.avatarColor},0.18)`, border: `1.5px solid rgba(${r.avatarColor},0.4)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 15, fontWeight: 800, color: `rgb(${r.avatarColor})`,
                    }}>
                      {r.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 17, fontWeight: 700, color: "var(--text-1)" }}>{r.name}</span>
                        <span style={{ fontSize: 13 }}>{r.flag}</span>
                        {r.verified && (
                          <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", color: "rgb(52,211,153)", fontWeight: 700, letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>✓ VERIFIED</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
                        {r.age} · {r.nationality} · {r.university}
                      </div>
                    </div>
                  </div>

                  {/* Location + budget */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "10px 12px", border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 4 }}>City</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{r.city}</div>
                    </div>
                    <div style={{ flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "10px 12px", border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 4 }}>Budget</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--green)" }}>€{r.budgetMin}–€{r.budgetMax}</div>
                    </div>
                    <div style={{ flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "10px 12px", border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 4 }}>Move-in</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(251,191,36,0.9)" }}>{r.moveInDate}</div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {r.lookingFor}
                  </p>

                  {/* Lifestyle tags */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {r.lifestyle.map((l) => (
                      <span key={l} style={{ padding: "3px 9px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 11, color: "var(--text-3)", background: "rgba(255,255,255,0.03)" }}>{l}</span>
                    ))}
                    {r.languages.map((l) => (
                      <span key={l} style={{ padding: "3px 9px", borderRadius: 6, border: `1px solid rgba(${r.avatarColor},0.3)`, fontSize: 11, color: `rgb(${r.avatarColor})`, background: `rgba(${r.avatarColor},0.07)` }}>{l}</span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 4 }}>
                    <button
                      onClick={() => setActiveChat(activeChat?.id === r.id ? null : r)}
                      style={{
                        flex: 1, padding: "10px 16px", borderRadius: 10,
                        background: activeChat?.id === r.id ? `rgba(${r.avatarColor},0.25)` : `rgba(${r.avatarColor},0.13)`,
                        border: `1px solid rgba(${r.avatarColor},0.4)`,
                        color: `rgb(${r.avatarColor})`,
                        fontSize: 12, fontWeight: 700, cursor: "pointer",
                        fontFamily: "inherit", transition: "background 0.15s, transform 0.1s",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = `rgba(${r.avatarColor},0.22)`)}
                      onMouseLeave={e => (e.currentTarget.style.background = activeChat?.id === r.id ? `rgba(${r.avatarColor},0.25)` : `rgba(${r.avatarColor},0.13)`)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      {activeChat?.id === r.id ? "Chat open ↓" : "Message"}
                    </button>
                  </div>
                </div>
              ))}

              {/* Post your profile CTA */}
              <div
                className="reveal"
                style={{
                  background: "transparent", borderRadius: 18,
                  border: "1.5px dashed var(--border)",
                  padding: "28px", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 12,
                  minHeight: 200, textAlign: "center",
                }}
              >
                <div style={{ fontSize: 32 }}>✍️</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>Post your profile</div>
                <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.6, margin: 0 }}>
                  Let other students find you. Share your city, budget and move-in date.
                </p>
                <button
                  style={{
                    marginTop: 8, padding: "10px 20px", borderRadius: 10,
                    background: "var(--text-1)", color: "var(--bg)",
                    border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer",
                    fontFamily: "inherit", transition: "opacity 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  onClick={() => alert("Profile creation coming soon!")}
                >
                  Create profile →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════
           LISTINGS TAB
         ══════════════════════════════════════════════ */}
      {tab === "listings" && (
        <>
          {filteredListings.length === 0 ? (
            <EmptyState tab="listings" />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20, paddingTop: 28 }}>
              {filteredListings.map((l, i) => (
                <div
                  key={l.id}
                  className={`reveal reveal-d${(i % 4) + 1}`}
                  style={{
                    background: "var(--surface)", borderRadius: 18, border: "1px solid var(--border)",
                    display: "flex", flexDirection: "column", overflow: "hidden",
                    transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                >
                  {/* Image */}
                  <div style={{ aspectRatio: "16/9", overflow: "hidden", position: "relative" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.image} alt={l.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease" }}
                      onMouseEnter={e => ((e.target as HTMLImageElement).style.transform = "scale(1.05)")}
                      onMouseLeave={e => ((e.target as HTMLImageElement).style.transform = "scale(1)")}
                    />
                    {/* Price badge */}
                    <div style={{
                      position: "absolute", bottom: 12, left: 12,
                      background: "rgba(10,10,10,0.85)", backdropFilter: "blur(8px)",
                      borderRadius: 8, padding: "6px 12px",
                      fontSize: 16, fontWeight: 800, color: "var(--text-1)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}>
                      €{l.price}<span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-3)" }}>/mo</span>
                    </div>
                    {/* Platform badge */}
                    <div style={{
                      position: "absolute", top: 12, right: 12,
                      background: "rgba(10,10,10,0.75)", backdropFilter: "blur(6px)",
                      borderRadius: 6, padding: "3px 9px",
                      fontSize: 10, fontWeight: 700, color: "var(--text-2)",
                      fontFamily: "var(--font-mono)", letterSpacing: "0.06em",
                    }}>
                      {l.platform}
                    </div>
                    {l.utilities && (
                      <div style={{
                        position: "absolute", top: 12, left: 12,
                        background: "rgba(52,211,153,0.18)", backdropFilter: "blur(6px)",
                        border: "1px solid rgba(52,211,153,0.4)",
                        borderRadius: 6, padding: "3px 9px",
                        fontSize: 10, fontWeight: 700, color: "rgb(52,211,153)",
                        fontFamily: "var(--font-mono)", letterSpacing: "0.06em",
                      }}>
                        Bills incl.
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                    <div>
                      <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.2px" }}>{l.title}</h3>
                      <div style={{ fontSize: 12, color: "var(--text-3)" }}>{l.flag} {l.city}, {l.country}</div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "flex", gap: 8 }}>
                      {[
                        { label: "Size", value: `${l.size} m²` },
                        { label: "From", value: l.availableFrom },
                        { label: "Distance", value: l.distanceToUni },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "8px 10px", border: "1px solid var(--border)" }}>
                          <div style={{ fontSize: 8, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 3 }}>{label}</div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {l.furnished && (
                        <span style={{ padding: "3px 8px", borderRadius: 5, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", fontSize: 11, color: "rgb(167,139,250)" }}>Furnished</span>
                      )}
                      {l.tags.map((t) => (
                        <span key={t} style={{ padding: "3px 8px", borderRadius: 5, border: "1px solid var(--border)", fontSize: 11, color: "var(--text-3)", background: "rgba(255,255,255,0.03)" }}>{t}</span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 4 }}>
                      <a
                        href={l.platformUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1, padding: "10px 16px", borderRadius: 10, background: "var(--text-1)",
                          color: "var(--bg)", fontSize: 12, fontWeight: 700, textDecoration: "none",
                          textAlign: "center", transition: "opacity 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                      >
                        View on {l.platform} →
                      </a>
                      <TransitionLink
                        href={`/chat?q=Tell me about finding accommodation in ${l.city}`}
                        style={{
                          padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)",
                          color: "var(--text-2)", fontSize: 12, fontWeight: 500,
                          textDecoration: "none", transition: "border-color 0.15s, color 0.15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}
                      >
                        Ask AI
                      </TransitionLink>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Chat panel ── */}
      {activeChat && (
        <ChatPanel roommate={activeChat} onClose={() => setActiveChat(null)} />
      )}
    </div>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div style={{ padding: "80px 0", textAlign: "center", border: "1px dashed var(--border)", borderRadius: 20, marginTop: 40 }}>
      <div style={{ fontSize: 32, marginBottom: 16 }}>{tab === "roommates" ? "🤝" : "🏠"}</div>
      <p style={{ fontSize: 15, color: "var(--text-3)", marginBottom: 8 }}>
        No {tab === "roommates" ? "roommates" : "listings"} match your filters.
      </p>
      <p style={{ fontSize: 13, color: "var(--text-3)" }}>Try adjusting the city or budget range.</p>
    </div>
  );
}
