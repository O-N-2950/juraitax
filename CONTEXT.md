# JurAI Tax — CONTEXT.md
## Mémoire projet complète · Mars 2026 · v2.0

---

## 🏢 ENTITÉS JURIDIQUES

| Entité | Rôle | Adresse |
|---|---|---|
| **PEP's Swiss SA** | Éditeur logiciel JurAI Tax | Bellevue 7, 2950 Courgenay |
| **WIN WIN Finance Group SARL** | Mandataire fiscal & courtier assurance agréé | FINMA F01042365 |

**Email principal B2B:** contact@winwin.swiss (accès illimité gratuit)
**Email admin:** admin@juraitax.ch

---

## 🌐 PORTFOLIO DOMAINES (tous sur Infomaniak)

| Domaine | Canton | App | Statut |
|---|---|---|---|
| juraitax.ch | Jura (JU) | JurAI Tax | ✅ EN PROD |
| neuchtaix.ch | Neuchâtel (NE) | NeuChTAIX | Phase 2 Q3 2026 |
| ticinaitax.ch | Tessin (TI) | TicinaITax | Phase 2 Q4 2026 |
| ticinaitax.online | Tessin (TI) backup | TicinaITax | Réserve |
| fritaix.ch | Fribourg (FR) | FriTAIX | Phase 3 Q1 2027 |
| vstaix.ch | Valais (VS) | VSTAIX | Phase 3 Q1 2027 |
| vaudtaix.ch | Vaud (VD) | VaudTAIX | Phase 4 Q3 2027 |
| getaix.ch | Genève (GE) | GeTAIX | Phase 4 Q3 2027 |
| zuritaix.ch | Zurich (ZH) | ZuriTAIX | Phase 5 2028 |
| pepsstart.ch | PEP's Swiss SA | Corporate | Institutionnel |
| pepsstart.com | PEP's Swiss SA | Corporate INT | Institutionnel |

**Hébergement:** Infomaniak CH (20 sites inclus) — chaque domaine = virtual host → même app

---

## 💰 TARIFICATION

### B2C Particuliers
- CHF 29 — 100 premiers clients (lancement)
- CHF 49 — prix standard
- CHF 9 — add-on prolongation délai
- CHF 49 — option courrier senior (adresse: Bellevue 7, 2950 Courgenay)

### B2B Fiduciaires
| Plan | Prix/an | Quota | Extra/DI |
|---|---|---|---|
| Solo | CHF 490 | 20 DI | CHF 29 |
| Cabinet | CHF 990 | 60 DI | CHF 29 |
| Unlimited | CHF 1'990 | Illimité | — |
| WIN WIN Finance Group | CHF 0 | Illimité | — |

**WIN WIN facture CHF 49 à ses propres clients** avec toutes les fonctions (FINMA F01042365 couvre le conseil proactif: pilier 3a, subsides LAMal, recommandations assurance)

---

## 🌍 STRATÉGIE MULTILINGUE (6 langues dès le départ)

| Langue | Code | Priorité | Pourquoi | Population cible CH |
|---|---|---|---|---|
| Français | fr | Tier 1 | Langue principale | ~2M en Suisse romande |
| Allemand | de | Tier 1 | Cantons bilingues + Zurich | ~5M |
| Italien | it | Tier 1 | Tessin + communauté italienne | ~330'000 étrangers IT + TI |
| Portugais | pt | Tier 1 | 1ère minorité Jura/NE | ~270'000 |
| Espagnol | es | Tier 1 | 2e langue mondiale | ~105'000 |
| Anglais | en | Tier 1 | Expats GE/ZH/VD | ~45'000 UK + international |

### Tier 2 (post-expansion alémanique)
- Albanais (al) — 115'000 Kosovars, BE/ZH
- Serbe/Croate/Bosnien (sr) — 150'000+, Jura/BE/ZH
- Turc (tr) — 80'000, ZH/Biel

**Règle:** Interface dans la langue choisie. Libellés, explications, aide contextuelle. Les chiffres/calculs sont identiques. La pression fiscale reste dans la langue officielle du canton.

