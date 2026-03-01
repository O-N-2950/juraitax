
### ✅ FiscalAdvisor — Conseiller IA temps réel (FAIT — mars 2026)
- `FiscalAdvisor.js` — cerveau IA : analyse tous les documents ensemble, détecte anomalies
- `AdvisorScreen.jsx` — UI questions interactives (oui/non, montant, choix, nombre)
- Intégré dans `ChecklistDocs.jsx` — s'affiche en overlay après OCR, avant le formulaire

**Ce que fait le conseiller IA :**
1. Analyse croisée de tous les documents uploadés
2. Détecte les changements vs année précédente (comptes bancaires, salaire, situation familiale)
3. Pose des questions ciblées selon le profil (étudiant, famille, propriétaire, retraité...)
4. Propose des déductions oubliées avec impact fiscal estimé
5. Génère des alertes si anomalie détectée (compte non déclaré, variation fortune > 10k, etc.)
6. En 7 langues. Fallback statique si API indisponible.

**Flux utilisateur :**
Checklist → Upload docs → OCR automatique → [Conseiller IA pose ses questions] → Formulaire → Résultat

## 🟠 MOYEN TERME (Q2-Q3 2026)

- [ ] Module Neuchâtel (NE) complet
- [ ] Module Tessin (TI) — interface IT prête
- [ ] Dashboard B2B multi-dossiers
- [ ] App mobile PWA → iOS/Android natif
- [ ] Langues Tier 2 : Albanais + Serbe/Croate
- [ ] Intégration eJU Tax directe (API canton JU si disponible)

---

## ✅ LIVRÉ (Mars 2026)

- [x] Frontend React 7 langues complet
- [x] Moteur fiscal Jura 2025
- [x] Checklist 21 documents + OCR automatique (clé Railway ✅)
- [x] Rapport fiscal A4 jsPDF
- [x] Dossier justificatifs PDF
- [x] Abonnement CHF 49/an
- [x] Trust badges 🇨🇭 + LPD — 7 langues
- [x] Modalités dépôt par canton (JU/NE/TI/ZH) + adresses postales
- [x] Badge "Aucune donnée fiscale conservée"
- [x] security.js — CSP, XSS, rate limiting
- [x] Métadonnées Stripe complètes
- [x] vite.config.js — loadEnv pour Railway

---

*TODO.md — tAIx / JurAI Tax — PEP's Swiss SA — 1 mars 2026*
