/**
 * EDURA — Application-level row scoping (Phase 8)
 *
 * Postgres RLS catches us at the DB layer (last line of defense).
 * This module enforces the SAME rules at the Prisma layer so:
 *   1. Queries return the right data (RLS errors would be opaque)
 *   2. We never accidentally exfiltrate data via a missing where clause
 *
 * Rules:
 *   - DIRECTOR  → everything in the school
 *   - SECRETARY → everything in the school (admin role)
 *   - TEACHER   → only their assigned classes' students
 */

import { prisma } from "./prisma";
import type { Session } from "./auth";

/**
 * Returns the list of class IDs this user can access.
 * - DIRECTOR / SECRETARY → all classes in the school
 * - TEACHER → only classes they're assigned to
 */
export async function getAccessibleClassIds(
  session: Session,
): Promise<string[]> {
  if (session.role === "DIRECTOR" || session.role === "SECRETARY") {
    const classes = await prisma.class.findMany({
      where: { schoolId: session.schoolId },
      select: { id: true },
    });
    return classes.map((c) => c.id);
  }

  // TEACHER
  const assignments = await prisma.teacherAssignment.findMany({
    where: { teacherId: session.userId },
    select: { classId: true },
  });
  return assignments.map((a) => a.classId);
}

/**
 * Convenience: a Prisma `where` clause that scopes Students by role.
 *
 * Usage:
 *   const students = await prisma.student.findMany({
 *     where: await scopeStudentsBy(session),
 *   });
 */
export async function scopeStudentsBy(session: Session) {
  const baseWhere = { schoolId: session.schoolId, isActive: true };

  if (session.role === "DIRECTOR" || session.role === "SECRETARY") {
    return baseWhere;
  }

  // Teachers only see students in their assigned classes
  const classIds = await getAccessibleClassIds(session);
  return {
    ...baseWhere,
    classId: { in: classIds },
  };
}
