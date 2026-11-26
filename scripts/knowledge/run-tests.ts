/**
 * Runs the chatbot test set (scripts/knowledge/test-cases.ts) against the real
 * model through the same answer() the API route uses, checks each reply, and
 * writes a Markdown report.
 *
 *   npx tsx scripts/knowledge/run-tests.ts               # all cases (costs money: one API call per turn)
 *   npx tsx scripts/knowledge/run-tests.ts --route-only  # free: checks only the router (no API calls)
 *   npx tsx scripts/knowledge/run-tests.ts --only trap-,clarify-   # cases whose id starts with these prefixes
 *
 * Needs ANTHROPIC_API_KEY (read from .env.local). Report:
 * data/knowledge/reports/test-report-<YYYY-MM-DD>.md
 *
 * The checks are deterministic proxies (does the reply cite the expected
 * official domain, ask a question, admit it does not know…). They catch
 * regressions; the "expected" column is for a human to read the replies against.
 */
import { config } from "dotenv";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { answer, CHAT_MODEL, type ChatResult } from "../../utils/knowledge/chat";
import { routeConversation, type ChatTurn } from "../../utils/knowledge/router";
import { cases, type TestCase } from "./test-cases";

config({ path: join(__dirname, "../../.env.local") });

const args = process.argv.slice(2);
const routeOnly = args.includes("--route-only");
// --only takes one or more comma-separated id prefixes: --only trap-,clarify-
const only = args.includes("--only") ? args[args.indexOf("--only") + 1].split(",") : undefined;

// Claude Sonnet 4.6 list prices, USD per million tokens (check before relying on them).
const PRICE = { input: 3, cacheWrite: 3.75, cacheRead: 0.3, output: 15 };

const DONT_KNOW = /non (ho|dispongo|trovo|abbiamo|posso confermare|è presente|sono presenti|risulta)|non (lo )?so\b|nessun[ao]? (informazion|dato|record)|non (è|sono) (nella|nel|nei|tra)|non (ho|abbiamo) (dati|informazioni)|don'?t have|do not have|not (in|part of) (my|the|our)|no (information|data|record)|i don'?t know|not available|not covered|non (è|sono) coperto|non copr/i;
const SOURCE_LINE = /https?:\/\/\S+/;
const DATE_LIKE = /(20\d\d-\d\d-\d\d|\d{1,2}[/.]\d{1,2}[/.]20\d\d|\d{1,2} (gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic|jan|may|jun|jul|aug|sep|oct|dec)[a-z]* 20\d\d)/i;
const DISCLAIMER = /consulenza|legal|tax|fiscal|non costituisce|not (legal|tax)|cambia|change|conferma|confirm|verifica con|check with/i;
const ITALIAN = /\b(il|lo|la|gli|le|per|che|di|una|sono|non|puoi|devi)\b/gi;
const ENGLISH = /\b(the|you|your|and|for|with|can|need|is|are)\b/gi;

type Check = { name: string; ok: boolean; detail?: string };

function langScore(text: string, re: RegExp) {
  return (text.match(re) ?? []).length;
}

function checkReply(tc: TestCase, r: ChatResult): Check[] {
  const t = r.text;
  const out: Check[] = [];
  const e = tc.expect;
  if (e.countries) {
    const missing = e.countries.filter((c) => !r.route.countries.includes(c));
    out.push({ name: "router: countries", ok: missing.length === 0, detail: missing.length ? `missing ${missing.join(", ")} (got ${r.route.countries.join(", ") || "none"})` : undefined });
  }
  if (e.cities) {
    const missing = e.cities.filter((c) => !r.route.cities.includes(c));
    out.push({ name: "router: cities", ok: missing.length === 0, detail: missing.length ? `missing ${missing.join(", ")}` : undefined });
  }
  const asksQuestion = (/\?\s*(\n|$)|OPZIONI:/.test(t) || /\?[^?]*$/.test(t.slice(-250))) && (t.match(/\?/g) ?? []).length <= 2;
  if (e.clarify) out.push({ name: "asks one clarifying question", ok: asksQuestion });
  if (e.clarifyOk && asksQuestion && !SOURCE_LINE.test(t)) {
    // A legitimate clarifying question replaces the answer: skip the answer checks.
    out.push({ name: "asks one clarifying question (accepted instead of the answer)", ok: true });
    return out.filter((c) => c.name.startsWith("router") || c.name.startsWith("asks"));
  }
  if (e.dontKnow) out.push({ name: "says it does not know", ok: DONT_KNOW.test(t) });
  if (e.cites) {
    out.push({ name: "cites a link", ok: SOURCE_LINE.test(t) });
    out.push({ name: "cites a check date", ok: DATE_LIKE.test(t) });
  }
  for (const d of e.citeDomains ?? []) out.push({ name: `cites ${d}`, ok: t.toLowerCase().includes(d.toLowerCase()) });
  if (e.disclaimer) out.push({ name: "rules-change / not-legal-advice line", ok: DISCLAIMER.test(t) });
  for (const p of e.mustMatch ?? []) out.push({ name: `matches /${p}/`, ok: new RegExp(p, "i").test(t) });
  for (const p of e.mustNotMatch ?? []) out.push({ name: `does not match /${p}/`, ok: !new RegExp(p, "i").test(t) });
  if (e.language) {
    const it = langScore(t, ITALIAN), en = langScore(t, ENGLISH);
    out.push({ name: `answers in ${e.language}`, ok: e.language === "it" ? it > en : en > it, detail: `it=${it} en=${en}` });
  }
  return out;
}

