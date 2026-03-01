# JurAI Tax — CONTEXT.md
## Mémoire projet complète · Mars 2026 · v3.0

---

## 🏢 ENTITÉS JURIDIQUES

| Entité | Rôle | Adresse |
|---|---|---|
| **PEP's Swiss SA** | Éditeur logiciel JurAI Tax | Bellevue 7, 2950 Courgenay |
| **WIN WIN Finance Group SARL** | Mandataire fiscal & courtier assurance agréé | FINMA F01042365 |

**Email principal B2B:** contact@winwin.swiss (accès illimité gratuit)
**Email admin:** admin@juraitax.ch

---

## 🌐 PORTFOLIO DOMAINES (tous sur Infomaniak)

| Domaine | Canton | App | Marché DI/an | Statut |
|---|---|---|---|---|
| juraitax.ch | Jura (JU) | JurAI Tax | 42'000 | ✅ EN PROD |
| neuchtaix.ch | Neuchâtel (NE) | NeuChTAIX | 85'000 | Phase 2 Q3 2026 |
| ticinaitax.ch | Tessin (TI) | TicinaITax | 175'000 | Phase 2 Q4 2026 |
| ticinaitax.online | Tessin (TI) backup | TicinaITax | — | Réserve |
| fritaix.ch | Fribourg (FR) | FriTAIX | 130'000 | Phase 3 Q1 2027 |
| vstaix.ch | Valais (VS) | VSTAIX | 165'000 | Phase 3 Q1 2027 |
| vaudtaix.ch | Vaud (VD) | VaudTAIX | 360'000 | Phase 4 Q3 2027 |
| getaix.ch | Genève (GE) | GeTAIX | 240'000 | Phase 4 Q3 2027 |
| zuritaix.ch | Zurich (ZH) | ZuriTAIX | 500'000 | Phase 5 2028 |
| pepsstart.ch | PEP's Swiss SA | Corporate | — | Institutionnel |
| pepsstart.com | PEP's Swiss SA | Corporate INT | — | Institutionnel |

**Total marché accessible:** 1'700'000+ DI/an (tous cantons)
**Hébergement:** Infomaniak CH (20 sites inclus) — chaque domaine = virtual host → même app Node.js

---

## 💰 TARIFICATION

### B2C Particuliers
- CHF 29 — 100 premiers clients (lancement)
- CHF 49 — prix standard
- CHF 9 — add-on prolongation délai
- CHF 49 — option courrier senior (adresse: Bellevue 7, 2950 Courgenay)

### B2B Fiduciaires
| Plan | Prix/an | Quota | Extra/DI |
|---|---|---|---|
| Solo | CHF 490 | 20 DI | CHF 29 |
| Cabinet | CHF 990 | 60 DI | CHF 29 |
| Unlimited | CHF 1'990 | Illimité | — |
| WIN WIN Finance Group | CHF 0 | Illimité | — |

**WIN WIN facture CHF 49 à ses propres clients** (FINMA F01042365 couvre conseil proactif: pilier 3a, subsides LAMal, recommandations assurance)

### Positionnement vis-à-vis des fiduciaires
⚠️ **RÈGLE ABSOLUE:** Ne jamais critiquer les fiduciaires dans aucune communication.
Les fiduciaires sont des **partenaires B2B cibles** (packs Solo/Cabinet/Unlimited).
L'argument "erreurs oubliées" cible UNIQUEMENT les particuliers qui remplissent eux-mêmes leur déclaration — jamais les fiduciaires.

---

## 🌍 STRATÉGIE MULTILINGUE — 7 LANGUES DÈS LE DÉPART

