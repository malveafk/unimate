# 4UNI chatbot knowledge base

The two chatbots (`/chat` + `/hub`, and the application assistant on
`/universities/[id]/apply`) answer only from these files plus the university
catalogue (`app/data/universities.ts`, `app/data/universityMeta.ts`).

```
data/knowledge/
  <country-slug>/bureaucracy.json   residence, registration, tax ID, insurance, bank, transport card, work rules, minimum wage
  <country-slug>/subsidies.json     grants/loans, rent, health insurance, transport, tax, student work, Erasmus+, regional, university
  cities/<city-slug>.json           rent, living cost, transport pass, climate, social life, language, job market, student wage
  index.generated.ts                static list of the files above (generated)
  RESEARCH_BRIEF.md                 the rules every researcher (human or agent) follows
  reports/                          test reports
```

Schema: `utils/knowledge/types.ts`. Every record carries `source_url`,
`verified_at` (YYYY-MM-DD) and `status` (`verified` / `unverified` / `missing`);
eligibility (exchange vs degree, EU/EEA vs Swiss vs non-EU, age, work hours,
income, stay, residence) is explicit on every bureaucracy and subsidy record.

## How the chatbot uses it

`utils/knowledge/router.ts` finds the countries, cities and universities named
in the last six user messages (also in Italian and local spellings) and the
topic of the latest one. `utils/knowledge/context.ts` injects those records,
plus a compact index of all countries that is always present. The prompt
(`utils/knowledge/prompts.ts`) forbids facts that are not in the injected text
and requires authority + link + check date on every bureaucracy/subsidy fact.

## Periodic update — every 3 months (records go stale after 6)

1. List what needs work:
   ```bash
   npx tsx scripts/knowledge/validate.ts --stale-days 182
   ```
   It prints every record older than 6 months (`STALE`), every `unverified` /
   `missing` record, every category marked `not_researched`, and any missing city file
   (new universities in the catalogue add new cities automatically).
2. For each country to refresh, give a researcher (or a Claude agent) the
   brief and the country:
   > Read data/knowledge/RESEARCH_BRIEF.md and utils/knowledge/types.ts. Re-check
   > every record in data/knowledge/<slug>/ whose verified_at is older than 6 months
   > or whose status is not verified; update values, source_url and verified_at.
   > Then do discovery again for new measures in every category.
3. Regenerate the index and validate strictly:
   ```bash
   npx tsx scripts/knowledge/build-index.ts
   npx tsx scripts/knowledge/validate.ts --strict
   ```
4. Run the tests (the first command is free, the second calls the API —
   about 110 calls):
   ```bash
   npx tsx scripts/knowledge/run-tests.ts --route-only
   npx tsx scripts/knowledge/run-tests.ts
   ```
   Read the FAIL cases in `data/knowledge/reports/test-report-<date>.md`.
5. Commit the JSON files, the index and the report together.

Event-driven updates (do not wait for the quarterly round): a new academic
year (amounts for grants and minimum wages usually change on 1 January or at
the start of the academic year), a news item in `app/data/news.ts` about a
subsidy or permit, or a student reporting a wrong answer.
