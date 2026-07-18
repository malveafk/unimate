"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME = `Hey! I'm Unimate 👋

I'm here to help you understand how to study abroad — universities, financial aid, housing, applications, bureaucracy. Everything you wished you'd known earlier.

Where are you from and what would you like to study?`;

const IS_PREMIUM = false; // toggle this when auth/billing is wired up

// ── Mock chat history (sidebar) — replace with real persistence later ──
type HistoryItem = { id: string; title: string; group: "Today" | "Yesterday" | "Previous 7 days" };

const CHAT_HISTORY: HistoryItem[] = [
  { id: "h1", title: "Best universities for Computer Science in Germany", group: "Today" },
  { id: "h2", title: "Housing options near Maastricht University", group: "Today" },
  { id: "h3", title: "Scholarship opportunities for EU students", group: "Yesterday" },
  { id: "h4", title: "Visa requirements for non-EU students", group: "Yesterday" },
  { id: "h5", title: "Comparing tuition: Netherlands vs Germany", group: "Previous 7 days" },
  { id: "h6", title: "What documents do I need to apply?", group: "Previous 7 days" },
  { id: "h7", title: "Life in Amsterdam as an international student", group: "Previous 7 days" },
];

const HISTORY_GROUPS: HistoryItem["group"][] = ["Today", "Yesterday", "Previous 7 days"];

// Canned message threads so switching chats actually shows different content
const MOCK_THREADS: Record<string, Message[]> = {
  h1: [
    { role: "user", content: "Best universities for Computer Science in Germany?" },
    { role: "assistant", content: "TU Munich and TU Delft-equivalent German programmes (RWTH Aachen, KIT) are the strongest picks — most bachelor CS programmes are taught in German, so check the language requirement first. Want a shortlist with English-taught options?" },
  ],
  h2: [
    { role: "user", content: "What are my housing options near Maastricht University?" },
    { role: "assistant", content: "Most students go through Guestday (the official student housing office), Kamernet, or find a room via the Unimate Housing board. Waiting lists open ~6 months before term — I'd register now if you're starting in September." },
  ],
  h3: [
    { role: "user", content: "What scholarships are available for EU students?" },
    { role: "assistant", content: "Since you're an EU student, you're eligible for the same tuition rates as locals plus most merit-based faculty scholarships. A few universities also offer excellence scholarships regardless of nationality — want me to check which ones apply to your target schools?" },
  ],
  h4: [
    { role: "user", content: "Do I need a visa as a non-EU student?" },
    { role: "assistant", content: "Depends on your nationality and destination country, but generally yes — you'll need a student visa/residence permit, proof of enrolment, financial means, and health insurance. Which country are you applying to? I can give you the exact checklist." },
  ],
  h5: [
    { role: "user", content: "How does tuition compare between the Netherlands and Germany?" },
    { role: "assistant", content: "Dutch public universities charge EU students around €2,300/year; most German public universities charge €0–€300/semester (just admin fees), but German bachelor programmes are more often taught in German. It's really a cost-vs-language tradeoff." },
  ],
  h6: [
    { role: "user", content: "What documents do I need to apply?" },
    { role: "assistant", content: "Typically: diploma/transcripts, a motivation letter, language certificate (IELTS/TOEFL), passport copy, and sometimes a CV or reference letter. Requirements vary a bit by university — tell me which one and I'll get you the exact list." },
  ],
  h7: [
    { role: "user", content: "What's life like in Amsterdam as an international student?" },
    { role: "assistant", content: "Amsterdam is fully international, bike-first, and has an incredible social scene — but housing is competitive and expensive, so start your search early. Most students live in shared flats outside the ring for better prices." },
  ],
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function startNewChat() {
    setActiveChatId(null);
    setMessages([{ role: "assistant", content: WELCOME }]);
  }

  function openHistoryChat(id: string) {
    if (!IS_PREMIUM) return; // locked for non-premium
    setActiveChatId(id);
    setMessages(MOCK_THREADS[id] ?? [{ role: "assistant", content: WELCOME }]);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = text ?? input;
    if (!content.trim() || loading) return;

    const userMessage: Message = { role: "user", content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await response.json().catch(() => ({}));

      // Daily limit hit — show the API message directly as an assistant bubble
      if (response.status === 429 && data.error === "daily_limit") {
        setMessages([...newMessages, { role: "assistant", content: data.message }]);
        return;
      }

      if (!response.ok || !data.message) {
        throw new Error(data.error || `Request failed (${response.status})`);
      }
      setMessages([...newMessages, { role: "assistant", content: data.message }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Please try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderContent = (text: string, role: "user" | "assistant") => {
    const parts: React.ReactNode[] = [];
    const segments = text.split(/(LISTA:[\s\S]*?FINE_LISTA)/g);

    segments.forEach((seg, idx) => {
      const listMatch = seg.match(/LISTA:([\s\S]*?)FINE_LISTA/);
      if (listMatch) {
        const rows = listMatch[1].trim().split("\n").filter(r => r.includes("|"));
        parts.push(
          <div key={idx} className="flex flex-col gap-2 my-4">
            {rows.map((row, j) => {
              const [title, desc] = row.split("|").map(s => s.trim());
              return (
                <div
                  key={j}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                    transition: "border-color 0.2s ease",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", letterSpacing: "-0.1px" }}>{title}</span>
                  <span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>{desc}</span>
                </div>
              );
            })}
          </div>
        );
      } else if (seg.trim()) {
        parts.push(
          <div
            key={idx}
            style={{
              fontSize: 14,
              lineHeight: 1.75,
              whiteSpace: "pre-wrap",
              color: role === "assistant" ? "var(--text-1)" : "var(--text-1)",
              letterSpacing: role === "assistant" ? "-0.1px" : "0",
            }}
          >
            {seg.trim()}
          </div>
        );
      }
    });

    return parts;
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", background: "var(--bg)" }}>
      <ChatSidebar
        activeChatId={activeChatId}
        onNewChat={startNewChat}
        onSelectChat={openHistoryChat}
      />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          position: "relative",
        }}
      >
      {/* ── Subtle radial glow behind content ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 400,
          background: "radial-gradient(ellipse at center, rgba(201,163,92,0.045) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Messages scroll area ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
            width: "100%",
            padding: "40px 20px 200px",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {messages.map((msg, i) => {
            const isLast = i === messages.length - 1;
            let text = msg.content;
            let options: string[] = [];
            if (msg.role === "assistant") {
              const match = msg.content.match(/OPZIONI:\s*(.+)\|(.+)$/m);
              if (match) {
                options = [match[1].trim(), match[2].trim()];
                text = msg.content.replace(/OPZIONI:.*$/m, "").trim();
              }
            }

            const isAssistant = msg.role === "assistant";

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                  animation: "fadeUp 0.4s ease-out both",
                  animationDelay: `${Math.min(i * 0.04, 0.2)}s`,
                  paddingBottom: 32,
                  borderBottom: i < messages.length - 1 ? "1px solid var(--border)" : "none",
                  marginBottom: i < messages.length - 1 ? 32 : 0,
                }}
              >
                {/* Role label row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  {isAssistant ? (
                    /* Unimate icon — small violet square with "U" */
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        background: "linear-gradient(135deg, #c9a35c 0%, #c9a35c 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 0 12px rgba(201,163,92,0.35)",
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path d="M3 3v5.5C3 11.09 5.24 13 8 13s5-1.91 5-4.5V3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                  ) : (
                    /* User icon — neutral circle */
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "var(--surface-2)",
                        border: "1px solid var(--border-strong)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <circle cx="8" cy="5" r="2.5" stroke="var(--text-2)" strokeWidth="1.5"/>
                        <path d="M2.5 13.5c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke="var(--text-2)" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  )}

                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono), ui-monospace, monospace",
                      fontWeight: 500,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: isAssistant ? "var(--accent)" : "var(--text-3)",
                    }}
                  >
                    {isAssistant ? "Unimate" : "You"}
                  </span>
                </div>

                {/* Message content */}
                <div style={{ paddingLeft: 32, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {renderContent(text, msg.role)}
                  </div>

                  {/* OPZIONI option chips */}
                  {options.length === 2 && isLast && !loading && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        marginTop: 12,
                      }}
                    >
                      {options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => sendMessage(opt)}
                          style={{
                            padding: "9px 16px",
                            borderRadius: 8,
                            border: "1px solid var(--border-strong)",
                            background: "var(--surface)",
                            color: "var(--text-1)",
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all 0.18s ease",
                            letterSpacing: "-0.1px",
                            textAlign: "left",
                          }}
                          onMouseEnter={e => {
                            const el = e.currentTarget;
                            el.style.background = "var(--surface-2)";
                            el.style.borderColor = "var(--accent-border)";
                            el.style.color = "var(--accent)";
                            el.style.transform = "translateY(-1px)";
                          }}
                          onMouseLeave={e => {
                            const el = e.currentTarget;
                            el.style.background = "var(--surface)";
                            el.style.borderColor = "var(--border-strong)";
                            el.style.color = "var(--text-1)";
                            el.style.transform = "translateY(0)";
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* ── Loading state ── */}
          {loading && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 0,
                animation: "fadeUp 0.3s ease-out both",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: "linear-gradient(135deg, #c9a35c 0%, #c9a35c 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 0 12px rgba(201,163,92,0.35)",
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M3 3v5.5C3 11.09 5.24 13 8 13s5-1.91 5-4.5V3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono), ui-monospace, monospace",
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                  }}
                >
                  Unimate
                </span>
              </div>

              <div style={{ paddingLeft: 32 }}>
                <LoadingPulse />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input bar — pinned to bottom of the chat column ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          padding: "16px 20px 20px",
          background: "linear-gradient(to top, var(--bg) 70%, transparent)",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto", width: "100%" }}>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-strong)",
              borderRadius: 14,
              overflow: "hidden",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
            onFocusCapture={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.borderColor = "var(--accent-border)";
              el.style.boxShadow = "0 0 0 3px var(--accent-dim)";
            }}
            onBlurCapture={e => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.borderColor = "var(--border-strong)";
              el.style.boxShadow = "none";
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about studying in Europe..."
              rows={1}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 14,
                color: "var(--text-1)",
                padding: "14px 16px 4px",
                resize: "none",
                maxHeight: 144,
                lineHeight: 1.65,
                fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
                letterSpacing: "-0.1px",
              }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = t.scrollHeight + "px";
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 10px 10px 16px",
              }}
            >
              <span
                style={{ fontWeight: 700,
                  fontSize: 11,
                  fontFamily: "var(--font-mono), ui-monospace, monospace",
                  color: "var(--text-3)",
                  letterSpacing: "0.04em",
                }}
                className="hidden sm:block"
              >
                Enter to send · Shift+Enter for newline
              </span>
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                style={{
                  marginLeft: "auto",
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: input.trim() && !loading ? "var(--accent)" : "var(--surface-2)",
                  border: "none",
                  cursor: input.trim() && !loading ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.18s ease",
                  opacity: input.trim() && !loading ? 1 : 0.35,
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  if (!loading && input.trim()) {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.06)";
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                }}
                onMouseDown={e => {
                  if (!loading && input.trim()) {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.94)";
                  }
                }}
                onMouseUp={e => {
                  if (!loading && input.trim()) {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.06)";
                  }
                }}
                aria-label="Send message"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Powered-by label */}
          <p
            style={{ fontWeight: 700,
              textAlign: "center",
              marginTop: 10,
              fontSize: 11,
              color: "var(--text-3)",
              fontFamily: "var(--font-mono), ui-monospace, monospace",
              letterSpacing: "0.04em",
            }}
          >
            Unimate can make mistakes. Verify important information.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}

/* ── Chat history sidebar — full list for Premium, locked teaser otherwise ── */
function ChatSidebar({
  activeChatId,
  onNewChat,
  onSelectChat,
}: {
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
}) {
  return (
    <div
      style={{
        width: 272,
        flexShrink: 0,
        height: "100%",
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* New chat button */}
      <div style={{ padding: "16px 14px 10px" }}>
        <button
          onClick={onNewChat}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid var(--border-strong)",
            background: "transparent",
            color: "var(--text-1)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.borderColor = "var(--accent-border)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New chat
        </button>
      </div>

      {/* History list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 10px 16px", position: "relative" }}>
        <div style={{ filter: IS_PREMIUM ? "none" : "blur(3px)", opacity: IS_PREMIUM ? 1 : 0.55, pointerEvents: IS_PREMIUM ? "auto" : "none", userSelect: IS_PREMIUM ? "auto" : "none" }}>
          {HISTORY_GROUPS.map(group => {
            const items = CHAT_HISTORY.filter(h => h.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group} style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", padding: "0 6px", marginBottom: 6 }}>
                  {group}
                </div>
                {items.map(item => {
                  const active = activeChatId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectChat(item.id)}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "none",
                        background: active ? "var(--surface-2)" : "transparent",
                        color: active ? "var(--text-1)" : "var(--text-2)",
                        fontSize: 13,
                        lineHeight: 1.4,
                        cursor: IS_PREMIUM ? "pointer" : "default",
                        fontFamily: "inherit",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        transition: "background 0.15s, color 0.15s",
                      }}
                      onMouseEnter={e => { if (IS_PREMIUM && !active) e.currentTarget.style.background = "var(--surface-2)"; }}
                      onMouseLeave={e => { if (IS_PREMIUM && !active) e.currentTarget.style.background = "transparent"; }}
                    >
                      {item.title}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Lock overlay for non-premium */}
        {!IS_PREMIUM && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 14, padding: "24px 20px", textAlign: "center",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(201,163,92,0.12)", border: "1px solid rgba(201,163,92,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="rgb(201,163,92)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", marginBottom: 6 }}>Chat history</div>
              <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.6, margin: 0 }}>
                Revisit and resume any past conversation. Premium only.
              </p>
            </div>
            <Link
              href="/pricing"
              style={{
                padding: "9px 18px", borderRadius: 10,
                background: "rgb(201,163,92)", color: "#fff",
                fontSize: 12, fontWeight: 700, textDecoration: "none",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
            >
              Unlock Premium →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Isolated loading component (same file) ── */
function LoadingPulse() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, height: 24 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: "block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--accent)",
            opacity: 0.7,
            animation: "loadingDot 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes loadingDot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.35; }
          40% { transform: scale(1); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
