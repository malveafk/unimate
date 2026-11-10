// Club House (clubhouse-student.eu) listings scraper.
// ---------------------------------------------------------------------------
// WHY: Unimate shows partner housing. Club House's founder authorised us in
// writing to scrape their public site (listings, details, photo URLs).
//
// HOW (two-level catalogue, like a price list + product sheets):
//   1. LIST   GET /api/apartments?city=<city>  -> GeoJSON, every listing of the
//             city in one response (no pagination). Public, no login needed.
//   2. DETAIL GET /apartment/<slug>            -> HTML page; description and the
//             full photo set live in the embedded React Server Components
//             payload ("flight" data), which we parse.
//
// We deliberately do NOT log in, do NOT query Club House's database directly
// and do NOT download photos (we only store their URLs).
//
// Run:   npx tsx scripts/clubhouse/scrape.ts
// Flags: --city=madrid     only that city   (writes *.sample.json, see below)
//        --limit=5         first N per city (writes *.sample.json)
//        --reuse-details   skip the detail request when the list data of a
//                          listing did not change since the previous run
//        --from-raw        no network at all: rebuild listings.json from the
//                          saved raw.json (to debug or change the normalisation)
//
// Partial runs (--city / --limit) never touch listings.json: a partial view of
// the site must not be able to mark the rest of the catalogue as disappeared.
// ---------------------------------------------------------------------------

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

// ── Configuration ──────────────────────────────────────────────────────────

const BASE_URL = "https://www.clubhouse-student.eu";
const PHOTO_BUCKET =
  "https://bzqgaygdxwopkmuqsuli.supabase.co/storage/v1/object/public/apartments";

// The project has no NEXT_PUBLIC_SITE_URL / metadataBase yet, so the production
// domain is the fallback. Set NEXT_PUBLIC_SITE_URL to override.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.4uni.online").replace(/\/+$/, "");
const USER_AGENT = `UnimateBot/1.0 (+${SITE_URL})`;

const MIN_INTERVAL_MS = 1100; // max ~1 request/second, with a small margin
const MAX_RETRIES = 4;
const REQUEST_TIMEOUT_MS = 30_000;

type CityConfig = {
  slug: string; // value of the `city` query parameter
  name: string; // normalised display name
  country: string;
  whatsapp: string | null; // null = no number agreed for this city
};

// WhatsApp numbers are the three agreed with Club House. A city without a
// number is reported, never guessed.
const CITIES: CityConfig[] = [
  { slug: "madrid", name: "Madrid", country: "Spain", whatsapp: "+34654870491" },
  { slug: "berlin", name: "Berlin", country: "Germany", whatsapp: "+491706265239" },
  { slug: "paris", name: "Paris", country: "France", whatsapp: "+34695768319" },
  { slug: "london", name: "London", country: "United Kingdom", whatsapp: null },
];

const OUTPUT_DIR = path.join(__dirname, "output");

// ── Types ──────────────────────────────────────────────────────────────────

type ListingType = "room" | "studio" | "apartment" | "penthouse" | "other";

export type ClubhouseListing = {
  id: string; // Club House id — the idempotency key
  title: string; // neutral, generated (the original title carries the owner's first name)
  city: string;
  country: string;
  address: string | null;
  zone: string | null;
  latitude: number | null;
  longitude: number | null;
  price_monthly: number;
  currency: "EUR"; // not in the source data: the site only ever shows "€"
  available_from: string; // YYYY-MM-DD
  available_to: string | null;
  type: ListingType;
  bedrooms: number | null;
  bathrooms: number | null;
  surface_sqm: number | null;
  is_room: boolean;
  has_rooms: boolean; // a flat that is also rented room by room
  // What `price_monthly` buys. For a flat with rooms the site is not consistent:
  // sometimes it shows the cheapest room, sometimes the whole flat. We compare
  // with the rooms' own prices: "per_room" when it equals the cheapest room.
  price_basis: "whole" | "per_room" | "unknown";
  room_price_from: number | null; // cheapest room of the flat, when it has rooms
  parent_id: string | null; // for a room: id of the flat it belongs to
  amenities: string[];
  description: string | null;
  photos: string[];
  contact_whatsapp: string | null;
  source: "clubhouse";
  source_url: string; // original listing page
  source_label: "via Club House";
  status: "active" | "disappeared";
  first_seen_at: string;
  last_seen_at: string;
  disappeared_at: string | null;
  scraped_at: string;
};

