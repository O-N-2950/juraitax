# TODO.md — tAIx
> PEP's Swiss SA · Bellevue 7 · 2950 Courgenay  
> Mis à jour : 4 mars 2026 — session Moteur NE + intégration

---

## 🔴 DEMAIN — Moteurs cantons (priorité absolue)

### Berne (session Claude Code — prompt prêt)
- [ ] Télécharger PrivateTax 2025 (taxme.ch)
- [ ] Extraire JARs → jadx → be_engine_all.txt + be_baremes_all.txt
- [ ] Répondre aux 10 questions BE (barèmes, communes ~350, splitting, déductions)
- [ ] Construire be_engine_2025.js (même structure que NE)
- [ ] Valider sur 3 cas réels bernois
- [ ] Brancher dans routeur engine.js

### Vaud (même jour si possible)
- [ ] Télécharger VaudTax 2025 (vd.ch)
- [ ] Même process extraction
- [ ] VD: attention tarif spécial célibataire avec enfants (splitting 1.8 / 1.3)

### Genève & Fribourg
- [ ] GeTax 2025 + FriTax 2025 (session suivante)

---

## 🔴 À FAIRE CE SPRINT

### Intégration moteur NE dans l'app
- [ ] Tester sur Railway : passer canton=NE dans le store
- [ ] Vérifier cantonDetector.js détecte NE correctement (domaine/URL)
- [ ] Justificatifs NE — adapter justificatifs.js pour canton NE
- [ ] Form.jsx — vérifier que les champs NE correspondent (commune NE vs JU)

### Stripe (30 min)
- [ ] Récupérer pk_live_... (clé publique dashboard.stripe.com)
- [ ] Créer Payment Links CHF 29 / 49 / 49 abonnement
- [ ] Metadata: app=taix.ch, plan=particulier
- [ ] Variables Railway: VITE_STRIPE_PUBLISHABLE_KEY etc.

---

## 🟠 CE MOIS

### Migration Infomaniak
- [ ] VPS-1 (~CHF 9/mois)
- [ ] Transfert domaines taix.ch + juraitax.ch
- [ ] DNS + SSL + Node.js + PostgreSQL

### Soluris — Intégration fiscale
- [ ] POST /api/fiscal-query sans auth
- [ ] Citer sources de loi sous chaque déduction dans FiscalAdvisor.js

---

## 🟢 BACKLOG

- [ ] IFD (Impôt Fédéral Direct) pour NE — actuellement retourne 0
- [ ] Mode hors-ligne partiel (service worker)
- [ ] Rapport PDF DI-2025 NE (formulaire officiel)
- [ ] Toast confirmation après OCR
- [ ] Résumé données extraites avant formulaire
- [ ] Canton IT (Tessin) — grande communauté italophone

---

## ✅ FAIT CETTE SESSION (4 mars 2026)

### Moteur Neuchâtel 2025 — 100% complet
- [x] Reverse-engineering complet Clic & Tax 2025 (NE-2025-N.jar)
- [x] Barème revenu TarifNE_1 (25 tranches) — vérifié au centime
- [x] Barème fortune TarifNE_3 (5 tranches)
- [x] 24 communes avec centimes additionnels (63–79)
- [x] Splitting marié 1.923077 (25/13)
- [x] Centimes État 124
- [x] Impôt ecclésiastique 11%
- [x] ZVA double revenu 25% max 1'200 CHF
- [x] Pilier 3a 7'258 / 36'288 CHF
- [x] Frais maladie franchise 5%
- [x] Frais formation max 12'400 CHF
- [x] Intérêts hypo: fortune brute + 50'000 CHF
- [x] VP assurances: table 18×5 complète
- [x] `src/ne_engine_2025.js` — 670 lignes, déployé GitHub ✅

### Intégration app
- [x] `engine.js` — routeur multi-canton JU/NE + adaptateurs
- [x] `ne_engine_2025.js` — export ES module pour Vite
- [x] Format retour unifié pour screens.jsx

### Session précédente (justificatifs)
- [x] Module justificatifs JU 45 types, 6 langues
- [x] `src/justificatifs.js` déployé

---

## 📅 PLANNING CANTONS

| Canton | Marché | Logiciel | Session |
|--------|--------|----------|---------|
| Jura ✅ | 73K hab. | JuraTax (DvBern) | Fait |
| Neuchâtel ✅ | 177K hab. | Clic & Tax (DrTax) | Fait |
| **Berne** | 1.04M hab. | PrivateTax (VRSG) | Demain |
| **Vaud** | 812K hab. | VaudTax | Demain |
| Genève | 504K hab. | GeTax | Sprint 2 |
| Fribourg | 324K hab. | FriTax | Sprint 2 |
| Valais | 345K hab. | — | Sprint 3 |
