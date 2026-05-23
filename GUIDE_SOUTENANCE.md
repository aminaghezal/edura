# 🎓 EDURA — Guide de Soutenance Anti-Panique

**À imprimer et garder à côté de toi pendant la soutenance.**

Amina Kaouter Ghezal — USTO-MB — 2025/2026

---

## 🎯 ENCADRÉ 1 — Pitch elevator (30 secondes)

> *« EDURA est une plateforme SaaS multi-tenant pour les écoles privées algériennes. Elle combine treize modules de gestion administrative classiques — élèves, notes, présences, finance, conformité — avec une couche d'intelligence artificielle hybride. Sa contribution la plus originale est le Rapport Scientifique d'Orientation : un bilan pédagogique généré automatiquement qui combine la théorie des intelligences multiples de Gardner et l'indicateur MBTI pour prédire la filière BAC et les métiers compatibles avec chaque élève. Une application mobile compagnon en React Native permet aux élèves de passer eux-mêmes les tests psychométriques sur tablette. Le tout est déployé en production sur Vercel à edura-aminaghezal.vercel.app, avec environ 8 500 lignes de code TypeScript. »*

**À retenir** : 13 modules, IA hybride, Gardner + MBTI, déployé en production, solo en 6 mois.

---

## 🛡️ ENCADRÉ 2 — Phrases de secours (si tu bloques)

| Situation | Phrase à dire |
|---|---|
| **Tu as oublié** | *« Je préfère ne pas répondre approximativement. Je peux vérifier dans le code source et revenir sur ce point. »* |
| **Tu paniques** | *« C'est une excellente question. Permettez-moi de prendre un instant pour structurer ma réponse. »* (puis tu respires 3 secondes) |
| **Tu ne comprends pas la question** | *« Pour être sûre de bien répondre, est-ce que vous voulez dire X ou Y ? »* |
| **Le jury insiste sur un défaut** | *« Vous avez raison, c'est une limite réelle. Je l'ai documentée en section 5.X du mémoire et c'est dans mes perspectives d'évolution. »* |
| **On te demande quelque chose hors scope** | *« Cette dimension dépasse le périmètre du MVP. Elle figure dans les perspectives à moyen terme. »* |

**Règle d'or** : tu n'es PAS censée tout savoir. **L'honnêteté impressionne plus que le bluff.**

---

# PARTIE 1 — Questions Techniques (Stack & Architecture)

## Q1.1 — « Pourquoi Next.js plutôt que React + un backend séparé (Express, NestJS, Django) ? »

**Réponse courte** : *« Pour un projet solo, unifier frontend et backend dans un seul framework élimine la latence réseau entre couches, simplifie le déploiement et réduit la surface de bugs. Next.js App Router me permet d'écrire des Server Actions, du SSR et des API routes dans le même projet. »*

**Élaboration** : Server Components réduisent le bundle JS envoyé au navigateur. Vercel est l'éditeur de Next.js → déploiement zéro-config. CI/CD automatique sur `git push`.

**🛡️ Si poussée** : *« Pour une équipe de 30 développeurs, une architecture microservices serait justifiée. À mon échelle (solo, 6 mois), c'est de l'over-engineering. »*

---

## Q1.2 — « Pourquoi TypeScript ? »

**Réponse courte** : *« Type safety. En projet solo, je n'ai pas de revue de code humaine. Le compilateur TypeScript joue ce rôle : il attrape ~80% des bugs avant qu'ils ne touchent les utilisateurs. »*

