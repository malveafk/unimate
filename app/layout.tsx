import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "./components/Navbar";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} h-full dark`}>
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-white/20">
        <Navbar />
        <main className="flex-1">
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
