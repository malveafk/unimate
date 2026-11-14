// The reasons a student can pick when reporting, shared by the dialog they
// fill in and the admin page that reads the result.
//
// In its own module, with no imports, for two reasons. One: `reason` is stored
// as a bare string in the database, so the only thing keeping the dialog and
// the admin queue speaking the same language is this list — two copies would
// drift and the queue would start showing raw values like "fake". Two: the
// admin page is a Server Component, and importing this from utils/moderation
// would drag the browser Supabase client into the server bundle for the sake
// of five labels.
//
// The list is short on purpose. A long menu makes people pick the first
// plausible entry and move on; five options each mean something different to
// whoever reads the queue. `hint` is shown under the label in the dialog —
// most students have never reported anything and do not know what counts.
//
// Adding a value here also means adding it to the CHECK constraint in
// supabase/housing_reports_blocks.sql, which rejects anything it does not
// recognise.

export const REPORT_REASONS = [
  {
    value: "scam",
    label: "Scam or fraud",
    hint: "Asks for a deposit or rent before you have seen the place or signed anything.",
  },
  {
    value: "fake",
    label: "Fake or misleading",
    hint: "The flat does not exist, the photos are stolen, or the price and details are wrong.",
  },
  {
    value: "inappropriate",
    label: "Harassment or inappropriate behaviour",
    hint: "Offensive, threatening or discriminatory messages or content.",
  },
  {
    value: "spam",
    label: "Spam or advertising",
    hint: "Posted to advertise something else, or the same thing posted over and over.",
  },
  {
    value: "other",
    label: "Something else",
    hint: "Tell us what happened in the box below.",
  },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["value"];
