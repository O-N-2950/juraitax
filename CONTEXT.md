# CONTEXT.md — tAIx v7.0
**Dernière mise à jour : 4 mars 2026 — session Moteur NE 100% + intégration app**

---

## 🏢 ENTITÉS & CONTACTS

| Entité | Rôle | Contact |
|--------|------|---------|
| **PEP's Swiss SA** | Éditeur tAIx | Bellevue 7, 2950 Courgenay |
| **WW Finance Group Sàrl** | Partenaire FINMA | Bellevue 7, 2950 Courgenay · 032 466 11 00 · contact@winwin.swiss · FINMA F01042365 |

---

## 🌐 MARQUE & DOMAINES

- **Nom officiel** : tAIx
- **Tagline** : "Déclarations Fiscales Suisses Intelligentes"
- **Domaine** : taix.ch (acquis)
- **Logo HD** : public/logo_taix_hd.png
- **Email** : contact@taix.ch

---

## 🏗 ARCHITECTURE TECHNIQUE

### Repo
- **GitHub** : https://github.com/O-N-2950/juraitax (branche main)
- **Stack** : React + Vite, CSS-in-JS inline
- **dist/ committé** → Railway sert dist/ directement

### Hébergement
- **TEST** : Railway → https://juraitax-app-production-f257.up.railway.app
- GitHub Actions → build → deploy Railway automatique sur push main ✅
- **CIBLE** : Infomaniak VPS (migration planifiée)

### Clés API
- **Anthropic** : env var Railway VITE_ANTHROPIC_API_KEY
- **Stripe** : env var Railway STRIPE_SECRET_KEY
- OCR via proxy Express /api/anthropic → évite CORS

---

## 📁 FICHIERS CLÉS

| Fichier | Rôle | Version |
|---------|------|---------|
| `engine.js` | Moteur JU 2025 + **routeur multi-canton** | **v2 — JU+NE** |
| `ne_engine_2025.js` | Moteur NE 2025 complet | **v1.0 — 100% validé** |
| `justificatifs.js` | Justificatifs JU 6 langues | v1 |
| `screens.jsx` | UI principale | v11 |
| `store.js` | Zustand state + persistence | v2 |
| `ChecklistDocs.jsx` | Upload + OCR | v6 cross-platform |
| `cantonDetector.js` | Détection canton par URL/IP | stable |
| `server.js` | Express proxy Anthropic | stable |

---

## 🗺 MOTEURS FISCAUX — ÉTAT

### PRINCIPE ABSOLU : 100% validé ou pas en production

| Canton | Fichier | Statut | Validé |
|--------|---------|--------|--------|
| **Jura** | `engine.js` | ✅ Production | Cas Neukomm 9/9 codes ✅ |
| **Neuchâtel** | `ne_engine_2025.js` | ✅ Intégré | Barème au centime ✅ |
| **Berne** | — | 🔜 Demain | Fichiers Claude Code prêts |
| **Vaud** | — | 🔜 Demain | — |
| **Genève** | — | 🔜 — | — |
| **Fribourg** | — | 🔜 — | — |

### Routeur canton (engine.js)
```javascript
calculerDeclarationRouter(data)
// data.canton === 'NE' → ne_engine_2025.js
// data.canton === 'JU' (défaut) → moteur JU existant
// Retour unifié: { impotTotal, impotCantonal, impotCommunal, impotFed, impotFor, detail, optimisations }
```

---

## 🏔 MOTEUR NEUCHÂTEL 2025 — DONNÉES CLÉS

Source: Clic & Tax 2025 (NE-2025-N.jar, DrTax/Ringler) — reverse-engineered 100%

| Paramètre | Valeur | Source |
|-----------|--------|--------|
| Barème revenu | TarifNE_1, 25 tranches, tarif UNIQUE | TarifNE_1.java |
| Splitting marié | ÷ 1.923076923 (= 25/13) | TaxRates.java |
| Centimes État | 124 | ModuleNE.java |
| Communes | 24 communes, 63–79 centimes | GemeindeSteuerFuesseNE |
| Franchise fortune | 0 CHF | absent du switch |
| Impôt église | 11% impôt cantonal, min 10 CHF | NEParameters |
| Pilier 3a salarié | 7'258 CHF | ModuleConstantsNp |
| Pilier 3a indép. | 20%, max 36'288 CHF | ModuleConstantsNp |
| Frais maladie | franchise 5% revenu net, illimité | emv.java |
| Frais formation | max 12'400 CHF (ICC) | IUtcConstNP$NE |
| Intérêts hypo | fortune brute + 50'000 CHF | FuncPrivateDebt... |
| ZVA double revenu | 25% du + petit revenu, max 1'200 CHF | ModuleConstantsNp |
| Déduction couple | 3'600 CHF | get_GH_AbzugEhegatten |
| Frais pro | 3%, min 2'000, max 4'000 CHF | initPauschalHaupterwerb |

### Mise à jour annuelle NE (fichiers à demander à Claude Code)
TarifNE_1.java · TarifNE_3.java · GemeindeSteuerFuesseNE.java · NEParameters.java  
ModuleNE.java · IUtcConstNP$NE.java · ModuleConstantsNp.java · ProcInsurancefeeReductionProcessor.java

---

## 🔧 BUGS RÉSOLUS — RÉFÉRENCE

### BUG iOS (1er mars 2026)
- 35 photos plantaient silencieusement → compression canvas 1800px/JPEG82%
- Caméra iOS ne rouvrait pas → key rotation DOM

### BUG OCR champs (session précédente)
- Mapping OCR → formulaire désaligné → corrigé dans Form.jsx

---

## 💰 BUSINESS MODEL

| Plan | Prix | Cible |
|------|------|-------|
| Particulier lancement | CHF 29 (100 premiers) | B2C |
| Particulier standard | CHF 49 | B2C |
| Fiduciaire | CHF 0 (accès illimité) | B2B — WIN WIN |
| Seniors | Courrier postal | Segment spécial |

- Paywall après calcul (pas avant)
- Fiduciaires = partenaires B2B, jamais concurrents
- Lead gen pour services WIN WIN Finance (3a, assurances, hypothèques)

---

## 🌍 INTERNATIONALISATION

6 langues : FR · DE · IT · PT · ES · EN  
Cible principale : communautés immigrées (portugais, espagnol)  
Avantage concurrentiel majeur sur le marché suisse
