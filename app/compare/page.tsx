"use client";

import Link from "next/link";
import { useState } from "react";
import { universities, University, Bachelor } from "../data/universities";

// City lifestyle descriptions
const cityVibes: Record<string, { emoji: string; summary: string; pros: string[]; cons: string[] }> = {
  maastricht: {
    emoji: "🚲",
    summary: "Compact, highly international student city. 25% students. Cycling culture, lively Vrijthof square, close to Belgium and Germany.",
    pros: ["Very safe and walkable", "Strong student community", "Close to Belgium & Germany borders", "Affordable rent vs Amsterdam"],
    cons: ["Small city — limited nightlife variety", "Grey, cold winters", "Housing competition is growing"],
  },
  amsterdam: {
    emoji: "🌊",
    summary: "Cosmopolitan capital with canals, museums and vibrant nightlife. One of Europe's most iconic cities — and most expensive.",
    pros: ["World-class culture & nightlife", "Excellent English proficiency", "Great cycling infrastructure", "Strong startup & finance scene"],
    cons: ["Very expensive housing (start 6+ months early)", "Crowded tourist city", "Cold, rainy winters"],
  },
  erasmus: {
    emoji: "🏗️",
    summary: "Young, modern and multicultural. Rotterdam rebuilt itself after WWII — bold architecture, diverse food scene, more affordable than Amsterdam.",
    pros: ["More affordable than Amsterdam", "Dynamic, diverse city", "Eurostar/Thalys hub to London & Paris", "Growing tech & startup ecosystem"],
    cons: ["Less 'classic' European feel", "Smaller nightlife than Amsterdam", "Can feel industrial in some areas"],
  },
  groningen: {
    emoji: "🧡",
    summary: "The ultimate student city. 25% of residents are students. Cycling is the main transport. Relaxed, cheap and extremely social.",
    pros: ["Lowest living costs in Netherlands", "Incredibly student-friendly", "Safe and cycle-friendly", "Vibrant student night scene"],
    cons: ["Far from other major cities", "Can feel small after a few years", "Very Dutch — less international than Amsterdam"],
  },
  "lmu-munich": {
    emoji: "🏔️",
    summary: "Bavaria's capital: beautiful, safe, expensive. Oktoberfest, Alps 1h away, skiing in winter. Germany's highest quality of life — at a price.",
    pros: ["Alps & skiing 1h away", "Excellent public transport", "World-famous beer & food culture", "Very safe and clean"],
    cons: ["Highest rents in Germany", "Can feel conservative", "Very competitive housing market"],
  },
  "tu-munich": {
    emoji: "🏔️",
    summary: "Same as LMU — Munich is Munich. Exceptional quality of life, world-class tech ecosystem (BMW, Siemens, MAN), Alps nearby.",
    pros: ["Top-tier tech industry connections", "Excellent quality of life", "Alps & skiing 1h away", "International student community"],
    cons: ["Most expensive city in Germany", "Housing extremely competitive", "Requires German for daily life"],
  },
  "humboldt-berlin": {
    emoji: "🎨",
    summary: "Europe's cultural capital. Edgy, diverse, affordable. Legendary nightlife, huge startup scene, incredible art and music. Feels alive 24/7.",
    pros: ["Most affordable major European capital", "World-famous nightlife & arts scene", "Huge startup & tech hub", "Extremely diverse and open-minded"],
    cons: ["Bureaucracy can be frustrating", "Winters are cold and grey", "Housing market tightening fast"],
  },
  barcelona: {
    emoji: "🌊",
    summary: "One of the world's best student cities. Beach, sun, Gaudí, nightlife, and incredible food. Rents have risen but lifestyle is unbeatable.",
    pros: ["Beach + sun + incredible architecture", "Legendary nightlife (goes until 6am)", "Very international student community", "Good public transport"],
    cons: ["Rents rising fast", "Essential to know Spanish (Catalan a plus)", "Petty crime in tourist areas"],
  },
  complutense: {
    emoji: "💃",
    summary: "Spain's buzzing capital. Late dinners, rooftop bars, flamenco, great museums and endless tapas. More affordable than Barcelona for housing.",
    pros: ["Cheaper rent than Barcelona", "Excellent cultural life & museums", "Great food scene & nightlife", "Good metro system"],
    cons: ["Spanish essential for daily life", "Very hot summers (40°C+)", "Traffic and noise in central areas"],
  },
  "ie-university": {
    emoji: "✨",
    summary: "Premium Madrid lifestyle. IE's campus splits between vibrant Madrid and intimate medieval Segovia. Social life revolves around the international student community.",
    pros: ["Extremely international bubble", "Madrid's world-class nightlife & culture", "Segovia campus has unique medieval charm", "Strong alumni networking events"],
    cons: ["Very expensive tuition changes social dynamics", "Less integration with Spanish city life", "Can feel like a bubble"],
  },
  "sciences-po": {
    emoji: "🗼",
    summary: "The most iconic student city in the world. Culture, food, fashion, cinema and incredible architecture. Expensive but the CAF housing allowance helps.",
    pros: ["Unmatched culture, food, fashion", "World's best museums & architecture", "CAF housing aid (€150–250/month)", "Excellent metro system"],
    cons: ["One of the most expensive cities in Europe", "Housing very hard to find", "French bureaucracy can be exhausting"],
  },
  sorbonne: {
    emoji: "📚",
    summary: "Same as Sciences Po — Paris, the Latin Quarter. Student cafés, bookshops, the Seine. The intellectual heart of European culture.",
    pros: ["Latin Quarter — iconic student atmosphere", "Cheap university restaurants (CROUS)", "CAF housing aid available", "Incredible cultural scene"],
    cons: ["Expensive private housing", "Crowded & noisy central areas", "French required for daily life"],
  },
  lyon: {
    emoji: "🍷",
    summary: "France's gastronomy capital. Two rivers, hills, Roman ruins. Far more affordable than Paris with a vibrant student scene and exceptional food culture.",
    pros: ["Far cheaper than Paris", "France's best food city", "Vibrant student nightlife", "Beautiful old town (UNESCO)"],
    cons: ["Less international than Paris", "Requires French for daily life", "Fewer global career connections"],
  },
  bocconi: {
    emoji: "👔",
    summary: "Italy's most cosmopolitan and career-driven city. Fashion weeks, design weeks, aperitivo culture and a buzzing professional scene. Expensive but worth it.",
    pros: ["Best career opportunities in Italy", "World-famous fashion & design culture", "Great food & aperitivo scene", "Good public transport (metro + tram)"],
    cons: ["Most expensive city in Italy", "Competitive and fast-paced atmosphere", "Polluted air in winter"],
  },
  bologna: {
    emoji: "🍝",
    summary: "Italy's most legendary student city. Young, progressive, vibrant. Famous for its food (the best ragù in the world), cheap student life and porticoes.",
    pros: ["Iconic student city (20% students)", "Excellent & affordable food scene", "Central location (1h from Florence, Venice, Milan)", "Very walkable historic centre"],
    cons: ["Smaller job market than Milan", "Can feel slow for ambitious careers", "Housing fills up fast in September"],
  },
  polimi: {
    emoji: "🎨",
    summary: "Same as Bocconi's Milan — dynamic, international and career-focused. Design week, fashion week, great food, excellent public transport.",
    pros: ["Best city for design & engineering careers", "World-class fashion & design ecosystem", "Excellent aperitivo & food culture", "Strong tech startup scene"],
    cons: ["Expensive housing", "Very competitive atmosphere", "Air quality poor in winter"],
  },
  lisbon: {
    emoji: "🌞",
    summary: "Europe's hippest capital. Warm climate, beautiful hills, incredible food and fado music. Growing fast — rents rising but still liveable.",
    pros: ["Warm, sunny climate year-round", "Beautiful city with Atlantic beaches", "Affordable by EU standards (for now)", "Thriving startup & tech scene"],
    cons: ["Rents rising fast (up 60% since 2020)", "Hills make cycling hard", "Public transport can be unreliable"],
  },
  porto: {
    emoji: "🍷",
    summary: "Smaller, cheaper and more charming than Lisbon. Famous for wine, azulejos tiles and stunning riverside. Very safe and student-friendly.",
    pros: ["Cheaper than Lisbon", "Beautiful, authentic city feel", "Beaches 20min away", "Very safe and walkable"],
    cons: ["Smaller job market than Lisbon", "Less international than Lisbon", "Wetter climate (600mm rain/year)"],
  },
};

