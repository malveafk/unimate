// Data layer for the housing map (tables created by supabase/housing.sql).
// Maps DB rows to the ApartmentPin shape the map and panels consume.

import { createClient } from "@/utils/supabase/client";
import {
  housingCityCoords,
  type ApartmentPin,
} from "@/app/data/housing-cities";

// Spread pins from the same city apart a little (~±500m) so they don't stack
// on the exact same spot. Deterministic per id, so pins don't jump on reload.
function jitter(id: string, axis: 0 | 1): number {
  let h = axis === 0 ? 7 : 13;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ((h % 1000) / 1000 - 0.5) * 0.012;
}

type ListingRow = {
  id: string;
  // Null on partner imports, which belong to no account.
  created_by?: string | null;
  title: string;
  city: string;
  lat: number | null;
  lng: number | null;
  price: number;
  furnished: boolean;
  available_from: string | null;
  platform: string | null;
  photo_path?: string | null;
  // Everything below is only on full rows (fetchApartmentDetails): the list
  // that feeds the map and the cards does not load it.
  rooms?: number | null;
  description?: string | null;
  link?: string | null;
  // Partner-listing columns (may not be migrated yet — see the 42703 fallback).
  image?: string[] | null;
  address?: string | null;
  bathrooms?: number | null;
  size_sqm?: number | null;
  source?: string | null;
  // Added by supabase/housing_clubhouse_whatsapp.sql (may not be migrated yet).
  contact_whatsapp?: string | null;
};

function listingToPin(row: ListingRow, partial: boolean): ApartmentPin {
  const cityCoords = housingCityCoords[row.city];
  return {
    id: row.id,
    createdBy: row.created_by ?? undefined,
    title: row.title,
    city: row.city,
    lat: row.lat ?? (cityCoords ? cityCoords.lat + jitter(row.id, 0) : 0),
    lng: row.lng ?? (cityCoords ? cityCoords.lng + jitter(row.id, 1) : 0),
    price: row.price,
    platform: row.platform ?? "4UNI",
    furnished: row.furnished,
    link: row.link ?? undefined,
    rooms: row.rooms ?? undefined,
    availableFrom: row.available_from
      ? new Date(row.available_from).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : undefined,
    description: row.description ?? undefined,
    photo: row.photo_path
      ? createClient().storage.from("housing-photos").getPublicUrl(row.photo_path).data.publicUrl
      : undefined,
    image: row.image ?? undefined,
    address: row.address ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    sizeSqm: row.size_sqm ?? undefined,
    source: row.source ?? undefined,
    whatsapp: row.contact_whatsapp ?? undefined,
    ...(partial ? { partial: true } : {}),
  };
}

// ── Listings: a light list for everything, full rows on demand ───────────────
//
// The feed holds thousands of partner listings, each with a long description
// and a few dozen photo URLs. Loading all of that up front would be megabytes
// the visitor never looks at, so reads are split in two, like a catalogue index
// and its product sheets:
//   - fetchApartmentPins     every active listing, only the columns the map,
//                            the filters and a card's text need;
//   - fetchApartmentDetails  the full rows of the few listings on screen (the
//                            cards being shown, the listing opened in the panel).
//
// Only the core columns are guaranteed on every deployed DB (original
// supabase/housing.sql schema). Later migrations add optionals:
//   - photo_path             → listing photos (in housing.sql)
//   - image, address, …      → supabase/housing_partner_listings.sql
//   - contact_whatsapp       → supabase/housing_clubhouse_whatsapp.sql
// Any of them may be unapplied on a given DB, so we try progressively narrower
// column sets and stop at the first that isn't an "undefined column" error. This
// way whichever optionals ARE migrated still load, and a deploy and its ALTER
// TABLEs can land in any order without ever breaking the live apartment feed.
const LISTING_LIST_COLS = "id, created_by, title, city, lat, lng, price, furnished, available_from, platform";
const LISTING_CORE_COLS = `${LISTING_LIST_COLS}, rooms, description, link`;
const LISTING_PHOTO_COLS = "photo_path";
const LISTING_PARTNER_COLS = "image, address, bathrooms, size_sqm, source";
const LISTING_CONTACT_COLS = "contact_whatsapp";

// `source` rides along so a card wears its partner's colours from the first
// paint, before the full row arrives.
const LIST_ATTEMPTS = [
  `${LISTING_LIST_COLS}, photo_path, source`,
  `${LISTING_LIST_COLS}, source`,
  `${LISTING_LIST_COLS}, photo_path`,
  LISTING_LIST_COLS,
];
const DETAIL_ATTEMPTS = [
  `${LISTING_CORE_COLS}, ${LISTING_PHOTO_COLS}, ${LISTING_PARTNER_COLS}, ${LISTING_CONTACT_COLS}`,
  `${LISTING_CORE_COLS}, ${LISTING_PHOTO_COLS}, ${LISTING_PARTNER_COLS}`,
  `${LISTING_CORE_COLS}, ${LISTING_PARTNER_COLS}`,
  `${LISTING_CORE_COLS}, ${LISTING_PHOTO_COLS}`,
  LISTING_CORE_COLS,
];

