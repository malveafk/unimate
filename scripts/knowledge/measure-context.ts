/**
 * Measures the prompt size the chat route sends for every catalogue country
 * (one broad question and one subsidies-only question each), and calibrates
 * characters to tokens with the free count_tokens endpoint.
 *
 *   npx tsx scripts/knowledge/measure-context.ts
 */
import { join } from "node:path";
import { config } from "dotenv"; config({ path: join(__dirname, "../../.env.local") });
import Anthropic from "@anthropic-ai/sdk";
import { universities } from "../../app/data/universities";
import { assembleSystem } from "../../utils/knowledge/chat";
import { globalIndex } from "../../utils/knowledge/context";
const countries=[...new Set(universities.map(u=>u.country))];
const client=new Anthropic();
(async()=>{
  const rows: { c: string; label: string; kbChars: number; totalChars: number }[] = [];
  for (const c of countries) {
    const city=universities.find(u=>u.country===c)!.city;
    for (const [label,q] of [["all topics",`Tell me about studying in ${city}, ${c}`],["subsidies only",`Which subsidies or grants can I get in ${c}?`]] as const) {
      const {system,stats}=assembleSystem({messages:[{role:"user",content:q}]});
      const chars=system.reduce((s,b)=>s+b.text.length,0);
      rows.push({c,label,kbChars:stats.chars,totalChars:chars});
    }
  }
  // calibrate chars->tokens with count_tokens on 3 samples
  for (const q of ["Tell me about studying in Munich, Germany","Which subsidies or grants can I get in Netherlands?","ciao"]) {
    const {system}=assembleSystem({messages:[{role:"user",content:q}]});
    const n=await client.messages.countTokens({model:"claude-sonnet-4-6",system,messages:[{role:"user",content:q}]});
    const chars=system.reduce((s,b)=>s+b.text.length,0);
    console.log("CAL",q,"tokens",n.input_tokens,"chars",chars,"chars/token",(chars/n.input_tokens).toFixed(2));
  }
  console.log("global index chars", globalIndex().length);
  rows.sort((a,b)=>b.totalChars-a.totalChars);
  for (const r of rows) console.log(r.c.padEnd(16), r.label.padEnd(15), String(r.kbChars).padStart(7), String(r.totalChars).padStart(7));
})();
