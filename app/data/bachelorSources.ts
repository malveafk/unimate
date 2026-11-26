// Where each programme's course list comes from, shown under "Curriculum" on the programme page.
// Keyed "<university id>/<bachelor id>", the same ids as app/data/universities.ts.
//
// checkedOn is the day the course names on our page were compared with these official
// sources. A programme with courses but no entry here shows "source not yet documented"
// instead of a link: check-universities.ts lists them. Details of each check are in
// university-data-log.md.

export type CurriculumSource = {
  url: string;
  label: string;      // text of the link: the page title, or "<site> (PDF)"
};

export type BachelorSource = {
  sources: CurriculumSource[];  // one or more official pages that together list the courses
  checkedOn: string;            // "D Month YYYY"
};

export const bachelorSources: Record<string, BachelorSource> = {
  "aalto/international-business": {
    sources: [
      { url: "https://www.aalto.fi/en/programmes/bachelors-programme-in-international-business/curriculum-2026-2028", label: "Curriculum 2026–2028 | Aalto University" },
    ],
    checkedOn: "26 November 2026",
  },
  "aalto/science-and-technology": {
    sources: [
      { url: "https://www.aalto.fi/en/programmes/aalto-bachelors-programme-in-science-and-technology/curriculum-2026-2028", label: "Curriculum 2026–2028 | Aalto University" },
    ],
    checkedOn: "26 November 2026",
  },
  "aarhus/computer-science": {
    sources: [
      { url: "https://bachelor.au.dk/datalogi", label: "Bacheloruddannelsen i Datalogi | Aarhus Universitet (studiets opbygning)" },
    ],
    checkedOn: "26 November 2026",
  },
  "aarhus/economics-business-administration": {
    sources: [
      { url: "https://bachelor.au.dk/en/economics-and-business-administration", label: "Bachelor's degree programme in Economics and Business Administration" },
    ],
    checkedOn: "26 November 2026",
  },
  "amsterdam/computer-science": {
    sources: [
      { url: "https://www.uva.nl/bachelor/bacheloropleidingen/informatica/studieprogramma", label: "Studieprogramma - Bachelor Informatica - Universiteit van Amsterdam" },
    ],
    checkedOn: "26 November 2026",
  },
  "amsterdam/economics-business-economics": {
    sources: [
      { url: "https://www.uva.nl/en/bachelors/bachelorsprogrammes/economics--business-economics/study-programme", label: "The study programme - Bachelor's Economics and Business Economics - University of Amsterdam" },
    ],
    checkedOn: "26 November 2026",
  },
  "amsterdam/political-science": {
    sources: [
      { url: "https://www.uva.nl/en/bachelors/bachelorsprogrammes/political-science/study-programme", label: "Study programme - Bachelor's Political Science - University of Amsterdam" },
    ],
    checkedOn: "26 November 2026",
  },
  "barcelona/economics": {
    sources: [
      { url: "https://www.ub.edu/guiaacademica/?codEnsenyament=TG1115&curs=2026&idioma=ESP", label: "Universitat de Barcelona, Guía académica 2026/2027, Grado en Economía" },
    ],
    checkedOn: "26 November 2026",
  },
  "barcelona/medicine": {
    sources: [
      { url: "https://www.ub.edu/guiaacademica/?codEnsenyament=TG1046&curs=2026&idioma=ESP", label: "Universitat de Barcelona, Guía académica 2026/2027, Grado en Medicina (plan 2009)" },
    ],
    checkedOn: "26 November 2026",
  },
  "basel/business-and-economics": {
    sources: [
      { url: "https://wwz.unibas.ch/fileadmin/user_upload/wwz/01_Studiendekanat/01_Publikationen/01_01_Wegleitungen/2025_Wegleitung_WWZ_Bachelorstudium.pdf", label: "wwz.unibas.ch (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "bath/computer-science": {
    sources: [
      { url: "https://www.bath.ac.uk/courses/undergraduate-2027/computer-science/bsc-computer-science/", label: "Computer Science BSc (Hons)" },
    ],
    checkedOn: "26 November 2026",
  },
  "bath/economics": {
    sources: [
      { url: "https://www.bath.ac.uk/courses/undergraduate-2027/economics/bsc-economics/", label: "Economics BSc (Hons)" },
    ],
    checkedOn: "26 November 2026",
  },
  "bern/economics": {
    sources: [
      { url: "https://www.vwi.unibe.ch/e195368/e757672/e757678/e1529659/UNI_VWL_Broschuere_RZ_04_ger.pdf", label: "vwi.unibe.ch (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "birmingham/computer-science": {
    sources: [
      { url: "https://www.birmingham.ac.uk/study/undergraduate/subjects/computer-science-courses/computer-science-bsc", label: "Computer Science BSc - University of Birmingham Skip to main content" },
    ],
    checkedOn: "26 November 2026",
  },
  "birmingham/economics": {
    sources: [
      { url: "https://www.birmingham.ac.uk/study/undergraduate/subjects/economics-courses/economics-bsc", label: "Economics BSc - University of Birmingham (module information, 2027/28 entry)" },
    ],
    checkedOn: "26 November 2026",
  },
  "bocconi/economics": {
    sources: [
      { url: "https://www.unibocconi.it/en/programs/bachelor-science/economics/study-plan", label: "Study Plan | Bocconi University" },
    ],
    checkedOn: "26 November 2026",
  },
  "bocconi/finance": {
    sources: [
      { url: "https://www.unibocconi.it/en/programs/bachelor-science/finance/study-plan", label: "Study Plan | Bocconi University" },
    ],
    checkedOn: "26 November 2026",
  },
  "bocconi/international-politics-government": {
    sources: [
      { url: "https://www.unibocconi.it/en/programs/bachelor-science/international-politics-and-government/study-plan", label: "Study Plan | Bocconi University" },
    ],
    checkedOn: "26 November 2026",
  },
  "bocconi/management": {
    sources: [
      { url: "https://www.unibocconi.it/en/programs/bachelor-science/management/study-plan", label: "Study Plan | Bocconi University" },
    ],
    checkedOn: "26 November 2026",
  },
  "bocconi/management-computer-science": {
    sources: [
      { url: "https://www.unibocconi.it/en/programs/bachelor-science/management-and-computer-science/study-plan", label: "Study Plan | Bocconi University" },
    ],
    checkedOn: "26 November 2026",
  },
  "bochum/it-security": {
    sources: [
      { url: "https://informatik.rub.de/wp-content/uploads/2026/03/MHB-BSc-ITS-SoSe-26.pdf", label: "Ruhr-Universität Bochum, Modulhandbuch B.Sc. IT-Sicherheit, SoSe 2026" },
    ],
    checkedOn: "26 November 2026",
  },
  "bologna/engineering-energy": {
    sources: [
      { url: "https://corsi.unibo.it/laurea/IngegneriaEnergetica/insegnamenti/piano/2026/6678/B13/000/2026", label: "Insegnamenti: piano didattico - A.A. 2026/2027 — Ingegneria energetica - Laurea - Bologna" },
    ],
    checkedOn: "26 November 2026",
  },
  "bologna/law": {
    sources: [
      { url: "https://corsi.unibo.it/magistralecu/Giurisprudenza-Bologna/il-corso/all-e-regolamento-parte-normativa-26-27.pdf", label: "corsi.unibo.it (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "bonn/economics": {
    sources: [
      { url: "https://www.econ.uni-bonn.de/de/studium/studienangebot/wirtschaftswissenschaften/modulhandbuecher/31b_modulhandbuch-bsc-vwl_wiwi-po2024_sose2026_2.pdf/@@download/file/31b_Modulhandbuch%20BSc%20VWL_Wiwi%20PO2024_SoSe2026_2.pdf", label: "econ.uni-bonn.de (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "bristol/economics": {
    sources: [
      { url: "https://www.bris.ac.uk/unit-programme-catalogue/RouteStructureCohort.jsa?ayrCode=27/28&byCohort=Y&programmeCode=9ECON001U", label: "University of Bristol programme catalogue, BSc Economics, 2027/28 cohort (year 1)" },
      { url: "https://www.bris.ac.uk/unit-programme-catalogue/RouteStructureCohort.jsa?byCohort=Y&cohort=Y&routeLevelCode=2&ayrCode=27%2F28&modeOfStudyCode=Full%20Time&programmeCode=9ECON001U", label: "Same catalogue, year 2" },
    ],
    checkedOn: "26 November 2026",
  },
  "cambridge/computer-science": {
    sources: [
      { url: "https://www.undergraduate.study.cam.ac.uk/courses/computer-science-ba-hons-meng", label: "Computer Science, BA (Hons) and MEng | Undergraduate Study" },
    ],
    checkedOn: "26 November 2026",
  },
  "cambridge/economics": {
    sources: [
      { url: "https://www.undergraduate.study.cam.ac.uk/courses/economics-ba-hons", label: "Economics, BA (Hons) | Undergraduate Study" },
    ],
    checkedOn: "26 November 2026",
  },
  "cardiff/computer-science": {
    sources: [
      { url: "https://www.cardiff.ac.uk/study/undergraduate/courses/course/computer-science-bsc", label: "Computer Science (BSc) - Study - Cardiff University" },
    ],
    checkedOn: "26 November 2026",
  },
  "cardiff/economics": {
    sources: [
      { url: "https://www.cardiff.ac.uk/study/undergraduate/courses/course/economics-bsc", label: "Economics (BSc) - Study - Cardiff University" },
    ],
    checkedOn: "26 November 2026",
  },
  "cbs/international-business": {
    sources: [
      { url: "https://studieordninger.cbs.dk/2026/ba/1355", label: "Programme regulations BSc in International Business, 2026" },
    ],
    checkedOn: "25 November 2026",
  },
  "ceu/culture-politics-society": {
    sources: [
      { url: "https://www.ceu.edu/academics/degrees/ba-culture-politics-society", label: "The BA in Culture, Politics and Society Degree at CEU" },
    ],
    checkedOn: "26 November 2026",
  },
  "ceu/philosophy-politics-economics": {
    sources: [
      { url: "https://www.ceu.edu/academics/degrees/ba-philosophy-politics-economics", label: "Study BA in Philosophy, Politics and Economics at CEU" },
    ],
    checkedOn: "26 November 2026",
  },
  "chalmers/computer-science-engineering": {
    sources: [
      { url: "https://www.chalmers.se/utbildning/dina-studier/hitta-kurs-och-programplaner/programplaner/TKDAT/", label: "Gå till innehållet" },
    ],
    checkedOn: "26 November 2026",
  },
  "charles-prague/economics-finance-management": {
    sources: [
      { url: "https://fsv.cuni.cz/en/admissions/bachelors-degrees/bachelor-economics-and-finance-bef/details", label: "Detailed information | Fakulta sociálních věd UK" },
    ],
    checkedOn: "26 November 2026",
  },
  "charles-prague/liberal-arts-humanities": {
    sources: [
      { url: "https://humanities.fhs.cuni.cz/SHVENG-44.html", label: "Study Plan in Detail - Liberal Arts and Humanities, Faculty of Humanities, Charles University" },
    ],
    checkedOn: "26 November 2026",
  },
  "cologne/business-administration": {
    sources: [
      { url: "https://wiso.uni-koeln.de/sites/fakultaet/dokumente/downloads/Modulhandbuecher/Bachelor_MHB_aktuelles_Studienjahr/b_mhb_po2021_bwl.pdf", label: "wiso.uni-koeln.de (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "complutense/law": {
    sources: [
      { url: "https://biblioteca.ucm.es/estudios/2025-26/grado-derecho2020-plan", label: "Biblioteca Complutense" },
    ],
    checkedOn: "26 November 2026",
  },
  "complutense/political-science": {
    sources: [
      { url: "https://www.ucm.es/estudios/grado-cienciaspoliticas-plan", label: "Universidad Complutense de Madrid" },
    ],
    checkedOn: "26 November 2026",
  },
  "copenhagen/computer-science": {
    sources: [
      { url: "https://www.ku.dk/studier/bachelor/datalogi", label: "Bachelor i datalogi" },
    ],
    checkedOn: "26 November 2026",
  },
  "copenhagen/economics": {
    sources: [
      { url: "https://www.ku.dk/studier/bachelor/oekonomi", label: "Bachelor i økonomi - uddannelser på Københavns Universitet" },
    ],
    checkedOn: "26 November 2026",
  },
  "copenhagen/political-science": {
    sources: [
      { url: "https://www.ku.dk/studier/bachelor/statskundskab", label: "Bachelor i statskundskab - uddannelser på Københavns Universitet" },
    ],
    checkedOn: "26 November 2026",
  },
  "dtu/general-engineering": {
    sources: [
      { url: "https://student.dtu.dk/en/programme-specifications/bachelor-of-science-in-engineering/general-engineering/current-study-plan", label: "Study plan 2026 - General Engineering" },
    ],
    checkedOn: "26 November 2026",
  },
  "dtu/software-technology": {
    sources: [
      { url: "https://student.dtu.dk/studieordninger/bachelor/softwareteknologi/studieplan", label: "Studieplan for Softwareteknologi" },
    ],
    checkedOn: "26 November 2026",
  },
  "durham/economics": {
    sources: [
      { url: "https://www.durham.ac.uk/business/courses/economics-l100/", label: "Economics L100 - Durham University" },
    ],
    checkedOn: "26 November 2026",
  },
  "ecole-polytechnique/bachelor-of-science": {
    sources: [
      { url: "https://synapses.polytechnique.fr/catalogue/2026-2027/parcours/76/BS-S1-bachelor-of-sciences-semestre-1", label: "BX-S1 - Bachelor of Sciences - Semestre 1 | Catalogue 2026-2027 | SynapseS" },
    ],
    checkedOn: "26 November 2026",
  },
  "edinburgh/computer-science": {
    sources: [
      { url: "https://www.drps.ed.ac.uk/26-27/dpt/utcmpsi.htm", label: "DPT: Computer Science (BSc Hons) (UTCMPSI)" },
    ],
    checkedOn: "26 November 2026",
  },
  "ens-lyon/cpes-science-society-economics": {
    sources: [
      { url: "https://www.ens-lyon.fr/sites/default/files/2024-12/Fiche-parcours-CPES-Parc-ENS-2025.pdf", label: "ens-lyon.fr (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "ens-lyon/cpes-science-society-sciences": {
    sources: [
      { url: "https://www.ens-lyon.fr/sites/default/files/2024-12/Fiche-parcours-CPES-Parc-ENS-2025.pdf", label: "ens-lyon.fr (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "epfl/computer-science": {
    sources: [
      { url: "https://edu.epfl.ch/studyplan/fr/propedeutique/informatique/", label: "Propédeutique & MAN - Informatique - EPFL" },
      { url: "https://edu.epfl.ch/studyplan/en/bachelor/computer-science/", label: "Bachelor Cycle - Computer Science - EPFL" },
    ],
    checkedOn: "26 November 2026",
  },
  "epfl/mechanical-engineering": {
    sources: [
      { url: "https://edu.epfl.ch/studyplan/fr/bachelor/genie-mecanique/", label: "Cycle Bachelor - Génie mécanique - EPFL" },
      { url: "https://edu.epfl.ch/studyplan/fr/propedeutique/genie-mecanique/", label: "Propédeutique & MAN - Génie mécanique - EPFL" },
    ],
    checkedOn: "26 November 2026",
  },
  "erasmus/ibeb": {
    sources: [
      { url: "https://www.eur.nl/en/bachelor/international-bachelor-economics-and-business-economics/programme-overview", label: "Programme overview Bachelor International Bachelor Economics and Business Economics | Erasmus University Ro..." },
    ],
    checkedOn: "26 November 2026",
  },
  "erasmus/international-business-administration": {
    sources: [
      { url: "https://www.rsm.nl/fileadmin/Service_departments/Examination_board/BScIBA_-TER_2026-2027__established_25_August_2026_.pdf", label: "RSM Teaching and Examination Regulations BSc IBA 2026-2027, Annex 1" },
    ],
    checkedOn: "25 November 2026",
  },
  "eth-zurich/computer-science": {
    sources: [
      { url: "https://www.vvz.ethz.ch/Vorlesungsverzeichnis/sucheLehrangebot.view?lang=de&search=on&semkez=2026W&studiengangTyp=BSC&deptId=5&studiengangAbschnittId=&lerneinheitstitel=&lerneinheitscode=&famname=&rufname=&wahlinfo=&lehrsprache=&periodizitaet=&katalogdaten=&_strukturAus=on&search=Suchen", label: "Vorlesungsverzeichnis - ETH Zürich" },
      { url: "https://inf.ethz.ch/studies/bachelor.html", label: "Bachelor's Programme – Department of Computer Science | ETH Zurich" },
    ],
    checkedOn: "26 November 2026",
  },
  "eth-zurich/mathematics": {
    sources: [
      { url: "https://ethz.ch/content/dam/ethz/main/education/bachelor/mathematik-angewandte-mathematik/files/math_bsc_guide_2024_de.pdf", label: "ethz.ch (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "exeter/computer-science": {
    sources: [
      { url: "https://www.exeter.ac.uk/undergraduate-degrees/bsc-computer-science/", label: "BSc Computer Science | BCS Accredited Degree | University of Exeter" },
    ],
    checkedOn: "26 November 2026",
  },
  "exeter/economics": {
    sources: [
      { url: "https://www.exeter.ac.uk/undergraduate-degrees/bsc-economics/", label: "BSc Economics | Triple-Accredited Business School | University of Exeter" },
    ],
    checkedOn: "26 November 2026",
  },
  "fau-erlangen/molecular-medicine": {
    sources: [
      { url: "https://www.doc.zuv.fau.de//L1/PO/Med/Molekulare_Medizin/konsolidierte_Fassungen/BSc_Molekulare_Medizin-MSc_Molecular_Medicine_PO_MolMed_20230822_idF_20250711.pdf", label: "FAU Prüfungsordnung B.Sc. Molekulare Medizin, consolidated version of 11 July 2025 (Anlage 1)" },
    ],
    checkedOn: "26 November 2026",
  },
  "freiburg/liberal-arts-and-sciences": {
    sources: [
      { url: "https://uni-freiburg.de/ucf/wp-content/uploads/sites/22/Module-Handbook-LAS-StuPO-2020-12-2024.pdf", label: "uni-freiburg.de (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "fu-berlin/psychology": {
    sources: [
      { url: "https://www.ewi-psy.fu-berlin.de/verwaltung-service/studienangelegenheiten/pruefungsbuero/studienbuero_psy/download/Studienordnung-E.pdf", label: "ewi-psy.fu-berlin.de (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "geneva/international-relations": {
    sources: [
      { url: "https://www.unige.ch/gsi/application/files/3917/5679/6808/Guide_partie_1_annee_25_26_def.pdf", label: "unige.ch (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "ghent/business-economics": {
    sources: [
      { url: "https://www.ugent.be/eb/nl/student/curriculuminfo/curriculum/curriculumsamenstellen/hw/structuur-hw.htm", label: "Structuur van de opleiding Handelswetenschappen — Faculteit Economie en Bedrijfskunde — Universiteit Gent" },
    ],
    checkedOn: "26 November 2026",
  },
  "glasgow/economics": {
    sources: [
      { url: "https://www.gla.ac.uk/undergraduate/degrees/economics/", label: "University of Glasgow - Undergraduate study - 2027 Degree programmes A‑Z - Economics" },
    ],
    checkedOn: "26 November 2026",
  },
  "goettingen/economics": {
    sources: [
      { url: "https://www.uni-goettingen.de/de/document/download/294b9879dc07eba913a4de59fc11ddf5.pdf/BA%20VWL%20Mono_neues%20Konzept%20zum%20WiSe%202026%2027_20260129.pdf", label: "uni-goettingen.de (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "gothenburg/business-economics": {
    sources: [
      { url: "https://www.gu.se/studera/hitta-utbildning/ekonomie-kandidatprogrammet-kurser-och-valmojligheter", label: "Ekonomie kandidatprogrammet: Kurser och valmöjligheter | Göteborgs universitet" },
    ],
    checkedOn: "26 November 2026",
  },
  "groningen/economics-business-economics": {
    sources: [
      { url: "https://www.rug.nl/bachelors/economics-and-business-economics/#programme", label: "Economie en Bedrijfseconomie | Bacheloropleidingen | Rijksuniversiteit Groningen" },
    ],
    checkedOn: "26 November 2026",
  },
  "groningen/international-business": {
    sources: [
      { url: "https://www.rug.nl/bachelors/international-business/#programme", label: "International Business | Bacheloropleidingen | Rijksuniversiteit Groningen" },
    ],
    checkedOn: "26 November 2026",
  },
  "groningen/international-relations-international-organization": {
    sources: [
      { url: "https://www.rug.nl/bachelors/international-relations-and-international-organization/#programme", label: "Internationale Betrekkingen en Internationale Organisatie | Bacheloropleidingen | Rijksuniversiteit Groningen" },
    ],
    checkedOn: "26 November 2026",
  },
  "groningen/medicine": {
    sources: [
      { url: "https://www.rug.nl/umcg/education/geneeskunde/bachelor/g2020-programma-bachelor-geneeskunde-2026-2027.pdf", label: "rug.nl (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "hamburg/business-administration": {
    sources: [
      { url: "https://www.bwl.uni-hamburg.de/studium/bachelor-studiengaenge/bachelor-of-science-bwl/informationen-bachelor-reform-2627-aktualisiert.pdf", label: "bwl.uni-hamburg.de (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "heidelberg/molecular-biotechnology": {
    sources: [
      { url: "https://backend.uni-heidelberg.de/de/dokumente/studien-und-pruefungsordnung-molekulare-biotechnologie-ba-2025-02-04/download", label: "backend.uni-heidelberg.de (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "helsinki/computer-science": {
    sources: [
      { url: "https://www.helsinki.fi/en/degree-programmes/science-bachelors-programme/studying", label: "Studying | Science | Bachelor's programme | University of Helsinki" },
    ],
    checkedOn: "26 November 2026",
  },
  "helsinki/liberal-arts-sciences": {
    sources: [
      { url: "https://www.helsinki.fi/en/degree-programmes/liberal-arts-and-sciences-bachelors-programme/studying/structure-programme", label: "Structure of the programme | Liberal Arts and Sciences | University of Helsinki" },
    ],
    checkedOn: "26 November 2026",
  },
  "ie-university/business-administration": {
    sources: [
      { url: "https://www.ie.edu/university/studies/academic-programs/bachelor-business-administration/the-program/", label: "Study Plan - Bachelor in Business Administration | IE University" },
    ],
    checkedOn: "26 November 2026",
  },
  "ie-university/computer-science-ai": {
    sources: [
      { url: "https://www.ie.edu/university/studies/academic-programs/bachelor-computer-science-artificial-intelligence/the-program/", label: "Study Plan - Bachelor in Computer Science & AI | IE University" },
    ],
    checkedOn: "26 November 2026",
  },
  "ie-university/international-relations": {
    sources: [
      { url: "https://www.ie.edu/university/studies/academic-programs/bachelor-international-relations/the-program/", label: "Study Plan - Bachelor in International Relations | IE University" },
    ],
    checkedOn: "26 November 2026",
  },
  "imperial/computing": {
    sources: [
      { url: "https://www.imperial.ac.uk/study/courses/undergraduate/computing-beng/", label: "Computing BEng | Study | Imperial College London" },
    ],
    checkedOn: "26 November 2026",
  },
  "kings-college-london/law": {
    sources: [
      { url: "https://www.kcl.ac.uk/study/undergraduate/courses/law-llb/teaching-modules", label: "Teaching & Modules - Law LLB | King's College London (2027 entry)" },
    ],
    checkedOn: "26 November 2026",
  },
  "kit-karlsruhe/computer-science": {
    sources: [
      { url: "https://www.informatik.kit.edu/downloads/studium/SPO22_Informatik_Uebersicht_Studienplanung.pdf", label: "informatik.kit.edu (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "kth/computer-science": {
    sources: [
      { url: "https://www.kth.se/student/kurser/program/CDATE/20262/arskurs1", label: "KTH utbildningsplan CDATE, kull HT2026, årskurs 1" },
      { url: "https://www.kth.se/student/kurser/program/CDATE/20262/arskurs2", label: "KTH utbildningsplan CDATE, kull HT2026, årskurs 2" },
      { url: "https://www.kth.se/student/kurser/program/CDATE/20262/arskurs3", label: "KTH utbildningsplan CDATE, kull HT2026, årskurs 3" },
    ],
    checkedOn: "26 November 2026",
  },
  "kth/engineering-physics": {
    sources: [
      { url: "https://www.kth.se/student/kurser/program/CTFYS/20262/arskurs1", label: "KTH utbildningsplan CTFYS, kull HT2026, årskurs 1" },
      { url: "https://www.kth.se/student/kurser/program/CTFYS/20262/arskurs2", label: "KTH utbildningsplan CTFYS, kull HT2026, årskurs 2" },
      { url: "https://www.kth.se/student/kurser/program/CTFYS/20262/arskurs3", label: "KTH utbildningsplan CTFYS, kull HT2026, årskurs 3" },
    ],
    checkedOn: "26 November 2026",
  },
  "kth/industrial-engineering": {
    sources: [
      { url: "https://www.kth.se/student/kurser/program/CINEK/20262/arskurs1", label: "KTH utbildningsplan CINEK, kull HT2026, årskurs 1" },
      { url: "https://www.kth.se/student/kurser/program/CINEK/20262/arskurs2", label: "KTH utbildningsplan CINEK, kull HT2026, årskurs 2" },
      { url: "https://www.kth.se/student/kurser/program/CINEK/20262/arskurs3", label: "KTH utbildningsplan CINEK, kull HT2026, årskurs 3" },
    ],
    checkedOn: "26 November 2026",
  },
  "ku-leuven/economics": {
    sources: [
      { url: "https://onderwijsaanbod.kuleuven.be/opleidingen/n/SC_51016746.htm", label: "Bachelor in de economische wetenschappen (Leuven) - Studieprogramma" },
    ],
    checkedOn: "26 November 2026",
  },
  "ku-leuven/engineering": {
    sources: [
      { url: "https://onderwijsaanbod.kuleuven.be/opleidingen/e/SC_57861104.htm", label: "Bachelor in de ingenieurswetenschappen (programma voor studenten gestart in 2024-2025 of later) (Leuven) - ..." },
    ],
    checkedOn: "26 November 2026",
  },
  "lancaster/computer-science": {
    sources: [
      { url: "https://www.lancaster.ac.uk/study/undergraduate/courses/computer-science-bsc-hons-g400/2027/", label: "-->" },
    ],
    checkedOn: "26 November 2026",
  },
  "lancaster/economics": {
    sources: [
      { url: "https://www.lancaster.ac.uk/study/undergraduate/courses/economics-bsc-hons-l100/2027/", label: "-->" },
    ],
    checkedOn: "26 November 2026",
  },
  "leeds/computer-science": {
    sources: [
      { url: "https://catalogue.leeds.ac.uk/Programme/202627?code=BSCS-R", label: "Undergraduate module Catalogue : Module and Programme Catalogue" },
    ],
    checkedOn: "26 November 2026",
  },
  "leeds/economics": {
    sources: [
      { url: "https://courses.leeds.ac.uk/f836/economics-bsc", label: "Economics BSc | University of Leeds" },
    ],
    checkedOn: "26 November 2026",
  },
  "leiden/international-relations": {
    sources: [
      { url: "https://studiegids.universiteitleiden.nl/studies/BA-POWE-IRO?tab=study-structure&year=2261", label: "Leiden University prospectus 2026-2027, International Relations and Organisations" },
    ],
    checkedOn: "25 November 2026",
  },
  "lisbon/economics": {
    sources: [
      { url: "https://www.iseg.ulisboa.pt/en/study/undergraduate/economics", label: "Economics - ISEG" },
    ],
    checkedOn: "26 November 2026",
  },
  "liverpool/computer-science": {
    sources: [
      { url: "https://www.liverpool.ac.uk/courses/computer-science-bsc-hons", label: "Computer Science BSc (Hons) | Courses | University of Liverpool" },
    ],
    checkedOn: "26 November 2026",
  },
  "liverpool/economics": {
    sources: [
      { url: "https://www.liverpool.ac.uk/courses/economics-bsc-hons", label: "Economics BSc (Hons) | Courses | University of Liverpool" },
    ],
    checkedOn: "26 November 2026",
  },
  "lmu-munich/economics": {
    sources: [
      { url: "https://www.lmu.de/de/studium/studienangebot/alle-studienfaecher-und-studiengaenge/volkswirtschaftslehre-bachelor-hauptfach-3027.html", label: "Volkswirtschaftslehre (Bachelor/Hauptfach) 3027 - LMU München" },
    ],
    checkedOn: "26 November 2026",
  },
  "lmu-munich/law": {
    sources: [
      { url: "https://www.lmu.de/de/studium/studienangebot/alle-studienfaecher-und-studiengaenge/rechtswissenschaft-erste-juristische-pruefung-hauptfach-5427.html", label: "Rechtswissenschaft (Erste Juristische Prüfung) | LMU München" },
    ],
    checkedOn: "26 November 2026",
  },
  "lmu-munich/medicine": {
    sources: [
      { url: "https://www.lmu.de/de/studium/studienangebot/alle-studienfaecher-und-studiengaenge/medizin-1.-studienabschnitt-staatsexamen-hauptfach-5392.html", label: "Medizin 1. Studienabschnitt (Staatsexamen/Hauptfach) 5 … - LMU München" },
    ],
    checkedOn: "26 November 2026",
  },
  "loughborough/computer-science": {
    sources: [
      { url: "https://www.lboro.ac.uk/study/undergraduate/courses/computer-science-bsc/", label: "Computer Science BSc | Undergraduate study | Loughborough University" },
    ],
    checkedOn: "26 November 2026",
  },
  "loughborough/economics": {
    sources: [
      { url: "https://www.lboro.ac.uk/study/undergraduate/courses/economics/", label: "Economics BSc | Undergraduate study | Loughborough University" },
    ],
    checkedOn: "26 November 2026",
  },
  "lse/economics": {
    sources: [
      { url: "https://www.lse.ac.uk/resources/calendar2026-2027/programmeRegulations/undergraduate/2026/BScEconomics.htm", label: "LSE Calendar 2026/27, programme regulations BSc Economics" },
    ],
    checkedOn: "26 November 2026",
  },
  "lse/international-relations": {
    sources: [
      { url: "https://www.lse.ac.uk/resources/calendar2026-2027/programmeRegulations/undergraduate/2026/BScInternationalRelations.htm", label: "LSE Calendar 2026/27, programme regulations BSc International Relations" },
    ],
    checkedOn: "26 November 2026",
  },
  "lund/economy-society": {
    sources: [
      { url: "https://www.lunduniversity.lu.se/study/economy-and-society-bachelors-programme-EGESO/programme-structure", label: "Programme structure | Economy and Society - Bachelor's Programme | Lund University" },
    ],
    checkedOn: "26 November 2026",
  },
  "lund/international-business": {
    sources: [
      { url: "https://www.lunduniversity.lu.se/study/international-business-bachelors-programme-EGIBU/programme-structure", label: "Programme structure | International Business - Bachelor's Programme | Lund University" },
    ],
    checkedOn: "26 November 2026",
  },
  "luxembourg/computer-science": {
    sources: [
      { url: "https://www.uni.lu/fstm-en/study-programs/bachelor-in-computer-science/programme/", label: "Bachelor in Computer Science: Courses | University of Luxembourg" },
    ],
    checkedOn: "26 November 2026",
  },
  "maastricht/econometrics-operations-research": {
    sources: [
      { url: "https://www.maastrichtuniversity.nl/education/bachelor/programmes/econometrics-operations-research/courses-and-curriculum", label: "Econometrics & Operations Research: courses and curriculum | Maastricht University" },
    ],
    checkedOn: "26 November 2026",
  },
  "maastricht/economics-business-and-economics": {
    sources: [
      { url: "https://sbeosp.maastrichtuniversity.nl/ay2026-2027/sc2501_s1.htm", label: "Bachelor Economics and Business Economics | Specialisation Economics 2026-2027" },
    ],
    checkedOn: "26 November 2026",
  },
  "maastricht/european-law-school": {
    sources: [
      { url: "https://courserepository.maastrichtuniversity.nl/p/program/EN/50017324", label: "Maastricht University course catalogue 2026-2027, Bachelor European Law School" },
    ],
    checkedOn: "26 November 2026",
  },
  "maastricht/international-business": {
    sources: [
      { url: "https://www.maastrichtuniversity.nl/education/bachelor/programmes/international-business/courses-and-curriculum", label: "International Business - Come study at Maastricht University! - Maastricht University" },
      { url: "https://www.maastrichtuniversity.nl/education/bachelor/programmes/economics-and-business-economics/courses-and-curriculum", label: "Economics and Business Economics - Come study at Maastricht University! - Maastricht University" },
    ],
    checkedOn: "26 November 2026",
  },
  "maastricht/psychology": {
    sources: [
      { url: "https://www.maastrichtuniversity.nl/file/fpn-eer-2026-2027-bapsyennlcurriculum20242026-2027paedefpdf", label: "maastrichtuniversity.nl (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "mainz/communication-studies": {
    sources: [
      { url: "https://cms.zdv.uni-mainz.de/ifp-studium/wp-content/uploads/sites/906/2025/09/Modulhandbuch-BA-Publizistik-2023-Kernfach_18.06.2024.pdf", label: "cms.zdv.uni-mainz.de (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "manchester/computer-science": {
    sources: [
      { url: "https://www.manchester.ac.uk/study/undergraduate/courses/2027/00560/bsc-computer-science/course-details/", label: "BSc Computer Science - course details (2027 entry) | The University of Manchester" },
    ],
    checkedOn: "26 November 2026",
  },
  "muenster/business-administration": {
    sources: [
      { url: "https://www.wiwi.uni-muenster.de/fakultaet/de/studium/studiengaenge/bachelor/bwl/studium", label: "Aufbau des Studiums | Wirtschaftswissenschaftliche Fakultät" },
    ],
    checkedOn: "26 November 2026",
  },
  "newcastle/computer-science": {
    sources: [
      { url: "https://www.ncl.ac.uk/undergraduate/degrees/g400/", label: "Computer Science BSc | Undergraduate | Newcastle University Computer Science | Undergraduate | Newcastle Un..." },
    ],
    checkedOn: "26 November 2026",
  },
  "newcastle/economics": {
    sources: [
      { url: "https://www.ncl.ac.uk/undergraduate/degrees/l100/", label: "Economics BSc Honours | Undergraduate | Newcastle University Economics | Undergraduate | Newcastle Universi..." },
    ],
    checkedOn: "26 November 2026",
  },
  "nottingham/computer-science": {
    sources: [
      { url: "https://www.nottingham.ac.uk/studywithus/ugstudy/courses/UG/Computer-Science-BSc-Hons.html", label: "Computer Science BSc (Hons) | University of Nottingham" },
    ],
    checkedOn: "26 November 2026",
  },
  "nottingham/economics": {
    sources: [
      { url: "https://www.nottingham.ac.uk/studywithus/ugstudy/courses/UG/Economics-BSc-Hons.html", label: "Economics BSc (Hons) | University of Nottingham" },
    ],
    checkedOn: "26 November 2026",
  },
  "nova-lisbon/economics": {
    sources: [
      { url: "https://www.novasbe.unl.pt/en/programs/bachelors/economics/program", label: "Bachelor's in Economics - Program | Nova SBE" },
    ],
    checkedOn: "26 November 2026",
  },
  "nova-lisbon/management": {
    sources: [
      { url: "https://www.novasbe.unl.pt/en/programs/bachelors/management/program", label: "Program - Bachelor in Management | Nova SBE" },
    ],
    checkedOn: "26 November 2026",
  },
  "oslo/economics": {
    sources: [
      { url: "https://www.uio.no/studier/program/samfunnsokonomi/oppbygging/", label: "Oppbygging og gjennomføring – Samfunnsøkonomi (bachelor) – Universitetet i Oslo" },
    ],
    checkedOn: "26 November 2026",
  },
  "oxford/engineering-science": {
    sources: [
      { url: "https://www.ox.ac.uk/admissions/undergraduate/courses/course-listing/engineering-science", label: "Engineering Science | Oxford University" },
    ],
    checkedOn: "26 November 2026",
  },
  "oxford/ppe": {
    sources: [
      { url: "https://www.ox.ac.uk/admissions/undergraduate/courses/course-listing/philosophy-politics-and-economics", label: "Philosophy, Politics and Economics | Oxford University" },
    ],
    checkedOn: "26 November 2026",
  },
  "padua/information-engineering": {
    sources: [
      { url: "https://apply.unipd.it/courses/course/182-information-engineering", label: "Information Engineering - University of Padua" },
    ],
    checkedOn: "26 November 2026",
  },
  "padua/psychological-science": {
    sources: [
      { url: "https://apply.unipd.it/courses/course/27-psychological-science", label: "Psychological Science - University of Padua" },
    ],
    checkedOn: "26 November 2026",
  },
  "pantheon-sorbonne/economics-international-track": {
    sources: [
      { url: "https://www.pantheonsorbonne.fr/sites/default/files/2026-03/Fiche%20licence%20Economie%202026%202027.pdf", label: "pantheonsorbonne.fr (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "pantheon-sorbonne/law": {
    sources: [
      { url: "https://www.pantheonsorbonne.fr/sites/default/files/2026-10/Fiche%20licence%20Droit%202027%202028.pdf", label: "pantheonsorbonne.fr (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "paris-saclay/mathematics-computer-science": {
    sources: [
      { url: "https://www.universite-paris-saclay.fr/formation/licence/informatique/l1-portail-mathematiques-informatique-mi", label: "L1 Portail Mathématiques, Informatique (MI) | Université Paris-Saclay (programme)" },
    ],
    checkedOn: "26 November 2026",
  },
  "polimi/computer-science-engineering": {
    sources: [
      { url: "https://onlineservices.polimi.it/manifesti/manifesti/controller/ManifestoPublic.do?evn_default=EVENTO&aa=2026&k_cf=225&k_corso_la=531&ac_ins=0&k_indir=IT1&lang=IT&tipoCorso=ALL_TIPO_CORSO&semestre=ALL_SEMESTRI", label: "Manifesti degli Studi" },
      { url: "https://onlineservices.polimi.it/manifesti/manifesti/controller/ManifestoPublic.do?evn_default=EVENTO&aa=2026&k_cf=225&k_corso_la=531&ac_ins=0&k_indir=I3I&lang=IT&tipoCorso=ALL_TIPO_CORSO&semestre=ALL_SEMESTRI", label: "Manifesti degli Studi" },
    ],
    checkedOn: "26 November 2026",
  },
  "polimi/design": {
    sources: [
      { url: "https://onlineservices.polimi.it/manifesti/manifesti/controller/ManifestoPublic.do?evn_default=EVENTO&aa=2026&k_cf=19&k_corso_la=1020&ac_ins=0&k_indir=P1&lang=IT&tipoCorso=ALL_TIPO_CORSO&semestre=ALL_SEMESTRI", label: "Politecnico di Milano, Manifesto degli studi 2026/27, Design del prodotto industriale" },
      { url: "https://onlineservices.polimi.it/manifesti/manifesti/controller/extra/RegolamentoPublic.do?jaf_currentWFID=main&EVN_DEFAULT=evento&aa=2026&k_corso_la=1020&lang=IT", label: "Regolamento didattico 2026/27, Design del prodotto industriale" },
    ],
    checkedOn: "26 November 2026",
  },
  "polito/computer-engineering": {
    sources: [
      { url: "https://www.polito.it/en/education/bachelor-s-degree-programmes/computer-engineering/programme-curriculum", label: "Programme curriculum | Politecnico di Torino" },
    ],
    checkedOn: "26 November 2026",
  },
  "polito/mechanical-engineering": {
    sources: [
      { url: "https://www.polito.it/en/education/bachelor-s-degree-programmes/mechanical-engineering/programme-curriculum", label: "Programme curriculum | Politecnico di Torino" },
    ],
    checkedOn: "26 November 2026",
  },
  "pompeu-fabra/global-studies": {
    sources: [
      { url: "https://www.upf.edu/en/web/grau-obert/estudis-globals", label: "Global Studies - Open Bachelor's Degree Programme (UPF), first-year subjects" },
    ],
    checkedOn: "26 November 2026",
  },
  "porto/economics": {
    sources: [
      { url: "https://programmes.fep.up.pt/bachelors/economics/", label: "Bachelor in Economics | FEP" },
    ],
    checkedOn: "26 November 2026",
  },
  "porto/engineering-informatics": {
    sources: [
      { url: "https://fe.up.pt/estudar/wp-content/uploads/2024/07/LEIC-65460_folha-de-curso-feup-5.pdf", label: "fe.up.pt (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "psl/international-bachelor-ai": {
    sources: [
      { url: "https://static.psl.eu/sites/default/files/plaquette_bsai_psl_2025.pdf", label: "static.psl.eu (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "queen-mary/computer-science": {
    sources: [
      { url: "https://www.qmul.ac.uk/undergraduate/coursefinder/courses/2027/computer-science/", label: "honeypot link" },
    ],
    checkedOn: "26 November 2026",
  },
  "queen-mary/economics": {
    sources: [
      { url: "https://www.qmul.ac.uk/undergraduate/coursefinder/courses/2027/economics/", label: "honeypot link" },
    ],
    checkedOn: "26 November 2026",
  },
  "queens-belfast/computer-science": {
    sources: [
      { url: "https://www.qub.ac.uk/courses/undergraduate/computer-science-professional-experience-bsc-g400/", label: "Computer Science Professional Experience | Courses | Queen's University Belfast" },
    ],
    checkedOn: "26 November 2026",
  },
  "queens-belfast/economics": {
    sources: [
      { url: "https://www.qub.ac.uk/courses/undergraduate/economics-bsc-l100/", label: "Economics | Courses | Queen's University Belfast" },
    ],
    checkedOn: "26 November 2026",
  },
  "radboud/artificial-intelligence": {
    sources: [
      { url: "https://www.ru.nl/en/education/bachelors/artificial-intelligence/curriculum-and-courses/year-1", label: "Study programme bachelor Artificial Intelligence year 1 | Radboud University" },
      { url: "https://www.ru.nl/en/education/bachelors/artificial-intelligence/curriculum-and-courses/year-2", label: "Study programme bachelor Artificial Intelligence year 2 | Radboud University" },
    ],
    checkedOn: "26 November 2026",
  },
  "radboud/psychology": {
    sources: [
      { url: "https://www.ru.nl/en/education/bachelors/psychology/curriculum-and-courses/year-1", label: "Study programme Bachelor Psychology year 1 | Radboud University" },
      { url: "https://www.ru.nl/en/education/bachelors/psychology/curriculum-and-courses/year-2", label: "Study programme Bachelor Psychology year 2 | Radboud University" },
      { url: "https://www.ru.nl/en/education/bachelors/psychology/curriculum-and-courses/year-3", label: "Study programme Bachelor Psychology year 3 | Radboud University" },
    ],
    checkedOn: "26 November 2026",
  },
  "reading/computer-science": {
    sources: [
      { url: "https://www.reading.ac.uk/ready-to-study/study/subject-area/computer-science-ug/bsc-computer-science", label: "BSc Computer Science, University of Reading - 2027/28" },
    ],
    checkedOn: "26 November 2026",
  },
  "reading/economics": {
    sources: [
      { url: "https://www.reading.ac.uk/ready-to-study/study/subject-area/economics-ug/bsc-economics", label: "BSc Economics - 2027/28" },
    ],
    checkedOn: "26 November 2026",
  },
  "rwth-aachen/computer-science": {
    sources: [
      { url: "https://sc.informatik.rwth-aachen.de/de/studium/bachelor/informatik/aufbau-und-ablauf/", label: "Aufbau und Ablauf – Bachelor PO 2022 – Studiencenter Informatik" },
    ],
    checkedOn: "26 November 2026",
  },
  "sapienza/applied-computer-science-ai": {
    sources: [
      { url: "https://corsidilaurea.uniroma1.it/en/course/33502/study-plan", label: "Applied Computer Science and Artificial Intelligence | Course catalogue" },
    ],
    checkedOn: "26 November 2026",
  },
  "sciences-po/social-sciences": {
    sources: [
      { url: "https://www.sciencespo.fr/en/news/what-do-undergraduates-study-at-sciences-po/", label: "What Do Undergraduates Study at Sciences Po? | Sciences Po Go to content" },
    ],
    checkedOn: "26 November 2026",
  },
  "semmelweis/general-medicine": {
    sources: [
      { url: "https://semmelweis.hu/registrar/files/2025/09/AOK-Medicine_Curriculum_2026-2027.xlsx", label: "Semmelweis University, Faculty of Medicine curriculum 2026/2027, English program (XLSX)" },
      { url: "https://semmelweis.hu/admission/programs/medicine/", label: "General Medicine | Semmelweis University (programme structure)" },
    ],
    checkedOn: "26 November 2026",
  },
  "sheffield/computer-science": {
    sources: [
      { url: "https://sheffield.ac.uk/undergraduate/courses/2027/computer-science-bsc", label: "Computer Science BSc | Undergraduate study | The University of Sheffield" },
    ],
    checkedOn: "26 November 2026",
  },
  "sheffield/economics": {
    sources: [
      { url: "https://sheffield.ac.uk/undergraduate/courses/2027/economics-bsc", label: "Economics BSc | Undergraduate study | The University of Sheffield" },
    ],
    checkedOn: "26 November 2026",
  },
  "sorbonne/lettres-modernes": {
    sources: [
      { url: "https://formations-lettres.sorbonne-universite.fr/plugins/odf-web/www/_content/program-llett1l-603-2/main/LICENCE%20Lettres%20_%20Lettres%20Modernes.pdf", label: "formations-lettres.sorbonne-universite.fr (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "sorbonne/medicine": {
    sources: [
      { url: "https://actesreglementaires.sorbonne-universite.fr/_resources/CAC/ComFVU/DEL/Sorbonne-Universite-CFVU-Delib-20250925.pdf?download=true", label: "Sorbonne Université, MCC PASS et LAS de la Faculté de Santé 2025-2026 (CFVU, 25 September 2025)" },
    ],
    checkedOn: "26 November 2026",
  },
  "southampton/computer-science": {
    sources: [
      { url: "https://www.southampton.ac.uk/courses/computer-science-degree-bsc", label: "Computer Science (Hons) | BSc | University of Southampton" },
    ],
    checkedOn: "26 November 2026",
  },
  "southampton/economics": {
    sources: [
      { url: "https://www.southampton.ac.uk/courses/economics-degree-bsc", label: "Economics Degree (Hons) | BSc | University of Southampton" },
    ],
    checkedOn: "26 November 2026",
  },
  "st-andrews/economics": {
    sources: [
      { url: "https://www.st-andrews.ac.uk/subjects/economics/economics-ma/", label: "Economics MA - Subjects - University of St Andrews" },
    ],
    checkedOn: "26 November 2026",
  },
  "st-andrews/international-relations": {
    sources: [
      { url: "https://www.st-andrews.ac.uk/subjects/international-relations/international-relations-ma/", label: "International Relations MA - Subjects - University of St Andrews" },
    ],
    checkedOn: "26 November 2026",
  },
  "stockholm/international-business-politics": {
    sources: [
      { url: "https://www.su.se/english/education/course-catalogue/si/sifpk", label: "Bachelor's Programme in International Business and Politics | Stockholm University" },
    ],
    checkedOn: "26 November 2026",
  },
  "stockholm/political-science": {
    sources: [
      { url: "https://www.su.se/english/education/course-catalogue/sp/spock", label: "International Bachelor's Programme in Political Science and Regional Studies | Stockholm University" },
    ],
    checkedOn: "26 November 2026",
  },
  "strathclyde/computer-science": {
    sources: [
      { url: "https://www.strath.ac.uk/courses/undergraduate/computersciencebsc/", label: "BSc Computer Science Degree Glasgow, UK | University of Strathclyde" },
    ],
    checkedOn: "26 November 2026",
  },
  "surrey/computer-science": {
    sources: [
      { url: "https://catalogue.surrey.ac.uk/2027-8/programme/UGA10-1", label: "Computer Science BSc (Hons) - 2027/8 - University of Surrey" },
    ],
    checkedOn: "26 November 2026",
  },
  "surrey/economics": {
    sources: [
      { url: "https://catalogue.surrey.ac.uk/2027-8/programme/ULC10-1", label: "Economics BSc (Hons) - 2027/8 - University of Surrey" },
    ],
    checkedOn: "26 November 2026",
  },
  "tartu/business-administration": {
    sources: [
      { url: "https://ois2.ut.ee/#/curricula/80995/version/2026/details", label: "University of Tartu study information system: Business Administration (80995), curriculum version 2026/2027" },
    ],
    checkedOn: "26 November 2026",
  },
  "tartu/science-and-technology": {
    sources: [
      { url: "https://ois2.ut.ee/#/curricula/144918/version/2026/details", label: "University of Tartu study information system: Science and Technology (144918), curriculum version 2026/2027" },
    ],
    checkedOn: "26 November 2026",
  },
  "tilburg/econometrics-and-operations-research": {
    sources: [
      { url: "https://www.tilburguniversity.edu/education/bachelors-programs/econometrics-and-operations-research/program-and-courses", label: "Program and courses Econometrics and Operations Research BSc | Tilburg University" },
    ],
    checkedOn: "26 November 2026",
  },
  "tilburg/economics": {
    sources: [
      { url: "https://www.tilburguniversity.edu/education/bachelors-programs/economics/program-and-courses", label: "Program and courses Economics BSc | Tilburg University (start September 2026)" },
    ],
    checkedOn: "26 November 2026",
  },
  "tilburg/international-business-administration": {
    sources: [
      { url: "https://www.tilburguniversity.edu/education/bachelors-programs/international-business-administration/program-and-courses", label: "Program and courses International Business Administration BSc | Tilburg University" },
    ],
    checkedOn: "26 November 2026",
  },
  "trinity-dublin/computer-science": {
    sources: [
      { url: "https://teaching.scss.tcd.ie/wp-content/uploads/sites/10/2025/09/Integrated-Computer-Science-Handbook-2025-2026-1.pdf", label: "teaching.scss.tcd.ie (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "trinity-dublin/law": {
    sources: [
      { url: "https://www.tcd.ie/law/programmes/undergraduate/modules/", label: "Modules - School of Law | Trinity College Dublin" },
    ],
    checkedOn: "26 November 2026",
  },
  "tu-berlin/computer-science": {
    sources: [
      { url: "https://www.static.tu.berlin/fileadmin/www/10000000/Studiengaenge/StuPOs/Fakultaet_IV/Informatik_B.Sc._2025.pdf", label: "static.tu.berlin (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "tu-delft/aerospace-engineering": {
    sources: [
      { url: "https://www.tudelft.nl/onderwijs/opleidingen/bachelors/ae/bsc-aerospace-engineering/about-the-programme/what-will-i-learn", label: "TU Delft BSc Aerospace Engineering: What will I learn? (curriculum from September 2027)" },
    ],
    checkedOn: "26 November 2026",
  },
  "tu-delft/computer-science": {
    sources: [
      { url: "https://www.tudelft.nl/onderwijs/opleidingen/bachelors/cse/bsc-computer-science-and-engineering/over-de-opleiding/wat-ga-ik-leren", label: "TU Delft BSc Computer Science and Engineering: Wat ga ik leren?" },
    ],
    checkedOn: "26 November 2026",
  },
  "tu-dresden/computer-science": {
    sources: [
      { url: "https://www.verw.tu-dresden.de/AmtBek/PDF-Dateien/2025-05/02_11soBA_Informatik22.05.2025.pdf", label: "verw.tu-dresden.de (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "tu-munich/computer-science": {
    sources: [
      { url: "https://www.cit.tum.de/cit/studium/studiengaenge/bachelor-informatik/studienplan/", label: "Studienpläne Bachelor Informatik - TUM - TUM School of Computation, Information and Technology" },
    ],
    checkedOn: "26 November 2026",
  },
  "tu-munich/management-technology": {
    sources: [
      { url: "https://www.tum.de/fileadmin/user_upload_87/gi32rab/17_274_V20231_Module_Catalog_B.Sc._Management_and_Technology_20250729.pdf", label: "tum.de (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "tu-munich/mechanical-engineering": {
    sources: [
      { url: "https://www.tum.de/fileadmin/user_upload_87/gi32rab/Maschinenwesen_BA_Neufassung_FPSO_08.03.2024.pdf", label: "TUM Fachprüfungs- und Studienordnung B.Sc. Maschinenwesen (Neufassung 8 March 2024)" },
    ],
    checkedOn: "26 November 2026",
  },
  "tu-wien/informatics": {
    sources: [
      { url: "https://www.tuwien.at/fileadmin/Assets/dienstleister/studienabteilung/BSc-Studienplaene_2025/Bachelorstudium_Informatik_2025.pdf", label: "tuwien.at (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "tu-wien/mechanical-engineering": {
    sources: [
      { url: "https://www.tuwien.at/fileadmin/Assets/dienstleister/studienabteilung/BSc-Studienplaene_2025/Bachelorstudium_Maschinenbau_2025.pdf", label: "tuwien.at (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "tue/computer-science-and-engineering": {
    sources: [
      { url: "https://educationguide.tue.nl/programs/bachelor-college/majors/computer-science-and-engineering/curriculum-start-year-20232024/major-courses", label: "Major Courses: 4 learning lines" },
    ],
    checkedOn: "26 November 2026",
  },
  "tuebingen/medical-informatics": {
    sources: [
      { url: "https://uni-tuebingen.de/fakultaeten/mathematisch-naturwissenschaftliche-fakultaet/fachbereiche/informatik/studium/studierende/downloads/modulhandbuecher-und-veranstaltungsverzeichnisse/bachelor-po-2021/", label: "Universität Tübingen, Modulhandbuch Informatik/Medizininformatik Bachelor PO 2021 (version 1 October 2026)" },
    ],
    checkedOn: "26 November 2026",
  },
  "twente/international-business-administration": {
    sources: [
      { url: "https://www.utwente.nl/en/education/bachelor/programmes/international-business-administration/study-programme/", label: "Study programme - Courses | BSc International Business Administration Skip to main content" },
    ],
    checkedOn: "26 November 2026",
  },
  "twente/technical-computer-science": {
    sources: [
      { url: "https://www.utwente.nl/en/tcs/education-programme/tcscurriculum-2/", label: "TCS BSc | Programme 2026-2027 Skip to main content" },
    ],
    checkedOn: "26 November 2026",
  },
  "uab/business-administration-and-management": {
    sources: [
      { url: "https://www.uab.cat/web/estudiar/ehea-degrees/study-plan/study-guides/business-administration-english-1345467897127.html?param1=1299656909532", label: "Study guides: Bachelor's Degree in Business Administration - English - UAB Barcelona" },
    ],
    checkedOn: "26 November 2026",
  },
  "uam/economics-bilingual": {
    sources: [
      { url: "https://www.uam.es/uam/media/doc/1607020282293/g-eco-bilin-26-27-final.pdf", label: "uam.es (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "uc3m/international-studies": {
    sources: [
      { url: "https://uc3m.es/bachelor-degree/international-studies", label: "Bachelor in International Studies | UC3M" },
    ],
    checkedOn: "26 November 2026",
  },
  "ucc/commerce": {
    sources: [
      { url: "https://www.ucc.ie/en/ck201/", label: "Commerce BComm | University College Cork | UCC | Ireland | Undergraduate Degree | Courses" },
    ],
    checkedOn: "26 November 2026",
  },
  "ucc/computer-science": {
    sources: [
      { url: "https://www.ucc.ie/en/ck401/", label: "Computer Science BSc | University College Cork | UCC | Ireland | Undergraduate Degree | Courses" },
    ],
    checkedOn: "26 November 2026",
  },
  "ucd/commerce": {
    sources: [
      { url: "https://hub.ucd.ie/usis/!W_HU_MENU.P_PUBLISH?p_tag=COURSE&MAJR=BSS1&AUDIENCE=Int", label: "Commerce" },
    ],
    checkedOn: "26 November 2026",
  },
  "ucd/economics-finance": {
    sources: [
      { url: "https://hub.ucd.ie/usis/!W_HU_MENU.P_PUBLISH?p_tag=COURSE&MAJR=BSS2&AUDIENCE=Int", label: "Economics & Finance" },
    ],
    checkedOn: "26 November 2026",
  },
  "ucl/computer-science": {
    sources: [
      { url: "https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/computer-science-bsc", label: "Computer Science BSc | Study at UCL" },
    ],
    checkedOn: "26 November 2026",
  },
  "ucl/economics": {
    sources: [
      { url: "https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/economics-bsc-econ", label: "Economics BSc (Econ) | Study at UCL" },
    ],
    checkedOn: "26 November 2026",
  },
  "uclouvain/economics-management": {
    sources: [
      { url: "https://uclouvain.be/prog-2026-ecge1ba.pdf", label: "uclouvain.be (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "uppsala/economics": {
    sources: [
      { url: "https://www.uu.se/utbildning/program/ekonomie-kandidatprogram", label: "Ekonomie kandidatprogram – Uppsala universitet" },
    ],
    checkedOn: "26 November 2026",
  },
  "uppsala/law": {
    sources: [
      { url: "https://www.uu.se/utbildning/program/juristprogrammet", label: "Juristprogrammet – Uppsala universitet" },
    ],
    checkedOn: "26 November 2026",
  },
  "uppsala/medicine": {
    sources: [
      { url: "https://www.uu.se/utbildning/program/lakarprogrammet", label: "Läkarprogrammet – Uppsala universitet" },
    ],
    checkedOn: "26 November 2026",
  },
  "utrecht/global-sustainability-science": {
    sources: [
      { url: "https://www.uu.nl/en/bachelors/global-sustainability-science/study-programme", label: "Study programme - Global Sustainability Science - Utrecht University Skip to main content" },
    ],
    checkedOn: "26 November 2026",
  },
  "utrecht/liberal-arts-sciences": {
    sources: [
      { url: "https://students.uu.nl/sites/default/files/ARR%202026-2027%20-%20for%20publication%2022%20July%202027.pdf", label: "UCU Academic Rules and Regulations 2026-2027" },
      { url: "https://www.uu.nl/en/bachelors/university-college-utrecht/study-programme", label: "Study programme | University College Utrecht" },
    ],
    checkedOn: "26 November 2026",
  },
  "uzh/business-administration": {
    sources: [
      { url: "https://www.oec.uzh.ch/dam/jcr:fac7470e-f31d-478e-a938-ccf8d0defda2/%c3%84nderungen%20Studienordnung%20SO22%20zu%20V2.0%20per%2001.08.2026.pdf", label: "oec.uzh.ch (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "uzh/law": {
    sources: [
      { url: "https://www.ius.uzh.ch/en/studies/study-courses/bachelor.html", label: "Bachelor of Law: Mono - 180 ECTS | Faculty of Law | UZH" },
    ],
    checkedOn: "26 November 2026",
  },
  "vienna/economics": {
    sources: [
      { url: "https://mtbl.univie.ac.at/storage/media/mtbl02/2025_2026/2025_2026_220.pdf", label: "mtbl.univie.ac.at (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "vienna/law": {
    sources: [
      { url: "https://senat.univie.ac.at/fileadmin/user_upload/senat/Curricularkommission/Diplomstudien/DS_Rechtswissenschaften_Version2025.pdf", label: "senat.univie.ac.at (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "vu-amsterdam/econometrics-data-science": {
    sources: [
      { url: "https://vu.nl/en/education/bachelor/econometrics-and-data-science/curriculum", label: "Bachelor's Econometrics and Data Science - VU Amsterdam" },
    ],
    checkedOn: "26 November 2026",
  },
  "vu-amsterdam/international-business-administration": {
    sources: [
      { url: "https://vu.nl/en/education/bachelor/international-business-administration/curriculum", label: "Bachelor's International Business Administration - VU Amsterdam" },
    ],
    checkedOn: "26 November 2026",
  },
  "vub/business-economics": {
    sources: [
      { url: "https://www.vub.be/en/studying-vub/all-study-programmes-vub/bachelors-and-masters-programmes-vub/bachelor-business-economics", label: "Bachelor Business Economics | Vrije Universiteit Brussel" },
    ],
    checkedOn: "26 November 2026",
  },
  "vub/social-sciences": {
    sources: [
      { url: "https://www.vub.be/en/studying-vub/all-study-programmes-vub/bachelors-and-masters-programmes-vub/bachelor-social-sciences", label: "Bachelor Social Sciences | Vrije Universiteit Brussel" },
    ],
    checkedOn: "26 November 2026",
  },
  "wageningen/data-science-for-global-challenges": {
    sources: [
      { url: "https://backend.wur.nl/sites/default/files/2026-10/BDS-vakkenschema-2026-EN.pdf", label: "backend.wur.nl (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "wageningen/environmental-sciences": {
    sources: [
      { url: "https://backend.wur.nl/sites/default/files/2026-10/BES-vakkenschema-2026-EN.pdf", label: "backend.wur.nl (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "warwick/economics": {
    sources: [
      { url: "https://warwick.ac.uk/study/undergraduate/courses/bsc-economics/", label: "Economics BSc | University of Warwick" },
    ],
    checkedOn: "26 November 2026",
  },
  "wu-vienna/business-and-economics": {
    sources: [
      { url: "https://www.wu.ac.at/fileadmin/wu/h/programs/bachelor/bbe/Curriculum/E_Business_and_Economics_29.01.25.pdf", label: "WU curriculum Business and Economics, effective 1 October 2025" },
      { url: "https://www.wu.ac.at/fileadmin/wu/h/programs/bachelor/bbe/BBE_Welcome_Days_2022/BBE-Welcome-Guide-2026.pdf", label: "BBE Welcome Guide 2026 (study plan by semester)" },
    ],
    checkedOn: "25 November 2026",
  },
  "wuerzburg/games-engineering": {
    sources: [
      { url: "https://www2.uni-wuerzburg.de/mhb/MHB1-de-82-i06-H-2025.pdf", label: "www2.uni-wuerzburg.de (PDF)" },
    ],
    checkedOn: "26 November 2026",
  },
  "york/computer-science": {
    sources: [
      { url: "https://www.york.ac.uk/study/undergraduate/courses/bsc-computer-science/", label: "Computer Science (BSc) - Undergraduate, University of York" },
    ],
    checkedOn: "26 November 2026",
  },
  "york/economics": {
    sources: [
      { url: "https://www.york.ac.uk/study/undergraduate/courses/bsc-economics/", label: "Economics (BSc) - Undergraduate, University of York" },
    ],
    checkedOn: "26 November 2026",
  },
};
