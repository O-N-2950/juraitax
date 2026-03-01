# CONTEXT.md — tAIx v6.0
**Dernière mise à jour : 1er mars 2026 — fin de session**

---

## 🏢 ENTITÉS & CONTACTS

| Entité | Rôle | Contact |
|--------|------|---------|
| **PEP's Swiss SA** | Éditeur tAIx | Bellevue 7, 2950 Courgenay |
| **WW Finance Group Sàrl** | Partenaire FINMA (subsides, 3a, assurances) | Bellevue 7, 2950 Courgenay · 032 466 11 00 · contact@winwin.swiss · FINMA F01042365 |

---

## 🌐 MARQUE & DOMAINES

- **Nom officiel** : tAIx (t minuscule, AI majuscule, x minuscule)
- **Tagline** : "Déclarations Fiscales Suisses Intelligentes"
- **Domaine** : taix.ch ✅ acquis
- **Logo HD** : public/logo_taix_hd.png (2400×1300px 300dpi)
- **Email** : contact@taix.ch

---

## 🏗 ARCHITECTURE TECHNIQUE

### Repo principal
- **GitHub** : https://github.com/O-N-2950/juraitax
- **Branche** : main
- **Stack** : React + Vite, 25 fichiers src/, CSS-in-JS inline

### Hébergement
- **TEST (actuel)** : Railway → https://juraitax-app-production-f257.up.railway.app
  - ⚠️ Railway ne redéploie PAS automatiquement — il faut déclencher manuellement depuis railway.app → Redeploy
  - Le dist/ est committé dans le repo (dist/ hors .gitignore) pour contournement
- **CIBLE finale** : Infomaniak VPS (migration planifiée — voir TODO étapes 1-9)

### Clés API (CONFIDENTIELLES)
- **Anthropic** : sk-ant-api03-HOt1pC... (dans variables Railway)
- **Stripe** : sk_live_51R6rR9... (NE PAS exposer côté client)
- **Stripe PK** : à récupérer depuis dashboard Stripe (pk_live_...)

### GitHub Actions
- `.github/workflows/deploy.yml` en place
- Build OK (npm install + npm run build)
- Deploy Railway échoue (RAILWAY_TOKEN secret manquant)
- **Action requise** : railway.app → Settings → Token → copier dans GitHub Secrets → RAILWAY_TOKEN

---

## 📁 FICHIERS SRC — ÉTAT COMPLET

| Fichier | Rôle | État |
|---------|------|------|
| `screens.jsx` | Écrans Welcome/Checklist/Form/Result | v9 — SubsidyWinWin + args marketing |
| `ChecklistDocs.jsx` | Upload documents + OCR | v3 — **multi-pages** (plusieurs photos/fichiers par doc) |
| `FiscalAdvisor.js` | Cerveau IA questions fiscales | v2 — question subsides LAMal ajoutée |
| `AdvisorScreen.jsx` | UI questions interactives | v1 — oui/non/montant/choix/nombre |
| `SubsidyWinWin.jsx` | Détection subsides + 3a + WinWin | v1 — NOUVEAU cette session |
| `WowEffects.jsx` | Confetti, AnimatedAmount, CantonWatermark | v2 — SavingsBadge masqué B2B |
| `PrintContribuable.js` | Impression A4 copie contribuable | v1 |
| `RapportFiscal.js` | Rapport fiscal PDF | v1 |
| `JustificatifsPDF.js` | PDF justificatifs | v1 — bug spread fixé |
| `engine.js` | Calcul fiscal JU 2025 | stable |
| `config.js` | Barèmes, communes, subsides | stable — subsides LAMal inclus |
| `i18n.js` | 7 langues | v2 — adv_temps + adv_erreur ajoutés |
| `ocr.js` | OCR Claude Vision | stable |
| `store.js` | Zustand state | stable |
| `TrustBadges.jsx` | Badges confiance Suisse/LPD/FINMA | stable |
| `DepotDeclaration.jsx` | Adresses dépôt 4 cantons | stable |
| `stripe.js` | Paiement + métadonnées LPD/FINMA | stable |
| `security.js` | CSP, rate limiting, anti-XSS | stable |

