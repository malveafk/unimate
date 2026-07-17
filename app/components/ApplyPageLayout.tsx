"use client";

/**
 * ApplyPageLayout — zero-dependency resizable 3-panel layout
 *
 * Desktop:  [left panel] [drag handle] [center panel] [drag handle] [right panel]
 * Mobile:   tab bar  →  "Steps" | "Content" | "AI"  →  single-panel content
 *
 * Props:
 *   left, center, right — ReactNode for each panel
 *   storageKey          — localStorage key for persisting sizes (default "apply-layout-v1")
 *
 * Parent must give this component a bounded height (e.g. height: "calc(100vh - 57px)").
 * Internally uses height: 100% so it fills whatever the parent gives it.
 */

import { useState, useRef, useEffect, useCallback, ReactNode } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const HANDLE_W = 6; // px — visual width of each drag handle

/** Panel size limits (% of container width, handle widths excluded from pct calc) */
const LIMITS = {
  left:   { min: 15, max: 34 },
  right:  { min: 18, max: 42 },
  center: { min: 28 },            // center = 100 - left - right
} as const;

const DEFAULTS = { left: 22, right: 26 }; // %

// ── Types ─────────────────────────────────────────────────────────────────────
type Sizes    = { left: number; right: number };
type DragSide = "left" | "right";

// ── Mobile tabs ───────────────────────────────────────────────────────────────
const TABS = ["Steps", "Content", "AI"] as const;
type Tab = typeof TABS[number];

// ── Component ─────────────────────────────────────────────────────────────────
type Props = {
  left:       ReactNode;
  center:     ReactNode;
  right:      ReactNode;
  storageKey?: string;
};

