"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { universities } from "../../../data/universities";

export default function BachelorDetail({ params }: { params: Promise<{ id: string; bachelor: string }> }) {
  const { id, bachelor: bachelorId } = use(params);
  const uni = universities.find((u) => u.id === id);
  if (!uni) notFound();
  const bachelor = uni.bachelors.find((b) => b.id === bachelorId);
  if (!bachelor) notFound();

  const hasYears = bachelor.courses.some((c) => c.year !== undefined);
  const maxYear = hasYears ? Math.max(...bachelor.courses.map((c) => c.year ?? 1)) : 3;
  const yearOptions = hasYears ? Array.from({ length: maxYear }, (_, i) => (i + 1) as 1 | 2 | 3 | 4 | 5) : null;
  const [activeYear, setActiveYear] = useState<1 | 2 | 3 | 4 | 5>(1);

  const visibleCourses = hasYears
    ? bachelor.courses.filter((c) => c.year === activeYear)
    : bachelor.courses;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-12 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/universities" className="hover:text-white transition-colors">Universities</Link>
        <span>/</span>
        <Link href={`/universities/${uni.id}`} className="hover:text-white transition-colors">{uni.name}</Link>
        <span>/</span>
        <span className="text-zinc-300">{bachelor.name}</span>
      </nav>

      {/* Hero */}
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4 text-zinc-400">
          <span className="text-xl">{uni.flag}</span>
          <span className="text-sm font-medium">{uni.name}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-8">
          {bachelor.name}
        </h1>
        
        <div className="flex flex-wrap gap-6 border-y border-white/5 py-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Duration</span>
            <span className="text-sm font-bold text-white">{bachelor.duration}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Language</span>
            <span className="text-sm font-bold text-white">{bachelor.language}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Credits</span>
            <span className="text-sm font-bold text-white">{bachelor.courses.length} courses</span>
          </div>
        </div>
      </header>

      {/* Description */}
      <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8 mb-16">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">Programme Overview</h3>
        <p className="text-zinc-300 text-base leading-relaxed">{bachelor.description}</p>
      </div>

      {/* Course List Section */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h2 className="text-xl font-bold tracking-tight">Course Curriculum</h2>
          
          {yearOptions && (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-white/5">
              {yearOptions.map((y) => (
                <button
                  key={y}
                  onClick={() => setActiveYear(y)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeYear === y ? "bg-white text-black" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  Year {y}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/30 overflow-hidden">
          {visibleCourses.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 font-mono text-sm italic">
              No courses listed for this academic year.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {visibleCourses.map((course, i) => (
                <div key={i} className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-5">
                    <span className="text-[10px] font-mono text-zinc-700 group-hover:text-zinc-500 w-4">{i + 1}</span>
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white">{course.name}</span>
                  </div>
                  {course.credits && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 border border-white/5 text-zinc-500">
                      {course.credits}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Actions */}
      <div className="mt-16 pt-12 border-t border-white/5 flex flex-wrap gap-4">
        <a
          href={uni.website}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-xl bg-white text-black text-sm font-bold transition-all hover:bg-zinc-200"
        >
          Official website
        </a>
        <Link
          href="/chat"
          className="px-6 py-3 rounded-xl bg-zinc-900 text-white text-sm font-bold border border-white/10 hover:border-white/20 transition-all"
        >
          Ask Assistant
        </Link>
      </div>
    </div>
  );
}
