// Visual identity of the partner housing feeds.
//
// Every partner has two colours. A listing that comes from a partner wears
// them everywhere it appears — the card in the list, the on-site preview, the
// partner box at the bottom of the page — so the partner recognises its own
// listings at a glance, not just from a small label. The colours are a hint on
// the dark surface (a tinted corner each), never a solid fill.
//
// Keyed by the row's `source` (see scripts/<partner>/import.ts). To add a
// partner, add an entry here: cards, preview and badge pick it up.

export type PartnerTheme = {
  name: string;       // as written in the UI
  badge: string;      // attribution shown on the partner's listings
  primary: string;    // "r,g,b" — the dominant tint (top-left corner, border, labels)
  secondary: string;  // "r,g,b" — the second tint (bottom-right corner)
  onPrimary: string;  // text colour on a solid `primary` button
};

export const PARTNER_THEMES: Record<string, PartnerTheme> = {
  // Club House: yellow and blue.
  clubhouse:   { name: "Club House",  badge: "via Club House",  primary: "245,197,66", secondary: "96,165,250",  onPrimary: "#1a1408" },
  // helpHousing: red and white.
  helphousing: { name: "helpHousing", badge: "via helpHousing", primary: "239,68,68",  secondary: "255,255,255", onPrimary: "#ffffff" },
};

export function partnerTheme(source?: string | null): PartnerTheme | undefined {
  return source ? PARTNER_THEMES[source] : undefined;
}

/**
 * CSS `background` for a partner surface: `base` (the normal dark surface)
 * with the primary colour fading in from the top-left corner and the secondary
 * from the bottom-right. `strength` scales the tint (1 = cards).
 */
export function partnerTint(theme: PartnerTheme, base: string, strength = 1): string {
  const a = (0.17 * strength).toFixed(3);
  const b = (0.11 * strength).toFixed(3);
  return [
    `linear-gradient(135deg, rgba(${theme.primary},${a}) 0%, rgba(${theme.primary},0) 45%)`,
    `linear-gradient(315deg, rgba(${theme.secondary},${b}) 0%, rgba(${theme.secondary},0) 45%)`,
    base,
  ].join(", ");
}

/** The partner's two colours side by side: stripes, dots. */
export function partnerStripe(theme: PartnerTheme): string {
  return `linear-gradient(90deg, rgb(${theme.primary}), rgb(${theme.secondary}))`;
}
