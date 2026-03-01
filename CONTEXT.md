# CONTEXT.md — tAIx v5.0
**Dernière mise à jour : Mars 2026**

---

## 🏢 ENTITÉS & CONTACTS

| Entité | Rôle | Contact |
|--------|------|---------|
| **PEP's Swiss SA** | Éditeur tAIx | Bellevue 7, 2950 Courgenay · admin@juraitax.ch |
| **WIN WIN Finance Group SARL** | Partenaire courtage FINMA | FINMA F01042365 · contact@winwin.swiss |

---

## 🌐 DOMAINES & MARQUE

- **Logo officiel** : tAIx (t minuscule, AI bleu électrique, x réseau de nœuds) + drapeau suisse 🇨🇭
- **Tagline** : "Déclarations Fiscales Suisses Intelligentes"
- **Domaine principal** : www.tAIx.ch ✅ acquis

### Emails
- **`contact@taix.ch`** = adresse principale unique ← CRÉER EN PRIORITÉ sur Infomaniak
- Alias gratuits Infomaniak : contact@juraitax.ch → contact@taix.ch (pas de boîte séparée nécessaire)
- contact@winwin.swiss = partenaire (déjà existant)

---

## 💰 MODÈLE TARIFAIRE — RÈGLE ABSOLUE

> **CHF 49 minimum, toujours. Les fiduciaires facturent CHF 200–300. tAIx est meilleur.**

| Offre | Prix |
|-------|------|
| 100 premiers | CHF 29 (lancement) |
| Standard | **CHF 49** |
| Abonnement annuel | **CHF 49/an** |
| B2B Solo | CHF 490/an |
| B2B Cabinet | CHF 990/an |
| B2B Unlimited | CHF 1'990/an |
| WIN WIN Finance Group | GRATUIT illimité |

---

## 🔒 SÉCURITÉ & DONNÉES — POLITIQUE ABSOLUE

### Ce que tAIx NE conserve JAMAIS
- ❌ Aucune donnée fiscale sur les serveurs
- ❌ Aucune information financière stockée
- ❌ Documents uploadés détruits après analyse OCR (mémoire uniquement)
- ❌ Pas de base de données des montants fiscaux

### Ce que tAIx conserve (abonnés uniquement, avec consentement)
- ✅ Email + prénom/nom + commune + état civil + enfants
- ✅ Langue + canton
- ✅ Date d'abonnement + dates rappels
- ✅ Hébergé exclusivement chez **Infomaniak Network SA · Genève · Suisse**

### Conformité légale
- **LPD (RS 235.1)** — Loi fédérale sur la protection des données (Suisse)
- **Infomaniak** = hébergeur suisse certifié ISO 27001, données en Suisse

### Sécurité technique (src/security.js)
- CSP (Content Security Policy) injectée au démarrage
- Anti-clickjacking
- Rate limiting client-side
- Sanitisation inputs (XSS, injections)
- Validation champs fiscaux
- Purge session après téléchargement PDF

---

## 🏗️ STACK TECHNIQUE

| Composant | Tech | État |
|-----------|------|------|
| Frontend | React 19 + Zustand + Vite | ✅ |
| i18n | 7 langues, 220+ clés | ✅ |
| Moteur fiscal | engine.js — Jura 2025 | ✅ |
| Design | Luxury Swiss Banking Dark | ✅ |
| Checklist docs | 21 docs, camera mobile | ✅ |
| OCR | ocr.js — Claude Vision | ✅ code / 🟡 clé API |
| Rapport fiscal A4 | jsPDF, dynamique, 7L | ✅ |
| Dossier justificatifs | JustificatifsPDF.js | ✅ |
| Abonnement | SubscriptionOffer CHF 49/an | ✅ |
| Trust badges | Hébergement CH, LPD, 7L | ✅ |
| Dépôt DI canton | DepotDeclaration.jsx, 4 cantons | ✅ |
| Sécurité | security.js — CSP, XSS, rate limit | ✅ |
| Stripe | stripe.js + métadonnées complètes | ✅ code / 🟡 PK + liens |
| Magic Link | 🔴 PAS ENCORE — nécessite backend | 🔴 |
| Backend | Node.js + PostgreSQL | 🔴 |
| Emails | Resend | 🔴 |
| Hébergement | Railway (dev) → **Infomaniak (prod)** | 🟡 migration |

