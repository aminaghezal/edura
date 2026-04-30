"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  CalendarCheck,
  Calendar,
  Banknote,
  Brain,
  Settings,
} from "lucide-react";
import type { Role } from "@prisma/client";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: Role[]; // if undefined, visible to all
};

const NAV: NavItem[] = [
  { href: "/app", label: "Tableau de bord", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/app/students", label: "Élèves", icon: <Users className="w-4 h-4" /> },
  { href: "/app/grades", label: "Notes", icon: <GraduationCap className="w-4 h-4" /> },
  { href: "/app/bulletins", label: "Bulletins", icon: <FileText className="w-4 h-4" /> },
  { href: "/app/attendance", label: "Présences", icon: <CalendarCheck className="w-4 h-4" /> },
  { href: "/app/schedule", label: "Emploi du temps", icon: <Calendar className="w-4 h-4" /> },
  {
    href: "/app/finance",
    label: "Finance",
    icon: <Banknote className="w-4 h-4" />,
    roles: ["DIRECTOR", "SECRETARY"],
  },
  { href: "/app/insights", label: "Analyses IA", icon: <Brain className="w-4 h-4" /> },
  {
    href: "/app/settings",
    label: "Paramètres",
    icon: <Settings className="w-4 h-4" />,
    roles: ["DIRECTOR"],
  },
];

export function SidebarNav({ role }: { role: Role }) {
  const pathname = usePathname();

  const visible = NAV.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <nav className="flex-1 px-3 py-3 space-y-0.5">
      {visible.map((item) => {
        const isActive =
          item.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
