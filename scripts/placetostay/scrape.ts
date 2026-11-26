// Place to Stay (placetostay.pt) listings scraper.
// ---------------------------------------------------------------------------
// WHY: Unimate shows partner housing. Place to Stay's owner authorised us (in a
// video call with Nicolò, November 2026) to list all their rooms.
//
// HOW: the site is a static showcase of one city (Lisbon). Three small public
// files describe the whole catalogue, plus one page per room for its gallery:
//
//   GET /properties.html          every flat and every room card (title, bed,
//                                 size, short text, cover photo, price)
//   GET /assets/data/flats.json   coordinates of every flat
//   GET /api/availability.php     when each room is free (the live source the
//                                 site itself reads)
//   GET /rooms/<id>/              photo gallery and amenities of one room
//
// The room pages are rate-limited by the site (HTTP 429 at one request per
// second), so they are fetched one every four seconds and remembered in
// output/details.json: a room page is read again only when the room is new or
// its cover photo changed. First run: 3 requests + one per room (~240), about
// 16 minutes. Later runs: 3 requests + the new rooms.
//
// PRICES: the number printed in the pages is a snapshot taken when the site was
// last built. The site then overwrites it in the browser with live prices read
// from a Google Sheet. This scraper reads ONLY the site, so `price_monthly` is
// the built price and `price_source` says so. See README, "Prezzi".
//
// We do NOT log in, do NOT download photos (URLs only) and do NOT call the
// booking endpoints.
//
// Run:   npx tsx scripts/placetostay/scrape.ts
// Flags: --limit=5          first N rooms (writes *.sample.json, see below)
//        --no-details       skip the per-room pages (remembered ones still used)
//        --refresh-details  read every room page again, ignoring the memory
//        --from-raw         no network: rebuild listings.json from the saved
//                       raw.json (to debug or change the normalisation)
//
// A partial run (--limit) never touches listings.json: a partial view of the
// site must not be able to mark the rest of the catalogue as disappeared.
// ---------------------------------------------------------------------------

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

// ── Configuration ──────────────────────────────────────────────────────────

const BASE_URL = "https://placetostay.pt";
const LIST_URL = `${BASE_URL}/properties.html`;
const FLATS_URL = `${BASE_URL}/assets/data/flats.json`;
const AVAILABILITY_URL = `${BASE_URL}/api/availability.php`;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.4uni.online").replace(/\/+$/, "");
const USER_AGENT = `UnimateBot/1.0 (+${SITE_URL})`;

const MIN_INTERVAL_MS = 1100; // max ~1 request/second, with a small margin
// Room pages answer 429 at that pace (measured 26 Nov 2026: ~1 in 2 refused at
// 1.1 s, none at 3.3 s). Four seconds leaves a margin.
const DETAIL_INTERVAL_MS = 4000;
const RATE_LIMIT_PAUSE_MS = 30_000; // after a 429: wait, never speed up
const MAX_RETRIES = 4;
const REQUEST_TIMEOUT_MS = 60_000;

const CITY = "Lisbon";
const COUNTRY = "Portugal";

// No WhatsApp number has been agreed with Place to Stay. Their site shows a
// business number on its own WhatsApp button; it is deliberately not copied
// here. Fill this in once a number is agreed.
const CONTACT_WHATSAPP: string | null = null;

// The availability feed parks rooms that are not on offer on a far-away date.
const NOT_ON_OFFER_FROM = "2090-01-01";

const OUTPUT_DIR = path.join(__dirname, "output");

// ── Types ──────────────────────────────────────────────────────────────────

type ListingType = "room" | "studio" | "apartment";

export type PlacetostayListing = {
  id: string; // Place to Stay room id (e.g. "YlwD0bw8") — the idempotency key
  title: string;
  city: string;
  country: string;
  address: string | null; // street only — never number, floor or door (see README)
  zone: string | null; // parish (freguesia)
  latitude: number | null;
  longitude: number | null;
  price_monthly: number;
  // "site-build" = the price printed in the static pages. The site's own
  // browser code replaces it with a live price we do not read.
  price_source: "site-build";
  currency: "EUR";
  available_from: string; // YYYY-MM-DD
  available_to: string | null; // always null: the site has no end date
  available_now: boolean;
  type: ListingType; // room in a shared flat | studio | whole apartment
  bed_type: string | null; // single | double | twin | studio | all
  bedrooms: number | null; // rooms in the flat
  surface_sqm: number | null;
  private_bathroom: boolean;
  is_room: boolean; // true for a room in a shared flat
  furnished: boolean;
  flat_id: string | null; // rooms of the same flat share it
  flat_name: string | null;
  amenities: string[];
  description: string | null;
  photos: string[];
  contact_whatsapp: string | null;
  source: "placetostay";
  source_url: string; // original room page
  source_label: "via Place to Stay";
  status: "active" | "disappeared";
  first_seen_at: string;
  last_seen_at: string;
  disappeared_at: string | null;
  scraped_at: string;
};