| Langue | Code | Priorité | Population CH | Zone de concentration |
|---|---|---|---|---|
| Français | fr | Tier 1 | ~2M | Suisse romande — langue officielle |
| Allemand | de | Tier 1 | ~5M | Suisse alémanique — cantons bilingues VS/FR |
| Italien | it | Tier 1 | ~330'000 étrangers IT + Tessin | TI, ZH, GE |
| Portugais | pt | Tier 1 | ~270'000 | **Jura & NE: 1ère minorité** |
| Espagnol | es | Tier 1 | ~105'000 | GE, VD, ZH |
| Anglais | en | Tier 1 | ~45'000 UK + expats | GE, ZH, VD |
| **Ukrainien** | **uk** | **Tier 1** | **~65'000** | **BE, ZH, VD, GE — réfugiés depuis 2022** |

### Tier 2 — post-expansion alémanique
- **Albanais** (al) — 115'000 Kosovars, BE/ZH
- **Serbe/Croate/Bosnien** (sr) — 150'000+, Jura/BE/ZH (une seule implémentation suffit)
- **Turc** (tr) — 80'000, ZH/Biel

### Argument Ukrainien — contexte unique
Depuis l'invasion russe de février 2022, **~65'000 Ukrainiens** ont obtenu le statut S en Suisse (protection temporaire). Ces réfugiés, souvent qualifiés (ingénieurs, enseignants, médecins), intègrent progressivement le marché du travail suisse et doivent remplir une déclaration d'impôts. **Aucun logiciel fiscal suisse ne leur parle en ukrainien.** JurAI Tax est le premier.

### Règles de traduction
- Interface dans la langue choisie (libellés, aide, explications)
- Chiffres/calculs identiques dans toutes les langues
- La pression fiscale reste dans la langue officielle du canton
- OCR indépendant de la langue d'interface (attestations fédérales = identiques)

### Argument WIN WIN v2
**Première fois en Suisse** qu'un courtier FINMA conseille en PT/ES/AL/SR/UK.
Un travailleur portugais au Jura depuis 15 ans n'a jamais eu de conseiller financier dans sa langue.
Un réfugié ukrainien à Berne depuis 2022 non plus.
JurAI Tax capte le lead multilingue → WIN WIN convertit dans sa langue → relation long terme.
Le bouche-à-oreille dans les communautés immigrées = acquisition virale sans coût marketing.

---

## 📄 RAPPORT FISCAL PERSONNALISÉ — DIFFÉRENCIATEUR CLÉ

### Concept
Après chaque déclaration établie, JurAI Tax génère automatiquement un **Rapport fiscal personnalisé A4** (1 page) remis au client avec sa déclaration officielle.

### Ce que le rapport contient (dynamique selon la situation)
Ce rapport mentionne UNIQUEMENT les éléments qui ont réellement influencé CETTE déclaration:
- Identification: nom, commune, année fiscale, canton
- Base légale appliquée (ex: "LRIFD Canton du Jura, édition 2025")
- Pour chaque décision fiscale significative:
  - 🏠 Frais d'entretien d'immeuble: forfait vs réel — lequel a été retenu et pourquoi
  - 💼 Rachat LPP: montant, déductibilité intégrale admise
  - 🏦 Pilier 3a: montant versé, plafond appliqué, économie générée
  - 👨‍👩‍👧 Enfants à charge: garde complète/partagée, déduction applicable
  - 🏥 Frais médicaux: seuil cantonal franchi → déduction retenue
  - 📊 Subsides LAMal: éligibilité détectée
  - etc.
- Récapitulatif: revenu imposable initial → après déductions → économie totale estimée
- Signature: "Établi sur la base du règlement fiscal [Canton], [année]. JurAI Tax — PEP's Swiss SA"

### Valeur pour le client
- Comprend exactement ce qui a été fait et pourquoi — **en sa langue**
- Peut comparer avec les années suivantes (évolution)
- Preuve de sérieux et de transparence

### Valeur pour PEP's Swiss SA / WIN WIN
- **Décharge de responsabilité documentée**: chaque choix fiscal est justifié par écrit
- **Preuve de valeur ajoutée**: le client voit concrètement l'économie réalisée
- **Différenciateur unique**: aucun logiciel fiscal grand public ne produit ce document
- **Fidélisation**: le client revient chaque année avec "son" rapport

