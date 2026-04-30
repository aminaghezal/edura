"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

const recordPaymentSchema = z.object({
  paymentId: z.string(),
  amountPaid: z.coerce.number().int().min(0),
  method: z.string().optional().nullable(),
});

export async function recordPayment(formData: FormData) {
  const session = await requireSession();
  const parsed = recordPaymentSchema.safeParse({
    paymentId: formData.get("paymentId"),
    amountPaid: formData.get("amountPaid"),
    method: formData.get("method") || null,
  });
  if (!parsed.success) return { ok: false as const, error: "Invalide" };

  // Verify payment belongs to this school
  const payment = await prisma.payment.findFirst({
    where: { id: parsed.data.paymentId, schoolId: session.schoolId },
  });
  if (!payment) return { ok: false as const, error: "Paiement introuvable" };

  const isPaid = parsed.data.amountPaid >= payment.amountDue;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      amountPaid: parsed.data.amountPaid,
      method: parsed.data.method,
      status: isPaid ? "PAID" : parsed.data.amountPaid > 0 ? "PARTIAL" : "PENDING",
      paidAt: isPaid ? new Date() : null,
    },
  });

  revalidatePath("/app/finance");
  return { ok: true as const };
}
