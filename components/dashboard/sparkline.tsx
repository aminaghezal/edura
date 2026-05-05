"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { useTheme } from "@/components/theme-provider";

export function Sparkline({
  data,
  color,
}: {
  data: number[];
  color?: string;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  // Brighten green for dark mode pop
  const finalColor =
    color ?? (isDark ? "#34d399" : "#059669");
  const chartData = data.map((v, i) => ({ i, v }));
  const id = `sparkGrad-${finalColor.replace("#", "")}`;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={finalColor} stopOpacity={isDark ? 0.6 : 0.4} />
            <stop offset="100%" stopColor={finalColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={finalColor}
          strokeWidth={1.8}
          fill={`url(#${id})`}
          dot={false}
          isAnimationActive
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
