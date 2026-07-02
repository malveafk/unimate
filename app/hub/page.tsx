"use client";

import React, { useState, useRef, useEffect } from "react";
import { TransitionLink } from "../components/PageTransition";
import { news } from "../data/news";
import { universities } from "../data/universities";

/* ─── Types ───────────────────────────────────────── */
type Tab = "ai" | "universities" | "compare" | "news";
interface Message { role: "user" | "assistant"; content: string; }

const WELCOME = `Hey! I'm your 4UNI assistant 👋

I can help you find the right university, compare costs, explain scholarships, housing and visa rules.

Where are you from and what would you like to study?`;

/* ─── Icons ───────────────────────────────────────── */
function IconAI() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor"/></svg>;
}
function IconUni() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="currentColor"/></svg>;
}
function IconCompare() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}
function IconNews() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor"/></svg>;
}

/* ─── Chat widget ─────────────────────────────────── */
function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: WELCOME }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text?: string) => {
    const content = text ?? input;
    if (!content.trim() || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const data = await res.json().catch(() => ({}));
      setMessages([...next, { role: "assistant", content: data.message ?? "Something went wrong." }]);
    } catch { setMessages([...next, { role: "assistant", content: "Something went wrong." }]); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "40px 24px 160px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 0 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ paddingBottom: 28, borderBottom: i < messages.length - 1 ? "1px solid var(--border)" : "none", marginBottom: i < messages.length - 1 ? 28 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: msg.role === "assistant" ? 6 : "50%", background: msg.role === "assistant" ? "linear-gradient(135deg,#a78bfa,#7c3aed)" : "var(--surface-2)", border: msg.role === "user" ? "1px solid var(--border-strong)" : "none", flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: msg.role === "assistant" ? "var(--accent)" : "var(--text-3)" }}>
                  {msg.role === "assistant" ? "4UNI AI" : "You"}
                </span>
              </div>
              <div style={{ paddingLeft: 32, fontSize: 14, lineHeight: 1.75, color: "var(--text-1)", whiteSpace: "pre-wrap" }}>{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 32, paddingTop: 8 }}>
              {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "block", opacity: 0.7, animation: "loadingDot 1.2s ease-in-out infinite", animationDelay: `${i*0.18}s` }} />)}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 24px 20px", background: "linear-gradient(to top, var(--bg) 70%, transparent)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: 14, overflow: "hidden" }}>
            <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}} placeholder="Ask anything about studying in Europe..." rows={1}
              style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 14, color: "var(--text-1)", padding: "14px 16px 4px", resize: "none", maxHeight: 144, lineHeight: 1.65, fontFamily: "inherit" }}
              onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "6px 10px 10px" }}>
              <button onClick={() => send()} disabled={loading || !input.trim()}
                style={{ width: 34, height: 34, borderRadius: 9, background: input.trim() && !loading ? "var(--accent)" : "var(--surface-2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: input.trim() && !loading ? 1 : 0.35 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes loadingDot{0%,80%,100%{transform:scale(0.7);opacity:0.35}40%{transform:scale(1);opacity:0.85}}`}</style>
    </div>
  );
}

/* ─── Universities tab ────────────────────────────── */
function UniversitiesTab() {
  const [search, setSearch] = useState("");
  const filtered = universities.filter(u =>
    search === "" || u.name.toLowerCase().includes(search.toLowerCase()) || u.city.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{ padding: "40px 24px 80px", overflowY: "auto", height: "100%" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px", marginBottom: 8 }}>Find your university</h2>
        <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 28 }}>Browse universities across Europe.</p>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or city..."
          style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-1)", fontSize: 14, outline: "none", marginBottom: 24 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(u => (
            <TransitionLink key={u.id} href={`/universities/${u.id}`} style={{ textDecoration: "none" }}>
              <div style={{ padding: "18px 20px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "border-color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>{u.flag} {u.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)" }}>{u.city} · {u.tuition}</div>
                </div>
                <span style={{ fontSize: 13, color: "var(--text-3)" }}>→</span>
              </div>
            </TransitionLink>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Compare tab ─────────────────────────────────── */
function CompareTab() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 16 }}>
      <span style={{ fontSize: 40 }}>⚖️</span>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>Compare universities</h3>
      <p style={{ fontSize: 14, color: "var(--text-2)", margin: 0 }}>Side-by-side comparison of costs, programmes and more.</p>
      <TransitionLink href="/compare" className="btn-primary" style={{ marginTop: 8, fontSize: 13 }}>
        Open Compare →
      </TransitionLink>
    </div>
  );
}

/* ─── News tab ────────────────────────────────────── */
function NewsTab() {
  return (
    <div style={{ padding: "40px 24px 80px", overflowY: "auto", height: "100%" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px", marginBottom: 24 }}>Latest news</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {news.map(item => (
            <TransitionLink key={item.id} href={`/news/${item.id}`} style={{ textDecoration: "none" }}>
              <div style={{ padding: "18px 20px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", display: "flex", gap: 16, alignItems: "flex-start", transition: "border-color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, border: "1px solid var(--border)", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.flag} {item.tag}</span>
                    <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "monospace" }}>{item.date}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", lineHeight: 1.4 }}>{item.title}</div>
                </div>
                <span style={{ fontSize: 13, color: "var(--text-3)", flexShrink: 0 }}>→</span>
              </div>
            </TransitionLink>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Hub page ────────────────────────────────────── */
const TABS: { id: Tab; label: string; Icon: () => React.ReactElement }[] = [
  { id: "ai",           label: "AI Assistant",   Icon: IconAI },
  { id: "universities", label: "Find University", Icon: IconUni },
  { id: "compare",      label: "Compare",         Icon: IconCompare },
  { id: "news",         label: "News",            Icon: IconNews },
];

export default function HubPage() {
  const [tab, setTab] = useState<Tab>("ai");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 96px)", background: "var(--bg)", overflow: "hidden", position: "relative" }}>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {tab === "ai"           && <ChatTab />}
        {tab === "universities" && <UniversitiesTab />}
        {tab === "compare"      && <CompareTab />}
        {tab === "news"         && <NewsTab />}
      </div>

      {/* Right sidebar */}
      <div style={{
        width: sidebarOpen ? 220 : 52,
        borderLeft: "1px solid var(--border)",
        background: "var(--surface)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.28s cubic-bezier(0.22,1,0.36,1)",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          style={{
            height: 52, minWidth: 52, border: "none", background: "transparent",
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: sidebarOpen ? "flex-end" : "center",
            padding: sidebarOpen ? "0 16px" : "0",
            color: "var(--text-2)",
            borderBottom: "1px solid var(--border)",
            transition: "color 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-2)")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Nav items */}
        <div style={{ display: "flex", flexDirection: "column", padding: "8px 0", flex: 1 }}>
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  height: 48, minWidth: 52, border: "none",
                  background: active ? "var(--accent-dim)" : "transparent",
                  cursor: "pointer",
                  display: "flex", alignItems: "center",
                  gap: 12,
                  padding: sidebarOpen ? "0 16px" : "0",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  color: active ? "var(--accent)" : "var(--text-3)",
                  borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                  transition: "all 0.15s",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = "var(--text-1)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = "var(--text-3)"; }}
              >
                <Icon />
                {sidebarOpen && <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{label}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}