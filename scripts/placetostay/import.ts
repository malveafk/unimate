// Import Place to Stay listings into Unimate's housing section.
// ---------------------------------------------------------------------------
// WHY: scrape.ts produces a normalised catalogue (output/listings.json). This
// script syncs that catalogue into the `housing_listings` table, the single
// source the housing map, cards and detail panel read from.
//
// PATTERN: a reconciliation, like matching a supplier price list against the
// warehouse. For every listing we decide: new -> insert, changed -> update,
// identical -> leave alone, gone from the site -> mark unavailable (never
// delete). The match key is (source = "placetostay", source_id = Place to Stay
// room id), backed by the unique index from
// supabase/housing_partner_listings.sql. Rows of other sources (Club House,
// helpHousing, user posts) are never read for writing and never touched.
//
// Same procedure as scripts/clubhouse and scripts/helphousing, kept as a
// separate script on purpose: each source maps its fields differently (see
// toRow below).
//
// Run:   npx tsx scripts/placetostay/import.ts            dry run: prints the plan, writes NOTHING
//        npx tsx scripts/placetostay/import.ts --apply    actually writes to the database
// Flags: --force        apply even if the safety checks below complain
//
// Prerequisites (already applied for the other partners, nothing new here):
//   supabase/housing_partner_listings.sql, supabase/housing_clubhouse_whatsapp.sql
// Partner rows are written with the service role, so the review queue of
// supabase/housing_listing_review.sql leaves them at its default, "approved".
// ---------------------------------------------------------------------------

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import ws from "ws";
import type { PlacetostayListing } from "./scrape";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

const SOURCE = "placetostay";
const PLATFORM = "Place to Stay"; // UI label; the "via Place to Stay" badge is keyed on SOURCE
const LISTINGS_FILE = path.join(__dirname, "output", "listings.json");
const LOG_FILE = "partner-listings-log.md";
const BATCH = 100;
const MAX_AGE_DAYS = 3; // older scrape = stale availability, refuse without --force
const MAX_DEACTIVATION_SHARE = 0.5; // refuse to switch off more than half the catalogue at once
const MIN_PLAUSIBLE_SQM = 5; // anything smaller is a typo, not a room

// Columns this script owns. Anything else on the row (id, created_at, verified,
// photo_path, …) is left to the database.
type Row = {
  created_by: null;
  title: string;
  city: string;
  lat: number | null;
  lng: number | null;
  price: number;
  rooms: number | null;
  furnished: boolean;
  available_from: string | null;
  available_to: string | null;
  description: string | null;
  platform: string;
  link: string;
  image: string[];
  address: string | null;
  bathrooms: number | null;
  size_sqm: number | null;
  source: string;
  source_url: string;
  source_id: string;
  contact_whatsapp: string | null;
  is_active: boolean;
};

const ROW_COLUMNS: (keyof Row)[] = [
  "created_by", "title", "city", "lat", "lng", "price", "rooms", "furnished", "available_from",
  "available_to", "description", "platform", "link", "image", "address", "bathrooms", "size_sqm",
  "source", "source_url", "source_id", "contact_whatsapp", "is_active",
];

const hasFlag = (name: string) => process.argv.slice(2).includes(`--${name}`);

/** Whole number inside [min, max], otherwise null (the table has CHECK constraints). */
function intIn(value: number | null, min: number, max: number): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  const n = Math.floor(value); // 1.5 bathrooms = one full bathroom
  return n >= min && n <= max ? n : null;
}

/** PostgREST/Cloudflare errors can be whole HTML pages: keep one readable line. */
function brief(message: string): string {
  const text = message.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > 160 ? `${text.slice(0, 160)}…` : text;
}

function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

const BED_LABEL: Record<string, string> = { single: "a single bed", double: "a double bed", twin: "two single beds" };

/**
 * What is actually for rent. Place to Stay lets rooms inside shared flats and
 * a few studios, while the table was shaped around whole flats: `rooms` there
 * means "rooms you get". So every listing maps to rooms = 1, and the facts a
 * visitor needs to read the price (which bed, how big the flat is, that the
 * rent moves with the season) go in a first paragraph of the description.
 */
function factsLine(l: PlacetostayListing): string {
  const parts: string[] = [];
  const bed = l.bed_type && BED_LABEL[l.bed_type] ? ` with ${BED_LABEL[l.bed_type]}` : "";
  if (l.type === "studio") parts.push("Studio: the whole unit is yours.");
  else if (l.type === "apartment") parts.push("Whole apartment.");
  else parts.push(`Private room${bed}${l.bedrooms && l.bedrooms > 1 ? ` in a shared flat with ${l.bedrooms} rooms` : ""}.`);
  if (l.private_bathroom && l.type === "room") parts.push("Private bathroom.");
  // The price shown is this month's; most rooms cost less in summer.
  if (l.price_min !== null && l.price_max !== null && l.price_min !== l.price_max) {
    parts.push(`Rent changes with the month: from €${l.price_min} to €${l.price_max}. The price shown is this month's.`);
  }
  return parts.join(" ");
}

