# TODO.md — tAIx
> PEP's Swiss SA · Bellevue 7 · 2950 Courgenay
> Mis à jour : 1er mars 2026 — session UX B2B fix

---

## 🔴 ACTION IMMÉDIATE — Railway Redeploy (5 min)

**Le dist/ vient d'être mis à jour sur GitHub avec le fix UX B2B.**
→ Ouvrir **railway.app** → projet juraitax → bouton **"Redeploy"**
→ Tester le flux : B2B → login → checklist directe (plus de saisie client)

**Pour automatiser les futurs déploiements :**
→ railway.app → Settings → Tokens → générer un token
→ GitHub → juraitax → Settings → Secrets → Actions → RAILWAY_TOKEN = coller token

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

- [ ] Vérifier que LIFD (642.11), LHID (642.14), LPP (831.40), OPP3 sont dans la DB
- [ ] Vérifier que les 26 lois cantonales fiscales sont scrapées
- [ ] Créer dans Soluris : **POST /api/fiscal-query** (sans auth, clé TAIX_INTERNAL_KEY)
- [ ] Intégrer dans tAIx FiscalAdvisor.js : appel Soluris pour citer les sources de loi

---

## 🟠 MIGRATION INFOMANIAK (destination finale)

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

Flux à tester (nouveau flux B2B) :
1. Welcome → bouton "Espace fiduciaire"
2. B2B Login → email contact@winwin.swiss → "Ouvrir un nouveau dossier →"
   → **directement sur la checklist** (plus de saisie nom/prénom)
3. Checklist → uploader DI 2024 en plusieurs pages
   → vérifier compteur "✅ 15 pages chargées"
   → vérifier badge "✨ Données extraites" (OCR identifie le client)
4. → Conseiller IA → Formulaire → Résultat
5. Vérifier bandeau vert : "💼 WIN WIN Finance Group — [Nom OCR]"
   → Vérifier N° contribuable affiché si extrait

---

## 🟢 FONCTIONNALITÉS FUTURES

### Cantons supplémentaires (après validation JU)
- [ ] Neuchâtel (NE), Berne (BE), Genève (GE), Vaud (VD), Tessin (TI)

### Moutier 2027 (ne rien faire avant jan 2027)
- [ ] Landing taix.ch/moutier, code MOUTIER2027 = CHF 39

---

## ✅ FAIT CETTE SESSION (1er mars 2026 — UX B2B fix)

- [x] **screens.jsx v10** — Suppression saisie manuelle client (nom/prénom/N° contribuable) en mode B2B fiduciaire
- [x] **Flux B2B simplifié** : login → checklist directe (1 étape au lieu de 2)
- [x] **Info-box OCR** sur page B2B : explication identification automatique
- [x] **Bandeau résultat enrichi** : nom OCR + N° contribuable si extrait
- [x] **Reset dossier** : fields:{} réinitialisé à chaque nouveau client
- [x] **Build + dist/ committé** sur GitHub (prêt pour Railway Redeploy)
- [x] CONTEXT.md v6.1 + TODO.md mis à jour

---

## 🔑 RÉFÉRENCES RAPIDES

| Ressource | Valeur |
|-----------|--------|
| App test | https://juraitax-app-production-f257.up.railway.app |
| Repo | https://github.com/O-N-2950/juraitax |
| Repo Soluris | https://github.com/O-N-2950/soluris |
| WinWin tel | 032 466 11 00 |
| WinWin email | contact@winwin.swiss |
| Build local | cd juraitax && npm run build |
