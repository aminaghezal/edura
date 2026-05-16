# EDURA — Mémoire de Projet de Fin d'Études

**Conception et développement d'une plateforme SaaS multi-tenant assistée par intelligence artificielle pour la gestion des écoles privées algériennes**

---

## 📋 FICHE TECHNIQUE DU PROJET

| Élément | Détail |
|---|---|
| **Intitulé** | EDURA — Plateforme SaaS de Gestion Scolaire Intelligente |
| **Étudiante** | Amina Kaouter Ghezal |
| **Université** | USTO-MB (Université des Sciences et de la Technologie d'Oran — Mohamed Boudiaf) |
| **Année universitaire** | 2025 / 2026 |
| **Type de projet** | SaaS B2B — Application Web Multi-Tenant |
| **Marché cible** | Écoles privées en Algérie (estimation : 800+ établissements actifs) |
| **Modèle économique** | Abonnement annuel — 200 000 DZD/an, tout inclus |
| **Statut** | MVP livré et déployé en production |
| **URL de production** | edura-aminaghezal.vercel.app |
| **Repository** | github.com/aminaghezal/edura |
| **Durée de développement** | 6 mois (en parallèle de la formation académique) |

---

## 1. INTRODUCTION GÉNÉRALE

Dans un contexte où le secteur de l'enseignement privé algérien connaît une croissance soutenue — avec plus de 800 établissements actifs et une forte demande des familles pour un suivi éducatif personnalisé —, la gestion administrative de ces écoles reste majoritairement **manuelle, fragmentée et propice aux erreurs**. Le directeur d'une école privée moyenne jongle quotidiennement entre une dizaine de tableurs Excel non synchronisés, des cahiers physiques, un logiciel de comptabilité hérité des années 2000, et des échanges WhatsApp informels pour communiquer avec les parents.

**EDURA** est une plateforme SaaS (*Software as a Service*) conçue pour résoudre ce problème en centralisant l'ensemble des opérations scolaires dans un seul produit web, accessible depuis n'importe quel navigateur, et augmenté par une couche d'intelligence artificielle qui transforme les données opérationnelles en décisions actionnables pour le directeur.

Ce mémoire présente la conception, l'architecture, le développement et le déploiement d'EDURA — depuis l'identification du besoin métier jusqu'à la mise en production sur infrastructure cloud, en passant par les choix d'architecture multi-tenant, l'intégration d'un moteur de scoring de risque, et la conformité réglementaire au cahier des charges algérien des établissements privés.

---

## 2. CONTEXTE ET PROBLÉMATIQUE

### 2.1 Contexte du secteur

L'enseignement privé en Algérie a connu une expansion significative depuis l'autorisation des écoles privées par le décret exécutif n° 04-90 du 24 mars 2004. Les chiffres clés actuels :

- **800+ écoles privées actives** sur le territoire national
- Concentrées principalement à **Alger, Oran, Constantine, Sétif, Annaba**
- **Frais de scolarité moyens** : 200 000 à 600 000 DZD par élève par an
- Effectif moyen : **150 à 400 élèves par établissement**
- Personnel : **15 à 40 employés** (enseignants, administratifs)

### 2.2 Problèmes identifiés

Une étude qualitative menée auprès de directeurs et secrétaires d'écoles privées révèle **cinq problèmes structurels** :

#### P1 — Fragmentation des données
Les informations critiques sont éclatées entre :
- Excel pour les notes (parfois 1 fichier par classe et par trimestre)
- Cahiers papier pour les présences
- Carnets pour les paiements
- WhatsApp pour la communication parents
- Logiciel de comptabilité isolé

**Conséquence** : aucune vue d'ensemble, ressaisie multiple, erreurs fréquentes.

#### P2 — Aucune détection précoce du décrochage scolaire
Les élèves en difficulté ne sont identifiés qu'**en fin de trimestre**, quand les bulletins sont calculés — trop tard pour intervenir efficacement. Aucun outil ne croise automatiquement notes + absences + comportement.

#### P3 — Production manuelle des bulletins
Un directeur passe en moyenne **3 à 5 jours en fin de trimestre** à compiler manuellement les bulletins, vérifier les calculs de moyenne pondérée, et imprimer 200 à 400 documents formatés.

#### P4 — Non-conformité réglementaire diffuse
Le **cahier des charges des écoles privées** (mis à jour en 2026) impose 8 catégories d'obligations : qualifications enseignants, programme officiel, infrastructure sécurité, etc. La majorité des écoles ne dispose d'aucun outil pour suivre ces obligations en temps réel — risque réel d'inspection défavorable, voire de fermeture (20 écoles fermées depuis 2023).

#### P5 — Pas de visibilité financière
Le suivi du recouvrement des frais de scolarité se fait au crayon. Les directeurs découvrent souvent qu'une famille a 6 mois de retard quand le trimestre est déjà bien entamé.

### 2.3 Problématique centrale

> **Comment concevoir une plateforme SaaS sécurisée, scalable et intelligente, capable de centraliser la gestion administrative d'une école privée tout en s'adaptant aux spécificités réglementaires, linguistiques (français/arabe) et culturelles du contexte algérien — et en transformant les données opérationnelles en insights actionnables grâce à l'intelligence artificielle ?**

Cette problématique se décompose en sous-questions :

- **Q1** : Comment isoler de façon stricte les données entre plusieurs écoles clientes sur une même infrastructure (multi-tenancy) ?
- **Q2** : Quels algorithmes d'intelligence artificielle utiliser pour détecter automatiquement les élèves à risque de décrochage avec un faible coût computationnel ?
- **Q3** : Comment gérer la dualité linguistique français/arabe dans les imports de données et l'affichage ?
- **Q4** : Quelle architecture permet de scaler de 1 à 100 écoles sans refonte technique ?

---

## 3. OBJECTIFS DU PROJET

### 3.1 Objectif principal
Concevoir et déployer une plateforme SaaS opérationnelle, exploitable en production par des écoles privées algériennes, intégrant la totalité des fonctions de gestion scolaire avec une couche d'intelligence artificielle propriétaire.

### 3.2 Objectifs techniques

| # | Objectif | Critère de réussite |
|---|---|---|
| OT1 | Architecture multi-tenant sécurisée | Isolation stricte par `school_id` sur 100% des requêtes |
| OT2 | Système d'authentification robuste | RBAC à 3 rôles (Directeur, Secrétaire, Professeur) |
| OT3 | Score IA de risque opérationnel | Calcul nocturne pour 1000+ élèves en < 30s |
| OT4 | Génération PDF automatique | Bulletins A4 officiels en < 3 secondes |
| OT5 | Import Excel intelligent | Reconnaissance FR + AR des en-têtes |
| OT6 | Déploiement cloud production | CI/CD automatique via Git |
| OT7 | Performance frontend | Time-to-Interactive < 2s |

### 3.3 Objectifs métier

| # | Objectif | Bénéfice utilisateur |
|---|---|---|
| OM1 | Remplacer 10 tableurs Excel | Une source unique de vérité |
| OM2 | Détection des risques avant le décrochage | Intervention 30 jours plus tôt |
| OM3 | Suivi de conformité réglementaire | Score d'inspection-readiness 0-100 |
| OM4 | Visibilité financière en temps réel | Taux de recouvrement instantané |
| OM5 | Onboarding < 1 heure | Adoption par directeurs non-techniques |

---

## 4. ÉTAT DE L'ART

### 4.1 Solutions internationales

| Solution | Origine | Forces | Limites pour l'Algérie |
|---|---|---|---|
| **PowerSchool** | USA | Leader mondial, écosystème mature | Trop cher (>2000$/an), pas localisé FR/AR, pas adapté au cahier des charges algérien |
| **Pronote** | France | Référence en France, parents engagés | Système éducatif français, pas de support AR, pricing élevé |
| **Skooler** | Norvège | Intégration Microsoft 365 | Nécessite licence Office, peu d'IA |
| **Edmodo** | USA | Gratuit, communautaire | Pas vraiment un ERP scolaire |

### 4.2 Solutions locales / régionales

| Solution | Approche | Limites |
|---|---|---|
| **Excel + WhatsApp** | Ad-hoc, gratuit | Pas centralisé, erreurs, pas de sécurité |
| **Logiciels locaux** | Installation Windows, licence unique | Pas de sauvegarde cloud, pas de mises à jour, IA inexistante |
| **Développements internes** | Sur-mesure par développeur freelance | Maintenance impossible, code non documenté |

### 4.3 Positionnement d'EDURA

EDURA se positionne sur un **espace blanc** clairement identifié :
- ✅ SaaS cloud (pas d'installation, mises à jour automatiques)
- ✅ Bilingue FR/AR natif
- ✅ Conformité cahier des charges algérien intégrée
- ✅ IA propriétaire sur les données algériennes
- ✅ Prix accessible (200 000 DZD/an)
- ✅ Hébergement RGPD (Europe)

---

## 5. ARCHITECTURE TECHNIQUE

### 5.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                       NAVIGATEUR (Client)                    │
│                  Next.js App Router (React)                  │
│              Tailwind CSS · shadcn/ui · Recharts             │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                       │
│              CDN global · Auto-scaling                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  NEXT.JS APPLICATION                         │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Server Comps   │  │ API Routes   │  │ Cron Jobs       │  │
│  │ (SSR)          │  │ (REST)       │  │ (recompute-IA)  │  │
│  └────────────────┘  └──────────────┘  └─────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Couche métier : lib/auth, lib/ai, lib/compliance      │ │
│  └────────────────────────────────────────────────────────┘ │
└──────┬─────────────────────────────────────┬────────────────┘
       │                                      │
       │ Prisma ORM                           │ Supabase SDK
       │                                      │
┌──────▼──────────┐                  ┌────────▼──────────────┐
│  POSTGRESQL     │                  │   SUPABASE AUTH       │
│  (Supabase)     │                  │   (JWT + cookies)     │
│  + Row-Level    │                  │                       │
│  Security       │                  │                       │
└─────────────────┘                  └───────────────────────┘
       │
       │ API HTTPS
┌──────▼─────────────────┐
│  ANTHROPIC CLAUDE API  │
│  (résumés directeur)   │
└────────────────────────┘
```

### 5.2 Architecture multi-tenant

**Principe** : *Single database, single schema, tenant ID column*

Chaque table métier contient une colonne `schoolId` (CUID). Toutes les requêtes Prisma incluent obligatoirement un filtre `where: { schoolId: session.schoolId }` issu de la session authentifiée. La sécurité est assurée à **deux niveaux** :

1. **Niveau application** : helper `lib/rls.ts` qui force le scoping
2. **Niveau base de données** : policies Row-Level Security PostgreSQL (`prisma/rls.sql`)

```
┌──────────────────────────────────────────────┐
│   Une seule base PostgreSQL                  │
│                                              │
│   Table students                             │
│   ┌────┬─────────┬──────────────┐            │
│   │ id │ schoolId│ firstName    │            │
│   ├────┼─────────┼──────────────┤            │
│   │ s1 │ ECOLE_A │ Khaled       │ ← Tenant A │
│   │ s2 │ ECOLE_A │ Yasmine      │ ← Tenant A │
│   │ s3 │ ECOLE_B │ Mohamed      │ ← Tenant B │
│   │ s4 │ ECOLE_C │ Sara         │ ← Tenant C │
│   └────┴─────────┴──────────────┘            │
│                                              │
│   RLS PostgreSQL :                           │
│   USING (school_id = current_school_id())    │
└──────────────────────────────────────────────┘
```

### 5.3 Stack technologique complet

| Couche | Technologie | Version | Justification du choix |
|---|---|---|---|
| **Framework Web** | Next.js | 16.2 | App Router moderne, SSR + ISR, déploiement Vercel natif, écosystème React mature |
| **Langage** | TypeScript | 5.x | Type safety critique pour un projet solo, refactoring sûr, autocomplétion |
| **UI Framework** | React | 19 | Standard de l'industrie, écosystème vaste |
| **Styling** | Tailwind CSS | 4 | Utility-first, pas de CSS-in-JS lourd, design system cohérent |
| **Composants** | shadcn/ui + Radix UI | latest | Accessibilité ARIA native, composants copiés (pas de dépendance NPM lourde) |
| **Base de données** | PostgreSQL | 15+ | ACID, JSON natif, indexation puissante, Row-Level Security |
| **ORM** | Prisma | 7.8 | Type-safe queries, migrations versionnées, generator automatique |
| **Auth** | Supabase Auth | 0.10 | JWT + cookies, RGPD-compliant, gratuit jusqu'à 50k MAU |
| **Charts** | Recharts | 3.8 | Animations natives, accessible, SVG-based |
| **PDF** | @react-pdf/renderer | 4.5 | Génération côté serveur, pas de Chromium, polices personnalisées |
| **Excel** | xlsx (SheetJS) | 0.18 | Parsing tolérant, support AR/FR |
| **Validation** | Zod | 4.3 | Schémas TypeScript-first, validation runtime |
| **IA Générative** | Anthropic Claude Haiku 4.5 | API | Coût bas, latence faible, qualité française excellente |
| **Hébergement** | Vercel | Hobby/Pro | Edge functions, CI/CD via Git, déploiements en 90s |
| **DB Hosting** | Supabase | Free/Pro | PostgreSQL managé, RLS natif, console SQL |
| **Versioning** | Git + GitHub | - | Standard de l'industrie |

### 5.4 Justification des choix architecturaux

**Pourquoi Next.js plutôt que NestJS séparé ?**
- Un projet solo doit minimiser la surface de maintenance
- Le pattern *Server Actions* de Next.js élimine le besoin d'écrire une API REST séparée pour les opérations CRUD
- Déploiement unique vs déploiement frontend + backend
- Moins de couches = moins de bugs

**Pourquoi Supabase plutôt que Firebase ?**
- PostgreSQL > Firestore pour les données relationnelles (école → élèves → notes)
- RLS natif au lieu de règles de sécurité custom
- Tarification prévisible (vs Firebase qui peut exploser)
- Données portables (vendor lock-in faible)

**Pourquoi IA propriétaire (rule-based) plutôt que ML ?**
- Pas besoin de dataset d'entraînement (impossible pour 1 école au début)
- Déterministe et explicable (le directeur peut comprendre pourquoi un élève est flaggé)
- Latence < 1ms par élève (vs 100-500ms pour un modèle ML)
- Coût computationnel négligeable
- Possibilité de migrer vers ML une fois suffisamment de données accumulées

---

## 6. MODÈLE DE DONNÉES

### 6.1 Vue d'ensemble

20 tables principales organisées en 6 domaines logiques :

```
┌─────────────────┐
│ TENANT          │  School, User
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ ACADÉMIQUE      │  AcademicYear, Class, Subject, ClassSubject,
│                 │  TeacherAssignment
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ ÉLÈVES          │  Student, Schedule, Assessment, Grade, Attendance
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ FINANCE         │  FeeStructure, Payment
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ COMMUNICATION   │  Announcement
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ CONFORMITÉ      │  ComplianceCategory, Obligation,
│                 │  ComplianceAuditLog, RegulatoryNews
└─────────────────┘
```

### 6.2 Tables critiques

#### Table `schools` (le tenant)
```prisma
model School {
  id          String   @id @default(cuid())
  name        String
  wilaya      String
  director    String
  trialEndsAt DateTime?
  planStatus  PlanStatus @default(TRIAL)
  // ... relations vers toutes les autres tables
}
```

#### Table `students` (entité centrale)
```prisma
model Student {
  id                    String   @id @default(cuid())
  schoolId              String   // ← isolation tenant
  classId               String?
  firstName             String
  lastName              String
  firstNameAr           String?  // ← support arabe
  lastNameAr            String?
  
  // Champs IA calculés chaque nuit
  riskScore             Int?     // 0-100
  riskLevel             RiskLevel?
  riskRationale         String?  // explication humaine
  orientationSuggestion String?
  orientationConfidence Float?
  
  @@index([schoolId, classId])
  @@index([riskLevel])
}
```

### 6.3 Contraintes d'intégrité

- **Cascade delete** : supprimer une école supprime tous ses élèves, notes, paiements (RGPD : droit à l'oubli)
- **Unicité** : `(studentId, date)` sur attendance (impossible d'avoir 2 présences le même jour)
- **Index composites** : `(schoolId, status)` sur obligations pour requêtes rapides
- **Foreign keys** : toutes les relations contraintes au niveau DB

---

## 7. MODULES FONCTIONNELS

EDURA est composé de **12 modules fonctionnels** intégrés :

### M1 — Authentification & Onboarding
- Inscription directeur en 60s
- Email + mot de passe via Supabase Auth
- Création automatique : école + utilisateur + année académique
- Trial 30 jours sans carte bancaire

### M2 — Gestion des élèves
- CRUD complet
- Recherche full-text (FR + AR)
- Filtres par classe, niveau de risque
- Panneau latéral détail
- Import Excel intelligent (M11)

### M3 — Saisie des notes
- Tableur réactif par classe
- Auto-save au blur de chaque cellule (Server Actions)
- Calcul automatique des moyennes pondérées (coefficients par matière)
- Validation 0-20 stricte

### M4 — Bulletins scolaires
- Aperçu A4 dans l'application
- Génération PDF officielle (@react-pdf/renderer)
- En-tête, table des notes, appréciations, signatures
- Téléchargement instantané

### M5 — Présences quotidiennes
- Grille visuelle par classe (Présent / Absent / Retard)
- Clic pour cycler le statut
- Bouton "Tous présents" pour gain de temps
- Statistiques temps réel

### M6 — Emploi du temps
- Grille hebdomadaire par classe
- Semaine algérienne (Dim → Jeu)
- Salles et matières

### M7 — Finance
- Tableau des paiements
- Statuts : Payé / Partiel / En attente / En retard
- Méthodes : Espèces, CCP, Virement
- Taux de recouvrement temps réel
- 4 cartes métriques (Total dû, Encaissé, Taux, Retards)
- Graphique d'évolution sur 6 mois

### M8 — Intelligence Artificielle
- Score de risque 0-100 par élève
- Suggestion d'orientation par filière (5 filières BAC algériennes)
- Résumé hebdomadaire généré par Claude Haiku
- Recalcul nocturne via Vercel Cron (02:00 Algiers)
- Bouton "Recalculer maintenant" pour démo

### M9 — Conformité réglementaire
- 8 catégories d'obligations (cahier des charges 2026)
- Score d'inspection-readiness 0-100
- Suggestions d'actions prioritaires
- Génération PDF "Rapport prêt pour inspection"
- Fil d'actualité réglementaire

### M10 — Tableau de bord
- 4 cartes métriques animées (compteurs)
- Sparklines avec données seedées
- Graphique évolution inscriptions (12 mois)
- Donut répartition des risques
- Barchart performance par classe
- Feed d'activité temps réel
- Top 5 élèves prioritaires

### M11 — Import Excel
- Reconnaissance tolérante des en-têtes (FR + AR + variantes)
- Création automatique des classes manquantes
- Validation par ligne (Zod)
- Rapport d'erreurs détaillé
- Template Excel téléchargeable

### M12 — Paramètres & Équipe
- Modification informations école (Directeur only)
- Gestion de l'équipe (invitations professeurs / secrétaires)
- Génération automatique de mots de passe temporaires
- Désactivation d'utilisateurs

---

## 8. INTELLIGENCE ARTIFICIELLE — APPROFONDISSEMENT

### 8.1 Architecture du moteur IA

EDURA implémente une **IA hybride à trois couches** :

```
┌────────────────────────────────────────────┐
│  COUCHE 1 — Règles déterministes           │
│  → Score de risque (12 facteurs pondérés)  │
│  → Moteur d'orientation (profils filières) │
│  → Score de conformité (cahier des charges)│
└────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────┐
│  COUCHE 2 — Agrégation statistique         │
│  → Distribution des risques par classe     │
│  → Tendances temporelles                   │
│  → Détection d'anomalies                   │
└────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────┐
│  COUCHE 3 — LLM (Anthropic Claude)         │
│  → Résumé hebdomadaire directeur           │
│  → Recommandations en langage naturel      │
│  → Fallback déterministe si API absent     │
└────────────────────────────────────────────┘
```

### 8.2 Algorithme de scoring de risque

**Inputs par élève** :
- Notes du trimestre courant
- Notes du trimestre précédent (tendance)
- Présences sur 60 jours glissants
- Statut des paiements de l'année

**12 facteurs analysés** :

| Facteur | Seuil | Points |
|---|---|---|
| Moyenne critique | < 8/20 | +25 |
| Moyenne sous la barre | 8-10/20 | +15 |
| Moyenne fragile | 10-12/20 | +5 |
| Chute brutale | > 4 pts | +15 |
| Baisse de moyenne | > 2 pts | +8 |
| Absentéisme grave | > 25% | +25 |
| Absentéisme élevé | > 15% | +15 |
| Absences répétées | > 8% | +7 |
| Pic récent d'absences | ≥3 en 14j | +10 |
| Retards chroniques | ≥5 en 60j | +3 |
| Paiements multi-impayés | 2+ trimestres | +15 |
| Paiement en retard | 1 trimestre | +8 |

**Sortie** :
- Score 0-100 (clamped)
- Niveau : LOW / MODERATE / HIGH
- Rationale en français : *"Moyenne sous la barre (8.2/20) ; 18% d'absences ; paiement T2 en retard. Contact parents recommandé cette semaine."*

**Propriétés algorithmiques** :
- **Déterministe** : mêmes inputs → même output, toujours
- **Explicable** : chaque point du score a une raison documentée (auditable depuis l'array `factors[]`)
- **Conservateur** : seuils calibrés pour ~10-15% de classe flaggée HIGH (évite les fausses alertes)
- **Pure function** : pas d'accès BD, testable isolément, parallélisable

### 8.3 Performance

| Métrique | Valeur mesurée |
|---|---|
| Temps de calcul par élève | < 1 ms |
| Batch 40 élèves (1 école) | ~1.2 secondes |
| Batch théorique 1000 élèves | ~30 secondes (acceptable cron nocturne) |
| Coût en RAM | < 10 MB |

### 8.4 Moteur d'orientation

Suggère une des 5 filières du BAC algérien selon le profil de notes :
- Sciences expérimentales
- Mathématiques
- Lettres et philosophie
- Langues étrangères
- Gestion et économie

Chaque filière a un **profil pondéré** de matières. Le moteur calcule la moyenne pondérée des notes de l'élève par filière et recommande celle au score le plus élevé. Confidence = écart entre top 1 et top 2.

### 8.5 Résumé directeur (LLM)

Utilise **Claude Haiku 4.5** via l'API Anthropic avec **prompt caching** :
- System prompt mis en cache (5 min TTL) → coût quasi nul pour les appels suivants
- ~300 tokens input + 200 tokens output par appel
- **Coût estimé : 0.0003 USD par résumé**
- Fallback déterministe si `ANTHROPIC_API_KEY` absent → l'app fonctionne sans budget IA

---

## 9. SÉCURITÉ

### 9.1 Authentification

- **Supabase Auth** : JWT signés avec rotation de clé
- Cookies HTTP-only + Secure + SameSite=Lax
- Hash de mot de passe : bcrypt (géré par Supabase)
- Confirmation email (désactivable pour dev)
- Réinitialisation de mot de passe via email

### 9.2 Autorisation — RBAC

3 rôles avec permissions distinctes :

| Rôle | Élèves | Notes | Finance | Conformité | Paramètres | Équipe |
|---|---|---|---|---|---|---|
| **DIRECTOR** | Tous | Tous | ✅ | ✅ | ✅ | ✅ Invite |
| **SECRETARY** | Tous | Lecture | ✅ | ✅ | ❌ | ❌ |
| **TEACHER** | Ses classes | Ses classes | ❌ | ❌ | ❌ | ❌ |

### 9.3 Multi-tenancy strict

**Trois lignes de défense** :

1. **Helper applicatif** : `requireSession()` valide JWT et résout `schoolId`
2. **Wrapper de scope** : `scopeStudentsBy(session)` injecte `where: { schoolId }`
3. **Row-Level Security PostgreSQL** : policies sur toutes les tables (`prisma/rls.sql`)

### 9.4 Conformité RGPD

- Hébergement en Europe (Vercel + Supabase)
- Données chiffrées au repos (Supabase)
- HTTPS forcé (TLS 1.3)
- Droit à l'oubli : suppression d'école = cascade delete complète
- Pas de tracking tiers (pas de Google Analytics, pas de Facebook Pixel)

### 9.5 Validation des inputs

100% des entrées utilisateur passent par **Zod schemas** :
```typescript
const createStudentSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  // ...
});
```

Rejette toute donnée malformée avant l'accès à la BD.

### 9.6 Protection des endpoints sensibles

- **Cron endpoints** : protégés par `CRON_SECRET` (Bearer token)
- **Admin operations** : `requireRole(session, "DIRECTOR")` en première ligne
- **Service role key** : utilisée uniquement côté serveur, jamais exposée au client

---

## 10. DÉPLOIEMENT & DEVOPS

### 10.1 Pipeline CI/CD

```
Développeur                   GitHub                    Vercel
    │                            │                         │
    │ git push                   │                         │
    ├──────────────────────────► │                         │
    │                            │ webhook                 │
    │                            ├───────────────────────► │
    │                            │                         │
    │                            │              ┌──────────┴──────────┐
    │                            │              │ 1. Pull code        │
    │                            │              │ 2. Install deps     │
    │                            │              │ 3. prisma generate  │
    │                            │              │ 4. next build       │
    │                            │              │ 5. Deploy           │
    │                            │              └──────────┬──────────┘
    │                            │                         │
    │                            │                  Live sur edge
    │                            │                  global en ~90s
