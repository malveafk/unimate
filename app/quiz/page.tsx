"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { universities } from "../data/universities";

/* ── Question definitions ──────────────────────────────────────────────────── */
type Option = {
  label: string;
  scores: Record<string, number>; // keys: dimension scores + university trait keys
};

type Question = {
  id: string;
  dimension: "interests" | "style" | "practical";
  text: string;
  subtitle?: string;
  options: Option[];
};

const QUESTIONS: Question[] = [
  // ── DIMENSION 1: INTERESTS ──────────────────────────────────────────────
  {
    id: "q1",
    dimension: "interests",
    text: "What field feels most like you?",
    subtitle: "Pick the one that excites you most.",
    options: [
      { label: "Business & Economics", scores: { business: 3, economics: 2 } },
      { label: "Engineering & Technology", scores: { engineering: 3, tech: 2 } },
      { label: "Medicine & Health", scores: { medicine: 3, health: 2 } },
      { label: "Law & Political Science", scores: { law: 3, politics: 2 } },
      { label: "Humanities & Social Sciences", scores: { humanities: 3, social: 2 } },
      { label: "Design & Architecture", scores: { design: 3, architecture: 2 } },
      { label: "Natural Sciences & Maths", scores: { science: 3, maths: 2 } },
    ],
  },
  {
    id: "q2",
    dimension: "interests",
    text: "What motivates you the most?",
    options: [
      { label: "Building things that work", scores: { engineering: 2, tech: 2, practical: 1 } },
      { label: "Understanding people and society", scores: { social: 2, humanities: 2, politics: 1 } },
      { label: "Making money and running businesses", scores: { business: 2, economics: 2, finance: 1 } },
      { label: "Helping people directly", scores: { medicine: 2, health: 2, social: 1 } },
      { label: "Creating beauty and meaning", scores: { design: 2, humanities: 2, architecture: 1 } },
      { label: "Discovering how things work", scores: { science: 2, maths: 2, research: 1 } },
    ],
  },
  {
    id: "q3",
    dimension: "interests",
    text: "Which career sounds most interesting?",
    options: [
      { label: "Startup founder or entrepreneur", scores: { business: 2, tech: 1, innovation: 2 } },
      { label: "Engineer or software developer", scores: { engineering: 2, tech: 2, maths: 1 } },
      { label: "Doctor or healthcare professional", scores: { medicine: 3, health: 2 } },
      { label: "Lawyer or diplomat", scores: { law: 2, politics: 2, international: 1 } },
      { label: "Researcher or professor", scores: { research: 3, science: 1, humanities: 1 } },
      { label: "Designer, artist or creative", scores: { design: 3, architecture: 1 } },
      { label: "Economist or financial analyst", scores: { economics: 2, finance: 2, business: 1 } },
    ],
  },
  {
    id: "q4",
    dimension: "interests",
    text: "Which subject did you enjoy most in school?",
    options: [
      { label: "Maths or Physics", scores: { maths: 2, science: 2, engineering: 1 } },
      { label: "Chemistry or Biology", scores: { science: 2, medicine: 2, health: 1 } },
      { label: "History or Philosophy", scores: { humanities: 3, social: 1 } },
      { label: "Economics or Business Studies", scores: { business: 2, economics: 2 } },
      { label: "Informatics or Computer Science", scores: { tech: 3, engineering: 1 } },
      { label: "Literature or Languages", scores: { humanities: 2, international: 2 } },
      { label: "Art or Design", scores: { design: 3 } },
    ],
  },
  {
    id: "q5",
    dimension: "interests",
    text: "How international do you want your studies to be?",
    options: [
      { label: "Fully international — classmates from everywhere", scores: { international: 3, english: 2 } },
      { label: "A good mix, but I'm open to learning local language", scores: { international: 1 } },
      { label: "I prefer to integrate with locals", scores: { integration: 2 } },
      { label: "I'm focused on the quality of the programme, not the mix", scores: { research: 1, practical: 1 } },
    ],
  },

  // ── DIMENSION 2: STUDY STYLE ────────────────────────────────────────────
  {
    id: "q6",
    dimension: "style",
    text: "How do you study best?",
    options: [
      { label: "Group discussions and collaborative projects", scores: { pbl: 3, collaborative: 2 } },
      { label: "Independent reading and research", scores: { research: 2, traditional: 2 } },
      { label: "Hands-on labs and practical work", scores: { practical: 3, engineering: 1 } },
      { label: "Lectures and structured curriculum", scores: { traditional: 3, structured: 2 } },
      { label: "A mix of everything", scores: { pbl: 1, traditional: 1, practical: 1 } },
    ],
  },
  {
    id: "q7",
    dimension: "style",
    text: "How competitive are you?",
    options: [
      { label: "Very — I want to be at the best, most selective programme", scores: { elite: 3, research: 1 } },
      { label: "Quite competitive, but not obsessed with rankings", scores: { elite: 1, practical: 1 } },
      { label: "I prefer cooperative environments over ranking", scores: { pbl: 2, collaborative: 2 } },
      { label: "Not at all — I just want to learn and enjoy life", scores: { lifestyle: 2, balance: 2 } },
    ],
  },
  {
    id: "q8",
    dimension: "style",
    text: "How much time do you want to spend studying vs. living?",
    options: [
      { label: "100% focused on studies — I'm here to learn", scores: { research: 2, structured: 2 } },
      { label: "Mostly studies, but want a social life too", scores: { structured: 1, lifestyle: 1 } },
      { label: "50/50 — university is about living, not just studying", scores: { lifestyle: 2, balance: 2 } },
      { label: "Life first, studies second", scores: { lifestyle: 3, balance: 2 } },
    ],
  },
  {
    id: "q9",
    dimension: "style",
    text: "What language are you willing to study in?",
    options: [
      { label: "English only", scores: { english: 3 } },
      { label: "English or I'll learn a local European language", scores: { english: 1, local: 2 } },
      { label: "I specifically want to study in a local language (French, German, Spanish…)", scores: { local: 3 } },
      { label: "No preference — I'll adapt", scores: { english: 1, local: 1 } },
    ],
  },
  {
    id: "q10",
    dimension: "style",
    text: "How do you feel about group work?",
    options: [
      { label: "I love it — teamwork is everything", scores: { pbl: 3, collaborative: 3 } },
      { label: "It's fine in moderation", scores: { pbl: 1, collaborative: 1 } },
      { label: "I prefer working alone and being assessed individually", scores: { traditional: 2, research: 1 } },
      { label: "I want to choose my own workstyle depending on the task", scores: { balance: 1 } },
    ],
  },

  // ── DIMENSION 3: PRACTICAL ──────────────────────────────────────────────
  {
    id: "q11",
    dimension: "practical",
    text: "What's your budget for tuition per year?",
    options: [
      { label: "Free or minimal (under €1,000/yr)", scores: { free: 3 } },
      { label: "Low (€1,000 – €3,000/yr)", scores: { free: 2, affordable: 1 } },
      { label: "Medium (€3,000 – €8,000/yr)", scores: { affordable: 2 } },
      { label: "High (over €8,000/yr) — if the quality is worth it", scores: { elite: 1, expensive: 1 } },
    ],
  },
  {
    id: "q12",
    dimension: "practical",
    text: "What's your total monthly budget (rent + food + life)?",
    options: [
      { label: "Under €800/month — I need to be careful", scores: { cheap: 3 } },
      { label: "€800 – €1,100/month", scores: { cheap: 1, moderate: 2 } },
      { label: "€1,100 – €1,500/month", scores: { moderate: 2, pricey: 1 } },
      { label: "Over €1,500/month — not a problem", scores: { pricey: 2 } },
    ],
  },
  {
    id: "q13",
    dimension: "practical",
    text: "What kind of city do you want to live in?",
    options: [
      { label: "Big cosmopolitan capital (Paris, Amsterdam, Berlin, Madrid)", scores: { capital: 3, nightlife: 2 } },
      { label: "Vibrant mid-size city with great energy (Barcelona, Bologna, Lyon)", scores: { midcity: 3, nightlife: 2 } },
      { label: "Classic, affordable student town (Maastricht, Lund, Leiden)", scores: { smallcity: 3, cheap: 1 } },
      { label: "Tech/industry hub (Munich, Delft, Stockholm)", scores: { tech: 1, capital: 1, engineering: 1 } },
    ],
  },
  {
    id: "q14",
    dimension: "practical",
    text: "How important is nightlife and social scene?",
    options: [
      { label: "Very — it's a huge part of the experience", scores: { nightlife: 3, lifestyle: 2 } },
      { label: "Somewhat — I want a good balance", scores: { nightlife: 1, lifestyle: 1, balance: 1 } },
      { label: "Not much — I'll make my own social life", scores: { structured: 1 } },
      { label: "I don't care about it", scores: { research: 1 } },
    ],
  },
  {
    id: "q15",
    dimension: "practical",
    text: "What matters most to you at the end of the day?",
    options: [
      { label: "A prestigious degree that opens doors globally", scores: { elite: 3, international: 1 } },
      { label: "Real skills and industry connections", scores: { practical: 3, engineering: 1, business: 1 } },
      { label: "An unforgettable life experience abroad", scores: { lifestyle: 3, nightlife: 1, international: 1 } },
      { label: "Affordable, high-quality education without debt", scores: { free: 2, affordable: 2 } },
      { label: "A place where I can truly grow as a person", scores: { balance: 2, pbl: 1, research: 1 } },
    ],
  },
];

