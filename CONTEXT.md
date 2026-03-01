# CONTEXT.md — JurAI Tax / tAIx v4.0
**Dernière mise à jour : Mars 2026**

---

## 🏢 ENTITÉS & CONTACTS

| Entité | Rôle | Contact |
|--------|------|---------|
| **PEP's Swiss SA** | Éditeur JurAI Tax / tAIx | Bellevue 7, 2950 Courgenay · admin@juraitax.ch |
| **WIN WIN Finance Group SARL** | Partenaire courtage FINMA | FINMA F01042365 · contact@winwin.swiss |

---

## 🌐 DOMAINES & MARQUE

### Domaine principal
**www.tAIx.ch** — domaine principal acquis Mars 2026
- Logo officiel : tAIx (t minuscule, AI en bleu, x réseau de nœuds) + drapeau suisse
- Tagline : "Déclarations Fiscales Suisses Intelligentes"
- Couleurs : Navy/dark + bleu électrique IA + rouge suisse

### Architecture domaines (tous acquis sur Infomaniak)
| Domaine | Canton | Usage |
|---------|--------|-------|
| taix.ch | HUB | Portail principal → redirection cantonale |
| taix.app | HUB | Mobile / PWA |
| juraitax.ch | JU | Canton du Jura (Phase 1 — EN PRODUCTION) |
| juraitax.online | JU | Backup JU |
| neuchtaix.ch | NE | Neuchâtel (Phase 2 — Q3 2026) |
| ticinaitax.ch | TI | Tessin (Phase 2 — Q4 2026) |
| ticinaitax.online | TI | Backup TI |
| fritaix.ch | FR | Fribourg (Phase 3) |
| vstaix.ch | VS | Valais (Phase 3) |
| vaudtaix.ch | VD | Vaud (Phase 4) |
| getaix.ch | GE | Genève (Phase 4) |
| zuritaix.ch | ZH | Zurich (Phase 5 — 2028) |

---

## 💰 MODÈLE TARIFAIRE — IMMUABLE

### Règle fondamentale
> **CHF 49 minimum, toujours. Les fiduciaires facturent CHF 200–300 pour le même travail. tAIx est meilleur.**

### B2C Particuliers
| Offre | Prix | Notes |
|-------|------|-------|
| 100 premiers clients | CHF 29 | Lancement uniquement |
| Standard | **CHF 49** | Prix définitif |
| **Abonnement annuel** | **CHF 49/an** | Fidélisation — même prix, expérience supérieure |
| Prolongation délai | CHF 9 (inclus abonné) | Add-on |
| Courrier postal séniors | CHF 49 + frais envoi | |

### B2B Fiduciaires / Conseillers
| Plan | Prix | Dossiers |
|------|------|----------|
| Solo | CHF 490/an | Illimité |
| Cabinet | CHF 990/an | Illimité |
| Unlimited | CHF 1'990/an | Multi-users |
| **WIN WIN Finance Group** | **GRATUIT** | Accès illimité partenaire |

---

## 🔄 ABONNEMENT CHF 49/AN — Fidélisation

### Concept
Après chaque déclaration payée (CHF 49), proposer l'abonnement annuel au **même prix CHF 49** — jamais moins.

### Ce que reçoit l'abonné
- 🔗 **Magic Link** — pas de mot de passe, jamais
- 📋 **Identité pré-remplie** (commune, état civil, enfants, adresse)
- 📅 **3 rappels automatiques** : 1er mars, 20 mars, 5 avril
- 📄 **Rapport fiscal A4 personnalisé** chaque année
- ⏱ **Prolongation délai incluse** (CHF 9 offerts)
- 📊 Historique comparatif année N vs N-1

### Ce qu'on conserve (LPD conforme)
- Identité uniquement (pas les montants, pas les documents)
- Email + langue + canton
- Documents détruits après traitement

### Ce qu'on NE conserve PAS
- Documents uploadés (détruits après OCR)
- Montants fiscaux détaillés
- Données sensibles non-essentielles

### Calendrier rappels automatiques (via Resend)
| Date | Email |
|------|-------|
| 1er mars | "Votre déclaration 2026 — commencez maintenant" |
| 20 mars | Rappel si pas commencé |
| 5 avril | Urgence — délai cantonal approche |

---

## 🌍 LANGUES — 7 TIER 1

