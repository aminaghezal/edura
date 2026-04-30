import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EDURA — Gestion scolaire",
  description: "Système de gestion scolaire pour les écoles privées algériennes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`h-full antialiased ${inter.variable}`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