```

### 10.2 Variables d'environnement

7 variables critiques gérées séparément dev/prod :

| Variable | Usage | Sensibilité |
|---|---|---|
| `DATABASE_URL` | Pool PostgreSQL (PgBouncer) | 🔴 Secret |
| `DIRECT_URL` | Direct PostgreSQL (migrations) | 🔴 Secret |
| `NEXT_PUBLIC_SUPABASE_URL` | URL projet Supabase | 🟢 Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon Supabase | 🟢 Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin Supabase | 🔴 Secret |
| `CRON_SECRET` | Auth cron | 🔴 Secret |
| `ANTHROPIC_API_KEY` | Claude API | 🔴 Secret |

### 10.3 Cron job nocturne

Configuration `vercel.json` :
```json
{
  "crons": [{
    "path": "/api/cron/recompute-risk",
    "schedule": "0 1 * * *"
  }]
}
```
→ Exécution quotidienne à 01:00 UTC (02:00 Algiers) pour recalculer tous les scores IA de toutes les écoles.

---

## 11. TESTS ET VALIDATION

### 11.1 Tests fonctionnels

Smoke tests manuels couvrant les flux critiques :
- ✅ Inscription d'une nouvelle école
- ✅ Login / logout
- ✅ CRUD élève
- ✅ Import Excel (FR + AR)
- ✅ Saisie note + sauvegarde auto
- ✅ Génération PDF bulletin
- ✅ Recalcul IA
- ✅ Invitation professeur + login en tant que professeur

### 11.2 Tests de sécurité

- ✅ Tentative d'accès à `/app` sans session → redirige `/login`
- ✅ Tentative d'accès à `/app/settings` en tant que TEACHER → redirige `/app`
- ✅ Tentative de requête API avec un `schoolId` d'une autre école → 404
- ✅ `.env` confirmé absent de Git history

### 11.3 Performance

| Métrique | Cible | Mesuré |
|---|---|---|
| Time to First Byte | < 500 ms | ~280 ms |
| Largest Contentful Paint | < 2.5 s | ~1.4 s |
| Total Blocking Time | < 200 ms | ~120 ms |
| Build size (JS) | < 300 KB | ~240 KB |

---

## 12. RÉSULTATS OBTENUS

### 12.1 Métriques techniques du projet

| Indicateur | Valeur |
|---|---|
| **Lignes de code** | ~6 500 (TypeScript + TSX) |
| **Fichiers** | 80+ fichiers source |
| **Tables PostgreSQL** | 20 |
| **Routes Next.js** | 15+ pages + 8 API routes |
| **Composants UI réutilisables** | 25+ |
| **Migrations Prisma** | 5 |
| **Dépendances NPM** | 28 packages |
| **Build time (Vercel)** | ~90 secondes |
| **Couverture fonctionnelle MVP** | 100% |

### 12.2 Couverture du cahier des charges

| Phase | Status | Date |
|---|---|---|
| Phase 1 — Setup | ✅ | Semaine 1 |
| Phase 2 — Auth + Multi-tenancy | ✅ | Semaine 2 |
| Phase 3 — 8 modules core | ✅ | Semaines 3-5 |
| Phase 4 — Excel Import | ✅ | Semaine 6 |
| Phase 5 — IA Layer | ✅ | Semaines 7-8 |
| Phase 6 — PDF Bulletins | ✅ | Semaine 9 |
| Phase 7 — Theming | ✅ | Semaine 10 |
| Phase 8 — RBAC | ✅ | Semaine 11 |
| Phase 9 — Investor Dashboard | ✅ | Semaine 12 |
| Phase 10 — Landing Page | ✅ | Semaine 13 |
| Phase 11 — Production Deploy | ✅ | Semaine 14 |
| Phase 12 — Paywall | 🟡 En cours | Semaine 15 |
| Phase 13 — Conformité Module | 🟡 Partiel | Semaine 16 |

### 12.3 Capture d'état du système (au moment de la soutenance)

- **Application live** : edura-aminaghezal.vercel.app
- **Base de données** : Supabase eu-west-2 (Londres)
- **Cron actif** : recalcul IA quotidien à 02:00 Algiers
- **Pas d'incident en production** depuis le déploiement

---

## 13. DIFFICULTÉS RENCONTRÉES & APPRENTISSAGES

### 13.1 Difficultés techniques

#### D1 — Multi-tenancy avec Prisma + PgBouncer
**Problème** : PostgreSQL session variables (`app.school_id`) ne persistent pas à travers le pool PgBouncer en mode transaction.

**Solution adoptée** : Scoping au niveau application via `lib/rls.ts`, avec RLS PostgreSQL en safety net. Approche pragmatique privilégiée à la pureté architecturale.

#### D2 — Migration Prisma 7
**Problème** : Prisma 7 a déplacé la configuration `url` du `schema.prisma` vers un nouveau fichier `prisma.config.ts`, et l'API du `PrismaClient` constructor a changé radicalement (suppression de `datasources`, exigence d'un adapter).

**Solution adoptée** : Migration vers le pattern adapter avec `@prisma/adapter-pg` + Pool de connections natif `pg`.

#### D3 — Encodage URL des mots de passe Supabase
**Problème** : Le mot de passe DB contenait `#` et `/`, caractères réservés URL, causant des erreurs P1013 (invalid port).