// PostgREST answers a select with at most `max-rows` rows (1,000 on Supabase by
// default) and silently drops the rest, so a feed bigger than that has to be
// read in ranges.
const LISTING_PAGE_SIZE = 1000;

type ListingQueryResult = { data: unknown; error: { code?: string; message: string } | null; count?: number | null };

// 42703 = undefined_column: that column set isn't fully migrated → try the
// next, narrower one. Any other error (or success) ends the loop.
async function selectListings(
  attempts: string[],
  run: (columns: string) => PromiseLike<ListingQueryResult>,
): Promise<{ rows: ListingRow[]; columns: string; count: number | null }> {
  let i = 0;
  let result = await run(attempts[0]);
  while (result.error?.code === "42703" && i + 1 < attempts.length) result = await run(attempts[++i]);
  if (result.error) throw result.error;
  return { rows: result.data as ListingRow[], columns: attempts[i], count: result.count ?? null };
}

// Rooms of one flat, and flats of one building, share a single coordinate on
// the source (one building can hold a hundred listings). Drawn as they are,
// their pins sit exactly on top of each other and only the top one can be
// clicked. So the 2nd, 3rd, … listing on a point is drawn a few metres away,
// fanned out on a spiral around the real position. Display only: the stored
// coordinates are not changed. Deterministic (ordered by id), so pins do not
// move between visits.
const STACK_STEP_METRES = 9;
const GOLDEN_ANGLE = 2.399963; // radians: spreads points evenly on the spiral

function spreadStackedPins(pins: ApartmentPin[]): ApartmentPin[] {
  const groups = new Map<string, ApartmentPin[]>();
  for (const pin of pins) {
    const key = `${pin.lat},${pin.lng}`;
    const group = groups.get(key);
    if (group) group.push(pin);
    else groups.set(key, [pin]);
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    group.sort((a, b) => (a.id < b.id ? -1 : 1));
    for (let n = 1; n < group.length; n++) {
      const pin = group[n];
      const radius = STACK_STEP_METRES * Math.sqrt(n);
      const angle = n * GOLDEN_ANGLE;
      const latRad = (pin.lat * Math.PI) / 180;
      pin.lat += (radius * Math.cos(angle)) / 111_320;
      pin.lng += (radius * Math.sin(angle)) / (111_320 * Math.cos(latRad));
    }
  }
  return pins;
}

// Every active listing, light columns only (pins are flagged `partial`).
// `pageSize` is a parameter only so the paging can be exercised in a test.
export async function fetchApartmentPins(pageSize: number = LISTING_PAGE_SIZE): Promise<ApartmentPin[]> {
  const supabase = createClient();
  // created_at alone is not a stable order: a partner import writes hundreds of
  // rows with the same timestamp, and ranges would then overlap or skip rows.
  const page = (columns: string, from: number, withCount: boolean) =>
    supabase
      .from("housing_listings")
      .select(columns, withCount ? { count: "exact" } : undefined)
      .order("created_at", { ascending: false })
      .order("id")
      .range(from, from + pageSize - 1);

  const first = await selectListings(LIST_ATTEMPTS, (columns) => page(columns, 0, true));
  const byId = new Map(first.rows.map((row) => [row.id, row]));
  // Keep asking until we hold as many rows as the table says it has. Advancing
  // by what actually arrived (not by pageSize) stays correct even if the server
  // caps a response below the size we asked for.
  let fetched = first.rows.length;
  while (first.count !== null && fetched < first.count) {
    const next = await page(first.columns, fetched, false);
    if (next.error) throw next.error;
    const rows = next.data as unknown as ListingRow[];
    if (rows.length === 0) break;
    for (const row of rows) byId.set(row.id, row);
    fetched += rows.length;
  }

  return spreadStackedPins([...byId.values()].map((row) => listingToPin(row, true)));
}

// Full rows (description, photo gallery, address, contact…) for a few listings.
export async function fetchApartmentDetails(ids: string[]): Promise<ApartmentPin[]> {
  if (ids.length === 0) return [];
  const supabase = createClient();
  const { rows } = await selectListings(DETAIL_ATTEMPTS, (columns) =>
    supabase.from("housing_listings").select(columns).in("id", ids),
  );
  return rows.map((row) => listingToPin(row, false));
}
