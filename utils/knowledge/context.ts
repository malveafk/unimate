/**
 * Turns the knowledge base into the text the chatbot reads.
 *
 * Two layers:
 *  - globalIndex(): one compact line per country (cities, universities,
 *    which subsidies and topics exist). Identical on every request, so it
 *    lives in the cached part of the system prompt and lets the bot compare
 *    countries even when the student names none.
 *  - buildContext(route): the full records for the countries, cities and
 *    universities the router detected, filtered by topic.
 *
 * University data is read from app/data/universities.ts and
 * app/data/universityMeta.ts — the same files seed.ts copies to Supabase —
 * so nothing is duplicated.
 */
import { universities, type University } from "@/app/data/universities";
import { universityMeta as rawMeta, type UniversityMeta } from "@/app/data/universityMeta";
import { bureaucracyBySlug, subsidiesBySlug, citiesBySlug } from "@/data/knowledge/index.generated";
import type { BureaucracyItem, Eligibility, Subsidy, CityFact, CheckedEntry } from "./types";
import { slugify } from "./slug";
import type { Route, Topic } from "./router";

// checkedOn / diplomaLink (meta) and nameEn (courses) are newer catalogue
// fields: optional here so this file works on both versions of the data.
type Meta = UniversityMeta & { checkedOn?: string; diplomaLink?: string };
const universityMeta = rawMeta as Record<string, Meta>;
const checked = (m: Meta) => (m.checkedOn ? ` · checked ${m.checkedOn}` : "");

const has = (topics: Topic[], t: Topic) => topics.length === 0 || topics.includes(t);
const clip = (s: string | null | undefined, n: number) => (!s ? "" : s.length > n ? s.slice(0, n - 1) + "…" : s);

function who(e: Eligibility): string {
  const parts: string[] = [];
  parts.push(`student=${e.student_type === "any" ? "any" : e.student_type.join("/")}`);
  parts.push(`nationality=${e.nationality === "any" ? "any" : e.nationality.join("/")}`);
  if (e.age && (e.age.min != null || e.age.max != null)) parts.push(`age=${e.age.min ?? ""}-${e.age.max ?? ""}`);
  if (e.min_work_hours) parts.push(`work=${e.min_work_hours}`);
  if (e.income_test) parts.push(`income=${e.income_test}`);
  if (e.stay_duration) parts.push(`stay=${e.stay_duration}`);
  if (e.residence_requirement) parts.push(`residence=${e.residence_requirement}`);
  for (const o of e.other ?? []) parts.push(o);
  return parts.join("; ");
}

function provenance(r: { status: string; verified_at: string; valid_until?: string; source_url: string; interpretations?: { hypothesis: string; source_url: string }[]; notes?: string }): string {
  const lines = [`  status: ${r.status} · checked ${r.verified_at}${r.valid_until ? ` · VALID UNTIL ${r.valid_until}` : ""} · source: ${r.source_url}`];
  for (const i of r.interpretations ?? []) lines.push(`  ALTERNATIVE READING: ${i.hypothesis} (source: ${i.source_url})`);
  if (r.notes) lines.push(`  note: ${clip(r.notes, 300)}`);
  return lines.join("\n");
}

function renderBureaucracy(it: BureaucracyItem): string {
  const lines = [`[${it.id}] ${it.title} | IT: ${it.title_it} — ${it.authority}`, `  who: ${who(it.applies_to)}`, `  ${it.summary}`];
  if (it.steps?.length) lines.push(`  steps: ${it.steps.join(" → ")}`);
  if (it.deadline) lines.push(`  deadline: ${it.deadline}`);
  if (it.cost) lines.push(`  cost: ${it.cost}`);
  lines.push(provenance(it));
  return lines.join("\n");
}

function renderSubsidy(it: Subsidy): string {
  const lines = [
    `[${it.id}] ${it.name_local} | IT: ${it.name_it} (${it.category}) — ${it.authority}`,
    `  who: ${who(it.eligibility)}`,
    `  ${it.description}`,
  ];
  if (it.amount) lines.push(`  amount: ${it.amount}`);
  if (it.how_to_apply) lines.push(`  apply: ${it.how_to_apply}`);
  if (it.deadline) lines.push(`  deadline: ${it.deadline}`);
  if (it.stackable) lines.push(`  stackable: ${it.stackable}`);
  lines.push(provenance(it));
  return lines.join("\n");
}

function renderCityFact(f: CityFact): string {
  return `- ${f.field}${f.subjective ? " (SUBJECTIVE)" : ""}: ${f.value} — ${f.source_name}\n${provenance(f)}`;
}

function checkedSummary<C extends string>(entries: CheckedEntry<C>[] | undefined): string {
  const none = (entries ?? []).filter((e) => e.result === "none_found").map((e) => e.key);
  const notDone = (entries ?? []).filter((e) => e.result === "not_researched").map((e) => e.key);
  const out: string[] = [];
  if (none.length) out.push(`searched, nothing found: ${none.join(", ")}`);
  if (notDone.length) out.push(`NOT researched yet: ${notDone.join(", ")}`);
  return out.join(" · ");
}

function renderUniversityShort(u: University): string {
  const m = universityMeta[u.id];
  const bach = u.bachelors.map((b) => `${b.name} (${b.language}, ${b.duration})`).join("; ");
  return [
    `- ${u.name} [${u.id}] (${u.city}) · tuition: ${u.tuition} · living: ${u.livingCost} · teaching: ${u.teaching} · languages: ${u.languages.join("/")}`,
    m ? `  deadline: ${m.applicationDeadline}${m.applicationPlatform ? ` via ${m.applicationPlatform}` : ""} · scholarship for EU applicants verified: ${m.scholarships ? "yes" : "no"}${checked(m)}` : "  deadline: not in catalogue",
    `  website: ${u.website}${m?.applicationLink ? ` · apply: ${m.applicationLink}` : ""}`,
    `  bachelors: ${bach || "none listed"}`,
  ].join("\n");
}

