/**
 * Validates the chatbot knowledge base in data/knowledge/** and prints a
 * coverage report.
 *
 *   npx tsx scripts/knowledge/validate.ts              # everything
 *   npx tsx scripts/knowledge/validate.ts --country netherlands
 *   npx tsx scripts/knowledge/validate.ts --stale-days 182   # default 182 (≈6 months)
 *   npx tsx scripts/knowledge/validate.ts --json report.json
 *   npx tsx scripts/knowledge/validate.ts --strict          # also fail on a stale index
 *   npx tsx scripts/knowledge/validate.ts --md coverage.md  # country × category table
 *
 * Exit code 1 when a record breaks the schema (missing source_url,
 * verified_at, bad status...). Unverified, missing and stale records are
 * reported but are not errors: they are what the periodic review works on.
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { universities } from "../../app/data/universities";
import { slugify } from "../../utils/knowledge/slug";
import { indexIsCurrent } from "./build-index";
import {
  BUREAUCRACY_TOPICS,
  SUBSIDY_CATEGORIES,
  CITY_FIELDS,
  type CountryBureaucracy,
  type CountrySubsidies,
  type CityFile,
  type Status,
} from "../../utils/knowledge/types";

const ROOT = join(__dirname, "../../data/knowledge");
const args = process.argv.slice(2);
const arg = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const onlyCountry = arg("--country");
const staleDays = Number(arg("--stale-days") ?? 182);
const jsonOut = arg("--json");
const mdOut = arg("--md");

const STATUSES: Status[] = ["verified", "unverified", "missing"];
const errors: string[] = [];
const warnings: string[] = [];
const expired: string[] = [];
type Row = { file: string; id: string; status: Status; verified_at: string; source_url: string };
const records: Row[] = [];

const today = new Date();
const isDate = (s: unknown) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
const isUrl = (s: unknown) => typeof s === "string" && /^https?:\/\/[^\s]+\.[^\s]+/.test(s);
const ageDays = (d: string) => Math.floor((today.getTime() - Date.parse(d)) / 86_400_000);

function checkSourced(file: string, id: string, r: Record<string, unknown>) {
  const where = `${file} › ${id}`;
  if (!isUrl(r.source_url)) errors.push(`${where}: source_url missing or not a URL`);
  if (!isDate(r.verified_at)) errors.push(`${where}: verified_at missing or not YYYY-MM-DD`);
  if (!STATUSES.includes(r.status as Status)) errors.push(`${where}: status must be one of ${STATUSES.join("/")}`);
  if (r.valid_until !== undefined && !isDate(r.valid_until)) errors.push(`${where}: valid_until must be YYYY-MM-DD`);
  if (isDate(r.valid_until) && Date.parse(String(r.valid_until)) < today.getTime()) expired.push(`${where} (valid until ${r.valid_until})`);
  for (const x of (r.extra_sources as unknown[]) ?? []) if (!isUrl(x)) errors.push(`${where}: extra_sources has a non-URL`);
  for (const i of (r.interpretations as { hypothesis?: string; source_url?: string }[]) ?? []) {
    if (!i.hypothesis || !isUrl(i.source_url)) errors.push(`${where}: each interpretation needs hypothesis + source_url`);
  }
  records.push({ file, id, status: r.status as Status, verified_at: String(r.verified_at), source_url: String(r.source_url) });
}

function checkEligibility(where: string, e: unknown) {
  if (!e || typeof e !== "object") return errors.push(`${where}: eligibility/applies_to missing`);
  const el = e as Record<string, unknown>;
  const ok = (v: unknown, allowed: string[]) => v === "any" || (Array.isArray(v) && v.length > 0 && v.every((x) => allowed.includes(x)));
  if (!ok(el.student_type, ["exchange", "degree"])) errors.push(`${where}: student_type must be "any" or [exchange|degree]`);
  if (!ok(el.nationality, ["eu_eea", "swiss", "non_eu"])) errors.push(`${where}: nationality must be "any" or [eu_eea|swiss|non_eu]`);
}

function readJson<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch (e) {
    errors.push(`${path}: invalid JSON (${(e as Error).message})`);
    return null;
  }
}

const catalogCountries = [...new Set(universities.map((u) => u.country))];
const coverage: Record<string, Record<string, string>> = {};

for (const country of catalogCountries) {
  const slug = slugify(country);
  if (onlyCountry && slug !== onlyCountry) continue;
  const row: Record<string, string> = (coverage[country] = {});
  const dir = join(ROOT, slug);

  const bPath = join(dir, "bureaucracy.json");
  if (!existsSync(bPath)) {
    warnings.push(`${country}: bureaucracy.json missing`);
    for (const t of BUREAUCRACY_TOPICS) row[t] = "mancante";
  } else {
    const b = readJson<CountryBureaucracy>(bPath);
    if (b) {
      const ids = new Set<string>();
      for (const it of b.items ?? []) {
        if (ids.has(it.id)) errors.push(`${bPath}: duplicate id ${it.id}`);
        ids.add(it.id);
        if (!it.summary || !it.authority || !it.title || !it.title_it) errors.push(`${bPath} › ${it.id}: title/title_it/summary/authority required`);
        if (![...BUREAUCRACY_TOPICS, "other"].includes(it.topic as never)) errors.push(`${bPath} › ${it.id}: unknown topic ${it.topic}`);
        checkEligibility(`${bPath} › ${it.id}`, it.applies_to);
        checkSourced(bPath, it.id, it as never);
      }
      for (const t of BUREAUCRACY_TOPICS) {
        const its = (b.items ?? []).filter((i) => i.topic === t);
        const checked = (b.topics_checked ?? []).find((c) => c.key === t);
        if (!checked) warnings.push(`${country}: topic ${t} not listed in topics_checked`);
        row[t] = its.length === 0 ? (checked?.result === "none_found" ? "nessuno" : "mancante")
          : its.every((i) => i.status === "verified") ? "verified" : its.some((i) => i.status === "verified") ? "parziale" : "unverified";
      }
    }
  }

  const sPath = join(dir, "subsidies.json");
  if (!existsSync(sPath)) {
    warnings.push(`${country}: subsidies.json missing`);
    for (const c of SUBSIDY_CATEGORIES) row[`sub:${c}`] = "mancante";
  } else {
    const s = readJson<CountrySubsidies>(sPath);
    if (s) {
      const ids = new Set<string>();
      for (const it of s.items ?? []) {
        if (ids.has(it.id)) errors.push(`${sPath}: duplicate id ${it.id}`);
        ids.add(it.id);
        if (!it.name_local || !it.name_it || !it.authority || !it.description) errors.push(`${sPath} › ${it.id}: name_local/name_it/authority/description required`);
        if (![...SUBSIDY_CATEGORIES, "other"].includes(it.category as never)) errors.push(`${sPath} › ${it.id}: unknown category ${it.category}`);
        checkEligibility(`${sPath} › ${it.id}`, it.eligibility);
        checkSourced(sPath, it.id, it as never);
      }
      for (const c of SUBSIDY_CATEGORIES) {
        const its = (s.items ?? []).filter((i) => i.category === c);
        const checked = (s.categories_checked ?? []).find((x) => x.key === c);
        if (!checked) warnings.push(`${country}: category ${c} not listed in categories_checked`);
        row[`sub:${c}`] = its.length === 0 ? (checked?.result === "none_found" ? "nessuno" : "mancante")
          : its.every((i) => i.status === "verified") ? "verified" : its.some((i) => i.status === "verified") ? "parziale" : "unverified";
      }
    }
  }
}

// Cities: one file per distinct `city` string in the catalogue.
const cityCoverage: Record<string, string> = {};
const cities = [...new Map(universities.map((u) => [u.city, u.country])).entries()];
for (const [city, country] of cities) {
  if (onlyCountry && slugify(country) !== onlyCountry) continue;
  const path = join(ROOT, "cities", `${slugify(city)}.json`);
  if (!existsSync(path)) {
    cityCoverage[city] = "mancante";
    warnings.push(`city ${city}: file missing`);
    continue;
  }
  const c = readJson<CityFile>(path);
  if (!c) continue;
  for (const f of c.facts ?? []) {
    if (!CITY_FIELDS.includes(f.field)) errors.push(`${path}: unknown field ${f.field}`);
    if (!f.value || !f.source_name) errors.push(`${path} › ${f.field}: value and source_name required`);
    if (f.field === "social_life" && f.subjective !== true) errors.push(`${path} › social_life must be subjective: true`);
    checkSourced(path, f.field, f as never);
  }
  const have = new Set((c.facts ?? []).map((f) => f.field));
  const missingFields = CITY_FIELDS.filter((f) => !have.has(f));
  const v = (c.facts ?? []).filter((f) => f.status === "verified").length;
  cityCoverage[city] = `${v}/${CITY_FIELDS.length} verified` + (missingFields.length ? `, mancano: ${missingFields.join(",")}` : "");
}

// The index is regenerated once at the end of a research round, so a stale
// index is a warning by default and an error with --strict (CI / before commit).
if (!indexIsCurrent()) (args.includes("--strict") ? errors : warnings).push("data/knowledge/index.generated.ts is out of date: run npx tsx scripts/knowledge/build-index.ts");

// ── Report ────────────────────────────────────────────────────────────────
const unverified = records.filter((r) => r.status !== "verified");
const stale = records.filter((r) => isDate(r.verified_at) && ageDays(r.verified_at) > staleDays);

console.log(`\nRecords: ${records.length} · verified ${records.length - unverified.length} · unverified ${records.filter((r) => r.status === "unverified").length} · missing ${records.filter((r) => r.status === "missing").length}`);
console.log(`Stale (> ${staleDays} days): ${stale.length}`);
for (const r of stale) console.log(`  STALE ${r.verified_at}  ${r.file.replace(ROOT + "/", "")} › ${r.id}  ${r.source_url}`);
console.log(`Expired (valid_until in the past): ${expired.length}`);
for (const x of expired) console.log(`  EXPIRED ${x.replace(ROOT + "/", "")}`);
console.log(`\nNot verified (${unverified.length}):`);
for (const r of unverified) console.log(`  ${r.status.toUpperCase().padEnd(10)} ${r.file.replace(ROOT + "/", "")} › ${r.id}`);
if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const w of warnings) console.log("  " + w);
}
if (errors.length) {
  console.log(`\nERRORS (${errors.length}):`);
  for (const e of errors) console.log("  " + e);
}
if (mdOut) {
  const cols = [...BUREAUCRACY_TOPICS, ...SUBSIDY_CATEGORIES.map((c) => `sub:${c}`)];
  const lines = [
    `# Knowledge base coverage — ${today.toISOString().slice(0, 10)}`,
    "",
    "verified = every record verified · parziale = some verified · unverified = none verified · nessuno = searched, nothing exists/found · mancante = not researched or no file",
    "",
    "## Bureaucracy and subsidies",
    "",
    `| Country | ${cols.join(" | ")} |`,
    `|---|${cols.map(() => "---").join("|")}|`,
    ...Object.entries(coverage).map(([c, row]) => `| ${c} | ${cols.map((k) => row[k] ?? "").join(" | ")} |`),
    "",
    "## Cities",
    "",
    "| City | Coverage |",
    "|---|---|",
    ...Object.entries(cityCoverage).map(([c, v]) => `| ${c} | ${v} |`),
    "",
    `## Records not verified (${unverified.length})`,
    "",
    "| Status | File › record | Best source so far |",
    "|---|---|---|",
    ...unverified.map((r) => `| ${r.status} | ${r.file.replace(ROOT + "/", "")} › ${r.id} | ${r.source_url} |`),
    "",
  ];
  writeFileSync(mdOut, lines.join("\n"));
}
if (jsonOut) writeFileSync(jsonOut, JSON.stringify({ coverage, cityCoverage, unverified, stale, expired, warnings, errors }, null, 2));
process.exit(errors.length ? 1 : 0);