type RoomDetail = { photos: string[]; amenities: string[]; surface_sqm: number | null };

// What we remember of a room page between runs. `cover` is the photo the list
// showed when the page was read: a different cover means the gallery changed.
type DetailCache = Record<string, { cover: string | null; fetched_at: string; detail: RoomDetail }>;

type RawFile = {
  fetched_at: string;
  properties_html: string;
  flats: unknown;
  availability: unknown;
  details: Record<string, RoomDetail>;
};

type OutputFile = {
  scraped_at: string;
  source: "placetostay";
  filter: string;
  listings: PlacetostayListing[];
};

type FlatCard = {
  lid: string;
  name: string | null;
  street: string | null;
  parish: string | null;
  roomCount: number | null;
  description: string | null;
  features: string[];
};

type RoomCard = {
  sid: string;
  lid: string | null;
  bed: string | null;
  price: number | null;
  staticAvailable: string | null; // "now" or YYYY-MM-DD, as printed when the site was built
  title: string | null;
  description: string | null;
  specs: string[];
  windowNote: string | null;
  cover: string | null;
};

// ── Small helpers ──────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function num(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || !value.trim()) return null;
  const n = Number(value.trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function isoDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  return m ? m[1] : null;
}

/** Today's date in Lisbon, YYYY-MM-DD (availability is decided there). */
function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon" }).format(new Date());
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

async function politeGet(url: string, minIntervalMs: number = MIN_INTERVAL_MS): Promise<string> {
  let lastError = "unknown error";
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const wait = lastRequestAt + minIntervalMs - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();
    requestCount++;

    let retryAfterMs: number | null = null;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/json" },
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
      else if (res.status === 429) retryAfterMs = RATE_LIMIT_PAUSE_MS * (attempt + 1);
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
  ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", middot: "·", sup2: "²",
  agrave: "à", aacute: "á", atilde: "ã", acirc: "â", egrave: "è", eacute: "é", ecirc: "ê",
  iacute: "í", oacute: "ó", otilde: "õ", ocirc: "ô", uacute: "ú", ccedil: "ç", ordm: "º", ordf: "ª",
};

/** Strip tags and decode entities; null when nothing readable is left. */
function htmlToText(html: string | null | undefined): string | null {
  if (!html) return null;
  const text = html
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-zA-Z][a-zA-Z0-9]+);/g, (whole, name: string) => NAMED_ENTITIES[name] ?? whole)
    .replace(/\r/g, "")
    .replace(/[ \t ]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .trim();
  return text || null;
}

let redactedContacts = 0;

/** The texts are the agency's own marketing copy; strip contacts all the same. */
function scrubContacts(text: string | null): string | null {
  if (!text) return null;
  let out = text.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, () => {
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

// ── Parsing the listing page ───────────────────────────────────────────────

function attr(tag: string, name: string): string | null {
  const m = new RegExp(`\\s${name}="([^"]*)"`).exec(tag);
  return m ? htmlToText(m[1]) : null;
}

function inner(html: string, pattern: RegExp): string | null {
  const m = pattern.exec(html);
  return m ? m[1] : null;
}

function absoluteUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value, `${BASE_URL}/`).href;
  } catch {
    return null;
  }
}

