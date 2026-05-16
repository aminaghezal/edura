/**
 * Convertit MEMOIRE_PFE.md en MEMOIRE_PFE.docx
 *
 * Usage:
 *   node scripts/md-to-docx.mjs
 *
 * Le .docx généré peut s'ouvrir dans Microsoft Word, LibreOffice,
 * ou Google Docs. Tu pourras ajuster les styles, ajouter une page de
 * garde, et exporter en PDF depuis Word.
 */

import { marked } from "marked";
import HTMLtoDOCX from "html-to-docx";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SOURCE = join(ROOT, "MEMOIRE_PFE.md");
const OUTPUT = join(ROOT, "MEMOIRE_PFE.docx");

console.log("📖 Lecture du markdown...");
const markdown = readFileSync(SOURCE, "utf-8");

console.log("🔄 Conversion markdown → HTML...");
// Configuration marked pour préserver la mise en forme
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown (tables, etc.)
  breaks: false,
});

const htmlBody = marked.parse(markdown);

// Wrapper HTML avec styles intégrés pour de meilleurs résultats dans Word
const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: 'Calibri', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a1a1a;
    }
    h1 {
      font-size: 22pt;
      color: #1F3864;
      margin-top: 28pt;
      margin-bottom: 14pt;
      page-break-after: avoid;
      border-bottom: 2pt solid #1F3864;
      padding-bottom: 4pt;
    }
    h2 {
      font-size: 16pt;
      color: #1F3864;
      margin-top: 22pt;
      margin-bottom: 10pt;
      page-break-after: avoid;
    }
    h3 {
      font-size: 13pt;
      color: #2E5BAA;
      margin-top: 16pt;
      margin-bottom: 8pt;
      page-break-after: avoid;
    }
    h4 {
      font-size: 12pt;
      color: #444;
      margin-top: 12pt;
      margin-bottom: 6pt;
      page-break-after: avoid;
    }
    p {
      margin: 6pt 0;
      text-align: justify;
    }
    table {
      border-collapse: collapse;
      margin: 10pt 0;
      width: 100%;
    }
    th {
      background-color: #1F3864;
      color: white;
      padding: 6pt 8pt;
      text-align: left;
      font-weight: bold;
      border: 1pt solid #1F3864;
    }
    td {
      padding: 5pt 8pt;
      border: 1pt solid #b0b0b0;
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background-color: #f5f7fa;
    }
    code {
      background-color: #f1f3f6;
      padding: 1pt 4pt;
      font-family: 'Consolas', monospace;
      font-size: 10pt;
      border-radius: 2pt;
    }
    pre {
      background-color: #f1f3f6;
      padding: 10pt;
      border-left: 3pt solid #1F3864;
      font-family: 'Consolas', monospace;
      font-size: 9pt;
      white-space: pre-wrap;
      page-break-inside: avoid;
    }
    blockquote {
      border-left: 3pt solid #1F3864;
      margin-left: 0;
      padding: 4pt 12pt;
      font-style: italic;
      color: #444;
      background-color: #f5f7fa;
    }
    ul, ol {
      margin: 6pt 0;
      padding-left: 24pt;
    }
    li {
      margin: 3pt 0;
    }
    hr {
      border: none;
      border-top: 1pt solid #c0c0c0;
      margin: 14pt 0;
    }
    strong {
      color: #1F3864;
    }
    a {
      color: #1F3864;
      text-decoration: underline;
    }
  </style>
</head>
<body>
${htmlBody}
</body>
</html>
`;

console.log("🔄 Conversion HTML → DOCX...");

const docxOptions = {
  margins: {
    top: 1440,    // 1 inch = 1440 twips
    right: 1440,
    bottom: 1440,
    left: 1440,
  },
  font: "Calibri",
  fontSize: 22, // 11pt × 2 (half-points)
  title: "EDURA — Mémoire de Projet de Fin d'Études",
  creator: "Amina Kaouter Ghezal",
  description:
    "Conception et développement d'une plateforme SaaS multi-tenant assistée par IA pour la gestion des écoles privées algériennes",
  header: false,
  footer: true,
  pageNumber: true,
  table: {
    row: {
      cantSplit: true,
    },
  },
};

const buffer = await HTMLtoDOCX(fullHtml, null, docxOptions);

writeFileSync(OUTPUT, buffer);

console.log(`✅ Document créé : ${OUTPUT}`);
console.log(`   Taille : ${(buffer.length / 1024).toFixed(1)} KB`);
