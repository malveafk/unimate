// helpHousing (helphousing.com) listings scraper.
// ---------------------------------------------------------------------------
// WHY: Unimate shows partner housing. helpHousing's owner authorised us by
// e-mail to scrape their public site (listings, details, photo URLs).
//
// HOW: unlike Club House there is no second level. The site's own search
// endpoint returns every listing of a city in one response, descriptions and
// photo URLs included:
//
//   POST https://www.helphousing.com/api/search
//   { city: "hm-madrid", from: "", to: "", type: "", neighborhood: "0",
//     price_range: [0, 100000], locale: "en", isSearchList: true }
//
// So a full run is FIVE requests. They are heavy though (Madrid alone is
// ~19 MB), which is why this should not run more than once a day.
//
// We do NOT log in, do NOT download photos (URLs only) and do NOT keep the
// `manager` block of each listing: it holds the name, e-mail, phone and
// WhatsApp of a helpHousing employee. It is dropped before anything is
// written to disk, raw.json included.
//
// Run:   npx tsx scripts/helphousing/scrape.ts
// Flags: --city=milan   only that city   (writes *.sample.json, see below)
//        --limit=5      first N per city (writes *.sample.json)
//        --from-raw     no network: rebuild listings.json from the saved
//                       raw.json (to debug or change the normalisation)
//
// Partial runs (--city / --limit) never touch listings.json: a partial view of
// the site must not be able to mark the rest of the catalogue as disappeared.
// ---------------------------------------------------------------------------

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

// ── Configuration ──────────────────────────────────────────────────────────

const BASE_URL = "https://www.helphousing.com";
const SEARCH_URL = `${BASE_URL}/api/search`;

// The project has no NEXT_PUBLIC_SITE_URL / metadataBase yet, so the production
// domain is the fallback. Set NEXT_PUBLIC_SITE_URL to override.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.4uni.online").replace(/\/+$/, "");
const USER_AGENT = `UnimateBot/1.0 (+${SITE_URL})`;

const MIN_INTERVAL_MS = 1100; // max ~1 request/second, with a small margin
const MAX_RETRIES = 4;
const REQUEST_TIMEOUT_MS = 180_000; // one city can be a 19 MB response

type CityConfig = {
  slug: string; // used in the listing URLs: /accommodation-in-<slug>/…
  code: string; // value of the `city` field in the search request
  name: string; // normalised display name
  country: string;
  whatsapp: string | null; // null = no official number agreed for this city
};

// No WhatsApp numbers have been agreed with helpHousing yet. The numbers found
// inside the listings belong to individual employees and are deliberately not
// used. Fill `whatsapp` here once official per-city numbers are provided.
const CITIES: CityConfig[] = [
  { slug: "madrid", code: "hm-madrid", name: "Madrid", country: "Spain", whatsapp: null },
  { slug: "barcelona", code: "hb-barcelona", name: "Barcelona", country: "Spain", whatsapp: null },
  { slug: "valencia", code: "hv-valencia", name: "Valencia", country: "Spain", whatsapp: null },
  { slug: "milan", code: "hl-milan", name: "Milan", country: "Italy", whatsapp: null },
  { slug: "florence", code: "hf-fir", name: "Florence", country: "Italy", whatsapp: null },
];

const OUTPUT_DIR = path.join(__dirname, "output");

// ── Types ──────────────────────────────────────────────────────────────────

type ListingType = "room" | "bed" | "apartment" | "other";