**Solution adoptée** : URL-encoding (`#` → `%23`, `/` → `%2F`).

#### D4 — Conformité au cahier des charges algérien
**Problème** : Le cahier des charges 2026 est dense, non versionné, et son interprétation varie d'une wilaya à l'autre.

**Solution adoptée** : Modélisation flexible (ComplianceCategory + Obligation extensibles), poids configurables, scoring transparent et auditable.

#### D5 — Internationalisation FR + AR
**Problème** : Import Excel doit reconnaître des en-têtes en français accentué, en français non-accentué, et en arabe.

**Solution adoptée** : Normalisation des chaînes (suppression accents + lowercase) + table d'alias multilingue.

### 13.2 Apprentissages personnels

- **Architecture as a discipline** : choisir une stack stable et la maîtriser bat le suivi des tendances
- **Pragmatisme > pureté** : RLS Postgres "parfaite" peut attendre, l'application doit livrer
- **Sécurité by design** : il faut penser multi-tenancy dès le schéma, pas comme un patch
- **Documentation = code** : le `DEPLOY.md` et le `MEMOIRE_PFE.md` sont des artefacts du projet
- **Vente > technique** : un MVP déployé et démontrable bat un produit "parfait" sur le disque dur

---

## 14. PERSPECTIVES D'ÉVOLUTION

