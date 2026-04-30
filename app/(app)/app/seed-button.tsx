"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SeedButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSeed() {
    setPending(true);
    setResult(null);
    try {
      const res = await fetch("/api/dev/seed", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setResult(
          `✓ ${data.summary.students} élèves, ${data.summary.classes} classes, ${data.summary.grades} notes, ${data.summary.attendance} présences, ${data.summary.payments} paiements créés.`,
        );
        router.refresh();
      } else {
        setResult(`Erreur: ${data.error}`);
      }
    } catch {
      setResult("Erreur réseau");
    }
    setPending(false);
  }

  return (
    <div className="space-y-3">
      <Button onClick={handleSeed} disabled={pending}>
        {pending ? "Génération en cours..." : "Générer les données de démo"}
      </Button>
      {result && <p className="text-sm">{result}</p>}
    </div>
  );
}
