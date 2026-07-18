"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { roommatePins, apartmentPins, type RoommatePin } from "../data/housing-cities";
import PinDetailPanel, { type ActivePin } from "../components/PinDetailPanel";

const HousingMap = dynamic(() => import("../components/HousingMap"), { ssr: false });

type Tab = "roommates" | "apartments";

const CITIES = [
  "All cities", "Amsterdam", "Barcelona", "Berlin", "Bologna", "Brussels",
  "Copenhagen", "Delft", "Groningen", "Leuven", "Lisbon", "Lyon",
  "Maastricht", "Madrid", "Milan", "Munich", "Paris",
  "Porto", "Rotterdam", "Stockholm", "Vienna", "Zurich",
];

const BUDGET_BRACKETS = [
  { label: "Any",         value: "any" },
  { label: "< €600",      value: "low",  max: 600 },
  { label: "€600–€900",  value: "mid",  min: 600,  max: 900 },
  { label: "€900–€1 200", value: "high", min: 900,  max: 1200 },
  { label: "€1 200+",    value: "top",  min: 1200 },
];

const MOVEIN_BRACKETS = [
  { label: "Any",       value: "any" },
  { label: "Jan – Mar", value: "q1" },
  { label: "Apr – Jun", value: "q2" },
  { label: "Jul – Sep", value: "q3" },
  { label: "Oct – Dec", value: "q4" },
];

// ── Pill button helper ─────────────────────────────────────────────
function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "4px 11px", borderRadius: 6, fontSize: 11, fontWeight: 600,
        cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
        border: active ? "1px solid var(--text-1)" : "1px solid var(--border)",
        background: active ? "var(--text-1)" : "transparent",
        color: active ? "var(--bg)" : "var(--text-3)",
      }}
    >{children}</button>
  );
}

