# TODO.md — tAIx
> PEP's Swiss SA · Bellevue 7 · 2950 Courgenay  
> Mis à jour : 4 mars 2026

---

## 🔴 DEMAIN — Moteurs cantons (prompt Claude Code prêt)

### Berne (PrivateTax — VRSG AG)
- [ ] Télécharger PrivateTax 2025 (taxme.ch/privatetax/download)
- [ ] Extraire JARs → jadx → be_engine_all.txt + be_baremes_all.txt
- [ ] 10 questions : barèmes, ~350 communes, splitting, déductions
- [ ] Construire be_engine_2025.js + valider 3 cas réels bernois
- [ ] Brancher dans routeur engine.js

### Vaud (VaudTax)
- [ ] Même process · Attention : splitting VD spécial (1.8 / 1.3 avec enfants)

### Genève & Fribourg (sprint suivant)
- [ ] GeTax 2025 + FriTax 2025

---

## 🔴 À FAIRE CE SPRINT

### Intégration NE dans l'app
- [ ] Tester Railway : passer canton=NE dans le store
- [ ] cantonDetector.js : détecter NE correctement
- [ ] Form.jsx : communes NE (dropdown 24 communes)
- [ ] justificatifs.js : adapter pour canton NE
- [ ] IFD NE : actuellement retourne 0 (à calculer)

### Stripe (30 min)
- [ ] Récupérer pk_live_... (clé publique)
- [ ] Payment Links CHF 29 / 49 / 49 abonnement
- [ ] Variables Railway : VITE_STRIPE_PUBLISHABLE_KEY + PAYMENT_LINK_*

---

## 🟠 CE MOIS

- [ ] Migration Infomaniak VPS (CHF 9/mois) — DNS, SSL, Node, PostgreSQL
- [ ] Soluris : POST /api/fiscal-query → citer sources de loi dans FiscalAdvisor.js
- [ ] PDF DI-2025 NE (formulaire officiel)

---

## ✅ FAIT (4 mars 2026)

- [x] Moteur NE 2025 — 100% reverse-engineered (TarifNE_1/3, 24 communes, splitting, ZVA, VP...)
- [x] `ne_engine_2025.js` — 670 lignes, tests barème OK au centime, pushé GitHub
- [x] `engine.js` — routeur multi-canton JU/NE, format retour unifié screens.jsx
- [x] `ne_engine_2025.js` — export ES module pour Vite

## ✅ FAIT (1er mars 2026)

- [x] ChecklistDocs v6 cross-platform (iOS caméra + 35 photos + drag & drop)
- [x] justificatifs.js — 45 types, 6 langues
- [x] store.js v2 — persistence localStorage 12 mois

---

## 📅 PLANNING CANTONS (cumul population)

JU ✅ 73K → NE ✅ 250K → **BE 🔜 1.29M** → **VD 🔜 2.1M** → GE 2.6M → FR 2.9M → VS 3.2M