### Disponibilité
- 7 langues dès le départ (FR/DE/IT/PT/ES/EN/UK)
- Inclus dans le prix standard CHF 49
- Inclus dans tous les packs B2B

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack implémentée
- **Frontend:** React + Zustand + Vite
- **i18n:** src/i18n.js — 220+ clés, 7 langues ✅ FAIT (v3.0)
- **Détection canton:** src/cantonDetector.js — par nom de domaine ✅ FAIT
- **Sélecteur langue:** src/LangSelector.jsx — dropdown dans chaque écran ✅ FAIT
- **State:** src/store.js — avec lang + canton + cantonConfig + audit trail ✅ FAIT
- **App.jsx:** détection canton au démarrage, theme accent dynamique ✅ FAIT
- **Screens:** tous traduits (Welcome/Courrier/B2B/Loading/Paywall/Result) ✅ FAIT
- **Moteur fiscal:** src/engine.js — Jura 2025

### Stack à venir
- **Backend:** Node.js + Express + PostgreSQL
- **Hébergement dev:** Railway (juraitax-app-production-f257.up.railway.app)
- **Hébergement prod:** Infomaniak Suisse (migration obligatoire avant clients réels LPD)
- **OCR/IA:** Claude API Anthropic (Sonnet)
- **Paiements:** Stripe (CHF natif + Twint)
- **Emails:** Resend
- **Rapport fiscal:** Génération PDF dynamique (reportlab/puppeteer) — À IMPLÉMENTER

### Détection domaine → canton automatique
```
juraitax.ch    → JU + lang FR
neuchtaix.ch   → NE + lang FR
ticinaitax.ch  → TI + lang IT
vstaix.ch      → VS + lang FR
zuritaix.ch    → ZH + lang DE
fritaix.ch     → FR + lang FR
```

---

## 📋 PHILOSOPHIE EXTRACTION DONNÉES

### Règle d'or — Upload First
- **JAMAIS** poser une question si un document peut répondre
- Téléverse → IA extrait → client confirme

### DI précédente (année N-1)
- ✅ Import **identité seulement**: nom, prénom, commune, état civil, confession, enfants, n° contribuable
- ❌ **JAMAIS les chiffres**: revenus, déductions, fortune → toujours recalculés depuis sources 2025

### Audit Trail — 4 états
| État | Couleur | Signification |
|---|---|---|
| AI 🟢 | Vert | Extrait automatiquement depuis document |
| IMPORTED 🟡 | Jaune | Identité depuis DI précédente |
| USER 🔴 | Rouge | Client a modifié la valeur IA (horodaté) |
| MANUAL ⚪ | Gris | Saisi manuellement, aucun document |

---

## 🚀 DÉPLOIEMENT ACTUEL

- **GitHub:** https://github.com/O-N-2950/juraitax
- **Railway (dev):** https://juraitax-app-production-f257.up.railway.app
- **Railway Project ID:** 77f3852f-a31f-45e6-b983-6dc243dc4f1d
- **Railway Service ID:** 03505601-aa45-41ec-aa76-606fa6c0d2ee
- **Dernier commit:** feat ukrainien (7ème langue) + clés rapport fiscal i18n

---

## 📄 DOCUMENTS PRODUITS

| Document | Localisation | Version | Date |
|---|---|---|---|
| Business Plan PDF | /mnt/user-data/outputs/ | v3.0 | Mars 2026 |
| i18n.js (7 langues) | GitHub src/i18n.js | v3.0 | Mars 2026 |
| CONTEXT.md (ce fichier) | GitHub CONTEXT.md | v3.0 | Mars 2026 |

---

## ✅ TODO LIST — État Mars 2026

### 🔴 IMMÉDIAT (cette semaine)
- [ ] Tester dossier André Neukomm sur Railway (flux complet B2B)
- [ ] Valider moteur fiscal Jura 2025 avec vraies attestations
- [ ] Consulter avocat jurassien pour validation CGU (~CHF 300, 1h)
- [ ] Créer compte Stripe (activer paiement réel)