type RawFeature = {
  geometry?: { coordinates?: unknown } | null;
  properties?: Record<string, unknown> | null;
};

type RawDetail = Record<string, unknown>;

type RawFile = {
  fetched_at: string;
  cities: Record<string, unknown>;
  details: Record<string, unknown>;
};

type OutputFile = {
  scraped_at: string;
  source: "clubhouse";
  filter: string;
  listings: ClubhouseListing[];
};

// ── Small helpers ──────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Club House stores missing values as the literal string "NULL". */
function str(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toUpperCase() === "NULL" || trimmed === "$undefined") return null;
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
  return m ? m[1] : null;
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

async function politeFetch(url: string, accept: string): Promise<string> {
  let lastError = "unknown error";
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const wait = lastRequestAt + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();
    requestCount++;

    let retryAfterMs: number | null = null;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: accept },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (res.ok) return await res.text();
      lastError = `HTTP ${res.status}`;
      // Only 429 and 5xx are worth retrying; a 404 will not fix itself.
      if (res.status !== 429 && res.status < 500) break;
      const header = Number(res.headers.get("retry-after"));
      if (Number.isFinite(header) && header > 0) retryAfterMs = Math.min(header * 1000, 120_000);
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    if (attempt < MAX_RETRIES) {
      const backoff = retryAfterMs ?? 2000 * 2 ** attempt + Math.floor(Math.random() * 500);
      console.warn(`  retry ${attempt + 1}/${MAX_RETRIES} in ${Math.round(backoff / 1000)}s (${lastError}) ${url}`);
      await sleep(backoff);
    }
  }
  throw new Error(`${lastError} for ${url}`);
}

// ── Detail page: read the listing object out of the RSC payload ────────────
//
// Next.js App Router inlines the server-rendered data as a stream of
// `self.__next_f.push([1,"<chunk>"])` script tags. Concatenated, the chunks
// form rows of the shape `<hexId>:<json>\n`, plus text rows
// `<hexId>:T<hexByteLength>,<text>` used for long strings (the description),
// which other rows reference as "$<hexId>".

function extractFlight(html: string): Buffer {
  const parts: string[] = [];
  const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      parts.push(JSON.parse(m[1]) as string);
    } catch {
      // a malformed chunk only costs us that chunk
    }
  }
  return Buffer.from(parts.join(""), "utf8");
}

function parseFlightRows(buf: Buffer): Map<string, string> {
  const rows = new Map<string, string>();
  let i = 0;
  while (i < buf.length) {
    const colon = buf.indexOf(0x3a, i);
    if (colon < 0) break;
    const id = buf.subarray(i, colon).toString("utf8");
    if (!/^[0-9a-f]+$/i.test(id)) {
      // not a row header: resync at the next line
      const nl = buf.indexOf(0x0a, i);
      if (nl < 0) break;
      i = nl + 1;
      continue;
    }
    if (buf[colon + 1] === 0x54 /* "T" = text row, length in bytes */) {
      const comma = buf.indexOf(0x2c, colon + 2);
      const length = parseInt(buf.subarray(colon + 2, comma).toString("utf8"), 16);
      if (comma < 0 || !Number.isFinite(length)) break;
      rows.set(id, buf.subarray(comma + 1, comma + 1 + length).toString("utf8"));
      i = comma + 1 + length;
    } else {
      let nl = buf.indexOf(0x0a, colon + 1);
      if (nl < 0) nl = buf.length;
      rows.set(id, buf.subarray(colon + 1, nl).toString("utf8"));
      i = nl + 1;
    }
  }
  return rows;
}

function findApartment(node: unknown, depth = 0): RawDetail | null {
  if (!node || typeof node !== "object" || depth > 12) return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const hit = findApartment(item, depth + 1);
      if (hit) return hit;
    }
    return null;
  }
  const obj = node as Record<string, unknown>;
  const candidate = obj.apartment;
  if (candidate && typeof candidate === "object" && "slug" in (candidate as object)) {
    return candidate as RawDetail;
  }
  for (const value of Object.values(obj)) {
    const hit = findApartment(value, depth + 1);
    if (hit) return hit;
  }
  return null;
}

