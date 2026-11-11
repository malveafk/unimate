// Import Club House listings into Unimate's housing section.
// ---------------------------------------------------------------------------
// WHY: scrape.ts produces a normalised catalogue (output/listings.json). This
// script syncs that catalogue into the `housing_listings` table, the single
// source the housing map, cards and detail panel read from.
//
// PATTERN: a reconciliation, like matching a supplier price list against the
// warehouse. For every listing we decide: new -> insert, changed -> update,
// identical -> leave alone, gone from the site -> mark unavailable (never
// delete). The match key is (source = "clubhouse", source_id = Club House id),
// backed by the unique index from supabase/housing_partner_listings.sql.
//
// Run:   npx tsx scripts/clubhouse/import.ts            dry run: prints the plan, writes NOTHING
//        npx tsx scripts/clubhouse/import.ts --apply    actually writes to the database
// Flags: --force        apply even if the safety checks below complain
//        --keep-demo    do not deactivate the fictitious "demo" partner rows
//
// Prerequisites (run once in the Supabase SQL Editor):
//   supabase/housing_partner_listings.sql, supabase/housing_clubhouse_whatsapp.sql
// ---------------------------------------------------------------------------

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import ws from "ws";
import type { ClubhouseListing } from "./scrape";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

const SOURCE = "clubhouse";
const PLATFORM = "Club House"; // UI label; the "via Club House" badge is built from it
const LISTINGS_FILE = path.join(__dirname, "output", "listings.json");
const LOG_FILE = "partner-listings-log.md";
const BATCH = 100;
const MAX_AGE_DAYS = 3; // older scrape = stale availability, refuse without --force
const MAX_DEACTIVATION_SHARE = 0.5; // refuse to switch off more than half the catalogue at once

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
  const n = Math.round(value);
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

/**
 * The source has no "furnished" field. We only claim it when the listing's own
 * description says so; silence maps to false (see README for the caveat).
 */
function saysFurnished(description: string | null): boolean {
  if (!description) return false;
  return /\bfurnished\b/i.test(description) && !/\bunfurnished\b/i.test(description);
}

export function toRow(l: ClubhouseListing): Row {
  // Some flats that are also rented room by room show the cheapest room's
  // price instead of the whole flat's (scrape.ts works out which). The table
  // has no column for that, so the title says it.
  const title = l.price_basis === "per_room" ? `${clip(l.title, 102)} · price per room` : clip(l.title, 120);
  return {
    created_by: null,
    title,
    city: l.city,
    lat: l.latitude,
    lng: l.longitude,
    price: Math.round(l.price_monthly),
    rooms: intIn(l.bedrooms, 1, 20),
    furnished: saysFurnished(l.description),
    available_from: l.available_from,
    available_to: l.available_to,
    description: l.description ? clip(l.description, 2000) : null,
    platform: PLATFORM,
    link: l.source_url,
    image: l.photos,
    address: l.address,
    bathrooms: intIn(l.bathrooms, 0, 20),
    size_sqm: l.surface_sqm !== null && l.surface_sqm >= 0 && l.surface_sqm <= 10000 ? l.surface_sqm : null,
    source: SOURCE,
    source_url: l.source_url,
    source_id: l.id,
    contact_whatsapp: l.contact_whatsapp,
    is_active: true,
  };
}