function parseCost(cost: string): number {
  const match = cost.match(/(\d[\d,]*)/);
  return match ? parseInt(match[1].replace(",", "")) : 0;
}

function CostBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-2">
      <div 
        className={`h-full rounded-full transition-all duration-700 ease-out ${color}`} 
        style={{ width: `${pct}%` }} 
      />
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="col-span-full pt-8 pb-4 border-t border-white/5 mt-4">
      <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">{title}</h3>
    </div>
  );
}

export default function Compare() {
  const [uniAId, setUniAId] = useState("");
  const [uniBId, setUniBId] = useState("");
  const [bachAId, setBachAId] = useState("");
  const [bachBId, setBachBId] = useState("");

  const uniA = universities.find((u) => u.id === uniAId);
  const uniB = universities.find((u) => u.id === uniBId);
  const bachA = uniA?.bachelors.find((b) => b.id === bachAId);
  const bachB = uniB?.bachelors.find((b) => b.id === bachBId);

  const maxTuition = 25000;
  const maxLiving = 2000;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-gradient mb-4">Side-by-side comparison.</h1>
        <p className="text-zinc-400 text-lg">Compare universities, programmes and city lifestyle across Europe.</p>
      </header>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Uni A */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">University A</label>
            <select
              value={uniAId}
              onChange={(e) => { setUniAId(e.target.value); setBachAId(""); }}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/20 transition-all appearance-none"
            >
              <option value="">Select university…</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>{u.flag} {u.name}</option>
              ))}
            </select>
          </div>
          {uniA && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Programme</label>
              <select
                value={bachAId}
                onChange={(e) => setBachAId(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/20 transition-all appearance-none"
              >
                <option value="">Select programme…</option>
                {uniA.bachelors.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Uni B */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">University B</label>
            <select
              value={uniBId}
              onChange={(e) => { setUniBId(e.target.value); setBachBId(""); }}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/20 transition-all appearance-none"
            >
              <option value="">Select university…</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>{u.flag} {u.name}</option>
              ))}
            </select>
          </div>
          {uniB && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Programme</label>
              <select
                value={bachBId}
                onChange={(e) => setBachBId(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/20 transition-all appearance-none"
              >
                <option value="">Select programme…</option>
                {uniB.bachelors.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      {!uniA || !uniB ? (
        <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl">
          <p className="text-zinc-500 font-mono text-sm">Select two universities to start comparing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-12 gap-y-8">
          {/* Header row */}
          <div className="space-y-2">
            <div className="text-4xl mb-4">{uniA.flag}</div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{uniA.name}</h2>
            <p className="text-zinc-500 text-sm font-medium">{uniA.city}, {uniA.country}</p>
          </div>
          <div className="space-y-2 text-right">
            <div className="text-4xl mb-4">{uniB.flag}</div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{uniB.name}</h2>
            <p className="text-zinc-500 text-sm font-medium">{uniB.city}, {uniB.country}</p>
          </div>

          <SectionTitle title="Finances" />
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-500">Tuition Fee</span>
              <span className="text-white font-bold">{uniA.tuition}</span>
            </div>
            <CostBar value={parseCost(uniA.tuition)} max={maxTuition} color="bg-emerald-500" />
          </div>
          <div className="space-y-2 text-right">
            <div className="flex justify-between flex-row-reverse text-xs mb-1">
              <span className="text-zinc-500">Tuition Fee</span>
              <span className="text-white font-bold">{uniB.tuition}</span>
            </div>
            <div className="flex justify-end">
              <div className="w-full rotate-180">
                <CostBar value={parseCost(uniB.tuition)} max={maxTuition} color="bg-emerald-500" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-500">Living Cost</span>
              <span className="text-white font-bold">{uniA.livingCost}</span>
            </div>
            <CostBar value={parseCost(uniA.livingCost)} max={maxLiving} color="bg-blue-500" />
          </div>
          <div className="space-y-2 text-right">
            <div className="flex justify-between flex-row-reverse text-xs mb-1">
              <span className="text-zinc-500">Living Cost</span>
              <span className="text-white font-bold">{uniB.livingCost}</span>
            </div>
            <div className="flex justify-end">
              <div className="w-full rotate-180">
                <CostBar value={parseCost(uniB.livingCost)} max={maxLiving} color="bg-blue-500" />
              </div>
            </div>
          </div>

          <SectionTitle title="Academic Profile" />
          
          <div className="bg-zinc-900/30 p-5 rounded-2xl border border-white/5">
            <div className="text-[10px] font-mono text-zinc-500 mb-2">Teaching</div>
            <div className="text-sm text-zinc-200 leading-relaxed">{uniA.teaching}</div>
          </div>
          <div className="bg-zinc-900/30 p-5 rounded-2xl border border-white/5 text-right">
            <div className="text-[10px] font-mono text-zinc-500 mb-2">Teaching</div>
            <div className="text-sm text-zinc-200 leading-relaxed">{uniB.teaching}</div>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] font-mono text-zinc-500">Strengths</div>
            <div className="flex flex-wrap gap-1.5">
              {uniA.strengths.map(s => <span key={s} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-zinc-400">{s}</span>)}
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-[10px] font-mono text-zinc-500 text-right">Strengths</div>
            <div className="flex flex-wrap gap-1.5 justify-end">
              {uniB.strengths.map(s => <span key={s} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-zinc-400">{s}</span>)}
            </div>
          </div>

          <SectionTitle title="City Lifestyle" />
          
          {cityVibes[uniA.id] ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cityVibes[uniA.id].emoji}</span>
                <p className="text-sm text-zinc-300 leading-relaxed italic">"{cityVibes[uniA.id].summary}"</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-emerald-500 uppercase">Pros</span>
                  <ul className="space-y-1.5">
                    {cityVibes[uniA.id].pros.map(p => <li key={p} className="text-xs text-zinc-400 flex items-start gap-2"><span>•</span> {p}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ) : <div className="text-xs text-zinc-600 font-mono italic">Vibe data not available.</div>}

          {cityVibes[uniB.id] ? (
            <div className="space-y-4 text-right">
              <div className="flex items-center gap-3 justify-end">
                <p className="text-sm text-zinc-300 leading-relaxed italic">"{cityVibes[uniB.id].summary}"</p>
                <span className="text-2xl">{cityVibes[uniB.id].emoji}</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-emerald-500 uppercase">Pros</span>
                  <ul className="space-y-1.5">
                    {cityVibes[uniB.id].pros.map(p => <li key={p} className="text-xs text-zinc-400 flex items-start gap-2 flex-row-reverse"><span>•</span> {p}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          ) : <div className="text-xs text-zinc-600 font-mono italic text-right">Vibe data not available.</div>}

          {/* Programmes Row */}
          {bachA && bachB && (
            <>
              <SectionTitle title="Programme Comparison" />
              <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/10">
                <h4 className="text-lg font-bold text-white mb-4">{bachA.name}</h4>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Duration</span>
                    <span className="text-zinc-300 font-medium">{bachA.duration}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Language</span>
                    <span className="text-zinc-300 font-medium">{bachA.language}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-4 mt-4">{bachA.description}</p>
                </div>
              </div>
              <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/10 text-right">
                <h4 className="text-lg font-bold text-white mb-4">{bachB.name}</h4>
                <div className="space-y-4">
                  <div className="flex justify-between flex-row-reverse text-xs">
                    <span className="text-zinc-500">Duration</span>
                    <span className="text-zinc-300 font-medium">{bachB.duration}</span>
                  </div>
                  <div className="flex justify-between flex-row-reverse text-xs">
                    <span className="text-zinc-500">Language</span>
                    <span className="text-zinc-300 font-medium">{bachB.language}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-4 mt-4">{bachB.description}</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Footer CTA */}
      <div className="mt-24 pt-12 border-t border-white/5 flex flex-col items-center gap-6">
        <p className="text-zinc-500 text-sm">Need more specific details or advice?</p>
        <Link 
          href="/chat" 
          className="px-8 py-3 rounded-xl bg-white text-black font-bold transition-all hover:bg-zinc-200"
        >
          Ask Unimate AI Assistant
        </Link>
      </div>
    </div>
  );
}
