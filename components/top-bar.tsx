"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "./theme-provider";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Monitor,
  Command,
  Settings2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar({ userName }: { userName: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [today, setToday] = useState("");
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  // Compute the date client-side only to avoid SSR/CSR hydration drift
  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    );
  }, []);

  // Cmd+K shortcut to focus search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Quick navigation map — search routes by keyword
  const ROUTES: { keywords: string[]; path: string; label: string }[] = [
    { keywords: ["dashboard", "tableau", "accueil", "home"], path: "/app", label: "Tableau de bord" },
    { keywords: ["élève", "eleve", "etudiant", "student"], path: "/app/students", label: "Élèves" },
    { keywords: ["note", "saisie", "grade", "moyenne"], path: "/app/grades", label: "Notes" },
    { keywords: ["bulletin", "rapport scolaire"], path: "/app/bulletins", label: "Bulletins" },
    { keywords: ["présence", "presence", "absence", "attendance"], path: "/app/attendance", label: "Présences" },
    { keywords: ["emploi", "temps", "schedule", "edt"], path: "/app/schedule", label: "Emploi du temps" },
    { keywords: ["finance", "paiement", "argent", "facture"], path: "/app/finance", label: "Finance" },
    { keywords: ["ia", "ai", "risque", "insight", "intelligence"], path: "/app/insights", label: "Analyses IA" },
    { keywords: ["rapport scientifique", "orientation", "gardner"], path: "/app/reports", label: "Rapports Scientifiques" },
    { keywords: ["paramètre", "parametre", "setting", "config"], path: "/app/settings", label: "Paramètres" },
    { keywords: ["équipe", "equipe", "team", "professeur"], path: "/app/settings/team", label: "Équipe" },
    { keywords: ["aide", "help", "faq", "support"], path: "/app/help", label: "Aide" },
  ];

  const searchMatches = searchQuery.trim()
    ? ROUTES.filter((r) =>
        r.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.label.toLowerCase().includes(searchQuery.toLowerCase()),
      ).slice(0, 6)
    : [];

  function navigateTo(path: string) {
    setSearchQuery("");
    setSearchOpen(false);
    router.push(path);
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-3 px-3 sm:px-6 py-3 pl-14 lg:pl-6">
        {/* Search bar with live results */}
        <div className="flex items-center gap-2 flex-1 max-w-md relative">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchMatches[0]) {
                  navigateTo(searchMatches[0].path);
                } else if (e.key === "Escape") {
                  setSearchQuery("");
                  setSearchOpen(false);
                  searchRef.current?.blur();
                }
              }}
              placeholder="Rechercher une page (élèves, notes, finance...)"
              className="w-full h-9 pl-9 pr-16 rounded-md border border-input bg-muted/40 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground bg-muted border border-border">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </div>

          {/* Dropdown results */}
          {searchOpen && searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-1 rounded-md border bg-popover shadow-lg z-50 max-h-80 overflow-auto">
              {searchMatches.length === 0 ? (
                <div className="p-3 text-xs text-muted-foreground text-center">
                  Aucun résultat
                </div>
              ) : (
                searchMatches.map((m) => (
                  <button
                    key={m.path}
                    onMouseDown={() => navigateTo(m.path)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                  >
                    <Search className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{m.label}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                      {m.path}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Subtle today indicator — replaces the noisy API/DB/IA pills */}
        {today && (
          <div className="hidden lg:flex items-center gap-2 mr-3 text-xs text-muted-foreground">
            <span className="capitalize">{today}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                <span className="text-xs font-normal text-muted-foreground">3 nouvelles</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <NotificationItem
                title="3 élèves en risque détectés"
                description="Analyse IA de la nuit"
                time="Il y a 2h"
                color="red"
              />
              <NotificationItem
                title="Paiement reçu — 25 000 DZD"
                description="Yasmine Kaci, T2"
                time="Il y a 4h"
                color="emerald"
              />
              <NotificationItem
                title="Bulletins T2 prêts"
                description="40 bulletins générés"
                time="Hier"
                color="indigo"
              />
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-xs text-muted-foreground">
                Voir toutes les notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                {resolvedTheme === "dark" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Apparence</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="w-4 h-4 mr-2" />
                Clair
                {theme === "light" && (
                  <span className="ml-auto text-xs text-primary">●</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="w-4 h-4 mr-2" />
                Sombre
                {theme === "dark" && (
                  <span className="ml-auto text-xs text-primary">●</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="w-4 h-4 mr-2" />
                Système
                {theme === "system" && (
                  <span className="ml-auto text-xs text-primary">●</span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick settings */}
          <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
            <a href="/app/settings">
              <Settings2 className="w-4 h-4" />
            </a>
          </Button>

          {/* Help — linked to /app/help */}
          <Button variant="ghost" size="icon" className="h-9 w-9 hidden md:inline-flex" asChild>
            <a href="/app/help" aria-label="Aide">
              <HelpCircle className="w-4 h-4" />
            </a>
          </Button>

          {/* User avatar — clickable, links to settings */}
          <a
            href="/app/settings"
            className="ml-2 pl-3 border-l flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="Mon profil"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-primary-foreground text-xs font-bold shadow-sm group-hover:scale-105 transition-transform">
              {userName[0]?.toUpperCase()}
            </div>
            <div className="hidden md:block leading-tight">
              <div className="text-xs font-semibold truncate max-w-[120px]">
                {userName}
              </div>
              <div className="text-[10px] text-muted-foreground">En ligne</div>
            </div>
          </a>
        </div>
      </div>
    </header>
  );
}

function NotificationItem({
  title,
  description,
  time,
  color,
}: {
  title: string;
  description: string;
  time: string;
  color: "red" | "emerald" | "indigo" | "amber";
}) {
  const dotColor = {
    red: "bg-red-500",
    emerald: "bg-emerald-500",
    indigo: "bg-indigo-500",
    amber: "bg-amber-500",
  }[color];

  return (
    <div className="flex items-start gap-3 px-2 py-2.5 hover:bg-muted/50 rounded-sm cursor-pointer">
      <span className={`w-2 h-2 rounded-full ${dotColor} mt-1.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium leading-tight">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
        <div className="text-[10px] text-muted-foreground/70 mt-1">{time}</div>
      </div>
    </div>
  );
}
