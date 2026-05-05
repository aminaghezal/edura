"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "./animated-counter";
import { Sparkline } from "./sparkline";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

type Props = {
  label: string;
  value: number;
  delta?: number; // percentage change vs previous period
  sparklineData?: number[];
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon?: React.ReactNode;
  accent?: "primary" | "emerald" | "amber" | "red" | "indigo";
};

const accents: Record<NonNullable<Props["accent"]>, string> = {
  primary:
    "from-indigo-500/10 to-indigo-500/5 text-indigo-700 dark:from-indigo-400/15 dark:to-indigo-400/5 dark:text-indigo-300",
  emerald:
    "from-emerald-500/10 to-emerald-500/5 text-emerald-700 dark:from-emerald-400/20 dark:to-emerald-400/5 dark:text-emerald-300",
  amber:
    "from-amber-500/10 to-amber-500/5 text-amber-700 dark:from-amber-400/15 dark:to-amber-400/5 dark:text-amber-300",
  red:
    "from-red-500/10 to-red-500/5 text-red-700 dark:from-red-400/20 dark:to-red-400/5 dark:text-red-300",
  indigo:
    "from-indigo-500/10 to-indigo-500/5 text-indigo-700 dark:from-indigo-400/15 dark:to-indigo-400/5 dark:text-indigo-300",
};

export function MetricCard({
  label,
  value,
  delta,
  sparklineData,
  prefix,
  suffix,
  decimals,
  icon,
  accent = "primary",
}: Props) {
  const isUp = delta != null && delta > 0;
  const isDown = delta != null && delta < 0;
  const isFlat = delta != null && delta === 0;

  return (
    <Card className="relative overflow-hidden border-border/60 hover:border-primary/40 transition-all hover:shadow-md hover:-translate-y-0.5 duration-300 animate-in fade-in slide-in-from-bottom-2 dark:hover:shadow-[0_0_24px_-8px_rgba(167,139,250,0.4)]">
      {/* Subtle gradient glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none ${accents[accent]}`}
      />

      <CardContent className="relative p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
            {label}
          </div>
          {icon && (
            <div className={`opacity-70 ${accents[accent].split(" ").slice(-1)}`}>
              {icon}
            </div>
          )}
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-3xl font-bold tracking-tight">
              <AnimatedCounter
                value={value}
                prefix={prefix}
                suffix={suffix}
                decimals={decimals}
              />
            </div>
            {delta != null && (
              <div className="flex items-center gap-1 mt-1.5 text-xs font-semibold">
                {isUp && <ArrowUp className="w-3 h-3 text-emerald-600" />}
                {isDown && <ArrowDown className="w-3 h-3 text-red-600" />}
                {isFlat && <Minus className="w-3 h-3 text-muted-foreground" />}
                <span
                  className={
                    isUp
                      ? "text-emerald-600"
                      : isDown
                        ? "text-red-600"
                        : "text-muted-foreground"
                  }
                >
                  {Math.abs(delta).toFixed(1)}%
                </span>
                <span className="text-muted-foreground font-normal">
                  vs mois dernier
                </span>
              </div>
            )}
          </div>

          {sparklineData && sparklineData.length > 1 && (
            <div className="w-24 h-12 flex-shrink-0">
              <Sparkline
                data={sparklineData}
                color={isDown ? "#dc2626" : "#059669"}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