export function toRow(l: PlacetostayListing): Row {
  // Nineteen studios share the title "Studio Bedroom": add the flat's name
  // (or the parish) so two cards never read the same.
  // Some flat names carry the door after a comma ("Ajuda 4, 2D(422)"): keep the name only.
  const place = l.flat_name?.split(",")[0].trim() || l.zone;
  const generic = /^studio bedroom$/i.test(l.title.trim());
  const title = clip(generic && place ? `${l.title.trim()} · ${place}` : l.title, 120);

  const description = [factsLine(l), l.description].filter(Boolean).join("\n\n");

  // Street name plus the parish the flat is in. No number, floor or door.
  const address = [l.address, l.zone].filter(Boolean).join(" · ") || null;

  const size = l.surface_sqm;
  return {
    created_by: null,
    title,
    city: l.city,
    lat: l.latitude,
    lng: l.longitude,
    price: Math.round(l.price_monthly),
    rooms: l.type === "apartment" ? intIn(l.bedrooms, 1, 20) : 1,
    furnished: l.furnished,
    available_from: l.available_from,
    available_to: l.available_to,
    description: description ? clip(description, 2000) : null,
    platform: PLATFORM,
    link: l.source_url,
    image: l.photos,
    address,
    bathrooms: null, // the source does not say how many bathrooms a flat has
    size_sqm: size !== null && size >= MIN_PLAUSIBLE_SQM && size <= 10000 ? size : null,
    source: SOURCE,
    source_url: l.source_url,
    source_id: l.id,
    contact_whatsapp: l.contact_whatsapp,
    is_active: true,
  };
}

/**
 * The table's CHECK constraints, replayed locally so a dry run already tells
 * whether every row would be accepted (a failed upsert rejects its whole batch).
 */
