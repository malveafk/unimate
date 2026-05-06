"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { news, NewsItem } from "./data/news";

function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
      {tag}
    </span>
  );
}

function FeaturedCard({ item }: { item: NewsItem }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 transition-all hover:border-white/20">
      <div className="aspect-[21/9] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={item.image} 
          alt={item.title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>
      
      <div className="absolute bottom-0 left-0 p-8 w-full">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 rounded bg-white text-black text-[10px] font-bold uppercase tracking-tighter">Featured</span>
          <TagBadge tag={item.tag} />
        </div>
        
        <div className="flex items-center gap-2 mb-3 text-zinc-400 text-xs">
          <span>{item.flag}</span>
          {item.university && <span className="font-medium text-zinc-300">{item.university}</span>}
          <span className="ml-auto opacity-60 font-mono">{item.date}</span>
        </div>
        
        <h2 className="text-3xl font-bold tracking-tight text-white mb-4 leading-tight max-w-2xl">
          {item.title}
        </h2>
        
        <p className="text-zinc-400 text-base mb-6 line-clamp-2 max-w-2xl leading-relaxed">
          {item.summary}
        </p>
        
        <Link
          href={`/chat?news=${encodeURIComponent(item.title)}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black text-sm font-semibold transition-all hover:bg-zinc-200"
        >
          Ask Assistant
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <div className="group flex flex-col rounded-xl border border-white/10 bg-zinc-900/30 transition-all hover:border-white/20 hover:bg-zinc-900/50 p-5">
      <div className="aspect-video w-full overflow-hidden rounded-lg mb-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={item.image} 
          alt={item.title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <TagBadge tag={item.tag} />
        <span className="ml-auto text-[10px] font-mono text-zinc-500">{item.date}</span>
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-3 leading-snug group-hover:text-zinc-200 transition-colors">
        {item.title}
      </h3>
      
      <p className="text-zinc-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
        {item.summary}
      </p>
      
      <Link
        href={`/chat?news=${encodeURIComponent(item.title)}`}
        className="text-xs font-semibold text-white flex items-center gap-1.5 group/link"
      >
        Explore details 
        <span className="transition-transform group-hover/link:translate-x-0.5">→</span>
      </Link>
    </div>
  );
}

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedTag, setSelectedTag] = useState("All");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = news.filter(n => {
    const matchCountry = selectedCountry === "all" || n.country === selectedCountry;
    const matchTag = selectedTag === "All" || n.tag === selectedTag;
    return matchCountry && matchTag;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <header className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-gradient mb-4">
              The Hub for <br />International Students.
            </h1>
            <p className="text-zinc-400 text-lg max-w-xl leading-relaxed">
              Stay updated with the latest news on admissions, scholarships, and housing across European universities.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest mb-1">Last Update</span>
              <span className="text-sm font-medium text-white">May 06, 2026</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 border-y border-white/5 py-6">
          <button 
            onClick={() => setSelectedTag("All")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${selectedTag === "All" ? "bg-white text-black" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
          >
            All Updates
          </button>
          {["Admissions", "Grants", "Housing", "Scholarships", "Updates", "Trends", "Tuition"].map(tag => (
            <button 
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${selectedTag === tag ? "bg-white text-black" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </header>

      {/* Content Grid */}
      <div className="space-y-12">
        {featured && <FeaturedCard item={featured} />}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rest.map((item, idx) => (
            <NewsCard key={idx} item={item} />
          ))}
        </div>
        
        {filtered.length === 0 && (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-zinc-500 font-mono text-sm">No news found for the selected criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