function costUsd(u: ChatResult["usage"]) {
  return (u.input * PRICE.input + u.cacheWrite * PRICE.cacheWrite + u.cacheRead * PRICE.cacheRead + u.output * PRICE.output) / 1e6;
}

async function main() {
  const selected = cases.filter((c) => !only || only.some((p) => c.id.startsWith(p)));
  const rows: string[] = [];
  let passed = 0;
  let errored = 0;
  let aborted: string | null = null;
  const metrics: { chars: number; input: number; cacheRead: number; cacheWrite: number; output: number; latency: number; cost: number }[] = [];

  for (const tc of selected) {
    const history: ChatTurn[] = [];
    let last: ChatResult | null = null;
    let checks: Check[] = [];

    if (routeOnly) {
      const msgs: ChatTurn[] = tc.turns.map((content) => ({ role: "user", content }));
      const route = routeConversation(msgs, tc.universityId);
      const fake = { text: "", route, stats: { ...route, universities: route.universityIds, chars: 0 }, usage: { input: 0, cacheRead: 0, cacheWrite: 0, output: 0 }, latencyMs: 0 } as ChatResult;
      checks = checkReply({ ...tc, expect: { countries: tc.expect.countries, cities: tc.expect.cities } }, fake);
    } else {
      let apiError: string | null = null;
      try {
        for (const turn of tc.turns) {
          history.push({ role: "user", content: turn });
          last = await answer({ messages: [...history], mode: tc.mode, universityId: tc.universityId });
          history.push({ role: "assistant", content: last.text });
          metrics.push({ chars: last.stats.chars, ...last.usage, latency: last.latencyMs, cost: costUsd(last.usage) });
        }
      } catch (err) {
        apiError = err instanceof Error ? err.message : String(err);
      }
      if (apiError) {
        errored++;
        console.log(`ERROR ${tc.id}  → ${apiError.slice(0, 200)}`);
        rows.push(`### ERROR · ${tc.id} — ${tc.category}`, "", "```", apiError.slice(0, 500), "```", "");
        // Billing/auth problems will hit every remaining case: stop, but keep the report.
        if (/credit balance|authentication|api key/i.test(apiError)) {
          aborted = `stopped after ${tc.id}: ${apiError.slice(0, 160)}`;
          break;
        }
        continue;
      }
      checks = checkReply(tc, last!);
    }
    const ok = checks.every((c) => c.ok);
    if (ok) passed++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${tc.id}${ok ? "" : "  → " + checks.filter((c) => !c.ok).map((c) => c.name + (c.detail ? ` (${c.detail})` : "")).join("; ")}`);
    rows.push(
      `### ${ok ? "PASS" : "FAIL"} · ${tc.id} — ${tc.category}`,
      ...tc.turns.map((t, i) => `> **Turn ${i + 1}:** ${t}`),
      "",
      `**Expected:** ${tc.expected}`,
      "",
      routeOnly ? "" : `**Reply:**\n\n${(last?.text ?? "").split("\n").map((l) => "    " + l).join("\n")}`,
      "",
      `**Route:** countries=${(last?.route ?? routeConversation(tc.turns.map((c) => ({ role: "user" as const, content: c })), tc.universityId)).countries.join(", ") || "—"}`,
      "",
      ...checks.map((c) => `- [${c.ok ? "x" : " "}] ${c.name}${c.detail ? ` — ${c.detail}` : ""}`),
      "",
    );
  }

  const avg = (k: keyof (typeof metrics)[number]) => (metrics.length ? metrics.reduce((s, m) => s + m[k], 0) / metrics.length : 0);
  const p95 = (k: keyof (typeof metrics)[number]) => {
    const v = metrics.map((m) => m[k]).sort((a, b) => a - b);
    return v.length ? v[Math.min(v.length - 1, Math.floor(v.length * 0.95))] : 0;
  };
  const date = new Date().toISOString().slice(0, 10);
  const summary = [
    `# Chatbot test report — ${date}`,
    "",
    `Model: ${CHAT_MODEL} · cases: ${selected.length} · passed: ${passed} · failed: ${selected.length - passed - errored} · API errors: ${errored}${routeOnly ? " · ROUTER ONLY (no API calls)" : ""}`,
    aborted ? `\n**RUN INCOMPLETE — ${aborted}. Cases after it were not run.**` : "",
    "",
    metrics.length
      ? [
          "## Context size, cost and latency per request",
          "",
          "| | mean | p95 |",
          "|---|---|---|",
          `| injected KB (chars) | ${avg("chars").toFixed(0)} | ${p95("chars")} |`,
          `| input tokens, uncached | ${avg("input").toFixed(0)} | ${p95("input")} |`,
          `| cache write tokens | ${avg("cacheWrite").toFixed(0)} | ${p95("cacheWrite")} |`,
          `| cache read tokens | ${avg("cacheRead").toFixed(0)} | ${p95("cacheRead")} |`,
          `| output tokens | ${avg("output").toFixed(0)} | ${p95("output")} |`,
          `| latency (ms) | ${avg("latency").toFixed(0)} | ${p95("latency")} |`,
          `| cost (USD, list price) | ${avg("cost").toFixed(4)} | ${p95("cost").toFixed(4)} |`,
          "",
          `Total for this run: ${metrics.length} API calls, USD ${metrics.reduce((s, m) => s + m.cost, 0).toFixed(3)}.`,
          "",
        ].join("\n")
      : "",
    "## Cases",
    "",
  ];
  const dir = join(__dirname, "../../data/knowledge/reports");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `test-report-${date}${routeOnly ? "-router" : ""}.md`);
  writeFileSync(file, [...summary, ...rows].join("\n"));
  console.log(`\n${passed}/${selected.length} passed · report: ${file}`);
  process.exit(passed === selected.length ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
