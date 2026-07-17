"use client";

import { useState, useRef, useEffect } from "react";
import { roommatePins, type RoommatePin } from "../data/housing-cities";

/* ── Types ─────────────────────────────────────────────────────────────────── */

type Msg = {
  from: "me" | "them";
  text: string;
  time: string;
};

type Conversation = {
  id: string;
  profile: RoommatePin;
  messages: Msg[];
  unread: number;
};

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function now() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

const REPLIES: Record<string, string[]> = {
  "demo-r1": [
    "Hi! Great to hear from you 😊",
    "Yes, I'm still looking for a flatmate in Amsterdam!",
    "My budget is around €700–950/mo. What's yours?",
    "I'd prefer someone quiet and tidy — does that match your lifestyle?",
    "Feel free to ask me anything about the place or my schedule!",
  ],
  "demo-r2": [
    "Hey! Thanks for reaching out 👋",
    "Still searching in Maastricht, yes!",
    "I'm open to any nationality, just looking for good vibes.",
    "My move-in is August — does that timeline work for you?",
    "Happy to hop on a quick video call if you want to chat more.",
  ],
  "demo-r3": [
    "Bonjour! Yes, I'm looking for a flatmate in Berlin 🙂",
    "I'm doing my Erasmus at Humboldt until July next year.",
    "I prefer a calm environment — I spend most evenings reading.",
    "I'm bilingual French/English and have basic German.",
    "Let me know if you'd like to see the place — happy to do a tour!",
  ],
};

/* ── Seed conversations from demo roommates ─────────────────────────────────── */

function seedConversations(): Conversation[] {
  return roommatePins.map((r) => ({
    id: r.id,
    profile: r,
    unread: Math.floor(Math.random() * 3),
    messages: [
      {
        from: "them",
        text: `Hi! I'm ${r.name} 👋 I saw your profile on Unimate. I'm looking for a flatmate in ${r.city} — budget around €${r.budgetMin}–€${r.budgetMax}/mo, moving in ${r.moveIn}. Would love to chat!`,
        time: "09:14",
      },
    ],
  }));
}

/* ── Avatar ─────────────────────────────────────────────────────────────────── */

function Avatar({ profile, size = 40 }: { profile: RoommatePin; size?: number }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        background: `rgba(${profile.avatarColor},0.18)`,
        border: `1.5px solid rgba(${profile.avatarColor},0.4)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.32, fontWeight: 800,
        color: `rgb(${profile.avatarColor})`,
        letterSpacing: "-0.5px",
      }}
    >
      {profile.initials}
    </div>
  );
}

/* ── Conversation list item ─────────────────────────────────────────────────── */

function ConvItem({
  conv, active, onClick,
}: {
  conv: Conversation; active: boolean; onClick: () => void;
}) {
  const last = conv.messages[conv.messages.length - 1];
  const preview = last.from === "me" ? `You: ${last.text}` : last.text;

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        width: "100%", padding: "14px 16px",
        background: active ? `rgba(${conv.profile.avatarColor},0.1)` : "transparent",
        borderLeft: active ? `3px solid rgb(${conv.profile.avatarColor})` : "3px solid transparent",
        border: "none", borderRadius: 0,
        cursor: "pointer", textAlign: "left", fontFamily: "inherit",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Avatar profile={conv.profile} size={42} />
        {conv.unread > 0 && (
          <span style={{
            position: "absolute", top: -2, right: -2,
            width: 16, height: 16, borderRadius: "50%",
            background: `rgb(${conv.profile.avatarColor})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 800, color: "#000",
          }}>
            {conv.unread}
          </span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{
            fontSize: 14, fontWeight: conv.unread > 0 ? 700 : 600,
            color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {conv.profile.flag} {conv.profile.name}
          </span>
          <span style={{ fontSize: 10, color: "var(--text-3)", flexShrink: 0, marginLeft: 8 }}>
            {last.time}
          </span>
        </div>
        <div style={{
          fontSize: 12, color: conv.unread > 0 ? "var(--text-2)" : "var(--text-3)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          fontWeight: conv.unread > 0 ? 500 : 400,
        }}>
          {preview.length > 52 ? preview.slice(0, 52) + "…" : preview}
        </div>
        <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 3 }}>
          {conv.profile.city} · {conv.profile.university}
        </div>
      </div>
    </button>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────────── */