function parseListPage(html: string): { flats: Map<string, FlatCard>; rooms: RoomCard[] } {
  const flats = new Map<string, FlatCard>();
  const rooms: RoomCard[] = [];

  // Each flat is a <section class="flat-section"> holding its room cards.
  const sections = html.split(/(?=<section class="flat-section")/).slice(1);
  for (const section of sections) {
    const openTag = /^<section[^>]*>/.exec(section)?.[0] ?? "";
    const lid = attr(openTag, "data-lid");
    if (lid) {
      // "Avenida 5 de Outubro · Floor 3ºD · <strong>São Sebastião da Pedreira</strong>"
      const location = inner(section, /<p class="flat-location">([\s\S]*?)<\/p>/);
      // Street name only: a few flats print the house number too ("Rua dos Mouros, 26").
      const street = htmlToText(location)?.split("·")[0].split(",")[0].trim() || null;
      // A flat without a header still carries its parish, lower-cased, on the section.
      const parishAttr = attr(openTag, "data-parish");
      const parishFromAttr = parishAttr
        ? parishAttr.replace(/(^|[\s-])(\p{L})(?!\p{L}?(?:\s|$))/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase())
        : null;
      flats.set(lid, {
        lid,
        name: htmlToText(inner(section, /<h2 class="flat-name">([\s\S]*?)<\/h2>/)),
        street,
        parish: htmlToText(inner(location ?? "", /<strong>([\s\S]*?)<\/strong>/)) ?? parishFromAttr,
        roomCount: num(attr(openTag, "data-room-count")),
        description: htmlToText(inner(section, /<p class="flat-desc">([\s\S]*?)<\/p>/)),
        features: (htmlToText(inner(section, /<span class="flat-features">([\s\S]*?)<\/span>/)) ?? "")
          .split("·")
          .map((f) => f.trim())
          .filter(Boolean),
      });
    }

    const cards = section.match(/<article id="room-[^"]*" class="property"[\s\S]*?<\/article>/g) ?? [];
    for (const card of cards) {
      const tag = /^<article[^>]*>/.exec(card)?.[0] ?? "";
      const sid = attr(tag, "data-sid");
      if (!sid) continue;
      const specsBlock = inner(card, /<div class="property-specs">([\s\S]*?)<\/div>/) ?? "";
      const specs: string[] = [];
      let windowNote: string | null = null;
      for (const m of specsBlock.matchAll(/<span([^>]*)>([\s\S]*?)<\/span>/g)) {
        const text = htmlToText(m[2]);
        if (!text) continue;
        if (/spec-window/.test(m[1])) windowNote = text;
        else specs.push(text);
      }
      rooms.push({
        sid,
        lid: attr(tag, "data-lid") ?? lid,
        bed: attr(tag, "data-bed"),
        price: num(attr(tag, "data-price")),
        staticAvailable: attr(tag, "data-available"),
        title: htmlToText(inner(card, /<a class="property-title-link"[^>]*>([\s\S]*?)<\/a>/)),
        description: htmlToText(inner(card, /<p class="property-desc">([\s\S]*?)<\/p>/)),
        specs,
        windowNote,
        cover: absoluteUrl(inner(card, /<img src="([^"]+)"/)),
      });
    }
  }
  return { flats, rooms };
}

/** Coordinates by flat id. flats.json also carries the full address: not used. */
function parseFlatCoords(json: unknown): Map<string, { lat: number; lng: number }> {
  const out = new Map<string, { lat: number; lng: number }>();
  if (!Array.isArray(json)) return out;
  for (const item of json as Record<string, unknown>[]) {
    const lid = typeof item.lid === "string" ? item.lid : null;
    const lat = num(item.lat);
    const lng = num(item.lng);
    if (lid && lat !== null && lng !== null && (lat !== 0 || lng !== 0)) out.set(lid, { lat, lng });
  }
  return out;
}

/** Room id -> first free date, or null when the room has no booking at all. */
function parseAvailability(json: unknown): Map<string, string | null> {
  const out = new Map<string, string | null>();
  const rooms = (json as { rooms?: Record<string, { available_from?: unknown }> } | null)?.rooms;
  if (!rooms || typeof rooms !== "object") return out;
  for (const [sid, info] of Object.entries(rooms)) out.set(sid, isoDate(info?.available_from));
  return out;
}