export function constraintProblems(row: Row): string[] {
  const out: string[] = [];
  if (row.title.length < 1 || row.title.length > 120) out.push("title length");
  if (!Number.isInteger(row.price) || row.price < 0 || row.price > 100000) out.push("price");
  if (row.rooms !== null && (row.rooms < 1 || row.rooms > 20)) out.push("rooms");
  if (row.description !== null && row.description.length > 2000) out.push("description length");
  if (!/^https:\/\//i.test(row.link) || !/^https:\/\//i.test(row.source_url)) out.push("link");
  if (row.image.some((url) => !/^https:\/\//i.test(url))) out.push("image url");
  if (row.contact_whatsapp !== null && !/^\+[1-9][0-9]{7,14}$/.test(row.contact_whatsapp)) out.push("contact_whatsapp");
  if (row.available_from !== null && !/^\d{4}-\d{2}-\d{2}$/.test(row.available_from)) out.push("available_from");
  return out;
}

/** Compare the way the values come back from Postgres (numeric as number|string, dates as YYYY-MM-DD). */
function sameValue(a: unknown, b: unknown): boolean {
  if (a === null || a === undefined) return b === null || b === undefined;
  if (Array.isArray(a) || Array.isArray(b)) return JSON.stringify(a ?? []) === JSON.stringify(b ?? []);
  // Postgres hands floats back with 15 significant digits, so coordinates such
  // as 43.773075739714294 return as 43.7730757397143: equal within a tolerance.
  if (typeof a === "number" || typeof b === "number") return Math.abs(Number(a) - Number(b)) < 1e-9;
  return String(a) === String(b);
}

function changedColumns(existing: Record<string, unknown>, row: Row): string[] {
  return ROW_COLUMNS.filter((c) => !sameValue(row[c], existing[c]));
}

function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function appendLog(entry: string) {
  if (!existsSync(LOG_FILE)) {
    writeFileSync(LOG_FILE, `# Partner listings data log\n\n${entry}`);
    return;
  }
  const prev = readFileSync(LOG_FILE, "utf8");
  const idx = prev.indexOf("\n\n"); // right after the H1 title: newest entry on top
  const cut = idx >= 0 ? idx + 2 : 0;
  writeFileSync(LOG_FILE, prev.slice(0, cut) + entry + prev.slice(cut));
}

async function main() {
  const apply = hasFlag("apply");
  const force = hasFlag("force");

  // 1. Read the catalogue produced by scrape.ts.
  if (!existsSync(LISTINGS_FILE)) {
    throw new Error("scripts/placetostay/output/listings.json not found: run `npx tsx scripts/placetostay/scrape.ts` first.");
  }
  const file = JSON.parse(readFileSync(LISTINGS_FILE, "utf8")) as { scraped_at: string; listings: PlacetostayListing[] };
  const active = file.listings.filter((l) => l.status === "active");
  const ageDays = (Date.now() - new Date(file.scraped_at).getTime()) / 86_400_000;

  console.log(`Place to Stay import — ${apply ? "APPLY (writes to the database)" : "DRY RUN (nothing is written)"}`);
  console.log(`Catalogue: ${active.length} active + ${file.listings.length - active.length} disappeared, scraped ${file.scraped_at} (${ageDays.toFixed(1)} days ago)`);

  const problems: string[] = [];
  if (active.length === 0) problems.push("the catalogue has no active listings");
  if (ageDays > MAX_AGE_DAYS) problems.push(`the scrape is ${ageDays.toFixed(1)} days old (max ${MAX_AGE_DAYS}): re-run scrape.ts`);

  const rows = active.map(toRow);
  const rejected = rows.map((r) => ({ id: r.source_id, why: constraintProblems(r) })).filter((r) => r.why.length);
  if (rejected.length) {
    problems.push(
      `${rejected.length} rows would break a table constraint (${rejected.slice(0, 5).map((r) => `${r.id}: ${r.why.join("+")}`).join("; ")})`,
    );
  }
  const stalePrices = active.filter((l) => l.price_source !== "live-sheet").length;
  if (stalePrices > active.length * 0.1) {
    problems.push(`${stalePrices} of ${active.length} listings have no live price (scraped with --static-prices, or the price sheet changed)`);
  }
  const noWhatsapp = rows.filter((r) => !r.contact_whatsapp).length;
  if (noWhatsapp) {
    console.log(`Note: ${noWhatsapp} of ${rows.length} listings have no WhatsApp number (none agreed for this source): the listing shows only the link to the original page.`);
  }

  // 2. Read what the database already holds for this source.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error("Missing env: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  }
  // Service role: partner rows have created_by = null, which RLS forbids to normal users.
  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false },
    // Node 20 has no native WebSocket; `ws` is the documented stand-in, but its
    // typings do not line up with realtime-js's constructor type.
    realtime: { transport: ws as never },
  });

  const probe = await supabase.from("housing_listings").select("source, source_id, contact_whatsapp").limit(1);
  if (probe.error) {
    if (probe.error.code === "42703") {
      throw new Error(
        `The table is missing a partner column (${probe.error.message}). Run supabase/housing_partner_listings.sql and supabase/housing_clubhouse_whatsapp.sql in the Supabase SQL Editor, then retry.`,
      );
    }
    throw new Error(
      `Cannot reach the database (${brief(probe.error.message)}). If the Supabase project is paused, restore it from the dashboard and retry.`,
    );
  }

  const existing = new Map<string, Record<string, unknown>>();
  for (let from = 0; ; from += 1000) {
    const page = await supabase
      .from("housing_listings")
      .select(`id, ${ROW_COLUMNS.join(", ")}`)
      .eq("source", SOURCE)
      .order("source_id")
      .range(from, from + 999);
    if (page.error) throw new Error(`Could not read existing listings: ${brief(page.error.message)}`);
    const data = page.data as unknown as Record<string, unknown>[];
    for (const r of data) existing.set(String(r.source_id), r);
    if (data.length < 1000) break;
  }

  // What else is live, to show the size of the feed after this import.
  const others = await supabase
    .from("housing_listings")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)
    .or(`source.is.null,source.neq.${SOURCE}`);
  if (others.error) throw new Error(`Could not count the other live listings: ${brief(others.error.message)}`);

  // 3. Reconcile.
  const toInsert: Row[] = [];
  const toUpdate: { row: Row; columns: string[] }[] = [];
  let unchanged = 0;
  for (const row of rows) {
    const before = existing.get(row.source_id);
    if (!before) toInsert.push(row);
    else {
      const columns = changedColumns(before, row);
      if (columns.length) toUpdate.push({ row, columns });
      else unchanged++;
    }
  }
  // Gone from the site: everything we hold that is not in the active catalogue.
  // Marked unavailable, never deleted.
  const activeIds = new Set(rows.map((r) => r.source_id));
  const toDeactivate = [...existing.values()].filter((r) => r.is_active === true && !activeIds.has(String(r.source_id)));
  const activeBefore = [...existing.values()].filter((r) => r.is_active === true).length;
  if (activeBefore > 0 && toDeactivate.length / activeBefore > MAX_DEACTIVATION_SHARE) {
    problems.push(`${toDeactivate.length} of ${activeBefore} live listings would be switched off (more than ${MAX_DEACTIVATION_SHARE * 100}%)`);
  }

  console.log(`\nIn the database now: ${existing.size} Place to Stay rows (${activeBefore} active), ${others.count ?? 0} live rows from other sources (untouched)`);
  console.log("Plan:");
  console.log(`  insert       ${toInsert.length}`);
  console.log(`  update       ${toUpdate.length}`);
  console.log(`  unchanged    ${unchanged}`);
  console.log(`  deactivate   ${toDeactivate.length}  (gone from Place to Stay; kept with is_active = false)`);
  if (toUpdate.length) {
    const byColumn: Record<string, number> = {};
    for (const u of toUpdate) for (const c of u.columns) byColumn[c] = (byColumn[c] ?? 0) + 1;
    console.log(`  changed columns: ${Object.entries(byColumn).map(([c, n]) => `${c} ×${n}`).join(", ")}`);
  }
  const byCity: Record<string, number> = {};
  for (const r of rows) byCity[r.city] = (byCity[r.city] ?? 0) + 1;
  console.log(`  live after import: ${Object.entries(byCity).map(([c, n]) => `${c} ${n}`).join(", ")}`);
  console.log(`  whole feed after import: ${(others.count ?? 0) + rows.length} live listings`);
  console.log(`  rooms ${active.filter((l) => l.type === "room").length}, studios ${active.filter((l) => l.type === "studio").length}, whole apartments ${active.filter((l) => l.type === "apartment").length}`);
  const stale = active.filter((l) => l.price_source !== "live-sheet").length;
  console.log(`  prices: ${active.length - stale} live, ${stale} as printed in the pages`);
  console.log(`  without coordinates (not on the map, still in the list): ${rows.filter((r) => r.lat === null).length}`);
  console.log(`  descriptions cut to 2,000 characters: ${rows.filter((r) => r.description?.endsWith("…") && r.description.length === 2000).length}`);
  console.log(`  furnished = true on ${rows.filter((r) => r.furnished).length} of ${rows.length} (stated by the source)`);

  if (problems.length) {
    console.error(`\nSafety checks failed:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
    if (!force) {
      console.error("Nothing written. Fix the cause, or re-run with --force if this is really intended.");
      process.exit(1);
    }
    console.error("--force given: continuing anyway.");
  }

  if (!apply) {
    console.log("\nDry run: nothing written. Re-run with --apply to execute this plan.");
    return;
  }

  // 4. Execute. Upserts are keyed on (source, source_id), so a crash half-way
  //    is repaired by simply running the script again.
  let failed = 0;
  for (const batch of chunks([...toInsert, ...toUpdate.map((u) => u.row)], BATCH)) {
    const res = await supabase.from("housing_listings").upsert(batch, { onConflict: "source,source_id" });
    if (res.error) {
      failed += batch.length;
      console.error(`  upsert batch failed (${batch.length} rows): ${brief(res.error.message)}`);
    }
  }
  for (const batch of chunks(toDeactivate.map((r) => String(r.source_id)), BATCH)) {
    const res = await supabase.from("housing_listings").update({ is_active: false }).eq("source", SOURCE).in("source_id", batch);
    if (res.error) {
      failed += batch.length;
      console.error(`  deactivate batch failed (${batch.length} rows): ${brief(res.error.message)}`);
    }
  }

  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  appendLog(
    `## ${stamp} — IMPORT (source: ${SOURCE})\n\n` +
      `Run: \`npx tsx scripts/placetostay/import.ts --apply\` → **housing_listings**. ` +
      `${toInsert.length} nuovi, ${toUpdate.length} aggiornati, ${unchanged} invariati, ` +
      `${toDeactivate.length} disattivati (scomparsi dal sito)` +
      (failed ? `, **${failed} falliti**` : "") +
      `. Catalogo: ${rows.length} attivi (${Object.entries(byCity).map(([c, n]) => `${c} ${n}`).join(", ")}), scrape del ${file.scraped_at}.\n\n`,
  );

  if (failed) {
    // The counts above are the plan, not the outcome: say plainly what is missing.
    console.error(
      `\nFinished with errors: ${failed} rows were NOT written (planned: ${toInsert.length} inserts, ${toUpdate.length} updates, ${toDeactivate.length} deactivations).` +
        "\nRun the same command again: it writes only what is still missing.",
    );
    process.exit(1);
  }
  console.log(`\nDone: ${toInsert.length} inserted, ${toUpdate.length} updated, ${toDeactivate.length} deactivated.`);
}

// Only run when executed directly, so toRow() can be imported and tested.
if (require.main === module) {
  main().catch((err) => {
    console.error(`\nImport failed: ${err instanceof Error ? brief(err.message) : err}`);
    process.exit(1);
  });
}
