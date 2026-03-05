# tAIx / JuraTax — TODO.md
_Mis à jour : 5 mars 2026_

## ✅ FAIT

- [x] Moteur JU 2025 — validé, en production
- [x] Moteur NE 2025 — validé, branché dans l'interface
- [x] Moteur BE 2025 — validé (359 communes), branché dans l'interface
- [x] Routeur canton JU/NE/BE dans engine.js
- [x] Communes dynamiques dans Form.jsx selon canton
- [x] Build Vite OK — 280 modules
- [x] Commit 90082c5 pushé sur main → Railway

## 🔜 PROCHAINE SESSION

### PRIORITÉ 1 — Tester sur Railway (30 min)
- [ ] Ouvrir https://juraitax-app-production-f257.up.railway.app
- [ ] Tester un cas JU complet (Guillaume peut faire ça)
- [ ] Tester un cas NE complet
- [ ] Tester un cas BE complet (Bern, célibataire)
- [ ] Vérifier que le sélecteur de communes fonctionne pour les 3 cantons

### PRIORITÉ 2 — Canton Vaud (VD)
Même process que BE :
- [ ] Claude Code : télécharger PrivateTax 2025, extraire TarifVD_*, VGemeindenVD, GemeindeSteuerFuessesVD
- [ ] Générer vd_engine_2025.js
- [ ] Valider au centime
- [ ] Brancher dans engine.js + Form.jsx

### PRIORITÉ 3 — RAG (base de connaissances fiscale)
- [ ] PostgreSQL + pgvector sur Railway
- [ ] Chunking des textes légaux (LIFD, ICC JU/NE/BE)
- [ ] Embeddings Cohere multilingual
- [ ] Brancher FiscalAdvisor sur le RAG
- [ ] Tester que les réponses citent les bons articles de loi
- [ ] Prévoir migration Infomaniak (données en Suisse)

### PRIORITÉ 4 — Cantons suivants
- [ ] VS (Valais)
- [ ] FR (Fribourg)
- [ ] AG, ZH, SG (alémanique, plus tard)

## ⚠️ POINTS D'ATTENTION

- RAG non déployé : FiscalAdvisor répond sans citations légales précises
- Infomaniak migration à planifier avant lancement public
- Guillaume (fiduciaire) peut tester JU/NE/BE sur Railway dès maintenant