---

## ✅ FONCTIONNALITÉS ACTIVES

### Core fiscal
- Moteur ICC + IFD + Fortune + Communal Canton Jura 2025
- OCR 12 types documents (Claude Vision)
- **Upload multi-pages** : plusieurs photos par document, OCR fusionné page par page, compteur "✅ 15 pages chargées", bouton "+ Ajouter pages"
- FiscalAdvisor : conseiller IA temps réel, questions ciblées profil + documents, alertes changements vs N-1
- 7 langues : fr, de, it, pt, es, en, uk

### Subsides & Optimisation (SubsidyWinWin.jsx)
- Détection automatique éligibilité subsides LAMal (RDU = revenu + 1/5 fortune)
- Détection pilier 3a non maximisé + barre de progression % utilisé
- Carte WinWin Finance Group (tel + email cliquables)
- Bouton "Transférer ma demande" → email pré-rempli avec données contribuable
- Message disclaimer FINMA

### Marketing (Welcome screen)
- ⏱️ "20 minutes, pas 3 heures" — comparaison vs site officiel
- 🛡️ "L'erreur est humaine — pas avec tAIx" — mention jurisprudence + lois cantonales
- Trust badges hébergement suisse, LPD, FINMA
- SavingsBadge masqué en mode B2B fiduciaire

### B2B
- Mode fiduciaire (contact@winwin.swiss = accès illimité gratuit)
- Tarifs B2B : solo CHF 490/20DI · cabinet CHF 990/60DI · illimité CHF 1'990
- SavingsBadge "vs fiduciaire" masqué en B2B

### PWA (Progressive Web App)
- manifest.json + icon-192.png + icon-512.png
- Installation iPhone : Safari → Partager → "Sur l'écran d'accueil"
- Plein écran sans barre Safari

---

## 💊 SUBSIDES LAMAL — LOGIQUE

```javascript
// Seuils Canton Jura 2025 (config.js → BAREMES.subsides)
adulte_max_rdu: 26999      // RDU max pour éligibilité adulte seul
supplement_famille_rdu: 18000  // supplément si marié ou enfants
fortune_max: 150000         // fortune max
adulte_montant_max: 225     // CHF/mois
enfant_montant: 97          // CHF/mois
```

Calcul RDU = revenu imposable + fortune/5
Si éligible ET ne bénéficie pas encore → afficher bloc WinWin

---

## 🔗 SOLURIS — INTÉGRATION PRÉVUE

- **Repo** : https://github.com/O-N-2950/soluris
- **Architecture** : FastAPI + PostgreSQL pgvector + Cohere embeddings 1024dim
- **Données** : 15 codes Fedlex + 175k+ décisions jurisprudence
- **Session Soluris faite** : prompt envoyé pour ajouter 26 lois cantonales fiscales + LIFD + LHID + OPP3 + circulaires AFC
- **À faire** : endpoint POST /api/fiscal-query (sans auth, clé interne TAIX_INTERNAL_KEY)
- **Objectif** : tAIx cite "Art. 82 LPP · ATF 148 II 121 · Circ. AFC n°18" sous chaque déduction

---

## 📅 MOUTIER 2027

- 1er jan 2026 : Moutier officiellement Canton Jura
- DI 2025 : encore bernoise (délai 15 mars 2026)
- **Première DI jurassienne** : année 2026, déposée en 2027
- Plan : prix CHF 39, code promo MOUTIER2027, landing taix.ch/moutier, contact administration@moutier.ch
- **Ne rien faire avant janvier 2027**

---

## 🔑 CHIFFRES CLÉS PRICING

| Offre | Prix | Note |
|-------|------|------|
| Particulier lancement | CHF 29 | 100 premiers |
| Particulier standard | CHF 49 | après lancement |
| Prolongation | CHF 9 | accès N+1 |
| B2B Solo | CHF 490 | 20 DI |
| B2B Cabinet | CHF 990 | 60 DI |
| B2B Illimité | CHF 1'990 | quota illimité |
| WinWin B2B | GRATUIT | accès illimité |
| Moutier 2027 | CHF 39 | prix spécial |