/* ── University scoring matrix ─────────────────────────────────────────────── */
type UniTraits = Record<string, number>;

const UNI_TRAITS: Record<string, UniTraits> = {
  maastricht:   { business: 3, law: 2, health: 2, pbl: 5, collaborative: 4, international: 4, english: 4, midcity: 3, smallcity: 2, moderate: 3, nightlife: 3, lifestyle: 3 },
  amsterdam:    { business: 3, economics: 3, social: 3, politics: 2, science: 2, tech: 2, research: 3, traditional: 3, international: 4, english: 3, capital: 4, pricey: 3, elite: 2, nightlife: 4 },
  erasmus:      { business: 4, economics: 4, finance: 4, international: 4, english: 4, collaborative: 3, midcity: 3, moderate: 3, elite: 2, nightlife: 3, lifestyle: 3 },
  groningen:    { economics: 3, business: 2, international: 3, medicine: 2, english: 3, smallcity: 4, cheap: 3, affordable: 3, moderate: 2, balance: 3, lifestyle: 3 },
  "lmu-munich": { medicine: 4, humanities: 3, law: 3, social: 3, research: 4, traditional: 4, local: 3, capital: 3, moderate: 2, pricey: 2, elite: 3, free: 3 },
  "tu-munich":  { engineering: 5, tech: 5, maths: 4, science: 3, practical: 4, research: 3, traditional: 3, local: 3, capital: 3, pricey: 2, elite: 4, free: 3 },
  "humboldt-berlin": { humanities: 5, social: 4, politics: 3, research: 4, traditional: 3, local: 3, capital: 4, cheap: 2, affordable: 3, nightlife: 4, lifestyle: 4, free: 3 },
  barcelona:    { medicine: 3, economics: 3, business: 2, international: 3, english: 3, midcity: 5, moderate: 3, nightlife: 5, lifestyle: 5, beach: 3 },
  complutense:  { law: 4, medicine: 3, politics: 3, social: 3, traditional: 4, local: 4, capital: 4, affordable: 3, cheap: 2, nightlife: 4, lifestyle: 3 },
  "ie-university": { business: 4, international: 5, english: 5, elite: 4, innovation: 4, pricey: 5, expensive: 3, capital: 2, midcity: 2, nightlife: 3 },
  "sciences-po": { politics: 5, international: 5, humanities: 4, law: 3, social: 4, research: 3, elite: 4, capital: 4, pricey: 4, english: 3, local: 2, lifestyle: 3 },
  sorbonne:     { humanities: 5, social: 3, research: 5, traditional: 5, local: 4, capital: 4, affordable: 3, free: 3, elite: 3, pricey: 2 },
  lyon:         { medicine: 3, humanities: 3, social: 3, research: 3, traditional: 3, local: 4, midcity: 3, cheap: 2, affordable: 3, balance: 3, lifestyle: 3 },
  bocconi:      { business: 5, economics: 5, finance: 5, international: 4, english: 4, elite: 5, expensive: 3, pricey: 3, nightlife: 3, lifestyle: 3 },
  bologna:      { law: 4, medicine: 3, humanities: 4, research: 3, traditional: 4, local: 4, midcity: 3, affordable: 4, cheap: 2, nightlife: 4, lifestyle: 4, balance: 3 },
  polimi:       { engineering: 5, design: 5, architecture: 5, tech: 3, research: 4, practical: 4, elite: 4, expensive: 2, pricey: 3, midcity: 4, nightlife: 3, lifestyle: 3 },
  lisbon:       { international: 3, english: 3, business: 2, engineering: 2, midcity: 4, moderate: 3, affordable: 3, nightlife: 4, lifestyle: 4, balance: 3 },
  porto:        { engineering: 3, science: 2, cheap: 4, affordable: 4, moderate: 2, smallcity: 3, midcity: 2, balance: 4, lifestyle: 4, nightlife: 3 },
  "tu-delft":   { engineering: 5, tech: 4, maths: 4, science: 3, practical: 5, research: 4, english: 4, international: 3, smallcity: 4, moderate: 3, elite: 3 },
  leiden:       { law: 4, humanities: 3, international: 3, politics: 3, research: 4, traditional: 4, english: 3, smallcity: 4, moderate: 3, elite: 2, balance: 3 },
  "eth-zurich": { engineering: 5, science: 5, tech: 5, maths: 5, research: 5, elite: 5, local: 3, pricey: 5, expensive: 4, structured: 4, practical: 3 },
  "ku-leuven":  { medicine: 4, engineering: 3, humanities: 3, research: 5, traditional: 4, local: 4, smallcity: 4, affordable: 3, elite: 4, moderate: 2 },
  vienna:       { humanities: 4, medicine: 3, law: 3, social: 3, research: 4, traditional: 4, local: 4, capital: 3, moderate: 3, affordable: 2, nightlife: 3, lifestyle: 4, free: 3 },
  copenhagen:   { social: 3, health: 3, design: 2, international: 3, research: 3, english: 3, capital: 3, pricey: 4, balance: 5, lifestyle: 4, nightlife: 3, free: 4 },
  dtu:          { engineering: 5, tech: 4, maths: 4, science: 4, practical: 4, research: 4, local: 3, moderate: 2, pricey: 3, elite: 3 },
  aarhus:       { business: 3, social: 3, science: 3, research: 3, balance: 4, lifestyle: 3, affordable: 3, cheap: 2, smallcity: 3, nightlife: 2 },
  kth:          { engineering: 5, tech: 5, maths: 4, science: 4, research: 4, innovation: 4, local: 3, capital: 3, pricey: 3, elite: 3, free: 3 },
  lund:         { engineering: 3, medicine: 3, law: 3, research: 3, balance: 4, lifestyle: 3, english: 2, local: 3, smallcity: 4, moderate: 3, affordable: 3 },
  stockholm:    { humanities: 3, social: 3, business: 2, capital: 4, nightlife: 3, lifestyle: 4, international: 2, balance: 3, moderate: 3, pricey: 2, free: 3 },
  uppsala:      { medicine: 4, law: 3, science: 3, research: 4, traditional: 4, local: 3, smallcity: 4, affordable: 3, moderate: 2, elite: 3, balance: 3 },
};

