import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

// One-click seed for development. Requires auth — seeds the LOGGED-IN user's school only.
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Seeding is disabled in production" }, { status: 403 });
  }

  const session = await requireSession();
  const schoolId = session.schoolId;

  // Fetch / create academic year
  const year = await prisma.academicYear.findFirst({
    where: { schoolId, isCurrent: true },
  });
  if (!year) {
    return NextResponse.json({ error: "Academic year missing" }, { status: 500 });
  }

  // Wipe existing seed data (idempotent re-runs)
  await prisma.payment.deleteMany({ where: { schoolId } });
  await prisma.attendance.deleteMany({
    where: { student: { schoolId } },
  });
  await prisma.grade.deleteMany({
    where: { student: { schoolId } },
  });
  await prisma.schedule.deleteMany({
    where: { class: { schoolId } },
  });
  await prisma.classSubject.deleteMany({
    where: { class: { schoolId } },
  });
  await prisma.student.deleteMany({ where: { schoolId } });
  await prisma.class.deleteMany({ where: { schoolId } });
  await prisma.subject.deleteMany({ where: { schoolId } });

  // ── Subjects ─────────────────────────────────────────────
  const subjectsData = [
    { name: "Mathématiques", nameAr: "الرياضيات", code: "math", category: "sciences" },
    { name: "Physique", nameAr: "الفيزياء", code: "phys", category: "sciences" },
    { name: "Sciences Naturelles", nameAr: "العلوم الطبيعية", code: "svt", category: "sciences" },
    { name: "Français", nameAr: "الفرنسية", code: "fr", category: "langues" },
    { name: "Arabe", nameAr: "العربية", code: "ar", category: "langues" },
    { name: "Anglais", nameAr: "الإنجليزية", code: "en", category: "langues" },
    { name: "Histoire-Géographie", nameAr: "التاريخ والجغرافيا", code: "hg", category: "lettres" },
    { name: "Philosophie", nameAr: "الفلسفة", code: "philo", category: "lettres" },
    { name: "Éducation Islamique", nameAr: "التربية الإسلامية", code: "isla", category: "lettres" },
  ];
  const subjects = await Promise.all(
    subjectsData.map((s) =>
      prisma.subject.create({ data: { ...s, schoolId } }),
    ),
  );

  // ── Classes ─────────────────────────────────────────────
  const classesData = [
    { name: "1ère AS Sciences", level: "secondaire", cycle: "Sciences", capacity: 30 },
    { name: "2ème AS Sciences", level: "secondaire", cycle: "Sciences", capacity: 30 },
    { name: "3ème AS Sciences", level: "secondaire", cycle: "Sciences", capacity: 30 },
    { name: "3ème AS Lettres", level: "secondaire", cycle: "Lettres", capacity: 30 },
  ];
  const classes = await Promise.all(
    classesData.map((c) =>
      prisma.class.create({
        data: { ...c, schoolId, academicYearId: year.id },
      }),
    ),
  );

  // Link all subjects to all classes
  for (const klass of classes) {
    for (const subj of subjects) {
      const coef = ["math", "phys", "svt"].includes(subj.code) ? 4 : 2;
      await prisma.classSubject.create({
        data: { classId: klass.id, subjectId: subj.id, coefficient: coef },
      });
    }
  }

  // ── Students ─────────────────────────────────────────────
  const firstNames = [
    "Khaled", "Yasmine", "Mohamed", "Sara", "Amine", "Lina", "Ryad",
    "Nour", "Bilal", "Imane", "Karim", "Fatima", "Yacine", "Amina",
    "Hamza", "Salma", "Anis", "Meriem", "Walid", "Rania",
  ];
  const firstNamesAr = [
    "خالد", "ياسمين", "محمد", "سارة", "أمين", "لينة", "رياض",
    "نور", "بلال", "إيمان", "كريم", "فاطمة", "ياسين", "أمينة",
    "حمزة", "سلمى", "أنيس", "مريم", "وليد", "رانيا",
  ];
  const lastNames = [
    "Bensalem", "Kaci", "Saadi", "Lakehal", "Djaballah", "Hamdi",
    "Messaoud", "Benaissa", "Touati", "Zerrouk", "Belkacem", "Ouali",
    "Mansouri", "Benhamed", "Khelifi",
  ];
  const lastNamesAr = [
    "بن سالم", "قاسي", "سعدي", "لقحل", "جبالة", "حمدي",
    "مسعود", "بن عيسى", "توعاتي", "زروق", "بلقاسم", "والي",
    "منصوري", "بن حمد", "خليفي",
  ];

  const students: { id: string; classId: string }[] = [];

  for (let i = 0; i < 40; i++) {
    const fnIdx = i % firstNames.length;
    const lnIdx = (i * 3) % lastNames.length;
    const klass = classes[i % classes.length];
    const risk =
      Math.random() < 0.15 ? "HIGH" : Math.random() < 0.3 ? "MODERATE" : "LOW";
    const riskScore =
      risk === "HIGH" ? 70 + Math.floor(Math.random() * 30) :
      risk === "MODERATE" ? 40 + Math.floor(Math.random() * 30) :
      10 + Math.floor(Math.random() * 30);

    const rationaleByRisk: Record<string, string> = {
      HIGH: "Moyenne en baisse + absences répétées. Contact parents recommandé cette semaine.",
      MODERATE: "Moyenne en légère baisse. À surveiller au prochain trimestre.",
      LOW: "Bons résultats, présence régulière.",
    };

    const stu = await prisma.student.create({
      data: {
        schoolId,
        classId: klass.id,
        firstName: firstNames[fnIdx],
        lastName: lastNames[lnIdx],
        firstNameAr: firstNamesAr[fnIdx],
        lastNameAr: lastNamesAr[lnIdx],
        gender: i % 2 === 0 ? "M" : "F",
        parentName: `Parent ${lastNames[lnIdx]}`,
        parentPhone: `055${String(1000000 + i * 7777).slice(-7)}`,
        riskLevel: risk as "LOW" | "MODERATE" | "HIGH",
        riskScore,
        riskRationale: rationaleByRisk[risk],
      },
    });
    students.push({ id: stu.id, classId: klass.id });
  }

  // ── Grades (trimester 2) ─────────────────────────────────
  const gradeData = [];
  for (const stu of students) {
    for (const subj of subjects) {
      const base = 8 + Math.random() * 11; // 8-19
      gradeData.push({
        studentId: stu.id,
        subjectId: subj.id,
        enteredById: session.userId,
        trimester: 2,
        year: year.name,
        value: Number(base.toFixed(2)),
        comment: base >= 15 ? "Très bien" : base >= 12 ? "Bien" : base >= 10 ? "Passable" : "Insuffisant",
      });
    }
  }
  await prisma.grade.createMany({ data: gradeData });

  // ── Attendance (last 7 days) ─────────────────────────────
  const attendanceData = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - d);
    if (date.getDay() === 5 || date.getDay() === 6) continue; // skip Fri/Sat

    for (const stu of students) {
      const r = Math.random();
      const status =
        r > 0.92 ? "ABSENT" :
        r > 0.85 ? "LATE" :
        "PRESENT";
      attendanceData.push({
        studentId: stu.id,
        date,
        status: status as "PRESENT" | "ABSENT" | "LATE",
        recordedById: session.userId,
      });
    }
  }
  await prisma.attendance.createMany({
    data: attendanceData,
    skipDuplicates: true,
  });

  // ── Payments (trimester 2) ───────────────────────────────
  const paymentData = students.map((stu, i) => {
    const amountDue = 25_000;
    const r = Math.random();
    const paid = r > 0.6;
    const partial = !paid && r > 0.4;
    return {
      schoolId,
      studentId: stu.id,
      trimester: 2,
      year: year.name,
      amountDue,
      amountPaid: paid ? amountDue : partial ? Math.floor(amountDue * 0.5) : 0,
      status: (paid ? "PAID" : partial ? "PARTIAL" : "PENDING") as
        | "PAID" | "PARTIAL" | "PENDING",
      method: paid ? (i % 2 === 0 ? "especes" : "virement") : null,
      paidAt: paid ? new Date() : null,
    };
  });
  await prisma.payment.createMany({ data: paymentData });

  // ── Schedule (one class, full week) ──────────────────────
  const sampleClass = classes[0];
  const scheduleEntries = [
    { day: 0, time: "08:00", end: "09:00", code: "math", room: "A12" }, // Sun
    { day: 0, time: "09:00", end: "10:00", code: "ar",   room: "A12" },
    { day: 0, time: "10:00", end: "11:00", code: "fr",   room: "A12" },
    { day: 1, time: "08:00", end: "09:00", code: "phys", room: "B05" }, // Mon
    { day: 1, time: "09:00", end: "10:00", code: "phys", room: "B05" },
    { day: 1, time: "10:00", end: "11:00", code: "math", room: "A12" },
    { day: 1, time: "14:00", end: "15:00", code: "en",   room: "C03" },
    { day: 2, time: "08:00", end: "09:00", code: "svt",  room: "B07" },
    { day: 2, time: "09:00", end: "10:00", code: "hg",   room: "A12" },
    { day: 2, time: "11:00", end: "12:00", code: "ar",   room: "A12" },
    { day: 3, time: "08:00", end: "09:00", code: "math", room: "A12" },
    { day: 3, time: "10:00", end: "11:00", code: "philo", room: "A12" },
    { day: 3, time: "14:00", end: "15:00", code: "isla", room: "A12" },
    { day: 4, time: "08:00", end: "09:00", code: "fr",   room: "A12" },
    { day: 4, time: "09:00", end: "10:00", code: "en",   room: "C03" },
    { day: 4, time: "10:00", end: "11:00", code: "svt",  room: "B07" },
  ];
  const schedToCreate = scheduleEntries
    .map((e) => {
      const subj = subjects.find((s) => s.code === e.code);
      if (!subj) return null;
      return {
        classId: sampleClass.id,
        subjectId: subj.id,
        dayOfWeek: e.day,
        startTime: e.time,
        endTime: e.end,
        room: e.room,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  await prisma.schedule.createMany({ data: schedToCreate });

  return NextResponse.json({
    ok: true,
    summary: {
      subjects: subjects.length,
      classes: classes.length,
      students: students.length,
      grades: gradeData.length,
      attendance: attendanceData.length,
      payments: paymentData.length,
      schedule: schedToCreate.length,
    },
  });
}
