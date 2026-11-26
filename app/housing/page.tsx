"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { apartmentPins, type ApartmentPin } from "../data/housing-cities";
import PinDetailPanel, { type ActivePin } from "../components/PinDetailPanel";
import { fetchApartmentPins, fetchApartmentDetails } from "@/utils/housing";
import { PARTNER_THEMES, partnerTheme, partnerTint, partnerStripe, type PartnerTheme } from "../data/housing-partners";

const HousingMap = dynamic(() => import("../components/HousingMap"), { ssr: false });

const CITIES = [
  "All cities", "Amsterdam", "Barcelona", "Berlin", "Bologna", "Brussels",
  "Copenhagen", "Delft", "Florence", "Groningen", "Leuven", "Lisbon", "Lyon",
  "London", "Maastricht", "Madrid", "Milan", "Munich", "Paris",
  "Porto", "Rotterdam", "Stockholm", "Valencia", "Vienna", "Zurich",
];

// Apartment cards are shown in blocks: a city can have over a thousand listings.
const APARTMENT_CARDS_PER_BLOCK = 24;

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
function EmptyList() {
  return (
    <div style={{ paddingTop: 40 }}>
      {/* Dashed CTA card */}
      <div style={{
        border: "1.5px dashed var(--border)", borderRadius: 18,
        padding: "52px 32px", textAlign: "center",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        background: "rgba(255,255,255,0.01)",
      }}>
        <div style={{ color: "#F87171" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-1)", marginBottom: 8, letterSpacing: "-0.3px" }}>
            No listings yet
          </div>
          <p style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.7, maxWidth: 360, margin: "0 auto" }}>
            Have a place to rent here? Email us the details and we&apos;ll publish it, so students searching can find it.
          </p>
        </div>
        <Link
          href="/housing/post-listing"
          style={{
            marginTop: 4, padding: "12px 28px", borderRadius: 12,
            textDecoration: "none", display: "inline-block",
            background: "rgba(96,165,250,0.12)",
            border: "1px solid rgba(96,165,250,0.3)",
            color: "rgb(96,165,250)",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit", transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(96,165,250,0.2)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(96,165,250,0.12)")}
        >
          List an apartment →
        </Link>
      </div>

      {/* How it works */}
      <div style={{ marginTop: 48 }}>
        <div style={{ fontWeight: 700, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 20 }}>
          How it works
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, max(220px, (100% - 32px) / 3)), 1fr))", gap: 16 }}>
          {[
            { num: "01", color: "96,165,250", title: "Choose your city", desc: "Select from 20+ European student cities. Filter by rent, furnished status and move-in date." },
            { num: "02", color: "96,165,250", title: "Browse curated listings", desc: "We aggregate trusted platforms like Kamernet, WG-Gesucht and HousingAnywhere into one feed." },
            { num: "03", color: "96,165,250", title: "Go to the platform", desc: "Click through to the original listing to get in touch with the landlord directly and securely." },
          ].map(({ num, color, title, desc }) => (
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

// ── Housing partners ───────────────────────────────
// Add a new partner by adding an entry here — nothing else to change.
type Partner = {
  name: string;
  initials: string;
  theme: PartnerTheme; // the partner's two colours, same as on its listings
  description: string;
  cities: string[];
  url: string;
  offer: string;       // what they rent, for the button: "flats", "rooms"
};

const PARTNERS: Partner[] = [
  {
    name: "ClubHouse",
    initials: "CH",
    theme: PARTNER_THEMES.clubhouse,
    description: "Handpicked student flats, curated by students who've been through the same search. Book a room and join their local community.",
    cities: ["Madrid", "Barcelona", "Paris", "Berlin"],
    url: "https://www.clubhouse-student.eu",
    offer: "flats",
  },
  {
    name: "helpHousing",
    initials: "hH",
    theme: PARTNER_THEMES.helphousing,
    description: "Furnished rooms in shared flats for students and young professionals, managed directly by helpHousing. Pick a room and book it with them.",
    cities: ["Madrid", "Barcelona", "Valencia", "Milan", "Florence"],
    url: "https://www.helphousing.com",
    offer: "rooms",
  },
];

function PartnersSection({ cityFilter }: { cityFilter: string }) {
  return (
    <section style={{ marginTop: 48 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgb(201,163,92)", marginBottom: 6 }}>
            Our housing partners
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.4px" }}>
            Trusted places to find your home
          </h2>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-3)", maxWidth: 380 }}>
          We work directly with these providers. You book with them on their own website.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: 20 }}>
        {PARTNERS.map(partner => {
          const p = { ...partner, color: partner.theme.primary };
          const inSelectedCity = p.cities.includes(cityFilter);
          return (
            <div key={p.name} style={{
              borderRadius: 18, padding: 26, display: "flex", flexDirection: "column", gap: 16,
              background: partnerTint(p.theme, "var(--surface)"),
              border: `1px solid rgba(${p.color},${inSelectedCity ? 0.55 : 0.3})`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: `rgba(${p.color},0.15)`, border: `1px solid rgba(${p.color},0.35)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 15, color: `rgb(${p.color})`, letterSpacing: "0.5px",
                }}>
                  {p.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text-1)" }}>{p.name}</h3>
                  <span style={{
                    display: "inline-block", marginTop: 4, padding: "2px 8px", borderRadius: 999,
                    fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase",
                    background: `rgba(${p.color},0.15)`, color: `rgb(${p.color})`, border: `1px solid rgba(${p.color},0.3)`,
                  }}>
                    Official partner
                  </span>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--text-2)" }}>{p.description}</p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {p.cities.map(c => (
                  <span key={c} style={{
                    padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                    background: c === cityFilter ? `rgba(${p.color},0.2)` : "rgba(0,0,0,0.3)",
                    color: c === cityFilter ? `rgb(${p.color})` : "var(--text-2)",
                    border: `1px solid ${c === cityFilter ? `rgba(${p.color},0.4)` : "var(--border)"}`,
                  }}>
                    {c}
                  </span>
                ))}
              </div>

              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: "auto", padding: "11px 16px", borderRadius: 10, textDecoration: "none",
                  background: `rgb(${p.color})`, color: p.theme.onPrimary,
                  fontSize: 13, fontWeight: 700, textAlign: "center", transition: "opacity 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                {inSelectedCity ? `See ${p.name} ${p.offer} in ${cityFilter} →` : `Visit ${p.name} →`}
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── "Pick your filters first" prompt ──────────────
function SelectFiltersPrompt({ cityFilter }: {
  cityFilter: string;
}) {
  const steps = [
    { label: "City", done: cityFilter !== "All cities", value: cityFilter !== "All cities" ? cityFilter : "Not selected" },
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
            Select a city above to see all its apartment listings. Budget and move-in are optional filters to narrow them down.
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

// ── Main page ─────────────────────────────────────────────────────
function HousingPageInner() {
  const router = useRouter();

  const [cityFilter, setCityFilter] = useState("All cities");
  const [budgetFilter, setBudgetFilter] = useState("any");
  const [moveInFilter, setMoveInFilter] = useState("any");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [activePin, setActivePin]   = useState<ActivePin | null>(null);

  // Real listings from Supabase, shown alongside the demo pins.
  // Best-effort: if the fetch fails the page still works with demo data.
  const [dbApartments, setDbApartments] = useState<ApartmentPin[]>([]);
  useEffect(() => {
    fetchApartmentPins().then(setDbApartments).catch(e => console.error("Failed to load listings:", e));
  }, []);
  const allApartments = [...dbApartments, ...apartmentPins];

  // dbApartments is the light list (no description, photos, address or link).
  // The full row of a listing is fetched when it is shown as a card or opened,
  // and kept here by id.
  const [apartmentDetails, setApartmentDetails] = useState<Record<string, ApartmentPin>>({});
  const storeDetails = useCallback((rows: ApartmentPin[]) => {
    if (rows.length) setApartmentDetails(prev => ({ ...prev, ...Object.fromEntries(rows.map(r => [r.id, r])) }));
  }, []);

  // Open a listing's on-site preview. A listing not loaded in full yet opens
  // straight away with what the list knows, then fills in when the row arrives.
  const openApartment = useCallback((pin: ApartmentPin) => {
    setActivePin({ pinType: "apartment", data: pin });
    if (!pin.partial) return;
    fetchApartmentDetails([pin.id])
      .then(rows => {
        storeDetails(rows);
        const full = rows[0];
        if (full) setActivePin(cur => (cur?.pinType === "apartment" && cur.data.id === full.id ? { pinType: "apartment", data: full } : cur));
      })
      .catch(e => console.error("Failed to load the listing:", e));
  }, [storeDetails]);

  // ── Listen for postMessage from the Leaflet iframe ──────────────
  const handleMapMessage = useCallback((e: MessageEvent) => {
    try {
      const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      if (data?.type !== "pin-click") return;

      if (data.pinType === "apartment") {
        const pin = [...dbApartments, ...apartmentPins].find(p => p.id === data.id);
        if (pin) openApartment(apartmentDetails[pin.id] ?? pin);

      } else if (data.pinType === "city") {
        setActivePin({
          pinType: "city",
          cityName:      data.cityName,
          cityFlag:      data.cityFlag,
          cityCountry:   data.cityCountry,
          apartmentCount: data.apartmentCount ?? 0,
        });
      }
    } catch { /* ignore non-JSON messages */ }
  }, [dbApartments, apartmentDetails, openApartment]);

  useEffect(() => {
    window.addEventListener("message", handleMapMessage);
    return () => window.removeEventListener("message", handleMapMessage);
  }, [handleMapMessage]);

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

  const filteredApartments = allApartments.filter(a => {
    if (cityFilter !== "All cities" && a.city !== cityFilter) return false;
    if (!matchesBudget(a.price, a.price)) return false;
    if (!matchesMoveIn(a.availableFrom ?? "")) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  })
    // Cheapest first, whatever the source: partners are mixed by price, not
    // grouped. The id breaks ties so the order is the same on every visit.
    .sort((a, b) => a.price - b.price || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  // Apartments reveal their list as soon as the visitor picks a city: one click
  // on a city shows every listing there. Budget and move-in are optional extra
  // filters that only narrow that list (left on "Any" they change nothing).
  const apartmentFiltersComplete = cityFilter !== "All cities";

  const count = apartmentFiltersComplete ? filteredApartments.length : 0;

  // Cards come in blocks of APARTMENT_CARDS_PER_BLOCK; "Show more" adds one.
  // The block count belongs to one set of filters: change any of them and the
  // list starts again from the first block.
  const filtersKey = `${cityFilter}|${budgetFilter}|${moveInFilter}|${search}`;
  const [cardBlocks, setCardBlocks] = useState({ key: filtersKey, blocks: 1 });
  const blocksShown = cardBlocks.key === filtersKey ? cardBlocks.blocks : 1;
  const shownApartments = (apartmentFiltersComplete
    ? filteredApartments.slice(0, blocksShown * APARTMENT_CARDS_PER_BLOCK)
    : []
  ).map(a => apartmentDetails[a.id] ?? a);

  // Fetch the full rows (thumbnail, description…) of the cards on screen that
  // still come from the light list.
  const missingDetailIds = shownApartments.filter(a => a.partial).map(a => a.id).join(",");
  useEffect(() => {
    if (!missingDetailIds) return;
    let cancelled = false;
    fetchApartmentDetails(missingDetailIds.split(","))
      .then(rows => { if (!cancelled) storeDetails(rows); })
      .catch(e => console.error("Failed to load listing details:", e));
    return () => { cancelled = true; };
  }, [missingDetailIds, storeDetails]);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 100px" }}>

      {/* ── Hero ─────────────────────────────────────── */}
      <div style={{ padding: "72px 0 48px", borderBottom: "1px solid var(--border)", maxWidth: 680 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgb(96,165,250)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Housing · 4UNI
        </span>
        <h1 style={{
          fontSize: "clamp(36px, 5vw, 60px)",
          fontWeight: 800, letterSpacing: "-1.2px", lineHeight: 1.1,
          color: "var(--text-1)", margin: "12px 0 16px",
        }}>
          Find your home<br />in Europe.
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.7, margin: "0 0 32px", maxWidth: 520 }}>
          Browse apartments and student rooms across 20+ European cities — all in one place.
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
            placeholder="Search by city or listing title…"
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "18px 0 0" }}>
          {/* Right controls */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => router.push("/housing/post-listing")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8, cursor: "pointer",
                background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)",
                color: "rgb(96,165,250)", fontSize: 12, fontWeight: 700, fontFamily: "inherit",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(96,165,250,0.2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(96,165,250,0.12)")}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              List an apartment
            </button>
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
          {count === 1 ? "listing" : "listings"}
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
        <HousingMap apartmentPins={filteredApartments} />
      </div>

      {/* ── List ───────────────────────────────────────── */}
      {!apartmentFiltersComplete
          ? <SelectFiltersPrompt cityFilter={cityFilter} />
          : filteredApartments.length === 0
          ? <EmptyList />
          : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: 20 }}>
              {shownApartments.map(a => {
                // A partner's listing wears the partner's two colours on the whole card.
                const theme = partnerTheme(a.source);
                const restBorder = theme ? `rgba(${theme.primary},0.3)` : "var(--border)";
                const hoverBorder = theme ? `rgba(${theme.primary},0.6)` : "var(--border-strong)";
                return (
                <div key={a.id} style={{
                  background: theme ? partnerTint(theme, "var(--surface)") : "var(--surface)",
                  borderRadius: 18, border: `1px solid ${restBorder}`,
                  padding: "26px", display: "flex", flexDirection: "column", gap: 14,
                  transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = hoverBorder; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = restBorder; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                >
                  {theme && (
                    <span style={{
                      alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 7,
                      padding: "4px 10px 4px 8px", borderRadius: 999,
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.02em",
                      background: `rgba(${theme.primary},0.12)`, border: `1px solid rgba(${theme.primary},0.3)`,
                      color: `rgb(${theme.primary})`,
                    }}>
                      <span style={{ width: 14, height: 6, borderRadius: 3, background: partnerStripe(theme) }} />
                      {theme.name}
                    </span>
                  )}
                  {(a.image?.[0] || a.photo) && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={a.image?.[0] ?? a.photo} alt={a.title} loading="lazy" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 12, border: "1px solid var(--border)" }} />
                  )}
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
                  {/* Every listing opens its on-site preview first; the link to the
                      original listing lives inside that preview. */}
                  <button
                    onClick={() => openApartment(a)}
                    style={{
                      width: "100%", padding: "10px 16px", borderRadius: 10,
                      background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)",
                      color: "rgb(96,165,250)",
                      fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(96,165,250,0.2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(96,165,250,0.12)")}
                  >
                    View details →
                  </button>
                </div>
                );
              })}
            </div>
          )}

      {/* More cards of the same city, one block at a time */}
      {shownApartments.length > 0 && shownApartments.length < filteredApartments.length && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 28 }}>
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>
            Showing {shownApartments.length} of {filteredApartments.length} listings
          </span>
          <button
            onClick={() => setCardBlocks({ key: filtersKey, blocks: blocksShown + 1 })}
            style={{
              padding: "10px 22px", borderRadius: 10,
              background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.3)",
              color: "rgb(96,165,250)",
              fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(96,165,250,0.2)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(96,165,250,0.12)")}
          >
            Show {Math.min(APARTMENT_CARDS_PER_BLOCK, filteredApartments.length - shownApartments.length)} more
          </button>
        </div>
      )}

      <PartnersSection cityFilter={cityFilter} />

      {/* ── Pin detail drawer (opens when map pin is clicked) ─── */}
      <PinDetailPanel
        pin={activePin}
        onClose={() => setActivePin(null)}
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
            Never share your personal contact details until you feel comfortable.{" "}
            <Link href="/chat?q=What are common rental scams for students in Europe?" style={{ color: "rgb(52,211,153)", textDecoration: "none", fontWeight: 600 }}>Ask the AI assistant →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HousingPage() {
  return (
    <Suspense fallback={null}>
      <HousingPageInner />
    </Suspense>
  );
}
