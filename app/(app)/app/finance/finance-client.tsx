"use client";

import { useState, useTransition } from "react";
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

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Finance</h1>
        <p className="text-sm text-muted-foreground mt-1">Paiements et frais de scolarité</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Total dû</div>
            <div className="text-xl font-bold mt-1">{fmtDZD(totals.due)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Encaissé</div>
            <div className="text-xl font-bold mt-1 text-emerald-600">
              {fmtDZD(totals.paid)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Reste</div>
            <div className="text-xl font-bold mt-1 text-red-600">
              {fmtDZD(totals.due - totals.paid)}
            </div>
          </CardContent>
        </Card>
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
