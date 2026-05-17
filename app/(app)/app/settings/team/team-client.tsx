"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Copy, Check, UserX, UserCheck } from "lucide-react";
import { inviteTeammate, deactivateTeammate, reactivateTeammate } from "./actions";

type TeamUser = {
  id: string;
  email: string;
  name: string;
  role: "DIRECTOR" | "SECRETARY" | "TEACHER";
  isActive: boolean;
  taughtClasses: {
    class: { id: string; name: string };
    subject: { id: string; name: string };
  }[];
};

const roleLabel: Record<string, string> = {
  DIRECTOR: "Directeur",
  SECRETARY: "Secrétaire",
  TEACHER: "Professeur",
};

// Group Algerian BAC classes by level + cycle (filière)
function groupClasses(
  classes: { id: string; name: string }[],
): Record<string, Record<string, { id: string; name: string }[]>> {
  const groups: Record<string, Record<string, { id: string; name: string }[]>> = {};

  for (const c of classes) {
    const nameLower = c.name.toLowerCase();

    // Detect level
    let level = "Autre";
    if (/1[èe]re|1ere|1ère AS|1as/.test(nameLower)) level = "1ère AS";
    else if (/2[èe]me|2eme|2ème AS|2as/.test(nameLower)) level = "2ème AS";
    else if (/3[èe]me|3eme|3ème AS|3as/.test(nameLower)) level = "3ème AS";

    // Detect cycle (filière)
    let cycle = "Tronc commun";
    if (/sciences?\s*exp|sc\.\s*exp|sc-exp|s\.exp/i.test(nameLower)) cycle = "Sciences expérimentales";
    else if (/lettres?\s*phil|philo/i.test(nameLower)) cycle = "Lettres & Philosophie";
    else if (/lettres?/i.test(nameLower)) cycle = "Lettres";
    else if (/langues?/i.test(nameLower)) cycle = "Langues étrangères";
    else if (/math[-\s]?tech|m[-\s]?t|technique/i.test(nameLower)) cycle = "Math-Technique";
    else if (/math[ée]?l[ée]?me|math[éee]matique|^math|\bmath\b/i.test(nameLower)) cycle = "Mathématiques";
    else if (/gestion|[ée]conomie/i.test(nameLower)) cycle = "Gestion & Économie";
    else if (/sciences?/i.test(nameLower)) cycle = "Sciences expérimentales";

    if (!groups[level]) groups[level] = {};
    if (!groups[level][cycle]) groups[level][cycle] = [];
    groups[level][cycle].push(c);
  }

  // Sort levels in the right order
  const order = ["1ère AS", "2ème AS", "3ème AS", "Autre"];
  return Object.fromEntries(
    order
      .filter((l) => groups[l])
      .map((l) => [l, groups[l]]),
  );
}

