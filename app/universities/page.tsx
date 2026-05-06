"use client";

import { useState } from "react";
import Link from "next/link";
import { universities, countries, faculties } from "../data/universities";

export default function Universities() {
  const [selected, setSelected] = useState("all");
  const [selectedFaculty, setSelectedFaculty] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = universities.filter((u) => {
    const matchCountry = selected === "all" || u.country === selected;
    const matchSearch =
      search === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.city.toLowerCase().includes(search.toLowerCase()) ||
      u.strengths.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const facultyDef = faculties.find(f => f.code === selectedFaculty);
    const matchFaculty =
      selectedFaculty === "all" ||
      (facultyDef?.keywords ?? []).some(kw =>
        u.strengths.some(s => s.toLowerCase().includes(kw.toLowerCase()))
      );
    return matchCountry && matchSearch && matchFaculty;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="max-w-3xl mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gradient mb-6">
          Find your future <br />university in Europe.
        </h1>
        <p className="text-zinc-400 text-lg leading-relaxed mb-10">
          Explore detailed information about tuition, cost of living, and academic strengths. 
          Use filters to narrow down your search.
        </p>

        {/* Search */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, city or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-xl border border-white/10 bg-zinc-900/50 text-white placeholder:text-zinc-600 outline-none focus:border-white/20 focus:bg-zinc-900/80 transition-all"
          />
        </div>
      </div>

      {/* Filters Section */}
      <div className="space-y-8 mb-16 border-y border-white/5 py-10">
        <div>
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">Countries</h3>
          <div className="flex flex-wrap gap-2">
            {countries.map((c) => (
              <button
                key={c.code}
                onClick={() => setSelected(c.code)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  selected === c.code 
                    ? "bg-white border-white text-black" 
                    : "bg-transparent border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                }`}
              >
                {c.flag} {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">Faculties</h3>
          <div className="flex flex-wrap gap-2">
            {faculties.map((f) => (
              <button
                key={f.code}
                onClick={() => setSelectedFaculty(f.code)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  selectedFaculty === f.code 
                    ? "bg-white border-white text-black" 
                    : "bg-transparent border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                }`}
              >
                <span>{f.icon}</span>
                {f.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active filters summary */}
      {(selected !== "all" || selectedFaculty !== "all" || search !== "") && (
        <div className="flex items-center justify-between mb-8">
          <span className="text-sm text-zinc-500">
            Showing <span className="text-white font-medium">{filtered.length}</span> results
          </span>
          <button
            onClick={() => { setSelected("all"); setSelectedFaculty("all"); setSearch(""); }}
            className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
          >
            Clear all filters
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((uni) => (
          <div
            key={uni.id}
            className="group flex flex-col rounded-2xl border border-white/10 bg-zinc-900/30 p-6 transition-all hover:border-white/20 hover:bg-zinc-900/50"
          >
            {/* Top */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-2xl mb-2">{uni.flag}</div>
                <h2 className="text-lg font-bold text-white leading-tight mb-1 group-hover:text-zinc-200">{uni.name}</h2>
                <div className="text-xs text-zinc-500 font-medium">{uni.city}, {uni.country}</div>
              </div>
              {uni.ranking && (
                <div className="px-2 py-0.5 rounded bg-zinc-800 border border-white/5 text-[10px] font-mono text-zinc-400">
                  {uni.ranking}
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-400 leading-relaxed mb-6 line-clamp-3 flex-1">
              {uni.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                <div className="text-[9px] font-mono uppercase text-zinc-600 mb-1">Tuition</div>
                <div className="text-sm font-bold text-white">{uni.tuition}</div>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                <div className="text-[9px] font-mono uppercase text-zinc-600 mb-1">Living cost</div>
                <div className="text-sm font-bold text-white">{uni.livingCost}</div>
              </div>
            </div>

            {/* Strengths */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-1.5">
                {uni.strengths.slice(0, 3).map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-zinc-400">
                    {s}
                  </span>
                ))}
                {uni.strengths.length > 3 && (
                  <span className="text-[10px] text-zinc-600 ml-1">+{uni.strengths.length - 3} more</span>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3 pt-4 border-t border-white/5">
              <Link
                href={`/universities/${uni.id}`}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white text-black text-xs font-bold text-center transition-all hover:bg-zinc-200"
              >
                View Programmes
              </Link>
              <a
                href={uni.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-bold border border-white/5 hover:bg-zinc-700 transition-all"
              >
                Site
              </a>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-32 text-center border border-dashed border-white/10 rounded-3xl">
          <p className="text-zinc-500 font-mono text-sm">No universities found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
