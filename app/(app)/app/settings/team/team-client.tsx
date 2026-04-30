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
import { UserPlus, Copy, Check } from "lucide-react";
import { inviteTeammate, deactivateTeammate } from "./actions";

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
    startTransition(() => {
      deactivateTeammate(userId);
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
                      <div className="border rounded-md p-3 max-h-32 overflow-auto space-y-2">
                        {classes.length === 0 && (
                          <p className="text-xs text-muted-foreground">
                            Aucune classe.
                          </p>
                        )}
                        {classes.map((c) => (
                          <label
                            key={c.id}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <Checkbox
                              checked={selectedClasses.has(c.id)}
                              onCheckedChange={() => toggleClass(c.id)}
                            />
                            {c.name}
                          </label>
                        ))}
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
                      >
                        Désactiver
                      </Button>
                    )}
                    {!u.isActive && (
                      <Badge variant="outline">Inactif</Badge>
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
