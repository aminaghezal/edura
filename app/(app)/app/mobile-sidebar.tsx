"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { LogoutButton } from "./logout-button";
import type { Role } from "@prisma/client";

export function MobileSidebar({
  role,
  userName,
}: {
  role: Role;
  userName: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Hamburger button — visible only on mobile */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 w-9 h-9 rounded-md bg-background border shadow-sm grid place-items-center"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-64 bg-sidebar border-r z-50 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-primary-foreground text-sm font-extrabold">
              E
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight">EDURA</div>
              <div className="text-[10px] text-muted-foreground -mt-0.5 font-mono uppercase">
                {userName.split(" ")[0]}
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-md hover:bg-muted grid place-items-center"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <SidebarNav role={role} />

        <div className="p-3 border-t">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
