# tAIx / JuraTax — CONTEXT.md
_Mis à jour : 5 mars 2026_

## Projet
Application fiscale suisse IA — PEP's Swiss SA + WIN WIN Finance Group.
FINMA license WIN WIN. Repo : https://github.com/O-N-2950/juraitax
Railway : https://juraitax-app-production-f257.up.railway.app

## Stack
- Frontend : React / Vite (280 modules)
- Hosting : Railway (→ Infomaniak prod, données en Suisse)
- DB : PostgreSQL + pgvector (RAG, pas encore déployé)
- Embeddings : Cohere multilingual
- IA : Claude API (Anthropic) — OCR + conseiller fiscal

## État des moteurs fiscaux

| Canton | Fichier | État | Communes |
|--------|---------|------|----------|
| JU | ju_engine_2025.js | ✅ Production | ~60 |
| NE | ne_engine_2025.js | ✅ Production | 24 |
| BE | be_engine_2025.js | ✅ Production | 359 |
| VD | — | 🔜 À faire | — |
| VS | — | 🔜 À faire | — |
| FR | — | 🔜 À faire | — |

## Architecture moteurs
- engine.js : routeur calculerDeclarationRouter(canton, data)
- config.js : COMMUNES_PAR_CANTON {JU, NE, BE}
- Form.jsx : autocomplete communes dynamique selon canton du store
- Commit 90082c5 — JU ✅ NE ✅ BE ✅ build Vite OK

## IA — FiscalAdvisor
- OCR : Claude Vision → extraction données documents ✅
- Conseiller : Claude API avec system prompt fiscal ✅
- RAG : prévu PostgreSQL + pgvector — PAS encore déployé
- Sans RAG : Claude répond avec connaissance générale (pas de citations légales précises)

## RAG — Roadmap
Architecture prévue (Railway dev → Infomaniak prod) :
1. PostgreSQL + pgvector sur Railway
2. Cohere multilingual embeddings
3. Knowledge base : LIFD, ICC JU/NE/BE, jurisprudence
4. Migration Infomaniak : pg_dump + variables d'env → données restent en Suisse

## Business
- Paywall : 49 CHF (29 CHF 100 premiers clients)
- WIN WIN B2B : contact@winwin.swiss (accès illimité gratuit)
- Seniors : courrier postal
- Fiduciaires : partenaires B2B, pas concurrents
- Adresse : PEP's Swiss SA, Bellevue 7, 2950 Courgenay

## Principes
- **100% validé ou pas en production** — pas de "90% suffisant"
- Chaque canton validé au centime avant mise en ligne
- Infomaniak prod : données fiscales ne quittent jamais la Suisse
- Moteurs extraits depuis PrivateTax / Clic&Tax (reverse engineering légal)

## Mise à jour annuelle NE
Vérifier : TarifNE_1, TarifNE_3, GemeindeSteuerFuesseNE, NEParameters, ModuleNE,
IUtcConstNP$NE, ModuleConstantsNp, ProcInsurancefeeReductionProcessor.
Prompt Claude Code pour 2026 : voir fichier projet "pour_les_déclarations_2026..."
