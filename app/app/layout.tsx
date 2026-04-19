import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Nav } from "@/components/Nav";
import { SoundProvider } from "@/components/SoundProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Inversion Gym — Rehearsal",
  description: "The product died. Work backwards. What killed it?",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-[color:var(--color-ink)] focus:text-[color:var(--color-paper)] focus:px-3 focus:py-2 focus:rounded">
          Skip to main content
        </a>
        <SoundProvider>
          <div className="flex min-h-screen">
            <Nav />
            <main id="main" className="flex-1 min-w-0">{children}</main>
          </div>
        </SoundProvider>
      </body>
    </html>
  );
}
