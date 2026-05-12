"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME = `Hey! I'm Unimate 👋

I'm here to help you understand how to study abroad — universities, financial aid, housing, applications, bureaucracy. Everything you wished you'd known earlier.

Where are you from and what would you like to study?`;

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 60px)",
        background: "var(--bg)",
        position: "relative",
      }}
    >
      {/* ── Subtle radial glow behind content ── */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 400,
          background: "radial-gradient(ellipse at center, rgba(167,139,250,0.045) 0%, transparent 70%)",
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
                        background: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 0 12px rgba(167,139,250,0.35)",
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
                    background: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 0 12px rgba(167,139,250,0.35)",
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

      {/* ── Input bar — fixed bottom ── */}
      <div
        style={{
          position: "fixed",
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
                style={{
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
            style={{
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