// ── Empty state ───────────────────────────────────────────────────
function EmptyList({ tab }: { tab: Tab }) {
  const isRoommates = tab === "roommates";
  return (
    <div style={{ paddingTop: 40 }}>
      {/* Dashed CTA card */}
      <div style={{
        border: "1.5px dashed var(--border)", borderRadius: 18,
        padding: "52px 32px", textAlign: "center",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        background: "rgba(255,255,255,0.01)",
      }}>
        <div style={{ color: isRoommates ? "#6B9FFF" : "#F87171" }}>
          {isRoommates ? (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          ) : (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          )}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-1)", marginBottom: 8, letterSpacing: "-0.3px" }}>
            {isRoommates ? "No roommate posts yet" : "No listings yet"}
          </div>
          <p style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.7, maxWidth: 360, margin: "0 auto" }}>
            {isRoommates
              ? "Be the first to post your roommate profile. Share your city, budget and move-in date so other students can find you."
              : "Apartment listings are coming soon. We'll aggregate rooms from Kamernet, WG-Gesucht, HousingAnywhere and more."}
          </p>
        </div>
        {isRoommates ? (
          <Link
            href="/housing/create-profile"
            style={{
              marginTop: 4, padding: "12px 28px", borderRadius: 12,
              textDecoration: "none", display: "inline-block",
              background: "var(--text-1)", color: "var(--bg)",
              border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit", transition: "opacity 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            Post your profile →
          </Link>
        ) : (
          <button
            onClick={() => alert("Notify me coming soon!")}
            style={{
              marginTop: 4, padding: "12px 28px", borderRadius: 12,
              background: "rgba(96,165,250,0.12)",
              border: "1px solid rgba(96,165,250,0.3)",
              color: "rgb(96,165,250)",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit", transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(96,165,250,0.2)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(96,165,250,0.12)")}
          >
            Notify me when listings go live →
          </button>
        )}
      </div>

      {/* How it works */}
      <div style={{ marginTop: 48 }}>
        <div style={{ fontWeight: 700, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 20 }}>
          How it works
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {(isRoommates ? [
            { num: "01", color: "201,163,92", title: "Create your profile", desc: "Tell others who you are, where you're studying and what kind of flatmate situation you're looking for." },
            { num: "02", color: "201,163,92", title: "Browse other students", desc: "Filter by city, budget and move-in date. Read through profiles to find someone compatible." },
            { num: "03", color: "201,163,92", title: "Message directly", desc: "Open the in-app chat and start a conversation. Share contact details only when you feel comfortable." },
          ] : [
            { num: "01", color: "96,165,250", title: "Choose your city", desc: "Select from 20+ European student cities. Filter by rent, furnished status and move-in date." },
            { num: "02", color: "96,165,250", title: "Browse curated listings", desc: "We aggregate trusted platforms like Kamernet, WG-Gesucht and HousingAnywhere into one feed." },
            { num: "03", color: "96,165,250", title: "Go to the platform", desc: "Click through to the original listing to get in touch with the landlord directly and securely." },
          ]).map(({ num, color, title, desc }) => (
            <div key={num} style={{
              borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)",
              padding: "22px 24px", display: "flex", gap: 16,
            }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: `rgb(${color})`, flexShrink: 0, letterSpacing: "0.1em", marginTop: 2 }}>{num}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── "Pick your filters first" prompt (apartments tab) ──────────────
function SelectFiltersPrompt({ cityFilter, budgetFilter, moveInFilter }: {
  cityFilter: string; budgetFilter: string; moveInFilter: string;
}) {
  const steps = [
    { label: "City", done: cityFilter !== "All cities", value: cityFilter !== "All cities" ? cityFilter : "Not selected" },
    { label: "Budget", done: budgetFilter !== "any", value: budgetFilter !== "any" ? BUDGET_BRACKETS.find(b => b.value === budgetFilter)?.label : "Not selected" },
    { label: "Move-in", done: moveInFilter !== "any", value: moveInFilter !== "any" ? MOVEIN_BRACKETS.find(b => b.value === moveInFilter)?.label : "Not selected" },
  ];

  return (
    <div style={{ paddingTop: 40 }}>
      <div style={{
        border: "1.5px dashed var(--border)", borderRadius: 18,
        padding: "52px 32px", textAlign: "center",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
        background: "rgba(255,255,255,0.01)",
      }}>
        <div style={{ color: "var(--text-2)" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-1)", marginBottom: 8, letterSpacing: "-0.3px" }}>
            Tell us what you're looking for
          </div>
          <p style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.7, maxWidth: 400, margin: "0 auto" }}>
            Select a city, a budget and a move-in window above to see matching apartment listings.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
          {steps.map(({ label, done, value }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 14px", borderRadius: 10,
              background: done ? "rgba(52,211,153,0.08)" : "rgba(255,255,255,0.02)",
              border: done ? "1px solid rgba(52,211,153,0.25)" : "1px solid var(--border)",
            }}>
              <span style={{
                width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? "rgb(52,211,153)" : "transparent",
                border: done ? "none" : "1.5px solid var(--text-3)",
                fontSize: 10, color: "#04140d", fontWeight: 800,
              }}>
                {done ? "✓" : ""}
              </span>
              <span style={{ fontSize: 12, color: done ? "var(--text-1)" : "var(--text-3)", fontWeight: 600 }}>
                {label}: {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Chat panel ────────────────────────────────────────────────────
type ChatMsg = { from: "me" | "them"; text: string; time: string };

function ChatPanel({ profile, onClose }: { profile: RoommatePin; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([{
    from: "them",
    text: `Hey! I saw your profile on Unimate 👋 I'm ${profile.name}, looking for a flatmate in ${profile.city}. My budget is around €${profile.budgetMin}–€${profile.budgetMax}/mo and I'm planning to move in ${profile.moveIn}. Feel free to ask me anything!`,
    time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  }]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const REPLIES = [
    `Sounds good! When are you planning to move to ${profile.city}?`,
    "That works for me! Would you prefer a shared flat or a studio?",
    "Nice to meet you! What are you studying?",
    "Cool! I'm also open to checking out different neighbourhoods. Any preferences?",
    "I usually keep the place tidy and I'm pretty flexible about guests.",
    `My move-in date is ${profile.moveIn} — does that timeline work for you?`,
  ];

  function send() {
    const text = input.trim();
    if (!text) return;
    const t = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    setMessages(m => [...m, { from: "me", text, time: t }]);
    setInput("");
    setTimeout(() => {
      setMessages(m => [...m, { from: "them", text: REPLIES[Math.floor(Math.random() * REPLIES.length)], time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }]);
    }, 900 + Math.random() * 700);
  }

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, width: 360, height: 520, zIndex: 500,
      background: "rgba(14,14,18,0.97)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20,
      boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
      display: "flex", flexDirection: "column", overflow: "hidden",
      animation: "slideUpChat 0.28s cubic-bezier(0.22,1,0.36,1)",
    }}>
      <style>{`@keyframes slideUpChat { from { opacity:0; transform:translateY(20px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: `rgba(${profile.avatarColor},0.2)`, border: `1.5px solid rgba(${profile.avatarColor},0.45)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: `rgb(${profile.avatarColor})` }}>
          {profile.initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{profile.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-3)" }}>{profile.city} · €{profile.budgetMin}–€{profile.budgetMax}/mo</div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-2)", transition: "background 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Demo notice */}
      <div style={{ padding: "6px 14px", background: "rgba(251,191,36,0.07)", borderBottom: "1px solid rgba(251,191,36,0.14)", fontSize: 10, color: "rgba(251,191,36,0.7)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textAlign: "center" }}>
        DEMO — messages are not saved or sent
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", flexDirection: msg.from === "me" ? "row-reverse" : "row", alignItems: "flex-end", gap: 8 }}>
            {msg.from === "them" && (
              <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: `rgba(${profile.avatarColor},0.18)`, border: `1px solid rgba(${profile.avatarColor},0.35)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: `rgb(${profile.avatarColor})` }}>{profile.initials}</div>
            )}
            <div style={{ maxWidth: "72%" }}>
              <div style={{ padding: "9px 13px", borderRadius: msg.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.from === "me" ? `rgba(${profile.avatarColor},0.22)` : "rgba(255,255,255,0.07)", border: msg.from === "me" ? `1px solid rgba(${profile.avatarColor},0.35)` : "1px solid rgba(255,255,255,0.1)", fontSize: 13, color: "var(--text-1)", lineHeight: 1.55 }}>{msg.text}</div>
              <div style={{ fontWeight: 700, fontSize: 10, color: "var(--text-3)", marginTop: 3, textAlign: msg.from === "me" ? "right" : "left", fontFamily: "var(--font-mono)" }}>{msg.time}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="text" placeholder="Type a message…" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") send(); }}
          style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "var(--text-1)", fontSize: 13, outline: "none", fontFamily: "inherit", transition: "border-color 0.15s" }}
          onFocus={e => (e.target.style.borderColor = `rgba(${profile.avatarColor},0.5)`)}
          onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
        />
        <button
          onClick={send} disabled={!input.trim()}
          style={{ width: 38, height: 38, borderRadius: 10, border: "none", cursor: input.trim() ? "pointer" : "default", background: input.trim() ? `rgba(${profile.avatarColor},0.9)` : "rgba(255,255,255,0.08)", color: input.trim() ? "#fff" : "var(--text-3)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s, transform 0.1s", flexShrink: 0 }}
          onMouseEnter={e => { if (input.trim()) e.currentTarget.style.transform = "scale(1.08)"; }}
          onMouseLeave={e => (e.currentTarget.style.transform = "")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function HousingPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("roommates");
  const [cityFilter, setCityFilter] = useState("All cities");
  const [budgetFilter, setBudgetFilter] = useState("any");
  const [moveInFilter, setMoveInFilter] = useState("any");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [activeChat, setActiveChat] = useState<RoommatePin | null>(null);
  const [activePin, setActivePin]   = useState<ActivePin | null>(null);

  // ── Listen for postMessage from the Leaflet iframe ──────────────
  const handleMapMessage = useCallback((e: MessageEvent) => {
    try {
      const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      if (data?.type !== "pin-click") return;

      if (data.pinType === "roommate") {
        const pin = roommatePins.find(p => p.id === data.id);
        if (pin) setActivePin({ pinType: "roommate", data: pin });

      } else if (data.pinType === "apartment") {
        const pin = apartmentPins.find(p => p.id === data.id);
        if (pin) setActivePin({ pinType: "apartment", data: pin });

      } else if (data.pinType === "city") {
        setActivePin({
          pinType: "city",
          cityName:      data.cityName,
          cityFlag:      data.cityFlag,
          cityCountry:   data.cityCountry,
          roommateCount: data.roommateCount ?? 0,
          apartmentCount: data.apartmentCount ?? 0,
        });
      }
    } catch { /* ignore non-JSON messages */ }
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleMapMessage);
    return () => window.removeEventListener("message", handleMapMessage);
  }, [handleMapMessage]);

  const mapFilter: "all" | "roommates" | "apartments" = tab === "roommates" ? "roommates" : "apartments";

  // ── Map a human-readable date string ("September 2025", "1 Aug 2025") to a quarter bucket ──
  function dateToQuarter(dateStr: string): "q1" | "q2" | "q3" | "q4" {
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const lower = dateStr.toLowerCase();
    const idx = months.findIndex(m => lower.includes(m));
    if (idx <= 2) return "q1";
    if (idx <= 5) return "q2";
    if (idx <= 8) return "q3";
    return "q4";
  }

  function matchesBudget(min: number, max: number): boolean {
    if (budgetFilter === "any") return true;
    const bracket = BUDGET_BRACKETS.find(b => b.value === budgetFilter);
    if (!bracket) return true;
    if (bracket.min !== undefined && max < bracket.min) return false;
    if (bracket.max !== undefined && min > bracket.max) return false;
    return true;
  }

  function matchesMoveIn(dateStr: string): boolean {
    if (moveInFilter === "any") return true;
    return dateToQuarter(dateStr) === moveInFilter;
  }

  const filteredRoommates = roommatePins.filter(r => {
    if (cityFilter !== "All cities" && r.city !== cityFilter) return false;
    if (!matchesBudget(r.budgetMin, r.budgetMax)) return false;
    if (!matchesMoveIn(r.moveIn)) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredApartments = apartmentPins.filter(a => {
    if (cityFilter !== "All cities" && a.city !== cityFilter) return false;
    if (!matchesBudget(a.price, a.price)) return false;
    if (!matchesMoveIn(a.availableFrom ?? "")) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Apartments only reveal their list once the visitor has actively chosen
  // a city, a budget bracket and a move-in window — avoids dumping every
  // listing on someone who hasn't told us what they're looking for yet.
  const apartmentFiltersComplete = cityFilter !== "All cities" && budgetFilter !== "any" && moveInFilter !== "any";

  const count = tab === "roommates" ? filteredRoommates.length : (apartmentFiltersComplete ? filteredApartments.length : 0);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 100px" }}>

      {/* ── Hero ─────────────────────────────────────── */}
      <div style={{ padding: "72px 0 48px", borderBottom: "1px solid var(--border)", maxWidth: 680 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgb(96,165,250)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Housing · Unimate
        </span>
        <h1 style={{
          fontSize: "clamp(36px, 5vw, 60px)",
          fontWeight: 800, letterSpacing: "-1.2px", lineHeight: 1.1,
          color: "var(--text-1)", margin: "12px 0 16px",
        }}>
          Find your home<br />in Europe.
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.7, margin: "0 0 32px", maxWidth: 520 }}>
          Connect with students looking for a flatmate, or browse apartments across 20+ European cities — all in one place.
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
            placeholder={tab === "roommates" ? "Search by name or city…" : "Search by city or listing title…"}
            value={search}
            onChange={e => setSearch(e.target.value)}
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

      {/* ── Filters bar ───────────────────────────────── */}
      <div style={{ borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0 0" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 3 }}>
            {([
              { key: "roommates",  label: "Roommates",  color: "201,163,92" },
              { key: "apartments", label: "Apartments",  color: "96,165,250"  },
            ] as const).map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                  background: tab === key ? `rgba(${color},0.15)` : "transparent",
                  color: tab === key ? `rgb(${color})` : "var(--text-3)",
                  transition: "background 0.15s, color 0.15s",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                {key === "roommates" ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                )}
                {label}
                {/* Pin dot color indicator */}
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: key === "roommates" ? "#6B9FFF" : "#F87171", flexShrink: 0 }} />
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div style={{ display: "flex", gap: 8 }}>
            {tab === "roommates" && (
              <button
                onClick={() => router.push("/housing/create-profile")}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 8, cursor: "pointer",
                  background: "rgba(201,163,92,0.12)", border: "1px solid rgba(201,163,92,0.3)",
                  color: "rgb(201,163,92)", fontSize: 12, fontWeight: 700, fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,163,92,0.2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(201,163,92,0.12)")}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Post profile
              </button>
            )}
            <button
              onClick={() => setFiltersOpen(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "transparent", border: "1px solid var(--border)",
                borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                color: "var(--text-3)", fontSize: 11, fontWeight: 600,
                letterSpacing: "0.08em", fontFamily: "inherit", transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-1)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-3)"; }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="18" x2="12" y2="18"/>
              </svg>
              {filtersOpen ? "Hide filters" : "Filters"}
            </button>
          </div>
        </div>

        {/* Collapsible filter body */}
        <div style={{
          overflow: "hidden",
          maxHeight: filtersOpen ? "320px" : "0",
          opacity: filtersOpen ? 1 : 0,
          transition: "max-height 0.3s ease, opacity 0.25s ease",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "18px 0 22px" }}>
            {/* City row */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 2, flexShrink: 0 }}>City</span>
              {CITIES.map(c => (
                <Pill key={c} active={cityFilter === c} onClick={() => setCityFilter(c)}>{c}</Pill>
              ))}
            </div>

            <div style={{ height: 1, background: "var(--border)" }} />

            {/* Budget + Move-in */}
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 2, flexShrink: 0 }}>Budget / mo</span>
                {BUDGET_BRACKETS.map(b => (
                  <Pill key={b.value} active={budgetFilter === b.value} onClick={() => setBudgetFilter(b.value)}>{b.label}</Pill>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 2, flexShrink: 0 }}>Move-in</span>
                {MOVEIN_BRACKETS.map(b => (
                  <Pill key={b.value} active={moveInFilter === b.value} onClick={() => setMoveInFilter(b.value)}>{b.label}</Pill>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Results count ─────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0 0" }}>
        <span style={{ fontSize: 13, color: "var(--text-3)" }}>
          <span style={{ color: "var(--text-1)", fontWeight: 700 }}>{count}</span>{" "}
          {tab === "roommates" ? (count === 1 ? "roommate post" : "roommate posts") : (count === 1 ? "listing" : "listings")}
        </span>
        {(cityFilter !== "All cities" || budgetFilter !== "any" || moveInFilter !== "any" || search !== "") && (
          <button
            onClick={() => { setCityFilter("All cities"); setBudgetFilter("any"); setMoveInFilter("any"); setSearch(""); }}
            style={{ fontSize: 12, color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4, transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
          >
            Clear filters ×
          </button>
        )}
      </div>

      {/* ── Map ────────────────────────────────────────── */}
      <div style={{ marginTop: 20, marginBottom: 40 }}>
        <HousingMap
          roommatePins={filteredRoommates}
          apartmentPins={filteredApartments}
          filter={mapFilter}
        />
      </div>

      {/* ── List ───────────────────────────────────────── */}
      {tab === "roommates" && (
        filteredRoommates.length === 0
          ? <EmptyList tab="roommates" />
          : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
              {filteredRoommates.map(r => (
                <div key={r.id} style={{
                  background: "var(--surface)", borderRadius: 18, border: "1px solid var(--border)",
                  padding: "26px", display: "flex", flexDirection: "column", gap: 14,
                  transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                      background: `rgba(${r.avatarColor},0.18)`, border: `1.5px solid rgba(${r.avatarColor},0.4)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 15, fontWeight: 800, color: `rgb(${r.avatarColor})`,
                    }}>
                      {r.initials}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>{r.flag} {r.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{r.university} · {r.city}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[
                      { label: "City", value: r.city },
                      { label: "Budget", value: `€${r.budgetMin}–€${r.budgetMax}` },
                      { label: "Move-in", value: r.moveIn },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "8px 10px", border: "1px solid var(--border)" }}>
                        <div style={{ fontWeight: 700, fontSize: 8, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveChat(activeChat?.id === r.id ? null : r)}
                    style={{
                      width: "100%", padding: "10px 16px", borderRadius: 10,
                      background: activeChat?.id === r.id ? `rgba(${r.avatarColor},0.25)` : `rgba(${r.avatarColor},0.13)`,
                      border: `1px solid rgba(${r.avatarColor},0.4)`,
                      color: `rgb(${r.avatarColor})`,
                      fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = `rgba(${r.avatarColor},0.22)`)}
                    onMouseLeave={e => (e.currentTarget.style.background = activeChat?.id === r.id ? `rgba(${r.avatarColor},0.25)` : `rgba(${r.avatarColor},0.13)`)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {activeChat?.id === r.id ? "Chat open ↓" : "Message"}
                  </button>
                </div>
              ))}
            </div>
          )
      )}

      {tab === "apartments" && (
        !apartmentFiltersComplete
          ? <SelectFiltersPrompt cityFilter={cityFilter} budgetFilter={budgetFilter} moveInFilter={moveInFilter} />
          : filteredApartments.length === 0
          ? <EmptyList tab="apartments" />
          : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
              {filteredApartments.map(a => (
                <div key={a.id} style={{
                  background: "var(--surface)", borderRadius: 18, border: "1px solid var(--border)",
                  padding: "26px", display: "flex", flexDirection: "column", gap: 14,
                  transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>{a.title}</h3>
                    <div style={{ fontSize: 12, color: "var(--text-3)" }}>{a.city} · {a.platform}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[
                      { label: "Rent", value: `€${a.price}/mo` },
                      { label: "Furnished", value: a.furnished ? "Yes" : "No" },
                      { label: "Platform", value: a.platform },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "8px 10px", border: "1px solid var(--border)" }}>
                        <div style={{ fontWeight: 700, fontSize: 8, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <a
                    href={a.link ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: "100%", padding: "10px 16px", borderRadius: 10,
                      background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)",
                      color: "rgb(96,165,250)",
                      fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      transition: "background 0.15s", textDecoration: "none",
                      boxSizing: "border-box",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(96,165,250,0.2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(96,165,250,0.12)")}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    View on {a.platform} →
                  </a>
                </div>
              ))}
            </div>
          )
      )}

      {/* ── Chat panel ─────────────────────────────────── */}
      {activeChat && <ChatPanel profile={activeChat} onClose={() => setActiveChat(null)} />}

      {/* ── Pin detail drawer (opens when map pin is clicked) ─── */}
      <PinDetailPanel
        pin={activePin}
        onClose={() => setActivePin(null)}
        onMessage={(profile) => {
          setActivePin(null);           // close the detail drawer first
          setActiveChat(profile);       // then open the chat panel
        }}
      />

      {/* ── Safety note ────────────────────────────────── */}
      <div style={{
        marginTop: 64, borderRadius: 16, border: "1px solid rgba(52,211,153,0.2)",
        background: "rgba(52,211,153,0.04)", padding: "24px 28px",
        display: "flex", alignItems: "flex-start", gap: 16,
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "rgb(52,211,153)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 5 }}>Safety reminder</div>
          <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65, margin: 0 }}>
            Never pay a deposit before viewing a property. Legitimate landlords won't ask for a wire transfer upfront.
            Use our in-app chat — never share your personal contact details until you feel comfortable.{" "}
            <Link href="/chat?q=What are common rental scams for students in Europe?" style={{ color: "rgb(52,211,153)", textDecoration: "none", fontWeight: 600 }}>Ask the AI assistant →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
