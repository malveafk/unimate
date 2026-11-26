/**
 * Knowledge base types for the 4UNI chatbots.
 *
 * Every fact the chatbot may state about bureaucracy, subsidies or cities is a
 * record with its own official source and the day it was checked. The data
 * lives in data/knowledge/** as JSON; this file is the contract those JSON
 * files follow (scripts/knowledge/validate.ts enforces it).
 *
 * Status:
 *  - "verified":   read on an official/citable page on `verified_at`.
 *  - "unverified": we believe it but could not confirm it on an official page.
 *  - "missing":    we looked and found nothing usable (the bot must say it
 *                  does not know and point to `source_url`, the best official
 *                  starting point).
 */

export type Status = "verified" | "unverified" | "missing";

export type StudentType = "exchange" | "degree";
export type Nationality = "eu_eea" | "swiss" | "non_eu";

/** Who a rule or subsidy applies to. The variable that changes most answers. */
export type Eligibility = {
  student_type: StudentType[] | "any";
  nationality: Nationality[] | "any";
  age?: { min?: number; max?: number } | null;
  /** e.g. "at least 32 hours/month of paid work" (Dutch DUO for EU students). */
  min_work_hours?: string | null;
  /** e.g. "parents' income below X" or "means-tested on household income". */
  income_test?: string | null;
  /** e.g. "more than 3 months", "registered for a full academic year". */
  stay_duration?: string | null;
  /** e.g. "5 years of prior residence". */
  residence_requirement?: string | null;
  other?: string[];
};

/**
 * Two plausible readings of the same rule, each with its own source.
 * Used instead of silently picking one.
 */
export type Interpretation = { hypothesis: string; source_url: string };

type Sourced = {
  source_url: string;
  /** Additional official pages that support the record. */
  extra_sources?: string[];
  verified_at: string; // YYYY-MM-DD
  /**
   * Last day the record's figures are known to hold (a temporary offer, an
   * amount set for one year). After it the validator lists the record as
   * EXPIRED and the bot warns that the figure may be outdated.
   */
  valid_until?: string; // YYYY-MM-DD
  status: Status;
  interpretations?: Interpretation[];
  notes?: string;
};

export const BUREAUCRACY_TOPICS = [
  "residence_permit", // visa / residence permit / EU registration certificate
  "registration", // population register / address registration
  "tax_id", // BSN, codice fiscale, NIE, Steuer-ID, CPR, personnummer...
  "health_insurance", // EHIC, mandatory local insurance
  "bank_account",
  "transport_card", // student transport cards / passes
  "student_work", // max hours, permits for students
  "minimum_wage",
] as const;
export type BureaucracyTopic = (typeof BUREAUCRACY_TOPICS)[number] | "other";

export type BureaucracyItem = Sourced & {
  id: string;
  topic: BureaucracyTopic;
  title: string; // English
  title_it: string; // Italian
  applies_to: Eligibility;
  /** Short synthesis in English, no long copied text. */
  summary: string;
  steps?: string[];
  deadline?: string | null;
  cost?: string | null;
  authority: string;
};

export const SUBSIDY_CATEGORIES = [
  "state_grant_loan",
  "rent",
  "health_insurance",
  "transport",
  "tax",
  "student_work",
  "erasmus",
  "regional",
  "university",
] as const;
export type SubsidyCategory = (typeof SUBSIDY_CATEGORIES)[number] | "other";

export type Subsidy = Sourced & {
  id: string;
  category: SubsidyCategory;
  name_local: string;
  name_it: string;
  authority: string;
  description: string;
  eligibility: Eligibility;
  amount: string | null; // indicative, with period and year
  how_to_apply: string | null;
  deadline: string | null;
  /** Can it be combined with other measures? Free text, null if unknown. */
  stackable: string | null;
};

/** What was searched in a category or topic, so "none exists" ≠ "not searched". */
export type CheckedEntry<C extends string> = {
  key: C;
  result: "found" | "none_found" | "not_researched";
  note?: string;
};

export type CountryBureaucracy = {
  country: string; // as in app/data/universities.ts, e.g. "Netherlands"
  country_code: string; // ISO 3166-1 alpha-2
  currency: string;
  verified_at: string;
  topics_checked: CheckedEntry<BureaucracyTopic>[];
  items: BureaucracyItem[];
};

export type CountrySubsidies = {
  country: string;
  country_code: string;
  currency: string;
  verified_at: string;
  categories_checked: CheckedEntry<SubsidyCategory>[];
  items: Subsidy[];
};

export const CITY_FIELDS = [
  "rent_room", // average monthly rent for a room
  "rent_studio",
  "living_cost_month", // total monthly student budget incl. rent
  "transport_pass", // monthly (student) public transport pass
  "climate",
  "social_life", // always subjective: true
  "language_needed",
  "job_market", // sectors and availability of student jobs
  "student_wage", // typical hourly pay of student jobs
] as const;
export type CityField = (typeof CITY_FIELDS)[number];

export type CityFact = Sourced & {
  field: CityField;
  value: string; // short, with unit, currency and year
  source_name: string; // e.g. "Eurostat", "Numbeo (crowd-sourced)", "Kamernet Rent Report Q3 2026"
  subjective?: boolean;
};

export type CityFile = {
  city: string; // exactly as in app/data/universities.ts `city`
  slug: string;
  country: string;
  verified_at: string;
  facts: CityFact[];
};
