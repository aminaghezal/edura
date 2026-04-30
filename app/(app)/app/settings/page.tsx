import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const school = await prisma.school.findUnique({
    where: { id: session.schoolId },
    select: {
      id: true,
      name: true,
      wilaya: true,
      director: true,
      address: true,
      phone: true,
      email: true,
      planStatus: true,
      trialEndsAt: true,
    },
  });

  if (!school) redirect("/login");

  return <SettingsClient school={school} userRole={session.role} />;
}
