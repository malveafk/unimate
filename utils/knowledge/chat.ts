/**
 * One chatbot turn: route the conversation, assemble the prompt from the
 * knowledge base, call Claude. Shared by app/api/chat/route.ts and by the test
 * runner (scripts/knowledge/run-tests.ts), so the tests exercise exactly what
 * production does — minus the HTTP layer and the quota.
 *
 * Server-only: it reads ANTHROPIC_API_KEY and is imported only by the API
 * route and Node scripts, never by a client component.
 */
import Anthropic from "@anthropic-ai/sdk";
import { routeConversation, getUniversityById, type ChatTurn, type Route } from "./router";
import { buildContext, globalIndex, type ContextStats } from "./context";
import { systemPrompt, type ChatMode, type ChatFormat } from "./prompts";

export const CHAT_MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 1024;
const MAX_CHARS_PER_MESSAGE = 4000;

let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }));

export type ChatRequest = {
  messages: ChatTurn[];
  mode?: ChatMode;
  format?: ChatFormat;
  /** Apply mode: the university the student is applying to (validated against the catalogue). */
  universityId?: string;
};

export type ChatResult = {
  text: string;
  route: Route;
  stats: ContextStats;
  usage: { input: number; cacheRead: number; cacheWrite: number; output: number };
  latencyMs: number;
};

/** Keeps only well-formed user/assistant text turns, starting from the first user turn. */
export function sanitizeMessages(raw: unknown): ChatTurn[] {
  if (!Array.isArray(raw)) return [];
  const turns = raw
    .filter((m): m is ChatTurn => !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim() !== "")
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS_PER_MESSAGE) }));
  const first = turns.findIndex((m) => m.role === "user");
  return first >= 0 ? turns.slice(first) : [];
}

export function assembleSystem(req: ChatRequest): { system: Anthropic.TextBlockParam[]; route: Route; stats: ContextStats } {
  const mode: ChatMode = req.mode === "apply" && req.universityId && getUniversityById(req.universityId) ? "apply" : "general";
  const pinned = mode === "apply" ? req.universityId : undefined;
  const route = routeConversation(req.messages, pinned);
  const { text, stats } = buildContext(route);

  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const system: Anthropic.TextBlockParam[] = [
    { type: "text", text: systemPrompt(mode, req.format === "plain" ? "plain" : "rich") },
    // Breakpoint 1: role + rules + country index are identical on every request.
    { type: "text", text: `<knowledge_base>\n${globalIndex()}\n</knowledge_base>`, cache_control: { type: "ephemeral" } },
  ];
  if (text) {
    // Breakpoint 2: the records for this conversation's countries/cities; stable
    // across the turns of one conversation, so later turns read it from cache.
    system.push({ type: "text", text: `<knowledge_base>\n${text}\n</knowledge_base>`, cache_control: { type: "ephemeral" } });
  } else {
    system.push({ type: "text", text: "No specific country, city or university was detected yet: use the country index, and ask where the student wants to go if it matters." });
  }
  system.push({ type: "text", text: `Today's date: ${today}.` });
  return { system, route, stats };
}

export async function answer(req: ChatRequest): Promise<ChatResult> {
  const started = Date.now();
  const { system, route, stats } = assembleSystem(req);
  const response = await getClient().messages.create({
    model: CHAT_MODEL,
    max_tokens: MAX_TOKENS,
    system,
    messages: req.messages,
  });
  const text = response.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map((b) => b.text).join("\n").trim();
  return {
    text,
    route,
    stats,
    usage: {
      input: response.usage.input_tokens,
      cacheRead: response.usage.cache_read_input_tokens ?? 0,
      cacheWrite: response.usage.cache_creation_input_tokens ?? 0,
      output: response.usage.output_tokens,
    },
    latencyMs: Date.now() - started,
  };
}
