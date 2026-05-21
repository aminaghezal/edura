const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  PageNumber, Header, Footer, ImageRun, PageBreak,
  LevelFormat, NumberFormat
} = require('docx');
const fs = require('fs');

// ── colour palette ──────────────────────────────────────────────
const NAVY   = '0A1628';
const GOLD   = 'C9A84C';
const BLUE   = '0052FF';
const LGRAY  = 'F4F7FF';
const WHITE  = 'FFFFFF';
const DTEXT  = '1E293B';
const MUTED  = '64748B';
const GREEN  = '16A34A';
const AMBER  = 'F59E0B';
const RED    = 'DC2626';

// ── helpers ─────────────────────────────────────────────────────
function pgBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function spacer(n = 1) {
  return new Paragraph({ text: '', spacing: { after: 160 * n } });
}

function heading1(text) {
  return new Paragraph({
    children: [new TextRun({
      text, bold: true, size: 36, color: WHITE, font: 'Calibri'
    })],
    alignment: AlignmentType.CENTER,
    shading: { type: ShadingType.CLEAR, color: NAVY, fill: NAVY },
    spacing: { before: 200, after: 200 },
    indent: { left: 200, right: 200 },
  });
}

function heading2(text) {
  return new Paragraph({
    children: [new TextRun({
      text, bold: true, size: 28, color: WHITE, font: 'Calibri'
    })],
    shading: { type: ShadingType.CLEAR, color: BLUE, fill: BLUE },
    spacing: { before: 240, after: 120 },
    indent: { left: 200 },
  });
}

function heading3(text) {
  return new Paragraph({
    children: [new TextRun({
      text, bold: true, size: 24, color: NAVY, font: 'Calibri'
    })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD } },
    spacing: { before: 200, after: 100 },
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({
      text, size: 22, color: DTEXT, font: 'Calibri', ...opts
    })],
    spacing: { after: 100 },
    alignment: AlignmentType.JUSTIFIED,
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    children: [new TextRun({
      text: '●  ' + text, size: 22, color: DTEXT, font: 'Calibri'
    })],
    indent: { left: 480 + level * 360, hanging: 0 },
    spacing: { after: 80 },
  });
}

function infoBox(text, color = LGRAY, textColor = NAVY) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: 9360, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: color },
        borders: {
          top:    { style: BorderStyle.SINGLE, size: 8, color: GOLD },
          bottom: { style: BorderStyle.SINGLE, size: 8, color: GOLD },
          left:   { style: BorderStyle.SINGLE, size: 8, color: GOLD },
          right:  { style: BorderStyle.SINGLE, size: 8, color: GOLD },
        },
        margins: { top: 120, bottom: 120, left: 200, right: 200 },
        children: [new Paragraph({
          children: [new TextRun({ text, size: 22, color: textColor, font: 'Calibri' })],
          alignment: AlignmentType.JUSTIFIED,
        })],
      })]
    })]
  });
}

function twoColTable(left, right, leftW = 4680, rightW = 4680) {
  const b = { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' };
  const borders = { top: b, bottom: b, left: b, right: b };
  const cell = (paragraphs, w) => new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders,
    margins: { top: 80, bottom: 80, left: 160, right: 160 },
    children: paragraphs,
  });
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [leftW, rightW],
    rows: [new TableRow({ children: [cell(left, leftW), cell(right, rightW)] })],
  });
}

function headerRow(cells, widths) {
  const b = { style: BorderStyle.SINGLE, size: 4, color: NAVY };
  const borders = { top: b, bottom: b, left: b, right: b };
  return new TableRow({
    children: cells.map((text, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      borders,
      shading: { type: ShadingType.CLEAR, fill: NAVY },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({
        children: [new TextRun({ text, bold: true, size: 20, color: WHITE, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
      })],
    }))
  });
}

function dataRow(cells, widths, shade = WHITE) {
  const b = { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' };
  const borders = { top: b, bottom: b, left: b, right: b };
  return new TableRow({
    children: cells.map((text, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      borders,
      shading: { type: ShadingType.CLEAR, fill: shade },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({
        children: [new TextRun({ text, size: 20, color: DTEXT, font: 'Calibri' })],
      })],
    }))
  });
}

