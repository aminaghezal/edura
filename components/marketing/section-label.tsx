export function SectionLabel({
  children,
  pulse = false,
  variant = "light",
}: {
  children: React.ReactNode;
  pulse?: boolean;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";
  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full border px-5 py-2 ${
        isDark
          ? "border-white/20 bg-white/5"
          : "border-[#0052ff]/30 bg-[#0052ff]/5"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isDark ? "bg-[#4d7cff]" : "bg-[#0052ff]"
        } ${pulse ? "anim-pulse-dot" : ""}`}
      />
      <span
        className={`font-mono text-[11px] uppercase tracking-[0.15em] font-medium ${
          isDark ? "text-[#4d7cff]" : "text-[#0052ff]"
        }`}
      >
        {children}
      </span>
    </div>
  );
}
