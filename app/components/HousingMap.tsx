"use client";

import { useRef, useEffect, useCallback } from "react";
import { housingCityCoords, type RoommatePin, type ApartmentPin } from "../data/housing-cities";

type Props = {
  roommatePins: RoommatePin[];
  apartmentPins: ApartmentPin[];
  /** "all" | "roommates" | "apartments" */
  filter: "all" | "roommates" | "apartments";
};

export default function HousingMap({ roommatePins, apartmentPins, filter }: Props) {
  const iframeRef  = useRef<HTMLIFrameElement>(null);
  const readyRef   = useRef(false);

  // Always keep a ref to the current props so listeners never go stale
  const propsRef = useRef({ roommatePins, apartmentPins, filter });
  propsRef.current = { roommatePins, apartmentPins, filter };

  /* ── Build derived data ──────────────────────────────────────────── */
  function buildPayload() {
    const { roommatePins, apartmentPins, filter } = propsRef.current;

    const cities = Object.entries(housingCityCoords).map(([name, c]) => ({
      name, ...c,
      roommateCount: roommatePins.filter(p => p.city === name).length,
      apartmentCount: apartmentPins.filter(p => p.city === name).length,
    }));

    const visibleRoommates  = filter !== "apartments" ? roommatePins : [];
    const visibleApartments = filter !== "roommates"  ? apartmentPins : [];

    return { type: "init-map", cities, roommates: visibleRoommates, apts: visibleApartments, filter };
  }

  /* ── Send current data to the iframe ────────────────────────────── */
  const sendMapData = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify(buildPayload()), "*"
    );
  }, []);

  /* ── Listen for "map-ready" from the iframe ─────────────────────── */
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data?.type === "map-ready") {
          readyRef.current = true;
          sendMapData();
        }
      } catch { /* ignore non-JSON */ }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sendMapData]);

  /* ── Re-send whenever filter / pins change ──────────────────────── */
  useEffect(() => {
    if (readyRef.current) sendMapData();
  }, [roommatePins, apartmentPins, filter, sendMapData]);

  /* ── Fallback: iframe onLoad (in case map-ready fired before listener) ── */
  const onLoad = useCallback(() => {
    if (!readyRef.current) {
      // Give the iframe script 200 ms to fire map-ready; if not, push data anyway
      setTimeout(() => {
        if (!readyRef.current) {
          readyRef.current = true;
          sendMapData();
        }
      }, 200);
    }
  }, [sendMapData]);

  /* ── Derived counts for legend ──────────────────────────────────── */
  const visibleRoommateCount  = filter !== "apartments" ? roommatePins.length  : 0;
  const visibleApartmentCount = filter !== "roommates"  ? apartmentPins.length : 0;

  return (
    <div style={{ position: "relative" }}>

      {/* ── Legend (React-rendered, sits above iframe) ─── */}
      <div style={{
        position: "absolute", top: 12, left: 12, zIndex: 10,
        display: "flex", gap: 8, flexDirection: "column",
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        borderRadius: 10,
        padding: "10px 14px",
        pointerEvents: "none",
      }}>
        {(filter === "all" || filter === "roommates") && (
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#6B9FFF", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "rgba(0,0,0,0.65)", fontWeight: 600, fontFamily: "Arial, sans-serif" }}>
              Roommates ({visibleRoommateCount})
            </span>
          </div>
        )}
        {(filter === "all" || filter === "apartments") && (
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F87171", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "rgba(0,0,0,0.65)", fontWeight: 600, fontFamily: "Arial, sans-serif" }}>
              Apartments ({visibleApartmentCount})
            </span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(0,0,0,0.18)", border: "1px solid rgba(0,0,0,0.25)", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "rgba(0,0,0,0.35)", fontWeight: 600, fontFamily: "Arial, sans-serif" }}>
            Cities (click to explore)
          </span>
        </div>
      </div>

      {/* ── Map iframe (served same-origin — no sandbox needed) ─── */}
      <iframe
        ref={iframeRef}
        src="/housing-map.html"
        onLoad={onLoad}
        style={{
          width: "100%",
          height: 480,
          border: "none",
          borderRadius: 16,
          display: "block",
        }}
        title="Housing Map"
      />
    </div>
  );
}