/* Faculty matching */
const FACULTY_SCORES: Record<string, string[]> = {
  business:    ["business", "economics", "finance", "international", "innovation"],
  engineering: ["engineering", "tech", "maths", "practical", "science"],
  medicine:    ["medicine", "health", "science"],
  law:         ["law", "politics", "humanities", "international"],
  humanities:  ["humanities", "social", "politics", "research"],
  design:      ["design", "architecture", "innovation"],
  science:     ["science", "maths", "research", "engineering"],
};

/* ── Scoring algorithm ─────────────────────────────────────────────────────── */
function scoreUniversities(answers: Record<string, Option>) {
  const profile: Record<string, number> = {};
  for (const opt of Object.values(answers)) {
    for (const [key, val] of Object.entries(opt.scores)) {
      profile[key] = (profile[key] ?? 0) + val;
    }
  }

  const scores = universities.map((uni) => {
    const traits = UNI_TRAITS[uni.id] ?? {};
    let score = 0;
    let total = 0;
    for (const [key, profileVal] of Object.entries(profile)) {
      const traitVal = traits[key] ?? 0;
      score += profileVal * traitVal;
      total += profileVal * 5; // max possible
    }
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    return { uni, score: pct };
  });

  scores.sort((a, b) => b.score - a.score);
  return scores;
}

