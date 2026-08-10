/**
 * Single source of truth for every cost figure shown in the app.
 *
 * All numbers are derived from the live `tuition` / `livingCost` strings that
 * come from Supabase (and, as a fallback, from app/data/universities.ts).
 * Nothing is duplicated into a second hand-maintained file, so the Uni Page,
 * the Compare Page and the Apply page can never drift apart — they all call
 * the functions below.
 *
 * Deliberate rules:
 *  - Never estimate. When a figure cannot be derived from the string we return
 *    null and the UI shows "—" instead of a guess.
 *  - Never convert between currencies. A CHF tuition and a EUR living cost
 *    cannot be summed without an exchange rate, so `total` stays null for those
 *    universities rather than showing a misleading number.
 */

export type Currency = "EUR" | "GBP" | "CHF";

export type Money = {
  min: number;
  max: number;
  currency: Currency;
};

export type UniversityCosts = {
  /** Annualised tuition at the EU/EEA (or Home) rate. */
  tuition: Money | null;
  /** Living cost per month. */
  living: Money | null;
  /** tuition + 12 months of living. Null when the two use different currencies. */
  total: Money | null;
};

/** Minimal shape needed — works for both the Supabase and the static type. */
type CostSource = { tuition: string; livingCost: string };

/**
 * Parses one figure. Handles Italian/German decimal commas ("€189,80" is
 * 189.80, not 18 980) by treating a trailing separator followed by one or two
 * digits as decimals, and anything else as a thousands separator.
 */
function parseFigure(raw: string): number {
  const s = raw.trim();
  const decimals = s.match(/[.,](\d{1,2})$/);
  if (decimals) {
    const whole = s.slice(0, s.length - decimals[0].length).replace(/[.,]/g, "");
    const cents = parseInt(decimals[1].padEnd(2, "0"), 10);
    return Math.round(parseInt(whole || "0", 10) + cents / 100);
  }
  return parseInt(s.replace(/[.,]/g, ""), 10);
}

/**
 * Tuition strings often list the EU rate first and the international rate
 * after a ";" or a spaced "/", e.g.
 *   "€2,694/anno (EU) / €12,068–€28,416/anno (non-EU)"
 * Unimate targets EU students, so we always read the first segment.
 */
function firstSegment(s: string): string {
  return s.split(/;| \/ /)[0];
}

function detectCurrency(s: string): Currency {
  if (/CHF/i.test(s)) return "CHF";
  if (/£/.test(s)) return "GBP";
  return "EUR";
}

/**
 * @param annualise multiply per-semester figures by 2 (two semesters per
 *                  academic year). Only meaningful for tuition.
 */
function parseMoney(source: string, annualise: boolean): Money | null {
  if (!source) return null;
  const segment = firstSegment(source);
  const currency = detectCurrency(segment);

  // "Gratis (EU/EEA)", "Gratuita per studenti UE", "Free tuition"… — but only
  // when the segment carries no figure at all. Ireland's "Student contribution
  // ~€2,750/anno (EU, con Free Fees Initiative)" mentions "Free" yet still
  // charges €2,750, so a keyword match alone would wrongly report it as free.
  if (!/\d/.test(segment) && /gratis|gratuit|free/i.test(segment)) {
    return { min: 0, max: 0, currency };
  }

  const figures = [...segment.matchAll(/(\d[\d.,]*)/g)]
    .map((m) => parseFigure(m[1]))
    .filter((n) => Number.isFinite(n));
  if (figures.length === 0) return null;

  // Only an en dash between two numbers means a real range ("€900–€3,100").
  // Otherwise extra numbers are unrelated (e.g. "€178/anno + CVEC €105").
  const isRange = /\d[\d.,]*\s*–\s*[^\d]*\d/.test(segment);
  const multiplier = annualise && /semestre|semester/i.test(segment) ? 2 : 1;

  const min = figures[0] * multiplier;
  const max = (isRange ? figures[1] ?? figures[0] : figures[0]) * multiplier;

  return { min, max, currency };
}

/** Derives every cost figure for one university. */
export function getUniversityCosts(uni: CostSource): UniversityCosts {
  const tuition = parseMoney(uni.tuition, true);
  const living = parseMoney(uni.livingCost, false);

  const total =
    tuition && living && tuition.currency === living.currency
      ? {
          min: tuition.min + living.min * 12,
          max: tuition.max + living.max * 12,
          currency: tuition.currency,
        }
      : null;

  return { tuition, living, total };
}

const SYMBOL: Record<Currency, string> = { EUR: "€", GBP: "£", CHF: "CHF " };

/** "Free" · "€2,694" · "€900–€3,100" · "£9,790" · "CHF 1,460" */
export function formatMoney(money: Money | null, freeLabel = "Free"): string {
  if (!money) return "—";
  if (money.min === 0 && money.max === 0) return freeLabel;
  const symbol = SYMBOL[money.currency];
  const lo = `${symbol}${money.min.toLocaleString()}`;
  if (money.max === money.min) return lo;
  return `${lo}–${symbol}${money.max.toLocaleString()}`;
}

/**
 * Representative single value used for sorting and bracket filters. Uses the
 * upper bound of a range so an income-scaled fee like Bocconi's "€0–€17,000"
 * is not mistaken for a free university.
 */
export function comparableTuition(costs: UniversityCosts): number | null {
  return costs.tuition ? costs.tuition.max : null;
}

/** Midpoint of the monthly living range, used by the living-cost filter. */
export function comparableLiving(costs: UniversityCosts): number | null {
  return costs.living ? (costs.living.min + costs.living.max) / 2 : null;
}

type TagSource = {
  teaching: string;
  languages: string[];
  strengths: string[];
  ranking?: string | null;
};

/**
 * "Best for" tags. Lives here rather than in a page component because the Uni
 * Page and the Compare Page both render it — keeping one implementation is the
 * only way to guarantee the two never disagree.
 *
 * The cost-derived tags read from `costs`, so they now work for all
 * universities instead of only the ones that have a universityMeta entry.
 */
export function getBestFor(
  uni: TagSource,
  meta: { scholarships: boolean } | undefined,
  costs: UniversityCosts
): string[] {
  const tags: string[] = [];
  const tuition = costs.tuition;
  // Compare fee thresholds only against euro figures — a CHF or GBP number
  // measured against a euro bracket would be misleading.
  const euroTuition = tuition && tuition.currency === "EUR" ? tuition : null;

  if (uni.teaching.includes("PBL")) tags.push("Collaborative learners");
  // Uses the upper bound, so an income-scaled "€0–€17,000" fee is not treated
  // as free.
  if (euroTuition && euroTuition.max === 0) tags.push("Zero tuition");
  if (euroTuition && euroTuition.max > 0 && euroTuition.max < 1500) tags.push("Budget-conscious");
  if (uni.languages.includes("English")) tags.push("English-language programmes");
  if (uni.strengths.some((s) => s.toLowerCase().includes("research"))) tags.push("Research-focused students");
  if (uni.ranking) tags.push("Rankings-aware students");
  if (uni.strengths.some((s) => s.toLowerCase().includes("business") || s.toLowerCase().includes("economics"))) tags.push("Business & Economics");
  if (uni.strengths.some((s) => s.toLowerCase().includes("engineering") || s.toLowerCase().includes("tech"))) tags.push("Engineering & Tech");
  if (meta && meta.scholarships) tags.push("Scholarship seekers");
  return tags.slice(0, 4);
}
