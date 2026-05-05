"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/components/theme-provider";

const NEON = ["#a78bfa", "#34d399", "#fbbf24", "#f87171", "#22d3ee", "#c084fc"];
const SOFT = ["#4f46e5", "#059669", "#d97706", "#dc2626", "#0891b2", "#7c3aed"];

export function VerticalBarChart({
  data,
  height = 240,
  color,
  unit = "",
}: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  color?: string;
  unit?: string;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const palette = isDark ? NEON : SOFT;
  const fallback = color ?? palette[0];
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0";
  const axisColor = isDark ? "rgba(255,255,255,0.45)" : "#94a3b8";
  const tooltipBg = isDark ? "#0f0f0f" : "white";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const cursorFill = isDark ? "rgba(167, 139, 250, 0.08)" : "rgba(79, 70, 229, 0.06)";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="label"
          stroke={axisColor}
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={axisColor}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={32}
        />
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
          formatter={(v) => [`${v}${unit}`, ""]}
          cursor={{ fill: cursorFill }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={800}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={
                entry.color
                  ? isDark
                    ? brighten(entry.color)
                    : entry.color
                  : isDark
                    ? palette[i % palette.length]
                    : fallback
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Convert any hex color to a brighter version for dark mode
function brighten(hex: string): string {
  const map: Record<string, string> = {
    "#4f46e5": "#a78bfa",
    "#059669": "#34d399",
    "#d97706": "#fbbf24",
    "#dc2626": "#f87171",
    "#0891b2": "#22d3ee",
    "#7c3aed": "#c084fc",
  };
  return map[hex.toLowerCase()] ?? hex;
}
