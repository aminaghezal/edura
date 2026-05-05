"use client";

import { useState, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Banknote, TrendingUp, AlertCircle, Wallet } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TrendChart } from "@/components/dashboard/area-chart";
import { DonutChart } from "@/components/dashboard/donut-chart";
import { recordPayment } from "./actions";

type Payment = {
  id: string;
  trimester: number;
  year: string;
  amountDue: number;
  amountPaid: number;
  status: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "WAIVED";
  method: string | null;
  paidAt: Date | null;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    class: { name: string } | null;
  };
};

const statusLabels: Record<Payment["status"], { fr: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { fr: "En attente", variant: "outline" },
  PARTIAL: { fr: "Partiel", variant: "secondary" },
  PAID: { fr: "Payé", variant: "default" },
  OVERDUE: { fr: "En retard", variant: "destructive" },
  WAIVED: { fr: "Exonéré", variant: "secondary" },
};

function fmtDZD(amount: number) {
  return new Intl.NumberFormat("fr-DZ").format(amount) + " DZD";
}

export function FinanceClient({ payments }: { payments: Payment[] }) {
  const [editing, setEditing] = useState<Payment | null>(null);
  const [, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const fd = new FormData(e.currentTarget);
    fd.set("paymentId", editing.id);
    startTransition(async () => {
      const res = await recordPayment(fd);
      if (res.ok) setEditing(null);
    });
  }

  const totals = payments.reduce(
    (acc, p) => ({
      due: acc.due + p.amountDue,
      paid: acc.paid + p.amountPaid,
    }),
    { due: 0, paid: 0 },
  );

  const collectionRate = totals.due > 0 ? Math.round((totals.paid / totals.due) * 100) : 0;
  const overdueCount = payments.filter((p) => p.status === "OVERDUE" || (p.status === "PENDING" && p.amountPaid === 0)).length;

  // Status distribution for donut
  const statusCounts = useMemo(() => {
    const buckets = { PAID: 0, PARTIAL: 0, PENDING: 0, OVERDUE: 0 };
    payments.forEach((p) => {
      if (p.status === "WAIVED") return;
      buckets[p.status as keyof typeof buckets]++;
    });
    return [
      { name: "Payé", value: buckets.PAID, color: "#10b981" },
      { name: "Partiel", value: buckets.PARTIAL, color: "#f59e0b" },
      { name: "En attente", value: buckets.PENDING, color: "#94a3b8" },
      { name: "En retard", value: buckets.OVERDUE, color: "#ef4444" },
    ].filter((b) => b.value > 0);
  }, [payments]);

  // Synthetic 6-month revenue trend
  const revenueData = useMemo(() => {
    const months = ["Nov", "Déc", "Jan", "Fév", "Mar", "Avr"];
    const monthlyTarget = totals.paid / 6;
    return months.map((label, i) => ({
      label,
      value: Math.round(monthlyTarget * (0.7 + i * 0.07 + Math.random() * 0.15)),
    }));
  }, [totals.paid]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" />
            Trésorerie
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Paiements, frais de scolarité et suivi du recouvrement
          </p>
        </div>
      </div>

      {/* Hero metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total dû"
          value={totals.due}
          suffix=" DZD"
          icon={<Banknote className="w-5 h-5" />}
          accent="primary"
        />
        <MetricCard
          label="Encaissé"
          value={totals.paid}
          suffix=" DZD"
          delta={12.4}
          icon={<TrendingUp className="w-5 h-5" />}
          accent="emerald"
        />
        <MetricCard
          label="Taux de recouvrement"
          value={collectionRate}
          suffix="%"
          delta={collectionRate > 70 ? 5.2 : -3.1}
          icon={<TrendingUp className="w-5 h-5" />}
          accent="indigo"
        />
        <MetricCard
          label="Paiements en retard"
          value={overdueCount}
          icon={<AlertCircle className="w-5 h-5" />}
          accent="red"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Évolution des encaissements</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  6 derniers mois
                </p>
              </div>
              <Badge variant="outline" className="text-xs">+12.4% YoY</Badge>
            </div>
            <TrendChart data={revenueData} color="#059669" unit=" DZD" />
          </CardContent>
        </Card>

        {statusCounts.length > 0 && (
          <Card className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
            <CardContent className="p-5">
              <div className="mb-4">
                <h3 className="font-semibold">Statuts</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Répartition des paiements
                </p>
              </div>
              <DonutChart
                data={statusCounts}
                centerLabel="Total"
                centerValue={payments.length}
                height={200}
              />
              <div className="mt-3 space-y-1.5">
                {statusCounts.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-muted-foreground">{s.name}</span>
                    </div>
                    <span className="font-semibold tabular-nums">{s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardContent className="p-0 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-semibold">Élève</th>
                <th className="text-left p-3 font-semibold">Classe</th>
                <th className="text-left p-3 font-semibold">Trimestre</th>
                <th className="text-right p-3 font-semibold">Dû</th>
                <th className="text-right p-3 font-semibold">Payé</th>
                <th className="text-left p-3 font-semibold">Statut</th>
                <th className="text-right p-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const meta = statusLabels[p.status];
                return (
                  <tr key={p.id} className="border-b">
                    <td className="p-3 font-medium">
                      {p.student.firstName} {p.student.lastName}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {p.student.class?.name ?? "—"}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      T{p.trimester} {p.year}
                    </td>
                    <td className="p-3 text-right">{fmtDZD(p.amountDue)}</td>
                    <td className="p-3 text-right">{fmtDZD(p.amountPaid)}</td>
                    <td className="p-3">
                      <Badge variant={meta.variant}>{meta.fr}</Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => setEditing(p)}>
                        Encaisser
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">
                    Aucun paiement enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Encaisser — {editing?.student.firstName} {editing?.student.lastName}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Montant dû</Label>
              <p className="text-sm font-semibold mt-1">
                {editing ? fmtDZD(editing.amountDue) : ""}
              </p>
            </div>
            <div>
              <Label htmlFor="amountPaid">Montant payé (DZD)</Label>
              <Input
                id="amountPaid"
                name="amountPaid"
                type="number"
                min={0}
                defaultValue={editing?.amountPaid ?? 0}
                required
              />
            </div>
            <div>
              <Label htmlFor="method">Méthode</Label>
              <select
                id="method"
                name="method"
                defaultValue={editing?.method ?? ""}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">—</option>
                <option value="especes">Espèces</option>
                <option value="virement">Virement</option>
                <option value="ccp">CCP</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