/** Compare the way the values come back from Postgres (numeric as number|string, dates as YYYY-MM-DD). */
function sameValue(a: unknown, b: unknown): boolean {
  if (a === null || a === undefined) return b === null || b === undefined;
  if (Array.isArray(a) || Array.isArray(b)) return JSON.stringify(a ?? []) === JSON.stringify(b ?? []);
  // Postgres hands floats back with 15 significant digits, so coordinates such
  // as 13.411373000000026 return as 13.411373: equal within a tolerance.
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
  const keepDemo = hasFlag("keep-demo");

  // 1. Read the catalogue produced by scrape.ts.
  if (!existsSync(LISTINGS_FILE)) {
    throw new Error("scripts/clubhouse/output/listings.json not found: run `npx tsx scripts/clubhouse/scrape.ts` first.");
  }
  const file = JSON.parse(readFileSync(LISTINGS_FILE, "utf8")) as { scraped_at: string; listings: ClubhouseListing[] };
  const active = file.listings.filter((l) => l.status === "active");
  const ageDays = (Date.now() - new Date(file.scraped_at).getTime()) / 86_400_000;

  console.log(`Club House import — ${apply ? "APPLY (writes to the database)" : "DRY RUN (nothing is written)"}`);
  console.log(`Catalogue: ${active.length} active + ${file.listings.length - active.length} disappeared, scraped ${file.scraped_at} (${ageDays.toFixed(1)} days ago)`);

  const problems: string[] = [];
  if (active.length === 0) problems.push("the catalogue has no active listings");
  if (ageDays > MAX_AGE_DAYS) problems.push(`the scrape is ${ageDays.toFixed(1)} days old (max ${MAX_AGE_DAYS}): re-run scrape.ts`);

  const rows = active.map(toRow);
  const noWhatsapp = rows.filter((r) => !r.contact_whatsapp);
  if (noWhatsapp.length) {
    console.warn(`Warning: ${noWhatsapp.length} listings have no WhatsApp number (${[...new Set(noWhatsapp.map((r) => r.city))].join(", ")}).`);
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
  // Gone from the site (or expired): everything we hold that is not in the
  // active catalogue. Marked unavailable, never deleted.
  const activeIds = new Set(rows.map((r) => r.source_id));
  const toDeactivate = [...existing.values()].filter((r) => r.is_active === true && !activeIds.has(String(r.source_id)));
  const activeBefore = [...existing.values()].filter((r) => r.is_active === true).length;
  if (activeBefore > 0 && toDeactivate.length / activeBefore > MAX_DEACTIVATION_SHARE) {
    problems.push(`${toDeactivate.length} of ${activeBefore} live listings would be switched off (more than ${MAX_DEACTIVATION_SHARE * 100}%)`);
  }

  let demoActive = 0;
  if (!keepDemo) {
    const demo = await supabase.from("housing_listings").select("id", { count: "exact", head: true }).eq("source", "demo").eq("is_active", true);
    if (demo.error) throw new Error(`Could not count demo rows: ${brief(demo.error.message)}`);
    demoActive = demo.count ?? 0;
  }

  console.log(`\nIn the database now: ${existing.size} Club House rows (${activeBefore} active)`);
  console.log("Plan:");
  console.log(`  insert       ${toInsert.length}`);
  console.log(`  update       ${toUpdate.length}`);
  console.log(`  unchanged    ${unchanged}`);
  console.log(`  deactivate   ${toDeactivate.length}  (gone from Club House; kept with is_active = false)`);
  console.log(`  demo rows    ${keepDemo ? "kept (--keep-demo)" : `${demoActive} fictitious rows to deactivate`}`);
  if (toUpdate.length) {
    const byColumn: Record<string, number> = {};
    for (const u of toUpdate) for (const c of u.columns) byColumn[c] = (byColumn[c] ?? 0) + 1;
    console.log(`  changed columns: ${Object.entries(byColumn).map(([c, n]) => `${c} ×${n}`).join(", ")}`);
  }
  const byCity: Record<string, number> = {};
  for (const r of rows) byCity[r.city] = (byCity[r.city] ?? 0) + 1;
  console.log(`  live after import: ${Object.entries(byCity).map(([c, n]) => `${c} ${n}`).join(", ")}`);
  console.log(`  furnished = true on ${rows.filter((r) => r.furnished).length} of ${rows.length} (only where the description says so)`);

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
  if (!keepDemo && demoActive > 0) {
    const res = await supabase.from("housing_listings").update({ is_active: false }).eq("source", "demo").eq("is_active", true);
    if (res.error) {
      failed += demoActive;
      console.error(`  demo deactivation failed: ${brief(res.error.message)}`);
    }
  }

  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  appendLog(
    `## ${stamp} — IMPORT (source: ${SOURCE})\n\n` +
      `Run: \`npx tsx scripts/clubhouse/import.ts --apply\` → **housing_listings**. ` +
      `${toInsert.length} nuovi, ${toUpdate.length} aggiornati, ${unchanged} invariati, ` +
      `${toDeactivate.length} disattivati (scomparsi dal sito)` +
      (keepDemo ? "" : `, ${demoActive} demo disattivati`) +
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
