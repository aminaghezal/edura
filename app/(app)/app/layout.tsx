import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "./logout-button";
import { SidebarNav } from "./sidebar-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-sidebar flex flex-col">
        <div className="px-5 py-5 border-b">
          <div className="text-xl font-extrabold tracking-tight text-primary">
            EDURA
          </div>
          <div className="text-xs text-muted-foreground mt-1 truncate">
            {session.name}
          </div>
          <div className="text-[10px] text-muted-foreground/70 mt-0.5 uppercase tracking-wide">
            {session.role}
          </div>
        </div>

        <SidebarNav role={session.role} />

        <div className="p-3 border-t">
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-background">{children}</main>
    </div>
  );
}