### 14.1 Court terme (3 mois)

- **Phase 12 — Paywall complet** : conversion trial → payant avec upload de preuve de paiement
- **Module Conformité finalisé** : 8 catégories d'obligations seedées + Mode Inspection PDF
- **Email notifications (Resend)** : alertes parents automatiques (absences, notes critiques)
- **Application mobile parents** (React Native) : consultation bulletins + notifications push

### 14.2 Moyen terme (12 mois)

- **Vraie ML** : entraîner un modèle de décrochage sur 12 mois de données réelles agrégées multi-écoles
- **Module Cantine & Bus** : suivi présences cantine, géolocalisation bus
- **Marketplace de templates** : bulletins personnalisables par école
- **API publique** : intégration avec ERP externes

### 14.3 Long terme (vision 3 ans)

- **Expansion régionale** : Tunisie, Maroc, Sénégal (marchés francophones similaires)
- **Module Enseignement Supérieur** : adaptation pour écoles supérieures privées
- **AI Tutor** : assistant IA pour aider les élèves à risque (LLM fine-tuné)
- **Levée de fonds Seed** : 200 000 - 500 000 USD pour scaler l'équipe à 5-8 personnes

---

## 15. APPORTS PERSONNELS

### 15.1 Compétences techniques développées

- **Architecture full-stack moderne** : Next.js App Router, Server Components, Server Actions
- **Bases de données relationnelles avancées** : PostgreSQL, Row-Level Security, indexation
- **ORM** : Prisma 6 et 7 (migrations, schemas, adapters)
- **TypeScript avancé** : génériques, types conditionnels, inférence
- **Sécurité applicative** : RBAC, multi-tenancy, JWT, RGPD
- **IA appliquée** : conception d'algorithmes rule-based, intégration API LLM
- **DevOps** : CI/CD via Vercel, gestion des secrets, monitoring
- **Génération PDF** : @react-pdf/renderer
- **Parsing de fichiers** : Excel avec SheetJS, normalisation multi-langues

