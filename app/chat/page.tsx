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
      const data = await response.json();
      if (data.message) {
        setMessages([...newMessages, { role: "assistant", content: data.message }]);
      }
    } catch {
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
          <div key={idx} className="flex flex-col gap-3 my-4">
            {rows.map((row, j) => {
              const [title, desc] = row.split("|").map(s => s.trim());
              return (
                <div key={j} className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs font-bold text-white">{title}</span>
                  <span className="text-sm text-zinc-400 leading-relaxed">{desc}</span>
                </div>
              );
            })}
          </div>
        );
      } else if (seg.trim()) {
        parts.push(
          <div key={idx} className={`text-sm leading-relaxed whitespace-pre-wrap ${role === "assistant" ? "text-zinc-200" : "text-zinc-400 font-medium"}`}>
            {seg.trim()}
          </div>
        );
      }
    });

    return parts;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-black">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
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
            return (
              <div key={i} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${msg.role === "assistant" ? "bg-white text-black" : "bg-zinc-800 text-zinc-400"}`}>
                    {msg.role === "assistant" ? "U" : "T"}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    {msg.role === "assistant" ? "Assistant" : "You"}
                  </span>
                </div>
                
                <div className="pl-9 max-w-2xl">
                  {renderContent(text, msg.role)}
                </div>

                {options.length === 2 && isLast && !loading && (
                  <div className="pl-9 flex flex-wrap gap-3 pt-4">
                    {options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => sendMessage(opt)}
                        className="px-5 py-3 rounded-xl border border-white/10 bg-zinc-900/30 text-xs font-semibold text-zinc-300 hover:bg-zinc-900/80 hover:border-white/20 transition-all text-left max-w-xs"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center text-[10px] font-bold">U</div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Assistant</span>
              </div>
              <div className="pl-9 flex gap-1">
                <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-gradient-to-t from-black via-black to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="relative group bg-zinc-900/50 border border-white/10 rounded-2xl p-2 focus-within:border-white/20 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about studying in Europe..."
              rows={1}
              className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-zinc-600 px-4 py-3 resize-none max-h-32"
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = t.scrollHeight + "px";
              }}
            />
            <div className="flex items-center justify-between px-4 pb-2">
              <span className="text-[10px] text-zinc-600 font-mono">Press Enter to send</span>
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center disabled:opacity-20 transition-all hover:scale-105 active:scale-95"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
