/**
 * Deterministic router: finds which countries, cities, universities and topics
 * a conversation is about, so the chat route injects only those parts of the
 * knowledge base.
 *
 * Why not embeddings: the knowledge base is keyed (country / city / topic) and
 * students almost always name the place or the university. Keyword matching on
 * names taken from the catalogue is predictable, free and testable; questions
 * that name nothing still get the always-present country index.
 */
import { universities, type University } from "@/app/data/universities";
import { slugify } from "./slug";

export type Topic = "bureaucracy" | "subsidies" | "city" | "universities";

export type Route = {
  countries: string[]; // country names as in the catalogue, most recent first
  cities: string[]; // catalogue `city` strings
  universityIds: string[];
  topics: Topic[]; // empty = no specific topic detected → include everything
};

const MAX_COUNTRIES = 3;
const MAX_CITIES = 4;
const MAX_UNIS = 4;
/** How many recent user messages are scanned (latest weighs most). */
const LOOKBACK = 6;

/** Lowercase, strip accents, collapse punctuation — so "Zürich" matches "zurich". */
export function normalize(s: string): string {
  return ` ${s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()} `;
}

// Other names students use for each catalogue country (Italian, local, and
// the main European languages). The catalogue name itself is always included.
// Nationality adjectives ("Italian", "tedesco") are deliberately left out:
// "I am Italian" or "courses in German" say nothing about the destination.
const COUNTRY_ALIASES: Record<string, string[]> = {
  Netherlands: ["olanda", "paesi bassi", "nederland", "holland", "holanda", "pays bas", "niederlande"],
  Germany: ["germania", "deutschland", "alemania", "allemagne"],
  Spain: ["spagna", "espana", "espagne", "spanien"],
  France: ["francia", "frankreich"],
  Italy: ["italia", "italien", "italie"],
  Portugal: ["portogallo"],
  Switzerland: ["svizzera", "schweiz", "suisse", "suiza"],
  Belgium: ["belgio", "belgie", "belgique", "belgien", "belgica"],
  Austria: ["osterreich", "oesterreich", "autriche"],
  Denmark: ["danimarca", "danmark", "dinamarca", "danemark"],
  Sweden: ["svezia", "sverige", "suecia", "suede", "schweden"],
  Norway: ["norvegia", "norge", "noruega", "norvege", "norwegen"],
  "United Kingdom": ["uk", "regno unito", "gran bretagna", "inghilterra", "england", "scotland", "scozia", "wales", "galles", "northern ireland", "britain", "reino unido", "royaume uni"],
  Ireland: ["irlanda", "eire", "irland", "irlande"],
  Finland: ["finlandia", "suomi", "finnland", "finlande"],
  "Czech Republic": ["repubblica ceca", "cechia", "czechia", "cesko", "tschechien"],
  Luxembourg: ["lussemburgo", "luxemburg", "letzebuerg"],
  Hungary: ["ungheria", "magyarorszag", "hungria", "hongrie", "ungarn"],
  Estonia: ["eesti", "estland", "estonie"],
};

// Other names for catalogue cities. Compound catalogue cities ("Leiden / The
// Hague") are also split on "/" automatically.
const CITY_ALIASES: Record<string, string[]> = {
  Munich: ["monaco di baviera", "munchen", "muenchen", "munique"],
  Cologne: ["colonia", "koln", "koeln"],
  Vienna: ["wien", "vienne", "viena"],
  Lisbon: ["lisbona", "lisboa", "lisbonne"],
  Paris: ["parigi", "paris"],
  London: ["londra", "londres"],
  Copenhagen: ["copenaghen", "kobenhavn", "copenhague"],
  Gothenburg: ["goteborg", "goeteborg"],
  Prague: ["praga", "praha", "prag"],
  Brussels: ["bruxelles", "brussel", "bruselas"],
  Ghent: ["gand", "gent", "gante"],
  Leuven: ["lovanio", "louvain"],
  Milan: ["milano", "milan", "mailand"],
  Rome: ["roma", "rom"],
  Padua: ["padova", "padoue"],
  Turin: ["torino", "turin"],
  Geneva: ["ginevra", "geneve", "genf", "ginebra"],
  Zurich: ["zurigo", "zuerich"],
  Basel: ["basilea", "bale"],
  Bern: ["berna", "berne"],
  Lausanne: ["losanna"],
  Edinburgh: ["edimburgo"],
  "Leiden / The Hague": ["l aia", "den haag", "la haya", "la haye", "the hague"],
  "Erlangen / Nuremberg": ["norimberga", "nurnberg", "nuernberg"],
  Barcelona: ["barcellona"],
  Stockholm: ["stoccolma", "estocolmo"],
  Dublin: ["dublino"],
  Freiburg: ["friburgo"],
  Hamburg: ["amburgo", "hambourg"],
  "Göttingen": ["gottinga", "goettingen"],
  "Würzburg": ["wuerzburg"],
  Aachen: ["aquisgrana", "aix la chapelle"],
  Dresden: ["dresda"],
  Leipzig: ["lipsia"],
  Mainz: ["magonza", "mayence"],
  Lyon: ["lione"],
  "Kongens Lyngby": ["lyngby"],
  "Esch-sur-Alzette": ["esch", "belval"],
  "Newcastle upon Tyne": ["newcastle"],
  "Louvain-la-Neuve": ["louvain la neuve"],
  "Tübingen": ["tubinga", "tuebingen"],
  Uppsala: ["upsala"],
};