| Code | Langue | Pop. CH | Zone | Argument |
|------|--------|---------|------|----------|
| fr | Français | ~2M | JU/NE/GE/VD | Langue officielle |
| de | Deutsch | ~5M | ZH/BE/BS | Expansion ZH |
| it | Italiano | ~330'000 | TI/ZH/GE | Interface TI déjà prête |
| pt | Português | ~270'000 | JU/NE/GE | 1ère minorité JU |
| es | Español | ~105'000 | GE/VD/ZH | |
| en | English | ~45'000 | ZH/GE | Expats |
| uk | Українська | ~65'000 | BE/ZH/VD/GE | 1er logiciel fiscal suisse en ukrainien |

**Tier 2 (roadmap)** : Albanais (115'000), Serbe/Croate/Bosnien (150'000+), Turc (80'000)

---

## 🗺️ EXPANSION CANTONALE

| Phase | Canton | Domaine | DI/an | Timeline | État |
|-------|--------|---------|-------|----------|------|
| 1 | **Jura (JU)** | juraitax.ch | 42'000 | ✅ | EN PRODUCTION |
| 2 | Neuchâtel (NE) | neuchtaix.ch | 85'000 | Q3 2026 | Planifié |
| 2 | **Tessin (TI)** | ticinaitax.ch | 175'000 | Q4 2026 | IT déjà codé |
| 3 | Fribourg (FR) | fritaix.ch | 130'000 | Q1 2027 | |
| 3 | Valais (VS) | vstaix.ch | 165'000 | Q1 2027 | |
| 4 | Vaud (VD) | vaudtaix.ch | 360'000 | Q3 2027 | |
| 4 | Genève (GE) | getaix.ch | 240'000 | Q3 2027 | |
| 5 | **Zurich (ZH)** | zuritaix.ch | 500'000 | 2028 | 🏆 |

**Total marché : 1'700'000+ DI/an**

---

## 🏗️ STACK TECHNIQUE

| Composant | Tech | État |
|-----------|------|------|
| Frontend | React 19 + Zustand + Vite | ✅ |
| i18n | Custom hook — 7 langues, 220+ clés | ✅ |
| Détection canton | cantonDetector.js (domaine → config) | ✅ |
| Moteur fiscal | engine.js — Jura 2025 | ✅ |
| Design system | Luxury Swiss Banking Dark + tAIx brand | ✅ |
| **Checklist docs** | **ChecklistDocs.jsx — 21 docs, camera mobile** | **✅ Mars 2026** |
| **Rapport fiscal A4** | **RapportFiscal.js — jsPDF, dynamique, 7 langues** | **✅ Mars 2026** |
| **Abonnement** | **SubscriptionOffer + store subscriber** | **✅ Mars 2026** |
| OCR Claude API | À connecter | 🟡 |
| Backend | Node.js + PostgreSQL | 🟡 |
| Auth Magic Link | Resend | 🟡 |
| Paiement | Stripe | 🟡 |
| Emails rappels | Resend (cron annuel) | 🟡 |
| Hébergement prod | Infomaniak (LPD) | 🟡 migration |
| Hébergement dev | Railway | ✅ |

---

## 📱 PARCOURS UTILISATEUR

```
Welcome → Checklist Documents (21 docs, camera) 
       → Form (pré-rempli si docs uploadés)
       → Loading (OCR + calcul fiscal)
       → Paywall (CHF 49 — B2C) / Direct (B2B gratuit)
       → Résultat (PDF DI + Rapport fiscal A4)
       → SubscriptionOffer (CHF 49/an — B2C uniquement)
```

### B2B (fiduciaires)
```
B2BLogin (email seul → Magic Link à venir)
       → Dashboard multi-dossiers
       → Form par client
       → Résultat → Rapport fiscal A4
       → Nouveau dossier
```

---

## 📄 LIVRABLES APRÈS DÉCLARATION

### 1. PDF Déclaration officielle
- Format officiel cantonal
- Prêt à soumettre à l'autorité fiscale

### 2. Rapport fiscal personnalisé A4
- 1 page, généré client-side (jsPDF)
- Dynamique — sections selon situation du client
- Explique chaque décision fiscale en langage clair
- Disponible en 7 langues
- Sections : pilier 3a, rachat LPP, frais entretien (forfait vs réel), garde, frais médicaux, primes LAMal, dons
- Récapitulatif : revenu brut → déductions → impôt total
- Décharge responsabilité PEP's Swiss SA (mention légale)
- **Différenciateur unique — aucun concurrent ne propose cela**

---

## 🤝 PARTENARIAT WIN WIN

- WIN WIN Finance Group SARL (FINMA F01042365)
- Accès illimité gratuit : contact@winwin.swiss
- B2B Login : email seul (pas de mot de passe)
- Flux : tAIx traite DI → profil financier complet → WIN WIN conseille dans la langue du client
- **Avantage unique** : 1er courtier FINMA conseillant en PT, ES, UK — jamais fait en Suisse

---

## ✅ TODO LIST

### 🔴 IMMÉDIAT (cette semaine)
- [ ] Test flux complet avec papa (B2B WIN WIN sur Railway)
- [ ] Valider moteur fiscal Jura 2025 avec vraies attestations
- [ ] Consulter avocat jurassien — CGU (~CHF 300)
- [ ] Créer compte Stripe
- [ ] Connecter **clé Anthropic API** (récupérer depuis Railway) → OCR réel

### 🟡 COURT TERME (avant 15 mars 2026)
- [ ] Migration Railway → **Infomaniak** (LPD obligatoire)
- [ ] Backend Node.js + PostgreSQL
  - [ ] Table `subscribers` (email, identité, langue, canton, dates rappels)
  - [ ] Endpoint POST /api/subscribe
  - [ ] Cron Resend — rappels annuels automatiques
- [ ] Claude API OCR — lire vrais documents uploadés
- [ ] Stripe paywall actif (CHF 49)
- [ ] Magic Link via Resend
- [ ] Emails rappels abonnement (3 dates : 1 mars, 20 mars, 5 avril)
- [ ] Campagne "100 premiers à CHF 29"
- [ ] Configurer **taix.ch** → redirect hub cantons

### 🟠 MOYEN TERME (Q2-Q3 2026)
- [ ] Module Neuchâtel (NE)
- [ ] **Module Tessin (TI)** — interface IT déjà prête, moteur fiscal TI à coder
- [ ] Interface B2B multi-dossiers (dashboard fiduciaire)
- [ ] Partenariat fiduciaires JU (Porrentruy, Delémont)
- [ ] **Contact associations ukrainiennes Suisse** (bouche-à-oreille)
- [ ] App mobile iOS/Android (PWA d'abord, puis native)
- [ ] Langues Tier 2 : Albanais + Serbe/Croate/Bosnien

### 🔵 LONG TERME (2027-2028)
- [ ] VS + FR (cantons bilingues)
- [ ] VD + GE (grands marchés)
- [ ] **ZURICH (ZH) — 500'000 DI/an**
- [ ] WIN WIN v2 : courtage IA multilingue complet
- [ ] Mobile natif iOS + Android

---

## ✅ DÉJÀ LIVRÉ

- [x] Frontend React — Welcome, Form, Loading, Paywall, Result
- [x] i18n 7 langues (FR/DE/IT/PT/ES/EN/UK) — 220+ clés
- [x] Moteur fiscal Jura 2025
- [x] B2B Login (email → accès fiduciaires)
- [x] **ChecklistDocs.jsx** — 21 documents, camera mobile, 7 langues
- [x] **RapportFiscal.js** — générateur PDF A4 dynamique jsPDF, 7 langues
- [x] **SubscriptionOffer** — écran abonnement CHF 49/an + bouton résultat
- [x] store.js — subscriber state + saveSubscriberProfile
- [x] Mobile responsive CSS (touch targets, safe-area, iOS zoom fix)
- [x] Logo tAIx officiel — "Déclarations Fiscales Suisses Intelligentes"
- [x] Domaine **taix.ch** acquis
- [x] Business Plan PDF v3.0 (10 chapitres, Tessin + Zurich + ukrainien)
- [x] CONTEXT.md v4.0

---

## 📊 PROJECTIONS FINANCIÈRES

| Année | Cantons | DI traitées | CA | EBITDA |
|-------|---------|-------------|-----|--------|
| 2026 | JU | ~1'000 | CHF 45k | Investissement |
| 2027 | JU+NE+TI+FR+VS | ~8'000 | CHF 340k | ~CHF 50k |
| 2028 | +VD+GE | ~25'000 | CHF 1'150k | ~CHF 350k |
| 2029 | +ZH | ~60'000 | CHF 2'800k | ~CHF 900k |
| 2030 | Tous + Mobile | ~150'000 | CHF 7'200k | ~CHF 2'500k |

*Taux pénétration conservateur 0.5% à 3% selon canton.*

---

*CONTEXT.md v4.0 — tAIx / JurAI Tax — PEP's Swiss SA × WIN WIN Finance Group SARL — Mars 2026*