---

## 📱 PARCOURS UTILISATEUR COMPLET

```
Welcome (Trust banner 🇨🇭)
  → Checklist Documents (21 docs, OCR automatique, camera)
  → Formulaire (pré-rempli par OCR)
  → Loading (calcul fiscal)
  → Paywall CHF 49 (Trust block 🇨🇭 + Stripe)   [B2C]
  → Résultat
      ├── PDF Déclaration officielle
      ├── Rapport fiscal A4 personnalisé
      ├── Dossier justificatifs PDF
      ├── Modalités dépôt canton (adresses postales + portails)
      └── Badge "Aucune donnée fiscale conservée"
  → Abonnement CHF 49/an (Trust footer 🇨🇭)
```

---

## ✅ TODO LIST COMPLÈTE — PROCHAINES ÉTAPES

### 🔴 IMMÉDIAT — Test papa (MAINTENANT)
- [ ] **Tester déclaration papa** sur Railway : juraitax-app-production-f257.up.railway.app
- [ ] Utiliser accès B2B : contact@winwin.swiss
- [ ] Valider moteur fiscal Jura 2025 avec vraies attestations

### 🔴 CETTE SEMAINE — Stripe & OCR
- [ ] **Stripe Dashboard** :
  - [ ] Copier `pk_live_...` (Developers → API Keys) — PAS sk_live_ !
  - [ ] Créer Payment Link CHF 49 (déclaration unique)
  - [ ] Créer Payment Link CHF 49/an (abonnement récurrent)
  - [ ] Vérifier métadonnées sur un test paiement
- [ ] **Railway Variables** :
  - [ ] `VITE_ANTHROPIC_API_KEY` = sk-ant-api03-HOt1pC...
  - [ ] `VITE_STRIPE_PUBLISHABLE_KEY` = pk_live_...
  - [ ] `VITE_STRIPE_PAYMENT_LINK_49` = https://buy.stripe.com/...
  - [ ] `VITE_STRIPE_PAYMENT_LINK_SUB` = https://buy.stripe.com/...
- [ ] Consulter avocat jurassien CGU (~CHF 300)

---

### 🟡 MIGRATION INFOMANIAK — Guide complet étape par étape

#### Étape 1 — Préparer Infomaniak (30 min)
- [ ] Créer compte Infomaniak si pas encore fait : https://www.infomaniak.com
- [ ] Choisir hébergement : **Cloud Server VPS-1** (~CHF 9/mois) ou **Node.js Hosting**
- [ ] Créer email `contact@taix.ch` (1 adresse incluse par domaine)
- [ ] Configurer alias gratuits : contact@juraitax.ch → contact@taix.ch

#### Étape 2 — Transférer domaines vers Infomaniak (1h)
- [ ] Transférer `taix.ch` depuis registrar actuel vers Infomaniak
- [ ] Transférer ou pointer `juraitax.ch` vers Infomaniak
- [ ] **NE PAS FAIRE pendant test papa** — attendre stabilité Railway

#### Étape 3 — Configurer DNS Infomaniak (15 min)
- [ ] Pointer `taix.ch` → IP serveur Infomaniak
- [ ] Ajouter enregistrement `www` → CNAME taix.ch
- [ ] Ajouter enregistrement MX pour email contact@taix.ch
- [ ] Ajouter enregistrement TXT pour **Resend** (vérification domaine)
  - Format : `v=spf1 include:resend.com ~all`
  - TXT Resend : clé fournie par resend.com lors de la vérification
