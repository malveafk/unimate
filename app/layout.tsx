import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Unimate — Study Abroad Assistant",
  description: "Your personal guide to studying abroad in Europe",
};

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-bold text-lg transition-transform group-hover:scale-105">
            U
          </div>
          <span className="font-semibold text-lg tracking-tight">Unimate</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          <Link href="/" className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors hover:text-white text-zinc-400">
            News
          </Link>
          <Link href="/universities" className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors hover:text-white text-zinc-400">
            Universities
          </Link>
          <Link href="/compare" className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors hover:text-white text-zinc-400">
            Compare
          </Link>
          <Link href="/chat" className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors hover:text-white text-zinc-400">
            Chat AI
          </Link>
        </div>

        <Link 
          href="/chat" 
          className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold transition-all hover:bg-zinc-200 active:scale-95"
        >
          Get started
        </Link>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} h-full dark`}>
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-white/20">
        <Navbar />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <footer className="border-t border-white/10 py-12 bg-black">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold">U</div>
              <span className="text-sm text-zinc-500 font-medium">© 2026 Unimate Platform</span>
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-xs text-zinc-500 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-xs text-zinc-500 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-xs text-zinc-500 hover:text-white transition-colors">Twitter</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
