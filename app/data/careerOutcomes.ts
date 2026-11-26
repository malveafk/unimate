// Career outcomes: what a degree concretely leads to — the roles graduates
// hold, the employers that hire them and the careers they can realistically
// build. Read by /careers.
//
// Two layers, kept apart on purpose because they carry different evidence:
//
// 1. FIELDS (below): guidance per area of study, written by 4UNI. It describes
//    the European job market for that field in general. Employers are examples
//    of organisations that recruit graduates of the field, not a claim about
//    where the graduates of any one university end up. Every programme in the
//    catalogue is mapped to one field by `fieldForProgramme`.
//
// 2. REPORTED OUTCOMES (`reportedOutcomes`): figures and employers published
//    by the university (employment reports, alumni surveys) or by official
//    graduate surveys (e.g. the UK Graduate Outcomes data on Discover Uni),
//    each with its source link, the exact population it describes and the day
//    it was checked. Only verified entries go here; a programme without one
//    shows the field layer alone.

export type Entry = "bachelor" | "master" | "licence";

export type Role = {
  title: string;
  what: string;
  // What you realistically need to get the job, beyond the bachelor itself.
  entry: Entry;
};

export type EmployerGroup = {
  sector: string;
  examples: string[];
};

export type CareerPath = {
  name: string;
  stages: string[]; // from first job to senior level
};

export type Field = {
  id: string;
  name: string;
  short: string;   // one line, used on the field picker
  summary: string;
  roles: Role[];
  employers: EmployerGroup[];
  paths: CareerPath[];
  realityCheck: string[];
};

export const ENTRY_LABEL: Record<Entry, string> = {
  bachelor: "Bachelor is enough",
  master: "Usually needs a master's",
  licence: "Needs a licence or national exam",
};

