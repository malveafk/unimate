export type UniversityMeta = {
  applicationDeadline: string;     // human-readable
  applicationDeadlineMonth: number | null; // 1–12, null = rolling / no fixed date
  scholarships: boolean;
  requirements: string[];          // ordered list shown on card
  applicationLink?: string;
};

export const universityMeta: Record<string, UniversityMeta> = {

  /* ── NETHERLANDS ─────────────────────────────────── */
  maastricht: {
    applicationDeadline: "1 April 2026",
    applicationDeadlineMonth: 4,
    scholarships: true,
    requirements: [
      "High school diploma (with English-language subjects)",
      "English: IELTS 6.0 / TOEFL iBT 80 / Cambridge B2",
      "Motivation letter (500–700 words)",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.maastrichtuniversity.nl/education/bachelor/apply",
  },

  amsterdam: {
    applicationDeadline: "1 May 2026",
    applicationDeadlineMonth: 5,
    scholarships: true,
    requirements: [
      "High school diploma (VWO level or equivalent)",
      "English: IELTS 6.5 / TOEFL iBT 90",
      "Personal motivation statement",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.uva.nl/en/education/bachelor-s/application",
  },

  erasmus: {
    applicationDeadline: "15 April 2026",
    applicationDeadlineMonth: 4,
    scholarships: true,
    requirements: [
      "High school diploma",
      "English: IELTS 6.0 / TOEFL iBT 80",
      "Numeracy / Math prerequisite (for IBA)",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.eur.nl/en/education/bachelor/admissions",
  },

  groningen: {
    applicationDeadline: "1 May 2026",
    applicationDeadlineMonth: 5,
    scholarships: true,
    requirements: [
      "High school diploma",
      "English: IELTS 6.0 / TOEFL iBT 80 / Cambridge B2",
      "Motivation letter",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.rug.nl/education/bachelor/international-students/application",
  },

  "tu-delft": {
    applicationDeadline: "15 March 2026",
    applicationDeadlineMonth: 3,
    scholarships: true,
    requirements: [
      "High school diploma with strong Math & Sciences",
      "English: IELTS 6.5 / TOEFL iBT 90",
      "Math & Physics grades (minimum 7/10 or equivalent)",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.tudelft.nl/en/education/admission-and-application/bsc-application",
  },

  leiden: {
    applicationDeadline: "15 March 2026",
    applicationDeadlineMonth: 3,
    scholarships: true,
    requirements: [
      "High school diploma (VWO or international equivalent)",
      "English: IELTS 6.5 / TOEFL iBT 90",
      "Motivation letter",
      "2 reference letters",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.universiteitleiden.nl/en/education/apply",
  },

  /* ── GERMANY ─────────────────────────────────────── */
  "lmu-munich": {
    applicationDeadline: "15 July 2026",
    applicationDeadlineMonth: 7,
    scholarships: true,
    requirements: [
      "Abitur or equivalent (recognised by KMK)",
      "German: TestDaF TDN 4 / DSH 2 (for German-taught programmes)",
      "English: IELTS 6.5 / TOEFL iBT 90 (for English tracks)",
      "APS certificate (for students from China, Vietnam, Mongolia)",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.lmu.de/en/study/all-degrees-and-programs/bachelor-degrees/apply",
  },

  "tu-munich": {
    applicationDeadline: "15 January 2026",
    applicationDeadlineMonth: 1,
    scholarships: true,
    requirements: [
      "Abitur or equivalent with strong Math & Sciences",
      "English: IELTS 6.5 / TOEFL iBT 88 (for English-taught programmes)",
      "German: DSH 2 or TestDaF TDN 4 (for German programmes)",
      "APS certificate (for China, Vietnam, Mongolia)",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.tum.de/en/studies/application",
  },

  "humboldt-berlin": {
    applicationDeadline: "15 July 2026",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "Abitur or equivalent (recognised by KMK)",
      "German: DSH 2 or TestDaF TDN 4",
      "Language certificate for your programme language",
      "APS certificate (for China, Vietnam, Mongolia)",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.hu-berlin.de/en/studies/application",
  },

  /* ── SPAIN ───────────────────────────────────────── */
  barcelona: {
    applicationDeadline: "30 June 2026",
    applicationDeadlineMonth: 6,
    scholarships: false,
    requirements: [
      "Selectividad (Spanish university entrance exam) or equivalent",
      "Spanish: DELE B2 (for Spanish-taught programmes)",
      "English: IELTS 6.0 (for English electives / joint programmes)",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.ub.edu/web/ub/en/estudis/oferta_formativa/graus/solicitud.html",
  },

  complutense: {
    applicationDeadline: "30 June 2026",
    applicationDeadlineMonth: 6,
    scholarships: false,
    requirements: [
      "Selectividad or equivalent homologated diploma",
      "Spanish: DELE B2 minimum",
      "Official grade transcripts",
      "Passport / ID copy",
    ],
    applicationLink: "https://www.ucm.es/admision-grado",
  },

  "ie-university": {
    applicationDeadline: "Rolling admissions",
    applicationDeadlineMonth: null,
    scholarships: true,
    requirements: [
      "High school diploma (any recognised qualification)",
      "English: IELTS 6.5 / TOEFL iBT 92 / Duolingo 115+",
      "Motivation letter (1–2 pages)",
      "2 letters of recommendation",
      "Interview with admissions team",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.ie.edu/university/admissions/undergraduate/how-to-apply",
  },

  /* ── FRANCE ──────────────────────────────────────── */
  "sciences-po": {
    applicationDeadline: "31 March 2026",
    applicationDeadlineMonth: 3,
    scholarships: true,
    requirements: [
      "Baccalauréat or international equivalent (IB, A-Levels, etc.)",
      "English or French at C1 level (Cambridge, IELTS, TCF, DELF)",
      "Motivation letter (explaining your intellectual project)",
      "High school report cards (last 2 years)",
      "Written admission test or interview (depending on campus)",
    ],
    applicationLink: "https://www.sciencespo.fr/admissions/en/undergraduate",
  },

  sorbonne: {
    applicationDeadline: "15 March 2026",
    applicationDeadlineMonth: 3,
    scholarships: false,
    requirements: [
      "Baccalauréat or equivalent",
      "French: DELF B2 / TCF B2 (minimum)",
      "Parcoursup application (for EU/French-system students)",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.sorbonne-universite.fr/en/education/apply-sorbonne-universite",
  },

  lyon: {
    applicationDeadline: "15 June 2026",
    applicationDeadlineMonth: 6,
    scholarships: false,
    requirements: [
      "Baccalauréat or equivalent",
      "French: DELF B2 / TCF B2",
      "Parcoursup application",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.univ-lyon1.fr/formation/candidature",
  },

  /* ── ITALY ───────────────────────────────────────── */
  bocconi: {
    applicationDeadline: "15 January 2026",
    applicationDeadlineMonth: 1,
    scholarships: true,
    requirements: [
      "High school diploma (90/100 or equivalent, strongly competitive)",
      "English: IELTS 7.0 / TOEFL iBT 100 / C1 Advanced",
      "Online application with essays",
      "Bocconi Admission Test (BAT) — math & verbal reasoning",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.unibocconi.eu/wps/wcm/connect/bocconi/sitopubblico_en/navigation+tree/home/programs/bachelor+of+science/apply",
  },

  bologna: {
    applicationDeadline: "30 June 2026",
    applicationDeadlineMonth: 6,
    scholarships: true,
    requirements: [
      "High school diploma (maturità or international equivalent)",
      "English: IELTS 6.0 / TOEFL iBT 79 (for English-taught degrees)",
      "Italian: CILS B2 / PLIDA B2 (for Italian-taught degrees)",
      "TOLC entrance test (for some faculties — Medicine, Engineering)",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.unibo.it/en/teaching/enrolment-transfers-and-certifications/how-to-enrol",
  },

  polimi: {
    applicationDeadline: "15 March 2026",
    applicationDeadlineMonth: 3,
    scholarships: true,
    requirements: [
      "High school diploma with strong Math & Sciences",
      "English: IELTS 6.5 / TOEFL iBT 90 (for English-taught programmes)",
      "Polimi Admission Test (maths + problem solving)",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.polimi.it/en/education/laurea-equivalent-to-bachelor-of-science/how-to-apply/",
  },

  /* ── PORTUGAL ────────────────────────────────────── */
  lisbon: {
    applicationDeadline: "31 July 2026",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "High school diploma",
      "Portuguese: CAPLE B2 (for Portuguese-taught degrees)",
      "English: B2 level (for English-track electives)",
      "National Access Exam (for Portuguese applicants via DGES)",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.ulisboa.pt/en/info/how-to-apply",
  },

  porto: {
    applicationDeadline: "31 July 2026",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "High school diploma",
      "Portuguese: CAPLE B2 (for Portuguese-taught degrees)",
      "National Access Exam score (for direct applicants)",
      "Official grade transcripts",
    ],
    applicationLink: "https://sigarra.up.pt/up/en/web_base.gera_pagina?p_pagina=1000867",
  },

  /* ── SWITZERLAND ─────────────────────────────────── */
  "eth-zurich": {
    applicationDeadline: "15 December 2025",
    applicationDeadlineMonth: 12,
    scholarships: true,
    requirements: [
      "Matura / Abitur / A-Levels with strong Math & Sciences (avg ≥ 5/6 or equivalent)",
      "German: C1 level (DSH, TestDaF, or equivalent) — most Bachelor's are in German",
      "English: C1 (for English-taught Master's — Bachelor's mostly German)",
      "Direct entry via Swiss Matura; others may need an entrance exam",
      "Official grade transcripts",
    ],
    applicationLink: "https://ethz.ch/en/studies/bachelor/application.html",
  },

  /* ── BELGIUM ─────────────────────────────────────── */
  "ku-leuven": {
    applicationDeadline: "1 March 2026",
    applicationDeadlineMonth: 3,
    scholarships: true,
    requirements: [
      "High school diploma",
      "Dutch: NT2 Niveau 2 / DELF equivalent (for Dutch-taught degrees)",
      "English: IELTS 6.5 / TOEFL iBT 90 (for English-taught degrees)",
      "Motivation letter",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.kuleuven.be/english/education/bachelor/apply",
  },

  /* ── AUSTRIA ─────────────────────────────────────── */
  vienna: {
    applicationDeadline: "5 September 2026",
    applicationDeadlineMonth: 9,
    scholarships: false,
    requirements: [
      "Matura, Abitur, or internationally recognised school-leaving certificate",
      "German: B2 minimum (most programmes taught in German)",
      "English: B2 (for English-taught electives / joint degrees)",
      "Self-assessment test (STEOPe) for some faculties (Law, Psychology, Business)",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.univie.ac.at/en/studying/admission/",
  },

  /* ── DENMARK ─────────────────────────────────────── */
  copenhagen: {
    applicationDeadline: "15 March 2026",
    applicationDeadlineMonth: 3,
    scholarships: true,
    requirements: [
      "Upper secondary school diploma (with strong academic grades)",
      "English: IELTS 6.5 / TOEFL iBT 88 (for English-taught programmes)",
      "Danish: equivalent to STX level (for Danish-taught programmes)",
      "Quota 1 (GPA) or Quota 2 (supplementary qualifications) application",
      "Official grade transcripts",
    ],
    applicationLink: "https://studies.ku.dk/bachelor/how-to-apply/",
  },

  dtu: {
    applicationDeadline: "15 March 2026",
    applicationDeadlineMonth: 3,
    scholarships: false,
    requirements: [
      "Upper secondary diploma with strong Math & Physics",
      "English: IELTS 6.5 / TOEFL iBT 88",
      "Danish (for Danish-medium programmes)",
      "Coordinated Enrolment (KOT) application via optagelse.dk",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.dtu.dk/english/education/bachelor/application",
  },

  aarhus: {
    applicationDeadline: "15 March 2026",
    applicationDeadlineMonth: 3,
    scholarships: false,
    requirements: [
      "Upper secondary school diploma",
      "English: IELTS 6.0 / TOEFL iBT 83 (for English-taught programmes)",
      "Danish or Scandinavian language (for Danish programmes)",
      "Quota 1 (GPA) or Quota 2 application",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.au.dk/en/education/bachelor/applicationandadmission/",
  },

  /* ── SWEDEN ──────────────────────────────────────── */
  kth: {
    applicationDeadline: "15 January 2026",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Upper secondary diploma with Math & Physics (advanced level)",
      "English: IELTS 6.5 / TOEFL iBT 90",
      "Swedish: for some Bachelor programmes (most Engineering Bachelor's are in Swedish)",
      "Application via universityadmissions.se",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.kth.se/en/studies/bachelor/apply",
  },

  lund: {
    applicationDeadline: "15 January 2026",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Upper secondary school diploma",
      "English: IELTS 6.5 / TOEFL iBT 90",
      "Swedish (for Swedish-medium programmes)",
      "Application via universityadmissions.se",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.lunduniversity.lu.se/international-admissions/apply",
  },

  stockholm: {
    applicationDeadline: "15 January 2026",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Upper secondary school diploma",
      "English: IELTS 6.5 / TOEFL iBT 90",
      "Swedish (for Swedish-medium programmes)",
      "Application via universityadmissions.se",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.su.se/english/education/apply",
  },

  uppsala: {
    applicationDeadline: "15 January 2026",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Upper secondary school diploma",
      "English: IELTS 6.5 / TOEFL iBT 90",
      "Swedish (for Swedish-medium programmes)",
      "Application via universityadmissions.se",
      "Official grade transcripts",
    ],
    applicationLink: "https://www.uu.se/en/admissions/bachelor",
  },
};
