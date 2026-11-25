import React from "react";

// Chat replies cite official pages as full URLs; this turns them into links.
// Trailing punctuation (".", ")", ",") stays outside the link.
const URL_RE = /(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])/g;

export function Linkified({ text }: { text: string }) {
  const parts = text.split(URL_RE);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <a key={i} href={p} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "underline", wordBreak: "break-all" }}>
            {p}
          </a>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        )
      )}
    </>
  );
}
