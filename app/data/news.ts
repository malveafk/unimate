export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  date: string;
  country: string;
  flag: string;
  tag: string;
  university?: string;
  link?: string;
  image: string;
};

export const news: NewsItem[] = [
  {
    id: "11",
    title: "Sweden: EU students pay no tuition at KTH, Lund, Uppsala and Stockholm University",
    summary: "Sweden has charged no tuition to EU/EEA students since 2011 — and still doesn't. Bachelor's programmes at KTH, Lund, Uppsala and Stockholm University are free for European students, who also pay no application fee. Living costs run roughly €1,100–1,500/month in Stockholm and €900–1,200 in Lund or Uppsala. Applications go through universityadmissions.se, which publishes the autumn 2027 round and its deadlines in autumn 2026.",
    date: "12 August 2026",
    country: "Sweden",
    flag: "🇸🇪",
    tag: "Admissions",
    link: "https://www.universityadmissions.se/en/",
    image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "10",
    title: "University of Copenhagen: September 2027 bachelor applications, EU deadline 15 March 2027",
    summary: "Applications for September 2027 bachelor's entry at the University of Copenhagen go through the national optagelse.dk portal. EU/EEA applicants will need to apply by 15 March 2027 and upload supporting documents by 5 July 2027; the portal for non-EU/EEA applicants opens on 15 November 2026 with a 15 January 2027 deadline. Most bachelor's programmes are taught in Danish and require B2/C1 proficiency.",
    date: "12 August 2026",
    country: "Denmark",
    flag: "🇩🇰",
    tag: "Admissions",
    university: "University of Copenhagen",
    link: "https://www.ku.dk/studies/bachelor/quota-1-and-quota-2",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    title: "Germany: BAföG maximum rises to €992/month — EU students qualify through work or long residence",
    summary: "Germany's BAföG state aid now pays a maximum of €992/month for 2025/26, combining basic need, a housing supplement and insurance. The next increase has been postponed to summer 2027, so this rate also holds for 2026/27. EU nationals aren't automatically entitled: they generally qualify by working at least 12 hours per week alongside their studies, or after five years of legal residence in Germany.",
    date: "12 August 2026",
    country: "Germany",
    flag: "🇩🇪",
    tag: "Grants",
    link: "https://www.bafög.de/",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "8",
    title: "Spain: Catalonia keeps its public-university tuition freeze for 2026-2027",
    summary: "Catalonia has extended its public-university tuition freeze into 2026-2027 under Decree 96/2026, holding the price of a bachelor's credit at €17.69 — among the lowest in Spain. The University of Barcelona and UAB remain very affordable for EU students. New for 2026-2027, single-parent families receive the same fee exemptions previously reserved for large families, backed by €12.5 million in regional funding.",
    date: "12 August 2026",
    country: "Spain",
    flag: "🇪🇸",
    tag: "Tuition",
    link: "https://www.ub.edu/acad/matricula/preus.html",
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "9",
    title: "Denmark: free tuition for EU students, plus SU grants of DKK 7,426/month for those who work",
    summary: "EU/EEA students pay no tuition at Danish universities. On top of that, the SU state grant pays DKK 7,426 per month before tax in 2026 (about €1,000) — but EU students aren't automatically eligible: you generally qualify by holding 'worker status', meaning around 10–12 hours of paid work per week. An optional student loan of up to DKK 3,799/month is available alongside the grant.",
    date: "12 August 2026",
    country: "Denmark",
    flag: "🇩🇰",
    tag: "Grants",
    link: "https://www.su.dk/english/",
    image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "5",
    title: "University of Amsterdam: limited student housing allocated by lottery — apply by 1 April",
    summary: "Amsterdam's housing shortage means the University of Amsterdam allocates its limited student rooms — via partners such as DUWO, De Key and Student Experience — by randomized lottery, so a place is never guaranteed. International students should apply by the 1 April advisory deadline for housing and visa steps. The September 2026 round has already closed; spring-2027 starters enter a separate lottery held in October–November 2026.",
    date: "12 August 2026",
    country: "Netherlands",
    flag: "🇳🇱",
    tag: "Housing",
    university: "University of Amsterdam",
    link: "https://student.uva.nl/en/information/step-4-uva-student-housing-limited-availability",
    image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "3",
    title: "TU Munich: which bachelor's degrees you can study fully in English",
    summary: "Most bachelor's degrees at TU Munich are taught in German, but a growing number run fully in English — including Aerospace (B.Sc.) and Information Engineering at the TUM Campus Heilbronn — while Management & Technology offers an English-taught track. For the fully-English programmes no German is required; applicants show English proficiency through a certificate or prior English-language schooling. Each programme page lists its exact language of instruction.",
    date: "12 August 2026",
    country: "Germany",
    flag: "🇩🇪",
    tag: "Updates",
    university: "TU Munich",
    link: "https://www.tum.de/en/studies/application/bachelors-degree-programs",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "12",
    title: "KTH Stockholm: one bachelor's programme is taught fully in English",
    summary: "At KTH Royal Institute of Technology, bachelor's programmes are taught in Swedish — with a single exception. The three-year BSc in Information and Communication Technology (180 ECTS) is delivered entirely in English and open to international students without Swedish. Every other KTH bachelor's requires Swedish for admission; the wide English-taught offering begins at master's level, where most programmes are in English.",
    date: "12 August 2026",
    country: "Sweden",
    flag: "🇸🇪",
    tag: "Updates",
    university: "KTH Royal Institute of Technology",
    link: "https://www.kth.se/en/studies/bachelor/bachelor-s-degree-studies-at-kth-1.437576",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "1",
    title: "Maastricht University: applications open for September 2025",
    summary: "Applications for Maastricht bachelor's programmes are open until 1 April 2025 for non-EU students and 1 May for EU students. Spots in the most competitive programmes (International Business, Psychology, Law) often fill up months before the official deadline.",
    date: "2 May 2025",
    country: "Netherlands",
    flag: "🇳🇱",
    tag: "Admissions",
    university: "Maastricht University",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "4",
    title: "France: CAF housing allowance increases to up to €280/month",
    summary: "The French housing allowance (CAF) has raised the maximum for students to €280/month in major cities. Available to all EU students with a regular rental contract in France. Applications must be submitted online at caf.fr within 3 months of arrival.",
    date: "20 April 2025",
    country: "France",
    flag: "🇫🇷",
    tag: "Grants",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "6",
    title: "Portugal: Lisbon and Porto among the most sought-after destinations for Italian students",
    summary: "According to a Uniplaces study, Portugal has become the third most popular destination for Italian students after the Netherlands and Germany. Low costs, high quality of life, and many English-taught programmes are the main drivers. University of Porto now offers partial scholarships for EU students.",
    date: "10 April 2025",
    country: "Portugal",
    flag: "🇵🇹",
    tag: "Trends",
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "7",
    title: "Sciences Po Paris: new scholarships for low-income students up to €14,000/year",
    summary: "Sciences Po has expanded its scholarship programme for families with an equivalent ISEE income below €25,000. The most disadvantaged families can receive full tuition coverage plus a monthly contribution. Applications open until 15 May 2025.",
    date: "5 April 2025",
    country: "France",
    flag: "🇫🇷",
    tag: "Scholarships",
    university: "Sciences Po Paris",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&auto=format&fit=crop&q=80",
  },
];

export const newsTags = ["All", "Admissions", "Grants", "Housing", "Scholarships", "Updates", "Trends", "Tuition"];

export const newsCountries = [
  { code: "all", name: "All", flag: "🌍" },
  { code: "Netherlands", name: "Netherlands", flag: "🇳🇱" },
  { code: "Germany", name: "Germany", flag: "🇩🇪" },
  { code: "France", name: "France", flag: "🇫🇷" },
  { code: "Spain", name: "Spain", flag: "🇪🇸" },
  { code: "Portugal", name: "Portugal", flag: "🇵🇹" },
  { code: "Italy", name: "Italy", flag: "🇮🇹" },
  { code: "Denmark", name: "Denmark", flag: "🇩🇰" },
  { code: "Sweden", name: "Sweden", flag: "🇸🇪" },
];