/** The room page describes itself in a schema.org block: gallery, amenities, size. */
function parseRoomPage(html: string, sid: string): RoomDetail | null {
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    let data: unknown;
    try {
      data = JSON.parse(m[1]);
    } catch {
      continue;
    }
    const graph = (data as { "@graph"?: unknown[] })["@graph"] ?? [data];
    for (const node of graph as Record<string, unknown>[]) {
      if (node?.identifier !== sid) continue;
      const images = Array.isArray(node.image) ? node.image : node.image ? [node.image] : [];
      const photos: string[] = [];
      for (const image of images) {
        const url = typeof image === "string" ? absoluteUrl(image) : null;
        if (url && !photos.includes(url)) photos.push(url);
      }
      const amenities: string[] = [];
      for (const feature of (Array.isArray(node.amenityFeature) ? node.amenityFeature : []) as Record<string, unknown>[]) {
        const name = typeof feature?.name === "string" ? feature.name.trim() : "";
        if (name && feature.value !== false && !amenities.includes(name)) amenities.push(name);
      }
      const floor = node.floorSize as { value?: unknown } | undefined;
      return { photos, amenities, surface_sqm: num(floor?.value) };
    }
  }
  return null;
}

// ── Normalisation ──────────────────────────────────────────────────────────

function listingType(bed: string | null): ListingType {
  if (bed === "studio") return "studio";
  if (bed === "all") return "apartment"; // the whole flat is let as one
  return "room";
}

function normalise(
  card: RoomCard,
  flat: FlatCard | undefined,
  coords: { lat: number; lng: number } | undefined,
  liveAvailable: string | null | undefined, // undefined = room missing from the live feed
  detail: RoomDetail | undefined,
  today: string,
  now: string,
): PlacetostayListing | null {
  if (!card.title || card.price === null || card.price <= 0) return null;

  // Live feed first; the date printed in the page only when the feed does not know the room.
  const from = liveAvailable !== undefined ? liveAvailable : card.staticAvailable === "now" ? null : isoDate(card.staticAvailable);
  const availableNow = !from || from <= today;

  const type = listingType(card.bed);
  const surfaceSpec = card.specs.map((s) => /^(\d+(?:[.,]\d+)?)\s*m²$/.exec(s)).find(Boolean);
  const privateBathroom = card.specs.some((s) => /private bath/i.test(s));
  const amenities = detail?.amenities.length ? [...detail.amenities] : [...(flat?.features ?? [])];
  if (privateBathroom && !amenities.some((a) => /private bath/i.test(a))) amenities.unshift("Private bathroom");

  // The site prints only the opening of each text (it ends with "…"): the
  // room's first, then the flat's, then the note about the window if any.
  const description = scrubContacts(
    [card.description, flat?.description, card.windowNote ? `Window: ${card.windowNote}.` : null].filter(Boolean).join("\n\n") || null,
  );

  return {
    id: card.sid,
    title: card.title,
    city: CITY,
    country: COUNTRY,
    address: flat?.street ?? null,
    zone: flat?.parish ?? null,
    latitude: coords?.lat ?? null,
    longitude: coords?.lng ?? null,
    price_monthly: card.price,
    price_source: "site-build",
    currency: "EUR",
    available_from: availableNow ? today : (from as string),
    available_to: null,
    available_now: availableNow,
    type,
    bed_type: card.bed,
    bedrooms: flat?.roomCount ?? null,
    surface_sqm: detail?.surface_sqm ?? (surfaceSpec ? num(surfaceSpec[1]) : null),
    private_bathroom: privateBathroom,
    is_room: type === "room",
    // Every home on the site is let furnished ("Furnished rooms and apartments").
    furnished: true,
    flat_id: card.lid,
    flat_name: flat?.name ?? null,
    amenities,
    description,
    photos: detail?.photos.length ? detail.photos : card.cover ? [card.cover] : [],
    contact_whatsapp: CONTACT_WHATSAPP,
    source: "placetostay",
    source_url: `${BASE_URL}/rooms/${encodeURIComponent(card.sid)}/`,
    source_label: "via Place to Stay",
    status: "active",
    first_seen_at: now,
    last_seen_at: now,
    disappeared_at: null,
    scraped_at: now,
  };
}

// ── Diff / idempotency ─────────────────────────────────────────────────────

const BOOKKEEPING_FIELDS = ["status", "first_seen_at", "last_seen_at", "disappeared_at", "scraped_at"] as const;

function changedFields(before: PlacetostayListing, after: PlacetostayListing): string[] {
  return (Object.keys(after) as (keyof PlacetostayListing)[]).filter(
    (k) =>
      !(BOOKKEEPING_FIELDS as readonly string[]).includes(k) &&
      JSON.stringify(before[k]) !== JSON.stringify(after[k]),
  );
}

