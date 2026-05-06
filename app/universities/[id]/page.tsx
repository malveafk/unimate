"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { universities } from "../../data/universities";

export default function UniversityDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const uni = universities.find((u) => u.id === id);
  if (!uni) notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back */}
      <Link href="/universities" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-12">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Back to universities
      </Link>

      {/* Hero */}
      <header className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
          <div>
            <div className="text-4xl mb-4">{uni.flag}</div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gradient mb-2">{uni.name}</h1>
            <p className="text-zinc-500 font-medium">{uni.city}, {uni.country}</p>
          </div>
          {uni.ranking && (
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400">
              {uni.ranking}
            </div>
          )}
        </div>

        <p className="text-zinc-400 text-lg leading-relaxed max-w-3xl">
          {uni.description}
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
        {[
          { label: "Tuition", value: uni.tuition, color: "text-emerald-400" },
          { label: "Living Cost", value: uni.livingCost, color: "text-white" },
          { label: "Teaching", value: uni.teaching, color: "text-white" },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">{stat.label}</div>
            <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        <div>
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-6">Strengths</h3>
          <div className="flex flex-wrap gap-2">
            {uni.strengths.map((s) => (
              <span key={s} className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-xs text-zinc-300">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-6">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {uni.languages.map((l) => (
              <span key={l} className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-medium">
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Programmes */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold tracking-tight mb-8">Bachelor Programmes</h2>
        <div className="space-y-4">
          {uni.bachelors.map((b) => (
            <Link
              key={b.id}
              href={`/universities/${uni.id}/${b.id}`}
              className="group block p-6 rounded-2xl border border-white/10 bg-zinc-900/30 transition-all hover:border-white/20 hover:bg-zinc-900/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-zinc-200">{b.name}</h4>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      {b.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                      {b.language}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                      {b.courses.length} courses
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 transition-all group-hover:bg-white group-hover:text-black">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="flex justify-center pt-8 border-t border-white/5">
        <a
          href={uni.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white text-black font-bold transition-all hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Visit Official Website
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
      </div>
    </div>
  );
}