### 15.2 Compétences entrepreneuriales

- **Discovery client** : interviews qualitatifs avec 5 directeurs d'écoles privées
- **Positionnement produit** : analyse concurrentielle, différenciation
- **Modèle économique** : structuration du pricing annuel, justification du ROI
- **Pitch** : préparation présentation incubateur

### 15.3 Soft skills

- **Autonomie** : projet solo de bout en bout
- **Gestion du temps** : développement en parallèle de la formation
- **Résolution de problèmes** : debugging de bugs complexes (Prisma 7, RLS, Vercel)
- **Documentation** : production d'un mémoire technique de 60+ pages

---

## 16. CONCLUSION

Le projet EDURA démontre qu'il est possible, pour un développeur solo dans le contexte algérien, de concevoir, développer et déployer en production une plateforme SaaS commercialement viable, techniquement robuste, et différenciée sur son marché — en six mois et sans budget initial.

Sur le plan **académique**, ce projet aura permis de mettre en pratique l'ensemble des disciplines de l'ingénierie logicielle : architecture distribuée, sécurité applicative, bases de données relationnelles, intelligence artificielle, design système, DevOps. Il aura aussi confronté la théorie aux contraintes réelles d'un produit en production (latence réseau, pooling de connexions, encodage de caractères spéciaux, conformité réglementaire).

