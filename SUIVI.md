# SUIVI.md — tAIx
> Historique des sessions de développement

---

## Session 4 mars 2026 — Moteur NE 100%

### Accompli
- Reverse-engineering Clic & Tax 2025 (NE-2025-N.jar) complet
- ne_engine_2025.js : 670 lignes, barème vérifié au centime
  - TarifNE_1 (25 tranches) · TarifNE_3 · 24 communes · splitting 1.923077
  - ZVA 25%/max1200 · pilier3a 7258/36288 · frais maladie 5% · formation 12400
- engine.js : routeur multi-canton JU/NE + format unifié

### En suspens
- Form.jsx : NE pas encore branché (communes + canton passé au moteur)
- BE/VD/GE/FR : prompt Claude Code prêt, à exécuter demain

---

## Session 1er mars 2026 — ChecklistDocs + iOS

### Accompli
- Fix iOS : 35 photos plantaient → compression canvas 1800px/JPEG82%
- Fix caméra iOS ne rouvrait pas → key rotation DOM
- ChecklistDocs v6 : architecture 2 phases stricte (collecte → analyse)
- store.js v2 : persistence localStorage 12 mois

---

## Session précédente — Justificatifs + OCR

### Accompli
- justificatifs.js : 45 types de documents, 6 langues
- Correction mapping OCR → champs formulaire
- Moteur JU 100% validé sur cas Neukomm (9/9 codes)

---

## Session initiale — Architecture + JU

### Accompli
- Reverse-engineering JuraTax 2025 (model.xml + CF classes, DvBern)
- engine.js : moteur JU complet (barèmes ICC/IFD, communes, déduction 670/525)
- Validé sur déclaration Neukomm 2025 (couple rentiers, immeuble)
- Architecture React/Vite + Railway + GitHub Actions