export type HelphousingListing = {
  id: string; // helpHousing listing code (e.g. "001_PZZ44_2S_2") — the idempotency key
  title: string;
  city: string;
  country: string;
  address: string | null; // street and number only — never floor or door (see streetLevel)
  zone: string | null;
  latitude: number | null;
  longitude: number | null;
  price_monthly: number;
  currency: string; // given by the source (EUR)
  available_from: string; // YYYY-MM-DD
  // Always null. The only candidate in the source is `flat_contract_end`, but
  // it is helpHousing's own lease on the flat, not a tenant-facing end date:
  // for dozens of listings it falls BEFORE the room's availability date.
  available_to: string | null;
  available_now: boolean;
  type: ListingType; // room | bed (a bed in a shared room) | apartment (whole flat)
  bedrooms: number | null; // rooms in the flat
  bathrooms: number | null;
  beds_in_room: number | null;
  surface_sqm: number | null; // of the room, or of the flat for a whole apartment
  is_room: boolean; // true for a room or a bed, false for a whole apartment
  furnished: boolean; // the source lists "Furnished" among the services
  gender_only: "female" | "male" | null;
  flat_id: string | null; // listings of the same flat share it
  amenities: string[];
  description: string | null;
  photos: string[];
  contact_whatsapp: string | null;
  source: "helphousing";
  source_url: string; // original listing page
  source_label: "via helpHousing";
  status: "active" | "disappeared";
  first_seen_at: string;
  last_seen_at: string;
  disappeared_at: string | null;
  scraped_at: string;
};

type RawListing = Record<string, unknown>;

type RawFile = {
  fetched_at: string;
  cities: Record<string, RawListing[]>;
};

type OutputFile = {
  scraped_at: string;
  source: "helphousing";
  filter: string;
  listings: HelphousingListing[];
};

// ── Small helpers ──────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function str(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toUpperCase() === "NULL") return null;
  return trimmed;
}

function num(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const s = str(value);
  if (s === null) return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function isoDate(value: unknown): string | null {
  const s = str(value);
  if (!s) return null;
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(s);
  return m && !m[1].startsWith("0000") ? m[1] : null;
}

/** Today's date in Italy, YYYY-MM-DD (the audience and the operator are there). */
function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date());
}

function getFlag(name: string): string | true | undefined {
  for (const arg of process.argv.slice(2)) {
    if (arg === `--${name}`) return true;
    if (arg.startsWith(`--${name}=`)) return arg.slice(name.length + 3);
  }
  return undefined;
}

// ── Polite HTTP: 1 req/s, identified User-Agent, backoff on 429/5xx ────────

let lastRequestAt = 0;
let requestCount = 0;
let bytesReceived = 0;

async function politePost(url: string, body: unknown): Promise<string> {
  let lastError = "unknown error";
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const wait = lastRequestAt + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();
    requestCount++;

    let retryAfterMs: number | null = null;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "User-Agent": USER_AGENT, Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (res.ok) {
        const text = await res.text();
        bytesReceived += Buffer.byteLength(text);
        return text;
      }
      lastError = `HTTP ${res.status}`;
      // Only 429 and 5xx are worth retrying; a 4xx will not fix itself.
      if (res.status !== 429 && res.status < 500) break;
      const header = Number(res.headers.get("retry-after"));
      if (Number.isFinite(header) && header > 0) retryAfterMs = Math.min(header * 1000, 120_000);
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    if (attempt < MAX_RETRIES) {
      const backoff = retryAfterMs ?? 2000 * 2 ** attempt + Math.floor(Math.random() * 500);
      console.warn(`  retry ${attempt + 1}/${MAX_RETRIES} in ${Math.round(backoff / 1000)}s (${lastError})`);
      await sleep(backoff);
    }
  }
  throw new Error(`${lastError} for ${url}`);
}

// ── Text clean-up ──────────────────────────────────────────────────────────

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ", amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", euro: "€", deg: "°", hellip: "…",
  ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", laquo: "«", raquo: "»",
  agrave: "à", aacute: "á", egrave: "è", eacute: "é", igrave: "ì", iacute: "í", ograve: "ò",
  oacute: "ó", ugrave: "ù", uacute: "ú", ntilde: "ñ", ccedil: "ç", uuml: "ü", ouml: "ö", auml: "ä",
  Agrave: "À", Egrave: "È", Eacute: "É", Ntilde: "Ñ", iexcl: "¡", iquest: "¿", sup2: "²", middot: "·",
};

/** The source stores rich text as HTML. Turn it into plain paragraphs. */
function htmlToText(value: unknown): string | null {
  const html = str(value);
  if (!html) return null;
  const text = html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*\/\s*(p|div|li|h[1-6]|ul|ol)\s*>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "- ")
    .replace(/<[^>]*>/g, "")
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-zA-Z][a-zA-Z0-9]+);/g, (whole, name: string) => NAMED_ENTITIES[name] ?? whole)
    .replace(/\r/g, "")
    .replace(/[ \t ]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text || null;
}