### 🟡 COURT TERME (avant 15 mars 2026)
- [ ] **Migration Railway → Infomaniak** (obligatoire avant clients réels — données fiscales LPD)
- [ ] Backend Node.js + PostgreSQL (remplacer state Zustand)
- [ ] Connexion Claude API (OCR documents réels)
- [ ] Paiement Stripe réel avec paywall actif
- [ ] Emails confirmation + PDF via Resend
- [ ] **Générateur Rapport fiscal A4** (PDF dynamique par client)
- [ ] 5-10 premiers clients réels (réseau WIN WIN)
- [ ] Campagne "100 premiers à CHF 29" sur réseaux locaux

### 🟠 MOYEN TERME (Q2-Q3 2026)
- [ ] Module NE — Neuchâtel (neuchtaix.ch)
- [ ] Module TI — Tessin (ticinaitax.ch) — interface IT + **communauté ukrainienne TI** déjà prête!
- [ ] Interface B2B multi-dossiers tableau de bord fiduciaires
- [ ] Comparaison avis de taxation vs déclaration
- [ ] Langues Tier 2: Albanais + Serbe/Croate/Bosnien
- [ ] Premier partenariat fiduciaire payant Canton du Jura
- [ ] Partenariat associations ukrainiennes en Suisse (bouche à oreille)

### 🔵 LONG TERME (2027+)
- [ ] VS + FR bilingues (fr/de)
- [ ] VD + GE grands marchés
- [ ] **ZH — Zurich 500'000 DI/an** (zuritaix.ch) — plus grand marché Suisse
- [ ] Turc — communauté ZH/Biel
- [ ] Albanais — communauté BE/ZH
- [ ] API banques cantonales / caisses de pension (distribution B2B2C)
- [ ] Module analyse rétrospective 3 ans (réclamations impôts particuliers)
- [ ] Application mobile native iOS + Android
- [ ] **WIN WIN v2** — Application courtage IA multilingue (même stack, même infra)

### ✅ DÉJÀ FAIT
- [x] App React complète déployée sur Railway
- [x] Moteur fiscal Jura 2025 (ICC + IFD + fortune)
- [x] Système i18n **7 langues** (FR/DE/IT/PT/ES/EN/**UK**) — 220+ clés
- [x] Détection automatique canton par domaine
- [x] Sélecteur de langue dropdown (LangSelector.jsx)
- [x] Store Zustand avec lang + canton + audit trail
- [x] Tous les écrans traduits (Welcome/Courrier/B2B/Loading/Paywall/Result)
- [x] Accès B2B (contact@winwin.swiss — illimité gratuit)
- [x] Écran courrier seniors (CHF 49, adresse Courgenay)
- [x] Paywall post-calcul avec optimisations floutées
- [x] CTA WIN WIN en fin de parcours — multilingue
- [x] Portfolio 11 domaines achetés sur Infomaniak
- [x] Business Plan PDF v3.0 (sans critique des fiduciaires, avec Tessin + Zurich + ukrainien + rapport fiscal)
- [x] CONTEXT.md v3.0 complet

---

## 🔗 CONNEXION WIN WIN v2

JurAI Tax = **top of funnel** de WIN WIN v2.
Chaque client JurAI Tax = lead qualifié avec profil financier complet.
WIN WIN v2 = application de courtage IA multilingue (même architecture, même stack).
Les deux apps partagent: base clients, système multilingue, infrastructure Infomaniak.

**Pont multilingue = avantage concurrentiel unique:**
- JurAI Tax en portugais → WIN WIN conseille en portugais → fidélisation communauté portugaise
- JurAI Tax en ukrainien → WIN WIN conseille en ukrainien → fidélisation réfugiés ukrainiens
- JurAI Tax en albanais → WIN WIN conseille en albanais → fidélisation communauté kosovare

---
*Dernière mise à jour: Mars 2026 v3.0 | PEP's Swiss SA + Claude (Anthropic)*
