import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "./logout-button";
import { SidebarNav } from "./sidebar-nav";
import { TopBar } from "@/components/top-bar";

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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 grid place-items-center text-primary-foreground text-sm font-extrabold shadow-sm">
              E
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight">EDURA</div>
              <div className="text-[10px] text-muted-foreground -mt-0.5 font-mono uppercase tracking-wider">
                v1.0 · prod
              </div>
            </div>
          </div>
        </div>

        <SidebarNav role={session.role} />

        <div className="p-3 border-t">
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar userName={session.name} />
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  );
}
