"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, X, FileText, MessageSquare, Upload, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createStudent } from "./actions";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  firstNameAr: string | null;
  lastNameAr: string | null;
  parentName: string | null;
  parentPhone: string | null;
  riskLevel: "LOW" | "MODERATE" | "HIGH" | null;
  class: { name: string } | null;
};

const riskLabel: Record<string, { fr: string; variant: "default" | "secondary" | "destructive" }> = {
  LOW: { fr: "Faible", variant: "secondary" },
  MODERATE: { fr: "Modéré", variant: "default" },
  HIGH: { fr: "Élevé", variant: "destructive" },
};

export function StudentsClient({
  students,
  classes,
}: {
  students: Student[];
  classes: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    created: number;
    skipped: number;
    classesCreated: number;
    errors: { row: number; message: string }[];
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  async function handleImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!fileRef.current?.files?.[0]) return;
    setImporting(true);
    setImportResult(null);
    setImportError(null);

    const fd = new FormData();
    fd.set("file", fileRef.current.files[0]);

    try {
      const res = await fetch("/api/students/import", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error ?? "Erreur d'importation");
      } else {
        setImportResult(data);
        router.refresh();
      }
    } catch {
      setImportError("Erreur réseau");
    }
    setImporting(false);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter((s) => {
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const fullNameAr = `${s.firstNameAr ?? ""} ${s.lastNameAr ?? ""}`;
      const matchesQ = fullName.includes(q) || fullNameAr.includes(search);
      const matchesRisk = riskFilter === "all" || s.riskLevel === riskFilter;
      return matchesQ && matchesRisk;
    });
  }, [students, search, riskFilter]);

  const selected = selectedId ? students.find((s) => s.id === selectedId) ?? null : null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createStudent(formData);
      if (res.ok) {
        setDialogOpen(false);
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <div className="flex gap-6 h-full p-8">
      {/* Main list */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-end justify-between mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
              Gestion académique
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Élèves</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {students.length} élève{students.length !== 1 ? "s" : ""} inscrit{students.length !== 1 ? "s" : ""} — année 2025/2026
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Importer Excel
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un élève
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvel élève</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input id="firstName" name="firstName" required />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" name="lastName" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstNameAr">الاسم (اختياري)</Label>
                    <Input id="firstNameAr" name="firstNameAr" dir="rtl" />
                  </div>
                  <div>
                    <Label htmlFor="lastNameAr">اللقب (اختياري)</Label>
                    <Input id="lastNameAr" name="lastNameAr" dir="rtl" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="classId">Classe</Label>
                  <select
                    id="classId"
                    name="classId"
                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">— Aucune —</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="parentName">Nom du parent</Label>
                  <Input id="parentName" name="parentName" />
                </div>
                <div>
                  <Label htmlFor="parentPhone">Téléphone du parent</Label>
                  <Input id="parentPhone" name="parentPhone" placeholder="0550 12 34 56" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={pending}>
                    {pending ? "Enregistrement..." : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Excel import dialog */}
          <Dialog open={importOpen} onOpenChange={(o) => {
            setImportOpen(o);
            if (!o) {
              setImportResult(null);
              setImportError(null);
            }
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importer des élèves depuis Excel</DialogTitle>
              </DialogHeader>

              {!importResult && (
                <form onSubmit={handleImport} className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Téléchargez le modèle, remplissez-le, puis ré-importez-le.
                    Colonnes obligatoires : <strong>Prénom</strong> et <strong>Nom</strong>.
                  </div>

                  <a
                    href="/api/students/import/template"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger le modèle Excel
                  </a>

                  <div>
                    <Label htmlFor="file">Fichier Excel (.xlsx, max 5 MB)</Label>
                    <Input
                      ref={fileRef}
                      id="file"
                      type="file"
                      accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      required
                    />
                  </div>

                  {importError && (
                    <p className="text-sm text-destructive">{importError}</p>
                  )}

                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setImportOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={importing}>
                      {importing ? "Importation..." : "Importer"}
                    </Button>
                  </DialogFooter>
                </form>
              )}

              {importResult && (
                <div className="space-y-3">
                  <div className="rounded-md border p-4 space-y-1">
                    <div className="text-sm">
                      <span className="font-semibold text-emerald-600">
                        {importResult.created}
                      </span>{" "}
                      élèves créés
                    </div>
                    {importResult.classesCreated > 0 && (
                      <div className="text-sm">
                        <span className="font-semibold">{importResult.classesCreated}</span>{" "}
                        nouvelle(s) classe(s) créée(s) automatiquement
                      </div>
                    )}
                    {importResult.skipped > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {importResult.skipped} ligne(s) vide(s) ignorée(s)
                      </div>
                    )}
                    {importResult.errors.length > 0 && (
                      <div className="text-sm text-destructive">
                        {importResult.errors.length} erreur(s)
                      </div>
                    )}
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="max-h-48 overflow-auto border rounded-md p-3 text-xs space-y-1">
                      {importResult.errors.slice(0, 30).map((er, i) => (
                        <div key={i}>
                          <span className="font-semibold">Ligne {er.row}:</span>{" "}
                          {er.message}
                        </div>
                      ))}
                      {importResult.errors.length > 30 && (
                        <div className="text-muted-foreground">
                          … et {importResult.errors.length - 30} autres
                        </div>
                      )}
                    </div>
                  )}

                  <DialogFooter>
                    <Button onClick={() => setImportOpen(false)}>Fermer</Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un élève…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les risques</SelectItem>
              <SelectItem value="LOW">Risque faible</SelectItem>
              <SelectItem value="MODERATE">Risque modéré</SelectItem>
              <SelectItem value="HIGH">Risque élevé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-0 overflow-auto max-h-[calc(100vh-280px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Risque</TableHead>
                  <TableHead>Parent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => {
                  const risk = s.riskLevel ? riskLabel[s.riskLevel] : null;
                  return (
                    <TableRow
                      key={s.id}
                      onClick={() => setSelectedId(s.id === selectedId ? null : s.id)}
                      className={`cursor-pointer ${s.id === selectedId ? "bg-muted" : ""}`}
                    >
                      <TableCell className="font-semibold">
                        {s.firstName} {s.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.class?.name ?? "—"}
                      </TableCell>
                      <TableCell>
                        {risk ? <Badge variant={risk.variant}>{risk.fr}</Badge> : <span className="text-muted-foreground text-xs">—</span>}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.parentName ?? "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filtered.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                {students.length === 0
                  ? "Aucun élève. Cliquez sur \"Ajouter un élève\" pour commencer."
                  : "Aucun résultat."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-80 flex-shrink-0">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg grid place-items-center mb-3">
                    {selected.firstName[0]}
                  </div>
                  <div className="font-bold text-base">
                    {selected.firstName} {selected.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selected.class?.name ?? "Sans classe"}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <Row label="Risque" value={selected.riskLevel ? riskLabel[selected.riskLevel].fr : "—"} />
                <Row label="Parent" value={selected.parentName ?? "—"} />
                <Row label="Téléphone" value={selected.parentPhone ?? "—"} />
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="secondary" size="sm" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" /> Bulletin
                </Button>
                <Button variant="secondary" size="sm" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-2" /> Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