let redactedContacts = 0;
let redactedTenantNames = 0;

/**
 * Strip personal data from the free text:
 * - room descriptions often end with a quote signed by a former tenant
 *   ("—Anna, stayed in the room for 3 years"): the first name goes;
 * - e-mail addresses and phone numbers, should anyone have typed them in.
 */
function scrubPersonalData(text: string | null): string | null {
  if (!text) return null;
  // Signature lines open with an em/en dash and carry a "stayed"/"lived" verb:
  // "— Maya & Amira, stayed in the room for 4 years", "—Luca lived here for 2 years".
  // Everything between the dash and the verb is the name(s). Hyphen bullets
  // ("- Wifi in the whole flat") are a different character and never match.
  let out = text.replace(
    /(^|\n)[ \t]*[—–][ \t]*[^\n]{1,60}?,?[ \t]*(?=(?:stayed|lived|has lived|have lived|ha vissuto|hanno vissuto|vivió|vivieron)\b)/giu,
    (_, lineStart: string) => {
      redactedTenantNames++;
      return `${lineStart}— A former tenant, `;
    },
  );
  out = out.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, () => {
    redactedContacts++;
    return "";
  });
  out = out.replace(/(?:\+|00)?\d[\d\s().-]{7,}\d/g, (match) => {
    // 9+ digits = a phone number; shorter runs are prices, sizes, postcodes
    if (match.replace(/\D/g, "").length < 9) return match;
    redactedContacts++;
    return "";
  });
  return out.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim() || null;
}

// ── Normalisation ──────────────────────────────────────────────────────────

const URL_SEGMENT: Record<string, string> = { room: "rooms", bed: "shared-rooms", flat: "apartment" };

function listingType(raw: unknown): ListingType {
  const t = (str(raw) ?? "").toLowerCase();
  if (t === "room") return "room";
  if (t === "bed") return "bed";
  if (t === "flat") return "apartment";
  return "other";
}

function photoList(...lists: unknown[]): string[] {
  const urls: string[] = [];
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      const value = str(item);
      if (!value || !/^https?:\/\//i.test(value)) continue;
      // File names on the source contain spaces and accents ("Habitación 2-2.jpg"):
      // store the properly encoded form.
      let url: string;
      try {
        url = new URL(value).href;
      } catch {
        continue;
      }
      if (!urls.includes(url)) urls.push(url);
    }
  }
  return urls;
}

/** Services are a mix of labels ("Wifi") and internal tokens ("1_people"). Keep the labels. */
function amenityList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    const label = str(item);
    if (!label || /[_\d]/.test(label) || label === "Furnished") continue;
    if (!out.includes(label)) out.push(label);
  }
  return out;
}

/**
 * The source's address goes down to the door ("Carrer Moragas 5, 4º 2ª, 08022
 * Barcelona"), but the public listing page never prints floor and door: they
 * only travel in the page's data. We publish what a visitor can read there —
 * street and number, i.e. everything before the first comma. The full string
 * stays in raw.json (gitignored) and nowhere else.
 */
function streetLevel(value: unknown): string | null {
  const full = str(value);
  if (!full) return null;
  const street = full.split(",")[0].replace(/\s+/g, " ").trim();
  // A few addresses have no comma before the door ("Borgo Ognissanti 21 1D"):
  // drop a door token that follows the street number.
  return street.replace(/(\d[A-Za-z]?) \d{1,2}[A-Za-z]$/, "$1") || null;
}

function englishText(descriptions: unknown, key: string): string | null {
  const en = (descriptions as Record<string, Record<string, unknown>> | null | undefined)?.en_US;
  return htmlToText(en?.[key]);
}

