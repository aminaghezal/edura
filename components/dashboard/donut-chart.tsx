"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useTheme } from "@/components/theme-provider";

const NEON_MAP: Record<string, string> = {
  "#10b981": "#34d399",
  "#f59e0b": "#fbbf24",
  "#ef4444": "#f87171",
  "#94a3b8": "#cbd5e1",
  "#4f46e5": "#a78bfa",
  "#059669": "#34d399",
  "#d97706": "#fbbf24",
  "#dc2626": "#f87171",
  "#0891b2": "#22d3ee",
};

export function DonutChart({
  data,
  height = 220,
  centerLabel,
  centerValue,
}: {
  data: { name: string; value: number; color: string }[];
  height?: number;
  centerLabel?: string;
  centerValue?: string | number;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const tooltipBg = isDark ? "#0f0f0f" : "white";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const stroke = isDark ? "#000000" : "white";

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius="60%"
            outerRadius="90%"
            paddingAngle={2}
            dataKey="value"
            isAnimationActive
            animationDuration={900}
            stroke={stroke}
            strokeWidth={2}
          >
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={isDark ? NEON_MAP[entry.color.toLowerCase()] ?? entry.color : entry.color}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: 8,
              fontSize: 12,
              boxShadow: isDark
                ? "0 4px 24px rgba(0,0,0,0.6)"
                : "0 4px 12px rgba(0,0,0,0.08)",
              color: isDark ? "#fff" : "#000",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-2xl font-bold tracking-tight">{centerValue}</div>
          <div className="text-xs uppercase text-muted-foreground tracking-wide font-semibold">
            {centerLabel}
          </div>
        </div>
      )}
    </div>
  );
}