// ── document ────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: 22, color: DTEXT } }
    }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, bottom: 1080, left: 1260, right: 1260 },
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [
            new TextRun({ text: 'EDURA — Projet de Fin d\'Études / Startup — AM 1275 — USTO-MB 2025/2026', size: 16, color: MUTED, font: 'Calibri' }),
          ],
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
        })],
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: 'Amina Kaouter Ghezal — edura-aminaghezal.vercel.app     Page ', size: 16, color: MUTED }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MUTED }),
          ],
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD } },
        })]
      })
    },

    children: [

      // ═══════════════════════════════════════════════
      // PAGE DE GARDE
      // ═══════════════════════════════════════════════
      new Paragraph({
        children: [new TextRun({ text: 'République Algérienne Démocratique et Populaire', size: 20, color: NAVY, font: 'Calibri', bold: true })],
        alignment: AlignmentType.CENTER, spacing: { before: 400, after: 60 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Ministère de l\'Enseignement Supérieur et de la Recherche Scientifique', size: 20, color: NAVY, font: 'Calibri' })],
        alignment: AlignmentType.CENTER, spacing: { after: 60 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Université des Sciences et de la Technologie d\'Oran — Mohamed Boudiaf (USTO-MB)', size: 20, color: NAVY, font: 'Calibri' })],
        alignment: AlignmentType.CENTER, spacing: { after: 60 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Faculté d\'Informatique — Département d\'Informatique', size: 20, color: MUTED, font: 'Calibri' })],
        alignment: AlignmentType.CENTER, spacing: { after: 400 },
      }),

      new Paragraph({
        children: [new TextRun({ text: '──────────────────────────────────────────', color: GOLD })],
        alignment: AlignmentType.CENTER,
      }),

      new Paragraph({
        children: [new TextRun({
          text: 'GUIDE DE PROJET DIPLÔME / STARTUP',
          bold: true, size: 32, color: NAVY, font: 'Calibri'
        })],
        alignment: AlignmentType.CENTER, spacing: { before: 200, after: 120 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Dans le cadre de l\'Arrêté Ministériel n° 1275', size: 24, color: BLUE, font: 'Calibri' })],
        alignment: AlignmentType.CENTER, spacing: { after: 300 },
      }),

      infoBox(
        'Titre du projet : EDURA — Plateforme SaaS de Gestion pour Établissements Scolaires :\n' +
        'Analyse prédictive des risques d\'échec et orientation automatisée des élèves',
        LGRAY, NAVY
      ),

      spacer(2),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3000, 6360],
        rows: [
          dataRow(['Étudiante :', 'Amina Kaouter Ghezal'], [3000, 6360], LGRAY),
          dataRow(['Spécialité :', 'Master Informatique — USTO-MB'], [3000, 6360]),
          dataRow(['Encadrante :', 'Mme DEKHICI Latifa'], [3000, 6360], LGRAY),
          dataRow(['Année universitaire :', '2025 / 2026'], [3000, 6360]),
          dataRow(['Statut du projet :', 'MVP déployé en production — edura-aminaghezal.vercel.app'], [3000, 6360], LGRAY),
          dataRow(['Dépôt de code :', 'github.com/aminaghezal/edura'], [3000, 6360]),
        ]
      }),

      spacer(3),
      new Paragraph({
        children: [new TextRun({ text: '──────────────────────────────────────────', color: GOLD })],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Commission nationale de coordination du suivi de l\'innovation et des incubateurs universitaires', size: 18, color: MUTED, italic: true })],
        alignment: AlignmentType.CENTER, spacing: { before: 120 },
      }),

      pgBreak(),

      // ═══════════════════════════════════════════════
      // CARTE D'INFORMATION
      // ═══════════════════════════════════════════════
      heading1('CARTE D\'INFORMATION'),
      spacer(),

      heading3('1 — Équipe d\'encadrement'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4680, 4680],
        rows: [
          headerRow(['Encadrant(e)', 'Spécialité'], [4680, 4680]),
          dataRow(['Mme DEKHICI Latifa (Encadrante principale)', 'Informatique — USTO-MB'], [4680, 4680], LGRAY),
          dataRow(['—', '—'], [4680, 4680]),
          dataRow(['—', '—'], [4680, 4680], LGRAY),
        ]
      }),
      spacer(),

      heading3('2 — Équipe de projet'),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4680, 2340, 2340],
        rows: [
          headerRow(['Étudiant(e)', 'Faculté', 'Spécialité'], [4680, 2340, 2340]),
          dataRow(['Amina Kaouter Ghezal', 'Faculté d\'Informatique', 'Master Informatique'], [4680, 2340, 2340], LGRAY),
          dataRow(['—', '—', '—'], [4680, 2340, 2340]),
          dataRow(['—', '—', '—'], [4680, 2340, 2340], LGRAY),
        ]
      }),

      pgBreak(),

      // ═══════════════════════════════════════════════
      // TABLE DES MATIÈRES
      // ═══════════════════════════════════════════════
      heading1('TABLE DES MATIÈRES'),
      spacer(),
      ...[
        ['Premier axe : Présentation du projet', '1'],
        ['  1. L\'idée de projet (la solution proposée)', '2'],
        ['  2. Les valeurs proposées', '3'],
        ['  3. L\'équipe', '4'],
        ['  4. Les objectifs du projet', '5'],
        ['  5. Le planning de réalisation', '5'],
        ['Deuxième axe : Aspects innovants', '6'],
        ['  1. La nature des innovations', '7'],
        ['  2. Les domaines d\'innovation', '7'],
        ['Troisième axe : Analyse stratégique du marché', '8'],
        ['  1. Le segment du marché', '9'],
        ['  2. Mesure de l\'intensité de la concurrence', '9'],
        ['  3. La stratégie marketing', '10'],
        ['Quatrième axe : Plan de production et organisation', '11'],
        ['  1. Le processus de production', '12'],
        ['  2. L\'approvisionnement', '12'],
        ['  3. La main d\'œuvre', '13'],
        ['  4. Les principaux partenaires', '13'],
        ['Cinquième axe : Plan financier', '14'],
        ['  1. Les coûts et charges', '15'],
        ['  2. Le chiffre d\'affaires', '15'],
        ['  3. Les comptes de résultats escomptés', '16'],
        ['  4. Le plan de trésorerie', '16'],
        ['Sixième axe : Prototype expérimental', '17'],
        ['Annexes', '18'],
      ].map(([label, page]) => new Paragraph({
        children: [
          new TextRun({ text: label, size: 22, font: 'Calibri', color: label.startsWith('  ') ? MUTED : NAVY, bold: !label.startsWith('  ') }),
          new TextRun({ text: '  ........................................  ' + page, size: 22, font: 'Calibri', color: MUTED }),
        ],
        spacing: { after: 80 },
      })),

      pgBreak(),

      // ═══════════════════════════════════════════════
      // PREMIER AXE
      // ═══════════════════════════════════════════════
      heading1('PREMIER AXE : PRÉSENTATION DU PROJET'),
      spacer(),

      heading2('1. L\'idée de projet — La solution proposée'),
      spacer(),

      body('EDURA est une plateforme web de type SaaS (Software as a Service) à architecture multi-tenant, développée spécifiquement pour répondre aux besoins des établissements d\'enseignement privés algériens. Elle opère dans le domaine des applications numériques modernes appliquées à l\'éducation (EdTech).'),
      spacer(),

      heading3('Origine de l\'idée'),
      body('L\'idée a émergé d\'une observation de terrain : les directeurs d\'écoles privées algériennes gèrent leurs établissements avec des outils fragmentés et inadaptés — fichiers Excel éparpillés, cahiers de présence papier, messages WhatsApp pour les communications avec les parents. Dans un secteur comptant plus de 800 établissements actifs sur le territoire national, cette réalité représente un manque à gagner considérable en efficacité, ainsi qu\'un risque réglementaire réel (20 écoles ont été fermées depuis 2023 pour non-conformité au cahier des charges du Ministère de l\'Éducation Nationale).'),
      body('Au-delà de la gestion administrative, un second problème structurel a motivé le projet : l\'absence totale d\'outils scientifiques d\'orientation pédagogique dans les écoles algériennes. Les orientations en fin de cycle secondaire reposent exclusivement sur la moyenne générale, ignorant les intelligences multiples, le style d\'apprentissage et les aptitudes spécifiques de chaque élève.'),
      spacer(),

      heading3('La solution : ce que fait EDURA'),
      body('EDURA centralise l\'ensemble de la gestion scolaire en 13 modules intégrés, accessibles depuis n\'importe quel navigateur sans installation :'),
      bullet('Gestion des élèves et des classes'),
      bullet('Saisie et calcul automatique des notes et moyennes'),
      bullet('Génération de bulletins PDF officiels bilingues (FR/AR)'),
      bullet('Suivi des présences quotidiennes'),
      bullet('Gestion de l\'emploi du temps (semaine algérienne Dim–Jeu)'),
      bullet('Module finance : paiements, taux de recouvrement, alertes retards'),
      bullet('Tableau de bord analytique avec indicateurs clés en temps réel'),
      bullet('Module IA — détection précoce du risque de décrochage scolaire'),
      bullet('Module conformité réglementaire (cahier des charges 2026)'),
      bullet('Import Excel bilingue FR/AR'),
      bullet('Rapport Scientifique d\'Orientation individuelle (module phare)'),
      bullet('Gestion de l\'équipe pédagogique (3 rôles : Directeur, Secrétaire, Professeur)'),
      bullet('Notifications et communications internes'),
      spacer(),

      heading3('Comment cela fonctionne-t-il ?'),
      body('La plateforme est accessible via un abonnement annuel. Un directeur s\'inscrit en 60 secondes, crée son école, importe ses élèves via Excel, et commence à travailler immédiatement. Les données de chaque école sont strictement isolées des autres (architecture multi-tenant avec Row-Level Security PostgreSQL). Le moteur d\'intelligence artificielle analyse chaque nuit 12 facteurs par élève et produit un score de risque de décrochage. Une fois par an, le directeur génère pour chaque élève un Rapport Scientifique d\'Orientation basé sur la théorie des intelligences multiples de Howard Gardner (Harvard, 1983) : profil cognitif, filière BAC recommandée, métiers ciblés, universités algériennes pertinentes.'),
      spacer(),

      heading3('Qui l\'accomplit et où ?'),
      body('Le projet a été conçu et développé intégralement par Amina Kaouter Ghezal, étudiante en Master Informatique à l\'USTO-MB, en parallèle de sa formation académique. La plateforme est hébergée sur infrastructure cloud européenne (Vercel + Supabase) et est déployée en production à l\'adresse : edura-aminaghezal.vercel.app. Son marché opérationnel est l\'Algérie, avec une perspective d\'expansion régionale vers la Tunisie et le Maroc.'),

      spacer(),
      heading2('2. Les valeurs proposées'),
      spacer(),
      body('Les valeurs qu\'EDURA délivre à ses clients — les directeurs d\'écoles privées — s\'articulent autour de six axes :'),
      spacer(),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2500, 6860],
        rows: [
          headerRow(['Valeur', 'Description'], [2500, 6860]),
          dataRow(['Modernité', 'EDURA est la première plateforme SaaS cloud native bilingue (FR/AR) conçue spécifiquement pour les écoles privées algériennes. Aucune solution comparable n\'existait sur ce marché.'], [2500, 6860], LGRAY),
          dataRow(['Performance', 'Un seul abonnement remplace 10+ outils disparates (Excel, WhatsApp, logiciels de comptabilité isolés). Toutes les données sont accessibles en temps réel depuis un seul tableau de bord.'], [2500, 6860]),
          dataRow(['Réduction des coûts', 'Au prix de 200 000 DZD/an tout inclus, soit moins de 0,5 % du chiffre d\'affaires d\'une école de taille moyenne, EDURA est économiquement accessible sans arbitrage budgétaire difficile.'], [2500, 6860], LGRAY),
          dataRow(['Facilité d\'utilisation', 'Onboarding complet en moins d\'une heure. Aucune installation requise. Interface disponible sur tous les appareils. Essai gratuit 30 jours sans carte bancaire.'], [2500, 6860]),
          dataRow(['Réduction des risques', 'Le module de conformité réglementaire aide les directeurs à suivre en temps réel leurs obligations vis-à-vis du cahier des charges du Ministère, réduisant le risque de fermeture administrative.'], [2500, 6860], LGRAY),
          dataRow(['Valeur unique — Orientation', 'Le Rapport Scientifique d\'Orientation, fondé sur la théorie de Gardner, offre aux parents un document d\'orientation personnalisé scientifiquement. Ce service n\'existe dans aucune autre école algérienne.'], [2500, 6860]),
        ]
      }),

      spacer(),
      heading2('3. L\'équipe de travail'),
      spacer(),
      body('Le projet est actuellement porté par sa fondatrice unique, dans le cadre du dispositif Diplôme-Startup :'),
      spacer(),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3000, 3180, 3180],
        rows: [
          headerRow(['Membre', 'Compétences & Formation', 'Rôle dans le projet'], [3000, 3180, 3180]),
          dataRow([
            'Amina Kaouter Ghezal\n(Fondatrice)',
            'Master Informatique — USTO-MB\nDéveloppement full-stack (Next.js, TypeScript, PostgreSQL)\nArchitecture SaaS, IA appliquée, UX/UI design\nGestion de projet agile',
            'Chef de projet\nDéveloppement full-stack complet\nArchitecture système & base de données\nMarketing & stratégie produit\nDéploiement & DevOps'
          ], [3000, 3180, 3180], LGRAY),
        ]
      }),
      spacer(),
      body('Organisation du travail : le développement a suivi une méthodologie itérative en 15 phases successives, chacune livrant un incrément fonctionnel testé en conditions réelles. La communication avec l\'encadrante (Mme Dekhici Latifa) s\'est effectuée via des réunions de suivi régulières et des échanges sur les choix architecturaux et scientifiques.'),
      body('À court terme, l\'équipe sera complétée par : un développeur backend junior, un chargé de développement commercial, et un responsable support client.'),

      spacer(),
      heading2('4. Objectifs du projet'),
      spacer(),
      body('L\'objectif principal est de devenir la plateforme de référence pour la gestion des écoles privées algériennes et l\'orientation pédagogique scientifique, en capturant une part significative des 800+ établissements actifs sur le territoire national.'),
      spacer(),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1800, 3780, 3780],
        rows: [
          headerRow(['Horizon', 'Objectif commercial', 'Part de marché estimée'], [1800, 3780, 3780]),
          dataRow(['Court terme\n(0–12 mois)', 'Atteindre 10 à 20 écoles abonnées.\nFinaliser le paywall et le module conformité.\nValider le modèle économique.', '1,25 % à 2,5 % des 800 écoles'], [1800, 3780, 3780], LGRAY),
          dataRow(['Moyen terme\n(1–3 ans)', 'Atteindre 100 écoles abonnées.\nLancer l\'application mobile parents.\nDévelopper un module ML supervisé de détection du décrochage.', '12,5 % du marché algérien'], [1800, 3780, 3780]),
          dataRow(['Long terme\n(3–5 ans)', 'Expansion régionale : Tunisie, Maroc, Sénégal.\nPartenariat avec le Ministère de l\'Éducation Nationale pour l\'orientation nationale.\n500+ écoles partenaires.', 'Leader régional EdTech Maghreb'], [1800, 3780, 3780], LGRAY),
        ]
      }),

      spacer(),
      heading2('5. Calendrier de réalisation du projet'),
      spacer(),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3360, 840, 840, 840, 840, 840, 840, 960],
        rows: [
          headerRow(['Tâche / Phase', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'Statut'], [3360, 840, 840, 840, 840, 840, 840, 960]),
          dataRow(['Phase 1–2 : Setup, Multi-tenant & Auth RBAC', '✓', '', '', '', '', '', 'Livré'], [3360, 840, 840, 840, 840, 840, 840, 960], LGRAY),
          dataRow(['Phase 3–6 : Élèves, Notes, Bulletins, Présences', '', '✓', '✓', '', '', '', 'Livré'], [3360, 840, 840, 840, 840, 840, 840, 960]),
          dataRow(['Phase 7–8 : Finance, Emploi du temps', '', '', '✓', '', '', '', 'Livré'], [3360, 840, 840, 840, 840, 840, 840, 960], LGRAY),
          dataRow(['Phase 9–10 : IA Risk Layer, Dashboard', '', '', '', '✓', '', '', 'Livré'], [3360, 840, 840, 840, 840, 840, 840, 960]),
          dataRow(['Phase 11 : Landing page & Déploiement production', '', '', '', '', '✓', '', 'Livré'], [3360, 840, 840, 840, 840, 840, 840, 960], LGRAY),
          dataRow(['Phase 12 : Module Rapport Scientifique d\'Orientation', '', '', '', '', '✓', '✓', 'Livré'], [3360, 840, 840, 840, 840, 840, 840, 960]),
          dataRow(['Phase 13–14 : Navigation unifiée & Conformité', '', '', '', '', '', '✓', 'Livré (partiel)'], [3360, 840, 840, 840, 840, 840, 840, 960], LGRAY),
          dataRow(['Phase 15 : Paywall & monétisation', '', '', '', '', '', '⌛', 'En cours'], [3360, 840, 840, 840, 840, 840, 840, 960]),
        ]
      }),

      pgBreak(),

      // ═══════════════════════════════════════════════
      // DEUXIÈME AXE
      // ═══════════════════════════════════════════════
      heading1('DEUXIÈME AXE : ASPECTS INNOVANTS'),
      spacer(),

      heading2('1. La nature des innovations'),
      spacer(),
      body('EDURA porte trois types d\'innovations combinées, ce qui constitue sa différenciation fondamentale sur le marché :'),
      spacer(),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 6560],
        rows: [
          headerRow(['Type d\'innovation', 'Description'], [2800, 6560]),
          dataRow(['Innovation de produit\n(rupture)', 'Le Rapport Scientifique d\'Orientation est un produit inexistant sur le marché algérien et, dans cette configuration intégrée, inexistant à l\'échelle mondiale. Aucune plateforme de gestion scolaire ne produit un rapport d\'orientation basé sur la théorie des intelligences multiples de Gardner à partir des données académiques quotidiennes.'], [2800, 6560], LGRAY),
          dataRow(['Innovation de processus', 'L\'automatisation complète du cycle de gestion scolaire (notes → bulletins → alertes → orientation) dans un seul workflow numérique est une innovation de processus majeure pour le secteur algérien, encore dominé par des procédures manuelles fragmentées.'], [2800, 6560]),
          dataRow(['Innovation technologique', 'Architecture IA hybride inédite : combinaison de systèmes experts symboliques (GOFAI) fondés sur la recherche en sciences de l\'éducation + LLM génératif (Anthropic Claude Haiku) pour la production de résumés en langage naturel. Déployée sur une infrastructure multi-tenant à isolation RLS PostgreSQL.'], [2800, 6560], LGRAY),
          dataRow(['Innovation de modèle d\'affaires', 'Premier SaaS cloud natif à prix fixe annuel (200 000 DZD tout inclus) pour les écoles privées algériennes, sans coût d\'infrastructure local, sans technicien informatique requis, avec mise à jour automatique continue.'], [2800, 6560]),
        ]
      }),

      spacer(),
      heading2('2. Les domaines d\'innovation'),
      spacer(),
      body('Les innovations d\'EDURA couvrent quatre domaines distincts :'),
      spacer(),

      bullet('Nouveaux processus : EDURA remplace 10+ outils manuels fragmentés par un workflow numérique unifié. La détection du décrochage scolaire, autrefois impossible à l\'échelle d\'une école, devient un processus automatique nocturne traitant des milliers de points de données.'),
      spacer(0),
      bullet('Nouvelles fonctionnalités : le Rapport Scientifique d\'Orientation apporte une fonctionnalité inédite — l\'opérationnalisation de la théorie des intelligences multiples de Gardner à partir de données scolaires standards, pour produire une prédiction de filière BAC et des recommandations personnalisées de carrière. C\'est la première fois en Algérie qu\'une telle approche est intégrée à un système de gestion scolaire.'),
      spacer(0),
      bullet('Nouveaux clients : EDURA cible un segment qui n\'était servi par aucun logiciel SaaS cloud adapté — les directeurs d\'écoles privées algériennes francophones et arabophones, qui n\'avaient d\'autre choix que des logiciels Windows obsolètes ou des solutions internationales inadaptées.'),
      spacer(0),
      bullet('Nouveaux modèles : le modèle d\'abonnement annuel à prix fixe, sans installation, sans maintenance, avec CI/CD automatique (déploiement continu via Git/Vercel), est un modèle économique inexistant dans ce secteur en Algérie. Il transforme un investissement informatique incertain en une charge d\'exploitation prévisible et maîtrisée.'),

      pgBreak(),

      // ═══════════════════════════════════════════════
      // TROISIÈME AXE
      // ═══════════════════════════════════════════════
      heading1('TROISIÈME AXE : ANALYSE STRATÉGIQUE DU MARCHÉ'),
      spacer(),

      heading2('1. Le segment du marché'),
      spacer(),

      heading3('Marché potentiel'),
      body('Le marché potentiel d\'EDURA est constitué de l\'ensemble des établissements d\'enseignement privés algériens, soit plus de 800 écoles actives sur le territoire national. Ces établissements sont concentrés principalement dans les wilayas d\'Alger, Oran, Constantine, Sétif et Annaba. Ils accueillent entre 150 et 400 élèves en moyenne, emploient 15 à 40 personnes, et facturent entre 200 000 et 600 000 DZD de frais de scolarité par élève et par an. Ce marché génère collectivement plusieurs dizaines de milliards de dinars de chiffre d\'affaires annuel.'),
      body('Par extension, le marché potentiel à moyen terme inclut les établissements privés de Tunisie (~500 écoles) et du Maroc (~1 200 établissements privés), avec qui l\'Algérie partage la dualité linguistique français/arabe et des structures éducatives comparables.'),
      spacer(),

      heading3('Marché cible (segment prioritaire)'),
      body('Le segment prioritaire est constitué des écoles privées de taille moyenne (200 à 400 élèves) situées dans les wilayas d\'Oran, d\'Alger et de Constantine. Ces établissements présentent un profil optimal : budget suffisant pour un abonnement de 200 000 DZD/an, équipe dirigeante sensibilisée aux enjeux numériques, et besoin pressant d\'un outil de gestion face à la pression réglementaire croissante.'),
      body('Ce segment a été choisi pour trois raisons : (1) sa prédisposition à l\'adoption numérique, (2) la concentration géographique qui facilite le démarchage commercial et le support de proximité, et (3) la présence de directeurs qui constituent des prescripteurs actifs auprès de leurs pairs dans un réseau professionnel dense.'),
      body('La possibilité de conclure des contrats-cadres avec des réseaux d\'écoles privées (groupes gérant plusieurs établissements) est également envisagée à partir de l\'année 2.'),
      spacer(),

      heading2('2. Mesure de l\'intensité de la concurrence'),
      spacer(),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2000, 1800, 2780, 2780],
        rows: [
          headerRow(['Concurrent', 'Type', 'Forces', 'Faiblesses pour l\'Algérie'], [2000, 1800, 2780, 2780]),
          dataRow(['PowerSchool (USA)', 'Direct', 'Leader mondial, écosystème mature, analytics avancé', 'Tarif > 2 000 $/an, pas de support arabe, non conforme au cahier des charges algérien'], [2000, 1800, 2780, 2780], LGRAY),
          dataRow(['Pronote (France)', 'Direct', 'Référence en France, interface familière aux directeurs algériens formés en France', 'Architecture client-serveur (serveur local), pas disponible en arabe, tarif inadapté aux petites écoles'], [2000, 1800, 2780, 2780]),
          dataRow(['Logiciels locaux Windows', 'Direct', 'Prix bas, parfois adapté au curriculum algérien', 'Pas de cloud, pas de sauvegarde, pas de mise à jour, zéro IA, maintenance impossible'], [2000, 1800, 2780, 2780], LGRAY),
          dataRow(['Excel + WhatsApp', 'Indirect', 'Gratuit, connu de tous', 'Fragmentation totale, erreurs fréquentes, aucune sécurité, aucune intelligence'], [2000, 1800, 2780, 2780]),
          dataRow(['EDURA (nous)', '—', 'SaaS cloud bilingue FR/AR, IA intégrée, conforme cahier des charges, prix accessible, Rapport d\'Orientation unique', '—'], [2000, 1800, 2780, 2780], LGRAY),
        ]
      }),
      spacer(),
      body('Avantages concurrentiels distinctifs d\'EDURA : (1) seule solution bilingue FR/AR native, (2) seule solution intégrant la conformité au cahier des charges algérien 2026, (3) seule solution proposant un rapport d\'orientation scientifique basé sur Gardner, (4) prix le plus bas du segment SaaS cloud, (5) aucune installation requise.'),

      spacer(),
      heading2('3. La stratégie marketing'),
      spacer(),
      body('La stratégie commerciale d\'EDURA s\'articule autour de quatre leviers complémentaires :'),
      spacer(),

      bullet('Marketing digital : présence active sur LinkedIn et Facebook (réseaux utilisés par les directeurs d\'écoles privées algériennes), contenu éducatif sur la conformité réglementaire et l\'orientation scolaire, SEO ciblé sur des requêtes comme « logiciel gestion école privée Algérie ».'),
      spacer(0),
      bullet('Démonstrations terrain : visites dans les écoles pilotes des wilayas d\'Oran, d\'Alger et de Constantine pour présenter la plateforme en conditions réelles. La période d\'essai gratuit de 30 jours sans carte bancaire réduit au maximum la friction à l\'adoption.'),
      spacer(0),
      bullet('Effet réseau (bouche-à-oreille) : le Rapport Scientifique d\'Orientation est conçu pour être un argument de valeur que le directeur présente aux parents. Un parent qui reçoit ce rapport en parle à d\'autres parents — et les directeurs d\'autres écoles en entendent parler lors des réunions professionnelles.'),
      spacer(0),
      bullet('Partenariat avec les incubateurs universitaires : la participation au dispositif AM 1275 constitue elle-même un premier canal de crédibilité institutionnelle, ouvrant la voie à des partenariats avec des structures de financement et d\'accompagnement (ANSEJ, CNAC, incubateurs universitaires).'),
      spacer(),
      body('La stratégie de prix retenue — abonnement annuel fixe de 200 000 DZD, tout inclus — est délibérément simple et transparente. Elle évite la confusion des tarifications par module ou par utilisateur, facilite la décision d\'achat, et permet au directeur de calculer immédiatement son ROI.'),

      pgBreak(),

      // ═══════════════════════════════════════════════
      // QUATRIÈME AXE
      // ═══════════════════════════════════════════════
      heading1('QUATRIÈME AXE : PLAN DE PRODUCTION ET D\'ORGANISATION'),
      spacer(),

      heading2('1. Le processus de production (service numérique)'),
      spacer(),
      body('EDURA est une plateforme numérique (application web SaaS). Son processus de production ne passe pas par une fabrication physique mais par les étapes suivantes :'),
      spacer(),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [600, 3000, 5760],
        rows: [
          headerRow(['N°', 'Étape', 'Description'], [600, 3000, 5760]),
          dataRow(['1', 'Développement logiciel', 'Conception, codage et test des fonctionnalités. Stack : Next.js, TypeScript, PostgreSQL, Prisma ORM, Supabase Auth, @react-pdf/renderer, SheetJS.'], [600, 3000, 5760], LGRAY),
          dataRow(['2', 'Déploiement & CI/CD', 'Chaque mise à jour est déployée automatiquement via GitHub → Vercel en ~90 secondes. Aucune interruption de service pour les utilisateurs.'], [600, 3000, 5760]),
          dataRow(['3', 'Provisionnement client', 'À l\'inscription, création automatique du tenant (école), de l\'utilisateur Directeur, de l\'année académique courante. L\'école est opérationnelle en 60 secondes.'], [600, 3000, 5760], LGRAY),
          dataRow(['4', 'Exécution IA nocturne', 'Cron job Vercel exécuté chaque nuit à 02h00 (heure algérienne) pour recalculer les scores de risque de décrochage de tous les élèves actifs.'], [600, 3000, 5760]),
          dataRow(['5', 'Génération PDF', 'Bulletins et Rapports Scientifiques d\'Orientation générés à la demande côté serveur, en < 2 secondes, et téléchargés directement par l\'utilisateur.'], [600, 3000, 5760], LGRAY),
          dataRow(['6', 'Support & maintenance', 'Surveillance des logs (Vercel), réponse aux incidents, corrections de bugs via le pipeline CI/CD, mises à jour fonctionnelles régulières.'], [600, 3000, 5760]),
        ]
      }),
      spacer(),
      body('Architecture technique : l\'application est structurée autour d\'une base de données PostgreSQL unique avec politiques Row-Level Security garantissant l\'isolation stricte des données entre établissements. L\'API est exposée via les routes Next.js App Router (Server Actions). L\'IA hybride combine un système expert à règles pondérées (12 facteurs analysés par élève) et l\'API Anthropic Claude Haiku pour les résumés en langage naturel.'),

      spacer(),
      heading2('2. L\'approvisionnement'),
      spacer(),
      body('EDURA est un service logiciel ; ses « matières premières » sont des services cloud et des API. Voici la politique d\'approvisionnement :'),
      spacer(),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2500, 3000, 2360, 1500],
        rows: [
          headerRow(['Fournisseur', 'Service fourni', 'Coût estimé', 'Criticité'], [2500, 3000, 2360, 1500]),
          dataRow(['Vercel Inc. (USA)', 'Hébergement web, CI/CD, Edge Functions, Cron Jobs', '~20 $/mois (Pro)', 'Critique'], [2500, 3000, 2360, 1500], LGRAY),
          dataRow(['Supabase Inc. (USA)', 'Base de données PostgreSQL managée, authentification JWT', '~25 $/mois (Pro)', 'Critique'], [2500, 3000, 2360, 1500]),
          dataRow(['Anthropic PBC (USA)', 'API Claude Haiku — résumés IA en langage naturel', '~0,0003 $/appel', 'Important'], [2500, 3000, 2360, 1500], LGRAY),
          dataRow(['GitHub (Microsoft)', 'Versioning du code source, déclencheur CI/CD', 'Gratuit (Free tier)', 'Important'], [2500, 3000, 2360, 1500]),
          dataRow(['Registrar de domaine', 'Domaine edura.dz ou edura-app.com', '~1 500 DZD/an', 'Standard'], [2500, 3000, 2360, 1500], LGRAY),
        ]
      }),
      spacer(),
      body('Politique de paiement : les fournisseurs cloud opèrent sur facturation mensuelle en devise étrangère (USD). Un mécanisme de fallback est intégré pour les fonctionnalités dépendant de l\'API Anthropic : si la clé API est absente, un générateur de texte par templates prend le relais, garantissant la continuité du service.'),

      spacer(),
      heading2('3. La main d\'œuvre'),
      spacer(),
      body('Phase initiale (MVP — situation actuelle) :'),
      bullet('1 développeuse full-stack / fondatrice (Amina Kaouter Ghezal) — tous les aspects techniques, produit et commerciaux'),
      spacer(0),
      body('Phase de croissance (dès 20 écoles abonnées) :'),
      bullet('1 développeur(se) backend junior — maintenance, nouvelles fonctionnalités'),
      bullet('1 chargé(e) de développement commercial — prospection, démonstrations terrain'),
      bullet('1 responsable support client — onboarding, formation des directeurs'),
      spacer(0),
      body('Phase de scale (dès 100 écoles) :'),
      bullet('Équipe technique élargie (2 développeurs full-stack, 1 data scientist pour le module ML)'),
      bullet('Équipe commerciale régionale (Alger, Oran, Constantine)'),
      bullet('Directeur(trice) produit'),
      spacer(),
      body('Le projet peut créer à terme une dizaine d\'emplois directs qualifiés (ingénieurs, commerciaux, support) et indirectement contribuer à la digitalisation d\'un secteur qui emploie des dizaines de milliers d\'enseignants et d\'administratifs.'),

      spacer(),
      heading2('4. Les principaux partenaires'),
      spacer(),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 3280, 3280],
        rows: [
          headerRow(['Partenaire', 'Nature du partenariat', 'Valeur apportée'], [2800, 3280, 3280]),
          dataRow(['USTO-MB — Incubateur universitaire', 'Accompagnement académique, cadre AM 1275, validation institutionnelle', 'Crédibilité, mentoring, accès au réseau universitaire'], [2800, 3280, 3280], LGRAY),
          dataRow(['Écoles privées pilotes (Oran)', 'Test en conditions réelles, feedback terrain, témoignages', 'Validation produit-marché, ajustement des fonctionnalités'], [2800, 3280, 3280]),
          dataRow(['Vercel & Supabase', 'Infrastructure cloud, support technique startup', 'Programmes startup (crédits gratuits), fiabilité infrastructure'], [2800, 3280, 3280], LGRAY),
          dataRow(['Ministère de l\'Éducation Nationale', 'Partenariat institutionnel envisagé (moyen terme)', 'Légitimité, accès aux données officielles du curriculum algérien, extension au secteur public'], [2800, 3280, 3280]),
          dataRow(['Structures de financement (ANSEJ, CNAC)', 'Financement d\'amorçage post-incubation', 'Capital pour recruter et commercialiser'], [2800, 3280, 3280], LGRAY),
        ]
      }),

      pgBreak(),

      // ═══════════════════════════════════════════════
      // CINQUIÈME AXE
      // ═══════════════════════════════════════════════
      heading1('CINQUIÈME AXE : PLAN FINANCIER'),
      spacer(),

      heading2('1. Les coûts et charges'),
      spacer(),
      body('EDURA est un service logiciel à faibles charges fixes. Les coûts d\'infrastructure sont marginaux comparativement aux revenus générés dès les premières souscriptions :'),
      spacer(),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4000, 2180, 3180],
        rows: [
          headerRow(['Poste de charge', 'Coût mensuel (DZD)', 'Coût annuel (DZD)'], [4000, 2180, 3180]),
          dataRow(['Hébergement Vercel Pro (~20 $/mois)', '2 700', '32 400'], [4000, 2180, 3180], LGRAY),
          dataRow(['Base de données Supabase Pro (~25 $/mois)', '3 375', '40 500'], [4000, 2180, 3180]),
          dataRow(['API Anthropic Claude Haiku (usage estimé)', '1 000', '12 000'], [4000, 2180, 3180], LGRAY),
          dataRow(['Domaine web + certificat SSL', '125', '1 500'], [4000, 2180, 3180]),
          dataRow(['Outils divers (GitHub Pro, monitoring)', '500', '6 000'], [4000, 2180, 3180], LGRAY),
          headerRow(['TOTAL CHARGES FIXES', '~7 700 DZD/mois', '~92 400 DZD/an'], [4000, 2180, 3180]),
        ]
      }),
      spacer(),
      body('Ces charges très basses sont l\'un des atouts majeurs du modèle économique : le point mort est atteint dès la première école abonnée (200 000 DZD > 92 400 DZD de charges annuelles). La marge brute est de plus de 95 %.'),
      body('Mode de financement initial : autofinancement (développement réalisé sans coût en capital grâce au tier gratuit des services cloud pour la phase de développement). Financement de croissance envisagé via ANSEJ ou incubateur post-soutenance.'),

      spacer(),
      heading2('2. Le chiffre d\'affaires prévisionnel'),
      spacer(),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2500, 2286, 2286, 2288],
        rows: [
          headerRow(['Scénario', 'Année 1', 'Année 2', 'Année 3'], [2500, 2286, 2286, 2288]),
          dataRow(['Pessimiste\n(nombre d\'écoles)', '5 écoles', '15 écoles', '40 écoles'], [2500, 2286, 2286, 2288], LGRAY),
          dataRow(['Chiffre d\'affaires pessimiste', '1 000 000 DZD', '3 000 000 DZD', '8 000 000 DZD'], [2500, 2286, 2286, 2288]),
          dataRow(['Optimiste\n(nombre d\'écoles)', '20 écoles', '60 écoles', '150 écoles'], [2500, 2286, 2286, 2288], LGRAY),
          dataRow(['Chiffre d\'affaires optimiste', '4 000 000 DZD', '12 000 000 DZD', '30 000 000 DZD'], [2500, 2286, 2286, 2288]),
        ]
      }),
      spacer(),
      body('Prix de vente unitaire : 200 000 DZD / école / an (abonnement annuel, tout inclus, sans frais cachés). Le scénario de base retenu pour la planification est le scénario pessimiste — prudent et facilement atteignable compte tenu du réseau de directeurs déjà identifiés dans la région d\'Oran.'),

      spacer(),
      heading2('3. Comptes de résultats escomptés'),
      spacer(),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3600, 1920, 1920, 1920],
        rows: [
          headerRow(['Poste', 'Année 1 (pessimiste)', 'Année 2', 'Année 3'], [3600, 1920, 1920, 1920]),
          dataRow(['(+) Chiffre d\'affaires', '1 000 000', '3 000 000', '8 000 000'], [3600, 1920, 1920, 1920], LGRAY),
          dataRow(['(–) Charges fixes (infrastructure)', '92 400', '120 000', '180 000'], [3600, 1920, 1920, 1920]),
          dataRow(['(–) Charges variables (marketing, déplacements)', '150 000', '400 000', '800 000'], [3600, 1920, 1920, 1920], LGRAY),
          dataRow(['(–) Charges de personnel (recrutement)', '0', '2 400 000', '4 800 000'], [3600, 1920, 1920, 1920]),
          headerRow(['(=) Résultat net estimé (DZD)', '757 600', '80 000', '2 220 000'], [3600, 1920, 1920, 1920]),
        ]
      }),
      spacer(),
      body('Besoin en fonds de roulement (BFR) : faible, car le modèle d\'abonnement annuel prépayé génère une trésorerie positive dès la signature du contrat. Il n\'y a ni stock physique, ni délai de fabrication, ni créances clients significatives.'),

      spacer(),
      heading2('4. Le plan de trésorerie — Année 1 (scénario pessimiste : 5 écoles)'),
      spacer(),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2000, 760, 760, 760, 760, 760, 760, 760, 760, 760, 760, 760, 760],
        rows: [
          headerRow(['Poste', 'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'], [2000, 760, 760, 760, 760, 760, 760, 760, 760, 760, 760, 760, 760]),
          dataRow(['Recettes (DZD k)', '200', '200', '200', '0', '0', '200', '0', '0', '200', '0', '0', '200'], [2000, 760, 760, 760, 760, 760, 760, 760, 760, 760, 760, 760, 760], LGRAY),
          dataRow(['Dépenses (DZD k)', '20', '20', '20', '35', '20', '20', '20', '35', '20', '20', '20', '20'], [2000, 760, 760, 760, 760, 760, 760, 760, 760, 760, 760, 760, 760]),
          dataRow(['Solde mensuel (k)', '+180', '+180', '+180', '-35', '-20', '+180', '-20', '-35', '+180', '-20', '-20', '+180'], [2000, 760, 760, 760, 760, 760, 760, 760, 760, 760, 760, 760, 760], LGRAY),
        ]
      }),
      spacer(),
      body('Note : les recettes sont concentrées au moment du renouvellement des abonnements (début d\'année scolaire : septembre/octobre, et renouvellements en cours d\'année). Les dépenses restent stables et prévisibles. La trésorerie reste positive tout au long de l\'année.'),

      pgBreak(),

      // ═══════════════════════════════════════════════
      // SIXIÈME AXE
      // ═══════════════════════════════════════════════
      heading1('SIXIÈME AXE : PROTOTYPE EXPÉRIMENTAL'),
      spacer(),

      body('Le prototype d\'EDURA est une application web complète déployée en production, accessible publiquement. Il ne s\'agit pas d\'une maquette ni d\'un prototype partiel, mais d\'un MVP (Minimum Viable Product) fonctionnel, utilisable par une école réelle dès aujourd\'hui.'),
      spacer(),

      heading2('Accès au prototype'),
      spacer(),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3000, 6360],
        rows: [
          dataRow(['Application live (production)', 'https://edura-aminaghezal.vercel.app'], [3000, 6360], LGRAY),
          dataRow(['Code source (GitHub)', 'https://github.com/aminaghezal/edura'], [3000, 6360]),
          dataRow(['Stack technique', 'Next.js 16 · TypeScript · PostgreSQL · Supabase · Prisma · Vercel'], [3000, 6360], LGRAY),
          dataRow(['Lignes de code', '~8 500 lignes TypeScript/TSX'], [3000, 6360]),
          dataRow(['Modules opérationnels', '13 modules déployés (12 complets + 1 partiel)'], [3000, 6360], LGRAY),
          dataRow(['Tables de base de données', '24 tables, 7 migrations Prisma versionnées'], [3000, 6360]),
          dataRow(['Temps de chargement', 'Time-to-Interactive < 2 secondes (mesuré Lighthouse)'], [3000, 6360], LGRAY),
          dataRow(['Génération PDF', '< 2 secondes (bulletin) / < 3 secondes (rapport scientifique)'], [3000, 6360]),
        ]
      }),
      spacer(),

      heading2('Étapes de réalisation du prototype'),
      spacer(),
      body('Le prototype a été développé en 15 phases itératives sur 6 mois :'),
      spacer(),
      bullet('Phase 1 : Setup Next.js 16 App Router + intégration Supabase Auth + architecture multi-tenant (schéma PostgreSQL avec RLS)'),
      bullet('Phase 2 : Système d\'authentification RBAC (3 rôles : Directeur, Secrétaire, Professeur) + middleware de sécurité'),
      bullet('Phases 3–8 : 8 modules core (Élèves, Notes, Bulletins PDF, Présences, Emploi du temps, Finance, Dashboard, Paramètres)'),
      bullet('Phase 9 : Couche IA — moteur de scoring de risque de décrochage (système expert 12 facteurs + cron nocturne)'),
      bullet('Phase 10 : Landing page marketing + système de thèmes clair/sombre'),
      bullet('Phase 11 : Déploiement production sur Vercel avec CI/CD automatique via GitHub'),
      bullet('Phase 12 : Module Rapport Scientifique d\'Orientation — algorithme intelligences multiples Gardner + prédiction filière BAC + export PDF officiel A4'),
      bullet('Phase 13 : Navigation unifiée + module conformité réglementaire (partiel)'),
      spacer(),

      heading2('Fonctionnalités démontrables'),
      spacer(),
      body('Les fonctionnalités suivantes peuvent être démontrées en direct lors de la soutenance :'),
      spacer(),
      bullet('Inscription d\'une école en 60 secondes et accès immédiat au tableau de bord'),
      bullet('Import d\'une liste d\'élèves depuis un fichier Excel bilingue FR/AR'),
      bullet('Saisie des notes et génération automatique d\'un bulletin PDF officiel en < 2 secondes'),
      bullet('Calcul du score de risque de décrochage pour un élève avec affichage des facteurs déclencheurs'),
      bullet('Génération d\'un Rapport Scientifique d\'Orientation individuel complet avec profil des intelligences multiples, prédiction de filière BAC et recommandations de carrière'),
      bullet('Démonstration de l\'isolation multi-tenant (deux comptes distincts ne voient pas les données l\'un de l\'autre)'),
      bullet('Résumé hebdomadaire généré par l\'IA (Claude Haiku) sur le tableau de bord directeur'),

      pgBreak(),

      // ═══════════════════════════════════════════════
      // ANNEXES
      // ═══════════════════════════════════════════════
      heading1('ANNEXES'),
      spacer(),

      heading2('Annexe 1 — Budget STARTUP (investissement initial)'),
      spacer(),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4500, 2430, 2430],
        rows: [
          headerRow(['Poste d\'investissement', 'Coût estimé (DZD)', 'Remarque'], [4500, 2430, 2430]),
          dataRow(['Développement logiciel (déjà réalisé)', '0 (apport en industrie)', 'Réalisé par la fondatrice'], [4500, 2430, 2430], LGRAY),
          dataRow(['Infrastructure cloud — 1ère année', '92 400', 'Vercel Pro + Supabase Pro + API'], [4500, 2430, 2430]),
          dataRow(['Nom de domaine + SSL', '1 500', 'Annuel'], [4500, 2430, 2430], LGRAY),
          dataRow(['Outils de productivité & design', '30 000', 'Figma, Canva Pro, outils marketing'], [4500, 2430, 2430]),
          dataRow(['Communication & marketing initial', '150 000', 'Réseaux sociaux, démarchage terrain'], [4500, 2430, 2430], LGRAY),
          dataRow(['Frais juridiques (statut entreprise)', '50 000', 'Constitution SARL / EURL'], [4500, 2430, 2430]),
          dataRow(['Fonds de roulement (6 mois)', '100 000', 'Réserve de trésorerie'], [4500, 2430, 2430], LGRAY),
          headerRow(['TOTAL INVESTISSEMENT INITIAL', '423 900 DZD', '~2 825 USD'], [4500, 2430, 2430]),
        ]
      }),

      spacer(2),
      heading2('Annexe 2 — Comptes de résultats escomptés (3 ans)'),
      spacer(),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3600, 1920, 1920, 1920],
        rows: [
          headerRow(['Éléments (en milliers DZD)', 'Année 1', 'Année 2', 'Année 3'], [3600, 1920, 1920, 1920]),
          dataRow(['Chiffre d\'affaires (pessimiste)', '1 000', '3 000', '8 000'], [3600, 1920, 1920, 1920], LGRAY),
          dataRow(['Charges variables (marketing)', '150', '400', '800'], [3600, 1920, 1920, 1920]),
          dataRow(['Charges fixes (infrastructure)', '92', '120', '180'], [3600, 1920, 1920, 1920], LGRAY),
          dataRow(['Charges personnel', '0', '2 400', '4 800'], [3600, 1920, 1920, 1920]),
          dataRow(['Charges diverses', '30', '80', '150'], [3600, 1920, 1920, 1920], LGRAY),
          headerRow(['Résultat net (DZD k)', '728', '0', '2 070'], [3600, 1920, 1920, 1920]),
          headerRow(['Marge nette', '72,8 %', '0 %', '25,9 %'], [3600, 1920, 1920, 1920]),
        ]
      }),
      spacer(),
      body('Note : l\'année 2 présente un résultat proche de zéro car c\'est l\'année d\'investissement fort (recrutement, marketing intensif). À partir de l\'année 3, le modèle devient pleinement rentable et scalable.'),

      spacer(2),
      heading2('Annexe 3 — Modèle d\'affaires (Business Model Canvas)'),
      spacer(),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1870, 1870, 1870, 1870, 1880],
        rows: [
          headerRow(['Partenaires clés', 'Activités clés', 'Proposition de valeur', 'Relations clients', 'Segments clients'], [1870, 1870, 1870, 1870, 1880]),
          dataRow([
            'USTO-MB\nVercel\nSupabase\nAnthropic\nÉcoles pilotes\nANSEJ / CNAC',
            'Développement logiciel\nDéploiement CI/CD\nSupport client\nÉvolution IA\nCommercialisation',
            'Gestion scolaire tout-en-un\nBilingue FR/AR natif\nConformité cahier charges\nIA détection décrochage\nRapport Orientation Gardner\nPrix accessible',
            'Self-service\nEssai 30j gratuit\nSupport email/chat\nFormation onboarding\nDocumentation',
            'Écoles privées algériennes\n(200-400 élèves)\nVilles : Alger, Oran, Constantine\nDirecteurs 30-55 ans'
          ], [1870, 1870, 1870, 1870, 1880], LGRAY),
          headerRow(['Ressources clés', '', 'Canaux', 'Structure des coûts', 'Sources de revenus'], [1870, 1870, 1870, 1870, 1880]),
          dataRow([
            'Code source\nInfrastructure cloud\nAlgorithme IA\nBase connaissances Gardner',
            '',
            'Site web (landing page)\nDémonstrations terrain\nLinkedIn / Facebook\nBouche à oreille',
            'Infrastructure cloud fixe\nAPI IA variable\nMarketing & ventes\nPersonnel (à partir Y2)',
            'Abonnement annuel\n200 000 DZD/école/an\nModèle récurrent prévisible\nRatio LTV/CAC élevé'
          ], [1870, 1870, 1870, 1870, 1880]),
        ]
      }),

      spacer(2),
      new Paragraph({
        children: [new TextRun({ text: '──────────────────────────────────────────────────────────', color: GOLD })],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Document préparé par Amina Kaouter Ghezal — USTO-MB — Année universitaire 2025/2026', size: 18, color: MUTED, italic: true, font: 'Calibri' })],
        alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Application déployée : edura-aminaghezal.vercel.app  |  Code source : github.com/aminaghezal/edura', size: 18, color: BLUE, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
      }),
    ]
  }]
});

// ── write file ───────────────────────────────────────────────────
Packer.toBuffer(doc).then(buffer => {
  const outPath = 'C:\\Users\\Hamada Salim G Trd\\Desktop\\edura\\EDURA_Dossier_Startup_AM1275.docx';
  fs.writeFileSync(outPath, buffer);
  console.log('✅ Document created: ' + outPath);
}).catch(err => {
  console.error('❌ Error:', err.message);
});