function loadPrevious(file: string): Map<string, PlacetostayListing> {
  const map = new Map<string, PlacetostayListing>();
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
  const limitFlag = getFlag("limit");
  const fromRaw = getFlag("from-raw") === true;
  const noDetails = getFlag("no-details") === true;
  const refreshDetails = getFlag("refresh-details") === true;
  const limit = typeof limitFlag === "string" ? Math.max(1, parseInt(limitFlag, 10) || 0) : null;
  const partial = Boolean(limit);

  const rawMainFile = path.join(OUTPUT_DIR, "raw.json");
  const previousRaw: RawFile | null = existsSync(rawMainFile) ? (JSON.parse(readFileSync(rawMainFile, "utf8")) as RawFile) : null;
  if (fromRaw && !previousRaw) throw new Error("--from-raw needs an existing output/raw.json: run a normal scrape first.");

  // With --from-raw the data is as old as the raw file, not as old as this run.
  const now = fromRaw && previousRaw ? previousRaw.fetched_at : new Date().toISOString();
  const today = fromRaw && previousRaw ? previousRaw.fetched_at.slice(0, 10) : todayIso();
  const listingsFile = path.join(OUTPUT_DIR, partial ? "listings.sample.json" : "listings.json");
  const rawFile = path.join(OUTPUT_DIR, partial ? "raw.sample.json" : "raw.json");
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Always diff against the real file, even in a partial run (read-only there).
  const previous = loadPrevious(path.join(OUTPUT_DIR, "listings.json"));
  const previousActive = [...previous.values()].filter((l) => l.status === "active").length;

  console.log(`Place to Stay scrape — ${now}`);
  console.log(`User-Agent: ${USER_AGENT}`);
  if (partial) console.log("PARTIAL RUN: writing *.sample.json, listings.json is left untouched");
  if (fromRaw) console.log(`FROM RAW: no requests, re-normalising raw.json fetched at ${now}`);

  // 1. The three catalogue files. Any of them failing aborts the run: without
  //    the list there is no catalogue, without the feed the dates are wrong.
  const raw: RawFile = fromRaw && previousRaw
    ? previousRaw
    : {
        fetched_at: now,
        properties_html: await politeGet(LIST_URL),
        flats: JSON.parse(await politeGet(FLATS_URL)),
        availability: JSON.parse(await politeGet(AVAILABILITY_URL)),
        details: {},
      };

  const { flats, rooms } = parseListPage(raw.properties_html);
  const coords = parseFlatCoords(raw.flats);
  const availability = parseAvailability(raw.availability);
  console.log(`Listing page: ${rooms.length} rooms in ${flats.size} flats | coordinates for ${coords.size} flats | live availability for ${availability.size} rooms`);

  if (!partial && rooms.length === 0 && previousActive > 0) {
    throw new Error(`The listing page has no rooms while the previous run had ${previousActive}. Nothing written — check the site by hand.`);
  }
  if (rooms.length > 0 && availability.size === 0) {
    throw new Error("The availability feed is empty or has changed shape. Nothing written — check /api/availability.php by hand.");
  }

  // 2. One page per room, for the gallery — only for rooms we have not read
  //    yet (or whose cover changed). A failed page does not stop the run: the
  //    room keeps its list data and the photos of the previous run.
  const cacheFile = path.join(OUTPUT_DIR, "details.json");
  const cache: DetailCache = existsSync(cacheFile) ? (JSON.parse(readFileSync(cacheFile, "utf8")) as DetailCache) : {};
  const saveCache = () => writeFileSync(cacheFile, JSON.stringify(cache) + "\n");
  let detailsFetched = 0;
  let detailsReused = 0;
  const warnings: string[] = [];
  const selected = limit ? rooms.slice(0, limit) : rooms;
  const stats = { kept: 0, skipped: 0, notOnOffer: 0, detailFailed: 0, noLiveDate: 0 };
  const current = new Map<string, PlacetostayListing>();

  for (const [index, card] of selected.entries()) {
    const live = availability.has(card.sid) ? (availability.get(card.sid) as string | null) : undefined;
    if (live && live >= NOT_ON_OFFER_FROM) {
      stats.notOnOffer++;
      continue;
    }
    if (live === undefined) {
      stats.noLiveDate++;
      warnings.push(`Room ${card.sid} is missing from the live availability feed: used the date printed in the page.`);
    }

    let detail: RoomDetail | undefined = raw.details[card.sid];
    const remembered = cache[card.sid];
    if (!fromRaw && remembered && !refreshDetails && remembered.cover === card.cover) {
      detail = remembered.detail;
      raw.details[card.sid] = detail;
      detailsReused++;
    } else if (!fromRaw && !noDetails) {
      try {
        const page = await politeGet(`${BASE_URL}/rooms/${encodeURIComponent(card.sid)}/`, DETAIL_INTERVAL_MS);
        detail = parseRoomPage(page, card.sid) ?? undefined;
        if (!detail) throw new Error("no schema.org block for this room");
        raw.details[card.sid] = detail;
        cache[card.sid] = { cover: card.cover, fetched_at: now, detail };
        detailsFetched++;
        // A long run must not lose its work if it is interrupted.
        if (detailsFetched % 20 === 0) saveCache();
      } catch (err) {
        stats.detailFailed++;
        const before = previous.get(card.sid);
        if (before?.photos.length) detail = { photos: before.photos, amenities: before.amenities, surface_sqm: before.surface_sqm };
        warnings.push(`Room ${card.sid}: detail page failed (${err instanceof Error ? err.message : err}); kept ${before ? "the previous photos" : "the cover photo only"}.`);
      }
      if ((index + 1) % 40 === 0) console.log(`  ${index + 1}/${selected.length} rooms`);
    }

    const listing = normalise(card, card.lid ? flats.get(card.lid) : undefined, card.lid ? coords.get(card.lid) : undefined, live, detail, today, now);
    if (!listing) {
      stats.skipped++;
      warnings.push(`Room ${card.sid} skipped (missing title or price).`);
      continue;
    }
    if (current.has(listing.id)) {
      warnings.push(`Duplicate room id ${listing.id}, kept the first one.`);
      continue;
    }
    const before = previous.get(listing.id);
    if (before) listing.first_seen_at = before.first_seen_at;
    current.set(listing.id, listing);
    stats.kept++;
  }

  if (detailsFetched) saveCache();

  // 3. Merge with the previous run: update, never duplicate, never delete.
  const added: PlacetostayListing[] = [];
  const updated: { listing: PlacetostayListing; fields: string[] }[] = [];
  const disappeared: PlacetostayListing[] = [];
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
  merged.sort((a, b) => (a.flat_name ?? "").localeCompare(b.flat_name ?? "") || a.id.localeCompare(b.id));

  const output: OutputFile = {
    scraped_at: now,
    source: "placetostay",
    filter: `rooms on the listing page, minus those the availability feed parks on ${NOT_ON_OFFER_FROM} or later`,
    listings: merged,
  };
  writeFileSync(listingsFile, JSON.stringify(output, null, 2) + "\n");
  if (!fromRaw) writeFileSync(rawFile, JSON.stringify(raw) + "\n");

  // 4. Report.
  const active = merged.filter((l) => l.status === "active");
  console.log("\n── Result ─────────────────────────────────────────");
  console.log(`Rooms on the site ${selected.length} | kept ${stats.kept} | not on offer ${stats.notOnOffer} | skipped ${stats.skipped}`);
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

  console.log(`\nActive listings written: ${active.length} (+ ${merged.length - active.length} kept as disappeared)`);
  console.log(`Available now: ${active.filter((l) => l.available_now).length} | without description: ${active.filter((l) => !l.description).length} | without photos: ${active.filter((l) => !l.photos.length).length} | without coordinates: ${active.filter((l) => l.latitude === null).length}`);
  console.log(`Requests made: ${requestCount} (${(bytesReceived / 1e6).toFixed(1)} MB received) | room pages read ${detailsFetched}, remembered ${detailsReused}`);
  console.log(`Contacts stripped from descriptions: ${redactedContacts}`);
  console.log("Prices: as printed when the site was last built (price_source = site-build), not the live ones.");
  if (!CONTACT_WHATSAPP) warnings.unshift("No agreed WhatsApp number for Place to Stay — contact_whatsapp left empty.");
  if (stats.detailFailed) warnings.unshift(`${stats.detailFailed} room pages failed: those rooms may have fewer photos.`);
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