export default function MessagesPage() {
  const [convs, setConvs] = useState<Conversation[]>(() => seedConversations());
  const [activeId, setActiveId] = useState<string>(convs[0]?.id ?? "");
  const [input, setInput] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  const activeConv = convs.find(c => c.id === activeId) ?? null;
  const replyPool = REPLIES[activeId] ?? REPLIES["demo-r1"];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages.length]);

  function selectConv(id: string) {
    setActiveId(id);
    setMobileShowChat(true);
    // Clear unread
    setConvs(cs => cs.map(c => c.id === id ? { ...c, unread: 0 } : c));
  }

  function sendMsg() {
    const text = input.trim();
    if (!text || !activeConv) return;
    const t = now();
    const myMsg: Msg = { from: "me", text, time: t };

    setConvs(cs => cs.map(c =>
      c.id === activeId ? { ...c, messages: [...c.messages, myMsg] } : c
    ));
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    // Auto-reply after short delay
    setTimeout(() => {
      const reply = replyPool[Math.floor(Math.random() * replyPool.length)];
      setConvs(cs => cs.map(c =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, { from: "them", text: reply, time: now() }] }
          : c
      ));
    }, 800 + Math.random() * 800);
  }

  return (
    <div style={{
      height: "calc(100vh - 96px)",
      display: "flex",
      background: "var(--bg)",
      overflow: "hidden",
    }}>

      {/* ── Left sidebar: conversation list ─────────────────────── */}
      <div style={{
        width: 320, flexShrink: 0,
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        ...(mobileShowChat ? { display: "none" } : {}),
      }}>
        {/* Sidebar header */}
        <div style={{
          padding: "20px 16px 14px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8 }}>
            Messages
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px" }}>
            Inbox
          </div>
          {/* Search */}
          <div style={{ position: "relative", marginTop: 14 }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text" placeholder="Search conversations…"
              style={{
                width: "100%", padding: "9px 12px 9px 34px", borderRadius: 10,
                border: "1px solid var(--border)", background: "var(--surface)",
                color: "var(--text-1)", fontSize: 13, outline: "none",
                fontFamily: "inherit", boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Demo notice */}
        <div style={{
          padding: "8px 16px",
          background: "rgba(167,139,250,0.06)",
          borderBottom: "1px solid rgba(167,139,250,0.12)",
          fontSize: 10, color: "rgba(167,139,250,0.7)",
          fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textAlign: "center",
        }}>
          DEMO · messages are not saved or sent
        </div>

        {/* Conversations */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {convs.map(conv => (
            <ConvItem
              key={conv.id}
              conv={conv}
              active={conv.id === activeId}
              onClick={() => selectConv(conv.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Right panel: active chat ─────────────────────────────── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
        minWidth: 0,
      }}>
        {activeConv ? (
          <>
            {/* Chat header */}
            <div style={{
              padding: "14px 24px",
              borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: 14,
              background: "rgba(255,255,255,0.015)",
              flexShrink: 0,
            }}>
              {/* Back button (mobile) */}
              <button
                onClick={() => setMobileShowChat(false)}
                style={{
                  display: "none",
                  background: "transparent", border: "none",
                  color: "var(--text-2)", cursor: "pointer", padding: 4,
                }}
              >
                ←
              </button>

              <Avatar profile={activeConv.profile} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>
                  {activeConv.profile.flag} {activeConv.profile.name}
                  {activeConv.profile.verified && (
                    <span style={{ marginLeft: 8, fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", color: "rgb(52,211,153)", fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.05em", verticalAlign: "middle" }}>
                      ✓ VERIFIED
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
                  {activeConv.profile.university} · {activeConv.profile.city}
                </div>
              </div>

              {/* Profile chip */}
              <div style={{ flexShrink: 0, display: "flex", gap: 8 }}>
                <div style={{
                  padding: "6px 12px", borderRadius: 8,
                  background: `rgba(${activeConv.profile.avatarColor},0.1)`,
                  border: `1px solid rgba(${activeConv.profile.avatarColor},0.25)`,
                  fontSize: 11, fontWeight: 600,
                  color: `rgb(${activeConv.profile.avatarColor})`,
                }}>
                  €{activeConv.profile.budgetMin}–€{activeConv.profile.budgetMax}/mo
                </div>
                <div style={{
                  padding: "6px 12px", borderRadius: 8,
                  background: "var(--surface)", border: "1px solid var(--border)",
                  fontSize: 11, fontWeight: 600, color: "var(--text-3)",
                }}>
                  Moves {activeConv.profile.moveIn.split(" ")[0]}
                </div>
              </div>
            </div>

            {/* Messages feed */}
            <div style={{
              flex: 1, overflowY: "auto", padding: "20px 24px",
              display: "flex", flexDirection: "column", gap: 12,
            }}>
              {/* Date divider */}
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                <span style={{
                  fontSize: 10, color: "var(--text-3)",
                  fontFamily: "var(--font-mono)", letterSpacing: "0.1em",
                  background: "var(--surface)", padding: "3px 10px",
                  borderRadius: 20, border: "1px solid var(--border)",
                }}>
                  TODAY
                </span>
              </div>

              {activeConv.messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: msg.from === "me" ? "row-reverse" : "row",
                    alignItems: "flex-end", gap: 10,
                  }}
                >
                  {msg.from === "them" && (
                    <Avatar profile={activeConv.profile} size={30} />
                  )}
                  <div style={{ maxWidth: "65%" }}>
                    <div style={{
                      padding: "10px 14px",
                      borderRadius: msg.from === "me"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                      background: msg.from === "me"
                        ? `rgba(${activeConv.profile.avatarColor},0.2)`
                        : "rgba(255,255,255,0.07)",
                      border: msg.from === "me"
                        ? `1px solid rgba(${activeConv.profile.avatarColor},0.3)`
                        : "1px solid rgba(255,255,255,0.1)",
                      fontSize: 14, color: "var(--text-1)", lineHeight: 1.6,
                    }}>
                      {msg.text}
                    </div>
                    <div style={{
                      fontSize: 10, color: "var(--text-3)", marginTop: 4,
                      textAlign: msg.from === "me" ? "right" : "left",
                      fontFamily: "var(--font-mono)",
                    }}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div style={{
              padding: "12px 20px",
              borderTop: "1px solid var(--border)",
              display: "flex", gap: 10, alignItems: "flex-end",
              background: "rgba(255,255,255,0.015)",
              flexShrink: 0,
            }}>
              <textarea
                ref={inputRef}
                rows={1}
                placeholder={`Message ${activeConv.profile.name.split(" ")[0]}…`}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); }
                }}
                style={{
                  flex: 1, padding: "11px 16px", borderRadius: 14,
                  border: "1px solid var(--border)", background: "var(--surface)",
                  color: "var(--text-1)", fontSize: 14, outline: "none",
                  fontFamily: "inherit", resize: "none", overflowY: "hidden",
                  transition: "border-color 0.15s", lineHeight: 1.5,
                }}
                onFocus={e => (e.target.style.borderColor = `rgba(${activeConv.profile.avatarColor},0.5)`)}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
              <button
                onClick={sendMsg}
                disabled={!input.trim()}
                style={{
                  width: 42, height: 42, borderRadius: 12, border: "none",
                  flexShrink: 0, marginBottom: 1,
                  background: input.trim()
                    ? `rgba(${activeConv.profile.avatarColor},0.85)`
                    : "rgba(255,255,255,0.07)",
                  color: input.trim() ? "#fff" : "var(--text-3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: input.trim() ? "pointer" : "default",
                  transition: "background 0.15s, transform 0.1s",
                }}
                onMouseEnter={e => { if (input.trim()) e.currentTarget.style.transform = "scale(1.08)"; }}
                onMouseLeave={e => (e.currentTarget.style.transform = "")}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </>
        ) : (
          /* Empty state */
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 16,
            color: "var(--text-3)",
          }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)" }}>No conversation selected</div>
            <div style={{ fontSize: 14, color: "var(--text-3)" }}>
              Choose a conversation from the sidebar to start chatting
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
