import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scopeStudentsBy, getAccessibleClassIds } from "@/lib/rls";
import { StudentsClient } from "./students-client";

export default async function StudentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Role-aware: teachers see only their classes
  const studentWhere = await scopeStudentsBy(session);
  const classIds = await getAccessibleClassIds(session);

  const [students, classes] = await Promise.all([
    prisma.student.findMany({
      where: studentWhere,
      include: { class: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.class.findMany({
      where: { id: { in: classIds } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <StudentsClient students={students} classes={classes} />;
}