export function TeamClient({
  users,
  classes,
  subjects,
}: {
  users: TeamUser[];
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<"DIRECTOR" | "SECRETARY" | "TEACHER">(
    "TEACHER",
  );
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("role", role);
    fd.set("classIds", Array.from(selectedClasses).join(","));
    fd.set("subjectIds", Array.from(selectedSubjects).join(","));

    startTransition(async () => {
      const r = await inviteTeammate(fd);
      if (r.ok) {
        setCredentials({ email: r.email, password: r.tempPassword });
        (e.target as HTMLFormElement).reset();
        setSelectedClasses(new Set());
        setSelectedSubjects(new Set());
        setRole("TEACHER");
      } else {
        setError(r.error);
      }
    });
  }

  function toggleClass(id: string) {
    setSelectedClasses((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function toggleSubject(id: string) {
    setSelectedSubjects((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function copyCredentials() {
    if (!credentials) return;
    const text = `EDURA — Identifiants\nEmail : ${credentials.email}\nMot de passe : ${credentials.password}\n\nConnexion : ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function closeDialog() {
    setOpen(false);
    setCredentials(null);
    setError(null);
    setCopied(false);
  }

  function handleDeactivate(userId: string) {
    if (!confirm("Désactiver cet utilisateur ?")) return;
    startTransition(async () => {
      await deactivateTeammate(userId);
    });
  }

  function handleReactivate(userId: string) {
    if (!confirm("Réactiver cet utilisateur ?")) return;
    startTransition(async () => {
      await reactivateTeammate(userId);
    });
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Équipe</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Inviter des professeurs et secrétaires
          </p>
        </div>

        <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : closeDialog())}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Inviter un membre
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {credentials ? "Invitation créée" : "Inviter un membre"}
              </DialogTitle>
            </DialogHeader>

            {credentials ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Compte créé. Transmettez ces identifiants à la personne par
                  un canal sécurisé (WhatsApp privé, en main propre). Le mot
                  de passe ne sera plus affiché.
                </p>

                <div className="rounded-md border p-4 bg-muted/30 font-mono text-sm space-y-1">
                  <div>
                    <span className="text-muted-foreground">Email :</span>{" "}
                    {credentials.email}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mot de passe :</span>{" "}
                    <span className="font-bold">{credentials.password}</span>
                  </div>
                </div>

                <Button onClick={copyCredentials} variant="outline" className="w-full">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copié
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copier les identifiants
                    </>
                  )}
                </Button>

                <DialogFooter>
                  <Button onClick={closeDialog}>Fermer</Button>
                </DialogFooter>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input id="name" name="name" required />
                </div>

                <div>
                  <Label>Rôle</Label>
                  <div className="flex gap-2 mt-2">
                    {(["TEACHER", "SECRETARY", "DIRECTOR"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${
                          role === r
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-input hover:bg-muted"
                        }`}
                      >
                        {roleLabel[r]}
                      </button>
                    ))}
                  </div>
                </div>

                {role === "TEACHER" && (
                  <>
                    <div>
                      <Label className="mb-2 block">Classes assignées</Label>
                      <div className="border rounded-md p-3 max-h-48 overflow-auto space-y-3">
                        {classes.length === 0 && (
                          <p className="text-xs text-muted-foreground">
                            Aucune classe.
                          </p>
                        )}
                        {Object.entries(groupClasses(classes)).map(
                          ([levelLabel, cycles]) => (
                            <div key={levelLabel}>
                              <div className="text-[10px] uppercase tracking-wider font-bold text-primary mb-1">
                                {levelLabel}
                              </div>
                              {Object.entries(cycles).map(([cycleLabel, items]) => (
                                <div key={cycleLabel} className="ml-2 mb-1.5">
                                  <div className="text-[10px] uppercase text-muted-foreground mb-0.5">
                                    {cycleLabel}
                                  </div>
                                  {items.map((c) => (
                                    <label
                                      key={c.id}
                                      className="flex items-center gap-2 text-sm cursor-pointer pl-2 py-0.5"
                                    >
                                      <Checkbox
                                        checked={selectedClasses.has(c.id)}
                                        onCheckedChange={() => toggleClass(c.id)}
                                      />
                                      {c.name}
                                    </label>
                                  ))}
                                </div>
                              ))}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">Matières enseignées</Label>
                      <div className="border rounded-md p-3 max-h-32 overflow-auto space-y-2">
                        {subjects.length === 0 && (
                          <p className="text-xs text-muted-foreground">
                            Aucune matière.
                          </p>
                        )}
                        {subjects.map((s) => (
                          <label
                            key={s.id}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <Checkbox
                              checked={selectedSubjects.has(s.id)}
                              onCheckedChange={() => toggleSubject(s.id)}
                            />
                            {s.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {error && <p className="text-sm text-destructive">{error}</p>}

                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={closeDialog}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={pending}>
                    {pending ? "Création..." : "Créer le compte"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-semibold">Nom</th>
                <th className="text-left p-3 font-semibold">Email</th>
                <th className="text-left p-3 font-semibold">Rôle</th>
                <th className="text-left p-3 font-semibold">Classes</th>
                <th className="text-right p-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={`border-b ${!u.isActive ? "opacity-50" : ""}`}>
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3">
                    <Badge variant={u.role === "DIRECTOR" ? "default" : "secondary"}>
                      {roleLabel[u.role]}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">
                    {u.role === "TEACHER"
                      ? Array.from(
                          new Set(u.taughtClasses.map((a) => a.class.name)),
                        ).join(", ") || "—"
                      : "—"}
                  </td>
                  <td className="p-3 text-right">
                    {u.role !== "DIRECTOR" && u.isActive && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeactivate(u.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Désactiver
                      </Button>
                    )}
                    {u.role !== "DIRECTOR" && !u.isActive && (
                      <div className="flex items-center justify-end gap-2">
                        <Badge variant="outline" className="text-muted-foreground">
                          Inactif
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReactivate(u.id)}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Activer
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
