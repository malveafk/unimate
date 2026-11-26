export type UniversityMeta = {
  applicationDeadline: string;     // human-readable; "D Month YYYY" when the date is confirmed, otherwise e.g. "Expected June 2027"
  applicationDeadlineMonth: number | null; // 1–12, null = rolling / no fixed date
  scholarships: boolean;           // true only when a scholarship open to EU applicants was verified
  requirements: string[];          // ordered list shown on card
  applicationLink?: string;
  applicationPlatform?: string;    // central platform the application goes through, when there is one
  diplomaLink: string;             // official page listing the requirements for each country of the school-leaving diploma
  checkedOn: string;               // day the lines above were last checked on the official pages, "D Month YYYY"
};

// Admission data for the 2027-28 intake, written for any international applicant:
// what depends on the country of the school-leaving diploma is not listed here but
// linked (diplomaLink), because it differs for every country. Lines come from the
// universities' and the national admission platforms' own pages, checked in
// November 2026 (checkedOn); dates not yet published for 2027 are marked "Expected" and
// based on the 2026 calendar. Sources: university-data-log.md.
export const universityMeta: Record<string, UniversityMeta> = {

  /* ── NETHERLANDS ───────────────────────────────── */
  maastricht: {
    applicationDeadline: "15 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via Studielink, then complete the university's own application portal",
      "International Business, Psychology and European Law School have limited places (numerus fixus): apply by 15 January 2027, 23:59 CET; ranking numbers on 15 April 2027",
      "Other programmes: apply by 1 May 2027 (EU applicants)",
      "Your diploma must be equivalent to the Dutch VWO diploma: the accepted diplomas, grades and any mathematics requirement depend on the country where you obtained it",
      "International Business: selection documents including the International Classroom Essay by 15 January",
      "Proof of English (IELTS, TOEFL or Cambridge) at the level stated on the programme's admission page",
    ],
    applicationLink: "https://www.maastrichtuniversity.nl/education/bachelor/programmes/international-business/admission-requirements",
    applicationPlatform: "Studielink",
    diplomaLink: "https://www.maastrichtuniversity.nl/non-Dutch-diplomas-equivalent-VWO",
    checkedOn: "13 November 2026",
  },

  amsterdam: {
    applicationDeadline: "15 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via Studielink, then complete the university's own application portal",
      "English-track Economics and Business Economics and English-track Political Science have limited places: apply by 15 January 2027 (Political Science places are allocated by lottery)",
      "Dutch-taught Computer Science and the Dutch or bilingual tracks: apply by 1 May 2027",
      "Your diploma must be equivalent to the Dutch VWO diploma: the accepted diplomas, grades and any mathematics requirement depend on the country where you obtained it (Economics requires mathematics)",
      "Proof of English (IELTS, TOEFL or Cambridge) at the level stated on the programme's admission page",
    ],
    applicationLink: "https://www.uva.nl/en/education/admissions/bachelors/applying-for-a-degree-programme.html",
    applicationPlatform: "Studielink",
    diplomaLink: "https://www.uva.nl/en/education/admissions/bachelors/entry-requirements-for-international-qualifications.html",
    checkedOn: "13 November 2026",
  },

  erasmus: {
    applicationDeadline: "15 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via Studielink, then complete the university's own application portal",
      "IBEB (500 places) and IBA are numerus fixus programmes: apply by 15 January 2027, 23:59 CET; late applications are not accepted",
      "IBEB requires mathematics at a set level in your diploma (set for each country); otherwise a mathematics deficiency exam is required",
      "IBA: depending on the diploma, a mathematics exam may be required (results by 15 March)",
      "Proof of English (IELTS, TOEFL or Cambridge) at the level stated on the programme's admission page",
    ],
    applicationLink: "https://www.eur.nl/en/bachelor/international-bachelor-economics-and-business-economics/admission",
    applicationPlatform: "Studielink",
    diplomaLink: "https://www.eur.nl/en/bachelor/international-bachelor-economics-and-business-economics/admission",
    checkedOn: "13 November 2026",
  },

  groningen: {
    applicationDeadline: "15 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via Studielink, then complete the university's own application portal",
      "International Business, International Relations and International Organization and Medicine have limited places: apply by 15 January 2027 (International Business also requires a Fit & Benchmark form by 1 February 2027)",
      "Economics and Business Economics: apply by 1 May 2027",
      "Medicine is taught in Dutch",
      "Your diploma must be equivalent to the Dutch VWO diploma: the accepted diplomas, grades and any mathematics requirement depend on the country where you obtained it",
      "Proof of English (IELTS, TOEFL or Cambridge) at the level stated on the programme's admission page",
    ],
    applicationLink: "https://www.rug.nl/education/application-enrolment-tuition-fees/admission/application-deadlines/bachelor-application-deadlines",
    applicationPlatform: "Studielink",
    diplomaLink: "https://www.rug.nl/education/bachelor/international-students/admission-and-application/application-admission-procedure/entry-requirements/bachelors-degree-programmes",
    checkedOn: "13 November 2026",
  },

  "tu-delft": {
    applicationDeadline: "15 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via Studielink, then complete the university's own application portal",
      "Computer Science and Engineering (590 places for 2027-28) and Aerospace Engineering are numerus fixus programmes: apply by 15 January 2027; ranking numbers on 15 April based on selection tests and a lottery",
      "Secondary diploma equivalent to the Dutch VWO with strong mathematics and physics",
      "Proof of English (IELTS, TOEFL or Cambridge) at the level stated on the programme's admission page",
    ],
    applicationLink: "https://www.tudelft.nl/en/education/admission-and-application/bsc-international-diploma/1-admission-requirements/",
    applicationPlatform: "Studielink",
    diplomaLink: "https://www.tudelft.nl/en/education/admission-and-application/bsc-international-diploma/1-admission-requirements/",
    checkedOn: "13 November 2026",
  },

  leiden: {
    applicationDeadline: "15 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via Studielink, then complete the university's own application portal",
      "International Relations and Organisations (The Hague) has limited places: apply by 15 January 2027",
      "Dutch-taught Law: apply by 1 May 2027 (Dutch language proficiency required)",
      "Your diploma must be equivalent to the Dutch VWO diploma: the accepted diplomas, grades and any mathematics requirement depend on the country where you obtained it",
      "Proof of English (IELTS, TOEFL or Cambridge) at the level stated on the programme's admission page",
    ],
    applicationLink: "https://www.universiteitleiden.nl/en/education/study-programmes/bachelor/political-science/international-relations-and-organisations",
    applicationPlatform: "Studielink",
    diplomaLink: "https://www.universiteitleiden.nl/en/education/admission-and-application/bachelors/admission-requirements",
    checkedOn: "13 November 2026",
  },

  utrecht: {
    applicationDeadline: "1 February 2027",
    applicationDeadlineMonth: 2,
    scholarships: false,
    requirements: [
      "University College Utrecht: early round closed 1 December 2026, regular round closes 1 February 2027 (offers must be accepted by 1 May 2027)",
      "Global Sustainability Science: apply via Studielink by 1 May 2027 (EU applicants)",
      "Your diploma must be equivalent to the Dutch VWO diploma: the accepted diplomas, grades and any mathematics requirement depend on the country where you obtained it",
      "Proof of English (IELTS, TOEFL or Cambridge) at the level stated on the programme's admission page",
    ],
    applicationLink: "https://www.uu.nl/en/organisation/university-college-utrecht/how-to-apply/degree-students/application-dates-and-deadlines",
    applicationPlatform: "Studielink",
    diplomaLink: "https://www.uu.nl/sites/default/files/UU-DiplomaEquivalencyList%20Bronbestand%20voor%20website%20Update%201%20October%202026.pdf",
    checkedOn: "13 November 2026",
  },

  tilburg: {
    applicationDeadline: "1 May 2027",
    applicationDeadlineMonth: 5,
    scholarships: false,
    requirements: [
      "Apply via Studielink, then complete the university's own application portal",
      "Economics, International Business Administration and Econometrics have no numerus fixus: apply by 1 May 2027 (EU/EEA applicants)",
      "One-time application fee of €100 for applicants with a non-Dutch diploma (September 2027 intake)",
      "Proof of English (IELTS, TOEFL or Cambridge) at the level stated on the programme's admission page",
    ],
    applicationLink: "https://www.tilburguniversity.edu/students/administration/registration/bachelor-foreign-prior",
    applicationPlatform: "Studielink",
    diplomaLink: "https://www.tilburguniversity.edu/education/bachelors-programs/application-and-admission/eligibility-tool",
    checkedOn: "13 November 2026",
  },

  twente: {
    applicationDeadline: "30 April 2027",
    applicationDeadlineMonth: 4,
    scholarships: false,
    requirements: [
      "Apply via Studielink, then complete the university's own application portal",
      "Technical Computer Science: register in Studielink and Osiris by 30 April 2027, 23:59 CET, and take part in a compulsory matching event (12 March, 4 June or 2 July 2027)",
      "International Business Administration: apply by 1 May 2027 (EU/EEA applicants)",
      "Proof of English (IELTS, TOEFL or Cambridge) at the level stated on the programme's admission page",
    ],
    applicationLink: "https://www.utwente.nl/en/education/bachelor/how-to-apply/bachelor-deadlines/",
    applicationPlatform: "Studielink",
    diplomaLink: "https://www.utwente.nl/en/education/bachelor/application-admission/admission/",
    checkedOn: "13 November 2026",
  },

  tue: {
    applicationDeadline: "1 May 2027",
    applicationDeadlineMonth: 5,
    scholarships: false,
    requirements: [
      "Apply via Studielink, then complete the university's own application portal",
      "Computer Science and Engineering: apply by 1 May 2027 (EU/EEA applicants)",
      "Secondary diploma equivalent to the Dutch VWO with sufficient mathematics",
      "Proof of English (IELTS, TOEFL or Cambridge) at the level stated on the programme's admission page",
    ],
    applicationLink: "https://www.tue.nl/en/education/become-a-tue-student/application-and-admission",
    applicationPlatform: "Studielink",
    diplomaLink: "https://www.tue.nl/en/education/become-a-tue-student/admission-and-enrollment/eligibility",
    checkedOn: "14 November 2026",
  },

  wageningen: {
    applicationDeadline: "1 May 2027",
    applicationDeadlineMonth: 5,
    scholarships: false,
    requirements: [
      "Apply via Studielink, then complete the university's own application portal",
      "Apply by 1 May 2027 (EU/EEA applicants)",
      "Data Science for Global Challenges requires mathematics plus biology, chemistry or physics at pre-university level",
      "Proof of English (IELTS, TOEFL or Cambridge) at the level stated on the programme's admission page",
    ],
    applicationLink: "https://www.wur.nl/en/education/bachelor/application-admission-bachelors/apply-bachelors-programme/international-prior-education",
    applicationPlatform: "Studielink",
    diplomaLink: "https://www.wur.nl/en/education/bachelor/application-admission-bachelors/apply-bachelors-programme/international-prior-education",
    checkedOn: "13 November 2026",
  },

  "vu-amsterdam": {
    applicationDeadline: "1 May 2027",
    applicationDeadlineMonth: 5,
    scholarships: false,
    requirements: [
      "Apply via Studielink, then complete the university's own application portal",
      "International Business Administration and Econometrics and Data Science: apply by 1 May 2027 (EU/EEA applicants; non-EU by 1 April)",
      "Proof of English (IELTS, TOEFL or Cambridge) at the level stated on the programme's admission page",
    ],
    applicationLink: "https://vu.nl/en/education/more-about/apply-bachelors-programme",
    applicationPlatform: "Studielink",
    diplomaLink: "https://vu.nl/en/education/more-about/list-of-diplomas-per-country",
    checkedOn: "13 November 2026",
  },

  radboud: {
    applicationDeadline: "15 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via Studielink, then complete the university's own application portal",
      "Psychology has limited places (numerus fixus): apply by 15 January 2027, then complete the selection assignments in February and March; ranking numbers on 15 April 2027",
      "Artificial Intelligence: EU/EEA applicants apply by 1 July 2027 (by 1 May if you want to join the university housing lottery); non-EU applicants by 1 April 2027",
      "Your diploma must be equivalent to the Dutch VWO diploma; Artificial Intelligence also requires mathematics in your final exams (or an accepted maths certificate). What is accepted depends on the country of your diploma",
      "Proof of English, e.g. IELTS Academic 6.0 with every sub-score at least 6.0, or TOEFL iBT 80 with every sub-score at least 20 (Artificial Intelligence); check each programme's page for its exact scores",
    ],
    applicationLink: "https://www.ru.nl/en/education/bachelors/artificial-intelligence/admission-and-application",
    applicationPlatform: "Studielink",
    diplomaLink: "https://www.ru.nl/en/education/application-and-admission/application-procedure-bachelors/applying-with-an-international-previous-education/non-dutch-diploma-requirements",
    checkedOn: "25 November 2026",
  },


  /* ── GERMANY ───────────────────────────────────── */
  "lmu-munich": {
    applicationDeadline: "15 July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "Medicine: central application via hochschulstart.de by 15 July 2027 if you finish school in 2027 (31 May 2027 if you finished earlier); places are allocated nationally by school grade and other criteria such as the TMS aptitude test",
      "Law and other restricted programmes: apply to LMU by 15 July 2027 (final deadline)",
      "From the 2027 summer semester LMU requires a uni-assist preliminary review (VPD) for foreign school certificates",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
      "Programmes are taught mainly in German: proof of German at C1 level (DSH-2 or TestDaF with 16 points)",
    ],
    applicationLink: "https://www.lmu.de/en/study/all-degrees-and-programs/",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },

  "tu-munich": {
    applicationDeadline: "15 July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "Apply online via TUMonline; the bachelor window runs from 15 May to 15 July 2027",
      "Each programme has its own aptitude assessment, based mainly on school grades in subjects relevant to the programme",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
      "Informatics and Mechanical Engineering are taught in German (C1 proof needed); Management and Technology requires proof of both German and English",
    ],
    applicationLink: "https://www.tum.de/en/studies/application",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },

  "humboldt-berlin": {
    applicationDeadline: "15 July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "Restricted-admission programmes: apply by 15 July 2027; open-admission programmes: by 31 August 2027",
      "Applicants with a foreign school certificate apply through uni-assist",
      "Philosophy is taken as a core subject combined with a second subject, whose admission rules also apply",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
      "Taught in German: proof of German at C1 level (DSH-2, TestDaF with 16 points, telc Deutsch C1 Hochschule or equivalent)",
    ],
    applicationLink: "https://www.hu-berlin.de/en/studies",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },

  heidelberg: {
    applicationDeadline: "15 July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "Molecular Biotechnology has restricted admission: register on hochschulstart.de (DoSV) and apply via the university portal, 1 June to 15 July 2027",
      "15 July is a final deadline set in the state's admission rules and recurs every year; the 2027 window opens in May or June",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
      "Taught in German: proof of German at C1 level (DSH-2, TestDaF with 16 points, telc Deutsch C1 Hochschule or equivalent)",
    ],
    applicationLink: "https://www.uni-heidelberg.de/en/study",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },

  hamburg: {
    applicationDeadline: "15 July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "Business Administration has restricted admission: apply online via the university portal, 1 June to 15 July 2027",
      "15 July is a final deadline set in the state's admission rules and recurs every year; the 2027 window opens in May or June",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
      "Taught in German: proof of German at C1 level (DSH-2, TestDaF with 16 points, telc Deutsch C1 Hochschule or equivalent)",
    ],
    applicationLink: "https://www.uni-hamburg.de/en/campuscenter/bewerbung.html",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },

  tuebingen: {
    applicationDeadline: "15 July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "Medical Informatics has restricted admission: register on hochschulstart.de (DoSV) and apply via the university portal by 15 July 2027",
      "15 July is a final deadline set in the state's admission rules and recurs every year; the 2027 window opens in May or June",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
      "Taught in German: proof of German at C1 level (DSH-2, TestDaF with 16 points, telc Deutsch C1 Hochschule or equivalent)",
    ],
    applicationLink: "https://uni-tuebingen.de/en/study/",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },

  "fu-berlin": {
    applicationDeadline: "15 July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "Psychology has restricted admission: apply 1 June to 15 July 2027",
      "With a foreign school certificate you first need a uni-assist preliminary review (VPD), which takes 4-8 weeks",
      "Ranking by school grade; the result of the BaPsy-DGPs psychology admission test is also taken into account",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
      "Taught in German: proof of German at C1 level (DSH-2, TestDaF with 16 points, telc Deutsch C1 Hochschule or equivalent)",
    ],
    applicationLink: "https://www.fu-berlin.de/en/studium/bewerbung/index.html",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },

  bonn: {
    applicationDeadline: "30 September 2027",
    applicationDeadlineMonth: 9,
    scholarships: false,
    requirements: [
      "Economics has open admission: there is no application, EU applicants enrol online from early June to 30 September 2027 (also the last day to upload documents)",
      "Compulsory first-year modules are taught in both German and English and you choose the language; electives are offered in German or English",
      "German at B2 level (DSH-1) and English at B2 level",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
    ],
    applicationLink: "https://www.uni-bonn.de/en/studying/degree-programs/degree-programs-a-z/economics-bsc",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },

  goettingen: {
    applicationDeadline: "30 September 2027",
    applicationDeadlineMonth: 9,
    scholarships: false,
    requirements: [
      "Economics has open admission (no selection): EU citizens enrol directly between 1 June and 30 September 2027",
      "Dates as published by the university for the winter semester; check the 2027 window before applying",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
      "Taught in German: proof of German at C1 level (DSH-2, TestDaF with 16 points, telc Deutsch C1 Hochschule or equivalent)",
    ],
    applicationLink: "https://www.uni-goettingen.de/en/539590.html",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },

  freiburg: {
    applicationDeadline: "15 July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "Apply 1 June to 15 July 2027: register on hochschulstart.de, then apply via the university portal",
      "Selective: about 80 places; applicants are ranked on their converted school grade, an application essay and a motivation letter",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
      "Taught in English: proof of English at B2 level or higher",
      "The programme starts only in the winter semester; the 2027 guidelines are published on the University College Freiburg site",
    ],
    applicationLink: "https://uni-freiburg.de/ucf/las/apply/",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },

  cologne: {
    applicationDeadline: "15 July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "Business Administration has restricted admission: register on hochschulstart.de and apply via KLIPS 2.0 by 15 July 2027",
      "EU applicants with a foreign school certificate apply directly to the university (not via uni-assist), with a certified copy and translation of the diploma",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
      "German at C1 level (DSH-2, TestDaF 4 in all parts or equivalent) and English at B2 level",
    ],
    applicationLink: "https://uni-koeln.de/en/studying-teaching/international/study-in-cologne/international-applications/application-for-bachelor-studies-state-examination/application-procedure-for-eu-citizens",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },

  "rwth-aachen": {
    applicationDeadline: "Late October 2027",
    applicationDeadlineMonth: 10,
    scholarships: false,
    requirements: [
      "Computer Science has open admission (no NC): apply via RWTHonline from early May; in the current cycle the deadline is 20 October, with enrolment until 31 October",
      "Dates as published by RWTH for the current cycle; the 2027 window is confirmed in spring",
      "Restricted-admission programmes at RWTH have a 15 July deadline",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
      "Taught in German: proof of German at C1 level (DSH-2, TestDaF with 16 points, telc Deutsch C1 Hochschule or equivalent)",
    ],
    applicationLink: "https://www.rwth-aachen.de/cms/root/studium/vor-dem-studium/bewerbung-um-einen-studienplatz/bewerbung-bachelor/~bqrn/internationale-studierende/?lidx=1",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },

  "fau-erlangen": {
    applicationDeadline: "15 July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "Molecular Medicine has 37 places and restricted admission: register on hochschulstart.de, then apply via the campo portal between early May and 15 July 2027",
      "Places are allocated mainly by school grade; the programme starts only in the winter semester",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
      "Taught in German: proof of German at C1 level (DSH-2, TestDaF with 16 points, telc Deutsch C1 Hochschule or equivalent)",
    ],
    applicationLink: "https://www.fau.de/studiengang/molekulare-medizin-b-sc/",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },

  "tu-dresden": {
    applicationDeadline: "15 July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "Computer Science has open admission; EU applicants with a foreign school certificate apply via uni-assist",
      "Deadline 15 July 2027 if your German certificate is still pending, 15 September 2027 if you already have it",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
      "Taught in German: proof of German at C1 level (DSH-2, TestDaF with 16 points, telc Deutsch C1 Hochschule or equivalent)",
    ],
    applicationLink: "https://tu-dresden.de/studium/vor-dem-studium/bewerbung",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },

  "kit-karlsruhe": {
    applicationDeadline: "15 July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "Computer Science has restricted admission: apply via the KIT portal by 15 July 2027; all documents must reach KIT by that date",
      "Selection through KIT's own procedure, based on school grades",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
      "Taught in German: proof of German at C1 level (DSH-2, TestDaF with 16 points, telc Deutsch C1 Hochschule or equivalent)",
    ],
    applicationLink: "https://www.sle.kit.edu/english/vorstudium/bachelor-informatics.php",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },

  muenster: {
    applicationDeadline: "15 July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "Business Administration has restricted admission: EU applicants apply via hochschulstart's DoSV from early May to 15 July 2027 (final deadline)",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
      "Taught in German: proof of German at C1 level (DSH-2, TestDaF with 16 points, telc Deutsch C1 Hochschule or equivalent)",
    ],
    applicationLink: "https://www.uni-muenster.de/ZSB/studienfuehrer/zeigefach.php?nr=154",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },

  leipzig: {
    applicationDeadline: "15 July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "Psychology has restricted admission: apply by 15 July 2027",
      "With a foreign school certificate you apply via the uni-assist portal; the result then appears on AlmaWeb",
      "Selection mainly by the grade of your school-leaving certificate",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
      "Taught in German: proof of German at C1 level (DSH-2, TestDaF with 16 points, telc Deutsch C1 Hochschule or equivalent)",
    ],
    applicationLink: "https://www.uni-leipzig.de/",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },

  mainz: {
    applicationDeadline: "15 July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "Communication Studies has restricted admission: apply from early June to 15 July 2027; if there are more applicants than places, the school grade decides",
      "Studied within a two-subject bachelor (core or minor subject): if either subject is restricted, the 15 July deadline applies",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
      "Taught in German: proof of German at C1 level (DSH-2, TestDaF with 16 points, telc Deutsch C1 Hochschule or equivalent)",
    ],
    applicationLink: "https://www.studium.uni-mainz.de/en/",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },

  "tu-berlin": {
    applicationDeadline: "15 July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "Computer Science has restricted admission: apply 1 June to 15 July 2027 and register on hochschulstart.de",
      "With a foreign school certificate you first need a uni-assist preliminary review (VPD), which takes 4-8 weeks",
      "Cut-off in 2025-26: German grade 2.1 (foreign grades are converted to the German scale)",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
      "Taught in German: proof of German at C1 level (DSH-2, TestDaF with 16 points, telc Deutsch C1 Hochschule or equivalent)",
    ],
    applicationLink: "https://www.tu.berlin/en/studying/applying-and-enrolling/dates-deadlines",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },

  wuerzburg: {
    applicationDeadline: "15 July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "Games Engineering has had open admission since 2025-26, but applicants without a German school certificate still apply via WueStudy by 15 July 2027",
      "With a foreign school certificate you first need a uni-assist preliminary review (VPD), which takes 4-8 weeks",
      "English at B1 level is also required",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
      "Taught in German: proof of German at C1 level (DSH-2, TestDaF with 16 points, telc Deutsch C1 Hochschule or equivalent)",
    ],
    applicationLink: "https://uni-wuerzburg.de/en/international/studying-in-wuerzburg/degree-programmes/application/bachelor-teaching-degree-law-state-examination",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },

  bochum: {
    applicationDeadline: "15 July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "IT Security / Information Technology has open admission, but EU applicants with a foreign school certificate must still apply online, early May to 15 July 2027",
      "Your school-leaving certificate must count as a German university entrance qualification: whether it does, and under which conditions, depends on the country where you obtained it",
      "Mostly taught in German: TestDaF with 16 points, DSH-2, telc Deutsch C1 Hochschule or equivalent",
    ],
    applicationLink: "https://studium.ruhr-uni-bochum.de/en/application-international-prospective-students",
    diplomaLink: "https://www.daad.de/en/studying-in-germany/requirements/admission-database/",
    checkedOn: "13 November 2026",
  },


  /* ── SPAIN ─────────────────────────────────────── */
  barcelona: {
    applicationDeadline: "Expected June 2027",
    applicationDeadlineMonth: 6,
    scholarships: false,
    requirements: [
      "Pre-register on the Catalan universities' access portal in the June call (2026: 2 to 26 June), listing up to eight preferences; places are assigned by admission grade in July",
      "School-leaving certificates from EU countries and from systems with an agreement with Spain (and the IB and European Baccalaureate) need the UNEDasiss accreditation; other diplomas must be homologated by the Spanish Ministry of Education. You can apply to universities while the accreditation is being processed",
      "Your diploma grade is converted to a 10-point scale; optional subject exams (PCE, through UNEDasiss) can add up to 4 points, which matters for competitive programmes",
      "Medicine is one of the most competitive programmes in Spain: the cut-off mark has been above 12 out of 14 in recent years",
      "Taught in Catalan and Spanish",
    ],
    applicationLink: "https://universitats.gencat.cat/ca/preinscripcions/calendari/",
    applicationPlatform: "UNEDasiss and the regional pre-registration portal",
    diplomaLink: "https://unedasiss.uned.es/publico_destino&idioma=en",
    checkedOn: "13 November 2026",
  },

  complutense: {
    applicationDeadline: "Expected early July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "Ordinary pre-registration: in 2026 students from foreign education systems could apply from 5 June to 6 July",
      "UCM also runs an early-admission window for students from foreign systems (2026: 20 January to 1 April)",
      "School-leaving certificates from EU countries and from systems with an agreement with Spain (and the IB and European Baccalaureate) need the UNEDasiss accreditation; other diplomas must be homologated by the Spanish Ministry of Education. You can apply to universities while the accreditation is being processed",
      "Your diploma grade is converted to a 10-point scale; optional subject exams (PCE, through UNEDasiss) can add up to 4 points, which matters for competitive programmes",
      "Taught in Spanish",
    ],
    applicationLink: "https://www.ucm.es/calendario-de-preinscripcion",
    applicationPlatform: "UNEDasiss and the regional pre-registration portal",
    diplomaLink: "https://unedasiss.uned.es/publico_destino&idioma=en",
    checkedOn: "13 November 2026",
  },

  "ie-university": {
    applicationDeadline: "15 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: true,
    requirements: [
      "Admission rounds for 2027-28: Early (closed 18 September 2026), Round 1 (closed 6 November 2026), Round 2 by 15 January 2027 (decision by 19 February), Round 3 by 5 March 2027 (decision by 23 April); later applications only if places remain",
      "IE University's own admissions test in English (verbal, logical, numerical skills), or SAT/LNAT as alternatives where accepted",
      "Holistic review: no single factor such as grades or test scores decides admission",
      "Scholarships: merit awards granted automatically on admission; IE Awards (10-60% of tuition) and IE Foundation scholarships by application, ideally before 15 April",
      "Depending on your school system, your diploma needs the UNEDasiss accreditation or homologation by the Spanish Ministry of Education; IE's admissions office can process it",
    ],
    applicationLink: "https://www.ie.edu/university/admission/admission-process/admissions-rounds/",
    diplomaLink: "https://www.ie.edu/university/admission/access-to-university/freshmen-students/",
    checkedOn: "13 November 2026",
  },

  "pompeu-fabra": {
    applicationDeadline: "Expected June 2027",
    applicationDeadlineMonth: 6,
    scholarships: false,
    requirements: [
      "Pre-register on the Catalan universities' access portal in the June call (2026: 2 to 26 June), listing up to eight preferences; places are assigned by admission grade in July",
      "School-leaving certificates from EU countries and from systems with an agreement with Spain (and the IB and European Baccalaureate) need the UNEDasiss accreditation; other diplomas must be homologated by the Spanish Ministry of Education. You can apply to universities while the accreditation is being processed",
      "Your diploma grade is converted to a 10-point scale; optional subject exams (PCE, through UNEDasiss) can add up to 4 points, which matters for competitive programmes",
      "Global Studies is taught in English in the first two years: B2 is strongly recommended; students also reach B2 in Spanish and A2 in a further language during the degree",
    ],
    applicationLink: "https://universitats.gencat.cat/ca/preinscripcions/calendari/",
    applicationPlatform: "UNEDasiss and the regional pre-registration portal",
    diplomaLink: "https://unedasiss.uned.es/publico_destino&idioma=en",
    checkedOn: "13 November 2026",
  },

  uc3m: {
    applicationDeadline: "Expected June 2027",
    applicationDeadlineMonth: 6,
    scholarships: false,
    requirements: [
      "Regular pre-registration in June (Madrid region calendar); UC3M also has an Early Admission route for students from non-Spanish systems who do not live in Spain (8% of places; 150 euro fee; decided 90% on grades)",
      "Taught entirely in English: a B2 English certificate is requested at application, and B2 must be accredited during the first year",
      "School-leaving certificates from EU countries and from systems with an agreement with Spain (and the IB and European Baccalaureate) need the UNEDasiss accreditation; other diplomas must be homologated by the Spanish Ministry of Education. You can apply to universities while the accreditation is being processed",
      "Your diploma grade is converted to a 10-point scale; optional subject exams (PCE, through UNEDasiss) can add up to 4 points, which matters for competitive programmes",
    ],
    applicationLink: "https://www.uc3m.es/bachelor-degree/international-studies",
    applicationPlatform: "UNEDasiss and the regional pre-registration portal",
    diplomaLink: "https://unedasiss.uned.es/publico_destino&idioma=en",
    checkedOn: "13 November 2026",
  },

  uab: {
    applicationDeadline: "Expected June 2027",
    applicationDeadlineMonth: 6,
    scholarships: false,
    requirements: [
      "Pre-register on the Catalan universities' access portal in the June call (2026: 2 to 26 June), listing up to eight preferences; places are assigned by admission grade in July",
      "School-leaving certificates from EU countries and from systems with an agreement with Spain (and the IB and European Baccalaureate) need the UNEDasiss accreditation; other diplomas must be homologated by the Spanish Ministry of Education. You can apply to universities while the accreditation is being processed",
      "Your diploma grade is converted to a 10-point scale; optional subject exams (PCE, through UNEDasiss) can add up to 4 points, which matters for competitive programmes",
      "English-taught group: a good level of English (B2) is expected",
    ],
    applicationLink: "https://universitats.gencat.cat/ca/preinscripcions/calendari/",
    applicationPlatform: "UNEDasiss and the regional pre-registration portal",
    diplomaLink: "https://unedasiss.uned.es/publico_destino&idioma=en",
    checkedOn: "13 November 2026",
  },

  uam: {
    applicationDeadline: "Expected late June 2027",
    applicationDeadlineMonth: 6,
    scholarships: false,
    requirements: [
      "Ordinary pre-registration in June (2026: 11 to 26 June; extraordinary call 20 to 24 July)",
      "The bilingual group has separate admission: an official English B2 certificate must be attached to the application",
      "Cut-off marks for 2026-27: 9.970 for the general group and 9.754 for the bilingual group, out of 14",
      "School-leaving certificates from EU countries and from systems with an agreement with Spain (and the IB and European Baccalaureate) need the UNEDasiss accreditation; other diplomas must be homologated by the Spanish Ministry of Education. You can apply to universities while the accreditation is being processed",
      "Your diploma grade is converted to a 10-point scale; optional subject exams (PCE, through UNEDasiss) can add up to 4 points, which matters for competitive programmes",
    ],
    applicationLink: "https://www.uam.es/uam/economia",
    applicationPlatform: "UNEDasiss and the regional pre-registration portal",
    diplomaLink: "https://unedasiss.uned.es/publico_destino&idioma=en",
    checkedOn: "13 November 2026",
  },


  /* ── FRANCE ────────────────────────────────────── */
  "sciences-po": {
    applicationDeadline: "1 March 2027",
    applicationDeadlineMonth: 3,
    scholarships: false,
    requirements: [
      "With a foreign school diploma you apply through Sciences Po's international pathway, not Parcoursup",
      "Rolling admission until 1 March 2027: apply by 4 November 2026 for results in mid-January, by 13 January 2027 for early April, by 1 March for early May",
      "Selection: written application (school results, last three years' performance, three short motivation essays) and a 25-minute remote interview; two academic references required",
      "EU students pay fees set on a sliding scale by household income; the Émile Boutmy scholarship (apply by 13 January 2027) is for non-EU students",
      "Application fee 150 euros; language requirements depend on the campus and the language of the programme",
    ],
    applicationLink: "https://www.sciencespo.fr/admissions/en/undergraduate/foreign-secondary-schools/",
    diplomaLink: "https://www.sciencespo.fr/admissions/en/undergraduate/foreign-secondary-schools/",
    checkedOn: "13 November 2026",
  },

  sorbonne: {
    applicationDeadline: "11 March 2027",
    applicationDeadlineMonth: 3,
    scholarships: false,
    requirements: [
      "EU citizens apply through Parcoursup: register and list your choices from 18 January to 11 March 2027, confirm them by 1 April 2027; offers from 1 June 2027",
      "Medicine starts with the one-year PASS: only part of each cohort continues into the second year of medicine, based on results",
      "Your school-leaving certificate must give access to university in the country where it was issued; non-EU nationals with a foreign diploma apply through Études en France or a demande d'admission préalable instead of Parcoursup",
      "Taught in French: level B2 is generally required (some programmes ask for more); proof may be requested at enrolment",
    ],
    applicationLink: "https://www.parcoursup.gouv.fr/",
    applicationPlatform: "Parcoursup",
    diplomaLink: "https://www.enseignementsup-recherche.gouv.fr/fr/etudiants-etrangers-inscriptions-dans-l-enseignement-superieur-francais-46508",
    checkedOn: "13 November 2026",
  },

  lyon: {
    applicationDeadline: "11 March 2027",
    applicationDeadlineMonth: 3,
    scholarships: false,
    requirements: [
      "EU citizens apply through Parcoursup: register and list your choices from 18 January to 11 March 2027, confirm them by 1 April 2027; offers from 1 June 2027",
      "Your school-leaving certificate must give access to university in the country where it was issued; non-EU nationals with a foreign diploma apply through Études en France or a demande d'admission préalable instead of Parcoursup",
      "Taught in French: level B2 is generally required (some programmes ask for more); proof may be requested at enrolment",
    ],
    applicationLink: "https://www.parcoursup.gouv.fr/",
    applicationPlatform: "Parcoursup",
    diplomaLink: "https://www.enseignementsup-recherche.gouv.fr/fr/etudiants-etrangers-inscriptions-dans-l-enseignement-superieur-francais-46508",
    checkedOn: "13 November 2026",
  },

  "ecole-polytechnique": {
    applicationDeadline: "6 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Three rounds for 2027 entry: round 1 closed on 20 October 2026; round 2 runs to 6 January 2027 (results in March), round 3 from 7 January to 8 February 2027 (results in April)",
      "Strong overall record with advanced mathematics and at least one advanced science; transcripts for the last four years and two references (at least one academic)",
      "Shortlisted candidates have a 50-minute video interview",
      "English at C1 level: TOEFL iBT 90, IELTS 6.5 (6 in each skill) or Cambridge C1/C2 176 (169 in each skill)",
    ],
    applicationLink: "https://programmes.polytechnique.edu/en/bachelor/admissions/admissions-criteria-and-procedure",
    diplomaLink: "https://programmes.polytechnique.edu/en/bachelor/admissions/admissions-criteria-and-procedure",
    checkedOn: "13 November 2026",
  },

  psl: {
    applicationDeadline: "11 March 2027",
    applicationDeadlineMonth: 3,
    scholarships: false,
    requirements: [
      "EU citizens apply through Parcoursup: register and list your choices from 18 January to 11 March 2027, confirm them by 1 April 2027; offers from 1 June 2027",
      "About 30 first-year places; selection on school results with excellent mathematics and English, plus a motivation letter",
      "Expected mathematics: differentiation and integration of simple functions, discrete probability, complex numbers",
      "Taught in English: C1 level required",
    ],
    applicationLink: "https://psl.eu/en/education/international-bachelor-science-ai",
    applicationPlatform: "Parcoursup",
    diplomaLink: "https://www.enseignementsup-recherche.gouv.fr/fr/etudiants-etrangers-inscriptions-dans-l-enseignement-superieur-francais-46508",
    checkedOn: "13 November 2026",
  },

  "paris-saclay": {
    applicationDeadline: "11 March 2027",
    applicationDeadlineMonth: 3,
    scholarships: false,
    requirements: [
      "EU citizens apply through Parcoursup: register and list your choices from 18 January to 11 March 2027, confirm them by 1 April 2027; offers from 1 June 2027",
      "Your school-leaving certificate must give access to university in the country where it was issued; non-EU nationals with a foreign diploma apply through Études en France or a demande d'admission préalable instead of Parcoursup",
      "Taught in French: level B2 is generally required (some programmes ask for more); proof may be requested at enrolment",
    ],
    applicationLink: "https://www.parcoursup.gouv.fr/",
    applicationPlatform: "Parcoursup",
    diplomaLink: "https://www.enseignementsup-recherche.gouv.fr/fr/etudiants-etrangers-inscriptions-dans-l-enseignement-superieur-francais-46508",
    checkedOn: "13 November 2026",
  },

  "ens-lyon": {
    applicationDeadline: "11 March 2027",
    applicationDeadlineMonth: 3,
    scholarships: false,
    requirements: [
      "EU citizens apply through Parcoursup: register and list your choices from 18 January to 11 March 2027, confirm them by 1 April 2027; offers from 1 June 2027",
      "CPES is a selective three-year programme with small cohorts: selection on the Parcoursup file",
      "Your school-leaving certificate must give access to university in the country where it was issued; non-EU nationals with a foreign diploma apply through Études en France or a demande d'admission préalable instead of Parcoursup",
      "Taught in French: level B2 is generally required (some programmes ask for more); proof may be requested at enrolment",
    ],
    applicationLink: "https://www.parcoursup.gouv.fr/",
    applicationPlatform: "Parcoursup",
    diplomaLink: "https://www.enseignementsup-recherche.gouv.fr/fr/etudiants-etrangers-inscriptions-dans-l-enseignement-superieur-francais-46508",
    checkedOn: "13 November 2026",
  },

  "pantheon-sorbonne": {
    applicationDeadline: "11 March 2027",
    applicationDeadlineMonth: 3,
    scholarships: false,
    requirements: [
      "EU citizens apply through Parcoursup: register and list your choices from 18 January to 11 March 2027, confirm them by 1 April 2027; offers from 1 June 2027",
      "Your school-leaving certificate must give access to university in the country where it was issued; non-EU nationals with a foreign diploma apply through Études en France or a demande d'admission préalable instead of Parcoursup",
      "Law is taught in French (B2 generally required); the Economics International Track is taught in English, so check the language level on its Parcoursup page",
    ],
    applicationLink: "https://www.parcoursup.gouv.fr/",
    applicationPlatform: "Parcoursup",
    diplomaLink: "https://www.enseignementsup-recherche.gouv.fr/fr/etudiants-etrangers-inscriptions-dans-l-enseignement-superieur-francais-46508",
    checkedOn: "13 November 2026",
  },


  /* ── ITALY ─────────────────────────────────────── */
  bocconi: {
    applicationDeadline: "26 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: true,
    requirements: [
      "Three selection sessions for 2027-28: Early (closed 29 September 2026), Winter (apply 25 November 2026 to 26 January 2027, 15:00; results mid-March) and Spring (8 to 27 April 2027; results late May)",
      "Admission test: Bocconi online test (minimum score 17; 60 euros per attempt, up to 4 attempts) or SAT/ACT; scores from previous years do not count",
      "Last Bocconi test date for Italian candidates: 21 January 2027 for the Winter session, 22 April 2027 for the Spring session (book at least 48 hours ahead)",
      "Scholarships: apply for Bocconi4Access after enrolling (Winter session window 15 March to 5 April 2027)",
      "Foreign diplomas must give access to university in their home country after at least 12 years of schooling; documents required for each country are listed in Bocconi's diploma table",
    ],
    applicationLink: "https://www.unibocconi.it/en/applying-bocconi/bachelor-and-law-programs/application-and-admissions/admissions",
    diplomaLink: "https://www.unibocconi.it/en/applying-bocconi/bachelor-and-law-programs/application-and-admissions/secondary-school-diplomas",
    checkedOn: "13 November 2026",
  },

  bologna: {
    applicationDeadline: "Expected late September 2027",
    applicationDeadlineMonth: 9,
    scholarships: false,
    requirements: [
      "Law and Energy Engineering are open access (no cap on places), but you must sit a CISIA test before enrolling: TOLC-SU for Law, TOLC-I for Energy Engineering",
      "A low score does not block enrolment: it adds extra first-year requirements (OFA) to clear by the end of the first year",
      "In 2026 enrolment ran from 22 July to 24 September without a late fee; the 2027 notice is published in spring",
      "Law also requires A2 level in an EU language other than Italian",
      "With a foreign school-leaving certificate, the university checks that it gives access to university in its home country and may ask for a Declaration of Value or a CIMEA statement of comparability",
    ],
    applicationLink: "https://www.unibo.it/it/studiare/iscrizioni-tasse-e-altre-procedure/lauree-e-lauree-magistrali/test-tolc-cents",
    diplomaLink: "https://miur.mur.gov.it/studiare-in-italia/studying/eu-nationals.html",
    checkedOn: "13 November 2026",
  },

  polimi: {
    applicationDeadline: "29 May 2027",
    applicationDeadlineMonth: 5,
    scholarships: false,
    requirements: [
      "Computer Engineering: admission with the TOL (Test On Line). For students finishing school in 2027 there are two sessions, 1 February to 9 March and 10 March to 29 May 2027, each taken at most once",
      "A TOL score of 75/100 or more lets you enrol directly; 30 to 75 puts you in the ranking lists",
      "TOLC-I, CEnT-S or SAT are accepted instead of the TOL if registered by 3 June 2027",
      "Product Design: admission with the TOLD design test (2026 windows ran March to May; 2027 dates not yet published)",
      "With a foreign school-leaving certificate, the university checks that it gives access to university in its home country and may ask for a Declaration of Value or a CIMEA statement of comparability",
    ],
    applicationLink: "https://www.polimi.it/en/prospective-students/how-to-apply/admission-to-laurea-programmes/engineering/when-to-register-for-the-tol",
    diplomaLink: "https://miur.mur.gov.it/studiare-in-italia/studying/eu-nationals.html",
    checkedOn: "13 November 2026",
  },

  sapienza: {
    applicationDeadline: "Expected April 2027",
    applicationDeadlineMonth: 4,
    scholarships: false,
    requirements: [
      "Admission with TOLC-I (also in English) or the SAT, taken within the deadlines of the call; tests taken after the deadline are not valid",
      "English at B2 level is required to take part in the selection",
      "The 2027-28 call is not yet published; in past years the first selection closed in early April",
      "With a foreign school-leaving certificate, the university checks that it gives access to university in its home country and may ask for a Declaration of Value or a CIMEA statement of comparability",
    ],
    applicationLink: "https://www.uniroma1.it/en/pagina/restricted-access-degree-programmes-tolc-i-and-selections",
    diplomaLink: "https://miur.mur.gov.it/studiare-in-italia/studying/eu-nationals.html",
    checkedOn: "13 November 2026",
  },

  padua: {
    applicationDeadline: "Expected April 2027",
    applicationDeadlineMonth: 4,
    scholarships: false,
    requirements: [
      "Both programmes have limited places, with separate calls for Italian-diploma holders and for EU applicants with foreign qualifications (EU call: 15 March to 7 April 2027)",
      "Psychological Science (55 places in 2026-27): English TOLC-PSI in mid-April and an English B2 certificate by 31 July (2026 timeline)",
      "Information Engineering: ranking based on a CISIA test; check the 2027-28 call for the test and the number of places",
      "With a foreign school-leaving certificate, the university checks that it gives access to university in its home country and may ask for a Declaration of Value or a CIMEA statement of comparability",
    ],
    applicationLink: "https://www.unipd.it/test-ingresso",
    diplomaLink: "https://miur.mur.gov.it/studiare-in-italia/studying/eu-nationals.html",
    checkedOn: "13 November 2026",
  },

  polito: {
    applicationDeadline: "Expected July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "From 2027-28 Politecnico di Torino uses CISIA tests: only in-person TOLC@UNI or CEnT@UNI are accepted, not the at-home versions",
      "The 2027-28 call is being finalised; in 2026 registration on Apply@polito opened in January and closed on 20 July for EU applicants (50 euro fee)",
      "A sufficient test score only places you in the ranking list; it does not guarantee a place",
      "With a foreign school-leaving certificate, the university checks that it gives access to university in its home country and may ask for a Declaration of Value or a CIMEA statement of comparability",
    ],
    applicationLink: "https://www.polito.it/en/education/applying-studying-graduating/admissions-and-enrolment/bachelor-s-degree-programmes/calls-for-application-regulations-and-ranking-lists",
    diplomaLink: "https://miur.mur.gov.it/studiare-in-italia/studying/eu-nationals.html",
    checkedOn: "13 November 2026",
  },


  /* ── PORTUGAL ──────────────────────────────────── */
  lisbon: {
    applicationDeadline: "Expected late July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "EU citizens apply through Portugal's National Access Competition, run by IES (formerly DGES), like Portuguese students, not the international-student route",
      "Request the equivalence of your foreign diploma to the Portuguese secondary diploma, and meet the programme's entrance exams (minimum 9.5/20); students from foreign systems can ask to replace them with equivalent foreign exams",
      "In 2026 the first phase for students with foreign secondary education ran in late July (about 20 to 28 July); the 2027 calendar follows the national exam guide",
      "ISEG's Economics degree is taught in English (30 places); English proof may be requested; the Portuguese-taught Economia is a separate entry",
      "Non-EU nationals apply instead through the university's special contest for international students",
    ],
    applicationLink: "https://iesuperior.pt/en/acesso/",
    applicationPlatform: "Portugal's National Access Competition (IES)",
    diplomaLink: "https://iesuperior.pt/en/acesso/",
    checkedOn: "14 November 2026",
  },

  porto: {
    applicationDeadline: "Expected late July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "EU citizens apply through Portugal's National Access Competition, run by IES (formerly DGES), like Portuguese students, not the international-student route",
      "Request the equivalence of your foreign diploma to the Portuguese secondary diploma, and meet the programme's entrance exams (minimum 9.5/20); students from foreign systems can ask to replace them with equivalent foreign exams",
      "In 2026 the first phase for students with foreign secondary education ran in late July (about 20 to 28 July); the 2027 calendar follows the national exam guide",
      "Informatics and Computing Engineering is taught in Portuguese (284 places; entrance exams Mathematics A with Physics and Chemistry or Portuguese); FEP's Economics is taught in English (30 places)",
      "Non-EU nationals apply instead through the university's special contest for international students",
    ],
    applicationLink: "https://iesuperior.pt/en/acesso/",
    applicationPlatform: "Portugal's National Access Competition (IES)",
    diplomaLink: "https://www.up.pt/portal/pt/estudar/licenciaturas-e-mestrados-integrados/acesso-e-ingresso/",
    checkedOn: "14 November 2026",
  },

  "nova-lisbon": {
    applicationDeadline: "Expected late July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "EU citizens apply through Portugal's National Access Competition, run by IES (formerly DGES), like Portuguese students, not the international-student route",
      "Entrance exam: Mathematics A alone (50%) or with one of Portuguese, Physics and Chemistry, Economics, Geography, English or Philosophy (30% + 20%); minimum 9.5/20",
      "Request the equivalence of your foreign diploma to the Portuguese secondary diploma before applying",
      "Places for 2026-27: 195 in Economics, 295 in Management",
      "In 2026 the first phase for students with foreign secondary education ran in late July (about 20 to 28 July); the 2027 calendar follows the national exam guide",
      "Non-EU nationals apply instead through the university's special contest for international students",
    ],
    applicationLink: "https://www.novasbe.unl.pt/en/programs/apply/bachelors/national-call",
    applicationPlatform: "Portugal's National Access Competition (IES)",
    diplomaLink: "https://iesuperior.pt/en/acesso/",
    checkedOn: "14 November 2026",
  },


  /* ── SWITZERLAND ───────────────────────────────── */
  "eth-zurich": {
    applicationDeadline: "31 March 2027",
    applicationDeadlineMonth: 3,
    scholarships: false,
    requirements: [
      "Apply online between 1 December 2026 and 31 March 2027; you can apply to only one bachelor's programme",
      "Direct admission depends on the country and type of your school-leaving certificate, its overall grade and the subjects taken; otherwise ETH's reduced or comprehensive entrance examination applies",
      "German C1 certificate (e.g. Goethe C1 with 80 points, telc C1 Hochschule, DSH-3) must reach ETH by 31 March 2027; school grades in German do not count",
      "Bachelor's studies start only in the autumn semester",
    ],
    applicationLink: "https://ethz.ch/en/studies/bachelor/application/non-swiss-matriculation-certificate/admission-prerequisites.html",
    diplomaLink: "https://ethz.ch/en/studies/bachelor/application/non-swiss-matriculation-certificate/admission-prerequisites.html",
    checkedOn: "13 November 2026",
  },

  epfl: {
    applicationDeadline: "30 April 2027",
    applicationDeadlineMonth: 4,
    scholarships: false,
    requirements: [
      "Apply online by 30 April 2027: the form must be submitted and the CHF 150 fee paid by that date",
      "Foreign certificates must meet EPFL's minimum overall grade and subject marks set for each country",
      "First-year places are capped: holders of foreign certificates are ranked by their average and admitted within the places available, with decisions in early August",
      "Taught mainly in French: proof of French at B2 level is required with the application (C1 recommended)",
    ],
    applicationLink: "https://www.epfl.ch/education/admission/admission-2/bachelor-admission-criteria-and-application/",
    diplomaLink: "https://www.swissuniversities.ch/en/topics/studying/admission-to-universities/countries-1",
    checkedOn: "13 November 2026",
  },

  uzh: {
    applicationDeadline: "30 April 2027",
    applicationDeadlineMonth: 4,
    scholarships: false,
    requirements: [
      "Apply online between 1 January and 30 April 2027 (28 February 2027 if you need a visa)",
      "Foreign school-leaving certificates must meet the minimum grade and subject requirements set for each country (swissuniversities country list)",
      "Taught in German: German C1 certificate required",
    ],
    applicationLink: "https://www.uzh.ch/en/studies/application/bachelor.html",
    diplomaLink: "https://www.swissuniversities.ch/en/topics/studying/admission-to-universities/countries-1",
    checkedOn: "13 November 2026",
  },

  geneva: {
    applicationDeadline: "30 April 2027",
    applicationDeadlineMonth: 4,
    scholarships: false,
    requirements: [
      "Apply online by 30 April 2027 (28 February 2027 if you need a visa)",
      "Foreign school-leaving certificates are accepted subject to UNIGE's grade and subject conditions for each country",
      "French at B2 level: applicants whose school was not taught in French sit UNIGE's French exam before enrolment, unless exempt (e.g. a recognised B2-C1 certificate)",
    ],
    applicationLink: "https://www.unige.ch/immatriculations/en/conditions",
    diplomaLink: "https://www.swissuniversities.ch/en/topics/studying/admission-to-universities/countries-1",
    checkedOn: "13 November 2026",
  },

  bern: {
    applicationDeadline: "30 April 2027",
    applicationDeadlineMonth: 4,
    scholarships: false,
    requirements: [
      "Medicine is open only to Swiss citizens and foreign nationals with Swiss residence status: applicants without Swiss residence cannot be admitted. Eligible applicants register via swissuniversities by 15 February 2027 and sit the aptitude test (EMS) in July",
      "Economics: apply by 30 April 2027 (late deadline 31 August 2027)",
      "Foreign school-leaving certificates must meet the minimum grade and subject requirements set for each country (swissuniversities country list)",
      "German C1 certificate, or pass the University of Bern's German test at the start of the autumn semester (register by 31 July)",
    ],
    applicationLink: "https://www.unibe.ch/studies/dates/students/fall/index_eng.html",
    diplomaLink: "https://www.swissuniversities.ch/en/topics/studying/admission-to-universities/countries-1",
    checkedOn: "13 November 2026",
  },

  basel: {
    applicationDeadline: "30 April 2027",
    applicationDeadlineMonth: 4,
    scholarships: false,
    requirements: [
      "Apply online between 1 February and 30 April 2027; the application counts once the CHF 100 fee is paid",
      "You can apply before finishing school and submit the diploma later",
      "Foreign school-leaving certificates must meet the minimum grade and subject requirements set for each country (swissuniversities country list)",
      "Taught mainly in German: the university advises German at C1 level before starting",
    ],
    applicationLink: "https://www.unibas.ch/en/Studies/Before-My-Studies/Application-Admission/Application/Bachelor-s-studies-with-foreign-educational-qualifications.html",
    diplomaLink: "https://www.swissuniversities.ch/en/topics/studying/admission-to-universities/countries-1",
    checkedOn: "13 November 2026",
  },

  unil: {
    applicationDeadline: "30 April 2027",
    applicationDeadlineMonth: 4,
    scholarships: false,
    requirements: [
      "Apply online by 30 April 2027 (28 February 2027 if you need a visa)",
      "Foreign school-leaving certificates must meet the minimum grade and subject requirements set for each country (swissuniversities country list)",
      "Non-native French speakers without a Swiss maturity must pass a French exam at B1 level before final enrolment",
      "HEC bachelor programmes are bilingual: the first year is taught mainly in French",
    ],
    applicationLink: "https://www.unil.ch/unil/en/home/menuinst/etudier/immatriculations-et-inscriptions/bachelor-avec-diplome-etranger.html",
    diplomaLink: "https://www.swissuniversities.ch/en/topics/studying/admission-to-universities/countries-1",
    checkedOn: "13 November 2026",
  },


  /* ── BELGIUM ───────────────────────────────────── */
  "ku-leuven": {
    applicationDeadline: "22 September 2027",
    applicationDeadlineMonth: 9,
    scholarships: false,
    requirements: [
      "EEA candidates can apply for Dutch-taught bachelor programmes until 22 September 2027 (absolute final deadline); applying early is recommended",
      "Dutch at B2 level at least (C1 for some programmes)",
      "Engineering Science: the 'starttoets' entry test is compulsory, on 1 July 2027 (register by 15 June) or 21 August 2027 (register by 15 August)",
    ],
    applicationLink: "https://www.kuleuven.be/english/apply/application-instructions/apply-to-kuleuven",
    diplomaLink: "https://www.kuleuven.be/english/apply/requested-documents/eligibility-bachelor",
    checkedOn: "13 November 2026",
  },

  ghent: {
    applicationDeadline: "1 June 2027",
    applicationDeadlineMonth: 6,
    scholarships: false,
    requirements: [
      "Applicants who do not need a visa submit the online application before 1 June (window opens in October)",
      "A foreign diploma is assessed in an individual admission procedure, unless you already hold a NARIC-Vlaanderen equivalence",
      "Dutch at B2 level, to be proven at the latest at enrolment",
    ],
    applicationLink: "https://www.ugent.be/prospect/en/administration/application/requirement",
    diplomaLink: "https://www.ugent.be/prospect/en/administration/application/requirement/admission-bachelor",
    checkedOn: "13 November 2026",
  },

  vub: {
    applicationDeadline: "Expected 31 July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "EEA students with a foreign diploma who do not need a visa: in 2026 the deadline was 31 July; the 2027 dates are published from mid-November",
      "Both programmes are taught in English: proof of English is required (level on the programme's admission page)",
    ],
    applicationLink: "https://www.vub.be/en/studying-vub/all-study-programmes-vub/bachelors-and-masters-programmes-vub/bachelor-business-economics/bachelor-business-economics-admission-enrolment",
    diplomaLink: "https://www.vub.be/en/studying-vub/apply-and-enrol-vub/admission-requirements-and-deadlines/academic-and-language-requirements",
    checkedOn: "13 November 2026",
  },

  uclouvain: {
    applicationDeadline: "Expected mid-September 2027",
    applicationDeadlineMonth: 9,
    scholarships: false,
    requirements: [
      "EU nationals with a foreign diploma: in 2026 the application deadline was 13 September",
      "Include the equivalence of your foreign diploma issued by the Wallonia-Brussels Federation, or at least proof that you have requested it (equivalences.cfwb.be)",
      "French at B2 level",
    ],
    applicationLink: "https://uclouvain.be/en/enrolment/application-deadlines",
    diplomaLink: "https://uclouvain.be/en/enrolment/uclouvain-application-requirements",
    checkedOn: "13 November 2026",
  },


  /* ── AUSTRIA ───────────────────────────────────── */
  vienna: {
    applicationDeadline: "4 May 2027",
    applicationDeadlineMonth: 5,
    scholarships: false,
    requirements: [
      "Economics has an admission procedure: register 1 March to 4 May 2027, then sit the test in July 2027 (353 places; held in German, some parts in English)",
      "Law has no admission test: apply in the general admission period for the winter semester (in 2026 it ran 22 June to 5 September)",
      "Foreign school-leaving certificates must be equivalent to the Austrian Matura: requirements depend on the country, and some certificates need supplementary exams",
      "Taught in German: proof of German at C1 level",
    ],
    applicationLink: "https://studieren.univie.ac.at/en/admission/application-and-admission-periods/",
    diplomaLink: "https://studieren.univie.ac.at/en/applying-for-a-programme/international-students/country-specific-requirements-for-admission",
    checkedOn: "13 November 2026",
  },

  "tu-wien": {
    applicationDeadline: "Early May 2027",
    applicationDeadlineMonth: 5,
    scholarships: false,
    requirements: [
      "Computer Science has an admission procedure: pre-register in TISS, complete the online self-assessment and pay the 50 euro fee (2026 window: 1 April to 4 May; ranking test in July, in German; 670 places)",
      "Mechanical Engineering has no selection: pre-register by 5 September for the winter semester",
      "Foreign school-leaving certificates must be equivalent to the Austrian Matura: requirements depend on the country, and some certificates need supplementary exams",
      "All bachelor programmes are taught in German: C1 is required for admission (with A2 you can be admitted with a supplementary German exam to pass within 4 semesters)",
    ],
    applicationLink: "https://www.tuwien.at/en/studies/admission/bachelors-programmes",
    diplomaLink: "https://www.tuwien.at/en/studies/admission/bachelors-programmes/admission-with-an-international-school-leaving-certificate",
    checkedOn: "13 November 2026",
  },

  ceu: {
    applicationDeadline: "2 February 2027",
    applicationDeadlineMonth: 2,
    scholarships: false,
    requirements: [
      "Four rounds: 15 October 2026, 2 February 2027, 15 April 2027 and 15 July 2027 (last round only for applicants who need no visa for Austria, if places remain)",
      "CEU financial aid is available only in the first two rounds",
      "Transcripts of the last two school years, CV, motivation letter (300 words) and one teacher recommendation; Culture, Politics and Society also asks for a 500-word essay",
      "English: IELTS 6.5, TOEFL iBT 88, Cambridge C1/C2 180 or Duolingo 120",
      "Application fee 30 euros; shortlisted candidates may be interviewed",
      "A completed secondary school diploma (or proof that you will obtain it before enrolment) with your matriculation exam results",
    ],
    applicationLink: "https://www.ceu.edu/admissions/bachelor",
    diplomaLink: "https://www.ceu.edu/admissions/bachelor",
    checkedOn: "13 November 2026",
  },

  "wu-vienna": {
    applicationDeadline: "24 May 2027",
    applicationDeadlineMonth: 5,
    scholarships: false,
    requirements: [
      "Business and Economics (BBE): register online for the selection procedure from 1 March to 24 May 2027 and pay the registration fee",
      "240 places for winter semester 2027/28: if more people register, complete the Online Self-Assessment by 2 June 2027 (12:00 noon CEST) and sit the in-person entrance exam on 7 July 2027 in Vienna",
      "Your school-leaving certificate must give access to university in the country where you obtained it; the documents WU asks for depend on that country",
      "The selection and the programme are entirely in English: proof of English at least at level B2, with a certificate accepted by WU",
    ],
    applicationLink: "https://www.wu.ac.at/en/programs/bachelors-programs/business-and-economics/overview/selection-procedure-bbe-1/",
    diplomaLink: "https://www.wu.ac.at/en/programs/application-and-admission",
    checkedOn: "25 November 2026",
  },


  /* ── DENMARK ───────────────────────────────────── */
  copenhagen: {
    applicationDeadline: "15 March 2027",
    applicationDeadlineMonth: 3,
    scholarships: false,
    requirements: [
      "Apply on optagelse.dk by 15 March 2027, 12:00 noon CET: applicants with a foreign diploma are assessed in quota 2 (and in quota 1 if the grade can be converted to the Danish scale); the diploma must be passed by 5 July",
      "All bachelor programmes at the University of Copenhagen are taught in Danish: you need academic Danish, e.g. by passing 'Studieprøven i dansk som andetsprog'",
      "Programme-specific subject levels (e.g. mathematics) are checked against your diploma",
    ],
    applicationLink: "https://www.ku.dk/studies/bachelor/admission-requirements/diplomas-from-eu-eea-countries",
    applicationPlatform: "optagelse.dk",
    diplomaLink: "https://www.ku.dk/studies/admission/bachelor",
    checkedOn: "13 November 2026",
  },

  dtu: {
    applicationDeadline: "15 March 2027",
    applicationDeadlineMonth: 3,
    scholarships: false,
    requirements: [
      "Apply on optagelse.dk by 15 March 2027, 12:00 noon CET: applicants with a foreign diploma are assessed in quota 2 (and in quota 1 if the grade can be converted to the Danish scale); the diploma must be passed by 5 July",
      "General Engineering (English): Mathematics A, Physics B, Chemistry B and English B (Danish levels, converted by DTU) plus IELTS 6.5 or TOEFL iBT 88; a personal statement is part of the application",
      "Software Technology is taught in Danish: danish-taught programmes require academic Danish (e.g. 'Studieprøven i dansk som andetsprog')",
    ],
    applicationLink: "https://www.dtu.dk/english/education/undergraduate/general-engineering/admission-and-deadlines/admission-requirements",
    applicationPlatform: "optagelse.dk",
    diplomaLink: "https://www.dtu.dk/english/education/undergraduate/general-engineering/admission-and-deadlines/admission-requirements",
    checkedOn: "13 November 2026",
  },

  aarhus: {
    applicationDeadline: "15 March 2027",
    applicationDeadlineMonth: 3,
    scholarships: false,
    requirements: [
      "Apply on optagelse.dk by 15 March 2027, 12:00 noon CET: applicants with a foreign diploma are assessed in quota 2 (and in quota 1 if the grade can be converted to the Danish scale); the diploma must be passed by 5 July",
      "Economics and Business Administration (English): English B, Mathematics B and one of History, History of Ideas, Social Studies, Contemporary History or International Economics at B level",
      "In quota 2 you are ranked on your grades in English and mathematics plus documented relevant qualifications (also due 15 March)",
      "English: IELTS 6.5 (6.0 in each part) or TOEFL equivalent",
      "Computer Science is taught in Danish: danish-taught programmes require academic Danish (e.g. 'Studieprøven i dansk som andetsprog')",
      "Most European general upper-secondary exams qualify; other diplomas may need a year of university studies",
    ],
    applicationLink: "https://bachelor.au.dk/en/economics-and-business-administration",
    applicationPlatform: "optagelse.dk",
    diplomaLink: "https://bachelor.au.dk/en/international-applicants/quota1and2",
    checkedOn: "13 November 2026",
  },

  cbs: {
    applicationDeadline: "15 March 2027",
    applicationDeadlineMonth: 3,
    scholarships: false,
    requirements: [
      "Apply on optagelse.dk by 15 March 2027, 12:00 noon CET; documents proving the entry requirements can be uploaded until 5 July 2027, 12:00 noon",
      "Places are split between quota 1 (GPA only) and quota 2 (motivational essay, activities since school, grades in the required subjects). A foreign diploma is assessed in quota 2, and in quota 1 too if its grades can be converted to the Danish scale",
      "International Business: English B with at least 6.0, Mathematics B, and History, Social Studies or International Economics at B level (Danish levels: how your diploma maps onto them depends on the country)",
      "English-taught programmes also require English at Danish level A, or an accepted equivalent",
      "Non-EU/EEA applicants (outside Switzerland) pay a €150 application fee by 15 March",
    ],
    applicationLink: "https://www.cbs.dk/en/study-programmes/bachelor-programmes/application-and-admission",
    applicationPlatform: "optagelse.dk",
    diplomaLink: "https://www.cbs.dk/en/study-programmes/bachelor-programmes/application-and-admission#23763-standard-assessments-of-upper-secondary-exams",
    checkedOn: "25 November 2026",
  },


  /* ── SWEDEN ────────────────────────────────────── */
  kth: {
    applicationDeadline: "15 April 2027",
    applicationDeadlineMonth: 4,
    scholarships: false,
    requirements: [
      "Swedish-taught programme: apply in the national round on universityadmissions.se, 15 March to 15 April 2027",
      "Swedish at upper-secondary level 'Svenska 3' (e.g. TISUS test) and English 6 are required, plus programme-specific subjects",
      "Engineering programmes also require advanced upper-secondary mathematics, physics and chemistry",
      "Places are allocated on grades and on the Swedish Scholastic Aptitude Test (högskoleprovet)",
      "Your upper-secondary education must give general eligibility for university studies; the documents required depend on the country where you studied",
    ],
    applicationLink: "https://www.universityadmissions.se/",
    applicationPlatform: "universityadmissions.se",
    diplomaLink: "https://www.universityadmissions.se/en/apply-to-bachelors/provide-application-documents-bachelors/country-instructions/",
    checkedOn: "13 November 2026",
  },

  lund: {
    applicationDeadline: "15 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "International round on universityadmissions.se: apply between 16 October 2026 and 15 January 2027; supporting documents and fee by 1 February 2027; results on 8 April 2027",
      "The English-taught bachelor's programmes are also open in the second round (15 March to 15 April 2027) if places remain",
      "English 6 level (e.g. IELTS 6.5 with no part below 5.5, or TOEFL iBT 90)",
      "Programme-specific requirements (e.g. mathematics) are listed on each programme page",
      "Your upper-secondary education must give general eligibility for university studies; the documents required depend on the country where you studied",
    ],
    applicationLink: "https://www.lunduniversity.lu.se/apply",
    applicationPlatform: "universityadmissions.se",
    diplomaLink: "https://www.universityadmissions.se/en/apply-to-bachelors/provide-application-documents-bachelors/country-instructions/",
    checkedOn: "13 November 2026",
  },

  stockholm: {
    applicationDeadline: "15 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "International round on universityadmissions.se: apply between 16 October 2026 and 15 January 2027; supporting documents and fee by 1 February 2027; results on 8 April 2027",
      "English 6 level (e.g. IELTS 6.5 with no part below 5.5, or TOEFL iBT 90)",
      "Programme-specific requirements are listed on each programme page",
      "Your upper-secondary education must give general eligibility for university studies; the documents required depend on the country where you studied",
    ],
    applicationLink: "https://www.universityadmissions.se/",
    applicationPlatform: "universityadmissions.se",
    diplomaLink: "https://www.universityadmissions.se/en/apply-to-bachelors/provide-application-documents-bachelors/country-instructions/",
    checkedOn: "13 November 2026",
  },

  uppsala: {
    applicationDeadline: "15 April 2027",
    applicationDeadlineMonth: 4,
    scholarships: false,
    requirements: [
      "Swedish-taught programme: apply in the national round on universityadmissions.se, 15 March to 15 April 2027",
      "Swedish at upper-secondary level 'Svenska 3' (e.g. TISUS test) and English 6 are required, plus programme-specific subjects",
      "Medicine is highly competitive: places go by grades and by the Swedish Scholastic Aptitude Test (högskoleprovet), which is in Swedish",
      "Your upper-secondary education must give general eligibility for university studies; the documents required depend on the country where you studied",
    ],
    applicationLink: "https://www.uu.se/en/study/bachelors-studies/application",
    applicationPlatform: "universityadmissions.se",
    diplomaLink: "https://www.universityadmissions.se/en/apply-to-bachelors/provide-application-documents-bachelors/country-instructions/",
    checkedOn: "13 November 2026",
  },

  chalmers: {
    applicationDeadline: "15 April 2027",
    applicationDeadlineMonth: 4,
    scholarships: false,
    requirements: [
      "Swedish-taught programme: apply in the national round on universityadmissions.se, 15 March to 15 April 2027",
      "Swedish at upper-secondary level 'Svenska 3' (e.g. TISUS test) and English 6 are required, plus programme-specific subjects",
      "Engineering programmes also require advanced upper-secondary mathematics, physics and chemistry",
      "Your upper-secondary education must give general eligibility for university studies; the documents required depend on the country where you studied",
    ],
    applicationLink: "https://www.universityadmissions.se/",
    applicationPlatform: "universityadmissions.se",
    diplomaLink: "https://www.universityadmissions.se/en/apply-to-bachelors/provide-application-documents-bachelors/country-instructions/",
    checkedOn: "13 November 2026",
  },

  gothenburg: {
    applicationDeadline: "15 April 2027",
    applicationDeadlineMonth: 4,
    scholarships: false,
    requirements: [
      "Swedish-taught programme: apply in the national round on universityadmissions.se, 15 March to 15 April 2027",
      "Swedish at upper-secondary level 'Svenska 3' (e.g. TISUS test) and English 6 are required, plus programme-specific subjects",
      "Your upper-secondary education must give general eligibility for university studies; the documents required depend on the country where you studied",
    ],
    applicationLink: "https://www.universityadmissions.se/",
    applicationPlatform: "universityadmissions.se",
    diplomaLink: "https://www.universityadmissions.se/en/apply-to-bachelors/provide-application-documents-bachelors/country-instructions/",
    checkedOn: "13 November 2026",
  },


  /* ── NORWAY ────────────────────────────────────── */
  oslo: {
    applicationDeadline: "15 April 2027",
    applicationDeadlineMonth: 4,
    scholarships: false,
    requirements: [
      "Apply through Samordna opptak by 15 April 2027 (the 1 March deadline applies only to special categories such as early admission)",
      "Applicants educated outside the Nordic countries must document both Norwegian and English when applying",
      "Economics also requires upper-secondary mathematics equivalent to at least one Norwegian advanced course (R1, R2, S1 or S2)",
      "Upper-secondary education from outside Norway must meet the requirements set for your country in the national GSU list",
    ],
    applicationLink: "https://www.uio.no/studier/program/samfunnsokonomi/opptak/",
    applicationPlatform: "Samordna opptak",
    diplomaLink: "https://hkdir.no/en/foreign-education/lists-and-databases/higher-education-entrance-qualification-gsu",
    checkedOn: "13 November 2026",
  },


  /* ── UNITED KINGDOM ────────────────────────────── */
  oxford: {
    applicationDeadline: "Mid-October 2027 (2028 entry)",
    applicationDeadlineMonth: 10,
    scholarships: false,
    requirements: [
      "Apply via UCAS: the 2027-entry deadline was 15 October 2026; for 2028 entry it falls in mid-October 2027",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
      "Most courses require an admissions test and shortlisted candidates are interviewed (December)",
    ],
    applicationLink: "https://www.ox.ac.uk/admissions/undergraduate/courses/admissions-requirements/international-qualifications",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.ox.ac.uk/admissions/undergraduate/courses/admissions-requirements/international-qualifications",
    checkedOn: "13 November 2026",
  },

  ucl: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.ucl.ac.uk/study/international/region",
    checkedOn: "13 November 2026",
  },

  lse: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.lse.ac.uk/study-at-lse/international-students/country-pages",
    checkedOn: "13 November 2026",
  },

  cambridge: {
    applicationDeadline: "Mid-October 2027 (2028 entry)",
    applicationDeadlineMonth: 10,
    scholarships: false,
    requirements: [
      "Apply via UCAS: the 2027-entry deadline was 15 October 2026; for 2028 entry it falls in mid-October 2027",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
      "Most courses require an admissions test; shortlisted applicants are interviewed",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.undergraduate.study.cam.ac.uk/international-students/international-entry-requirements",
    checkedOn: "13 November 2026",
  },

  imperial: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
      "Some courses require an admissions test and/or interview",
    ],
    applicationLink: "https://www.imperial.ac.uk/study/apply/undergraduate/process/entry-requirements/accepted-qualifications/",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.imperial.ac.uk/study/apply/undergraduate/entry-requirements/accepted-qualifications/",
    checkedOn: "13 November 2026",
  },

  edinburgh: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.ed.ac.uk/studying/international/european-union-undergraduate-entry-requirements",
    checkedOn: "13 November 2026",
  },

  "kings-college-london": {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.kcl.ac.uk/study/undergraduate/how-to-apply/entry-requirements",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.kcl.ac.uk/study/international",
    checkedOn: "13 November 2026",
  },

  warwick: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://warwick.ac.uk/study/undergraduate/courses/ug-international-qualifications/",
    applicationPlatform: "UCAS",
    diplomaLink: "https://warwick.ac.uk/study/undergraduate/courses/ug-international-qualifications/",
    checkedOn: "13 November 2026",
  },

  manchester: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.manchester.ac.uk/study/international/country-specific-information/",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.cs.manchester.ac.uk/study/international-students/country-specific-information/",
    checkedOn: "13 November 2026",
  },

  bristol: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.bristol.ac.uk/international/countries/",
    checkedOn: "13 November 2026",
  },

  durham: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.durham.ac.uk/study/international/regional-pages/europe-/",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.durham.ac.uk/study/international/",
    checkedOn: "13 November 2026",
  },

  glasgow: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.gla.ac.uk/international/country/",
    checkedOn: "13 November 2026",
  },

  birmingham: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.birmingham.ac.uk/international/students/country",
    checkedOn: "13 November 2026",
  },

  leeds: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.leeds.ac.uk/international-entry-requirements",
    checkedOn: "13 November 2026",
  },

  sheffield: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS 6.0 minimum (some departments ask more)",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.sheffield.ac.uk/international/entry-requirements",
    checkedOn: "13 November 2026",
  },

  nottingham: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.nottingham.ac.uk/studywithus/international-applicants/country-info/country-information.aspx",
    checkedOn: "13 November 2026",
  },

  "queen-mary": {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.qmul.ac.uk/international-students/regions/",
    checkedOn: "13 November 2026",
  },

  southampton: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.southampton.ac.uk/international/entry-qualification-equivalencies",
    checkedOn: "13 November 2026",
  },

  "st-andrews": {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.st-andrews.ac.uk/subjects/entry/",
    checkedOn: "13 November 2026",
  },

  bath: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.bath.ac.uk/corporate-information/entry-requirements-for-international-students/",
    checkedOn: "14 November 2026",
  },

  exeter: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.exeter.ac.uk/international-students/entry-requirements/",
    checkedOn: "13 November 2026",
  },

  liverpool: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.liverpool.ac.uk/undergraduate/applying/applying-through-ucas/entry-requirements-and-qualifications/",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.liverpool.ac.uk/international/countries/",
    checkedOn: "13 November 2026",
  },

  newcastle: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS 6.5 with no component below 5.5 for most courses",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.ncl.ac.uk/international/country/",
    checkedOn: "13 November 2026",
  },

  york: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic 6.5 with 6.0 in each component for most courses",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.york.ac.uk/study/international/your-country/",
    checkedOn: "13 November 2026",
  },

  lancaster: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.lancaster.ac.uk/study/undergraduate/international-qualifications/",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.lancaster.ac.uk/study/entry-requirements/undergraduate-qualifications/",
    checkedOn: "13 November 2026",
  },

  "queens-belfast": {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.qub.ac.uk/Study/international-students/your-country/",
    checkedOn: "13 November 2026",
  },

  cardiff: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: normally IELTS 6.5 overall (varies by course)",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.cardiff.ac.uk/study/international/your-country",
    checkedOn: "13 November 2026",
  },

  reading: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.reading.ac.uk/ready-to-study/international-and-eu/country-specific-information",
    checkedOn: "13 November 2026",
  },

  loughborough: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.lboro.ac.uk/international/country/",
    checkedOn: "13 November 2026",
  },

  strathclyde: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.strath.ac.uk/studywithus/internationalstudents/entryrequirements/",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.strath.ac.uk/studywithus/internationalstudents/entryrequirements/",
    checkedOn: "13 November 2026",
  },

  surrey: {
    applicationDeadline: "13 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply via UCAS by 13 January 2027, 18:00 UK time (equal-consideration date for 2027 entry)",
      "Required grades depend on your school-leaving qualification and on the course: the university publishes the equivalent of its A-level offers for each country",
      "English: IELTS Academic or equivalent, minimum set by each course",
      "UCAS application with personal statement and a teacher reference",
    ],
    applicationLink: "https://www.ucas.com/applying/applying-university",
    applicationPlatform: "UCAS",
    diplomaLink: "https://www.surrey.ac.uk/apply/entry-requirements",
    checkedOn: "13 November 2026",
  },


  /* ── IRELAND ───────────────────────────────────── */
  "trinity-dublin": {
    applicationDeadline: "1 February 2027",
    applicationDeadlineMonth: 2,
    scholarships: false,
    requirements: [
      "Apply via CAO by 1 February 2027, 17:00 (late applications until 1 May 2027)",
      "Your school-leaving certificate must meet Trinity's minimum entry requirements for your country; results are converted into CAO points",
      "Course cut-off points change every year; some courses add subject requirements",
      "Certified copy of the school reports for the final two years with the CAO application",
    ],
    applicationLink: "https://www.cao.ie/",
    applicationPlatform: "CAO",
    diplomaLink: "https://www.tcd.ie/study/country/",
    checkedOn: "13 November 2026",
  },

  ucd: {
    applicationDeadline: "1 February 2027",
    applicationDeadlineMonth: 2,
    scholarships: false,
    requirements: [
      "Apply via CAO by 1 February 2027, 17:00 (late applications until 1 May 2027)",
      "School-leaving certificates from other EU/EFTA countries must meet the same minimum matriculation and subject requirements as Irish applicants; results are converted into CAO points using the EU/EFTA equivalence tables",
      "Places are allocated on points, and cut-offs change every year",
      "Certified copies and certified English translations of school-leaving documents",
    ],
    applicationLink: "https://www.ucd.ie/registry/prospectivestudents/admissions/undergraduateapplicants/euapplicants/",
    applicationPlatform: "CAO",
    diplomaLink: "https://www.ucd.ie/registry/prospectivestudents/admissions/undergraduateapplicants/euapplicants/",
    checkedOn: "13 November 2026",
  },

  ucc: {
    applicationDeadline: "1 February 2027",
    applicationDeadlineMonth: 2,
    scholarships: false,
    requirements: [
      "Apply via CAO by 1 February 2027, 17:00 (late applications until 1 May 2027)",
      "School-leaving results from other EU/EFTA/UK systems are converted into Irish Leaving Certificate grades and CAO points; each programme's subject requirements still apply",
    ],
    applicationLink: "https://www.ucc.ie/en/study/undergrad/entryreqs/euapply/",
    applicationPlatform: "CAO",
    diplomaLink: "https://www.ucc.ie/en/study/undergrad/entryreqs/euapply/",
    checkedOn: "13 November 2026",
  },


  /* ── FINLAND ───────────────────────────────────── */
  helsinki: {
    applicationDeadline: "19 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "With a national school-leaving certificate other than the Finnish matriculation examination, IB, EB, RP or DIA, you apply in admission group 1, based on SAT or ACT results: 5 to 19 January 2027 on Studyinfo.fi",
      "You cannot choose the admission group or apply in both periods; group 2 (9 to 23 March 2027) is for Finnish matriculation, IB, EB and similar diplomas",
      "Proof of English is required with the application",
    ],
    applicationLink: "https://www.helsinki.fi/en/admissions-and-education/apply-bachelors-and-masters-programmes/apply-bachelors-programmes",
    applicationPlatform: "Studyinfo.fi",
    diplomaLink: "https://www.helsinki.fi/en/admissions-and-education/apply-bachelors-and-masters-programmes/eligibility-higher-education",
    checkedOn: "13 November 2026",
  },

  aalto: {
    applicationDeadline: "22 January 2027",
    applicationDeadlineMonth: 1,
    scholarships: false,
    requirements: [
      "Apply on Studyinfo.fi between 7 and 22 January 2027; high-school diploma applicants are selected in round A on SAT or ACT results, which must reach Aalto by 29 January 2027",
      "International Business: SAT at least 1200 or ACT at least 25",
      "Science and Technology: SAT at least 1350 with Maths at least 700, or ACT at least 29 with Maths at least 30",
      "Only tests taken on or after 1 January 2025 count",
      "Your school-leaving qualification must give access to university in the country where it was awarded",
    ],
    applicationLink: "https://www.aalto.fi/en/admission-services/english-taught-bachelors-programmes-i-am-applying-with-a-high-school-diploma",
    applicationPlatform: "Studyinfo.fi",
    diplomaLink: "https://www.aalto.fi/en/admission-services/english-taught-bachelors-programmes-i-am-applying-with-a-high-school-diploma",
    checkedOn: "13 November 2026",
  },


  /* ── CZECH REPUBLIC ────────────────────────────── */
  "charles-prague": {
    applicationDeadline: "28 February 2027",
    applicationDeadlineMonth: 2,
    scholarships: false,
    requirements: [
      "Faculty of Social Sciences, Economics and Finance (BEF): application deadline 28 February 2027",
      "Faculty of Humanities, Liberal Arts and Humanities: rolling applications from 1 November 2026 to 31 March 2027",
      "BEF selection: up to 45 points for mathematics (e.g. SAT, IB or the faculty's own route), 45 for English and 10 for CV and motivation letter; English IELTS 6.5 (6.0 in each part) or equivalent",
      "Tuition for English-taught degrees: 7,000 euros a year (BEF), 5,000 euros a year (Liberal Arts and Humanities)",
      "Foreign secondary education must be recognised (nostrification, or assessment by the faculty); the IB and European Baccalaureate are accepted without it",
    ],
    applicationLink: "https://cuni.cz/UKEN-1632.html",
    diplomaLink: "https://fhs.cuni.cz/FHSENG-912.html",
    checkedOn: "13 November 2026",
  },


  /* ── LUXEMBOURG ────────────────────────────────── */
  luxembourg: {
    applicationDeadline: "Expected July 2027",
    applicationDeadlineMonth: 7,
    scholarships: false,
    requirements: [
      "Applications for 2027-28 open on 1 February 2027; in 2026 EU applicants could apply until 15 July (submission by 22 July)",
      "English at B2 level (certificate required); French or German at B1 advised",
      "Diplomas not issued by the Luxembourg Ministry of Education need a recognition of equivalence from that ministry; EU/EEA/Swiss applicants can apply before receiving it and get a conditional acceptance",
    ],
    applicationLink: "https://www.uni.lu/fstm-en/study-programs/bachelor-in-computer-science/admissions/",
    diplomaLink: "https://www.uni.lu/en/admissions/admission-criteria/",
    checkedOn: "14 November 2026",
  },


  /* ── HUNGARY ───────────────────────────────────── */
  semmelweis: {
    applicationDeadline: "31 May 2027",
    applicationDeadlineMonth: 5,
    scholarships: false,
    requirements: [
      "Apply by 31 May 2027; entrance exam in biology, chemistry, English and biomedical English, with results within two weeks",
      "You must be 18 by the end of May 2027; final-year students upload the school-leaving certificate by 21 August 2027",
      "Secondary school leaving certificate: there is no minimum grade, the entrance exam decides",
    ],
    applicationLink: "https://semmelweis.hu/admission/programs/medicine/",
    diplomaLink: "https://semmelweis.hu/admission/programs/medicine/",
    checkedOn: "13 November 2026",
  },


  /* ── ESTONIA ───────────────────────────────────── */
  tartu: {
    applicationDeadline: "Expected 15 April 2027",
    applicationDeadlineMonth: 4,
    scholarships: false,
    requirements: [
      "Apply on DreamApply: in the current cycle the window runs from 2 January to 15 April, with a 100 euro fee due by the deadline; 2027 details are published by the end of December",
      "Places in 2026-27: 25 in Business Administration, 50 in Science and Technology",
      "Certified English translation of the diploma and proof of English proficiency by the deadline",
      "The documents required depend on the country of your diploma (certified copies, apostille where needed)",
    ],
    applicationLink: "https://ut.ee/en/content/frequently-asked-questions",
    applicationPlatform: "DreamApply",
    diplomaLink: "https://ut.ee/en/content/country-specific-requirements",
    checkedOn: "13 November 2026",
  },
};
