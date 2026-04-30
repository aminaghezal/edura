import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ScheduleClient } from "./schedule-client";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const sp = await searchParams;

  const classes = await prisma.class.findMany({
    where: { schoolId: session.schoolId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const selectedId = sp.class ?? classes[0]?.id ?? null;

  const schedules = selectedId
    ? await prisma.schedule.findMany({
        where: {
          classId: selectedId,
          class: { schoolId: session.schoolId },
        },
        select: {
          id: true,
          dayOfWeek: true,
          startTime: true,
          endTime: true,
          room: true,
          subject: { select: { name: true } },
        },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      })
    : [];

  return (
    <ScheduleClient
      classes={classes}
      selectedId={selectedId}
      schedules={schedules}
    />
  );
}
