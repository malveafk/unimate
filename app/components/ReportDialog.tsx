"use client";

import { useEffect, useState } from "react";
import { REPORT_REASONS, type ReportReason } from "@/utils/reportReasons";

type Props = {
  // What is being reported, in the user's words: "this listing", "Marta".
  target: string;
  onSubmit: (reason: ReportReason, details: string) => Promise<void>;
  onClose: () => void;
};

// Messages for the error codes utils/moderation.ts throws by name. Anything
// else is a real fault and says so rather than guessing.
function errorMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : "";
  if (code === "already-reported") return "You have already reported this. An admin will look at it.";
  if (code === "not-signed-in") return "Please sign in first — a report has to come from an account.";
  if (code === "not-set-up") return "Reporting is not set up on this site yet. Please contact us instead.";
  return "Something went wrong. Please try again.";
}

export default function ReportDialog({ target, onSubmit, onClose }: Props) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const [state, setState] = useState<"form" | "sending" | "sent">("form");
  const [error, setError] = useState("");

  // A dialog takes the keyboard: Esc closes it, and it closes over the detail
  // panel underneath rather than letting that one scroll behind it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit() {
    if (!reason) return;
    setState("sending");
    setError("");
    try {
      await onSubmit(reason, details);
      setState("sent");
    } catch (e) {
      setError(errorMessage(e));
      setState("form");
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        animation: "fadeIn 0.15s ease",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Report ${target}`}
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 440, maxHeight: "86vh", overflowY: "auto",
          background: "var(--surface)", border: "1px solid var(--border-strong)",
          borderRadius: 18, padding: "26px 26px 22px",
          display: "flex", flexDirection: "column", gap: 18,
        }}
      >
        {state === "sent" ? (
          <>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-1)" }}>
                Thanks — report sent
              </h2>
              <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>
                An admin will read it and decide what to do. Nothing changes on the
                site straight away, and the person you reported is not told who
                reported them.
              </p>
            </div>
            <button onClick={onClose} style={primaryButton}>Close</button>
          </>
        ) : (
          <>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-1)" }}>
                Report {target}
              </h2>
              <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--text-2)", lineHeight: 1.65 }}>
                This goes to a 4UNI admin, not to the person you are reporting.
                If you just want them to leave you alone, blocking is faster.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {REPORT_REASONS.map(r => {
                const selected = reason === r.value;
                return (
                  <label
                    key={r.value}
                    style={{
                      display: "flex", gap: 11, alignItems: "flex-start", cursor: "pointer",
                      padding: "11px 13px", borderRadius: 12,
                      border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                      background: selected ? "rgba(201,163,92,0.07)" : "transparent",
                      transition: "border-color 0.12s, background 0.12s",
                    }}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      checked={selected}
                      onChange={() => setReason(r.value)}
                      style={{ marginTop: 3, accentColor: "var(--accent)", flexShrink: 0 }}
                    />
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "var(--text-1)" }}>
                        {r.label}
                      </span>
                      <span style={{ display: "block", fontSize: 12, color: "var(--text-3)", lineHeight: 1.55, marginTop: 2 }}>
                        {r.hint}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>

            <div>
              <label htmlFor="report-details" style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--text-2)", marginBottom: 7 }}>
                What happened? <span style={{ fontWeight: 400, color: "var(--text-3)" }}>(optional, but it helps)</span>
              </label>
              <textarea
                id="report-details"
                value={details}
                maxLength={1000}
                onChange={e => setDetails(e.target.value)}
                rows={4}
                placeholder="For example: asked me to transfer €800 by bank transfer before any viewing."
                style={{
                  width: "100%", boxSizing: "border-box", resize: "vertical",
                  padding: "11px 13px", borderRadius: 12,
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  color: "var(--text-1)", fontSize: 13, fontFamily: "inherit", lineHeight: 1.6,
                }}
              />
              <div style={{ fontSize: 11, color: "var(--text-3)", textAlign: "right", marginTop: 4 }}>
                {details.length}/1000
              </div>
            </div>

            {error && (
              <p style={{ margin: 0, fontSize: 12.5, color: "#f87171", lineHeight: 1.55 }}>{error}</p>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} style={secondaryButton}>Cancel</button>
              <button
                onClick={submit}
                disabled={!reason || state === "sending"}
                style={{
                  ...primaryButton,
                  opacity: !reason || state === "sending" ? 0.5 : 1,
                  cursor: !reason || state === "sending" ? "not-allowed" : "pointer",
                }}
              >
                {state === "sending" ? "Sending…" : "Send report"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const baseButton: React.CSSProperties = {
  flex: 1, padding: "12px 0", borderRadius: 12,
  fontSize: 13.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
};

const primaryButton: React.CSSProperties = {
  ...baseButton,
  border: "none", background: "#f87171", color: "#1a1a1a",
};

const secondaryButton: React.CSSProperties = {
  ...baseButton,
  border: "1px solid var(--border-strong)", background: "transparent", color: "var(--text-2)",
};