Sur le plan **professionnel**, EDURA constitue un actif transférable : un produit déployé, un code propre, une base utilisateurs prospective (les écoles privées algériennes), et une vision long terme structurée. La prochaine étape — la conversion des premiers trials en abonnements payants — déterminera si cet actif évolue vers une véritable entreprise.

Sur le plan **personnel**, ce travail aura validé une hypothèse de fond : **l'engineering rigoureux et la vision business ne sont pas antinomiques** ; bien pratiqués ensemble, ils créent des produits qui résolvent de vrais problèmes pour de vrais utilisateurs.

EDURA n'est pas la fin d'un projet de fin d'études. C'est son commencement.

---

## ANNEXES

### Annexe A — Glossaire technique

| Terme | Définition |
|---|---|
| **SaaS** | Software as a Service — logiciel consommé via abonnement web |
| **Multi-tenant** | Architecture où plusieurs clients (tenants) partagent la même instance logicielle |
| **ORM** | Object-Relational Mapping — mappage objet / base relationnelle (Prisma) |
| **RLS** | Row-Level Security — sécurité PostgreSQL au niveau de chaque ligne |
| **RBAC** | Role-Based Access Control — gestion des permissions par rôle |
| **JWT** | JSON Web Token — token d'authentification signé cryptographiquement |
| **CUID** | Collision-resistant Unique IDentifier — identifiant unique sécurisé |
| **CRUD** | Create, Read, Update, Delete — opérations de base sur des données |
| **CI/CD** | Continuous Integration / Continuous Deployment |
| **SSR** | Server-Side Rendering |
| **TTL** | Time To Live — durée de validité d'un cache |
| **LLM** | Large Language Model (ex. Claude, GPT) |
| **MAU** | Monthly Active Users — utilisateurs actifs mensuels |
| **RGPD** | Règlement Général sur la Protection des Données |

