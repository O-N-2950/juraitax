# SUIVI.md — tAIx
> Journal de bord technique · PEP's Swiss SA
> Créé : 4 mars 2026

---

## SESSION 4 mars 2026 — Moteur Neuchâtel 100%

### Objectif
Atteindre 100% de certitude sur le moteur fiscal NE 2025 (principe absolu tAIx).

### Travail effectué

**1. Extraction 10% manquants (via Claude Code)**
Après avoir extrait 90% lors de la session précédente, 4 éléments manquaient dans le JAR obfusqué :

| Élément | Valeur trouvée | Source |
|---------|---------------|--------|
| Pilier 3a salarié | 7'258 CHF | ModuleConstantsNp.java:792 |
| Pilier 3a indépendant | 20% / max 36'288 CHF | emx.java (Pillar3aDeductionConfig) |
| Frais maladie | Franchise 5%, illimité | emv.java (HealthDeductionConfig) |
| Frais formation | 12'400 CHF ICC / 13'000 IFD | IUtcConstNP$NE.java:21 |
| Intérêts hypo | Fortune brute + 50'000 CHF | FuncPrivateDebtInterestsDeduction.java:74 |

**2. Découverte ZVA (double revenu) depuis les barèmes existants**
- Taux : 25% du + petit revenu des conjoints
- Maximum : 1'200 CHF
- Minimum : 0 CHF
- Source : get_GH_Prozent_ZVA() + get_GH_MaxBetrag_ZVA()

**3. Construction ne_engine_2025.js**
- 656 lignes (+ 14 lignes export ES module)
- Validation points de contrôle barème TarifNE_1 : 6/6 exacts au centime
- 3 cas tests : célibataire Neuchâtel, couple La Chaux-de-Fonds, rentiers Le Locle

**4. Intégration dans l'app**
- `ne_engine_2025.js` : export ES module ajouté pour Vite
- `engine.js` : import statique NE + `calculerDeclarationRouter()` + adaptateurs store→NE et NE→format unifié
- Interface `screens.jsx` inchangée

### Commits GitHub
- `🏔️ Moteur fiscal Neuchâtel 2025 — 100% validé` (ne_engine_2025.js)
- `✅ ne_engine_2025.js — ajout export ES module`
- `🗺️ engine.js — Routeur multi-canton JU/NE`

### Décision de principe enregistrée
**"On fait les choses à 100% ou on ne les fait pas."**  
Chaque canton validé au centime avant mise en production.

---

## SESSION 1er mars 2026 — ChecklistDocs cross-platform + persistence

### Travail effectué
- Fix iOS : 35 photos plantaient silencieusement → compression canvas 1800px/JPEG82%
- Fix caméra iOS ne rouvrait pas → key rotation DOM
- Fix drag & drop desktop
- store.js v2 : persistence localStorage 12 mois
- justificatifs.js : 45 types de justificatifs JU, 6 langues

---

## SESSION précédente — Moteur JU + Moteur NE 90%

### Jura (engine.js)
- Reverse-engineering JuraTax 2025 (DvBern, model.xml)
- Barèmes ICC/IFD complets, 20 communes jurassiennes
- Validé sur cas Neukomm 2025 : 9/9 codes exacts ✅
- Forfait 525 (assurances maladie), déduction 670 (personnes âgées)

### Neuchâtel — extraction 90%
- Architecture DrTax/Ringler (différente de JuraTax)
- TarifNE_1 (25 tranches), TarifNE_3 (5 tranches)
- 24 communes avec centimes (63–79)
- Splitting 1.923077, centimes État 124
- Déductions principales extraites

---

## PROCHAINES SESSIONS

### 5 mars 2026 (prévu)
- Berne : PrivateTax 2025 (VRSG AG) — prompt Claude Code prêt
- Vaud : VaudTax 2025
- Objectif : +1.85M habitants couverts

### Sprint suivant
- Genève, Fribourg, Valais
- Objectif : couvrir 80% de la population suisse romande
