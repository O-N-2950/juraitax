# tAIx — TODO LIST — Mars 2026
# PEP's Swiss SA · Mise à jour : 06.03.2026
# ═══════════════════════════════════════════════════════

## 🔴 CRITIQUE — Premiers clients (à faire MAINTENANT)

- [ ] **Vérifier variable ANTHROPIC_API_KEY sur Railway**
      → Settings > Variables > ANTHROPIC_API_KEY (sans VITE_)
      → Tester /api/health en prod pour confirmer

- [ ] **Tester flux complet Railway bout-en-bout**
      → Upload certificat de salaire → OCR → Pixou chat → Calcul → Rapport PDF
      → Vérifier que /api/pixou répond correctement

- [ ] **Vérifier que le rapport PDF génère bien la section Pixou**
      → genererRapportFiscalAvecPixou() doit appeler /api/rapport-raisonnement
      → Tester avec données Neukomm

- [ ] **Valider solde client > 0 → Pixou remboursement s'affiche**
      → Tester sur cas Neukomm (73'270 CHF revenu)

## 🟠 IMPORTANT — Qualité prod

- [ ] **Tester ErrorBoundary Pixou**
      → Provoquer une erreur volontaire → vérifier écran de secours avec pixou-error.png

- [ ] **Vérifier /api/health en production**
      → https://juraitax-app-production-f257.up.railway.app/api/health
      → Doit retourner { status: "ok", apiKey: "présente ✓" }

- [ ] **Intégration NE complète (2-3h)**
      → Form.jsx : passer canton field au moteur
      → Commune dropdown : afficher communes NE si canton=NE
      → cantonDetector.js : configurer domaine NE

- [ ] **Stripe — métadonnées par application**
      → Ajouter metadata: { app: "tAIx", canton: "JU" } dans chaque paiement
      → Permet de distinguer les revenus par canton sur le dashboard Stripe

## 🟡 AMÉLIORATION — Expérience client

- [ ] **Store Zustand — exposer getAll() dans App.jsx**
      → PixouChat reçoit toutes les données OCR en temps réel

- [ ] **Conversation Pixou → passée au rapport PDF**
      → Stocker conversationPixou dans le store Zustand
      → La passer à genererRapportFiscalAvecPixou()

- [ ] **Animation Pixou résultat positif**
      → Si solde > 0 : pixou-remboursement.png avec animation pop
      → ✅ Déjà codé — à vérifier en prod

- [ ] **Tester OCR multi-pages**
      → Upload 3 documents → vérifier fusion correcte
      → Tester pixou-ocr.png s'affiche pendant l'analyse

- [ ] **Dons — chiffrer l'économie dans le chat**
      → Pixou dit : "Sans justificatif, j'applique CHF 308 → économie ~CHF 62"

## 🟢 EXPANSION — Cantons

- [ ] **Canton NE — intégration complète UI**
      → 2-3h de travail (moteur validé, UI manquante)

- [ ] **Canton BE — extraction barèmes PrivateTax**
      → Prompt Claude Code prêt dans les notes
      → ~5h de travail

- [ ] **Berne — validation test cases**
      → Valider 5+ cas avant déploiement prod

## 📋 TECHNIQUE — Dette

- [ ] **Code splitting Vite** (bundle 888KB → objectif <400KB)
      → Dynamic import() pour RapportFiscal.js, FiscalExpert.js
      → Améliore le temps de chargement initial

- [ ] **Ajouter rate limiting sur /api/pixou**
      → Max 20 messages / session pour limiter coûts API

- [ ] **Logger les conversations Pixou** (analytics)
      → Identifier les questions les plus posées
      → Améliorer le prompt en continu

## ✅ FAIT — Historique session

- [x] Pixou mascotte — 9 humeurs (welcome/search/loading/question1/question2/static/error/remboursement/ocr)
- [x] PixouChat — chatbot interactif branché sur /api/pixou
- [x] Première question "qu'est-ce qui a changé ?" gravée
- [x] Dons proportionnels au revenu (pas 300 CHF fixe)
- [x] Pixou proactif — mène l'entretien
- [x] Serveur Express 3 routes sécurisées (clé API jamais exposée)
- [x] Rapport PDF avec raisonnement Pixou + bases légales
- [x] ErrorBoundary React avec Pixou error
- [x] Anti-crash process.on handlers
- [x] Health check /api/health
- [x] Build propre zéro erreur
- [x] Carte d'identité supprimée du checklist documents
