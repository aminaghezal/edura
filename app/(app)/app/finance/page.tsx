import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FinanceClient } from "./finance-client";

export default async function FinancePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const payments = await prisma.payment.findMany({
    where: { schoolId: session.schoolId },
    select: {
      id: true,
      trimester: true,
      year: true,
      amountDue: true,
      amountPaid: true,
      status: true,
      method: true,
      paidAt: true,
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          class: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <FinanceClient payments={payments} />;
}
