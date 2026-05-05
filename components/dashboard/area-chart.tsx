"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/components/theme-provider";

export function TrendChart({
  data,
  height = 280,
  color,
  unit = "",
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  unit?: string;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Vibrant neon for dark, muted for light
  const lineColor = color ?? (isDark ? "#a78bfa" : "#4f46e5");
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0";
  const axisColor = isDark ? "rgba(255,255,255,0.45)" : "#94a3b8";
  const tooltipBg = isDark ? "#0f0f0f" : "white";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity={isDark ? 0.5 : 0.3} />
            <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
          </linearGradient>
        </defs>
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
          cursor={{ stroke: lineColor, strokeWidth: 1, strokeDasharray: "4 4" }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={lineColor}
          strokeWidth={2.5}
          fill="url(#trendGrad)"
          isAnimationActive
          animationDuration={1000}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
