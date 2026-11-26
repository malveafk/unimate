// Where each university's tuition and living-cost figures come from, shown under
// those figures on the university page. Keyed by university id (app/data/universities.ts).
//
// checkedOn is the day the figures on our page were compared with the source.
// When our figure is not written as-is on the source (converted currency, a weekly
// budget turned into a monthly one, a table total minus tuition), `figures` lists
// the numbers exactly as the source writes them and `note` says how ours is derived:
// scripts/uni-check/check.py then looks for `figures` instead of our own numbers.
// A university without an entry shows "source not yet documented".

export type CostSource = {
  url: string;
  label: string;       // text of the link
  checkedOn: string;   // "D Month YYYY"
  figures?: string[];  // numbers as written on the source, when ours is derived from them
  note?: string;       // how our figure is derived, shown to the reader
};

export type UniversityCostSources = {
  tuition?: CostSource[];
  livingCost?: CostSource[];
};

export const costSources: Record<string, UniversityCostSources> = {
  amsterdam: {
    tuition: [{ url: "https://www.uva.nl/asset/enrolment-provisions-uva-2027---2028pdf", label: "UvA Enrolment Provisions 2027-2028, Article 15 (statutory tuition fees)", checkedOn: "26 November 2026" }],
    livingCost: [{ url: "https://www.uva.nl/en/programmes/bachelors/economics--business-economics/tuition-fee/tuition-fee.html", label: "Tuition fee - Bachelor's Economics and Business Economics - University of Amsterdam (living expenses)", checkedOn: "26 November 2026" }],
  },
  bath: {
    tuition: [{ url: "https://www.bath.ac.uk/corporate-information/tuition-fees-for-undergraduate-students-starting-in-2027/", label: "Tuition fees for undergraduate students starting in 2027", checkedOn: "26 November 2026" }],
  },
  bocconi: {
    tuition: [{ url: "https://www.unibocconi.it/it/entrare-bocconi/corsi-di-laurea-triennale-e-giurisprudenza/tasse-e-contributi", label: "Tasse e Contributi - Università Bocconi", checkedOn: "26 November 2026" }],
  },
  bonn: {
    tuition: [{ url: "https://www.uni-bonn.de/de/studium/bewerbung-zulassung-und-einschreibung/kosten", label: "Kosten - Universität Bonn (Beitragszusammensetzung Wintersemester 2026/2027)", checkedOn: "26 November 2026" }],
    livingCost: [{ url: "https://www.uni-bonn.de/en/studying/international-students/costs-and-financing-for-international-students/costs-and-financing", label: "Costs and financing for international students - University of Bonn", checkedOn: "26 November 2026" }],
  },
  bristol: {
    tuition: [{ url: "https://www.bristol.ac.uk/study/undergraduate/2027/economics/bsc-economics/", label: "BSc Economics | Study at Bristol", checkedOn: "26 November 2026" }],
  },
  cambridge: {
    livingCost: [{ url: "https://www.undergraduate.study.cam.ac.uk/fees-funding/living-costs", label: "Living costs | Undergraduate Study", checkedOn: "26 November 2026" }],
  },
  cbs: {
    tuition: [{ url: "https://www.cbs.dk/en/study-programmes/bachelor-programmes/application-and-admission", label: "Application and admission - bachelor | CBS - Copenhagen Business School", checkedOn: "26 November 2026" }],
  },
  ceu: {
    tuition: [{ url: "https://www.ceu.edu/academics/degrees/ba-culture-politics-society", label: "The BA in Culture, Politics and Society Degree at CEU", checkedOn: "26 November 2026" }],
  },
  durham: {
    tuition: [{ url: "https://www.durham.ac.uk/business/courses/economics-l100/", label: "Economics L100 - Durham University", checkedOn: "26 November 2026" }],
  },
  "ecole-polytechnique": {
    tuition: [{ url: "https://programmes.polytechnique.edu/bachelor/frais-et-financement/frais-de-scolarite", label: "Bachelor of Science - Frais de scolarité du Bachelor of Science", checkedOn: "26 November 2026" }],
  },
  edinburgh: {
    livingCost: [{ url: "https://study.ed.ac.uk/programmes/undergraduate/57-computer-science", label: "Computer Science BSc (Hons) - Undergraduate programmes | The University of Edinburgh", checkedOn: "26 November 2026" }],
  },
  erasmus: {
    tuition: [{ url: "https://www.eur.nl/en/education/practical-matters/registration/tuition-fee/tuition-fee-2027-2028", label: "Tuition fee 2027-2028 - Erasmus University Rotterdam", checkedOn: "26 November 2026" }],
    livingCost: [{ url: "https://www.eur.nl/en/education/practical-matters/orientation-arrival/costs-living", label: "Costs of living - Erasmus University Rotterdam", checkedOn: "26 November 2026" }],
  },
  "eth-zurich": {
    tuition: [{ url: "https://ethz.ch/students/en/studies/financial/tuition-fees.html", label: "Tuition fees – Student portal | ETH Zurich", checkedOn: "26 November 2026" }],
  },
  "fu-berlin": {
    tuition: [{ url: "https://www.fu-berlin.de/studium/studieren/studienorganisation/gebuehren/index.html", label: "Gebühren und Beiträge - Freie Universität Berlin (WiSe 2026/27 and SoSe 2027)", checkedOn: "26 November 2026" }],
  },
  glasgow: {
    tuition: [{ url: "https://www.gla.ac.uk/undergraduate/fees/intlfees/", label: "University of Glasgow - Undergraduate study - Tuition fees and funding - International students", checkedOn: "26 November 2026" }],
  },
  groningen: {
    tuition: [{ url: "https://www.rug.nl/bachelors/medicine/#programme", label: "Geneeskunde | Bacheloropleidingen | Rijksuniversiteit Groningen", checkedOn: "26 November 2026" }],
  },
  hamburg: {
    tuition: [{ url: "https://www.uni-hamburg.de/campuscenter/studienorganisation/studienverlauf/beitraege-gebuehren/semesterbeitrag.html", label: "Semesterbeitrag - Universität Hamburg (Wintersemester 2026/27)", checkedOn: "26 November 2026" }],
    livingCost: [{ url: "https://www.uni-hamburg.de/en/studium/campus-leben/finanzen.html", label: "Fees and funding - University of Hamburg", checkedOn: "26 November 2026", figures: ["400", "700", "500"], note: "Housing (ca. EUR 400–700 per month) plus living expenses (ca. EUR 500–700 per month), as listed by the university." }],
  },
  heidelberg: {
    tuition: [
      { url: "https://www.uni-heidelberg.de/de/studium/studienorganisation/beitraege-gebuehren", label: "Beiträge & Gebühren - Universität Heidelberg (Semesterbeitrag)", checkedOn: "26 November 2026" },
      { url: "https://www.uni-heidelberg.de/de/studium/studienorganisation/beitraege-gebuehren/studiengebuehren-fuer-internationale-studierende", label: "Studiengebühren für Internationale Studierende - Universität Heidelberg", checkedOn: "26 November 2026" },
    ],
    livingCost: [{ url: "https://www.uni-heidelberg.de/en/study/international-studies/study-in-heidelberg/financing-your-studies", label: "Financing your studies - Heidelberg University", checkedOn: "26 November 2026", note: "Minimum stated by the university (\"min. EUR 992 per month\")." }],
  },
  imperial: {
    tuition: [{ url: "https://www.imperial.ac.uk/study/courses/undergraduate/computing-beng/", label: "Computing BEng | Study | Imperial College London", checkedOn: "26 November 2026" }],
  },
  "lmu-munich": {
    tuition: [{ url: "https://www.lmu.de/de/workspace-fuer-studierende/1x1-des-studiums/rueckmeldung/index.html", label: "Rückmeldung zum Wintersemester 2026/27 - LMU München", checkedOn: "26 November 2026" }],
    livingCost: [{ url: "https://www.lmu.de/en/workspace-for-students/international-student-guide/living-costs/", label: "Living costs - LMU Munich", checkedOn: "26 November 2026" }],
  },
  maastricht: {
    tuition: [{ url: "https://www.maastrichtuniversity.nl/study/admission-enrolment/tuition-fees", label: "Tuition fees - Maastricht University (EU/EEA statutory fee 2027/28)", checkedOn: "26 November 2026" }],
    livingCost: [{ url: "https://www.maastrichtuniversity.nl/study/student-life/cost-studying-financial-assistance", label: "Cost of studying & financial assistance - Maastricht University (Nibud 2024 table)", checkedOn: "26 November 2026", figures: ["561", "272", "53", "67", "238", "60", "156", "55"], note: "Sum of the monthly items in the Nibud 2024 national student survey table shown by the university (a Netherlands average, not Maastricht-specific)." }],
  },
  manchester: {
    tuition: [{ url: "https://www.manchester.ac.uk/study/undergraduate/courses/2027/00560/bsc-computer-science/course-details/", label: "BSc Computer Science - course details (2027 entry) | The University of Manchester", checkedOn: "26 November 2026" }],
  },
  nottingham: {
    tuition: [{ url: "https://www.nottingham.ac.uk/fees/tuitionfees/202728/undergraduate.aspx", label: "Undergraduate courses 2027/28 - The University of Nottingham", checkedOn: "26 November 2026" }],
  },
  padua: {
    tuition: [{ url: "https://www.unipd.it/contribuzione-studentesca", label: "unipd.it", checkedOn: "26 November 2026" }],
  },
  "pantheon-sorbonne": {
    tuition: [{ url: "https://formations.pantheonsorbonne.fr/fr/catalogue-des-formations/licence-L/licence-economie-KBTDQ2ZO.html", label: "Licence Economie - Université Paris 1 Panthéon-Sorbonne", checkedOn: "26 November 2026" }],
  },
  polimi: {
    tuition: [{ url: "https://www.polimi.it/en/prospective-students/how-much-does-it-cost/laurea-laurea-magistrale-and-single-cycle-programmes", label: "Laurea, Laurea Magistrale and Single-cycle programmes - polimi", checkedOn: "26 November 2026" }],
  },
  polito: {
    tuition: [{ url: "https://www.polito.it/sites/default/files/2026-10/ENG_Regolamento%20L%20imma%2025_26%20+%20LM_LS.pdf", label: "polito.it (PDF)", checkedOn: "26 November 2026" }],
  },
  psl: {
    tuition: [{ url: "https://psl.eu/en/education/international-bachelor-science-ai", label: "International Bachelor of Science in AI | PSL", checkedOn: "26 November 2026" }],
  },
  "sciences-po": {
    tuition: [{ url: "https://www.sciencespo.fr/students/en/fees-funding/tuition-fees/", label: "Tuition fees for Academic year 2026-2027 | Sciences Po Students", checkedOn: "26 November 2026" }],
  },
  semmelweis: {
    tuition: [{ url: "https://semmelweis.hu/admission/2025/04/16/fees-and-costs-of-the-application-and-enrollment-procedure-5/", label: "semmelweis.hu", checkedOn: "26 November 2026" }],
  },
  "st-andrews": {
    tuition: [{ url: "https://www.st-andrews.ac.uk/subjects/economics/economics-ma/", label: "Economics MA - Subjects - University of St Andrews", checkedOn: "26 November 2026" }],
  },
  strathclyde: {
    tuition: [{ url: "https://www.strath.ac.uk/courses/undergraduate/computersciencebsc/", label: "BSc Computer Science Degree Glasgow, UK | University of Strathclyde", checkedOn: "26 November 2026" }],
  },
  surrey: {
    tuition: [{ url: "https://www.surrey.ac.uk/fees-and-funding/tuition-fees/undergraduate-2027-entry", label: "Undergraduate course fees 2027 entry | University of Surrey", checkedOn: "26 November 2026" }],
  },
  tartu: {
    tuition: [{ url: "https://ut.ee/en/curriculum/business-administration", label: "Business Administration | University of Tartu", checkedOn: "26 November 2026" }],
  },
  "tu-berlin": {
    tuition: [{ url: "https://www.tu.berlin/en/studierendensekretariat/topics-a-z/semester-fees", label: "Semester Fees - TU Berlin", checkedOn: "26 November 2026" }],
  },
  "tu-dresden": {
    tuition: [{ url: "https://www.stura.tu-dresden.de/semesterbeitrag", label: "Semesterbeitrag und Rückmeldung | StuRa", checkedOn: "26 November 2026" }],
  },
  "tu-munich": {
    livingCost: [{ url: "https://www.tum.de/en/studies/fees", label: "Study fees and costs - TUM", checkedOn: "26 November 2026" }],
  },
  tuebingen: {
    tuition: [
      { url: "https://uni-tuebingen.de/studium/studienorganisation/beitraege-und-gebuehren/semesterbeitraege/", label: "Semesterbeiträge - Universität Tübingen (Wintersemester 2026/2027)", checkedOn: "26 November 2026" },
      { url: "https://uni-tuebingen.de/studium/studienorganisation/beitraege-und-gebuehren/studiengebuehren/studiengebuehren-fuer-internationale-studierende/", label: "Studiengebühren für Internationale Studierende - Universität Tübingen", checkedOn: "26 November 2026" },
    ],
  },
  vub: {
    tuition: [{ url: "https://www.vub.be/sites/default/files/2026-05/2025_Studiegeld_tarieven_EER_2627_ENG.pdf", label: "vub.be (PDF)", checkedOn: "26 November 2026" }],
  },
  wageningen: {
    tuition: [{ url: "https://www.wur.nl/en/education/bachelor/study-expenses-bachelors/tuition-fees-and-study-finances", label: "Tuition fees and study finances bachelor | WUR", checkedOn: "26 November 2026" }],
  },
};