**Argument WIN WIN:** Premier courtier FINMA à conseiller en PT/ES/AL/SR → leads qualifiés dans des communautés jamais servies.

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack
- **Frontend:** React + Zustand + Vite
- **i18n:** Système custom fichier src/i18n.js (clés de traduction)
- **Détection canton:** src/cantonDetector.js (par nom de domaine)
- **Moteur fiscal:** src/engine.js (par canton)
- **State:** src/store.js avec Zustand + audit trail complet
- **Backend (à venir):** Node.js + Express + PostgreSQL
- **Hébergement dev:** Railway (juraitax-app-production-f257.up.railway.app)
- **Hébergement prod:** Infomaniak Suisse (migration obligatoire avant clients réels)
- **OCR/IA:** Claude API Anthropic (Sonnet)
- **Paiements:** Stripe (CHF natif + Twint)
- **Emails:** Resend

### Détection domaine → canton automatique
```
juraitax.ch    → module JU + langue FR
neuchtaix.ch   → module NE + langue FR  
ticinaitax.ch  → module TI + langue IT
vstaix.ch      → module VS + langue FR/DE
zuritaix.ch    → module ZH + langue DE
```

### Base de données (PostgreSQL)
```
clients(id, prenom, nom, naissance, commune, email, no_contribuable, b2b_account_id)
declarations(id, client_id, canton, annee_fiscale, fields_json, audit_trail_json, impot_total, paid_at, pdf_url)
cantons(code, nom, bareme_json, multiplicateurs_json, formulaires_json)
```

---

## 📋 PHILOSOPHIE EXTRACTION DONNÉES

### Règle d'or — Upload First
- **JAMAIS** poser une question si un document peut répondre
- Téléverse → IA extrait → client confirme

### DI précédente (année N-1)
- ✅ Import **identité seulement**: nom, prénom, commune, état civil, confession, enfants, n° contribuable
- ❌ **JAMAIS les chiffres**: revenus, déductions, fortune → toujours recalculés depuis sources 2025

### Audit Trail — 4 états
| État | Couleur | Signification | Responsabilité |
|---|---|---|---|
| AI | 🟢 Vert | Extrait automatiquement depuis document | PEP's Swiss SA |
| IMPORTED | 🟡 Jaune | Identité depuis DI précédente | Partagée |
| USER | 🔴 Rouge | Client a modifié la valeur IA | Client (horodaté) |
| MANUAL | ⚪ Gris | Saisi manuellement, aucun document | Entière du client |

---

## 🚀 DÉPLOIEMENT ACTUEL

- **GitHub:** https://github.com/O-N-2950/juraitax
- **Railway (dev):** https://juraitax-app-production-f257.up.railway.app
- **Railway Project ID:** 77f3852f-a31f-45e6-b983-6dc243dc4f1d
- **Railway Service ID:** 03505601-aa45-41ec-aa76-606fa6c0d2ee
- **Railway Env ID:** a4b83ada-f438-431a-a4a1-3963ad51f487

---

## ✅ TO-DO LIST

### 🔴 IMMÉDIAT (cette semaine)
- [ ] Tester dossier André Neukomm sur Railway
- [ ] Implémenter système i18n (FR/DE/IT/PT/ES/EN)
- [ ] Détection automatique canton par domaine
- [ ] Consulter avocat jurassien CGU (~CHF 300)
- [ ] Créer compte Stripe

### 🟡 COURT TERME (avant 15 mars 2026)
- [ ] Migration Railway → Infomaniak (obligatoire avant clients réels LPD)
- [ ] Backend Node.js + PostgreSQL
- [ ] Connexion API Claude OCR réelle
- [ ] Paiement Stripe avec paywall réel
- [ ] Email récapitulatif + PDF via Resend
- [ ] 5-10 premiers clients réseau WIN WIN

### 🟠 MOYEN TERME (Q2-Q3 2026)
- [ ] Module NE (Neuchâtel) + neuchtaix.ch
- [ ] Module TI (Tessin) + ticinaitax.ch
- [ ] Interface B2B multi-dossiers fiduciaires
- [ ] Comparaison avis de taxation (détection sur/sous-imposition)

### 🔵 LONG TERME (2027+)
- [ ] VS + FR bilingues
- [ ] VD + GE grands marchés
- [ ] ZH + Suisse alémanique
- [ ] API banques cantonales / caisses de pension
- [ ] WIN WIN v2 (application courtage multilingue IA)

---

## 🔗 CONNEXION WIN WIN v2
JurAI Tax est le **top of funnel** de WIN WIN v2.
Chaque client JurAI Tax = lead qualifié avec profil financier complet.
WIN WIN v2 = application de courtage IA multilingue (même architecture, même stack).
Les deux apps partagent: base clients, système multilingue, infrastructure Infomaniak.

---
*Dernière mise à jour: Mars 2026 | Auteur: PEP's Swiss SA + Claude (Anthropic)*
