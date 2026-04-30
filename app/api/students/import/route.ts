import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

// Tolerant header matching — Algerian schools' Excel sheets vary wildly.
// Accept fr/ar variants and case differences.
const HEADER_ALIASES: Record<string, string[]> = {
  firstName: ["prenom", "prénom", "first name", "firstname", "اسم"],
  lastName: ["nom", "last name", "lastname", "family name", "لقب"],
  firstNameAr: ["prenom ar", "prénom arabe", "اسم بالعربية"],
  lastNameAr: ["nom ar", "nom arabe", "لقب بالعربية"],
  className: ["classe", "class", "section", "صف", "قسم"],
  birthDate: ["date de naissance", "naissance", "birth date", "dob", "تاريخ الميلاد"],
  gender: ["sexe", "gender", "genre", "الجنس"],
  parentName: ["parent", "tuteur", "nom parent", "ولي الأمر"],
  parentPhone: ["telephone", "téléphone", "tel", "phone", "هاتف"],
  parentEmail: ["email", "email parent", "بريد"],
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .trim();
}

function buildHeaderMap(headers: string[]): Map<string, number> {
  const map = new Map<string, number>();
  headers.forEach((h, idx) => {
    const norm = normalize(String(h));
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.some((a) => normalize(a) === norm)) {
        map.set(field, idx);
        break;
      }
    }
  });
  return map;
}

const rowSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  firstNameAr: z.string().max(80).optional(),
  lastNameAr: z.string().max(80).optional(),
  className: z.string().optional(),
  birthDate: z.coerce.date().optional(),
  gender: z.enum(["M", "F"]).optional(),
  parentName: z.string().max(160).optional(),
  parentPhone: z.string().max(40).optional(),
  parentEmail: z.string().email().max(160).optional(),
});

export async function POST(req: Request) {
  const session = await requireSession();

  // Read uploaded file
  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Fichier trop volumineux (>5 MB)" }, { status: 400 });
  }

  // Parse workbook
  let workbook: XLSX.WorkBook;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  } catch {
    return NextResponse.json({ error: "Fichier Excel invalide" }, { status: 400 });
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return NextResponse.json({ error: "Classeur vide" }, { status: 400 });
  }
  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: false,
    defval: "",
  });

  if (rawRows.length < 2) {
    return NextResponse.json(
      { error: "Le fichier doit contenir au moins une ligne d'en-tête et une ligne d'élève" },
      { status: 400 },
    );
  }

  const headers = (rawRows[0] as unknown[]).map((h) => String(h ?? ""));
  const headerMap = buildHeaderMap(headers);

  if (!headerMap.has("firstName") || !headerMap.has("lastName")) {
    return NextResponse.json(
      {
        error: "Colonnes obligatoires manquantes : 'Prénom' et 'Nom'",
        detectedHeaders: headers,
      },
      { status: 400 },
    );
  }

  // Pre-fetch existing classes for this school (cache for class name lookups)
  const existingClasses = await prisma.class.findMany({
    where: { schoolId: session.schoolId },
    select: { id: true, name: true },
  });
  const classByName = new Map(
    existingClasses.map((c) => [normalize(c.name), c.id]),
  );

  const academicYear = await prisma.academicYear.findFirst({
    where: { schoolId: session.schoolId, isCurrent: true },
    select: { id: true },
  });

  const dataRows = rawRows.slice(1);
  const results = {
    total: dataRows.length,
    created: 0,
    skipped: 0,
    classesCreated: 0,
    errors: [] as { row: number; message: string }[],
  };

  // Helper: get cell by field name
  function cell(row: unknown[], field: string): string | undefined {
    const idx = headerMap.get(field);
    if (idx === undefined) return undefined;
    const v = row[idx];
    if (v == null || v === "") return undefined;
    return String(v).trim();
  }

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i] as unknown[];
    const rowNum = i + 2; // header is row 1

    // Skip blank rows
    const firstName = cell(row, "firstName");
    const lastName = cell(row, "lastName");
    if (!firstName && !lastName) {
      results.skipped++;
      continue;
    }

    const parsed = rowSchema.safeParse({
      firstName,
      lastName,
      firstNameAr: cell(row, "firstNameAr"),
      lastNameAr: cell(row, "lastNameAr"),
      className: cell(row, "className"),
      birthDate: cell(row, "birthDate"),
      gender: cell(row, "gender")?.toUpperCase().slice(0, 1),
      parentName: cell(row, "parentName"),
      parentPhone: cell(row, "parentPhone"),
      parentEmail: cell(row, "parentEmail"),
    });

    if (!parsed.success) {
      results.errors.push({
        row: rowNum,
        message: parsed.error.issues
          .map((iss) => `${iss.path.join(".")}: ${iss.message}`)
          .join("; "),
      });
      continue;
    }

    // Class lookup / auto-create
    let classId: string | undefined;
    if (parsed.data.className) {
      const norm = normalize(parsed.data.className);
      const found = classByName.get(norm);
      if (found) {
        classId = found;
      } else if (academicYear) {
        // Auto-create the class so the import doesn't fail on a single missing class
        const created = await prisma.class.create({
          data: {
            schoolId: session.schoolId,
            academicYearId: academicYear.id,
            name: parsed.data.className,
            level: parsed.data.className.toLowerCase().includes("primaire")
              ? "primaire"
              : parsed.data.className.toLowerCase().includes("am")
                ? "moyen"
                : "secondaire",
            capacity: 30,
          },
          select: { id: true },
        });
        classByName.set(norm, created.id);
        classId = created.id;
        results.classesCreated++;
      }
    }

    try {
      await prisma.student.create({
        data: {
          schoolId: session.schoolId,
          classId,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          firstNameAr: parsed.data.firstNameAr,
          lastNameAr: parsed.data.lastNameAr,
          birthDate: parsed.data.birthDate,
          gender: parsed.data.gender,
          parentName: parsed.data.parentName,
          parentPhone: parsed.data.parentPhone,
          parentEmail: parsed.data.parentEmail,
        },
      });
      results.created++;
    } catch (err) {
      results.errors.push({
        row: rowNum,
        message: err instanceof Error ? err.message : "Erreur inconnue",
      });
    }
  }

  return NextResponse.json(results);
}
