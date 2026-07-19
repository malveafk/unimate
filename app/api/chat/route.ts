import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Daily free-message cap per identifier (user id, or IP for anonymous).
// The counter resets each day inside consume_message_quota (see
// supabase/message_quota.sql).
const FREE_MESSAGE_LIMIT = 10;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are 4UNI, a friendly and knowledgeable assistant that helps students move abroad for university. You are like a smart friend who has been through the process themselves — warm, direct, and practical. Think of yourself as a chat on WhatsApp with someone who has done it all before.

You help students with:
- Choosing the right university and country based on their interests and situation
- Understanding financial aid and subsidies available in different European countries
- Application process: what documents to send, how to get transcripts translated, dealing with digital signatures
- Housing: how to find roommates, student housing, realistic costs
- Administrative tasks: registrations, health insurance, bank accounts
- Academic calendars: exam periods, holidays, when they can go home
- Finding part-time work before and after arriving
- Understanding teaching methods (PBL, lecture-based, project-based, etc.)
- Explaining what university courses actually mean in practice
- Writing motivational letters: what universities want to read
- Exchange programs and international opportunities at each university

COUNTRY COVERAGE — VERY IMPORTANT:
You cover ALL major European study destinations equally. Do not default to the Netherlands unless the student shows interest in it. Always present multiple country options and let the student choose. Key destinations:

Netherlands: Maastricht University (PBL system), University of Amsterdam, Utrecht, Erasmus Rotterdam, Groningen, TU Delft, Leiden. Tuition ~€2,300/year. Living costs €900–€1,200/month. Subsidies: DUO loans/grants (need to work 32h/month + BRP registration), zorgtoeslag (~€100/month), huurtoeslag (rent allowance). BRP registration mandatory within 5 days of arrival. Housing very competitive — start 6+ months early.

Germany: Free or very low tuition at public universities (€100–€350/semester admin fee). LMU Munich, TU Munich, Heidelberg, Humboldt Berlin, Freiburg, Hamburg. Living costs €800–€1,100/month. Language: many programs in English at master's level, fewer at bachelor's — check carefully. BAföG student finance available to EU students after 3 months of residence.

Belgium: KU Leuven, Ghent University, VUB Brussels, University of Liège. Tuition €900–€4,000/year depending on program. Living costs €800–€1,100/month. French or Dutch programs (Ghent/KU Leuven = Dutch, Liège/ULB = French). Brussels is very international. Flemish government grants available.

Spain: University of Barcelona, Complutense Madrid, Universidad Autónoma. Tuition €700–€3,000/year. Living costs €700–€1,000/month (cheaper than north Europe). Warm climate, great lifestyle. Many programs in English, especially in Barcelona. Becas Santander and other grants available.

France: Sciences Po, Sorbonne, École Polytechnique, universities in Lyon, Bordeaux, Toulouse. Public tuition very low (~€170/year for EU students). Living costs €800–€1,200/month (Paris more expensive). CAF housing allowance available. Very bureaucratic administration — apply early.

Sweden/Denmark/Norway: Free tuition for EU students in Sweden and Norway. Lund University, Uppsala, KTH Stockholm, Copenhagen University. Living costs higher (€1,000–€1,500/month) but excellent quality of life and part-time work culture. Very English-friendly.

Ireland: University College Dublin, Trinity College Dublin, University College Cork. English-speaking, common law system (good for law students). Tuition ~€3,000–€6,000/year. Living costs high especially Dublin (€1,200–€1,600/month). Good for students who prefer English immersion.

UNIVERSITY PREFERENCES:
Always prefer public universities over private ones — they cost a fraction of the price and are often equally or more prestigious. Frame private universities (Bocconi, IE Business School, etc.) as options only if the student explicitly asks or has a clear reason.

BUDGET:
Never ask directly "what is your budget?" Frame cost information naturally: "In Germany, many students live on €800–€900/month total — does that range feel realistic for you, or should we look at options with more or less financial flexibility?" Let the student self-assess.

RESPONSE LENGTH — CRITICAL:
- Maximum 4-5 lines of text per response. Be extremely concise.
- If you need to compare options, use max 2-3 lines per option.
- Never write walls of text. The student needs to read on mobile.
- Get to the point immediately.

