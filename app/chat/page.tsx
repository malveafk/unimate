"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Send at most this many recent messages to /api/chat, which rejects
// conversations longer than 40. The full history is still saved to Supabase.
const MAX_API_MESSAGES = 30;

const WELCOME = `Hey! I'm Unimate 👋

I'm here to help you understand how to study abroad — universities, financial aid, housing, applications, bureaucracy. Everything you wished you'd known earlier.

Where are you from and what would you like to study?`;

// Compact relative time for the chat-history list (e.g. "3h ago").
function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [notifyClicked, setNotifyClicked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [conversations, setConversations] = useState<{ id: string; title: string | null; updated_at: string }[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [supabase] = useState(() => createClient());
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // On mount, for logged-in users, resume the most recent conversation so the
  // assistant remembers the previous exchange. Anonymous users keep the
  // ephemeral welcome screen. Best-effort: failures only log to the console.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      setUserId(user.id);

      // Premium status gates the chat-history dropdown (read server-side).
      fetch("/api/me")
        .then((r) => r.json())
        .then((d) => { if (!cancelled) setIsPremium(Boolean(d?.premium)); })
        .catch((e) => console.error("Failed to load premium status:", e));

      // RLS scopes both queries to the current user's rows.
      const { data: convs } = await supabase
        .from("conversations")
        .select("id")
        .order("updated_at", { ascending: false })
        .limit(1);
      const conv = convs?.[0];
      if (!conv || cancelled) return;

      const { data: msgs } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: true });
      if (!msgs || msgs.length === 0 || cancelled) return;

      setConversationId(conv.id);
      setMessages(msgs as Message[]);
    })().catch((e) => console.error("Failed to load conversation:", e));
    return () => { cancelled = true; };
  }, [supabase]);

  // Load the list of past conversations for the history dropdown (RLS-scoped).
  const loadConversations = async () => {
    if (!userId) return;
    try {
      const { data } = await supabase
        .from("conversations")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false });
      setConversations(data ?? []);
    } catch (e) {
      console.error("Failed to load conversations:", e);
    }
  };

  // Rename a conversation (premium-only). Title is capped like on creation.
  const renameConversation = async (id: string, title: string) => {
    if (!isPremium) return;
    const finalTitle = title.trim().slice(0, 60) || "Untitled chat";
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title: finalTitle } : c)));
    setEditingId(null);
    try {
      const { error } = await supabase.from("conversations").update({ title: finalTitle }).eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("Failed to rename conversation:", e);
    }
  };

  // Delete a conversation and its messages (cascade). Premium-only.
  const deleteConversation = async (id: string) => {
    if (!isPremium) return;
    if (!window.confirm("Delete this chat? This cannot be undone.")) return;
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (id === conversationId) startNewChat();
    try {
      const { error } = await supabase.from("conversations").delete().eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("Failed to delete conversation:", e);
    }
  };

  // Toggle the history dropdown, refreshing the list each time it opens.
  const toggleHistory = () => {
    setHistoryOpen((open) => {
      if (!open) loadConversations();
      return !open;
    });
  };

  // Reopen a past conversation. Premium-only: non-premium users see the list
  // but cannot load a chat (the button no-ops for them).
  const openConversation = async (id: string) => {
    if (!isPremium) return;
    try {
      const { data: msgs } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });
      setConversationId(id);
      setMessages(msgs && msgs.length > 0 ? (msgs as Message[]) : [{ role: "assistant", content: WELCOME }]);
      setHistoryOpen(false);
      setRateLimited(false);
    } catch (e) {
      console.error("Failed to open conversation:", e);
    }
  };

  // Persist the user message (creating the conversation on first send) and
  // return the conversation id, or null if not logged in / the save failed.
  const persistUserMessage = async (userText: string): Promise<string | null> => {
    if (!userId) return null;
    try {
      let convId = conversationId;
      if (!convId) {
        const { data, error } = await supabase
          .from("conversations")
          .insert({ user_id: userId, title: userText.slice(0, 40) })
          .select("id")
          .single();
        if (error || !data) throw error ?? new Error("no conversation id");
        convId = data.id;
        setConversationId(convId);
      }
      const { error: msgErr } = await supabase
        .from("messages")
        .insert({ conversation_id: convId, role: "user", content: userText });
      if (msgErr) throw msgErr;
      return convId;
    } catch (e) {
      console.error("Failed to save user message:", e);
      return null;
    }
  };

  // Persist the assistant reply and bump the conversation's updated_at so it
  // resurfaces as the most recent one on the next visit.
  const persistAssistantMessage = async (convId: string, assistantText: string) => {
    try {
      const { error: msgErr } = await supabase
        .from("messages")
        .insert({ conversation_id: convId, role: "assistant", content: assistantText });
      if (msgErr) throw msgErr;
      const { error: updErr } = await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", convId);
      if (updErr) throw updErr;
    } catch (e) {
      console.error("Failed to save assistant message:", e);
    }
  };

  // Start a fresh conversation. The previous one stays saved in Supabase.
  const startNewChat = () => {
    setMessages([{ role: "assistant", content: WELCOME }]);
    setConversationId(null);
    setInput("");
    setRateLimited(false);
  };

  const sendMessage = async (text?: string) => {
    const content = text ?? input;
    if (!content.trim() || loading) return;

    const userMessage: Message = { role: "user", content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    // Persist the user message for logged-in users (best-effort, no-op otherwise).
    const convId = await persistUserMessage(content);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only send the most recent messages to stay under the API's 40-message
        // limit; the full history remains saved in Supabase.
        body: JSON.stringify({ messages: newMessages.slice(-MAX_API_MESSAGES) }),
      });

      if (response.status === 429) {
        // Lifetime free-message cap reached — keep the Premium screen up (no auto-reset).
        setRateLimited(true);
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.message) {
        throw new Error(data.error || `Request failed (${response.status})`);
      }
      setMessages([...newMessages, { role: "assistant", content: data.message }]);
      // Save the assistant reply once we have it (best-effort).
      if (convId) await persistAssistantMessage(convId, data.message);
    } catch (err) {
      console.error("Chat request failed:", err instanceof Error ? err.message : err);
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

      {/* ── Top controls: history + new chat (logged-in only) ── */}
      {/* Fixed to the viewport so the buttons stay put while the chat scrolls. */}
      {userId && (
        <div style={{ position: "fixed", top: 120, right: 20, zIndex: 15, display: "flex", gap: 8 }}>
          {/* History dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={toggleHistory}
              style={{
                padding: "7px 14px",
                borderRadius: 9,
                border: "1px solid var(--border-strong)",
                background: "var(--surface)",
                color: "var(--text-2)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "color 0.15s ease, border-color 0.15s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--text-1)"; e.currentTarget.style.borderColor = "var(--accent-border)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
            >
              History
            </button>

            {historyOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: 300,
                  maxHeight: 380,
                  overflowY: "auto",
                  background: "var(--surface)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: 12,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                  padding: 6,
                }}
              >
                {!isPremium && (
                  <div style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-1)" }}>✨ Chat history is Premium</span>
                    <span style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.4 }}>
                      Reopening past chats needs Unimate Premium (coming soon).
                    </span>
                  </div>
                )}

                {conversations.length === 0 ? (
                  <div style={{ padding: "14px 12px", fontSize: 12, color: "var(--text-3)" }}>No past chats yet.</div>
                ) : (
                  conversations.map((c) => (
                    <div
                      key={c.id}
                      className="chat-history-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        borderRadius: 8,
                        background: c.id === conversationId ? "var(--surface-2)" : "transparent",
                      }}
                    >
                      {editingId === c.id ? (
                        <input
                          autoFocus
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => renameConversation(c.id, editingTitle)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { e.preventDefault(); renameConversation(c.id, editingTitle); }
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: "9px 12px",
                            borderRadius: 8,
                            border: "1px solid var(--accent-border)",
                            background: "var(--bg)",
                            color: "var(--text-1)",
                            fontSize: 13,
                            fontFamily: "inherit",
                            outline: "none",
                          }}
                        />
                      ) : (
                        <>
                          <button
                            onClick={() => openConversation(c.id)}
                            disabled={!isPremium}
                            title={isPremium ? undefined : "Premium feature (coming soon)"}
                            style={{
                              flex: 1,
                              minWidth: 0,
                              textAlign: "left",
                              padding: "9px 12px",
                              borderRadius: 8,
                              border: "none",
                              background: "transparent",
                              color: isPremium ? "var(--text-1)" : "var(--text-3)",
                              fontSize: 13,
                              fontFamily: "inherit",
                              cursor: isPremium ? "pointer" : "not-allowed",
                              opacity: isPremium ? 1 : 0.6,
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            {!isPremium && <span style={{ flexShrink: 0 }}>🔒</span>}
                            <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.title || "Untitled chat"}
                            </span>
                            <span style={{ flexShrink: 0, fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                              {timeAgo(c.updated_at)}
                            </span>
                          </button>

                          {isPremium && (
                            <div className="chat-history-actions" style={{ display: "flex", gap: 2, paddingRight: 6, flexShrink: 0 }}>
                              <button
                                onClick={() => { setEditingId(c.id); setEditingTitle(c.title || ""); }}
                                title="Rename"
                                aria-label="Rename chat"
                                style={{ padding: 5, borderRadius: 6, border: "none", background: "transparent", color: "var(--text-3)", cursor: "pointer", display: "flex" }}
                                onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
                                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                  <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => deleteConversation(c.id)}
                                title="Delete"
                                aria-label="Delete chat"
                                style={{ padding: 5, borderRadius: 6, border: "none", background: "transparent", color: "var(--text-3)", cursor: "pointer", display: "flex" }}
                                onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
                                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                  <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* New chat */}
          <button
            onClick={startNewChat}
            style={{
              padding: "7px 14px",
              borderRadius: 9,
              border: "1px solid var(--border-strong)",
              background: "var(--surface)",
              color: "var(--text-2)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "color 0.15s ease, border-color 0.15s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-1)"; e.currentTarget.style.borderColor = "var(--accent-border)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
          >
            + New chat
          </button>
        </div>
      )}

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
          {rateLimited ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                padding: "14px 16px",
                borderRadius: 14,
                background: "var(--accent-dim)",
                border: "1px solid var(--accent-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>✨</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.1px" }}>
                    You&apos;ve used all your free messages
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.4 }}>
                    Upgrade to Unimate Premium (coming soon) to keep chatting.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setNotifyClicked(true)}
                disabled={notifyClicked}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--accent-border)",
                  background: notifyClicked ? "transparent" : "var(--accent)",
                  color: notifyClicked ? "var(--text-2)" : "white",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: notifyClicked ? "default" : "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {notifyClicked ? "We'll let you know 🎉" : "Notify me"}
              </button>
            </div>
          ) : (
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
          )}

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