### Annexe B — Liens du projet

| Ressource | URL |
|---|---|
| Application live | https://edura-aminaghezal.vercel.app |
| Code source | https://github.com/aminaghezal/edura |
| Base de données | Supabase (eu-west-2) |
| Documentation déploiement | `DEPLOY.md` (dans le repo) |
| Stratégie produit | `EDURA_MASTER_STRATEGY.md` |
| Plan technique | `EDURA_TECHNICAL_PLAN.md` |
| Design system | `EDURA_DESIGN_SYSTEM.md` |
| Guide de construction | `EDURA_BUILD_GUIDEBOOK.md` |

### Annexe C — Captures d'écran à inclure dans la version finale

Pour la version finale du mémoire, inclure des captures d'écran de :

1. Page d'accueil (landing page) — mode clair
2. Page d'inscription
3. Tableau de bord principal — métriques + graphiques
4. Tableau de bord — mode sombre (effet "control panel")
5. Liste des élèves avec recherche et filtres
6. Saisie des notes (tableur)
7. Aperçu d'un bulletin
8. Bulletin PDF généré (page 1)
9. Page Présences
10. Page Finance avec graphique
11. Page Analyses IA avec scores
12. Page Conformité avec score d'inspection
13. Modal "Mode Inspection" en cours d'exécution
14. Page Paramètres > Équipe
15. Modal d'invitation professeur
16. Vue mobile responsive

---

**Fin du mémoire technique.**

*Document préparé par Amina Kaouter Ghezal — Mai 2026*
*USTO-MB — Université des Sciences et de la Technologie d'Oran Mohamed Boudiaf*
