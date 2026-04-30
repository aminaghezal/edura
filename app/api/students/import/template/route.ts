import * as XLSX from "xlsx";
import { requireSession } from "@/lib/auth";

export async function GET() {
  await requireSession(); // any authenticated user

  // Headers + 2 example rows
  const data = [
    {
      Prénom: "Khaled",
      Nom: "Bensalem",
      "Prénom AR": "خالد",
      "Nom AR": "بن سالم",
      Classe: "1ère AS Sciences",
      "Date de naissance": "2008-03-15",
      Sexe: "M",
      Parent: "Ahmed Bensalem",
      Téléphone: "0550 123 456",
      Email: "ahmed.bensalem@example.dz",
    },
    {
      Prénom: "Yasmine",
      Nom: "Kaci",
      "Prénom AR": "ياسمين",
      "Nom AR": "قاسي",
      Classe: "2ème AS Sciences",
      "Date de naissance": "2009-07-22",
      Sexe: "F",
      Parent: "Nassima Kaci",
      Téléphone: "0661 987 654",
      Email: "",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  // Column widths
  ws["!cols"] = [
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 22 }, { wch: 18 }, { wch: 8 },
    { wch: 22 }, { wch: 16 }, { wch: 28 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Élèves");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="edura-modele-eleves.xlsx"',
    },
  });
}
