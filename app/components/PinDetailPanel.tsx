"use client";

import Link from "next/link";
import { useEffect } from "react";
import { type RoommatePin, type ApartmentPin } from "../data/housing-cities";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ActivePin =
  | { pinType: "roommate";  data: RoommatePin }
  | { pinType: "apartment"; data: ApartmentPin }
  | { pinType: "city"; cityName: string; cityFlag: string; cityCountry: string; roommateCount: number; apartmentCount: number };

type Props = {
  pin:       ActivePin | null;
  onClose:   () => void;
  onMessage: (profile: RoommatePin) => void; // opens the chat panel
};

// Platform brand colours (subtle)
const PLATFORM_COLORS: Record<string, string> = {
  "Kamernet":       "96,165,250",
  "WG-Gesucht":     "52,211,153",
  "HousingAnywhere": "167,139,250",
  "Spotahome":      "251,191,36",
  "Erasmusu":       "248,113,113",
};

function platformColor(name: string): string {
  return PLATFORM_COLORS[name] ?? "180,180,180";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>
      {children}
    </div>
  );
}

function Tag({ label, color = "255,255,255" }: { label: string; color?: string }) {
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500,
      background: `rgba(${color},0.08)`,
      border: `1px solid rgba(${color},0.2)`,
      color: `rgb(${color})`,
    }}>{label}</span>
  );
}

// ── Roommate detail ───────────────────────────────────────────────────────────