/** Replace "$<id>" references to text rows with their content. */
function resolveRefs(value: unknown, rows: Map<string, string>, depth = 0): unknown {
  if (typeof value === "string") {
    if (value === "$undefined") return null;
    if (value.startsWith("$$")) return value.slice(1); // escaped literal "$"
    const m = /^\$([0-9a-f]+)$/i.exec(value);
    if (m && rows.has(m[1])) return rows.get(m[1]);
    return value;
  }
  if (!value || typeof value !== "object" || depth > 12) return value;
  if (Array.isArray(value)) return value.map((item) => resolveRefs(item, rows, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = resolveRefs(v, rows, depth + 1);
  }
  return out;
}

function parseDetail(html: string): RawDetail | null {
  const rows = parseFlightRows(extractFlight(html));
  for (const raw of rows.values()) {
    if (!raw.includes('"apartment":{')) continue;
    const start = raw.search(/[[{]/);
    if (start < 0) continue;
    try {
      const apartment = findApartment(JSON.parse(raw.slice(start)));
      if (apartment) return resolveRefs(apartment, rows) as RawDetail;
    } catch {
      // try the next row
    }
  }
  return null;
}

// ── Normalisation ──────────────────────────────────────────────────────────

/** Same rule the site uses to turn a stored path into a public URL. */
function photoUrl(value: unknown): string | null {
  const p = str(value);
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  const clean = p.replace(/^\/+/, "");
  const atBucketRoot =
    /^\d+_[A-Za-z0-9]+\.(?:jpg|jpeg|png|gif|webp)$/i.test(clean) ||
    clean.startsWith("thumbnails/") ||
    clean.startsWith("photos/") ||
    clean.includes("-");
  return atBucketRoot ? `${PHOTO_BUCKET}/${clean}` : `${PHOTO_BUCKET}/photos/${clean}`;
}

function collectPhotos(thumbnail: unknown, ...photoLists: unknown[]): string[] {
  const urls: string[] = [];
  const push = (value: unknown) => {
    const url = photoUrl(value);
    if (url && !urls.includes(url)) urls.push(url);
  };
  push(thumbnail);
  for (const list of photoLists) {
    if (!Array.isArray(list)) continue;
    const sorted = [...list].sort((a, b) => {
      const oa = num((a as Record<string, unknown>)?.order) ?? 1e9;
      const ob = num((b as Record<string, unknown>)?.order) ?? 1e9;
      return oa - ob;
    });
    for (const photo of sorted) {
      if (typeof photo === "string") push(photo);
      else if (photo && typeof photo === "object") {
        const o = photo as Record<string, unknown>;
        push(o.url ?? o.path);
      }
    }
  }
  return urls;
}

function listingType(rawType: unknown, isRoom: boolean): ListingType {
  const t = (str(rawType) ?? "").toLowerCase();
  if (isRoom || t === "room") return "room";
  if (t === "studio") return "studio";
  if (t === "apartment") return "apartment";
  if (t === "penthouse") return "penthouse";
  return "other";
}

/**
 * The original titles are "<owner first name>'s Apartment". Owner names are
 * personal data we must not store, so the title is rebuilt from neutral facts.
 * A room keeps its "#N" so rooms of the same flat stay distinguishable.
 */
function neutralTitle(
  type: ListingType,
  originalTitle: string | null,
  bedrooms: number | null,
  zone: string | null,
  city: string,
): string {
  const where = zone ? `${zone}, ${city}` : city;
  if (type === "room") {
    const n = /#\s*(\d+)/.exec(originalTitle ?? "");
    return `Room${n ? ` #${n[1]}` : ""} in ${where}`;
  }
  if (type === "studio") return `Studio in ${where}`;
  const label = type === "penthouse" ? "Penthouse" : "Apartment";
  return bedrooms && bedrooms > 1 ? `${bedrooms}-bedroom ${label.toLowerCase()} in ${where}` : `${label} in ${where}`;
}

let redactedContacts = 0;
let redactedOwnerNames = 0;

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Strip personal data from the free text: the owner's first name (known from
 * the original "<name>'s Apartment" title), e-mail addresses, phone numbers.
 */
function cleanDescription(value: unknown, originalTitle: string | null): string | null {
  const s = str(value);
  if (!s) return null;
  let text = s.replace(/\r\n?/g, "\n");
  const owner = /^(.+?)['\u2019]s\b/.exec(originalTitle ?? "")?.[1]?.trim();
  if (owner && owner.length > 2) {
    const name = escapeRegExp(owner);
    // "Anna's Room #1" -> "the Room #1"; a bare "Anna" -> "the owner"
    const before = text;
    text = text
      .replace(new RegExp(`(?<![\\p{L}])${name}['\u2019]s(?![\\p{L}])`, "giu"), "the")
      .replace(new RegExp(`(?<![\\p{L}])${name}(?![\\p{L}])`, "giu"), "the owner");
    if (text !== before) redactedOwnerNames++;
  }
  text = text.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, () => {
    redactedContacts++;
    return "";
  });
  text = text.replace(/(?:\+|00)?\d[\d\s().-]{7,}\d/g, (match) => {
    // 9+ digits = a phone number; shorter runs are prices, sizes, postcodes
    if (match.replace(/\D/g, "").length < 9) return match;
    redactedContacts++;
    return "";
  });
  return text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim() || null;
}

/**
 * Addresses end with the country spelled four different ways ("Allemagne",
 * "GERMANY", …). The country has its own normalised field, so drop the tail.
 */
function cleanAddress(address: string | null, rawCountry: string | null): string | null {
  if (!address) return null;
  let out = address;
  if (rawCountry && out.toLowerCase().endsWith(rawCountry.toLowerCase())) {
    out = out.slice(0, out.length - rawCountry.length);
  }
  return out.replace(/\s+,/g, ",").replace(/[\s,]+$/, "").trim() || null;
}

function amenityLabels(...lists: unknown[]): string[] {
  const labels: string[] = [];
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      const label = typeof item === "string" ? str(item) : str((item as Record<string, unknown>)?.label);
      if (label && !labels.includes(label)) labels.push(label);
    }
  }
  return labels;
}