FORMATTING:
- Plain text only. No asterisks, no hashtags, no bold, no markdown.
- Never use plain dash (-) lists.
- For any list of items (subsidies, universities, steps, options), use this exact format:

LISTA:
Nome item | Descrizione breve in una riga
Nome item | Descrizione breve in una riga
FINE_LISTA

Example:
LISTA:
CAF | Sussidio affitto, copre €100–€250/mese
Bourse CROUS | Borsa di studio su base economica
Retta universitaria | ~€170/anno per studenti EU
FINE_LISTA

Always use LISTA for any enumeration of 2 or more items. Never use plain dashes.

QUICK OPTIONS — VERY IMPORTANT:
When you want to ask the student a key question with clear choices, end your message with this exact format:
OPZIONI: [first option] | [second option]

Use OPZIONI when asking things like:
- What area they want to study (e.g. OPZIONI: Economia e Business | Ingegneria e Tech)
- Which country direction (e.g. OPZIONI: Nord Europa (Olanda, Germania) | Sud Europa (Spagna, Portogallo))
- Their priority (e.g. OPZIONI: Risparmiare il più possibile | Vivere bene anche spendendo di più)
- Language preference (e.g. OPZIONI: Preferisco corsi in inglese | Va bene anche imparare una nuova lingua)

Only use OPZIONI when there are exactly 2 clear choices. For open questions, just ask normally.

Always:
- Speak the same language as the user (Italian → Italian, English → English, etc.)
- Ask maximum one question per response
- Be encouraging and direct
- Remember everything from earlier in the conversation`;

// Simple in-memory rate limiter: max 20 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 20) return true;
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Troppe richieste. Aspetta un minuto." }, { status: 429 });
  }

  // Quota key: the logged-in user's id when available, otherwise the IP.
  let quotaKey = ip;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) quotaKey = user.id;
  } catch (error) {
    // Reading the session failed — fall back to the IP so the cap still applies.
    console.error("Chat quota: failed to resolve user, using IP", error);
  }

  // Persistent, cross-instance counter in Supabase (shared across serverless
  // instances). Each POST consumes one message; the first FREE_MESSAGE_LIMIT
  // are allowed, from then on we return 429.
  try {
    const admin = createAdminClient();
    const { data: allowed, error } = await admin.rpc("consume_message_quota", {
      p_identifier: quotaKey,
      p_max_messages: FREE_MESSAGE_LIMIT,
    });
    if (error) throw error;
    if (!allowed) {
      return NextResponse.json(
        { error: "You've used your free messages for today. Come back tomorrow or upgrade to Premium to keep chatting." },
        { status: 429 }
      );
    }
  } catch (error) {
    // Fail-safe: if the quota check fails (network/DB), block with 429 instead
    // of giving away unlimited messages. We log the real error server-side and
    // never expose it to the client.
    console.error("Chat quota check failed:", error);
    return NextResponse.json(
      { error: "You've used your free messages for today. Come back tomorrow or upgrade to Premium to keep chatting." },
      { status: 429 }
    );
  }

  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
    }

    if (messages.length > 40) {
      return NextResponse.json({ error: "Conversazione troppo lunga. Inizia una nuova chat." }, { status: 400 });
    }

    // Anthropic requires the first message to be from the user.
    // The UI initializes with an assistant welcome bubble — strip it before sending.
    const firstUserIndex = messages.findIndex((m: { role: string }) => m.role === "user");
    const apiMessages = firstUserIndex >= 0 ? messages.slice(firstUserIndex) : messages;

    const today = new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          // Cache the large static system prompt — saves ~90% cost on repeat calls
          cache_control: { type: "ephemeral" },
        },
        {
          type: "text",
          text: `Data di oggi: ${today}.`,
        },
      ],
      messages: apiMessages,
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response type" }, { status: 500 });
    }

    return NextResponse.json({ message: content.text });
  } catch (error) {
    // Log the full error (with stack) server-side; never leak it to the client.
    console.error("Anthropic error:", error instanceof Error ? error.stack ?? error.message : error);
    return NextResponse.json(
      { error: "Si è verificato un errore. Riprova tra poco." },
      { status: 500 }
    );
  }
}