function RoommateDetail({ data, onMessage }: { data: RoommatePin; onMessage: (p: RoommatePin) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "20px 22px 24px" }}>

      {/* Avatar + identity */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, flexShrink: 0,
          background: `rgba(${data.avatarColor},0.18)`,
          border: `1.5px solid rgba(${data.avatarColor},0.35)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, fontWeight: 800, color: `rgb(${data.avatarColor})`,
          letterSpacing: "-0.5px",
        }}>
          {data.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.3px" }}>{data.name}</span>
            <span style={{ fontSize: 18 }}>{data.flag}</span>
            {data.verified && (
              <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", color: "rgb(52,211,153)", fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>✓ ID VERIFIED</span>
            )}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>
            {[data.age && `${data.age} y.o.`, data.gender, data.nationality].filter(Boolean).join(" · ")}
          </div>
        </div>
      </div>

      {/* University */}
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)" }}>
        <SectionLabel>University</SectionLabel>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 2 }}>{data.university}</div>
        {(data.programme || data.year) && (
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>
            {[data.programme, data.year && `Year ${data.year}`].filter(Boolean).join(" · ")}
          </div>
        )}
      </div>

      {/* Budget + move-in */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)" }}>
          <SectionLabel>Budget / mo</SectionLabel>
          <div style={{ fontSize: 16, fontWeight: 800, color: "rgb(52,211,153)", letterSpacing: "-0.3px" }}>
            €{data.budgetMin}–€{data.budgetMax}
          </div>
        </div>
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)" }}>
          <SectionLabel>Move-in</SectionLabel>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", lineHeight: 1.4 }}>{data.moveIn}</div>
        </div>
      </div>

      {/* Bio */}
      {data.bio && (
        <div>
          <SectionLabel>About</SectionLabel>
          <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.75, margin: 0 }}>{data.bio}</p>
        </div>
      )}

      {/* Lifestyle tags */}
      {data.lifestyle && data.lifestyle.length > 0 && (
        <div>
          <SectionLabel>Lifestyle</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data.lifestyle.map(t => <Tag key={t} label={t} />)}
          </div>
        </div>
      )}

      {/* Languages */}
      {data.languages && data.languages.length > 0 && (
        <div>
          <SectionLabel>Languages</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data.languages.map(l => <Tag key={l} label={l} color="96,165,250" />)}
          </div>
        </div>
      )}

      {/* Looking for */}
      {data.lookingFor && (
        <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.15)" }}>
          <SectionLabel>Looking for</SectionLabel>
          <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7, margin: 0 }}>{data.lookingFor}</p>
        </div>
      )}

      {/* ── Contact box ──────────────────────────────────────────────────────── */}
      <div style={{
        padding: "18px 18px",
        borderRadius: 14,
        border: "1px solid rgba(107,159,255,0.25)",
        background: "rgba(107,159,255,0.05)",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>
            Interested? Send a message
          </div>
          <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0, lineHeight: 1.6 }}>
            Your ID must be verified to message other students. Messages are encrypted end-to-end.
          </p>
        </div>
        <button
          onClick={() => onMessage(data)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "13px 0", borderRadius: 12, border: "none",
            background: "#6B9FFF", color: "#fff",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit", transition: "opacity 0.15s, transform 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Message {data.name.split(" ")[0]}
        </button>
        {!data.verified && (
          <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0, textAlign: "center" }}>
            ⚠️ This profile is not yet ID-verified
          </p>
        )}
      </div>
    </div>
  );
}

// ── Apartment detail ──────────────────────────────────────────────────────────

function ApartmentDetail({ data }: { data: ApartmentPin }) {
  const color = platformColor(data.platform);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "20px 22px 24px" }}>

      {/* Price + furnished badge */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "rgb(248,113,113)", letterSpacing: "-0.7px", lineHeight: 1 }}>
            €{data.price}<span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-3)" }}>/mo</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>{data.city}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
          <span style={{
            padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
            background: data.furnished ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)",
            border: data.furnished ? "1px solid rgba(52,211,153,0.25)" : "1px solid var(--border)",
            color: data.furnished ? "rgb(52,211,153)" : "var(--text-3)",
          }}>
            {data.furnished ? "Furnished" : "Unfurnished"}
          </span>
          {data.rooms && (
            <span style={{ padding: "3px 9px", borderRadius: 5, fontSize: 11, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-3)" }}>
              {data.rooms} {data.rooms === 1 ? "room" : "rooms"}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.3px", lineHeight: 1.35 }}>{data.title}</div>
      </div>

      {/* Available from */}
      {data.availableFrom && (
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Available from</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>{data.availableFrom}</span>
        </div>
      )}

      {/* Description */}
      {data.description && (
        <div>
          <SectionLabel>Description</SectionLabel>
          <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.75, margin: 0 }}>{data.description}</p>
        </div>
      )}

      {/* ── Platform link box ────────────────────────────────────────────────── */}
      {data.link ? (
        <a
          href={data.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 18px", borderRadius: 14, textDecoration: "none",
            border: `1px solid rgba(${color},0.25)`,
            background: `rgba(${color},0.06)`,
            transition: "background 0.15s, border-color 0.15s, transform 0.15s",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = `rgba(${color},0.12)`;
            el.style.borderColor = `rgba(${color},0.45)`;
            el.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = `rgba(${color},0.06)`;
            el.style.borderColor = `rgba(${color},0.25)`;
            el.style.transform = "translateY(0)";
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: `rgb(${color})`, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 3 }}>
              Listed on {data.platform}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-1)", fontWeight: 600 }}>
              View full listing →
            </div>
          </div>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: `rgba(${color},0.12)`, border: `1px solid rgba(${color},0.2)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={`rgb(${color})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </div>
        </a>
      ) : (
        <div style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 13, color: "var(--text-3)", textAlign: "center" }}>
          Listed on <strong style={{ color: "var(--text-2)" }}>{data.platform}</strong> — link coming soon
        </div>
      )}

      {/* Safety note */}
      <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.6, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
        🔒 Always visit the property before paying any deposit. Never transfer money without a signed contract.
      </div>
    </div>
  );
}

// ── City ghost detail ─────────────────────────────────────────────────────────

function CityDetail({ cityName, cityFlag, cityCountry, roommateCount, apartmentCount }: {
  cityName: string; cityFlag: string; cityCountry: string; roommateCount: number; apartmentCount: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "20px 22px 24px" }}>
      {/* City header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 48, lineHeight: 1 }}>{cityFlag}</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px" }}>{cityName}</div>
          <div style={{ fontSize: 13, color: "var(--text-3)" }}>{cityCountry}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ padding: "14px", borderRadius: 12, border: "1px solid rgba(107,159,255,0.2)", background: "rgba(107,159,255,0.05)" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#6B9FFF", letterSpacing: "-0.5px" }}>{roommateCount}</div>
          <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3, fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Roommates</div>
        </div>
        <div style={{ padding: "14px", borderRadius: 12, border: "1px solid rgba(248,113,113,0.2)", background: "rgba(248,113,113,0.05)" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#F87171", letterSpacing: "-0.5px" }}>{apartmentCount}</div>
          <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3, fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Apartments</div>
        </div>
      </div>

      {roommateCount === 0 && apartmentCount === 0 ? (
        <>
          <div style={{ padding: "18px", borderRadius: 14, border: "1px dashed rgba(255,255,255,0.12)", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🏙️</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", marginBottom: 6 }}>No listings in {cityName} yet</div>
            <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0, lineHeight: 1.6 }}>
              Be the first student to post a roommate profile or apartment listing here.
            </p>
          </div>
          <Link
            href="/housing/create-profile"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "14px 0", borderRadius: 12, textDecoration: "none",
              background: "var(--text-1)", color: "var(--bg)", fontSize: 14, fontWeight: 700,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
          >
            Post your profile in {cityName} →
          </Link>
        </>
      ) : (
        <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>
          Use the filters above the map to browse roommates and apartments in {cityName}.
        </div>
      )}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function PinDetailPanel({ pin, onClose, onMessage }: Props) {
  const isOpen = !!pin;

  // While the drawer is open, freeze the page behind it so the mouse wheel
  // scrolls the drawer content instead of the housing page underneath.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [isOpen]);

  // Derive header label
  const headerLabel =
    !pin         ? ""
    : pin.pinType === "roommate"  ? "Roommate profile"
    : pin.pinType === "apartment" ? "Apartment listing"
    : `${pin.cityName}`;

  const headerColor =
    !pin         ? "255,255,255"
    : pin.pinType === "roommate"  ? "107,159,255"
    : pin.pinType === "apartment" ? "248,113,113"
    : "255,255,255";

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 1200,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(2px)",
            animation: "fadeIn 0.2s ease",
          }}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 400,
          maxWidth: "92vw",
          zIndex: 1201,
          background: "var(--bg)",
          borderLeft: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
          boxShadow: isOpen ? "-24px 0 80px rgba(0,0,0,0.7)" : "none",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: `rgb(${headerColor})`,
              boxShadow: `0 0 6px rgba(${headerColor},0.6)`,
            }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>{headerLabel}</span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8, border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.04)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-2)", transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollable content — overscroll contained so reaching the end of the
            drawer never hands the wheel over to the page behind it */}
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0, overscrollBehavior: "contain" }}>
          {pin?.pinType === "roommate" && (
            <RoommateDetail data={pin.data} onMessage={onMessage} />
          )}
          {pin?.pinType === "apartment" && (
            <ApartmentDetail data={pin.data} />
          )}
          {pin?.pinType === "city" && (
            <CityDetail
              cityName={pin.cityName}
              cityFlag={pin.cityFlag}
              cityCountry={pin.cityCountry}
              roommateCount={pin.roommateCount}
              apartmentCount={pin.apartmentCount}
            />
          )}
        </div>
      </div>
    </>
  );
}
