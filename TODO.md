# TODO.md — tAIx
**Dernière mise à jour : 1 mars 2026**

---

## 🔴 IMMÉDIAT — Cette semaine

### Test papa
- [ ] Tester déclaration sur **juraitax-app-production-f257.up.railway.app**
- [ ] Accès B2B : `contact@winwin.swiss`
- [ ] Valider moteur fiscal Jura 2025 avec vraies attestations
- [ ] OCR → actif après rebuild Railway (**clé Anthropic ajoutée ✅ rebuild déclenché ✅**)

### Stripe (10 min sur dashboard.stripe.com)
- [ ] Copier `pk_live_...` (Developers → API Keys) — PAS sk_live_ !
- [ ] Créer Payment Link "Déclaration tAIx CHF 49" (paiement unique)
- [ ] Créer Payment Link "Abonnement tAIx CHF 49/an" (récurrent)
- [ ] Railway → Variables → ajouter :
  - `VITE_STRIPE_PUBLISHABLE_KEY` = pk_live_...
  - `VITE_STRIPE_PAYMENT_LINK_49` = https://buy.stripe.com/...
  - `VITE_STRIPE_PAYMENT_LINK_SUB` = https://buy.stripe.com/...

### Juridique
- [ ] Consulter avocat jurassien → CGU + politique confidentialité (~CHF 300)

---

## 🟡 MIGRATION INFOMANIAK — Guide étape par étape

### Étape 1 — Préparer Infomaniak (30 min)
- [ ] Créer/vérifier compte : https://manager.infomaniak.com
- [ ] Choisir offre hébergement : **Cloud Server VPS-1** (~CHF 9/mois)
  → Alternative : **Node.js Hosting** si pas besoin de contrôle total
- [ ] Dans Manager → **Emails** → Créer `contact@taix.ch`
  (1 adresse offerte par nom de domaine chez Infomaniak)
- [ ] Créer alias gratuits : `contact@juraitax.ch` → `contact@taix.ch`

### Étape 2 — Transférer domaines vers Infomaniak
- [ ] Manager → Domaines → Transférer `taix.ch`
  - Déverrouiller le domaine chez le registrar actuel
  - Copier le code de transfert (EPP code)
  - Coller dans Infomaniak → ~24-48h pour compléter
- [ ] Faire de même pour `juraitax.ch` si nécessaire
- [ ] ⚠️ **NE PAS faire pendant les tests** — attendre stabilité

### Étape 3 — Configurer DNS Infomaniak (15 min)
Une fois les domaines transférés :
- [ ] Manager → Domaines → `taix.ch` → Zone DNS
- [ ] Enregistrement **A** : `@` → IP de ton serveur Infomaniak
- [ ] Enregistrement **CNAME** : `www` → `taix.ch`
- [ ] Enregistrement **MX** : pour email (auto-configuré si email chez Infomaniak)
- [ ] Enregistrement **TXT** pour Resend (voir Étape 4)
- [ ] SSL/TLS : Let's Encrypt activé automatiquement ✅

### Étape 4 — Configurer Resend pour les emails (20 min)
- [ ] Créer compte sur https://resend.com
- [ ] Dashboard → Domains → **Add Domain** → entrer `taix.ch`
- [ ] Resend donne 3 enregistrements DNS à copier :
  - TXT `_domainkey` (DKIM)
  - TXT `@` (SPF) : `v=spf1 include:_spf.resend.com ~all`
  - CNAME `resend._domainkey`
- [ ] Coller ces enregistrements dans la zone DNS Infomaniak
- [ ] Attendre vérification (5-30 min après propagation DNS)
- [ ] Resend → API Keys → créer clé → noter `re_xxxxx`
- [ ] Tester envoi email `contact@taix.ch`

### Étape 5 — Déployer le frontend sur Infomaniak (45 min)
- [ ] En local : `npm run build` → génère dossier `dist/`
- [ ] Manager → Hébergement → Gestionnaire de fichiers
  → Uploader contenu de `dist/` dans `public_html/`
- [ ] Créer fichier `.htaccess` dans `public_html/` :
  ```
  Options -MultiViews
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule ^ index.html [QSA,L]
  ```
  (obligatoire pour React Router — sinon F5 donne 404)
