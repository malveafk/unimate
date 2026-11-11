/**
 * Standing consistency check for the university catalogue.
 *
 *   npx tsx check-universities.ts
 *
 * Reads app/data/universities.ts (the source of truth) and reports anomalies
 * that can be found WITHOUT any external source, by comparing the catalogue
 * against itself. Every correction found this way so far came from one of
 * these four checks, so run it before spending time on web research.
 *
 * Exit code is 1 if anything is flagged, so it can gate a commit.
 */
import { universities } from "./app/data/universities";
import { getUniversityCosts } from "./utils/universityCosts";

let flags = 0;
const flag = (msg: string) => { flags++; console.log(`  FLAG  ${msg}`); };
const section = (t: string) => console.log(`\n${t}`);

/* 1. Integrity ------------------------------------------------------------ */
section("1. Integrity");
const ids = universities.map((u) => u.id);
const dupes = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
if (dupes.length) flag(`duplicate ids: ${dupes.join(", ")}`);
for (const u of universities) {
  if (!u.bachelors.length) flag(`${u.id}: no bachelors`);
  const c = getUniversityCosts(u);
  if (!c.tuition) flag(`${u.id}: tuition not derivable from "${u.tuition}"`);
  if (!c.living) flag(`${u.id}: livingCost not derivable from "${u.livingCost}"`);
}
console.log(`  ${universities.length} universities, ${universities.reduce((n, u) => n + u.bachelors.length, 0)} bachelors`);

/* 2. Same city must mean same living cost --------------------------------- */
section("2. Same city, same living cost");
const byCity = new Map<string, typeof universities>();
for (const u of universities) {
  const k = `${u.city}|${u.country}`;
  byCity.set(k, [...(byCity.get(k) ?? []), u]);
}
let cityIssues = 0;
for (const [k, g] of byCity) {
  if (g.length < 2) continue;
  if (new Set(g.map((u) => u.livingCost)).size > 1) {
    cityIssues++;
    flag(`${k.split("|")[0]}: ${g.map((u) => `${u.id}="${u.livingCost}"`).join(" vs ")}`);
  }
}
if (!cityIssues) console.log("  no divergence");

/* 3. Academic-year drift -------------------------------------------------- */
// A short hyphen year ("2026-27") labels the year a figure was verified for.
// A price range uses an en dash, so the two never collide.
section("3. Academic-year labels");
const yearOf = (t: string) => t.match(/\b(20\d\d)-(\d\d)\b/)?.[0] ?? null;
const byCountry = new Map<string, typeof universities>();
for (const u of universities) byCountry.set(u.country, [...(byCountry.get(u.country) ?? []), u]);
const dist = new Map<string, number>();
for (const u of universities) {
  const y = yearOf(u.tuition);
  if (!y) flag(`${u.id}: tuition has no academic-year label`);
  else dist.set(y, (dist.get(y) ?? 0) + 1);
}
console.log("  " + [...dist.entries()].sort().map(([y, n]) => `${y}: ${n}`).join("  |  "));
// Intra-country drift is the actionable case: fees are set per country or
// region, so one university lagging behind its peers is almost always stale.
for (const [country, g] of byCountry) {
  const years = g.map((u) => yearOf(u.tuition)).filter(Boolean) as string[];
  if (years.length < 2) continue;
  const newest = years.sort().at(-1)!;
  const behind = g.filter((u) => yearOf(u.tuition) && yearOf(u.tuition)! < newest);
  if (behind.length) flag(`${country}: newest label is ${newest}, behind: ${behind.map((u) => `${u.id} (${yearOf(u.tuition)})`).join(", ")}`);
}

/* 4. Tuition spread inside a country ------------------------------------- */
// Fees are set nationally or regionally, so a wide spread is either a
// public/private mix (fine) or an error (not fine). Prints for eyeballing.
section("4. Tuition spread by country (ratio > 3x listed)");
let spreads = 0;
for (const [country, g] of byCountry) {
  if (g.length < 3) continue;
  const vals = g.map((u) => ({ id: u.id, n: getUniversityCosts(u).tuition?.max ?? 0 })).filter((x) => x.n > 0);
  if (vals.length < 2) continue;
  const lo = Math.min(...vals.map((v) => v.n)), hi = Math.max(...vals.map((v) => v.n));
  if (hi / lo > 3) {
    spreads++;
    console.log(`  ${country}: ${lo} -> ${hi}`);
    for (const v of vals.sort((a, b) => a.n - b.n)) console.log(`      ${String(v.n).padStart(6)}  ${v.id}`);
  }
}
if (!spreads) console.log("  none");

section(flags ? `${flags} flag(s)` : "No flags.");
process.exit(flags ? 1 : 0);