// Short names students use for universities (matched as whole words).
const UNI_ALIASES: Record<string, string[]> = {};
const MANUAL_UNI_ALIASES: [RegExp, string[]][] = [
  [/^University of Amsterdam$/, ["uva"]],
  [/^Vrije Universiteit Amsterdam$/, ["vu amsterdam", "vrije universiteit"]],
  [/^LMU Munich$/, ["lmu"]],
  [/^TU Munich$/, ["tum", "tu munchen", "technische universitat munchen"]],
  [/^ETH Zurich$/, ["eth"]],
  [/^EPFL/, ["epfl", "polytechnique federale"]],
  [/^KU Leuven$/, ["ku leuven", "kul"]],
  [/^UCL/, ["ucl", "university college london"]],
  [/^LSE/, ["lse", "london school of economics"]],
  [/^KTH/, ["kth"]],
  [/Technical University of Denmark/, ["dtu"]],
  [/^Bocconi/, ["bocconi"]],
  [/^Politecnico di Milano$/, ["polimi", "politecnico milano"]],
  [/^Politecnico di Torino$/, ["polito", "politecnico torino"]],
  [/^Sapienza/, ["sapienza"]],
  [/^Sciences Po/, ["sciences po", "sciencespo"]],
  [/^IE University$/, ["ie university", "ie business school"]],
  [/^Universitat Pompeu Fabra$/, ["upf", "pompeu fabra"]],
  [/^Universidad Carlos III/, ["uc3m", "carlos iii"]],
  [/^Trinity College Dublin$/, ["trinity", "tcd"]],
  [/^University College Dublin$/, ["ucd"]],
  [/^University College Cork$/, ["ucc"]],
  [/^Imperial College/, ["imperial"]],
  [/^King's College London$/, ["kcl", "king s college"]],
  [/^TU Delft$/, ["tu delft", "delft university"]],
  [/^Eindhoven University of Technology/, ["tu eindhoven"]],
  [/^RWTH/, ["rwth"]],
  [/^Karlsruhe Institute of Technology/, ["kit karlsruhe"]],
  [/^Aalto/, ["aalto"]],
  [/^Central European University$/, ["ceu"]],
  [/^Semmelweis/, ["semmelweis"]],
  [/^Charles University$/, ["univerzita karlova", "charles university"]],
  [/^Erasmus University Rotterdam$/, ["erasmus rotterdam", "erasmus university"]],
  [/^Humboldt/, ["humboldt", "hu berlin"]],
  [/^Freie Universit/, ["fu berlin", "freie universitat"]],
  [/^TU Berlin$/, ["tu berlin"]],
  [/^Chalmers/, ["chalmers"]],
  [/^University of Warwick$/, ["warwick"]],
  [/^Durham University$/, ["durham university"]],
];
for (const u of universities) {
  const extra = MANUAL_UNI_ALIASES.filter(([re]) => re.test(u.name)).flatMap(([, a]) => a);
  UNI_ALIASES[u.id] = [u.name, ...extra];
}

const TOPIC_WORDS: Record<Topic, string[]> = {
  bureaucracy: [
    "visa", "visto", "permesso", "permit", "residence", "residenza", "soggiorno", "registr", "iscriz", "anagrafe",
    "bsn", "codice fiscale", "nie", "tax id", "steuer", "cpr", "personnummer", "nif", "pps", "insurance", "assicuraz",
    "ehic", "tessera sanitaria", "health", "sanit", "bank", "banca", "conto", "account", "documents", "documenti",
    "burocra", "bureaucra", "work", "lavor", "job", "hours", "ore", "minimum wage", "salario minimo", "stipendio minimo",
    "gemeente", "comune", "municipal", "anmeldung", "transport card", "abbonamento",
  ],
  subsidies: [
    "subsid", "sussid", "grant", "borsa", "borse", "scholarship", "loan", "prestito", "allowance", "toeslag", "duo",
    "bafog", "baf g", "caf", "crous", "susi", "csn", "lanekassen", "kela", "aiut", "aid", "financ", "finanz",
    "contribut", "rimbors", "refund", "discount", "sconto", "agevolaz", "esenzion", "exemption", "money", "soldi",
    "erasmus", "fund", "fondo", "benefit", "beihilfe", "wohngeld", "huurtoeslag", "zorgtoeslag", "apl", "beca",
  ],
  city: [
    "affitt", "rent", "room", "stanza", "camera", "studio", "flat", "appartament", "housing", "alloggi", "casa",
    "cost of living", "costo della vita", "costo vita", "living cost", "budget", "expens", "spes", "cheap", "econom",
    "expensive", "caro", "climate", "clima", "weather", "meteo", "social", "nightlife", "vita notturna", "language",
    "lingua", "parlare", "job", "lavor", "part time", "work", "wage", "paga", "transport", "trasport", "city", "citta",
  ],
  universities: [
    "universit", "uni ", "bachelor", "laurea", "triennal", "course", "corso", "corsi", "programme", "program",
    "deadline", "scadenz", "tuition", "tasse", "retta", "fee", "apply", "candidat", "application", "admission",
    "ammission", "requirement", "requisit", "ranking", "esame", "test", "studielink", "ucas", "parcoursup", "cao",
  ],
};

type Matcher = { key: string; patterns: string[] };

// City names that are also common words ("reading", "bath", Italian "porto")
// only count when written capitalised, and "York" not as part of "New York".
const CASE_SENSITIVE_CITIES: Record<string, RegExp> = {
  Reading: /\bReading\b/,
  Bath: /\bBath\b/,
  Porto: /\bPorto\b/,
  York: /(?<!New )\bYork\b/,
  Cork: /\bCork\b/,
};

const countryMatchers: Matcher[] = [...new Set(universities.map((u) => u.country))].map((c) => ({
  key: c,
  patterns: [c, ...(COUNTRY_ALIASES[c] ?? [])].map(normalize),
}));

const cityMatchers: Matcher[] = [...new Set(universities.map((u) => u.city))].map((c) => ({
  key: c,
  patterns: [c, ...c.split("/").map((p) => p.trim()), ...(CITY_ALIASES[c] ?? [])].map(normalize).filter((p) => p.trim().length > 2),
}));

const uniMatchers: Matcher[] = universities.map((u) => ({
  key: u.id,
  patterns: UNI_ALIASES[u.id].map(normalize),
}));

const uniById = new Map<string, University>(universities.map((u) => [u.id, u]));
export const getUniversityById = (id: string) => uniById.get(id);
export const countryOfCity = new Map(universities.map((u) => [u.city, u.country]));

function firstIndex(text: string, patterns: string[]): number {
  let best = -1;
  for (const p of patterns) {
    const i = text.lastIndexOf(p);
    if (i > best) best = i;
  }
  return best;
}

/**
 * Entities from the most recent message come first; within a message, the one
 * mentioned last wins ties ("compare Berlin and Munich… what about Munich?").
 */
function detect(texts: string[], matchers: Matcher[]): string[] {
  const found: string[] = [];
  for (const raw of texts) {
    const t = normalize(raw);
    const hits = matchers
      .map((m) => {
        const strict = CASE_SENSITIVE_CITIES[m.key];
        if (strict) {
          const all = [...raw.matchAll(new RegExp(strict.source, "g"))];
          return { key: m.key, at: all.length ? all[all.length - 1].index! : -1 };
        }
        return { key: m.key, at: firstIndex(t, m.patterns) };
      })
      .filter((h) => h.at >= 0)
      .sort((a, b) => b.at - a.at);
    for (const h of hits) if (!found.includes(h.key)) found.push(h.key);
  }
  return found;
}

export type ChatTurn = { role: "user" | "assistant"; content: string };

export function routeConversation(messages: ChatTurn[], pinnedUniversityId?: string): Route {
  const userTexts = messages
    .filter((m) => m.role === "user")
    .slice(-LOOKBACK)
    .reverse()
    .map((m) => m.content);

  const universityIds = detect(userTexts, uniMatchers);
  if (pinnedUniversityId && uniById.has(pinnedUniversityId)) {
    const i = universityIds.indexOf(pinnedUniversityId);
    if (i >= 0) universityIds.splice(i, 1);
    universityIds.unshift(pinnedUniversityId);
  }

  const cities = detect(userTexts, cityMatchers);
  const countries = detect(userTexts, countryMatchers);

  // A university implies its city and country; a city implies its country.
  for (const id of universityIds.slice(0, MAX_UNIS)) {
    const u = uniById.get(id)!;
    if (!cities.includes(u.city)) cities.push(u.city);
  }
  for (const c of cities.slice(0, MAX_CITIES)) {
    const country = countryOfCity.get(c)!;
    if (!countries.includes(country)) countries.push(country);
  }

  // Topics only from the latest user message: earlier turns set the place,
  // the latest one sets what is being asked about it.
  const latest = normalize(userTexts[0] ?? "");
  const topics = (Object.keys(TOPIC_WORDS) as Topic[]).filter((t) => TOPIC_WORDS[t].some((w) => latest.includes(w)));

  return {
    countries: countries.slice(0, MAX_COUNTRIES),
    cities: cities.slice(0, MAX_CITIES),
    universityIds: universityIds.slice(0, MAX_UNIS),
    topics,
  };
}

export const countrySlug = slugify;
