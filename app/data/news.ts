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
    id: "2",
    title: "Germany: BAföG now accessible to EU students from day one",
    summary: "From 2025, European students in Germany can apply for BAföG (state financial aid) without waiting 3 months of residency. A major change for those moving to Munich, Berlin or Heidelberg. Maximum €934/month based on family income.",
    date: "28 April 2025",
    country: "Germany",
    flag: "🇩🇪",
    tag: "Grants",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "3",
    title: "TU Munich: new English-taught bachelor's programmes from September 2025",
    summary: "TU Munich is launching 3 new fully English-taught bachelor's programmes: Computer Science, Data Engineering and Sustainable Management. Until now, almost all bachelor's programmes were in German only — a major shift for international students.",
    date: "25 April 2025",
    country: "Germany",
    flag: "🇩🇪",
    tag: "Updates",
    university: "TU Munich",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=900&auto=format&fit=crop&q=80",
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
    id: "5",
    title: "University of Amsterdam: housing crisis — 8-month waiting list",
    summary: "DUWO, Amsterdam's main student housing provider, reports average waiting times of 8 months for a room. Students starting in September 2025 should join the waiting list by January 2025. Alternatives: Kamernet, Facebook groups, HousingAnywhere.",
    date: "15 April 2025",
    country: "Netherlands",
    flag: "🇳🇱",
    tag: "Housing",
    university: "University of Amsterdam",
    image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=900&auto=format&fit=crop&q=80",
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
  {
    id: "8",
    title: "Spain: Barcelona freezes university tuition fees until 2026",
    summary: "The Generalitat de Catalunya has confirmed the freeze on university tuition fees for the 2025-2026 academic year. The University of Barcelona and UAB remain among the most affordable in Europe for EU students. Becas Santander grants are available for international students.",
    date: "1 April 2025",
    country: "Spain",
    flag: "🇪🇸",
    tag: "Tuition",
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "9",
    title: "Denmark: EU students study free — and can receive SU grants up to DKK 6,321/month",
    summary: "Denmark offers one of the most generous student support systems in the world. EU students enrolled at Danish universities pay zero tuition and can apply for the SU grant (Statens Uddannelsesstøtte) — up to DKK 6,321/month (~€850) — after 6 months of residency. Applications via SU.dk.",
    date: "18 April 2025",
    country: "Denmark",
    flag: "🇩🇰",
    tag: "Grants",
    image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "10",
    title: "University of Copenhagen: applications for September 2025 open via optagelse.dk",
    summary: "Applications for bachelor's programmes at the University of Copenhagen close on 5 July 2025 for Danish and EU applicants via the coordinated admission system (KOT). Most programmes are in Danish — language proficiency B2/C1 required. Popular programmes: Economics, Political Science, Medicine, Computer Science.",
    date: "12 April 2025",
    country: "Denmark",
    flag: "🇩🇰",
    tag: "Admissions",
    university: "University of Copenhagen",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "11",
    title: "Sweden: EU students pay no tuition at KTH, Lund, Uppsala and Stockholm University",
    summary: "Sweden abolished tuition fees for EU/EEA students in 2011. All four major universities — KTH, Lund, Uppsala and Stockholm — are free for European students. Living costs in Stockholm run €1,100–1,500/month; in Lund or Uppsala, €900–1,200/month. Applications via universityadmissions.se by 15 January 2026 for autumn entry.",
    date: "8 April 2025",
    country: "Sweden",
    flag: "🇸🇪",
    tag: "Admissions",
    image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: "12",
    title: "KTH Stockholm: new English-taught bachelor's in Computer Science from 2025",
    summary: "KTH Royal Institute of Technology is piloting its first partially English-taught bachelor track in Computer Science starting September 2025. Until now, all KTH bachelor's were in Swedish only. International students who learn Swedish still benefit from the full BSc programme and seamless access to top-ranked English MSc programmes.",
    date: "3 April 2025",
    country: "Sweden",
    flag: "🇸🇪",
    tag: "Updates",
    university: "KTH Royal Institute of Technology",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&auto=format&fit=crop&q=80",
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
