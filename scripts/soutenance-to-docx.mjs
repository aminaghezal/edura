import { marked } from "marked";
import HTMLtoDOCX from "html-to-docx";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SOURCE = join(ROOT, "GUIDE_SOUTENANCE.md");
const OUTPUT = join(ROOT, "GUIDE_SOUTENANCE.docx");

console.log("📖 Lecture du markdown...");
const markdown = readFileSync(SOURCE, "utf-8");
marked.setOptions({ gfm: true, breaks: false });
const htmlBody = marked.parse(markdown);

const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8" /><style>
body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.5; color: #1a1a1a; }
h1 { font-size: 20pt; color: #B91C1C; border-bottom: 2pt solid #B91C1C; padding-bottom: 4pt; margin-top: 24pt; page-break-before: always; }
h1:first-of-type { page-break-before: avoid; }
h2 { font-size: 14pt; color: #1F3864; margin-top: 18pt; }
h3 { font-size: 12pt; color: #2E5BAA; margin-top: 12pt; }
h4 { font-size: 11pt; color: #444; margin-top: 8pt; }
p { margin: 6pt 0; text-align: justify; }
table { border-collapse: collapse; margin: 8pt 0; width: 100%; }
th { background-color: #1F3864; color: white; padding: 5pt 7pt; text-align: left; font-weight: bold; }
td { padding: 4pt 7pt; border: 0.5pt solid #b0b0b0; vertical-align: top; font-size: 10pt; }
tr:nth-child(even) td { background-color: #f5f7fa; }
code { background-color: #f1f3f6; padding: 1pt 4pt; font-family: 'Consolas', monospace; font-size: 9pt; }
pre { background-color: #f1f3f6; padding: 8pt; border-left: 3pt solid #B91C1C; font-family: 'Consolas', monospace; font-size: 9pt; white-space: pre-wrap; }
blockquote { border-left: 3pt solid #B91C1C; margin-left: 0; padding: 4pt 12pt; font-style: italic; color: #444; background-color: #fef5f5; }
ul, ol { margin: 6pt 0; padding-left: 24pt; }
li { margin: 2pt 0; }
hr { border: none; border-top: 1pt solid #c0c0c0; margin: 14pt 0; }
strong { color: #B91C1C; }
</style></head><body>${htmlBody}</body></html>`;

console.log("🔄 Conversion HTML → DOCX...");
const buffer = await HTMLtoDOCX(fullHtml, null, {
  margins: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
  font: "Calibri",
  fontSize: 22,
  title: "EDURA — Guide de Soutenance Anti-Panique",
  creator: "Amina Kaouter Ghezal",
  footer: true,
  pageNumber: true,
});
writeFileSync(OUTPUT, buffer);
console.log(`✅ ${OUTPUT}`);
console.log(`   ${(buffer.length / 1024).toFixed(1)} KB`);