function normalise(
  feature: RawFeature,
  detail: RawDetail | null,
  city: CityConfig,
  now: string,
): ClubhouseListing | null {
  const p = feature.properties ?? {};
  const id = p.id === undefined || p.id === null ? null : String(p.id);
  const slug = str(p.slug);
  const price = num(p.price) ?? num(detail?.price_numeric);
  const availableFrom = isoDate(p.available_from) ?? isoDate(detail?.available_from);
  if (!id || !slug || price === null || !availableFrom) return null;

  const isRoom = p.is_room === true;
  const type = listingType(p.type, isRoom);
  const bedrooms = num(p.bedrooms) ?? num(detail?.bedrooms);
  const zone = str(p.district_label) ?? str(detail?.district_label);
  const hasRooms = p.has_rooms === true;
  const roomPrices = (Array.isArray(detail?.child_rooms) ? (detail?.child_rooms as Record<string, unknown>[]) : [])
    .map((room) => num(room?.price_numeric) ?? num(room?.price))
    .filter((n): n is number => n !== null && n > 0);
  const roomPriceFrom = roomPrices.length ? Math.min(...roomPrices) : null;
  const priceBasis = !hasRooms ? "whole" : roomPriceFrom === null ? "unknown" : price <= roomPriceFrom ? "per_room" : "whole";
  const coords = Array.isArray(feature.geometry?.coordinates) ? (feature.geometry?.coordinates as unknown[]) : [];

  return {
    id,
    title: neutralTitle(type, str(p.title), bedrooms, zone, city.name),
    city: city.name,
    country: city.country,
    address: cleanAddress(str(p.address) ?? str(detail?.address), str(p.country)),
    zone,
    latitude: num(coords[1]),
    longitude: num(coords[0]),
    price_monthly: price,
    currency: "EUR",
    available_from: availableFrom,
    available_to: isoDate(p.available_to) ?? isoDate(detail?.available_to),
    type,
    bedrooms,
    bathrooms: num(p.bathrooms) ?? num(detail?.bathrooms),
    surface_sqm: num(p.surface) ?? num(detail?.surface),
    is_room: isRoom,
    has_rooms: hasRooms,
    price_basis: priceBasis,
    room_price_from: roomPriceFrom,
    parent_id: str(p.parent_apartment_id) ?? (typeof p.parent_apartment_id === "number" ? String(p.parent_apartment_id) : null),
    amenities: amenityLabels(p.amenities, detail?.amenities, detail?.facilities),
    description: cleanDescription(detail?.description, str(p.title)),
    photos: collectPhotos(p.image_url ?? detail?.thumbnail, detail?.photos, p.photos),
    contact_whatsapp: city.whatsapp,
    source: "clubhouse",
    source_url: `${BASE_URL}/apartment/${slug}`,
    source_label: "via Club House",
    status: "active",
    first_seen_at: now,
    last_seen_at: now,
    disappeared_at: null,
    scraped_at: now,
  };
}

