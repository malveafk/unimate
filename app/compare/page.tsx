"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { universities } from "../data/universities";

function parseCost(cost: string): number {
  const match = cost.match(/(\d[\d,]*)/);
  return match ? parseInt(match[1].replace(",", ""), 10) : 0;
}

function CostBar({ value, max, colorClass }: { value: number; max: number; colorClass: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-2">
      <div className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`} style={{ width: `${pct}%` }} />
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

  const uniA = useMemo(() => universities.find((u) => u.id === uniAId), [uniAId]);
  const uniB = useMemo(() => universities.find((u) => u.id === uniBId), [uniBId]);

  const bachA = useMemo(() => uniA?.bachelors.find((b) => b.id === bachAId), [uniA, bachAId]);
  const bachB = useMemo(() => uniB?.bachelors.find((b) => b.id === bachBId), [uniB, bachBId]);

  const maxTuition = Math.max(parseCost(uniA?.tuition ?? "0"), parseCost(uniB?.tuition ?? "0"), 25000);
  const maxLiving = Math.max(parseCost(uniA?.livingCost ?? "0"), parseCost(uniB?.livingCost ?? "0"), 2000);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-gradient mb-4">Side-by-side comparison.</h1>
        <p className="text-zinc-400 text-lg">Compare universities, programmes and key costs across Europe.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">University A</label>
            <select
              value={uniAId}
              onChange={(e) => {
                setUniAId(e.target.value);
                setBachAId("");
              }}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/20 transition-all appearance-none"
            >
              <option value="">Select university…</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.flag} {u.name}
                </option>
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
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">University B</label>
            <select
              value={uniBId}
              onChange={(e) => {
                setUniBId(e.target.value);
                setBachBId("");
              }}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/20 transition-all appearance-none"
            >
              <option value="">Select university…</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.flag} {u.name}
                </option>
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
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {!uniA || !uniB ? (
        <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl">
          <p className="text-zinc-500 font-mono text-sm">Select two universities to start comparing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-12 gap-y-8">
          <div className="space-y-2">
            <div className="text-4xl mb-4">{uniA.flag}</div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{uniA.name}</h2>
            <p className="text-zinc-500 text-sm font-medium">
              {uniA.city}, {uniA.country}
            </p>
          </div>
          <div className="space-y-2 text-right">
            <div className="text-4xl mb-4">{uniB.flag}</div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{uniB.name}</h2>
            <p className="text-zinc-500 text-sm font-medium">
              {uniB.city}, {uniB.country}
            </p>
          </div>

          <SectionTitle title="Finances" />

          <div className="space-y-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-500">Tuition Fee</span>
              <span className="text-white font-bold">{uniA.tuition}</span>
            </div>
            <CostBar value={parseCost(uniA.tuition)} max={maxTuition} colorClass="bg-emerald-500" />
          </div>
          <div className="space-y-2 text-right">
            <div className="flex justify-between flex-row-reverse text-xs mb-1">
              <span className="text-zinc-500">Tuition Fee</span>
              <span className="text-white font-bold">{uniB.tuition}</span>
            </div>
            <div className="flex justify-end">
              <div className="w-full rotate-180">
                <CostBar value={parseCost(uniB.tuition)} max={maxTuition} colorClass="bg-emerald-500" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-500">Living Cost</span>
              <span className="text-white font-bold">{uniA.livingCost}</span>
            </div>
            <CostBar value={parseCost(uniA.livingCost)} max={maxLiving} colorClass="bg-blue-500" />
          </div>
          <div className="space-y-2 text-right">
            <div className="flex justify-between flex-row-reverse text-xs mb-1">
              <span className="text-zinc-500">Living Cost</span>
              <span className="text-white font-bold">{uniB.livingCost}</span>
            </div>
            <div className="flex justify-end">
              <div className="w-full rotate-180">
                <CostBar value={parseCost(uniB.livingCost)} max={maxLiving} colorClass="bg-blue-500" />
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
              {uniA.strengths.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-zinc-400">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-[10px] font-mono text-zinc-500 text-right">Strengths</div>
            <div className="flex flex-wrap gap-1.5 justify-end">
              {uniB.strengths.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-zinc-400">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {(bachA || bachB) && (
            <>
              <SectionTitle title="Programme Comparison" />
              <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/10">
                {bachA ? (
                  <>
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
                      <p className="text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-4 mt-4">
                        {bachA.description}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-zinc-500 text-sm font-mono">No programme selected.</p>
                )}
              </div>
              <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/10 text-right">
                {bachB ? (
                  <>
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
                      <p className="text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-4 mt-4">
                        {bachB.description}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-zinc-500 text-sm font-mono">No programme selected.</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-24 pt-12 border-t border-white/5 flex flex-col items-center gap-6">
        <p className="text-zinc-500 text-sm">Need more specific details or advice?</p>
        <Link href="/chat" className="px-8 py-3 rounded-xl bg-white text-black font-bold transition-all hover:bg-zinc-200">
          Ask Unimate AI Assistant
        </Link>
      </div>
    </div>
  );
}