export default function ApplyPageLayout({
  left,
  center,
  right,
  storageKey = "apply-layout-v1",
}: Props) {

  // ── Responsive ──────────────────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("Content");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Sizes ────────────────────────────────────────────────────────────────────
  const [sizes, setSizes] = useState<Sizes>(DEFAULTS);

  // Load persisted sizes after first paint (avoids SSR mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Sizes;
      if (typeof parsed.left === "number" && typeof parsed.right === "number") {
        setSizes(parsed);
      }
    } catch { /* ignore malformed JSON */ }
  }, [storageKey]);

  // Persist on every change (debounced naturally — only fires on state update)
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(sizes)); } catch { /* ignore */ }
  }, [sizes, storageKey]);

  // ── Drag state ───────────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging     = useRef<DragSide | null>(null);
  const startX       = useRef(0);
  const startSizes   = useRef<Sizes>(DEFAULTS);
  const [draggingActive, setDraggingActive] = useState(false);

  /** Capture pointer on the handle — all subsequent events routed to it */
  const onPointerDown = useCallback(
    (side: DragSide) => (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragging.current   = side;
      startX.current     = e.clientX;
      startSizes.current = sizes;
      setDraggingActive(true);
    },
    [sizes],
  );

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !containerRef.current) return;

    const containerW = containerRef.current.offsetWidth;
    const dx         = e.clientX - startX.current;
    const dPct       = (dx / containerW) * 100;

    setSizes(prev => {
      if (dragging.current === "left") {
        const newLeft   = clamp(startSizes.current.left + dPct, LIMITS.left.min, LIMITS.left.max);
        const newCenter = 100 - newLeft - prev.right;
        if (newCenter < LIMITS.center.min) return prev;
        return { ...prev, left: newLeft };
      } else {
        // dragging right handle → right panel grows left, shrinks right
        const newRight  = clamp(startSizes.current.right - dPct, LIMITS.right.min, LIMITS.right.max);
        const newCenter = 100 - prev.left - newRight;
        if (newCenter < LIMITS.center.min) return prev;
        return { ...prev, right: newRight };
      }
    });
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = null;
    setDraggingActive(false);
  }, []);

  // ── Reset to default (double-click on handle) ─────────────────────────────
  const onDoubleClick = useCallback((side: DragSide) => () => {
    setSizes(prev => ({
      left:  side === "left"  ? DEFAULTS.left  : prev.left,
      right: side === "right" ? DEFAULTS.right : prev.right,
    }));
  }, []);

  // ── Mobile layout ────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        {/* Tab bar */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          flexShrink: 0,
        }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: "12px 0",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab
                  ? "2px solid var(--text-1)"
                  : "2px solid transparent",
                color:      activeTab === tab ? "var(--text-1)" : "var(--text-3)",
                fontSize:   13,
                fontWeight: activeTab === tab ? 700 : 500,
                cursor:     "pointer",
                fontFamily: "inherit",
                transition: "color 0.15s, border-color 0.15s",
                marginBottom: -1, // sit on top of the border
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Single-panel content area */}
        <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          {activeTab === "Steps"   && left}
          {activeTab === "Content" && center}
          {activeTab === "AI"      && right}
        </div>
      </div>
    );
  }

  // ── Desktop layout ───────────────────────────────────────────────────────────
  return (
    <>
      {/* Transparent drag-capture overlay: keeps col-resize cursor everywhere while dragging */}
      {draggingActive && (
        <div style={{
          position:  "fixed",
          inset:     0,
          zIndex:    9999,
          cursor:    "col-resize",
          userSelect: "none",
        }} />
      )}

      <div
        ref={containerRef}
        style={{
          display:    "flex",
          height:     "100%",
          overflow:   "hidden",
          userSelect: draggingActive ? "none" : undefined,
        }}
      >
        {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
        <div style={{
          width:       `${sizes.left}%`,
          flexShrink:  0,
          overflow:    "hidden",
          display:     "flex",
          flexDirection: "column",
          minWidth:    `${LIMITS.left.min}%`,
          maxWidth:    `${LIMITS.left.max}%`,
        }}>
          {left}
        </div>

        {/* ── HANDLE: between left and center ─────────────────────────────── */}
        <Handle
          side="left"
          active={draggingActive && dragging.current === "left"}
          onPointerDown={onPointerDown("left")}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onDoubleClick={onDoubleClick("left")}
          width={HANDLE_W}
        />

        {/* ── CENTER PANEL ────────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          {center}
        </div>

        {/* ── HANDLE: between center and right ─────────────────────────── */}
        <Handle
          side="right"
          active={draggingActive && dragging.current === "right"}
          onPointerDown={onPointerDown("right")}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onDoubleClick={onDoubleClick("right")}
          width={HANDLE_W}
        />

        {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
        <div style={{
          width:       `${sizes.right}%`,
          flexShrink:  0,
          overflow:    "hidden",
          display:     "flex",
          flexDirection: "column",
          minWidth:    `${LIMITS.right.min}%`,
          maxWidth:    `${LIMITS.right.max}%`,
        }}>
          {right}
        </div>
      </div>
    </>
  );
}

// ── Handle sub-component ──────────────────────────────────────────────────────

type HandleProps = {
  side:          DragSide;
  active:        boolean;
  width:         number;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp:   (e: React.PointerEvent<HTMLDivElement>) => void;
  onDoubleClick: () => void;
};

function Handle({ side, active, width, onPointerDown, onPointerMove, onPointerUp, onDoubleClick }: HandleProps) {
  const [hovered, setHovered] = useState(false);
  const isLit = hovered || active;

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Drag to resize · Double-click to reset"
      style={{
        width:       width,
        flexShrink:  0,
        position:    "relative",
        cursor:      "col-resize",
        touchAction: "none",
        // Wider invisible hit area via padding trick
        zIndex:      10,
      }}
    >
      {/* Visual line in the centre of the handle */}
      <div style={{
        position:   "absolute",
        top:        0,
        bottom:     0,
        left:       "50%",
        transform:  "translateX(-50%)",
        width:      isLit ? 2 : 1,
        background: active
          ? "var(--accent)"
          : isLit
          ? "var(--border-strong)"
          : "var(--border)",
        transition: "width 0.12s ease, background 0.12s ease",
        borderRadius: 99,
        // Tiny dots at mid-point — VS Code-style grip indicator
      }} />

      {/* Grip dots */}
      {(isLit) && (
        <div style={{
          position:        "absolute",
          top:             "50%",
          left:            "50%",
          transform:       "translate(-50%, -50%)",
          display:         "flex",
          flexDirection:   "column",
          gap:             3,
          alignItems:      "center",
        }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width:        3,
              height:       3,
              borderRadius: "50%",
              background:   active ? "var(--accent)" : "var(--border-strong)",
              transition:   "background 0.12s",
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Utility ───────────────────────────────────────────────────────────────────
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
