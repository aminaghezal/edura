/**
 * Convertit RAPPORT_TECHNIQUE_IA.md en RAPPORT_TECHNIQUE_IA.docx
 */

import { marked } from "marked";
import HTMLtoDOCX from "html-to-docx";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SOURCE = join(ROOT, "RAPPORT_TECHNIQUE_IA.md");
const OUTPUT = join(ROOT, "RAPPORT_TECHNIQUE_IA.docx");

console.log("📖 Lecture du markdown...");
const markdown = readFileSync(SOURCE, "utf-8");

marked.setOptions({ gfm: true, breaks: false });
const htmlBody = marked.parse(markdown);

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
      color: #6B21A8;
      margin-top: 28pt;
      margin-bottom: 14pt;
      border-bottom: 2pt solid #6B21A8;
      padding-bottom: 4pt;
    }
    h2 {
      font-size: 16pt;
      color: #6B21A8;
      margin-top: 22pt;
      margin-bottom: 10pt;
    }
    h3 {
      font-size: 13pt;
      color: #9333EA;
      margin-top: 16pt;
      margin-bottom: 8pt;
    }
    h4 {
      font-size: 12pt;
      color: #444;
      margin-top: 12pt;
      margin-bottom: 6pt;
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
      background-color: #6B21A8;
      color: white;
      padding: 6pt 8pt;
      text-align: left;
      font-weight: bold;
      border: 1pt solid #6B21A8;
    }
    td {
      padding: 5pt 8pt;
      border: 1pt solid #b0b0b0;
      vertical-align: top;
    }
    tr:nth-child(even) td { background-color: #f8f5fc; }
    code {
      background-color: #f1f3f6;
      padding: 1pt 4pt;
      font-family: 'Consolas', monospace;
      font-size: 10pt;
    }
    pre {
      background-color: #f8f5fc;
      padding: 10pt;
      border-left: 3pt solid #9333EA;
      font-family: 'Consolas', monospace;
      font-size: 9pt;
      white-space: pre-wrap;
    }
    blockquote {
      border-left: 3pt solid #9333EA;
      margin-left: 0;
      padding: 4pt 12pt;
      font-style: italic;
      color: #444;
      background-color: #f8f5fc;
    }
    ul, ol { margin: 6pt 0; padding-left: 24pt; }
    li { margin: 3pt 0; }
    hr { border: none; border-top: 1pt solid #c0c0c0; margin: 14pt 0; }
    strong { color: #6B21A8; }
  </style>
</head>
<body>
${htmlBody}
</body>
</html>
`;

console.log("🔄 Conversion HTML → DOCX...");
const docxOptions = {
  margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
  font: "Calibri",
  fontSize: 22,
  title: "EDURA — Rapport Technique sur la couche d'IA",
  creator: "Amina Kaouter Ghezal",
  description: "Honnêteté technique et justification académique de l'IA d'EDURA",
  footer: true,
  pageNumber: true,
};

const buffer = await HTMLtoDOCX(fullHtml, null, docxOptions);
writeFileSync(OUTPUT, buffer);
console.log(`✅ Document créé : ${OUTPUT}`);
console.log(`   Taille : ${(buffer.length / 1024).toFixed(1)} KB`);