function scoreFaculties(answers: Record<string, Option>) {
  const profile: Record<string, number> = {};
  for (const opt of Object.values(answers)) {
    for (const [key, val] of Object.entries(opt.scores)) {
      profile[key] = (profile[key] ?? 0) + val;
    }
  }

  return Object.entries(FACULTY_SCORES)
    .map(([faculty, keys]) => {
      const score = keys.reduce((sum, k) => sum + (profile[k] ?? 0), 0);
      return { faculty, score };
    })
    .sort((a, b) => b.score - a.score);
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function QuizPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Option>>({});
  const [selected, setSelected] = useState<Option | null>(null);
  const [animating, setAnimating] = useState(false);

  const q = QUESTIONS[current];
  const progress = ((current) / QUESTIONS.length) * 100;
  const isLast = current === QUESTIONS.length - 1;

  function handleSelect(opt: Option) {
    setSelected(opt);
  }

  function handleNext() {
    if (!selected || animating) return;
    const newAnswers = { ...answers, [q.id]: selected };

    if (isLast) {
      const uniScores = scoreUniversities(newAnswers);
      const facultyScores = scoreFaculties(newAnswers);
      const top5 = uniScores.slice(0, 5).map((s) => `${s.uni.id}:${s.score}`).join(",");
      const top3fac = facultyScores.slice(0, 3).map((s) => `${s.faculty}:${s.score}`).join(",");

      // Save to localStorage
      try {
        localStorage.setItem("unimate.profile", JSON.stringify({ answers: newAnswers, top5, top3fac, date: Date.now() }));
      } catch {}

      router.push(`/quiz/result?top=${top5}&fac=${top3fac}`);
      return;
    }

    setAnimating(true);
    setTimeout(() => {
      setAnswers(newAnswers);
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnimating(false);
    }, 280);
  }

  function handleBack() {
    if (current === 0) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent((c) => c - 1);
      setSelected(answers[QUESTIONS[current - 1].id] ?? null);
      setAnimating(false);
    }, 180);
  }

  const dimLabel: Record<Question["dimension"], string> = {
    interests: "What you love",
    style: "How you learn",
    practical: "What fits your life",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      {/* Progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "var(--surface-2)", zIndex: 100 }}>
        <div style={{ height: "100%", background: "var(--accent)", width: `${progress}%`, transition: "width 0.4s ease" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 640 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48 }}>
          <button
            onClick={handleBack}
            disabled={current === 0}
            style={{
              background: "none", border: "none", cursor: current === 0 ? "default" : "pointer",
              color: current === 0 ? "var(--text-3)" : "var(--text-2)", fontSize: 13, fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6, padding: 0, transition: "color 0.15s",
            }}
            onMouseEnter={e => { if (current > 0) (e.currentTarget as HTMLButtonElement).style.color = "var(--text-1)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = current === 0 ? "var(--text-3)" : "var(--text-2)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6" /></svg>
            Back
          </button>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 2 }}>
              {dimLabel[q.dimension]}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>{current + 1} / {QUESTIONS.length}</div>
          </div>

          <div style={{ width: 60 }} />
        </div>

        {/* Question */}
        <div
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(12px)" : "translateY(0)",
            transition: "opacity 0.28s ease, transform 0.28s ease",
          }}
        >
          <h1 style={{
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 800,
            letterSpacing: "-0.6px",
            lineHeight: 1.15,
            color: "var(--text-1)",
            margin: "0 0 8px",
          }}>
            {q.text}
          </h1>
          {q.subtitle && (
            <p style={{ fontSize: 14, color: "var(--text-3)", margin: "0 0 36px" }}>{q.subtitle}</p>
          )}
          {!q.subtitle && <div style={{ marginBottom: 36 }} />}

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map((opt, i) => {
              const isActive = selected?.label === opt.label;
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(opt)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "16px 20px",
                    borderRadius: 12,
                    border: `1px solid ${isActive ? "var(--accent-border)" : "var(--border)"}`,
                    background: isActive ? "var(--accent-dim)" : "var(--surface)",
                    color: isActive ? "var(--text-1)" : "var(--text-2)",
                    fontSize: 15,
                    fontFamily: "inherit",
                    fontWeight: isActive ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--text-1)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--text-2)";
                    }
                  }}
                >
                  <span style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${isActive ? "var(--accent)" : "var(--border-strong)"}`,
                    background: isActive ? "var(--accent)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}>
                    {isActive && (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    )}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleNext}
              disabled={!selected}
              style={{
                padding: "13px 28px",
                borderRadius: 12,
                background: selected ? "var(--text-1)" : "var(--surface-2)",
                color: selected ? "var(--bg)" : "var(--text-3)",
                border: "none",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: selected ? "pointer" : "default",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {isLast ? "See my results" : "Continue"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9,18 15,12 9,6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
