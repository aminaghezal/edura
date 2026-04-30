"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const supabase = createClient();

  function handleLogout() {
    start(async () => {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={pending}
      className="w-full justify-start"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Déconnexion
    </Button>
  );
}