export const fields: Field[] = [
  {
    id: "economics",
    name: "Economics",
    short: "Analysis, forecasting and policy with data",
    summary:
      "Economics graduates are hired for one skill above all: turning data into a judgement about prices, risks or policies. Most start in consulting, banking, company strategy teams or public institutions. Working as an economist in the strict sense, at a central bank or a research institute, usually needs a master's or a PhD.",
    roles: [
      { title: "Economic or business analyst", what: "Builds models and forecasts that support pricing, investment or strategy decisions.", entry: "bachelor" },
      { title: "Consulting analyst", what: "Works in small teams on client problems: market sizing, cost reduction, growth plans.", entry: "bachelor" },
      { title: "Risk or credit analyst", what: "Assesses whether a borrower, a portfolio or a market can be trusted, mostly in banks.", entry: "bachelor" },
      { title: "Data analyst", what: "Cleans and analyses company data; econometrics is a direct advantage here.", entry: "bachelor" },
      { title: "Policy analyst", what: "Evaluates the effect of laws and public spending for ministries, EU institutions or think tanks.", entry: "master" },
      { title: "Economist (central bank, research institute)", what: "Research and forecasting on inflation, labour markets or growth.", entry: "master" },
    ],
    employers: [
      { sector: "Consulting", examples: ["McKinsey", "BCG", "Bain", "Oliver Wyman", "Deloitte", "PwC", "EY", "KPMG"] },
      { sector: "Banking and finance", examples: ["ING", "BNP Paribas", "Deutsche Bank", "UniCredit", "Santander"] },
      { sector: "Public and international institutions", examples: ["European Central Bank", "European Commission", "OECD", "IMF", "national central banks and statistics offices"] },
      { sector: "Company strategy and pricing teams", examples: ["Unilever", "Siemens", "Nestlé", "Airbus"] },
    ],
    paths: [
      { name: "Consulting", stages: ["Business analyst", "Consultant", "Project leader / manager", "Partner"] },
      { name: "Public institutions", stages: ["Trainee (e.g. European Commission traineeship)", "Policy officer", "Senior economist / head of unit"] },
      { name: "Corporate", stages: ["Analyst", "Senior analyst", "Strategy or pricing manager", "Head of strategy"] },
    ],
    realityCheck: [
      "Most jobs with the title \"economist\" (central banks, research institutes, the economics departments of international organisations) ask for a master's, and research posts for a PhD.",
      "Permanent posts in the EU institutions are filled through EPSO competitions, which are open to EU citizens; traineeships are the usual first step.",
      "In continental Europe many economics graduates take a master's straight after the bachelor; in the UK and Ireland starting work after the bachelor is more common.",
    ],
  },
  {
    id: "business",
    name: "Business & Management",
    short: "Marketing, operations, audit and management tracks",
    summary:
      "Business degrees lead to the widest range of entry jobs of any field: marketing, sales, operations, audit, HR or a general management-trainee programme. The degree opens the door; which door depends on internships, languages and the specialisation chosen in the final year.",
    roles: [
      { title: "Management trainee", what: "Rotates through several departments of a large company for 1-2 years before a permanent role.", entry: "bachelor" },
      { title: "Marketing or brand associate", what: "Runs campaigns, analyses consumer data and supports product launches.", entry: "bachelor" },
      { title: "Audit or assurance associate", what: "Checks company accounts at an audit firm; the classic route into finance functions.", entry: "bachelor" },
      { title: "Supply chain or operations analyst", what: "Plans purchasing, production and logistics so goods arrive on time and at cost.", entry: "bachelor" },
      { title: "Sales or account manager", what: "Manages relationships with business clients, often with a commercial target.", entry: "bachelor" },
      { title: "HR or recruitment specialist", what: "Hiring, training and people analytics.", entry: "bachelor" },
    ],
    employers: [
      { sector: "Consumer goods", examples: ["Unilever", "Procter & Gamble", "L'Oréal", "Nestlé", "Heineken"] },
      { sector: "Audit and consulting", examples: ["Deloitte", "PwC", "EY", "KPMG", "Accenture"] },
      { sector: "Tech and e-commerce", examples: ["Amazon", "Google", "Booking.com", "Zalando", "Spotify"] },
      { sector: "Luxury and retail", examples: ["LVMH", "Kering", "Inditex", "IKEA"] },
      { sector: "Industry", examples: ["Siemens", "Bosch", "Philips", "ASML"] },
    ],
    paths: [
      { name: "Marketing", stages: ["Assistant brand manager", "Brand / product manager", "Marketing director"] },
      { name: "Audit and finance", stages: ["Audit associate", "Senior associate", "Manager (with a professional accounting qualification)", "Finance director / CFO"] },
      { name: "Operations", stages: ["Operations analyst", "Supply chain manager", "Head of operations"] },
    ],
    realityCheck: [
      "Large companies recruit for graduate programmes early, often in the autumn of your final year, and internships are the main way in.",
      "Outside the most international cities, many business roles require the local language as well as English.",
      "Becoming a chartered or certified accountant takes professional exams after the degree (for example ACCA, or the national qualification of the country where you work).",
    ],
  },
  {
    id: "quant",
    name: "Finance, Maths & Econometrics",
    short: "Quantitative roles in banking, trading and insurance",
    summary:
      "Quantitative degrees are hired wherever risk and money need precise numbers: investment banking, trading firms, insurers, asset managers and data teams. Entry is competitive and runs through internships, and the most technical roles (quant research, actuarial work) add a master's or professional exams.",
    roles: [
      { title: "Investment banking or financial analyst", what: "Valuation and financial modelling for mergers, listings and corporate finance.", entry: "bachelor" },
      { title: "Trader or trading analyst", what: "Prices and trades financial products, often at proprietary trading firms.", entry: "bachelor" },
      { title: "Risk analyst", what: "Measures market, credit and liquidity risk for banks and regulators.", entry: "bachelor" },
      { title: "Data scientist", what: "Statistical and machine-learning models on business data.", entry: "bachelor" },
      { title: "Actuarial analyst", what: "Prices insurance and pension risk; works towards actuarial qualification.", entry: "licence" },
      { title: "Quantitative researcher", what: "Designs mathematical models for pricing or trading strategies.", entry: "master" },
    ],
    employers: [
      { sector: "Investment banks", examples: ["Goldman Sachs", "JPMorgan", "Morgan Stanley", "BNP Paribas", "Deutsche Bank"] },
      { sector: "Trading firms", examples: ["Optiver", "IMC", "Flow Traders", "Jane Street"] },
      { sector: "Insurance and reinsurance", examples: ["Allianz", "AXA", "Generali", "Munich Re", "Swiss Re"] },
      { sector: "Asset management", examples: ["BlackRock", "Amundi", "Robeco"] },
      { sector: "Fintech and tech", examples: ["Adyen", "Revolut", "Booking.com"] },
    ],
    paths: [
      { name: "Investment banking", stages: ["Analyst", "Associate", "Vice president", "Director / managing director"] },
      { name: "Trading", stages: ["Graduate trader", "Trader", "Senior trader / desk head"] },
      { name: "Actuarial", stages: ["Actuarial trainee", "Qualified actuary", "Chief actuary"] },
    ],
    realityCheck: [
      "Front-office jobs in banking and trading recruit mainly through internships in the year before graduation.",
      "Actuaries qualify through the exams of a national actuarial association after the degree, which takes several years while working.",
      "London, Frankfurt, Paris and Amsterdam concentrate most of these jobs.",
    ],
  },
  {
    id: "computing",
    name: "Computer Science & AI",
    short: "Software, data, AI and security engineering",
    summary:
      "Computing graduates have the clearest path from degree to job: software engineering is hired at bachelor level across every industry, not only in tech companies. Machine learning and research roles lean towards a master's. Internships and projects you can show matter as much as grades.",
    roles: [
      { title: "Software engineer", what: "Designs, builds and maintains applications and systems.", entry: "bachelor" },
      { title: "Data engineer", what: "Builds the pipelines and databases that data teams rely on.", entry: "bachelor" },
      { title: "Cloud or DevOps engineer", what: "Runs infrastructure and deployment at scale.", entry: "bachelor" },
      { title: "Cybersecurity analyst", what: "Protects systems, monitors threats and responds to incidents.", entry: "bachelor" },
      { title: "IT consultant", what: "Implements software systems for client companies.", entry: "bachelor" },
      { title: "Machine learning engineer", what: "Trains and deploys AI models in products.", entry: "master" },
    ],
    employers: [
      { sector: "Big tech (European offices)", examples: ["Google", "Microsoft", "Amazon", "Meta", "Apple"] },
      { sector: "European tech", examples: ["SAP", "Spotify", "Booking.com", "Adyen", "Zalando", "Klarna"] },
      { sector: "IT services and consulting", examples: ["Accenture", "Capgemini", "Sopra Steria"] },
      { sector: "Industry and hardware", examples: ["Siemens", "Bosch", "ASML", "Ericsson", "Airbus"] },
      { sector: "Banks and fintech", examples: ["ING", "Revolut", "N26", "Bloomberg"] },
    ],
    paths: [
      { name: "Engineering", stages: ["Junior software engineer", "Software engineer", "Senior engineer", "Staff engineer / tech lead or engineering manager"] },
      { name: "Data and AI", stages: ["Data analyst or engineer", "Data scientist / ML engineer", "Lead / head of data"] },
      { name: "Security", stages: ["Security analyst", "Security engineer", "Security architect / CISO"] },
    ],
    realityCheck: [
      "A bachelor is enough for most software jobs; research labs and many machine-learning roles prefer a master's or PhD.",
      "Many tech teams work in English, so the local language matters less than in most other fields.",
      "Employers look closely at internships, open-source work and personal projects, not only at the degree.",
    ],
  },
  {
    id: "engineering",
    name: "Engineering & Design",
    short: "Mechanical, aerospace, energy and industrial engineering",
    summary:
      "Engineering graduates design, build and run physical systems: vehicles, aircraft, energy plants, factories and products. The industry is large and stable, but in much of continental Europe the full engineering qualification is the master's, so most bachelor graduates continue to an MSc before their first engineering job.",
    roles: [
      { title: "Design engineer", what: "Designs components and systems with CAD and simulation tools.", entry: "master" },
      { title: "Project engineer", what: "Coordinates the technical side of a project from specification to delivery.", entry: "bachelor" },
      { title: "Process or manufacturing engineer", what: "Improves how products are made: quality, cost and throughput.", entry: "bachelor" },
      { title: "R&D engineer", what: "Develops new technologies and prototypes.", entry: "master" },
      { title: "Technical sales or consulting engineer", what: "Translates technical products into solutions for clients.", entry: "bachelor" },
      { title: "Product designer", what: "Shapes the form, usability and manufacturability of products.", entry: "bachelor" },
    ],
    employers: [
      { sector: "Automotive", examples: ["Volkswagen Group", "BMW", "Mercedes-Benz", "Stellantis", "Volvo"] },
      { sector: "Aerospace and defence", examples: ["Airbus", "Safran", "Rolls-Royce", "Leonardo", "Thales"] },
      { sector: "Energy", examples: ["Siemens Energy", "Vestas", "Ørsted", "Enel", "TotalEnergies"] },
      { sector: "Industrial and high-tech", examples: ["ASML", "Bosch", "ABB", "Schneider Electric", "Philips"] },
      { sector: "Engineering consultancies", examples: ["Arcadis", "Ramboll", "Arup"] },
    ],
    paths: [
      { name: "Technical", stages: ["Graduate engineer", "Engineer", "Senior / lead engineer", "Chief engineer"] },
      { name: "Project management", stages: ["Project engineer", "Project manager", "Programme director"] },
      { name: "Management", stages: ["Engineer", "Team lead", "Engineering or plant manager"] },
    ],
    realityCheck: [
      "In Germany, the Netherlands, the Nordic countries and Italy most engineering employers expect a master's; some programmes (such as the Swedish civilingenjör) include it in a single five-year degree.",
      "Protected titles such as Chartered Engineer (UK) or ingegnere after the state exam (Italy) are national and need registration in that country.",
      "Large industrial employers outside the main cities often work in the local language.",
    ],
  },
  {
    id: "law",
    name: "Law",
    short: "Legal practice, compliance and international law",
    summary:
      "Law is the field where the degree title matters most, because practising law is national. To work as a lawyer you need a law degree recognised in the country where you want to practise, followed by that country's traineeship or bar exam. Graduates who do not qualify as lawyers move into compliance, in-house, public administration and international roles.",
    roles: [
      { title: "Trainee lawyer, then associate", what: "Works on cases and transactions at a law firm while qualifying.", entry: "licence" },
      { title: "In-house legal counsel", what: "The legal adviser inside a company: contracts, regulation, disputes.", entry: "master" },
      { title: "Compliance officer", what: "Makes sure a company, often a bank, follows regulation such as anti-money-laundering rules.", entry: "bachelor" },
      { title: "Legal officer in public administration or EU institutions", what: "Drafts and applies legislation.", entry: "master" },
      { title: "Paralegal or legal assistant", what: "Research and document work in support of lawyers.", entry: "bachelor" },
      { title: "Judge or prosecutor", what: "Through the national judicial exam or training school.", entry: "licence" },
    ],
    employers: [
      { sector: "International law firms", examples: ["Clifford Chance", "A&O Shearman", "Freshfields", "Linklaters", "Baker McKenzie"] },
      { sector: "Company legal and compliance teams", examples: ["banks", "insurers", "tech companies", "pharmaceutical companies"] },
      { sector: "EU and international institutions", examples: ["Court of Justice of the EU", "European Commission", "International Criminal Court", "International Court of Justice"] },
      { sector: "Public sector", examples: ["ministries", "regulators", "courts"] },
    ],
    paths: [
      { name: "Law firm", stages: ["Trainee / junior associate", "Associate", "Senior associate", "Partner"] },
      { name: "In-house", stages: ["Legal counsel", "Senior counsel", "General counsel"] },
      { name: "Compliance", stages: ["Compliance analyst", "Compliance officer", "Head of compliance"] },
    ],
    realityCheck: [
      "A bachelor alone rarely qualifies you to practise: in most of continental Europe you need a master's in law or a single-cycle law degree, then a traineeship and/or bar exam in that country.",
      "A law degree from one country does not automatically let you practise in another; check the rules of the bar where you want to work before choosing the degree.",
      "European and comparative law degrees are strong for EU, compliance and international careers; whether they give access to a national bar varies by country.",
    ],
  },
  {
    id: "medicine",
    name: "Medicine",
    short: "Doctor, specialist and research careers",
    summary:
      "Medicine is the most direct path from degree to profession: almost every graduate becomes a doctor. The road is long, about six years of study followed by specialty training, but the job market for doctors in Europe is broad and stable.",
    roles: [
      { title: "Junior doctor / resident", what: "First clinical job after the degree and registration.", entry: "licence" },
      { title: "Specialist doctor", what: "Surgery, cardiology, paediatrics and so on, after specialty training.", entry: "licence" },
      { title: "General practitioner", what: "Family doctor, after GP training.", entry: "licence" },
      { title: "Clinical researcher", what: "Research in university medical centres, often combined with clinical work and a PhD.", entry: "licence" },
      { title: "Medical affairs / pharmaceutical physician", what: "Medical roles in the pharmaceutical industry.", entry: "licence" },
    ],
    employers: [
      { sector: "Hospitals and health systems", examples: ["public hospitals", "university medical centres", "national health services"] },
      { sector: "Pharmaceutical industry", examples: ["Roche", "Novartis", "Novo Nordisk", "Sanofi", "AstraZeneca"] },
      { sector: "Public health", examples: ["World Health Organization", "European Centre for Disease Prevention and Control"] },
    ],
    paths: [
      { name: "Clinical", stages: ["Medical degree", "Junior doctor / resident", "Specialist", "Consultant / head of department"] },
      { name: "Research", stages: ["Medical degree", "PhD and clinical training", "Clinician-scientist", "Professor"] },
    ],
    realityCheck: [
      "Basic medical training completed in an EU country is recognised across the EU, but you still have to register with the medical authority of the country where you work, and patients expect the local language.",
      "In the Netherlands and Belgium the medical degree is split into a bachelor and a master: the bachelor alone does not let you practise.",
      "Specialty training lasts several more years after the degree; its length depends on the specialty and the country.",
    ],
  },
  {
    id: "psychology",
    name: "Psychology",
    short: "Clinical, HR, UX and research careers",
    summary:
      "Psychology splits into two very different job markets. Working as a psychologist, the protected title, needs a master's and usually supervised practice. With the bachelor alone, graduates are hired for what they know about people and research methods: HR, user research, market research and support roles.",
    roles: [
      { title: "Clinical or health psychologist", what: "Assessment and therapy in healthcare.", entry: "licence" },
      { title: "HR or recruitment specialist", what: "Selection, assessment and employee development.", entry: "bachelor" },
      { title: "UX researcher", what: "Studies how people use digital products, mostly in tech companies.", entry: "bachelor" },
      { title: "Market or consumer researcher", what: "Surveys and experiments on consumer behaviour.", entry: "bachelor" },
      { title: "Research assistant", what: "Supports studies at universities and research institutes.", entry: "bachelor" },
      { title: "Organisational psychologist", what: "Work and organisation consulting.", entry: "master" },
    ],
    employers: [
      { sector: "Healthcare", examples: ["hospitals", "mental health services", "private practices"] },
      { sector: "HR and people teams", examples: ["large companies", "recruitment agencies", "assessment firms"] },
      { sector: "Tech (UX research)", examples: ["Booking.com", "Spotify", "SAP"] },
      { sector: "Market research", examples: ["Ipsos", "Kantar", "NielsenIQ"] },
    ],
    paths: [
      { name: "Clinical", stages: ["Bachelor", "Master's", "Supervised practice and registration", "Licensed psychologist"] },
      { name: "HR", stages: ["HR assistant / recruiter", "HR business partner", "Head of people"] },
      { name: "UX research", stages: ["UX researcher", "Senior UX researcher", "Research lead"] },
    ],
    realityCheck: [
      "\"Psychologist\" is a protected title in most EU countries: it requires a master's, often a period of supervised practice, and national registration.",
      "Clinical master's programmes are selective, so plan for the master's when you choose the bachelor.",
      "Clinical work with patients requires fluency in the local language.",
    ],
  },
  {
    id: "politics",
    name: "Politics & International Relations",
    short: "Policy, diplomacy, public affairs and NGOs",
    summary:
      "Politics and IR graduates work where governments, institutions and companies meet: policy, public affairs, diplomacy, risk analysis and NGOs. Entry jobs are competitive and often start with traineeships; international organisations usually want a master's and some experience for professional posts.",
    roles: [
      { title: "Policy officer or analyst", what: "Prepares and evaluates policy for public bodies or think tanks.", entry: "master" },
      { title: "Public affairs consultant", what: "Represents companies and associations towards governments and EU institutions.", entry: "bachelor" },
      { title: "Political risk analyst", what: "Assesses how politics affects investments and operations.", entry: "bachelor" },
      { title: "Diplomat", what: "Through the national foreign-service exam of your own country.", entry: "licence" },
      { title: "NGO programme officer", what: "Runs projects and advocacy for non-profits.", entry: "bachelor" },
      { title: "Parliamentary or political assistant", what: "Supports elected members and parties.", entry: "bachelor" },
    ],
    employers: [
      { sector: "EU institutions", examples: ["European Commission", "European Parliament", "European External Action Service"] },
      { sector: "International organisations", examples: ["United Nations agencies", "OECD", "NATO", "OSCE"] },
      { sector: "Think tanks", examples: ["Bruegel", "CEPS", "ECFR"] },
      { sector: "Risk and public affairs consultancies", examples: ["Control Risks", "Eurasia Group", "Brussels public affairs agencies"] },
      { sector: "NGOs", examples: ["Amnesty International", "Oxfam", "Médecins Sans Frontières"] },
    ],
    paths: [
      { name: "Institutions", stages: ["Trainee", "Policy assistant", "Policy officer", "Head of unit"] },
      { name: "Public affairs", stages: ["Junior consultant", "Consultant", "Director of public affairs"] },
      { name: "Diplomacy", stages: ["Foreign-service exam", "Attaché / secretary", "Counsellor", "Ambassador"] },
    ],
    realityCheck: [
      "Professional posts in international organisations generally ask for a master's and two or more years of experience; traineeships are the usual entry point and are very competitive.",
      "Diplomatic careers are national: you join your own country's foreign service through its exam.",
      "Brussels, Geneva, The Hague and Vienna concentrate most international jobs.",
    ],
  },
  {
    id: "society",
    name: "Social Sciences & Humanities",
    short: "Communication, research, culture and public sector",
    summary:
      "Social science, humanities and liberal arts degrees do not lead to one profession; graduates are hired for writing, research and critical analysis. That makes paths less linear than in professional fields, so internships, languages and a portfolio decide where graduates land more than the degree title does.",
    roles: [
      { title: "Communications or PR specialist", what: "Press relations, internal communication, social media.", entry: "bachelor" },
      { title: "Content or marketing specialist", what: "Writes and plans content for brands and media.", entry: "bachelor" },
      { title: "Researcher or analyst", what: "Qualitative and quantitative research for institutes, agencies or companies.", entry: "bachelor" },
      { title: "Editorial or publishing assistant", what: "Editing, journalism and publishing.", entry: "bachelor" },
      { title: "Cultural programme manager", what: "Projects at museums, foundations and festivals.", entry: "bachelor" },
      { title: "Teacher", what: "Secondary-school teaching, after a national teaching qualification.", entry: "licence" },
    ],
    employers: [
      { sector: "Media and publishing", examples: ["Penguin Random House", "Bertelsmann", "public broadcasters"] },
      { sector: "Communication and advertising agencies", examples: ["Publicis", "WPP", "Havas"] },
      { sector: "Culture", examples: ["museums", "foundations", "festivals"] },
      { sector: "Public sector and NGOs", examples: ["local and national administrations", "non-profits"] },
      { sector: "Tech", examples: ["content, trust & safety and UX research teams"] },
    ],
    paths: [
      { name: "Communications", stages: ["Communications assistant", "Communications specialist", "Head of communications"] },
      { name: "Research", stages: ["Research assistant", "Researcher / analyst", "Research director"] },
      { name: "Culture and publishing", stages: ["Assistant", "Editor / programme manager", "Director"] },
    ],
    realityCheck: [
      "Many graduates take a specialised master's to point the degree towards a profession.",
      "Teaching in schools requires a national teaching qualification in most countries.",
      "Writing-heavy jobs in media and communication usually require the local language at native level.",
    ],
  },
  {
    id: "sciences",
    name: "Natural, Life & Environmental Sciences",
    short: "Pharma, research, environment and sustainability",
    summary:
      "Science graduates go into research, the pharmaceutical and biotech industry, environmental consulting and corporate sustainability. Research careers are long and usually need a PhD; industry roles in quality, regulation and clinical research are a common entry route with a master's.",
    roles: [
      { title: "Laboratory or research technician", what: "Runs experiments and analyses in labs.", entry: "bachelor" },
      { title: "R&D scientist", what: "Develops new drugs, materials or technologies.", entry: "master" },
      { title: "Quality assurance or regulatory affairs specialist", what: "Makes sure products meet regulatory standards, mostly in pharma.", entry: "master" },
      { title: "Clinical research associate", what: "Monitors clinical trials for pharma companies and research organisations.", entry: "bachelor" },
      { title: "Environmental consultant", what: "Impact assessments, permits and remediation projects.", entry: "bachelor" },
      { title: "Sustainability / ESG analyst", what: "Measures and reports a company's environmental performance.", entry: "bachelor" },
    ],
    employers: [
      { sector: "Pharma and biotech", examples: ["Roche", "Novartis", "Novo Nordisk", "Sanofi", "Bayer", "Merck KGaA"] },
      { sector: "Research", examples: ["EMBL", "Max Planck Society", "CNRS", "university labs"] },
      { sector: "Environmental consulting", examples: ["Arcadis", "Ramboll", "WSP"] },
      { sector: "Public agencies", examples: ["European Environment Agency", "national environment agencies"] },
    ],
    paths: [
      { name: "Research", stages: ["Bachelor", "Master's", "PhD", "Postdoc", "Group leader / professor"] },
      { name: "Industry", stages: ["Technician / associate", "Scientist or specialist", "Senior scientist / manager"] },
      { name: "Environment", stages: ["Junior consultant", "Consultant", "Project director"] },
    ],
    realityCheck: [
      "Academic research needs a PhD, and permanent research posts are scarce compared with the number of PhD graduates.",
      "Pharma and biotech jobs cluster in a few regions, such as Basel, Copenhagen, Munich, Paris and Cambridge.",
      "Most graduates in these fields continue to a master's before their first scientific job.",
    ],
  },
];

