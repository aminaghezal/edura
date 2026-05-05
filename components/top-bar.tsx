"use client";

import { useState } from "react";
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

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-3 px-6 py-3">
        {/* Search bar */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un élève, classe, paiement..."
              className="w-full h-9 pl-9 pr-16 rounded-md border border-input bg-muted/40 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground bg-muted border border-border">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </div>
        </div>

        {/* System status indicators */}
        <div className="hidden lg:flex items-center gap-3 mr-2">
          <StatusPill label="API" status="ok" />
          <StatusPill label="DB" status="ok" />
          <StatusPill label="IA" status="ok" />
        </div>

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

          {/* Help */}
          <Button variant="ghost" size="icon" className="h-9 w-9 hidden md:inline-flex">
            <HelpCircle className="w-4 h-4" />
          </Button>

          {/* User avatar */}
          <div className="ml-2 pl-3 border-l">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-primary-foreground text-xs font-bold shadow-sm">
                {userName[0]?.toUpperCase()}
              </div>
              <div className="hidden md:block leading-tight">
                <div className="text-xs font-semibold truncate max-w-[120px]">
                  {userName}
                </div>
                <div className="text-[10px] text-muted-foreground">En ligne</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function StatusPill({
  label,
  status,
}: {
  label: string;
  status: "ok" | "warn" | "err";
}) {
  const colors = {
    ok: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    warn: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    err: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
  };
  const dot = {
    ok: "bg-emerald-500",
    warn: "bg-amber-500",
    err: "bg-red-500",
  };
  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold uppercase tracking-wider ${colors[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]} animate-pulse`} />
      {label}
    </div>
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
