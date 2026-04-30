"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { recomputeNow } from "./actions";

export function RecomputeButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function handleClick() {
    setResult(null);
    startTransition(async () => {
      const r = await recomputeNow();
      if (r.ok) {
        setResult(
          `✓ ${r.studentsProcessed} élèves analysés en ${(r.durationMs / 1000).toFixed(1)}s — ${r.highRisk} risque élevé, ${r.moderate} modéré, ${r.low} faible.`,
        );
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={handleClick} disabled={pending} variant="outline" size="sm">
        <RefreshCw className={`w-4 h-4 mr-2 ${pending ? "animate-spin" : ""}`} />
        {pending ? "Calcul en cours..." : "Recalculer maintenant"}
      </Button>
      {result && <span className="text-xs text-muted-foreground">{result}</span>}
    </div>
  );
}