**Élaboration** : Refactoring sûr (renommer un champ propage l'erreur partout). IntelliSense complet. Prisma génère des types TypeScript depuis le schéma DB.

---

## Q1.3 — « Pourquoi Supabase plutôt que Firebase ou un PostgreSQL auto-hébergé ? »

**Réponse courte** : *« Supabase = PostgreSQL géré + Auth + RLS natif. PostgreSQL est relationnel et ACID, ce qui correspond à mes données. Firebase utilise Firestore (NoSQL), inadapté pour des relations complexes (élève → classe → matière → note). »*

**Élaboration** : RLS PostgreSQL me donne une seconde couche de sécurité gratuite. RGPD-friendly (hébergement EU). Tarification prévisible.

---

## Q1.4 — « Décrivez l'architecture multi-tenant. »

**Réponse courte** : *« J'utilise le pattern "Shared Database, Shared Schema, Tenant ID Column". Toutes les tables métier ont une colonne `schoolId`. Chaque requête Prisma inclut un filtre par `schoolId` extrait de la session JWT. »*

**Élaboration** : Trois patterns possibles (Walraven 2011) : DB-per-tenant, schema-per-tenant, column-per-tenant. J'ai choisi le 3e pour la simplicité opérationnelle. Deux couches de défense :
1. Helper applicatif `lib/rls.ts` qui force le filtre
2. Politiques RLS PostgreSQL en safety net au niveau base

**🛡️ Si poussée** : *« Le risque d'une fuite cross-tenant est ce qui me ferait perdre des clients du jour au lendemain. C'est pour ça que j'ai deux couches indépendantes. »*

---

## Q1.5 — « Montrez-moi une politique RLS concrète. »

**Réponse courte** : Voici la politique sur la table `students` :

```sql
CREATE POLICY tenant_isolation ON "students"
FOR ALL
USING (school_id = current_setting('app.current_school_id')::text);
```

**Élaboration** : Avant chaque requête, Prisma exécute `SET app.current_school_id = '...'`. PostgreSQL refuse alors toute ligne qui ne matche pas. Si un bug applicatif essaie de lire les students d'une autre école, la DB rejette la requête.

---

## Q1.6 — « Comment garantissez-vous que les enseignants ne voient que leurs classes ? »

**Réponse courte** : *« Au niveau applicatif, le helper `scopeStudentsBy(session)` filtre par les classes affectées à l'enseignant via la table `TeacherAssignment`. Au niveau API, chaque route vérifie `session.role` avant d'exécuter l'opération. »*

**Code** :
```typescript
if (session.role === "TEACHER") {
  whereClause.classId = { in: assignedClassIds };
}
```

---

## Q1.7 — « Comment gérez-vous l'authentification ? »

**Réponse courte** : *« Supabase Auth gère les JWT signés. Les tokens sont stockés dans des cookies HttpOnly + Secure + SameSite=Lax pour éviter XSS et CSRF. Les mots de passe sont hachés avec bcrypt côté Supabase. »*

**Élaboration** : Sessions à durée limitée (1h), refresh tokens pour la persistance. Pas de transmission de mot de passe en clair (HTTPS forcé TLS 1.3).

---

## Q1.8 — « RGPD ? »

**Réponse courte** : *« Données hébergées en Europe (Vercel Frankfurt, Supabase eu-west-2). Chiffrement at-rest et in-transit. Droit à l'oubli implémenté via cascade delete : supprimer une école efface tout. Aucun tracker tiers. »*

---

## Q1.9 — « Pourquoi Prisma et pas du SQL brut ou TypeORM ? »

**Réponse courte** : *« Prisma génère un client TypeScript typé depuis le schéma. Les migrations sont versionnées dans Git. Le DSL `schema.prisma` est plus lisible que du SQL DDL pour un mainteneur solo. »*

**🛡️ Si on cite « mais Prisma est lent en production »** : *« C'est vrai pour les requêtes complexes. Pour 90% des cas, la performance est suffisante. Si je rencontre un bottleneck, je peux toujours utiliser `prisma.$queryRaw` pour du SQL optimisé. »*

---

## Q1.10 — « Comment se déroule un déploiement ? »

**Réponse courte** : *« `git push origin main` → webhook GitHub → Vercel build (install + prisma generate + next build) → déploiement sur edge global en ~90 secondes. Aucune intervention manuelle. »*

**Élaboration** : Preview deployments automatiques pour chaque branche. Rollback en 1 clic.

---

# PARTIE 2 — Questions sur l'IA (la plus piégée)

## Q2.1 — « Est-ce que vos analyses IA sont VRAIMENT de l'IA ou juste des calculs ? »

**🔥 Question piège la plus probable. Réponse honnête à apprendre par coeur :**

> *« EDURA implémente deux paradigmes d'IA distincts et complémentaires. Premièrement, l'IA symbolique — communément appelée "Good Old-Fashioned AI" ou GOFAI — sous forme de systèmes experts à règles pondérées. C'est l'approche utilisée pour les scores de risque, le moteur d'orientation et la conformité. Cette approche est reconnue dans la littérature académique depuis les années 60 ; Russell et Norvig la classent explicitement dans leur ouvrage de référence Artificial Intelligence: A Modern Approach. Deuxièmement, l'IA générative via LLM, avec un appel à l'API Anthropic Claude Haiku pour les résumés en langage naturel.*
>
> *Donc oui, c'est de l'IA — mais c'est de l'IA honnête. Je n'ai pas entraîné de réseau de neurones, et j'ai cinq raisons techniques précises pour ce choix. »*

**🛡️ Si poussée plus loin** : Voir Q2.2.

---

## Q2.2 — « Pourquoi vous n'avez pas utilisé du Machine Learning supervisé ? »

**Réponse en cinq arguments à apprendre** :

1. **Cold-start.** *« Entraîner un modèle de prédiction du décrochage nécessite des centaines d'élèves dont on sait a posteriori s'ils ont décroché. EDURA est une nouvelle plateforme sans historique. »*

2. **Explicabilité (Rudin, Nature 2019).** *« Un directeur à qui le système dit "Khaled est en risque élevé" doit comprendre pourquoi. Un réseau de neurones est une boîte noire ; un système expert produit naturellement une trace de raisonnement auditable. »*

3. **AI Act européen 2024.** *« Le règlement classe les systèmes d'IA éducatifs comme "haut risque" (Annexe III, point 3). Ils exigent une transparence et une auditabilité que les systèmes experts ont nativement. »*

4. **Coût computationnel.** *« Un modèle ML pour 1000 écoles × 500 élèves nuit après nuit coûterait ~$10 800/an d'inférence. Mon système expert coûte $0 et tourne en 1 seconde par école. »*

5. **Nature tabulaire des données.** *« La recherche empirique (Mardolkar 2021, XGBoost) montre que sur données tabulaires structurées — ce qu'est un dossier scolaire —, les méthodes d'ensemble surpassent le deep learning. Et XGBoost reste plus interprétable qu'un réseau profond. »*

**Closing** : *« Une roadmap vers du ML supervisé est documentée pour la version 2, à 2-3 ans, une fois assez de données accumulées. »*

---

## Q2.3 — « Donnez-moi la formule du score de risque. »

**Réponse** :

```
Score = Σ (poids_facteur_i × indicateur_actif_i)

avec indicateurs binaires (0 ou 1) selon seuils :
- moyenne < 8/20      → +25
- moyenne 8-10/20     → +15
- chute ≥ 4 pts       → +15
- chute ≥ 2 pts       → +8
- absentéisme > 25%   → +25
- absentéisme > 15%   → +15
- 3+ absences en 14j  → +10
- 2+ trimestres impayés → +15

niveau = HIGH (score ≥ 60) | MODERATE (≥ 30) | LOW (< 30)
```

**Justification des pondérations** : Balfanz 2007 (absentéisme), OECD PISA 2019 (chute moyenne), Mubarak 2020 (pics récents).

**Code** : *« C'est implémenté dans `lib/ai/risk-score.ts`, ~150 lignes. »*

---

## Q2.4 — « Comment fonctionne le moteur d'orientation Gardner ? »

**Réponse en 3 étapes** :

1. **Table de correspondance** matière → intelligence dominante. Ex : `math` → `LOGICAL`, `philo` → `LINGUISTIC + INTRAPERSONAL`, `sport` → `BODILY`.

2. **Scoring des 8 intelligences** : chaque note d'une matière contribue à l'intelligence correspondante, pondérée par la moyenne. `score(LOGICAL) = base + Σ(notes_math + notes_phys) × weight`.

3. **Prédiction de filière** : on compare le vecteur d'intelligences au profil-type de chaque filière (Sciences, Maths, Lettres, Langues, Gestion). La filière la plus proche est recommandée.

**Mathématiquement** : c'est un classifieur linéaire multi-classes, équivalent à un perceptron sans non-linéarité (LeCun 2015), où les poids sont fixés par expertise pédagogique plutôt qu'appris.

---

## Q2.5 — « Comment décodez-vous le MBTI ? »

**Réponse** :

```
Input : type 4 lettres (ex. "ENFP")
Output : 4 dimensions avec pourcentages

E vs I → si type[0] === "E" : E=75%, I=25%
S vs N → si type[1] === "S" : S=75%, N=25%
T vs F → si type[2] === "T" : T=75%, F=25%
J vs P → si type[3] === "J" : J=75%, P=25%
```

**Plus** : description, surnom, forces, faiblesses, métiers compatibles (~10 par type), filières BAC, conseil d'étude → tout vient d'une base de connaissances de 16 profils détaillés.

**Localisation** : `lib/orientation/mbti.ts`.

---

## Q2.6 — « Le MBTI est contesté en psychologie scientifique. Comment vous justifiez son inclusion ? »

**Réponse honnête** :

> *« Vous avez raison. Le MBTI souffre de critiques psychométriques sérieuses : faible test-retest reliability, distribution bimodale forcée, manque de validation prédictive. Je l'utilise délibérément comme un outil de DIALOGUE, pas comme un diagnostic clinique. Pithers (2002) et Higgs (2001) ont documenté son utilité dans ce cadre.*
>
> *Dans le rapport, je le présente toujours en complément du profil Gardner et jamais comme une vérité absolue. La boîte d'interprétation pour les parents le précise : "c'est un outil indicatif, pas un diagnostic". »*

**🛡️ Si on insiste** : *« Si je devais m'en passer, je remplacerais par le Big Five (OCEAN) qui est plus validé. Mais le MBTI est plus parlant pour les parents et les conseillers d'orientation algériens, qui le connaissent. »*

---

## Q2.7 — « Pourquoi Claude Haiku plutôt que ChatGPT ou Gemini ? »

**Réponse** : *« Trois raisons. (1) Latence : Haiku est sous 1 seconde. (2) Qualité du français : Anthropic est meilleur que GPT-3.5 sur le français nuancé, et moins cher que GPT-4. (3) Prompt caching : 75% de réduction de coût sur les appels répétés grâce au cache des system prompts. »*

**Coût** : ~$0.0003 par résumé. Pour 100 écoles × 1 résumé/semaine × 52 semaines = $1.56/an. Négligeable.

---

## Q2.8 — « Et si l'API Anthropic tombe ? »

**Réponse** : *« J'ai un fallback déterministe. Si l'API ne répond pas ou si la clé n'est pas configurée, le code génère un résumé par templates basé sur les mêmes données. Le directeur ne voit pas la différence sauf en regardant l'attribut `source: "fallback" | "llm"`. »*

---

# PARTIE 3 — Questions Psychologie / Pédagogie

## Q3.1 — « La théorie de Gardner est-elle scientifiquement validée ? »

**Réponse nuancée** :

> *« La théorie de Gardner (1983) est une théorie pédagogique influente, mais elle n'a jamais fait l'objet d'une validation psychométrique rigoureuse comme les modèles factoriels classiques (g de Spearman, CHC, Big Five). Visser et al. (2006) ont montré des corrélations entre les "intelligences" qui suggèrent qu'elles ne sont pas réellement indépendantes.*
>
> *Cela dit, son intérêt OPÉRATIONNEL est immense : elle donne un langage commun aux enseignants, parents et conseillers pour parler des aptitudes au-delà du QI. C'est dans cette optique que je l'ai retenue. Pas comme un diagnostic, mais comme un outil de dialogue. »*

**🛡️ Si on insiste** : *« Une version 2 pourrait remplacer Gardner par le modèle CHC (Cattell-Horn-Carroll), plus validé psychométriquement. C'est un trade-off entre rigueur scientifique stricte et lisibilité par le grand public. »*

---

## Q3.2 — « Vous prétendez remplacer un psychologue scolaire ? »

**Réponse de défense** :

> *« Non, absolument pas. EDURA est explicitement un outil de PREMIÈRE LIGNE, pas un diagnostic clinique. Le rapport mentionne en bas de page : "Cette analyse est indicative et ne remplace pas un entretien avec un conseiller d'orientation". Mon objectif est de démocratiser l'accès à une réflexion structurée sur l'orientation, pas de remplacer les professionnels — au contraire, EDURA peut alimenter leur travail en leur donnant un point de départ. »*

---

## Q3.3 — « Et si le rapport d'orientation est faux et oriente un élève dans une mauvaise filière ? »

**Réponse honnête** :

> *« C'est une préoccupation légitime, et c'est exactement pour ça que le rapport présente toujours TROIS filières par ordre de pertinence, avec un score de confiance, et JAMAIS comme une décision absolue. La décision finale revient toujours à l'élève, ses parents et son enseignant. Le rapport est un input dans cette décision, pas le verdict. »*

**Closing** : *« De plus, le rapport n'a aucune autorité administrative. Le Ministère de l'Éducation continue d'orienter par les moyennes officielles. EDURA est un outil COMPLÉMENTAIRE. »*

---

## Q3.4 — « Pourquoi 8 intelligences chez Gardner et pas 10 ou 12 ? »

**Réponse** : *« C'est le modèle canonique de Gardner depuis 1999 : les 7 initiales (1983) + la naturaliste ajoutée plus tard. Gardner lui-même évoque parfois une 9e (existentielle) mais ne l'a jamais formellement intégrée. Je respecte le canon académique. »*

---

# PARTIE 4 — Questions sur l'Application Mobile (EDURA Test App)

## Q4.1 — « Pourquoi React Native et pas Flutter ou natif Swift/Kotlin ? »

**Réponse** : *« Trois raisons. (1) Cohérence de stack : React Native partage l'écosystème React avec la plateforme web Next.js, je réutilise des composants. (2) Cross-platform : un seul codebase iOS+Android, crucial pour la diversité des tablettes en école. (3) Expo simplifie la distribution : QR code direct sans passer par les stores. »*

---

## Q4.2 — « Comment l'app mobile communique-t-elle avec la plateforme web ? »

**Réponse** : *« Pas via une API REST séparée. Les deux applications utilisent le SDK Supabase JS directement, qui parle à la même base PostgreSQL. Les politiques RLS gèrent l'isolation par école. Quand un élève termine un test sur tablette, un trigger PostgreSQL met à jour le champ `mbtiType` du Student, et Next.js révalide la page du rapport scientifique. »*

---

## Q4.3 — « Comment vérifiez-vous que l'élève sur la tablette est le bon ? »

**Réponse honnête** : *« C'est une limite actuelle de la version 1. Le directeur scanne un QR code unique par élève pour démarrer le test sur la tablette. Mais rien n'empêche un autre élève de finir à sa place. Pour la version 2, je prévois soit une auth biométrique (TouchID), soit un PIN remis individuellement, soit la supervision physique d'un enseignant. »*

---

# PARTIE 5 — Questions Entrepreneurship (Chapitre 6)

## Q5.1 — « Le marché algérien est-il vraiment prêt à payer 200 000 DZD/an ? »

**Réponse** : *« J'ai validé ce prix avec 10 directeurs lors de mon étude qualitative. À 200 000 DZD/an, ça représente moins de 0,5% du CA d'une école de taille moyenne (150-400 élèves), donc sous le seuil de décision budgétaire majeure. Pronote est à ~150 000 DZD/an, PowerSchool à 2000 USD soit ~270 000 DZD. Je suis dans la fourchette acceptée. »*

---

## Q5.2 — « Comment allez-vous trouver vos premiers clients ? »

**Réponse en 3 phases** :

1. **Phase pilote (4 mois)** : 3 écoles partenaires d'Oran déjà identifiées via mon réseau personnel et USTO-MB. Déploiement gratuit en échange de feedback et témoignages.

2. **Phase commerciale (6 mois)** : Recrutement d'un co-fondateur commercial, démarchage des 50 plus grandes écoles privées des wilayas d'Oran, Alger, Constantine. Partenariats avec UNEPA et FEEP (associations d'établissements privés).

3. **Phase scale** : SEO + marketing de contenu + programme de parrainage (3 mois gratuits par école parrainée).

---

## Q5.3 — « Quelle est votre principale faiblesse ? »

**Réponse honnête** :

> *« Je suis seule. Je code, je vends, je supporte les clients. Ça fonctionne pour un MVP, ça ne tiendra pas à 100 écoles. C'est exactement pourquoi le plan financier prévoit le recrutement d'un co-fondateur commercial dans les 6 mois post-soutenance, et d'un développeur junior à 12 mois. »*

---

## Q5.4 — « Et si une grande boîte (PowerSchool, Microsoft) attaque votre marché ? »

**Réponse** : *« Mon avantage défensif est triple : (1) Spécificité algérienne — conformité au cahier des charges, bilinguisme FR/AR — qu'une multinationale ne reproduira pas à mon coût. (2) Prix : impossible pour PowerSchool de baisser à 200k DZD sans cannibaliser son marché global. (3) Gardner+MBTI : aucun concurrent ne combine gestion scolaire et orientation psychométrique. Si Microsoft entre, je suis acquise — c'est une sortie plutôt qu'un échec. »*

---

# PARTIE 6 — Questions Difficiles (Self-Defense)

## Q6.1 — « Est-ce que ChatGPT/Claude a écrit votre code ? »

**🔥 Question piège fréquente. Réponse honnête à préparer :**

> *« J'ai utilisé Claude comme assistant de développement pendant tout le projet, comme la majorité des développeurs aujourd'hui le font avec GitHub Copilot ou Cursor. Mais l'utilisation d'un assistant IA ne dispense pas de comprendre ce qu'on code. Pour valider ça, je peux vous expliquer n'importe quelle ligne du repo. Posez-moi une question sur un fichier au hasard. »*

**🛡️ Si on continue à pousser** : *« L'arrêté ministériel ne mentionne aucune restriction sur l'usage d'assistants IA. Ce qui compte c'est : est-ce que je comprends ce que j'ai produit ? Oui. Est-ce que je peux faire évoluer le code ? Oui. Est-ce que j'ai pris les décisions architecturales ? Oui. »*

**Preuve à apporter** : *« Voici le repo GitHub avec 50+ commits étalés sur 6 mois, montrant ma progression. C'est mon code. »*

---

## Q6.2 — « Combien d'écoles utilisent VRAIMENT votre plateforme aujourd'hui ? »

**Réponse honnête** :

> *« Aucune en production payante à ce jour. C'est un MVP déployé, prêt pour la phase pilote. Le déploiement chez les 3 écoles partenaires identifiées est planifié pour les 2 mois post-soutenance. Je préfère être transparente : prétendre avoir des utilisateurs réels alors que ce n'est pas le cas serait malhonnête. Le projet est techniquement abouti ; la commercialisation commence maintenant. »*

---

## Q6.3 — « Vous pensez que les directeurs algériens vont vraiment adopter ça ? Ils sont conservateurs. »

**Réponse** : *« Les 10 directeurs que j'ai interviewés m'ont dit le contraire : ils CHERCHENT des outils numériques mais ne trouvent rien d'adapté. La résistance vient surtout de la peur de l'inconnu et du prix des solutions étrangères. EDURA répond aux deux : essai gratuit 30 jours sans CB, interface en français, prix accessible. Le risque commercial existe, mais le besoin terrain est documenté. »*

---

## Q6.4 — « Pourquoi pas un PFE classique sur un sujet plus modeste ? »

**Réponse** : *« Parce qu'un MVP déployé en production avec 8 500 lignes de code et un volet entrepreneurial structuré démontre PLUS de compétences qu'un POC sur étagère : architecture, sécurité, ML symbolique, mobile, DevOps, vente, finance. C'est cohérent avec le dispositif Diplôme-Startup qui m'a inspirée. »*

---

## Q6.5 — « Et la cybersécurité ? Vous traitez des données de mineurs. »

**Réponse rigoureuse** :

1. **Auth** : Supabase Auth + JWT signés + cookies HttpOnly + Secure + SameSite=Lax.
2. **Isolation** : Multi-tenancy RLS PostgreSQL + helper applicatif.
3. **Chiffrement** : at-rest (Supabase) + in-transit (TLS 1.3).
4. **RGPD** : Hébergement EU + cascade delete pour droit à l'oubli + pas de tracker tiers.
5. **Pas de stockage de données sensibles non chiffrées** : pas de carnet de santé, pas de NSS, pas de carte d'identité scannée.

**🛡️ Si on cite OWASP Top 10** : *« Je n'ai pas effectué d'audit pénétration formel. C'est dans mes perspectives à court terme pour la version commerciale. »*

---

## Q6.6 — « Vos algorithmes psychométriques sont-ils validés par un psychologue ? »

**Réponse honnête** :

> *« Pas encore. C'est explicitement une limite documentée dans le mémoire (section "Validations à conduire"). Mon plan post-soutenance inclut un audit par un professeur de psychologie de l'Université d'Oran 2. Pour le MVP, je m'appuie sur la littérature publique : les tables de correspondance Gardner que j'ai construites sont alignées avec les ouvrages d'Armstrong (Multiple Intelligences in the Classroom) et les profils MBTI viennent du Manual officiel de Myers-Briggs. »*

---

## Q6.7 — « C'est juste un copier-coller de Pronote en plus joli ? »

**Réponse cinglante** :

> *« Non, et la table comparative en page 35 du mémoire le montre. Pronote n'a pas : (1) le rapport scientifique Gardner+MBTI, (2) le score de risque IA, (3) la conformité au cahier des charges algérien, (4) le support arabe natif, (5) l'application mobile élève, (6) le déploiement cloud sans serveur local. Pronote est une excellente solution pour les écoles publiques françaises ; EDURA est conçu pour les écoles privées algériennes. »*

---

## Q6.8 — « Si vous deviez recommencer, qu'est-ce que vous changeriez ? »

**Réponse stratégique** :

> *« Trois choses. Premièrement, je commencerais par la phase pilote en parallèle du développement, pour avoir du feedback utilisateur dès le 2e mois plutôt qu'à la fin. Deuxièmement, j'aurais investi plus tôt dans des tests automatisés Playwright pour éviter les bugs en production. Troisièmement, j'aurais utilisé Supabase Storage pour les photos d'élèves dès le début, plutôt que du base64 dans la DB. »*

**Closing** : *« Mais globalement, le choix d'architecture (Next.js + Supabase + IA symbolique) je le referais à 100%. »*

---

## Q6.9 — « Quel est votre pire bug rencontré ? »

**Réponse personnelle** : *« La migration vers Prisma 7. Cette version a déplacé la configuration de la base de données du `schema.prisma` vers un `prisma.config.ts`, et exige désormais un adaptateur explicite. La documentation n'était pas claire au moment où j'ai migré. J'ai passé trois jours à debugger avant de trouver la solution. C'est documenté dans la section "Difficultés rencontrées" du mémoire. »*

---

# PARTIE 7 — Démo Live (Ordre Optimal)

**Si on te demande de montrer le produit, voici l'ordre optimal en 4 minutes :**

1. **Landing page** (15s) — Montre le design pro + les sections "Rapport Scientifique" et "Institution Tridimensionnelle".

2. **Login** (5s) — Connecte-toi avec ton compte directeur démo.

3. **Tableau de bord** (20s) — Pointe les 4 cartes métriques animées, le résumé IA hebdomadaire, le top 5 risques.

4. **Mode sombre toggle** (5s) — Effet "wow" garanti, montre que tu as soigné l'UX.

5. **Liste des élèves** (15s) — Recherche, filtres, photo upload, bouton "Rapport Scientifique".

6. **Rapport Scientifique d'un élève** (60s) — **Le moment clé.** Scroll lentement sur les 4 sections : Académique, Commentaires, Profil Gardner avec donut, **section MBTI** avec barres 4 dimensions, **section Vision Tridimensionnelle**.

7. **Télécharger le PDF** (15s) — Le PDF s'ouvre, montre les 5 pages + la photo en couverture + le MBTI.

8. **Saisie IQ & Profil** (15s) — Ouvre le dialog, montre que tu peux saisir IQ, MBTI, style d'apprentissage.

9. **Ajouter une observation enseignant** (15s) — Avec tag d'intelligence Gardner.

10. **Analyses IA** (15s) — Page `/app/insights` avec scores de risque par élève.

11. **Conformité** (15s) — Si tu as le temps.

**Total : 3-4 minutes**. Si on te coupe avant, **toujours montrer 1 et 6** (landing + rapport scientifique).

---

# PARTIE 8 — Carte de Référence Rapide

| Métrique clé | Valeur à dire |
|---|---|
| Lignes de code web | ~8 500 |
| Lignes de code mobile | ~1 200 |
| Tables PostgreSQL | 24 |
| Modules fonctionnels | 13 |
| Pages Next.js | 20+ |
| Routes API | 12 |
| Migrations Prisma | 7 |
| Phases développement | 14/15 livrées |
| Temps de développement | 6 mois (solo, en parallèle) |
| URL live | edura-aminaghezal.vercel.app |
| Repo GitHub | github.com/aminaghezal/edura |
| Prix abonnement | 200 000 DZD/an |
| Marché TAM | 800 écoles × 200k = 160 M DZD/an |
| Cible 5 ans | 30% de marché = 30-42 M DZD CA |

---

# PARTIE 9 — Citations à Glisser (impressionne le jury)

| Auteur | Citation | Quand l'utiliser |
|---|---|---|
| **Russell & Norvig (2020)** | *« L'IA est l'étude des agents qui reçoivent des perceptions et exécutent des actions »* | Question "c'est de l'IA ?" |
| **Rudin (Nature 2019)** | *« Pour les décisions à fort enjeu, n'utilisez pas de boîte noire »* | Justifier choix non-ML |
| **Gardner (Harvard 1983)** | *« L'intelligence n'est pas une, mais multiple »* | Présenter le rapport |
| **Balfanz (2007)** | *« Trois indicateurs précoces : assiduité, comportement, résultats »* | Justifier facteurs risque |
| **Walraven (2011)** | *« Trois patterns multi-tenant : DB-per, schema-per, column-per »* | Architecture |
| **Carl Jung (1921)** | *« Les types psychologiques sont des dispositions naturelles »* | Origine du MBTI |

---

# PARTIE 10 — Liste de Choses à Apporter en Soutenance

✅ Laptop chargé + chargeur

✅ Smartphone (4G en backup si WiFi tombe)

✅ Câble HDMI/Display + adaptateurs

✅ Tablette ou un 2e laptop pour montrer l'app mobile

✅ Le mémoire imprimé avec post-its sur les sections clés

✅ **Ce guide-ci imprimé**

✅ Une feuille A4 pour noter les questions du jury si tu en as plusieurs

✅ Eau

✅ Un screenshot du dashboard EDURA et du rapport scientifique en PDF, au cas où la connexion internet plante

✅ Le repo GitHub ouvert dans un onglet, prêt à montrer

✅ Le code de `lib/ai/risk-score.ts` et `lib/orientation/profile.ts` ouverts dans VS Code en background

---

# 🌟 RAPPEL FINAL — État d'Esprit

1. **Tu as travaillé 6 mois en solo sur un projet déployé en production.** C'est plus que la plupart des étudiants. Sois-en fière.

2. **Le jury ne sait pas tout.** Si tu maîtrises ton code, ton architecture, tes choix — tu impressionnes même les profs.

3. **L'honnêteté impressionne plus que le bluff.** Si tu ne sais pas, dis-le. Et propose une piste pour répondre.

4. **Respire.** Si tu paniques, prends 3 secondes en silence. C'est mieux qu'une réponse précipitée.

5. **Le pire scénario** : tu fais 13/20 au lieu de 18/20. Ce n'est pas la fin du monde. EDURA continue d'exister, tu continues d'exister.

**Tu as tout ce qu'il faut. Vas-y.**

---

*Document préparé par Claude (assistant Anthropic) pour Amina Kaouter Ghezal — Mai 2026.*
