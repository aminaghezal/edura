import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AttendanceClient } from "./attendance-client";

export default async function AttendancePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const classes = await prisma.class.findMany({
    where: { schoolId: session.schoolId },
    select: {
      id: true,
      name: true,
      students: {
        where: { isActive: true },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          attendance: {
            where: { date: today },
            select: { status: true },
          },
        },
        orderBy: { lastName: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return <AttendanceClient classes={classes} todayISO={today.toISOString()} />;
}