export const fieldById: Record<string, Field> = Object.fromEntries(fields.map((f) => [f.id, f]));

// Explicit assignments for programmes whose name alone is ambiguous.
// Key: "<universityId>/<bachelorId>".
const FIELD_OVERRIDES: Record<string, string> = {
  // Multidisciplinary social sciences whose graduates mostly go into policy,
  // public affairs and international careers.
  "sciences-po/social-sciences": "politics",
  // Sociology and anthropology more than political science.
  "ceu/culture-politics-society": "society",
};

/**
 * Maps a programme to its field from the programme name. Order matters: the
 * more specific patterns run first (e.g. "Molecular Medicine" is a life
 * science, not medicine; "Econometrics" is quantitative, not economics).
 */
export function fieldForProgramme(universityId: string, bachelorId: string, name: string): Field {
  const override = FIELD_OVERRIDES[`${universityId}/${bachelorId}`];
  if (override) return fieldById[override];

  const n = name.toLowerCase();
  const has = (re: RegExp) => re.test(n);

  let id = "society";
  if (has(/molecular|biotech|sustainab|environment/)) id = "sciences";
  else if (has(/\blaw\b|\bllb\b|blaw|iur\.|jurist|rechtsgeleerdheid/)) id = "law";
  else if (has(/medicine|geneeskunde|läkar/)) id = "medicine";
  else if (has(/psycholog/)) id = "psychology";
  else if (has(/econometric|operations research|^finance|^mathematics \(/)) id = "quant";
  else if (has(/comput|informati|software|artificial intelligence|\bai\b|data science|it security|games engineering|datalogi/)) id = "computing";
  else if (has(/engineer|design|civilingenjör/)) id = "engineering";
  else if (has(/philosophy, politics|politic|international relations|international studies|global studies/)) id = "politics";
  else if (has(/^(international bachelor )?econom|^bsc in economics|economy/)) id = "economics";
  else if (has(/business|management|commerce|bwl|handel/)) id = "business";
  else if (has(/econom/)) id = "economics";
  else if (has(/social|communication|culture|liberal arts|humanities|philosoph|literature/)) id = "society";
  else if (has(/science/)) id = "sciences";

  return fieldById[id];
}

// ─── Layer 2: outcomes reported by the universities themselves ──────────────

export type ReportedOutcome = {
  // Who the figures describe, stated exactly: the programme itself, a whole
  // department, or the master's graduates of the faculty the programme feeds.
  population: string;
  figures: { value: string; label: string }[];
  sectors?: { name: string; share: string }[];
  roles?: string[];       // job titles named in the source
  employers?: string[];   // employers named in the source, most frequent first
  caveat?: string;        // sample size, survey limits
  source: string;         // name of the report or page
  url: string;
  checkedOn: string;      // "D Month YYYY"
};

// Keyed by "<universityId>/<bachelorId>". Every figure below was read on the
// source page or PDF on the checkedOn date; nothing is estimated.
const MAASTRICHT_SURVEY_2025 = {
  source: "Maastricht University Graduate Surveys 2025 (ROA factsheet ROA-F-2025/3)",
  url: "https://www.maastrichtuniversity.nl/file/results-um-alumni-surveys-2025pdf",
  checkedOn: "26 November 2026",
  caveat:
    "Survey of master's graduates of the faculty, 1.5 years after graduation (2022-2023 cohort, surveyed in 2024). University-wide response rate 17.2% (577 graduates). It describes where the bachelor typically leads after the master, not the bachelor graduates themselves.",
};

export const reportedOutcomes: Record<string, ReportedOutcome> = {
  "warwick/economics": {
    population: "All undergraduates of the Department of Economics (four programmes, including BSc Economics), graduated July 2025",
    figures: [
      { value: "78%", label: "went into employment" },
      { value: "22%", label: "continued to further study, mostly a master's" },
      { value: "86%", label: "of those employed work in the UK" },
      { value: "£43,312", label: "median starting salary" },
    ],
    sectors: [
      { name: "Investment banking and markets", share: "23.8%" },
      { name: "Accounting, audit and tax", share: "14.1%" },
      { name: "Banking", share: "12.1%" },
      { name: "Asset management and investing", share: "10.7%" },
      { name: "Consulting and professional services", share: "10.3%" },
      { name: "Government, public sector and regulation", share: "6.1%" },
    ],
    roles: ["Analyst", "Investment banking analyst", "Associate", "Consultant", "Economist, researcher, actuary and teaching roles"],
    employers: ["Deloitte", "BNP Paribas", "EY", "PwC", "Citi", "Barclays", "JPMorgan", "UBS", "RBC", "HSBC", "Deutsche Bank", "BlackRock", "BCG"],
    caveat: "275 of 483 graduates (57%) answered the survey; the salary comes from the 16% of employed respondents who reported it.",
    source: "Warwick Economics Undergraduate Destinations Report 2025",
    url: "https://warwick.ac.uk/fac/soc/economics/current/careers/graduate-outcomes/economics-destination-report-2025.pdf",
    checkedOn: "26 November 2026",
  },
  "lse/economics": {
    population: "BSc Economics graduates of 2023-24, 15 months after the course",
    figures: [
      { value: "90%", label: "in work and/or further study" },
      { value: "95%", label: "of those in work are in highly skilled jobs" },
    ],
    sectors: [
      { name: "Finance professionals", share: "45%" },
      { name: "Business, research and administrative professionals", share: "20%" },
      { name: "Business and public service associate professionals", share: "20%" },
    ],
    caveat: "UK Graduate Outcomes survey: 45 respondents (50% of those asked) for the work and study figure, 40 for occupations. The source groups jobs by occupation type and does not name employers.",
    source: "Discover Uni (UK government), Graduate Outcomes survey",
    url: "https://www.discoveruni.gov.uk/course-details/10004063/L101-UBEC/Full-time",
    checkedOn: "26 November 2026",
  },
  "erasmus/international-business-administration": {
    population: "IBA graduates (Rotterdam School of Management), as reported by the university; no cohort year given",
    figures: [
      { value: "Majority", label: "continue to a master's at RSM before working" },
      { value: "~25%", label: "take a gap year (internships, exchanges, board year)" },
    ],
    sectors: [
      { name: "Consulting", share: "47%" },
      { name: "Finance and accounting", share: "29%" },
      { name: "Information technology", share: "9%" },
      { name: "Consumer goods", share: "8%" },
      { name: "Logistics", share: "7%" },
    ],
    caveat: "Figures from the programme's own page, without survey size or year.",
    source: "Erasmus University Rotterdam, IBA \"After graduation\" page",
    url: "https://www.eur.nl/en/bachelor/bachelor-international-business-administration/after-graduation",
    checkedOn: "26 November 2026",
  },
  "maastricht/international-business": {
    population: "Master's graduates of the School of Business and Economics",
    figures: [
      { value: "3%", label: "unemployed 1.5 years after graduation" },
      { value: "72%", label: "work in a job that requires a master's degree" },
    ],
    ...MAASTRICHT_SURVEY_2025,
  },
  "maastricht/economics-business-and-economics": {
    population: "Master's graduates of the School of Business and Economics",
    figures: [
      { value: "3%", label: "unemployed 1.5 years after graduation" },
      { value: "72%", label: "work in a job that requires a master's degree" },
    ],
    ...MAASTRICHT_SURVEY_2025,
  },
  "maastricht/econometrics-operations-research": {
    population: "Master's graduates of the School of Business and Economics",
    figures: [
      { value: "3%", label: "unemployed 1.5 years after graduation" },
      { value: "72%", label: "work in a job that requires a master's degree" },
    ],
    ...MAASTRICHT_SURVEY_2025,
  },
  "maastricht/psychology": {
    population: "Master's graduates of the Faculty of Psychology and Neuroscience",
    figures: [
      { value: "20%", label: "unemployed 1.5 years after graduation, the highest of any faculty" },
      { value: "80%", label: "of those working have a job that requires a master's degree" },
    ],
    ...MAASTRICHT_SURVEY_2025,
  },
  "maastricht/european-law-school": {
    population: "Master's graduates of the Faculty of Law",
    figures: [
      { value: "5%", label: "unemployed 1.5 years after graduation" },
      { value: "69%", label: "work in a job that requires a master's degree" },
    ],
    ...MAASTRICHT_SURVEY_2025,
  },
};

export function reportedOutcomeFor(universityId: string, bachelorId: string): ReportedOutcome | undefined {
  return reportedOutcomes[`${universityId}/${bachelorId}`];
}
