"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowRight } from "lucide-react";
import { updateSchool } from "./actions";

type School = {
  id: string;
  name: string;
  wilaya: string;
  director: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  planStatus: string;
  trialEndsAt: Date | null;
};

export function SettingsClient({
  school,
  userRole,
}: {
  school: School;
  userRole: string;
}) {
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const isDirector = userRole === "DIRECTOR";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateSchool(fd);
      if (res.ok) setSaved(true);
    });
  }

  const trialDaysLeft = school.trialEndsAt
    ? Math.max(
        0,
        Math.ceil((school.trialEndsAt.getTime() - Date.now()) / 86400000),
      )
    : 0;

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configuration de votre établissement
        </p>
      </div>

      {/* Team link (Director only) */}
      {isDirector && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <Link
              href="/app/settings/team"
              className="flex items-center justify-between hover:bg-muted/30 -m-1 p-1 rounded transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-primary/10 text-primary grid place-items-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Équipe</div>
                  <div className="text-sm text-muted-foreground">
                    Inviter des professeurs et secrétaires
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Plan card */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                Abonnement
              </div>
              <div className="font-semibold mt-1 capitalize">
                {school.planStatus.toLowerCase()}
              </div>
              {school.planStatus === "TRIAL" && (
                <div className="text-sm text-muted-foreground mt-1">
                  {trialDaysLeft} jours restants
                </div>
              )}
            </div>
            <Badge variant={school.planStatus === "ACTIVE" ? "default" : "secondary"}>
              {school.planStatus}
            </Badge>
          </div>

          {/* Upgrade section (provisional, button not functional yet) */}
          {school.planStatus === "TRIAL" && isDirector && (
            <div className="mt-4 pt-4 border-t">
              <div className="rounded-lg bg-gradient-to-br from-indigo-50 via-purple-50/30 to-emerald-50/30 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-emerald-950/30 p-4 border border-indigo-200/50 dark:border-indigo-800/30">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h4 className="font-semibold text-sm">Passez à la version complète</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Débloquez l&apos;accès illimité à toutes les fonctionnalités EDURA.
                    </p>
                    <div className="text-2xl font-bold mt-2">
                      200 000 <span className="text-sm text-muted-foreground font-normal">DZD / an</span>
                    </div>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    onClick={() => alert("Module de paiement en cours d'intégration. Contactez-nous : contact@edura.dz")}
                  >
                    Upgrade
                  </Button>
                </div>

                <div className="mt-4 pt-3 border-t border-indigo-200/30 dark:border-indigo-800/30">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                    Modes de paiement acceptés
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <PaymentLogo label="CIB" colors="from-blue-600 to-blue-800" />
                    <PaymentLogo label="EDAHABIA" colors="from-amber-500 to-amber-700" />
                    <PaymentLogo label="CCP" colors="from-emerald-600 to-emerald-800" />
                    <PaymentLogo label="VIREMENT" colors="from-slate-600 to-slate-800" />
                    <PaymentLogo label="VISA" colors="from-indigo-600 to-indigo-900" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* School form */}
      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">Informations de l&apos;établissement</h2>
          {!isDirector && (
            <p className="text-sm text-amber-600 mb-4">
              Seul le directeur peut modifier ces informations.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset disabled={!isDirector || pending} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de l&apos;établissement</Label>
                <Input id="name" name="name" defaultValue={school.name} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="wilaya">Wilaya</Label>
                  <Input
                    id="wilaya"
                    name="wilaya"
                    defaultValue={school.wilaya}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="director">Directeur</Label>
                  <Input
                    id="director"
                    name="director"
                    defaultValue={school.director}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={school.address ?? ""}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={school.phone ?? ""}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={school.email ?? ""}
                  />
                </div>
              </div>

              {isDirector && (
                <div className="flex items-center justify-between pt-3 border-t">
                  {saved ? (
                    <span className="text-sm text-emerald-600 font-semibold">
                      ✓ Enregistré
                    </span>
                  ) : (
                    <span />
                  )}
                  <Button type="submit" disabled={pending}>
                    {pending ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </div>
              )}
            </fieldset>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentLogo({ label, colors }: { label: string; colors: string }) {
  return (
    <div
      className={`bg-gradient-to-r ${colors} text-white px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide shadow-sm`}
    >
      {label}
    </div>
  );
}
