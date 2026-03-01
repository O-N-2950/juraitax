# tAIx — TODO & CONTEXT
> PEP's Swiss SA · Bellevue 7 · 2950 Courgenay · contact@taix.ch
> Hébergement cible : **Infomaniak** (migration en cours depuis Railway/test)

---

## 🏗 ARCHITECTURE ACTUELLE (mars 2026)

- **Frontend** : React + Vite · 25 fichiers src · GitHub O-N-2950/juraitax
- **Hébergement TEST** : Railway (juraitax-app-production-f257.up.railway.app) — TEMPORAIRE
- **Hébergement CIBLE** : Infomaniak (suivre TODO étapes 1-9 ci-dessous)
- **Clé Anthropic** : dans Railway variables + à mettre dans Infomaniak
- **Clé Stripe** : sk_live_51R6rR9... · PK à ajouter dans variables

---

## ✅ FAIT — Fonctionnalités complètes

### Core
- Moteur fiscal JU 2025 (ICC + communal + IFD + fortune)
- OCR 12 types de documents (Claude Vision)
- FiscalAdvisor — conseiller IA temps réel (questions ciblées + alertes)
- AdvisorScreen — UI questions interactives 7 langues
- SubsidyWinWin — détection subsides LAMal + 3a non maximisé + redirection WinWin FINMA
- PrintContribuable — impression A4 copie contribuable
- RapportFiscal + JustificatifsPDF — PDF téléchargeables
- WowEffects — confetti, compteur animé, watermark cantonal, FadeIn
- TrustBadges — hébergement Suisse, LPD, FINMA, 7 langues
- DepotDeclaration — 4 cantons avec adresses et délais officiels
- B2B module — fiduciaires (accès illimité, contact@winwin.swiss gratuit)
- Stripe paiement CHF 49 (configuration à finaliser)
- PWA — manifest.json + icônes + raccourci écran mobile
- Mode B2C + B2B + Courrier postal (seniors)
- Arguments marketing : 20min vs 3h, erreur humaine, jurisprudence suisse

### Données
- Communes Canton du Jura complètes
- Multiplicateurs communaux 2025
- Barèmes subsides LAMal 2025
- Seuils 3a (salarié CHF 7'056 / indépendant CHF 36'288)

---

## 🔴 PRIORITÉ — Soluris x tAIx (intégration RAG fiscal)

### Contexte
Soluris (repo O-N-2950/soluris) est notre moteur juridique RAG :
- PostgreSQL + pgvector (embeddings Cohere 1024 dim)
- Fedlex : 15 codes prioritaires (CO, CC, CP, LP, LTF...)
- Jurisprudence : 175k+ décisions (ATF, BGer, cantons romands)
- FastAPI backend avec endpoint /api/chat (jurisdiction + legal_domain filters)

### Ce qu'il faut faire pour connecter Soluris à tAIx
- [ ] **Ajouter les lois fiscales cantonales dans Soluris** :
  - LIFD (Loi fédérale sur l'impôt fédéral direct — RS 642.11)
  - LHID (Loi fédérale sur l'harmonisation — RS 642.14)
  - Loi fiscale canton du Jura (RS/JU 641.11)
  - Circulaires AFC (déductions, barèmes, jurisprudence fiscale)
  - ATF fiscaux : recherche domaine "droit_fiscal" dans entscheidsuche
- [ ] **Créer endpoint Soluris dédié tAIx** (sans auth, clé interne) :
  ```python
  POST /api/fiscal-query
  { "question": "...", "canton": "JU", "annee": 2025 }
  → { "reponse": "...", "sources": [...], "confidence": 0.87 }
  ```
- [ ] **Intégrer dans FiscalAdvisor.js** :
  - Quand l'IA génère une question → interroger Soluris pour contexte légal exact
  - Afficher la source de loi citée sous chaque question/déduction
  - Ex: "Pilier 3a — art. 82 LPP · max CHF 7'056 (circ. AFC 2025)"

### Bénéfice concret
tAIx devient le seul outil fiscal suisse capable de citer la jurisprudence exacte
pour chaque déduction suggérée. Différenciateur majeur vs JuraTax officiel.

---

## 🔴 CAMPAGNE MOUTIER — Marketing prioritaire (action jan 2027)

### Contexte légal — vérifié sources officielles
- 1er janvier 2026 : Moutier officiellement Canton du Jura
- DI 2025 : Les Prévôtois remplissent encore une DI bernoise (délai 15 mars 2026)
- PREMIERE DI JURASSIENNE : Année fiscale 2026, déposée en 2027
- Source : https://www.moutierdanslejura.ch/thematiques/fiscalite.html

### Plan commercial
- Cible : ~8000 habitants de Moutier
- Prix spécial : CHF 39 (au lieu de 49)
- Timing : lancer en janvier 2027
- Email Commune : administration@moutier.ch
- Module Migration Berne→Jura : OCR ancienne DI bernoise → pré-remplissage adapté
- Code promo MOUTIER2027 sur Stripe

---

## 🟠 MOYEN TERME

### Migration Infomaniak (9 étapes — voir TODO séparé)
- [ ] Étape 1 : Créer compte Infomaniak + VPS
- [ ] Étape 2 : Transférer domaines taix.ch + juraitax.ch
- [ ] Étape 3 : DNS + SSL
- [ ] Étape 4 : Resend email (contact@taix.ch)
- [ ] Étape 5 : Upload dist/ → public_html/
- [ ] Étape 6 : Variables environnement (.env.production local)
- [ ] Étape 7 : Backend Node.js + PostgreSQL (magic link + abonnements)
- [ ] Étape 8 : Magic Link (login sans mot de passe)
- [ ] Étape 9 : Couper Railway → tout sur Infomaniak

### Stripe à finaliser
- [ ] Récupérer pk_live_... (pas sk_live_)
- [ ] Créer Payment Links CHF 49 + CHF 49/an
- [ ] Ajouter metadata app=taix.ch
- [ ] Variables: VITE_STRIPE_PUBLISHABLE_KEY, VITE_STRIPE_PAYMENT_LINK_49

### Scalabilité (objectif 1M requêtes)
- Architecture actuelle : ~200 utilisateurs simultanés (suffisant pour lancement)
- Pour 1M : CDN Cloudflare + Anthropic Enterprise key + Redis cache
- Discussion Anthropic Enterprise quand > 1000 clients actifs

---

## 🟢 LONG TERME

- [ ] Cantons additionnels : NE, TI, ZH, BE (barèmes + communes)
- [ ] Soluris RAG complet (175k jurisprudence) connecté à tAIx
- [ ] Magic Link opérationnel
- [ ] Application mobile native (React Native)
- [ ] Rappels automatiques (mars/avril) via Resend

---

## 🔑 CLÉS ET COORDONNÉES

| Service | Valeur |
|---------|--------|
| Anthropic API | sk-ant-api03-HOt1pC... (dans Railway variables) |
| Stripe secret | sk_live_51R6rR9... |
| WinWin B2B email | contact@winwin.swiss (accès illimité gratuit) |
| WinWin tel | 032 466 11 00 |
| WinWin adresse | Bellevue 7, 2950 Courgenay |
| FINMA | F01042365 |
