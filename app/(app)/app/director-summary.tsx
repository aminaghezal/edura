"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { regenerateSummary } from "./summary-action";

export function DirectorSummary({ initialSummary }: { initialSummary: string }) {
  const router = useRouter();
  const [summary, setSummary] = useState(initialSummary);
  const [pending, startTransition] = useTransition();

  function handleRefresh() {
    startTransition(async () => {
      const r = await regenerateSummary();
      if (r.ok && r.summary) {
        setSummary(r.summary);
        router.refresh();
      }
    });
  }

  return (
    <div>
      <p className="text-sm leading-relaxed">{summary}</p>
      <Button
        onClick={handleRefresh}
        disabled={pending}
        variant="ghost"
        size="sm"
        className="mt-2 -ml-2 h-7 text-xs text-muted-foreground"
      >
        <RefreshCw className={`w-3 h-3 mr-1 ${pending ? "animate-spin" : ""}`} />
        {pending ? "Régénération..." : "Régénérer"}
      </Button>
    </div>
  );
}
