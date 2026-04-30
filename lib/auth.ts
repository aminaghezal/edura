import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export type Session = {
  authId: string;
  userId: string;
  schoolId: string;
  email: string;
  role: Role;
  name: string;
};

export async function getSession(): Promise<Session | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
    select: { id: true, schoolId: true, email: true, role: true, name: true, isActive: true },
  });

  if (!dbUser || !dbUser.isActive) return null;

  return {
    authId: user.id,
    userId: dbUser.id,
    schoolId: dbUser.schoolId,
    email: dbUser.email,
    role: dbUser.role,
    name: dbUser.name,
  };
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new Response("Unauthorized", { status: 401 });
  return session;
}

export function requireRole(session: Session, ...allowed: Role[]) {
  if (!allowed.includes(session.role)) {
    throw new Response("Forbidden", { status: 403 });
  }
}
