// Seed partner apartment listings into Supabase.
// ---------------------------------------------------------------------------
// Reads the source of truth (app/data/clubhouse-listings.ts) and UPSERTs each
// row into housing_listings using the service role (bypasses RLS, so partner
// rows can be created with created_by = null — no owning user account).
//
// Idempotent: keyed on (source, source_id) via the unique index added in
// supabase/housing_partner_listings.sql, so re-running updates rows in place
// instead of duplicating them. The logic is identical for demo data and for
// the real partner feed — only the contents of clubhouse-listings.ts change.
//
// Prereq: run supabase/housing_partner_listings.sql first (adds the columns).
// Run with:  npx tsx seed-listings.ts
// ---------------------------------------------------------------------------

import { createClient } from "@supabase/supabase-js";
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { config as loadEnv } from "dotenv";
import ws from "ws";
import { clubhouseListings, type PartnerListing } from "./app/data/clubhouse-listings";

// Load local env (.env.local first, then .env) so the script works standalone.
loadEnv({ path: ".env.local" });
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error(
    "Missing env: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (e.g. in .env.local)."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  realtime: { transport: ws },
});

const LOG_FILE = "partner-listings-log.md";

// Map the TS source-of-truth shape to housing_listings columns.
function toRow(l: PartnerListing) {
  return {
    created_by: null,
    title: l.title,
    city: l.city,
    lat: l.lat ?? null,
    lng: l.lng ?? null,
    price: l.price,
    rooms: l.rooms ?? null,
    furnished: l.furnished,
    available_from: l.availableFrom ?? null,
    available_to: l.availableTo ?? null,
    description: l.description ?? null,
    platform: l.platform ?? null,
    // Attribution link back to the source listing (null for demo data).
    link: l.sourceUrl ?? null,
    image: l.images ?? [],
    address: l.address ?? null,
    bathrooms: l.bathrooms ?? null,
    size_sqm: l.sizeSqm ?? null,
    source: l.source,
    source_url: l.sourceUrl ?? null,
    source_id: l.id,
    is_active: true,
  };
}

// Prepend a dated run entry to the log, mirroring university-data-log.md style.
function writeLog(added: PartnerListing[], updated: PartnerListing[]) {
  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const sources = [...new Set(clubhouseListings.map((l) => l.source))].join(", ");
  const line = (l: PartnerListing) =>
    `- **${l.id}** — ${l.title} (${l.city}) · €${l.price}/mo · ${l.sizeSqm} m² · source: ${l.source}`;

  const entry =
    `## ${stamp} — SEED (source: ${sources})\n\n` +
    `Run: \`npx tsx seed-listings.ts\` → **housing_listings**. ` +
    `${added.length} nuovi, ${updated.length} aggiornati, ${clubhouseListings.length} totali nel file sorgente.\n\n` +
    (added.length ? `### Aggiunti\n${added.map(line).join("\n")}\n\n` : "") +
    (updated.length ? `### Aggiornati\n${updated.map(line).join("\n")}\n\n` : "");

  if (!existsSync(LOG_FILE)) {
    writeFileSync(LOG_FILE, `# Partner listings data log\n\n${entry}`);
  } else {
    const prev = readFileSync(LOG_FILE, "utf8");
    const marker = "\n\n";
    const idx = prev.indexOf(marker); // after the H1 title
    const head = idx >= 0 ? prev.slice(0, idx + marker.length) : "# Partner listings data log\n\n";
    const rest = idx >= 0 ? prev.slice(idx + marker.length) : prev;
    writeFileSync(LOG_FILE, head + entry + rest);
  }
}

async function seed() {
  console.log(`Seeding ${clubhouseListings.length} partner listings...\n`);

  // Classify new vs updated by looking up existing (source, source_id) pairs.
  const sources = [...new Set(clubhouseListings.map((l) => l.source))];
  const { data: existing, error: fetchErr } = await supabase
    .from("housing_listings")
    .select("source, source_id")
    .in("source", sources);

  if (fetchErr) {
    console.error("Could not read existing listings:", fetchErr.message);
    process.exit(1);
  }
  const existingKeys = new Set((existing ?? []).map((r) => `${r.source}|${r.source_id}`));

  const added: PartnerListing[] = [];
  const updated: PartnerListing[] = [];
  let failed = 0;

  for (const listing of clubhouseListings) {
    const { error } = await supabase
      .from("housing_listings")
      .upsert(toRow(listing), { onConflict: "source,source_id" });

    if (error) {
      console.error(`✗ ${listing.id} (${listing.title}): ${error.message}`);
      failed++;
      continue;
    }

    const isNew = !existingKeys.has(`${listing.source}|${listing.id}`);
    (isNew ? added : updated).push(listing);
    console.log(`${isNew ? "✓ NEW " : "↻ UPD "} ${listing.id} — ${listing.title}`);
  }

  console.log(
    `\nDone: ${added.length} added, ${updated.length} updated` +
      (failed ? `, ${failed} failed` : "") +
      `.`
  );

  if (added.length || updated.length) writeLog(added, updated);
  if (failed) process.exit(1);
}

seed();
