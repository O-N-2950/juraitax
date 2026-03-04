# CONTEXT.md — tAIx v7.0
**Dernière mise à jour : 4 mars 2026 — Moteur NE 100% + intégration app**

---

## 🏢 ENTITÉS & CONTACTS

| Entité | Rôle | Contact |
|--------|------|---------|
| **PEP's Swiss SA** | Éditeur tAIx | Bellevue 7, 2950 Courgenay |
| **WW Finance Group Sàrl** | Partenaire FINMA | contact@winwin.swiss · FINMA F01042365 |

---

## 🌐 MARQUE & DOMAINES

- **Nom officiel** : tAIx · **Tagline** : "Déclarations Fiscales Suisses Intelligentes"
- **Domaine** : taix.ch (acquis) · **Email** : contact@taix.ch

---

## 🏗 ARCHITECTURE TECHNIQUE

- **GitHub** : https://github.com/O-N-2950/juraitax (branche main)
- **Stack** : React + Vite, CSS-in-JS inline, dist/ committé
- **TEST** : Railway → https://juraitax-app-production-f257.up.railway.app
- **Clés** : VITE_ANTHROPIC_API_KEY + STRIPE_SECRET_KEY en env vars Railway (jamais dans le code)

---

## 📁 FICHIERS CLÉS

| Fichier | Rôle | Version |
|---------|------|---------|
| `engine.js` | Moteur JU 2025 + **routeur multi-canton** | v2 — JU+NE |
| `ne_engine_2025.js` | Moteur NE 2025 complet | v1.0 — 100% validé |
| `justificatifs.js` | Justificatifs JU 45 types, 6 langues | v1 |
| `screens.jsx` | UI principale | v11 |
| `store.js` | Zustand + persistence localStorage | v2 |
| `ChecklistDocs.jsx` | Upload + OCR multi-pages | v6 cross-platform |
| `cantonDetector.js` | Détection canton par URL | stable |
| `server.js` | Express proxy Anthropic (évite CORS) | stable |

---

## 🗺 MOTEURS FISCAUX — ÉTAT

### PRINCIPE ABSOLU : 100% validé ou pas en production

| Canton | Fichier | Statut | Pop. |
|--------|---------|--------|------|
| **Jura** ✅ | `engine.js` | Production — cas Neukomm 9/9 ✅ | 73K |
| **Neuchâtel** ✅ | `ne_engine_2025.js` | Intégré — barème au centime ✅ | 177K |
| **Berne** 🔜 | — | Prompt Claude Code prêt | 1.04M |
| **Vaud** 🔜 | — | Prompt à construire | 812K |
| **Genève** 🔜 | — | Sprint 2 | 504K |
| **Fribourg** 🔜 | — | Sprint 2 | 324K |

### Routeur canton (engine.js)
```js
calculerDeclarationRouter(data)
// data.canton === 'NE' → ne_engine_2025.js
// data.canton === 'JU' (défaut) → moteur JU
// Retour unifié : { impotTotal, impotCantonal, impotCommunal, impotFed, impotFor, detail, optimisations }
```

---

## 🏔 MOTEUR NE 2025 — DONNÉES CLÉS (à ne pas re-chercher)

| Paramètre | Valeur | Source Java |
|-----------|--------|-------------|
| Barème revenu | TarifNE_1, 25 tranches, tarif UNIQUE | TarifNE_1.java |
| Splitting marié | ÷ 1.923076923 (= 25/13) | TaxRates.java |
| Centimes État | 124 | ModuleNE.java |
| 24 communes | 63–79 centimes | GemeindeSteuerFuesseNE |
| Franchise fortune | 0 CHF (absent du switch) | — |
| Impôt église | 11% impôt cantonal, min 10 CHF | NEParameters |
| Pilier 3a salarié | 7'258 CHF | ModuleConstantsNp |
| Pilier 3a indép. | 20%, max 36'288 CHF | ModuleConstantsNp |
| Frais maladie | Franchise 5% revenu net, illimité | emv.java |
| Frais formation | Max 12'400 CHF (ICC) | IUtcConstNP$NE |
| Intérêts hypo | Fortune brute + 50'000 CHF | FuncPrivateDebt... |
| ZVA double revenu | 25% du + petit revenu, max 1'200 CHF | ModuleConstantsNp |
| Déduction couple | 3'600 CHF | get_GH_AbzugEhegatten |
| Frais pro | 3%, min 2'000, max 4'000 CHF | initPauschalHaupterwerb |

### Mise à jour annuelle NE (fichiers à demander à Claude Code)
TarifNE_1.java · TarifNE_3.java · GemeindeSteuerFuesseNE.java · NEParameters.java  
ModuleNE.java · IUtcConstNP$NE.java · ModuleConstantsNp.java · ProcInsurancefeeReductionProcessor.java

---

## 💰 BUSINESS MODEL

| Plan | Prix | Cible |
|------|------|-------|
| Particulier lancement | CHF 29 (100 premiers) | B2C |
| Particulier standard | CHF 49 | B2C |
| Fiduciaire | Gratuit illimité | B2B WIN WIN |
| Seniors | Courrier postal | Segment spécial |

- Fiduciaires = partenaires B2B, jamais concurrents
- Lead gen → services WIN WIN (3a, assurances, hypothèques)
- 6 langues : FR · DE · IT · PT · ES · EN (avantage concurrentiel communautés immigrées)
