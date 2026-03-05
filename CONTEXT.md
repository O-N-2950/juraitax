# tAIx — CONTEXT.MD
## Mis à jour : 05.03.2026

---

## IDENTITÉ PROJET
- **Application** : tAIx (JurAI Tax) — déclarations fiscales suisses par IA
- **Société** : PEP's Swiss SA, Bellevue 7, 2950 Courgenay
- **Partenaire** : WIN WIN Finance Group (licence FINMA)
- **GitHub** : https://github.com/O-N-2950/juraitax
- **Production** : https://juraitax-app-production-f257.up.railway.app

---

## ARCHITECTURE TECHNIQUE
- React/Vite frontend — Railway hosting — GitHub CI/CD
- PostgreSQL + pgvector (RAG knowledge base) — Cohere embeddings
- Stripe (sk_live) — 6 langues (FR/DE/IT/PT/ES/EN)

## FICHIERS CLÉS
| Fichier | Rôle |
|---------|------|
| `src/FiscalExpert.js` | **LE CERVEAU** — raisonnement expert, docs manquants, optimisations |
| `src/engine.js` | Moteur fiscal JU 2025 (barèmes, quotités, déductions) |
| `src/ne_engine_2025.js` | Moteur NE 2025 |
| `src/be_engine_2025.js` | Moteur BE 2025 |
| `src/ocr.js` | OCR universel Claude — extrait tout document fiscal |
| `src/AdvisorScreen.jsx` | Interface ALIX — dialogue interactif expert fiscal |
| `src/ChecklistDocs.jsx` | Upload documents + lancement OCR + optimisation auto |
| `src/store.js` | État global Zustand |

---

## PRINCIPES ABSOLUS (gravés dans le code)

### 1. EXACTITUDE
- Aucune estimation — document absent = champ bloqué
- Calcul impossible tant qu'un document obligatoire manque
- Principe 100% ou rien — chaque canton validé à 100% avant prod

### 2. OPTIMISATION MAXIMALE (dans l'intérêt du client)
- CHF 300 dons minimum dans TOUTE déclaration (sans justificatif)
- Forfait entretien immeuble 20% automatique si pas de factures
- Forfait frais professionnels 3% (min 2'000 / max 4'000) automatique
- Forfait assurances TOUJOURS le maximum légal selon situation
- Jamais laisser un client payer plus que ce que la loi exige

### 3. INTELLIGENCE PROACTIVE
- Raisonnement en chaîne : "je vois X → je déduis Y → je demande Z"
- Questions intelligentes — jamais de question inutile selon profil
- Retraité → JAMAIS question pilier 3a actif, trajet, télétravail
- Hypothèque détectée → demande automatique relevé intérêts

---

## CANTONS ACTIFS
| Canton | Engine | État |
|--------|--------|------|
| **JU** | engine.js | ✅ Production — bug communal corrigé 05.03.2026 |
| **NE** | ne_engine_2025.js | ✅ Paramètres complets reverse-engineered |
| **BE** | be_engine_2025.js | ✅ Paramètres disponibles |

### JU — Paramètres clés 2025
- Quotité État : 2.85
- Forfait assurances marié sans pilier : **8'380 CHF**
- Déduction couple marié : 3'600 CHF
- Déduction fortune mariés : 57'000 CHF
- Dons max : 20% revenu net I
- Frais maladie franchise : 5% revenu net I

### NE — Paramètres clés 2025
- Centimes État : 124 — Splitting marié : 1.923077
- Pilier 3a : 7'258 (salarié) / 36'288 (indépendant)
- Formation : 12'400 CHF max ICC
- ZVA double salaire : 25% / max 1'200 CHF

---

## DOSSIER NEUKOMM — Test de référence

### Identité
- André Oscar Neukomm (05.06.1936) + Georgine Neukomm-Gafner (01.08.1939)
- Route de la Terrière 11, 2915 **Bure** (JU)
- N° contribuable : 200.628.845.59

### Résultat 2025 calculé et validé
| Code | Libellé | Montant |
|------|---------|---------|
| 490 | Revenu total | 88'371 |
| 525 | Forfait assurances | −8'380 |
| 530 | Intérêts SARON Raiffeisen | −2'121 (**document réel**) |
| 560 | Revenu net I | 77'870 |
| 585 | Dons | −1'000 |
| 590 | Revenu net II | 76'870 |
| 680 | Couple marié | −3'600 |
| **690** | **REVENU IMPOSABLE** | **73'270** |
| 890 | Fortune imposable | 454'000 |

**Total impôts 2025 : ~12'705 CHF → solde en faveur client ~401 CHF**

⚠️ À valider sur guichet.jura.ch avant transmission

---

## BUGFIX CRITIQUE — 05.03.2026
**`calculImpotCommunalICC`** dans engine.js :
- Bug : commune = impotEtat × quotiteCommune → **inflation ~72%**
- Fix : commune = (impotEtat / 2.85) × quotiteCommune ✅

---

## BUSINESS
- B2C : 49 CHF (29 CHF 100 premiers)
- B2B WIN WIN : contact@winwin.swiss — accès illimité gratuit
- Seniors : courrier postal → Bellevue 7, 2950 Courgenay
- Fiduciaires = **partenaires B2B** (jamais concurrents)
