"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";
import { getUniversity, type University, type Bachelor } from "../../../../utils/universities";

export default function BachelorDetail({ params }: { params: Promise<{ id: string; bachelor: string }> }) {
  const { id, bachelor: bachelorId } = use(params);
  const [uni, setUni] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUniversity(id)
      .then((data) => setUni(data))
      .catch((error) => {
        console.error("Failed to load university:", error?.message ?? error);
        setError("Impossibile caricare i dati. Riprova più tardi.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center text-zinc-500">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center text-zinc-500">
        {error}
      </div>
    );
  }

  if (!uni) notFound();
  const bachelor: Bachelor | undefined = uni.bachelors.find((b) => b.id === bachelorId);
  if (!bachelor) notFound();

  const courses = bachelor.courses;
  const coursesByYear = courses.reduce<Record<number, typeof courses>>((acc, course) => {
    const year = course.year ?? 0;
    acc[year] = [...(acc[year] ?? []), course];
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <nav className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-12 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/universities" className="hover:text-white transition-colors">
          Universities
        </Link>
        <span>/</span>
        <Link href={`/universities/${uni.id}`} className="hover:text-white transition-colors">
          {uni.name}
        </Link>
        <span>/</span>
        <span className="text-zinc-300">{bachelor.name}</span>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4 text-zinc-400">
          <span className="text-xl">{uni.flag}</span>
          <span className="text-sm font-medium">{uni.name}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-8">{bachelor.name}</h1>

        <div className="flex flex-wrap gap-6 border-y border-white/5 py-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Duration</span>
            <span className="text-sm font-bold text-white">{bachelor.duration}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Language</span>
            <span className="text-sm font-bold text-white">{bachelor.language}</span>
          </div>
        </div>
      </header>

      <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8 mb-16">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">Programme Overview</h3>
        <p className="text-zinc-300 text-base leading-relaxed">{bachelor.description}</p>
      </div>

      {Object.keys(coursesByYear).length > 0 && (
        <div className="mb-16">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-6">Curriculum</h3>
          <div className="flex flex-col gap-8">
            {Object.entries(coursesByYear)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([year, yearCourses]) => (
                <div key={year}>
                  <h4 className="text-sm font-bold text-white mb-3">
                    {year === "0" ? "Courses" : `Year ${year}`}
                  </h4>
                  <ul className="flex flex-col gap-2">
                    {yearCourses?.map((course, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-4 text-sm text-zinc-300 border-b border-white/5 pb-2"
                      >
                        <span>{course.name}</span>
                        {course.credits && (
                          <span className="text-[11px] font-mono text-zinc-500 whitespace-nowrap">
                            {course.credits}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      )}

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