// ── Diff / idempotency ─────────────────────────────────────────────────────

const BOOKKEEPING_FIELDS = ["status", "first_seen_at", "last_seen_at", "disappeared_at", "scraped_at"] as const;
function changedFields(before: ClubhouseListing, after: ClubhouseListing): string[] {
  return (Object.keys(after) as (keyof ClubhouseListing)[]).filter(
    (k) =>
      !(BOOKKEEPING_FIELDS as readonly string[]).includes(k) &&
      JSON.stringify(before[k]) !== JSON.stringify(after[k]),
  );
}

function loadPrevious(file: string): Map<string, ClubhouseListing> {
  const map = new Map<string, ClubhouseListing>();
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
  const reuseDetails = getFlag("reuse-details") === true;
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

  console.log(`Club House scrape — ${now}`);
  console.log(`User-Agent: ${USER_AGENT}`);
  console.log(`Filter: keep listings that are not expired on ${today} (available_to empty or >= today)`);
  if (partial) console.log("PARTIAL RUN: writing *.sample.json, listings.json is left untouched");
  if (fromRaw) console.log(`FROM RAW: no requests, re-normalising raw.json fetched at ${now}`);

  // 1. Lists. A failed city aborts the whole run: writing a partial catalogue
  //    would wrongly mark that city's listings as disappeared.
  const raw: RawFile = {
    fetched_at: now,
    cities: {},
    details: {},
  };
  const kept: { feature: RawFeature; city: CityConfig }[] = [];
  const perCity: Record<string, { total: number; kept: number; expired: number }> = {};
  const warnings: string[] = [];

  for (const city of cities) {
    const parsed = (
      fromRaw
        ? previousRaw?.cities[city.slug]
        : JSON.parse(await politeFetch(`${BASE_URL}/api/apartments?city=${city.slug}`, "application/json"))
    ) as { features?: RawFeature[] } | undefined;
    if (!parsed || !Array.isArray(parsed.features)) throw new Error(`Unexpected response shape for ${city.slug}: no "features" array`);
    raw.cities[city.slug] = parsed;

    const stats = { total: parsed.features.length, kept: 0, expired: 0 };
    perCity[city.name] = stats;
    if (stats.total === 0) {
      console.log(`${city.name}: 0 listings on the site — skipped`);
      continue;
    }
    if (!city.whatsapp) {
      warnings.push(`${city.name} has ${stats.total} listings but no agreed WhatsApp number: contact_whatsapp left empty.`);
    }
    for (const feature of parsed.features) {
      const to = isoDate(feature.properties?.available_to);
      if (to && to < today) {
        stats.expired++;
        continue;
      }
      if (limit && stats.kept >= limit) continue;
      stats.kept++;
      kept.push({ feature, city });
    }
    console.log(`${city.name}: ${stats.total} on the site, ${stats.kept} kept, ${stats.expired} expired`);
  }

  // Safety net: the site answering "empty" for everything is far more likely a
  // breakage than a real wipe-out. Refuse to overwrite a populated catalogue.
  if (!partial && kept.length === 0 && previous.size > 0) {
    throw new Error("Every city came back empty while the previous run had listings. Nothing written — check the site/API by hand.");
  }

  // 2. Details (description + full photo set), one request per listing.
  const previousFeatures = new Map<string, RawFeature>();
  for (const cityRaw of Object.values(previousRaw?.cities ?? {})) {
    for (const f of (cityRaw as { features?: RawFeature[] })?.features ?? []) {
      previousFeatures.set(String(f.properties?.id), f);
    }
  }
  const current = new Map<string, ClubhouseListing>();
  const detailFailures: string[] = [];
  let reused = 0;
  let skipped = 0;
  let done = 0;

  for (const { feature, city } of kept) {
    done++;
    const slug = str(feature.properties?.slug);
    const listOnly = normalise(feature, null, city, now);
    if (!listOnly || !slug) {
      skipped++;
      warnings.push(`Listing ${String(feature.properties?.id)} (${city.name}) skipped: missing id, slug, price or available_from.`);
      continue;
    }
    const before = previous.get(listOnly.id);

    let detail: RawDetail | null = null;
    let listing: ClubhouseListing;
    // "Unchanged" = the site returns the very same list entry as last time.
    const sameAsLastRun = JSON.stringify(previousFeatures.get(listOnly.id)) === JSON.stringify(feature);
    const cachedDetail = (previousRaw?.details[listOnly.id] as RawDetail | undefined) ?? null;
    if (!fromRaw && reuseDetails && before?.description && sameAsLastRun && cachedDetail) {
      // Same list entry as last run: normalise it with the detail saved then,
      // which gives exactly what a fresh request would, minus the request.
      listing = normalise(feature, cachedDetail, city, now) ?? listOnly;
      raw.details[listOnly.id] = cachedDetail; // keep raw.json complete
      reused++;
    } else {
      if (fromRaw) {
        detail = cachedDetail;
      } else {
        try {
          const html = await politeFetch(`${BASE_URL}/apartment/${slug}`, "text/html");
          detail = parseDetail(html);
          if (!detail) detailFailures.push(`${listOnly.id} (${slug}): listing data not found in the page`);
        } catch (err) {
          detailFailures.push(`${listOnly.id} (${slug}): ${err instanceof Error ? err.message : err}`);
        }
      }
      listing = normalise(feature, detail, city, now) ?? listOnly;
      // A failed detail request must not wipe a description we already had.
      if (!detail && before) {
        listing.description = listing.description ?? before.description;
        if (before.photos.length > listing.photos.length) listing.photos = before.photos;
      }
      if (detail) {
        const slim = { ...detail };
        delete slim.routes_to_campus; // bulky route geometry, useless here
        raw.details[listOnly.id] = slim;
      }
    }

    if (before) listing.first_seen_at = before.first_seen_at;
    current.set(listing.id, listing);
    if (done % 25 === 0 || done === kept.length) console.log(`  details ${done}/${kept.length}`);
  }

  // 3. Merge with the previous run: update, never duplicate, never delete.
  const added: ClubhouseListing[] = [];
  const updated: { listing: ClubhouseListing; fields: string[] }[] = [];
  const disappeared: ClubhouseListing[] = [];
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
  merged.sort((a, b) => a.city.localeCompare(b.city) || Number(a.id) - Number(b.id));

  const output: OutputFile = {
    scraped_at: now,
    source: "clubhouse",
    filter: `available_to is empty or >= ${today}`,
    listings: merged,
  };
  writeFileSync(listingsFile, JSON.stringify(output, null, 2) + "\n");
  if (!fromRaw) writeFileSync(rawFile, JSON.stringify(raw) + "\n");

  // 4. Report.
  console.log("\n── Result ─────────────────────────────────────────");
  for (const [name, s] of Object.entries(perCity)) {
    console.log(`${name.padEnd(8)} site ${String(s.total).padStart(3)} | kept ${String(s.kept).padStart(3)} | expired ${s.expired}`);
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
  console.log(`Without description: ${active.filter((l) => !l.description).length} | without photos: ${active.filter((l) => !l.photos.length).length}`);
  console.log(`Requests made: ${requestCount} | details reused: ${reused} | skipped: ${skipped}`);
  console.log(`Personal data stripped from descriptions: ${redactedOwnerNames} owner names, ${redactedContacts} e-mails/phones`);
  if (detailFailures.length) {
    console.log(`\nDetail pages that failed (${detailFailures.length}) — list data kept:`);
    for (const f of detailFailures.slice(0, 15)) console.log(`  - ${f}`);
    if (detailFailures.length > 15) console.log(`  … and ${detailFailures.length - 15} more`);
  }
  if (warnings.length) {
    console.log("\nWarnings:");
    for (const w of warnings) console.log(`  - ${w}`);
  }
  console.log(`\nWrote ${path.relative(process.cwd(), listingsFile)}${fromRaw ? "" : ` and ${path.relative(process.cwd(), rawFile)}`}`);
}

main().catch((err) => {
  console.error(`\nScrape failed: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
