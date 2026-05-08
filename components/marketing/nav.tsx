"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#features", label: "Fonctionnalités" },
    { href: "#how", label: "Comment ça marche" },
    { href: "#pricing", label: "Tarifs" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-[#e2e8f0] bg-white/80 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg gradient-bg-diag grid place-items-center text-white font-extrabold shadow-accent-sm">
            E
          </div>
          <span className="font-display text-xl">EDURA</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-[#64748b] hover:text-[#0f172a] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-[#64748b] hover:text-[#0f172a] transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-xl gradient-bg px-5 py-2.5 text-sm font-medium text-white shadow-accent-sm hover:shadow-accent-lg hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] transition-all duration-200"
          >
            Essai gratuit 30 jours
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 -mr-2"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#e2e8f0] bg-white">
          <div className="px-6 py-4 flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="py-2 text-sm text-[#0f172a]"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              className="py-2 text-sm text-[#64748b]"
            >
              Se connecter
            </Link>
            <Link
              href="/signup"
              className="rounded-xl gradient-bg px-5 py-3 text-center text-sm font-medium text-white shadow-accent-sm"
            >
              Essai gratuit 30 jours
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
