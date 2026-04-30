"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      schoolName: formData.get("schoolName") as string,
      wilaya: formData.get("wilaya") as string,
      directorName: formData.get("directorName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // 1. Create auth user via Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. Create School + User in our DB via API route
    const res = await fetch("/api/auth/setup-school", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authId: authData.user!.id,
        schoolName: data.schoolName,
        wilaya: data.wilaya,
        directorName: data.directorName,
        email: data.email,
      }),
    });

    if (!res.ok) {
      setError("Erreur de création de l'école. Réessayez.");
      setLoading(false);
      return;
    }

    router.push("/app");
  }

  return (
    <div className="min-h-screen grid place-items-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Créer votre école sur EDURA</CardTitle>
          <CardDescription>
            30 jours d&apos;essai gratuit. Aucune carte bancaire requise.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="schoolName">Nom de l&apos;école</Label>
              <Input id="schoolName" name="schoolName" required />
            </div>
            <div>
              <Label htmlFor="wilaya">Wilaya</Label>
              <Input id="wilaya" name="wilaya" placeholder="Oran" required />
            </div>
            <div>
              <Label htmlFor="directorName">Votre nom (directeur)</Label>
              <Input id="directorName" name="directorName" required />
            </div>
            <div>
              <Label htmlFor="email">Email professionnel</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" name="password" type="password" minLength={12} required />
              <p className="text-xs text-muted-foreground mt-1">Minimum 12 caractères</p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Création..." : "Créer mon école"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
