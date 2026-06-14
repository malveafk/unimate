"use client";

import { useEffect, useState } from "react";

export default function TopBar() {
  const [time, setTime] = useState("--:--:--");
  const [date, setDate] = useState("");

  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDate(now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }));
    }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0,
      height: 36,
      background: "#111111",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
      zIndex: 1100,
    }}>
      <span style={{ fontSize: 11, color: "#555555", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>
        {date}
      </span>

      <span style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", letterSpacing: "0.2em", fontFamily: "monospace" }}>
        {time}
      </span>

      <span style={{ fontSize: 11, color: "#555555", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>
        4UNI
      </span>
    </div>
  );
}