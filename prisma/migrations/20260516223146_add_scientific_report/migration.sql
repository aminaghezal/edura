-- CreateEnum
CREATE TYPE "LearningStyle" AS ENUM ('VISUAL', 'AUDITORY', 'KINESTHETIC', 'READING_WRITING', 'MIXED');

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "hobbies" TEXT,
ADD COLUMN     "interests" TEXT,
ADD COLUMN     "iqScore" INTEGER,
ADD COLUMN     "iqTestDate" TIMESTAMP(3),
ADD COLUMN     "iqTestName" TEXT,
ADD COLUMN     "learningStyle" "LearningStyle";

-- CreateTable
CREATE TABLE "student_observations" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "subjectId" TEXT,
    "teacherId" TEXT NOT NULL,
    "observation" TEXT NOT NULL,
    "intelligenceTags" TEXT,
    "advice" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orientation_reports" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "generatedById" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "trimester" INTEGER,
    "year" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orientation_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_observations_studentId_idx" ON "student_observations"("studentId");

-- CreateIndex
CREATE INDEX "student_observations_schoolId_idx" ON "student_observations"("schoolId");

-- CreateIndex
CREATE INDEX "orientation_reports_studentId_idx" ON "orientation_reports"("studentId");

-- CreateIndex
CREATE INDEX "orientation_reports_schoolId_createdAt_idx" ON "orientation_reports"("schoolId", "createdAt");

-- AddForeignKey
ALTER TABLE "student_observations" ADD CONSTRAINT "student_observations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_observations" ADD CONSTRAINT "student_observations_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_observations" ADD CONSTRAINT "student_observations_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orientation_reports" ADD CONSTRAINT "orientation_reports_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orientation_reports" ADD CONSTRAINT "orientation_reports_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