function normalise(raw: RawListing, city: CityConfig, now: string): HelphousingListing | null {
  const code = str(raw.code);
  const rawType = (str(raw.type) ?? "").toLowerCase();
  const segment = URL_SEGMENT[rawType];
  const price = num(raw.price_rental);
  const availableFrom = isoDate(raw.available_date);
  if (!code || !segment || price === null || price <= 0 || !availableFrom) return null;

  const type = listingType(raw.type);
  const zone = str(raw.flat_area);
  // A dozen listings have no title on the site: describe them neutrally
  // rather than dropping an otherwise complete listing.
  const kind = type === "apartment" ? "Apartment" : type === "bed" ? "Bed in a shared room" : "Room";
  const title = htmlToText(raw.name) ?? `${kind} in ${zone ? `${zone}, ` : ""}${city.name}`;
  const lat = num(raw.flat_lat);
  const lon = num(raw.flat_lon);
  const hasCoords = lat !== null && lon !== null && (lat !== 0 || lon !== 0);
  const services = Array.isArray(raw.all_services) ? raw.all_services : [];
  const gender = str(raw.accept_gender_only);

  // The room's own text first, then the flat's.
  const description = scrubPersonalData(
    [englishText(raw.room_descriptions, "room_description"), englishText(raw.flat_descriptions, "flat_description")]
      .filter(Boolean)
      .join("\n\n") || null,
  );

  return {
    id: code,
    title,
    city: city.name,
    country: city.country,
    address: streetLevel(raw.flat_address),
    zone,
    latitude: hasCoords ? lat : null,
    longitude: hasCoords ? lon : null,
    price_monthly: price,
    currency: str(raw.currency) ?? "EUR",
    available_from: availableFrom,
    available_to: null,
    available_now: raw.available_now === true,
    type,
    bedrooms: num(raw.rooms_in_flat),
    bathrooms: num(raw.flat_bathrooms),
    beds_in_room: num(raw.beds_in_room),
    surface_sqm: type === "apartment" ? num(raw.flat_size) : num(raw.room_size),
    is_room: type !== "apartment",
    furnished: services.includes("Furnished"),
    gender_only: gender === "female" || gender === "male" ? gender : null,
    flat_id: str(raw.flat_code),
    amenities: amenityList(raw.all_services),
    description,
    // the listing's own photos first (room or bed), then the shared flat's
    photos: photoList(raw.room_images, raw.flat_images, [raw.preview_image]),
    contact_whatsapp: city.whatsapp,
    source: "helphousing",
    source_url: `${BASE_URL}/accommodation-in-${city.slug}/${segment}/${encodeURIComponent(code)}`,
    source_label: "via helpHousing",
    status: "active",
    first_seen_at: now,
    last_seen_at: now,
    disappeared_at: null,
    scraped_at: now,
  };
}

// ── Diff / idempotency ─────────────────────────────────────────────────────

const BOOKKEEPING_FIELDS = ["status", "first_seen_at", "last_seen_at", "disappeared_at", "scraped_at"] as const;

function changedFields(before: HelphousingListing, after: HelphousingListing): string[] {
  return (Object.keys(after) as (keyof HelphousingListing)[]).filter(
    (k) =>
      !(BOOKKEEPING_FIELDS as readonly string[]).includes(k) &&
      JSON.stringify(before[k]) !== JSON.stringify(after[k]),
  );
}