function renderUniversityFull(u: University): string {
  const m = universityMeta[u.id];
  const lines = [
    `### ${u.name} [${u.id}] — ${u.city}, ${u.country}`,
    `tuition: ${u.tuition} · living: ${u.livingCost} · teaching: ${u.teaching} · languages: ${u.languages.join("/")}${u.ranking ? ` · ranking: ${u.ranking}` : ""}`,
    `strengths: ${u.strengths.join(", ")}`,
    `about: ${u.description}`,
    `website: ${u.website}`,
  ];
  if (m) {
    lines.push(
      `deadline: ${m.applicationDeadline}${m.applicationPlatform ? ` · platform: ${m.applicationPlatform}` : ""} · scholarship for EU applicants verified: ${m.scholarships ? "yes" : "no"}${checked(m)}`,
      `requirements:\n${m.requirements.map((r) => `  · ${r}`).join("\n")}`,
    );
    if (m.diplomaLink) lines.push(`requirements by country of diploma: ${m.diplomaLink}`);
    if (m.applicationLink) lines.push(`apply: ${m.applicationLink}`);
  }
  for (const b of u.bachelors) {
    lines.push(`- Bachelor: ${b.name} (${b.language}, ${b.duration}): ${clip(b.description, 600)}`);
    const byYear = new Map<number | undefined, string[]>();
    for (const c of b.courses as { name: string; nameEn?: string; year?: number }[]) byYear.set(c.year, [...(byYear.get(c.year) ?? []), c.nameEn ? `${c.name} (${c.nameEn})` : c.name]);
    for (const [y, names] of byYear) lines.push(`  courses${y ? ` year ${y}` : ""}: ${clip(names.join("; "), 700)}`);
  }
  return lines.join("\n");
}

const catalogueCountries = [...new Set(universities.map((u) => u.country))];

/** Stable, compact overview of every country. Cached with the system prompt. */
export function globalIndex(): string {
  const out = ["# COUNTRY INDEX (overview — the full records are injected only for the countries in the conversation)"];
  for (const c of catalogueCountries) {
    const slug = slugify(c);
    const unis = universities.filter((u) => u.country === c);
    const cities = [...new Set(unis.map((u) => u.city))];
    const subs = subsidiesBySlug[slug];
    const bur = bureaucracyBySlug[slug];
    const subNames = subs ? subs.items.map((s) => `${s.name_local}${s.status === "verified" ? "" : ` [${s.status}]`}`).join(", ") : "not researched yet";
    out.push(
      `## ${c}: ${unis.length} universities in ${cities.join(", ")}.`,
      `  universities: ${unis.map((u) => u.name).join("; ")}`,
      `  subsidies on file: ${clip(subNames, 600)}`,
      `  bureaucracy on file: ${bur ? `${bur.items.length} records` : "not researched yet"}`,
    );
  }
  return out.join("\n");
}

export type ContextStats = { countries: string[]; cities: string[]; universities: string[]; topics: Topic[]; chars: number };

export function buildContext(route: Route): { text: string; stats: ContextStats } {
  const parts: string[] = [];
  const { topics } = route;

  for (const country of route.countries) {
    const slug = slugify(country);
    parts.push(`# ${country.toUpperCase()}`);

    if (has(topics, "bureaucracy")) {
      const b = bureaucracyBySlug[slug];
      if (!b) parts.push("## Bureaucracy: NOT IN THE KNOWLEDGE BASE YET — say you don't have it and point to the official government portal.");
      else {
        parts.push(`## Bureaucracy (${b.country})`);
        const cs = checkedSummary(b.topics_checked);
        if (cs) parts.push(cs);
        parts.push(...b.items.map(renderBureaucracy));
      }
    }
    if (has(topics, "subsidies") || has(topics, "bureaucracy")) {
      // Work questions often hinge on subsidies tied to working hours (DUO), and
      // subsidy questions on residence rules, so these two travel together.
      const s = subsidiesBySlug[slug];
      if (!s) parts.push("## Subsidies: NOT IN THE KNOWLEDGE BASE YET — say you don't have them and point to the official portal.");
      else {
        parts.push(`## Subsidies (${s.country})`);
        const cs = checkedSummary(s.categories_checked);
        if (cs) parts.push(cs);
        parts.push(...s.items.map(renderSubsidy));
      }
    }
    if (has(topics, "universities") || has(topics, "city")) {
      const unis = universities.filter((u) => u.country === country && !route.universityIds.includes(u.id));
      if (unis.length) parts.push(`## Universities in ${country} (4UNI catalogue)`, ...unis.map(renderUniversityShort));
    }
  }

  for (const id of route.universityIds) {
    const u = universities.find((x) => x.id === id);
    if (u) parts.push(`# UNIVERSITY IN FOCUS (4UNI catalogue)`, renderUniversityFull(u));
  }

  for (const city of route.cities) {
    const file = citiesBySlug[slugify(city)];
    parts.push(`# CITY: ${city}`);
    if (!file) parts.push("Not in the knowledge base yet — say so; use only the living-cost range on the university record if one exists.");
    else parts.push(...file.facts.map(renderCityFact));
  }

  const text = parts.join("\n");
  return {
    text,
    stats: { countries: route.countries, cities: route.cities, universities: route.universityIds, topics, chars: text.length },
  };
}
