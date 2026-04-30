import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TeamClient } from "./team-client";

export default async function TeamPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "DIRECTOR") redirect("/app");

  const [users, classes, subjects] = await Promise.all([
    prisma.user.findMany({
      where: { schoolId: session.schoolId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        taughtClasses: {
          select: {
            class: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.class.findMany({
      where: { schoolId: session.schoolId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.subject.findMany({
      where: { schoolId: session.schoolId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <TeamClient users={users} classes={classes} subjects={subjects} />;
}
