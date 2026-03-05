# tAIx — TODOLIST
## Mis à jour : 05.03.2026

---

## 🔴 URGENT — Avant tout client payant

- [ ] **Valider Neukomm 2025 sur guichet.jura.ch**
  - Revenu imposable : 73'270 — Fortune : 454'000 — Commune : Bure — Catholique — Marié
  - Comparer avec résultat engine : ~12'705 CHF total

- [ ] **Tester le nouveau flux sur Railway**
  - Upload documents Neukomm → OCR → ALIX s'affiche avec optimisations auto
  - Vérifier bouton "Calculer" bloqué si document manquant
  - Vérifier CHF 300 dons appliqués automatiquement

- [ ] **Suite de tests automatisés JU** (5 cas × résultats officiels)
  - Écart toléré : 0 CHF — build bloqué si dépassement

---

## 🟡 Semaine prochaine

- [ ] **Connecter AdvisorScreen ↔ donneesClient** (prop manquante pour dialogue interactif)
  - Passer `donneesClient` depuis ChecklistDocs vers AdvisorScreen

- [ ] **Tester ALIX sur profil Neukomm**
  - Elle doit dire : "Je vois hypothèque 168'000 → relevé Raiffeisen obligatoire"
  - Elle doit appliquer 8'380 assurances automatiquement
  - Elle ne doit PAS demander de pilier 3a (rentiers)

- [ ] **Intégrer SubsidyWinWin.jsx** dans le flux ALIX
  - Question subsides LAMal pour revenus < 60'000

- [ ] **Moteur fiscal JU — validation barème**
  - Écart ~0.8% vs officiel sur commune revenu → affiner coefficients

---

## 🟢 Court terme

- [ ] **Cantons supplémentaires**
  - VD, FR, VS — reverse-engineering Clic&Tax
  - Domaines canton-spécifiques avec détection automatique

- [ ] **Mise à jour 2026** (prompt déjà prêt dans projet)
  - Télécharger Clic&Tax 2026
  - Comparer TarifNE_1, TarifNE_3, NEParameters, etc.

- [ ] **Hébergement RGPD** — migrer Railway → Infomaniak avant clients tiers

- [ ] **Intégration WIN WIN v2** — écosystème services financiers

---

## ✅ FAIT cette session (05.03.2026)

- [x] FiscalExpert.js — cerveau IA avec 12 règles raisonnement
- [x] Moteur optimisation — forfaits automatiques (dons 300, entretien 20%, frais pro)
- [x] Philosophie gravée : toujours dans l'intérêt du client
- [x] AdvisorScreen réécrit — ALIX, documents bloquants, bouton désactivé
- [x] ChecklistDocs câblé sur FiscalExpert (remplace FiscalAdvisor)
- [x] Bug calculImpotCommunalICC corrigé dans engine.js
- [x] Justification complète revenu imposable Neukomm 2025 (73'270 CHF)
- [x] Confirmation code 530 = 2'121 CHF (document réel Raiffeisen, pas estimation)
