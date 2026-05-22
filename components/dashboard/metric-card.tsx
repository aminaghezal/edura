"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "./animated-counter";
import { Sparkline } from "./sparkline";
import { ArrowUp, ArrowDown } from "lucide-react";

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

const accents: Record<NonNullable<Props["accent"]>, { soft: string; ring: string; iconColor: string }> = {
  primary: {
    soft: "bg-indigo-50/60 dark:bg-indigo-950/20",
    ring: "ring-indigo-100 dark:ring-indigo-900/40",
    iconColor: "text-indigo-500",
  },
  emerald: {
    soft: "bg-emerald-50/60 dark:bg-emerald-950/20",
    ring: "ring-emerald-100 dark:ring-emerald-900/40",
    iconColor: "text-emerald-500",
  },
  amber: {
    soft: "bg-amber-50/60 dark:bg-amber-950/20",
    ring: "ring-amber-100 dark:ring-amber-900/40",
    iconColor: "text-amber-500",
  },
  red: {
    soft: "bg-red-50/60 dark:bg-red-950/20",
    ring: "ring-red-100 dark:ring-red-900/40",
    iconColor: "text-red-500",
  },
  indigo: {
    soft: "bg-indigo-50/60 dark:bg-indigo-950/20",
    ring: "ring-indigo-100 dark:ring-indigo-900/40",
    iconColor: "text-indigo-500",
  },
};

// Vary the delta wording so the dashboard doesn't feel like a template
function phraseDelta(delta: number, accent: NonNullable<Props["accent"]>): string {
  const abs = Math.abs(delta).toFixed(1).replace(/\.0$/, "");
  if (delta === 0) return "stable depuis septembre";
  if (delta > 0) {
    if (accent === "red") return `${abs}% en plus — à surveiller`;
    if (delta > 15) return `${abs}% en hausse — belle dynamique`;
    return `+${abs}% vs septembre`;
  }
  if (accent === "emerald") return `${abs}% en baisse — à regarder`;
  if (delta < -10) return `${abs}% en baisse marquée`;
  return `−${abs}% vs septembre`;
}

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
  const a = accents[accent];

  return (
    <Card
      className={`group relative border ${a.ring} ring-1 hover:shadow-sm transition-all duration-200 hover:-translate-y-px`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="text-sm text-muted-foreground font-medium">
            {label}
          </div>
          {icon && (
            <div className={`w-9 h-9 rounded-lg grid place-items-center ${a.soft} ${a.iconColor}`}>
              {icon}
            </div>
          )}
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[2rem] font-semibold tracking-tight leading-none text-foreground">
              <AnimatedCounter
                value={value}
                prefix={prefix}
                suffix={suffix}
                decimals={decimals}
              />
            </div>
            {delta != null && (
              <div className="flex items-center gap-1.5 mt-2 text-xs">
                {isUp && (
                  <ArrowUp
                    className={`w-3 h-3 ${accent === "red" ? "text-red-500" : "text-emerald-500"}`}
                  />
                )}
                {isDown && (
                  <ArrowDown
                    className={`w-3 h-3 ${accent === "emerald" ? "text-amber-500" : "text-muted-foreground"}`}
                  />
                )}
                <span className="text-muted-foreground">
                  {phraseDelta(delta, accent)}
                </span>
              </div>
            )}
          </div>

          {sparklineData && sparklineData.length > 1 && (
            <div className="w-20 h-10 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
              <Sparkline
                data={sparklineData}
                color={
                  accent === "red"
                    ? "#dc2626"
                    : accent === "amber"
                      ? "#d97706"
                      : "#10b981"
                }
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
