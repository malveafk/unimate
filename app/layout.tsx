import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "./components/Navbar";
import { PageTransitionProvider } from "./components/PageTransition";
import { MainWrapper } from "./components/MainWrapper";
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
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${mono.variable}`}>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)", color: "var(--text-1)" }}>
        <PageTransitionProvider>
          <Navbar />
          <MainWrapper>
            {children}
          </MainWrapper>
          <footer style={{
          borderTop: "1px solid var(--border)",
          padding: "28px 32px",
          background: "var(--bg)",
        }}>
          <div style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: "var(--text-1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "var(--bg)" }}>U</div>
              <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>© 2026 Unimate</span>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              {["Privacy", "Terms", "Twitter"].map((l) => (
                <a key={l} href="#" className="footer-link">{l}</a>
              ))}
            </div>
          </div>
        </footer>
        </PageTransitionProvider>
      </body>
    </html>
  );
}