- [ ] SSL/TLS : Let's Encrypt activé automatiquement sur Infomaniak ✅

#### Étape 4 — Configurer Resend (20 min)
- [ ] Créer compte sur https://resend.com
- [ ] Ajouter domaine `taix.ch`
- [ ] Copier les enregistrements DNS dans Infomaniak
- [ ] Vérifier domaine (24-48h propagation DNS)
- [ ] Tester envoi email depuis contact@taix.ch
- [ ] Récupérer clé API Resend → ajouter dans variables serveur

#### Étape 5 — Déployer le frontend sur Infomaniak (45 min)
- [ ] Build local : `npm run build` → dossier `dist/`
- [ ] Upload `dist/` sur Infomaniak via FTP ou déploiement Git
- [ ] Ou : connecter dépôt GitHub → déploiement automatique (si Infomaniak supporte)
- [ ] Configurer `_redirects` ou `.htaccess` pour React Router SPA :
  ```
  /* /index.html 200
  ```
- [ ] Tester sur https://taix.ch

#### Étape 6 — Backend Node.js sur Infomaniak (2h)
- [ ] Créer base PostgreSQL sur Infomaniak
- [ ] Créer fichier `server.js` (Express minimal)
- [ ] Tables PostgreSQL :
  ```sql
  CREATE TABLE subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    nom TEXT,
    lang TEXT DEFAULT 'fr',
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
- [ ] Endpoint POST `/api/subscribe` → créer subscriber + envoyer email bienvenue
- [ ] Endpoint GET `/api/magic?token=...` → valider Magic Link → retourner profil
- [ ] Déployer backend sur Infomaniak VPS
- [ ] Variables serveur : DATABASE_URL, RESEND_API_KEY, ANTHROPIC_API_KEY

#### Étape 7 — Activer Magic Link (1h)
- [ ] Frontend : écran "Connexion abonné" avec champ email
- [ ] Envoi Magic Link via Resend (email avec bouton lien unique 1h)
- [ ] Réception : charger profil + pré-remplir formulaire identité
- [ ] Cron Resend : rappels automatiques 1 mars, 20 mars, 5 avril

#### Étape 8 — Couper Railway (après validation Infomaniak)
- [ ] Tester 100% des fonctions sur Infomaniak
- [ ] Migrer variables Railway → Infomaniak
- [ ] Supprimer déploiement Railway (économie ~CHF 5/mois)

---

### 🟠 MOYEN TERME (Q2-Q3 2026)
- [ ] Module Neuchâtel (NE)
- [ ] Module Tessin (TI) — interface IT déjà prête
- [ ] Dashboard B2B multi-dossiers amélioré
- [ ] App mobile PWA → iOS/Android natif
- [ ] Langues Tier 2 : Albanais + Serbe/Croate

---

## ✅ LIVRÉ (Mars 2026)

- [x] Frontend React 7 langues complet
- [x] Moteur fiscal Jura 2025
- [x] Checklist 21 documents + OCR automatique
- [x] Rapport fiscal A4 jsPDF
- [x] Dossier justificatifs PDF
- [x] Abonnement CHF 49/an
- [x] Trust badges 🇨🇭 hébergement Suisse + LPD (7 langues)
- [x] Modalités dépôt par canton (JU/NE/TI/ZH) + adresses postales
- [x] Badge "Aucune donnée fiscale conservée" — explicite
- [x] security.js — CSP, anti-XSS, rate limiting, anti-clickjacking
- [x] Métadonnées Stripe complètes (app, client, canton, LPD)
- [x] Logo tAIx officiel + taix.ch acquis
- [x] contact@taix.ch → à créer sur Infomaniak

---

*CONTEXT.md v5.0 — tAIx / JurAI Tax — PEP's Swiss SA × WIN WIN Finance Group SARL — Mars 2026*