- [ ] Tester https://taix.ch

### Étape 6 — Variables d'environnement sur Infomaniak
- [ ] Les variables VITE_* doivent être définies **avant le build**
- [ ] Créer fichier `.env.production` en local avec les vraies clés
- [ ] Builder : `npm run build` (les clés sont intégrées dans le bundle)
- [ ] Uploader le `dist/` résultant sur Infomaniak
- [ ] ⚠️ Ne jamais committer `.env.production` sur GitHub !

### Étape 7 — Backend Node.js sur Infomaniak (2h)
Nécessaire pour : Magic Link, abonnements, rappels annuels
- [ ] Manager → Hébergement → Activer **Node.js**
- [ ] Créer base **PostgreSQL** sur Infomaniak
  → Manager → Bases de données → Créer → noter host/user/pass/dbname
- [ ] Créer `server.js` (Express minimal)
- [ ] Tables PostgreSQL à créer :
  ```sql
  CREATE TABLE subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    nom TEXT, lang TEXT DEFAULT 'fr',
    canton TEXT DEFAULT 'JU',
    identite JSONB,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    next_reminder TIMESTAMPTZ,
    active BOOLEAN DEFAULT TRUE
  );
  CREATE TABLE magic_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE
  );
  ```
- [ ] Endpoints :
  - `POST /api/subscribe` → créer abonné + email bienvenue Resend
  - `GET /api/magic?token=...` → valider → retourner profil
  - `POST /api/stripe-webhook` → confirmer paiement → activer abonné
- [ ] Variables serveur à définir sur Infomaniak :
  - `DATABASE_URL` = postgres://user:pass@host/dbname
  - `RESEND_API_KEY` = re_xxxxx
  - `ANTHROPIC_API_KEY` = sk-ant-api03-...
  - `STRIPE_SECRET_KEY` = sk_live_... (backend uniquement !)
  - `JWT_SECRET` = chaîne aléatoire 64 chars

### Étape 8 — Activer Magic Link (1h)
- [ ] Frontend : écran "Connexion abonné" avec champ email
- [ ] POST /api/magic/send → Resend envoie lien unique valable 1h
- [ ] GET /api/magic?token=... → charge profil + pré-remplit formulaire
- [ ] Cron Resend : rappels automatiques 1er mars, 20 mars, 5 avril

### Étape 9 — Couper Railway (après validation Infomaniak)
- [ ] 100% des fonctions validées sur Infomaniak
- [ ] DNS `taix.ch` pointé sur Infomaniak
- [ ] Supprimer déploiement Railway (économie ~CHF 5-10/mois)

---


---

## 🔴 CAMPAGNE MOUTIER — Marketing prioritaire (action jan 2027)

### Contexte légal — vérifié sources officielles
- **1er janvier 2026** : Moutier officiellement Canton du Jura
- **DI 2025** : Les Prévôtois remplissent encore une DI **bernoise** (délai 15 mars 2026)
- **PREMIERE DI JURASSIENNE** : Année fiscale **2026**, déposée en **2027**
- Source : https://www.moutierdanslejura.ch/thematiques/fiscalite.html

### Idée commerciale — "Bienvenue dans le Jura"
- **Cible** : ~8000 habitants de Moutier
- **Prix spécial** : CHF 39 (au lieu de 49) — premiere DI jurassienne
- **Timing** : Lancer en **janvier 2027**
- **Email Commune** : administration@moutier.ch — demander partenariat/relai

### Todo technique avant jan 2027
- [ ] Vérifier barèmes Berne vs Jura pour Moutier (taux communaux)
- [ ] Module Migration Berne→Jura : OCR ancienne DI bernoise → pré-remplissage adapté
- [ ] Note explicative dans app : premiere declaration jurassienne
- [ ] Code promo MOUTIER2027 = CHF 39 sur Stripe (coupon)
- [ ] Landing page : taix.ch/moutier
- [ ] Contacter Commune de Moutier pour relai officiel
- [ ] Flyers imprimables pour guichet communal

### NE PAS FAIRE maintenant
- DI 2025 des Prévôtois = encore bernoise = hors perimetre tAIx 2025
- Ne pas cibler Moutier avant janvier 2027

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