function loadPrevious(file: string): Map<string, HelphousingListing> {
  const map = new Map<string, HelphousingListing>();
  if (!existsSync(file)) return map;
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8")) as OutputFile;
    for (const listing of parsed.listings ?? []) map.set(listing.id, listing);
  } catch (err) {
    throw new Error(`Cannot read previous ${file}: ${err instanceof Error ? err.message : err}. Fix or delete it before re-running.`);
  }
  return map;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const cityFlag = getFlag("city");
  const limitFlag = getFlag("limit");
  const fromRaw = getFlag("from-raw") === true;
  const limit = typeof limitFlag === "string" ? Math.max(1, parseInt(limitFlag, 10) || 0) : null;
  const partial = Boolean(cityFlag || limit);

  const cities = typeof cityFlag === "string" ? CITIES.filter((c) => c.slug === cityFlag.toLowerCase()) : CITIES;
  if (!cities.length) throw new Error(`Unknown city "${cityFlag}". Known: ${CITIES.map((c) => c.slug).join(", ")}`);

  const rawMainFile = path.join(OUTPUT_DIR, "raw.json");
  const previousRaw: RawFile | null = existsSync(rawMainFile)
    ? (JSON.parse(readFileSync(rawMainFile, "utf8")) as RawFile)
    : null;
  if (fromRaw && !previousRaw) throw new Error("--from-raw needs an existing output/raw.json: run a normal scrape first.");

  // With --from-raw the data is as old as the raw file, not as old as this run.
  const now = fromRaw && previousRaw ? previousRaw.fetched_at : new Date().toISOString();
  const today = todayIso();
  const listingsFile = path.join(OUTPUT_DIR, partial ? "listings.sample.json" : "listings.json");
  const rawFile = path.join(OUTPUT_DIR, partial ? "raw.sample.json" : "raw.json");
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Always diff against the real file, even in a partial run (read-only there).
  const previous = loadPrevious(path.join(OUTPUT_DIR, "listings.json"));
  const previousPerCity: Record<string, number> = {};
  for (const l of previous.values()) {
    if (l.status === "active") previousPerCity[l.city] = (previousPerCity[l.city] ?? 0) + 1;
  }

  console.log(`helpHousing scrape — ${now}`);
  console.log(`User-Agent: ${USER_AGENT}`);
  console.log(`Filter: keep listings that are not expired on ${today} (available_to empty or >= today)`);
  if (partial) console.log("PARTIAL RUN: writing *.sample.json, listings.json is left untouched");
  if (fromRaw) console.log(`FROM RAW: no requests, re-normalising raw.json fetched at ${now}`);

  // 1. One request per city. A failed or suspiciously empty city aborts the
  //    whole run: writing a partial catalogue would wrongly mark that city's
  //    listings as disappeared.
  const raw: RawFile = { fetched_at: now, cities: {} };
  const current = new Map<string, HelphousingListing>();
  const perCity: Record<string, { total: number; kept: number; expired: number; skipped: number }> = {};
  const warnings: string[] = [];

  for (const city of cities) {
    let results: RawListing[];
    if (fromRaw) {
      results = previousRaw?.cities[city.slug] ?? [];
    } else {
      const body = await politePost(SEARCH_URL, {
        from: "",
        to: "",
        city: city.code,
        type: "", // every type: rooms, beds in shared rooms, whole apartments
        neighborhood: "0",
        price_range: [0, 100000],
        locale: "en",
        isSearchList: true,
      });
      const parsed = JSON.parse(body) as { results?: unknown };
      if (!Array.isArray(parsed.results)) throw new Error(`Unexpected response shape for ${city.slug}: no "results" array`);
      // Drop the employee contact block before the data goes anywhere.
      results = (parsed.results as RawListing[]).map((item) => {
        const copy = { ...item };
        delete copy.manager;
        return copy;
      });
    }
    raw.cities[city.slug] = results;

    const stats = { total: results.length, kept: 0, expired: 0, skipped: 0 };
    perCity[city.name] = stats;
    if (!partial && stats.total === 0 && (previousPerCity[city.name] ?? 0) > 0) {
      throw new Error(`${city.name} came back empty while the previous run had ${previousPerCity[city.name]} listings there. Nothing written — check the site/API by hand.`);
    }

    for (const item of results) {
      if (limit && stats.kept >= limit) break;
      const listing = normalise(item, city, now);
      if (!listing) {
        stats.skipped++;
        warnings.push(`${city.name}: listing ${String(item.code)} skipped (missing code, type, price or date).`);
        continue;
      }
      if (listing.available_to && listing.available_to < today) {
        stats.expired++;
        continue;
      }
      if (current.has(listing.id)) {
        warnings.push(`${city.name}: duplicate code ${listing.id}, kept the first one.`);
        continue;
      }
      const before = previous.get(listing.id);
      if (before) listing.first_seen_at = before.first_seen_at;
      current.set(listing.id, listing);
      stats.kept++;
    }
    console.log(`${city.name}: ${stats.total} on the site, ${stats.kept} kept, ${stats.expired} expired, ${stats.skipped} skipped`);
  }

  if (!partial && current.size === 0 && previous.size > 0) {
    throw new Error("Every city came back empty while the previous run had listings. Nothing written — check the site/API by hand.");
  }

  // 2. Merge with the previous run: update, never duplicate, never delete.
  const added: HelphousingListing[] = [];
  const updated: { listing: HelphousingListing; fields: string[] }[] = [];
  const disappeared: HelphousingListing[] = [];
  let unchanged = 0;

  for (const listing of current.values()) {
    const before = previous.get(listing.id);
    if (!before) added.push(listing);
    else {
      const fields = changedFields(before, listing);
      if (before.status === "disappeared") fields.unshift("reappeared");
      if (fields.length) updated.push({ listing, fields });
      else unchanged++;
    }
  }

  const merged = [...current.values()];
  if (!partial) {
    for (const before of previous.values()) {
      if (current.has(before.id)) continue;
      if (before.status !== "disappeared") disappeared.push(before);
      merged.push({ ...before, status: "disappeared", disappeared_at: before.disappeared_at ?? now });
    }
  }
  merged.sort((a, b) => a.city.localeCompare(b.city) || a.id.localeCompare(b.id));

  const output: OutputFile = {
    scraped_at: now,
    source: "helphousing",
    filter: `available_to is empty or >= ${today}`,
    listings: merged,
  };
  writeFileSync(listingsFile, JSON.stringify(output, null, 2) + "\n");
  if (!fromRaw) writeFileSync(rawFile, JSON.stringify(raw) + "\n");

  // 3. Report.
  console.log("\n── Result ─────────────────────────────────────────");
  for (const [name, s] of Object.entries(perCity)) {
    console.log(`${name.padEnd(10)} site ${String(s.total).padStart(4)} | kept ${String(s.kept).padStart(4)} | expired ${s.expired} | skipped ${s.skipped}`);
  }
  console.log(`\nDiff vs previous run (${previous.size} known listings):`);
  console.log(`  new         ${added.length}`);
  console.log(`  updated     ${updated.length}`);
  console.log(`  unchanged   ${unchanged}`);
  console.log(`  disappeared ${partial ? "n/a (partial run)" : disappeared.length}`);
  if (updated.length) {
    const byField: Record<string, number> = {};
    for (const u of updated) for (const f of u.fields) byField[f] = (byField[f] ?? 0) + 1;
    console.log(`  changed fields: ${Object.entries(byField).map(([f, n]) => `${f} ×${n}`).join(", ")}`);
  }
  for (const d of disappeared.slice(0, 20)) console.log(`  - disappeared: ${d.id} ${d.title}`);
  if (disappeared.length > 20) console.log(`  … and ${disappeared.length - 20} more`);

  const active = merged.filter((l) => l.status === "active");
  console.log(`\nActive listings written: ${active.length} (+ ${merged.length - active.length} kept as disappeared)`);
  console.log(`Without description: ${active.filter((l) => !l.description).length} | without photos: ${active.filter((l) => !l.photos.length).length} | without coordinates: ${active.filter((l) => l.latitude === null).length}`);
  console.log(`Requests made: ${requestCount} (${(bytesReceived / 1e6).toFixed(1)} MB received)`);
  console.log(`Personal data stripped from descriptions: ${redactedTenantNames} tenant signatures, ${redactedContacts} e-mails/phones`);
  const noWhatsapp = [...new Set(active.filter((l) => !l.contact_whatsapp).map((l) => l.city))];
  if (noWhatsapp.length) warnings.unshift(`No agreed WhatsApp number for: ${noWhatsapp.join(", ")} — contact_whatsapp left empty.`);
  if (warnings.length) {
    console.log("\nWarnings:");
    for (const w of warnings.slice(0, 20)) console.log(`  - ${w}`);
    if (warnings.length > 20) console.log(`  … and ${warnings.length - 20} more`);
  }
  console.log(`\nWrote ${path.relative(process.cwd(), listingsFile)}${fromRaw ? "" : ` and ${path.relative(process.cwd(), rawFile)}`}`);
}

// Only run when executed directly, so the types can be imported elsewhere.
if (require.main === module) {
  main().catch((err) => {
    console.error(`\nScrape failed: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  });
}
