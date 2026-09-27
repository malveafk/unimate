-- Translates the university cost / teaching text in the live database from
-- Italian to simple English. Run once in the Supabase SQL Editor.
-- Safe: each line only changes a row whose text still matches the old Italian
-- version exactly, so anything edited since then is left alone. Numbers are
-- unchanged (checked against utils/universityCosts.ts).

begin;

update universities set tuition = 'CHF 1,460/year (Swiss residents); CHF 4,380/year if you move to Switzerland to study (from autumn 2025)' where tuition = 'CHF 1,460/anno residenti; CHF 4,380/anno per chi si trasferisce in Svizzera per studiare (dall''autunno 2025)';
update universities set tuition = 'CHF 500/semester (~€535), same for everyone' where tuition = 'CHF 500/semestre (~€535), stessa cifra per svizzeri e internazionali';
update universities set tuition = 'CHF 580/semester (~€620), same for everyone' where tuition = 'CHF 580/semestre (~€620), stessa cifra per svizzeri e internazionali';
update universities set tuition = 'CHF 730/semester (Swiss residents); CHF 2,190/semester if you move to Switzerland to study (from autumn 2025)' where tuition = 'CHF 730/semestre per chi risiedeva in Svizzera al diploma; CHF 2,190/semestre per chi si trasferisce per studiare (dall''autunno 2025)';
update universities set tuition = 'CHF 779/semester (~€830, Swiss residents); CHF 1,279/semester (~€1,360) for international students' where tuition = 'CHF 779/semestre (~€830) per chi risiedeva in Svizzera al diploma; CHF 1,279/semestre (~€1,360) per studenti internazionali (supplemento CHF 500 al bachelor)';
update universities set tuition = 'CHF 850/semester (~€905, Swiss residents); ~CHF 2,550/semester (~€2,715) for international students from autumn 2026' where tuition = 'CHF 850/semestre (~€905) per chi risiedeva in Svizzera al diploma; ~CHF 2,550/semestre (~€2,715) per studenti internazionali dall''autunno 2026';
update universities set tuition = 'CHF 850/semester (~€905), same for everyone' where tuition = 'CHF 850/semestre (~€905), stessa cifra per svizzeri e internazionali';
update universities set tuition = 'Free (EU/EEA) / €12,000/year (non-EU, English-taught)' where tuition = 'Gratis (EU/EEA) / €12,000/anno (non-EU, English-taught)';
update universities set tuition = 'Free (EU/EEA) / €13,000/year (non-EU, English-taught)' where tuition = 'Gratis (EU/EEA) / €13,000/anno (non-EU, English-taught programmes)';
update universities set tuition = 'Free (Czech-taught) / €4,200/year (EU, English-taught) / €7,100/year (non-EU, English-taught)' where tuition = 'Gratis (programmi in ceco) / €4,200/anno (EU, English-taught) / €7,100/anno (non-EU, English-taught)';
update universities set tuition = 'Free for EU students' where tuition = 'Gratuita per studenti UE';
update universities set tuition = '~€2,750/year student contribution (EU) / €26,000–€34,000/year (non-EU)' where tuition = 'Student contribution ~€2,750/anno (EU, con Free Fees Initiative) / €26,000–€34,000/anno (non-EU)';
update universities set tuition = '€2,500/year student contribution (EU) / €20,000–€28,000/year (non-EU)' where tuition = 'Student contribution €2,500/anno (EU, dopo la riduzione permanente di €500 del Budget 2026, Free Fees Initiative) / €20,000–€28,000/anno (non-EU)';
update universities set tuition = '~€157/semester (rising gradually until 2030)' where tuition = '~€157/semestre (contributo semestrale, in aumento progressivo fino al 2030)';
update universities set tuition = '~€164/semester; €1,500/semester for non-EU students' where tuition = '~€164/semestre; €1.500/semestre per studenti non-UE/SEE';
update universities set tuition = '~€25/semester (EU, if you finish on time) / ~€752/semester (non-EU)' where tuition = '~€25/semestre (UE, ÖH-Beitrag, entro durata standard+2 semestri) / ~€752/semestre (non-UE)';
update universities set tuition = '~€283/year (€178 enrolment + €105 student life fee)' where tuition = '~€283/anno (€178 iscrizione + €105 CVEC)';
update universities set tuition = '~€320/semester, public transport ticket included' where tuition = '~€320/semestre, Deutschlandticket incluso';
update universities set tuition = '~€355/semester (semester fee)' where tuition = '~€355/semestre (Semesterbeitrag)';
update universities set tuition = '~€97/semester (admin fees)' where tuition = '~€97/semestre (tasse admin)';
update universities set tuition = '£19,500–£36,500/year (international fee, paid by EU students; depends on course) / £9,790/year (UK students only)' where tuition = '£19,500–£36,500/anno (International, tariffa pagata dagli studenti UE, in base al corso) / £9,790/anno (Home, solo con status UK)';
update universities set tuition = '£22,700–£62,700/year (international fee, paid by EU students; depends on course) / lower fees for UK students' where tuition = '£22,700–£62,700/anno (International, tariffa pagata dagli studenti UE, in base al corso) / tariffe agevolate per studenti scozzesi e del resto del Regno Unito';
update universities set tuition = '£24,000–£35,000/year (international fee, paid by EU students) / £9,790/year (UK students only)' where tuition = '£24,000–£35,000/anno (International, tariffa pagata dagli studenti UE) / £9,790/anno (Home, solo con status UK)';
update universities set tuition = '£25,500–£49,700/year (international fee, paid by EU students; depends on course) / £9,790/year (UK students only)' where tuition = '£25,500–£49,700/anno (International, tariffa pagata dagli studenti UE, in base al corso) / £9,790/anno (Home, solo con status UK)';
update universities set tuition = '£25,734–£70,554/year (international fee, paid by EU students; college fee extra) / £9,790/year (UK students only)' where tuition = '£25,734–£70,554/anno (International, tariffa pagata dagli studenti UE, college fee a parte) / £9,790/anno (Home, solo con status UK)';
update universities set tuition = '£26,200–£47,000/year (international fee, paid by EU students) / £9,790/year (UK students only)' where tuition = '£26,200–£47,000/anno (International, tariffa pagata dagli studenti UE) / £9,790/anno (Home, solo con status UK)';
update universities set tuition = '£26,500–£37,500/year (international fee, paid by EU students) / lower fees for UK students' where tuition = '£26,500–£37,500/anno (International, tariffa pagata dagli studenti UE) / tariffe agevolate per studenti scozzesi e del resto del Regno Unito';
update universities set tuition = '£26,840–£36,130/year (international fee, paid by EU students; depends on course) / £9,790/year (UK students only)' where tuition = '£26,840–£36,130/anno (International, tariffa pagata dagli studenti UE, in base al corso) / £9,790/anno (Home, solo con status UK)';
update universities set tuition = '£28,000–£35,700/year (international fee, paid by EU students; depends on course) / £9,790/year (UK students only)' where tuition = '£28,000–£35,700/anno (International, tariffa pagata dagli studenti UE, in base al corso) / £9,790/anno (Home, solo con status UK)';
update universities set tuition = '£28,500–£31,000/year (international fee, paid by EU students) / £9,790/year (UK students only)' where tuition = '£28,500–£31,000/anno (International, tariffa pagata dagli studenti UE) / £9,790/anno (Home, solo con status UK)';
update universities set tuition = '£35,100–£42,000/year (international fee, paid by EU students) / £9,790/year (UK students only)' where tuition = '£35,100–£42,000/anno (International, tariffa pagata dagli studenti UE) / £9,790/anno (Home, solo con status UK)';
update universities set tuition = '£37,380–£62,820/year (international fee, paid by EU students) / £9,790/year (UK students only)' where tuition = '£37,380–£62,820/anno (International, tariffa pagata dagli studenti UE) / £9,790/anno (Home, solo con status UK)';
update universities set tuition = '€0–€14,900/year (based on family income)' where tuition = '€0–€14,900/anno (basato sul reddito familiare)';
update universities set tuition = '€0–€17,000/year (full fee €17,000; can be reduced or free through Bocconi4Access if family income is low)' where tuition = '€0–€17,000/anno (retta piena €17.000, non suddivisa in fasce ISEE; Bocconi4Access la riduce del 20, 40, 60 o 80% oppure la azzera, in base a ISEE sotto €30.000 e a selezione)';
update universities set tuition = '€1,015–€1,241/year (EU, depends on the programme)' where tuition = '€1,015–€1,241/anno (UE, €16,92–€20,68 a credito in base al tipo di corso)';
update universities set tuition = '€1,015–€1,241/year (EU, depends on the programme)' where tuition = '€1,015–€1,241/anno (UE, €16,92–€20,68 a credito secondo il grado di sperimentalità, prima immatricolazione)';
update universities set tuition = '€1,061/year (EU; up to 80% off for lower family incomes)' where tuition = '€1,061/anno (UE, €17,69 a credito, prezzo unico catalano dal 2025-2026; sconti fino all''80% per fascia di reddito)';
update universities set tuition = '€1,061/year (EU)' where tuition = '€1,061/anno (UE, €17,69 a credito, tariffa pubblica catalana)';
update universities set tuition = '€1,061/year (EU) + ~€141 admin fees, ~€1,202 in total' where tuition = '€1,061/anno di tasse (UE, €17,69 a credito) più ~€141 di spese amministrative, totale ~€1,202';
update universities set tuition = '€1,181/year (EU, full-time)' where tuition = '€1,181/anno (SEE, 60 crediti: €305,40 fissi più €14,60 a credito)';
update universities set tuition = '€1,181/year (EU)' where tuition = '€1,181/anno (UE)';
update universities set tuition = '€110.10/semester, public transport ticket included' where tuition = '€110,10/semestre (WS 2026/27), Semesterticket incluso';
update universities set tuition = '€15,900/year (EU)' where tuition = '€15,900/anno (UE/SEE)';
update universities set tuition = '€156–€2,924/year (based on family income; lowest fee if family income is under €24,000)' where tuition = '€156–€2,924/anno (basato su ISEE: esonero totale sotto €24.000, restano tassa regionale €140 e bollo €16, massimo in base al gruppo di corso)';
update universities set tuition = '€157–€2,040/year (based on family income; lowest fee under €27,000; a few courses up to €2,805)' where tuition = '€157–€2,040/anno (fino a €2,805 per pochi corsi a importo maggiorato; basato su ISEE, No Tax Area sotto €27.000)';
update universities set tuition = '€157–€3,943/year (based on family income; lowest fee under €22,000)' where tuition = '€157–€3,943/anno (basato su ISEE: €157,04 fino a €22.000, massimo €3.943,04 oltre €30.000)';
update universities set tuition = '€178/year + €105 student life fee (EU students)' where tuition = '€178/anno + CVEC €105 (EU students)';
update universities set tuition = '€189.80/semester (admin fees); €1,500/semester for non-EU students' where tuition = '€189,80/semestre (tasse admin); €1.500/semestre per studenti non-UE/SEE';
update universities set tuition = '€190/semester; €1,500/semester for non-EU students' where tuition = '€190/semestre; €1.500/semestre per studenti non-UE/SEE';
update universities set tuition = '€194.80–€197.80/semester; €1,500/semester for non-EU students' where tuition = '€194,80–€197,80/semestre; €1.500/semestre per studenti non-UE/SEE';
update universities set tuition = '€2,694/year (EU) / €12,068–€28,416/year (non-EU)' where tuition = '€2,694/anno (EU) / €12,068–€28,416/anno (non-EU)';
update universities set tuition = '€2,694/year' where tuition = '€2,694/anno';
update universities set tuition = '€208–€2,990/year (based on family income; lowest fee under €30,000)' where tuition = '€208–€2,990/anno (basato su ISEE: No Tax Area fino a €30.000, restano tassa regionale €192 e bollo €16; massimo €2.990 per i corsi scientifici, €2.790 per gli umanistici)';
update universities set tuition = '€22,000/year (English-taught); €12,000/semester if paid in 2 instalments; €75 application fee' where tuition = '€22,000/anno (English-taught); €12,000 a semestre se pagato in due rate; €75 di application fee';
update universities set tuition = '€248.07/semester, public transport ticket included' where tuition = '€248,07/semestre (WS 2026/27), Semesterticket incluso';
update universities set tuition = '€26,500–€29,000/year (rises about 3% each year)' where tuition = '€26,500–€29,000/anno (aumenta del 2,9% ogni anno)';
update universities set tuition = '€3,800/year (English-taught, same for EU and non-EU)' where tuition = '€3,800/anno (English-taught, EU/EEA e non-EU)';
update universities set tuition = '€304.25/semester, public transport ticket included' where tuition = '€304,25/semestre, Semesterticket incluso';
update universities set tuition = '€332.30/semester, public transport ticket included' where tuition = '€332,30/semestre (WS 2026/27), Deutschland-Semesterticket incluso';
update universities set tuition = '€340/semester, public transport ticket included' where tuition = '€340/semestre, Semesterticket incluso';
update universities set tuition = '€343.80/semester, public transport ticket included' where tuition = '€343,80/semestre (dal WS 2025/26), Semesterticket incluso';
update universities set tuition = '€361/semester, public transport ticket included' where tuition = '€361/semestre (WS 2026/27), Deutschlandsemesterticket incluso';
update universities set tuition = '€369.50/semester, public transport ticket included' where tuition = '€369,50/semestre (WS 2026/27), Semesterticket incluso';
update universities set tuition = '€376.80/semester (€358.80 in summer), public transport ticket included' where tuition = '€376,80/semestre (WS 2026/27) — €358,80 nel semestre estivo, Semesterticket incluso';
update universities set tuition = '€379.06/semester, public transport ticket included' where tuition = '€379,06/semestre (WS 2026/27), Semesterticket incluso';
update universities set tuition = '€384/semester (~€400 in winter), admin fees included' where tuition = '€384/semestre (estivo) — ~€400 nel semestre invernale, incluse tasse admin';
update universities set tuition = '€400/semester (first 2 semesters), then €200/semester' where tuition = '€400/semestre (primi 2 semestri), poi €200/semestre';
update universities set tuition = '€697/year (EU) / ~€4,500/year (non-EU)' where tuition = '€697/anno (EU) / ~€4,500/anno (non-EU)';
update universities set tuition = '€697/year (EU) / €3,500–€16,500/year (non-EU)' where tuition = '€697/anno (EU) / €3,500–€16,500/anno (non-EU)';
update universities set tuition = '€82/semester (student services fee); public transport ticket not included' where tuition = '€82/semestre (contributo Studierendenwerk, dal WS 2026/27); ticket trasporti a parte';

update universities set living_cost = replace(living_cost, '/mese', '/month') where living_cost like '%/mese';

update universities set teaching = 'Lectures + small-group seminars' where teaching = 'Lectures + seminars in gruppi ridotti';
update universities set teaching = 'Lectures + supervisions in groups of 1–3, college system' where teaching = 'Supervisions in gruppi di 1–3 studenti + lectures, sistema dei college';
update universities set teaching = 'Lectures + tutorials, college system' where teaching = 'Lectures + tutorials, sistema dei college';
update universities set teaching = 'Lectures + tutorials, mandatory semester abroad' where teaching = 'Lectures + tutorials, semestre di mobilità obbligatorio';

commit;

-- Anything still in Italian (should return no rows):
select id, tuition, living_cost, teaching from universities
where tuition ~* '(/anno|semestre|incluso|studenti|reddito)' or living_cost ~* '/mese' or teaching ~* '(gruppi|sistema dei|semestre)';
