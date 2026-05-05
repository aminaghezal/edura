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

export function VerticalBarChart({
  data,
  height = 240,
  color = "#4f46e5",
  unit = "",
}: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  color?: string;
  unit?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="label"
          stroke="#94a3b8"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#94a3b8"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            fontSize: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
          formatter={(v) => [`${v}${unit}`, ""]}
          cursor={{ fill: "rgba(79, 70, 229, 0.06)" }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={800}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color ?? color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
