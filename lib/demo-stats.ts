/**
 * Demo statistics generator — produces realistic-looking time-series
 * data for charts when real data is sparse (early-stage MVP).
 *
 * Deterministic per-school (uses schoolId as seed) so charts are
 * stable across page refreshes.
 */

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** 12-month enrollment trend with steady growth + noise */
export function enrollmentTrend(schoolId: string, currentTotal: number) {
  const rng = seededRandom(hashSeed(schoolId));
  const months = ["Sep", "Oct", "Nov", "Déc", "Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août"];
  const out: { label: string; value: number }[] = [];

  // Reverse: walk back from current to compute starting point
  const baseStart = Math.max(10, Math.round(currentTotal * 0.6));
  for (let i = 0; i < 12; i++) {
    const progress = i / 11;
    const noise = (rng() - 0.5) * 4;
    const value = Math.round(baseStart + (currentTotal - baseStart) * progress + noise);
    out.push({ label: months[i], value: Math.max(0, value) });
  }
  return out;
}

/** 7-day attendance rate */
export function attendanceTrend(schoolId: string) {
  const rng = seededRandom(hashSeed(schoolId) + 1);
  const days = ["Dim", "Lun", "Mar", "Mer", "Jeu"];
  return days.map((label) => ({
    label,
    value: Math.round(88 + rng() * 9), // 88-97%
  }));
}

/** 6-month revenue trend */
export function revenueTrend(schoolId: string, totalRevenue: number) {
  const rng = seededRandom(hashSeed(schoolId) + 2);
  const months = ["Nov", "Déc", "Jan", "Fév", "Mar", "Avr"];
  const monthly = totalRevenue / 6;
  return months.map((label) => ({
    label,
    value: Math.round(monthly * (0.85 + rng() * 0.3)),
  }));
}

/** Sparkline data — 12 points, generally upward */
export function sparklineUp(schoolId: string, salt = 0): number[] {
  const rng = seededRandom(hashSeed(schoolId) + salt);
  const out: number[] = [];
  let v = 50 + rng() * 20;
  for (let i = 0; i < 12; i++) {
    v += (rng() - 0.3) * 8; // slight upward bias
    out.push(Math.max(20, Math.min(100, v)));
  }
  return out;
}

/** Sparkline — generally flat */
export function sparklineFlat(schoolId: string, salt = 0): number[] {
  const rng = seededRandom(hashSeed(schoolId) + salt);
  const out: number[] = [];
  let v = 60;
  for (let i = 0; i < 12; i++) {
    v += (rng() - 0.5) * 6;
    out.push(Math.max(40, Math.min(80, v)));
  }
  return out;
}

/** Random-looking but seeded delta % for "vs last month" */
export function fakeDelta(schoolId: string, salt = 0, range = 15): number {
  const rng = seededRandom(hashSeed(schoolId) + salt);
  return Math.round((rng() * 2 - 0.5) * range * 10) / 10;
}

/** Class performance comparison — returns class names with averages */
export function classPerformance(
  classes: { name: string; students: { grades: { value: number }[] }[] }[],
) {
  const palette = ["#4f46e5", "#059669", "#d97706", "#dc2626", "#0891b2", "#7c3aed"];
  return classes
    .map((c, i) => {
      const allGrades = c.students.flatMap((s) => s.grades.map((g) => g.value));
      const avg = allGrades.length
        ? allGrades.reduce((a, b) => a + b, 0) / allGrades.length
        : 0;
      return {
        label: c.name.replace(/Sciences|Lettres/g, "").trim(),
        value: Number(avg.toFixed(1)),
        color: palette[i % palette.length],
      };
    })
    .sort((a, b) => b.value - a.value);
}
