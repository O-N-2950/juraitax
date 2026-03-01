# TODO.md — tAIx
> PEP's Swiss SA · Bellevue 7 · 2950 Courgenay
> Mis à jour : 1er mars 2026 — fin de session

---

## 🔴 ACTION IMMÉDIATE — Railway (10 min)

**Le dist/ est dans le repo GitHub mais Railway sert l'ancien build.**
→ Ouvrir **railway.app** → projet juraitax → bouton **"Redeploy"**
→ Attendre 2-3 min → tester sur iPhone

**Pour automatiser les futurs déploiements :**
→ railway.app → Settings → Tokens → générer un token
→ GitHub → juraitax → Settings → Secrets → Actions → RAILWAY_TOKEN = coller token
→ Après ça, chaque commit déclenche un déploiement automatique

---

## 🔴 STRIPE — À FINALISER (30 min)

- [ ] Ouvrir dashboard.stripe.com
- [ ] Récupérer **pk_live_...** (clé PUBLIQUE — PAS sk_live_)
- [ ] Créer Payment Link CHF 49 (particulier)
- [ ] Créer Payment Link CHF 49/an (abonnement)
- [ ] Ajouter metadata : app=taix.ch, plan=particulier
- [ ] Ajouter dans Railway variables :
  - VITE_STRIPE_PUBLISHABLE_KEY = pk_live_...
  - VITE_STRIPE_PAYMENT_LINK_49 = https://buy.stripe.com/...
  - VITE_STRIPE_PAYMENT_LINK_SUB = https://buy.stripe.com/...

---

## 🔴 SOLURIS — INTÉGRATION FISCALE (1 session)

Soluris est en train d'ingérer les lois fiscales (prompt envoyé).
Une fois Soluris mis à jour :

- [ ] Vérifier que LIFD (642.11), LHID (642.14), LPP (831.40), OPP3 sont dans la DB
- [ ] Vérifier que les 26 lois cantonales fiscales sont scrapées
- [ ] Créer dans Soluris : **POST /api/fiscal-query** (sans auth, clé TAIX_INTERNAL_KEY)
- [ ] Intégrer dans tAIx FiscalAdvisor.js : appel Soluris pour citer les sources de loi
- [ ] Afficher sous chaque déduction : "Art. 82 LPP · ATF 148 II 121 · Circ. AFC n°18"

---

## 🟠 MIGRATION INFOMANIAK (destination finale)

Railway = test temporaire. Infomaniak = cible définitive.

- [ ] **Étape 1** : Compte Infomaniak + VPS-1 (~CHF 9/mois)
- [ ] **Étape 2** : Transférer domaines taix.ch + juraitax.ch (code EPP, 24-48h)
- [ ] **Étape 3** : DNS A record + CNAME www + MX auto + SSL Let's Encrypt
- [ ] **Étape 4** : Resend email — DKIM/SPF, clé API re_xxxxx, contact@taix.ch
- [ ] **Étape 5** : Build local → upload dist/ → public_html/
- [ ] **Étape 6** : .htaccess React Router (toutes routes → index.html)
- [ ] **Étape 7** : Backend Node.js + PostgreSQL (subscribers, magic_links)
- [ ] **Étape 8** : Magic Link login (sans mot de passe) via Resend
- [ ] **Étape 9** : Couper Railway après validation complète

---

## 🟠 TEST AVEC PAPA — En attente Railway Redeploy

URL : https://juraitax-app-production-f257.up.railway.app

Flux à tester :
1. Welcome → sélectionner langue fr
2. Checklist → photographier DI 2024 **en plusieurs pages** (15 photos)
   → vérifier compteur "✅ 15 pages chargées"
   → vérifier "Analyse en cours… (3/15)"
3. Photographier certificat de salaire
4. Photographier extrait compte bancaire
5. → Conseiller IA pose questions (FiscalAdvisor)
   → Question subsides : "Bénéficiez-vous déjà de subsides LAMal ?"
6. → Formulaire pré-rempli avec données OCR
7. → Résultat avec montant impôt
   → Vérifier bloc SubsidyWinWin (si papa éligible)
   → Vérifier badge 3a si pas maximisé
8. → Copie contribuable (imprimer)

---

## 🟢 FONCTIONNALITÉS FUTURES

### Cantons supplémentaires (après validation JU)
- [ ] Neuchâtel (NE) — barèmes + communes
- [ ] Tessin (TI) — barèmes + communes (italiano)
- [ ] Berne (BE) — barèmes + communes (fr + de)
- [ ] Genève (GE) — barèmes + communes
- [ ] Vaud (VD) — barèmes + communes

### Moutier 2027 (ne rien faire avant jan 2027)
- [ ] Créer landing taix.ch/moutier
- [ ] Module Migration Berne → Jura (OCR ancienne DI bernoise → pré-remplissage JU)
- [ ] Code promo MOUTIER2027 = CHF 39 sur Stripe
- [ ] Contact : administration@moutier.ch
- [ ] Flyers imprimables guichet communal

### Scalabilité 1M requêtes (objectif long terme)
- Architecture actuelle : ~200 utilisateurs simultanés (suffisant lancement)
- Évolution : CDN Cloudflare + Redis cache + Anthropic Enterprise key
- À discuter avec Anthropic quand > 1000 clients actifs

### Application mobile native
- React Native (iOS + Android)
- Après validation web + 100 clients payants

---

## ✅ FAIT CETTE SESSION (1er mars 2026)

- [x] SubsidyWinWin.jsx — détection subsides LAMal + 3a + redirection WinWin FINMA
- [x] FiscalAdvisor.js v2 — question subsides LAMal ajoutée au questionnaire
- [x] screens.jsx v9 — SubsidyWinWin intégré dans Result screen
- [x] i18n.js — arguments marketing "20min vs 3h" + "erreur humaine" (7 langues)
- [x] ChecklistDocs.jsx v3 — **upload multi-pages** (plusieurs photos/fichiers par doc, OCR fusionné)
- [x] JustificatifsPDF.js — bug spread operator fixé (build était cassé)
- [x] GitHub Actions deploy.yml — workflow build auto
- [x] CONTEXT.md v6.0 + TODO.md mis à jour
- [x] Prompt Soluris rédigé — lois fiscales 26 cantons + LIFD + endpoints
- [x] Diagnostiqué : Railway ne redéploie pas auto → besoin RAILWAY_TOKEN secret GitHub

---

## 🔑 RÉFÉRENCES RAPIDES

| Ressource | Valeur |
|-----------|--------|
| App test | https://juraitax-app-production-f257.up.railway.app |
| Repo | https://github.com/O-N-2950/juraitax |
| Repo Soluris | https://github.com/O-N-2950/soluris |
| WinWin tel | 032 466 11 00 |
| WinWin email | contact@winwin.swiss |
| Stripe secret | sk_live_51R6rR9... (NE PAS exposer) |
| Build local | cd juraitax && npm run build |
