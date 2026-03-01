# TODO.md — tAIx
> PEP's Swiss SA · Bellevue 7 · 2950 Courgenay
> Mis à jour : 1er mars 2026 — session cross-platform + persistence

---

## 🔴 TEST IMMÉDIAT — Déclaration papa

URL : https://juraitax-app-production-f257.up.railway.app

**Flux à tester :**
1. Welcome → "Commencer ma déclaration"
2. Checklist → 📷 Photo → prendre photos UNE PAR UNE (ou galerie pour toutes)
3. Vérifier : chaque photo apparaît dans la liste "en attente" avec son nom
4. Quand TOUTES les photos sont là → "▶ Analyser N photos"
5. Attendre ~2-4 min (35 photos = progress visible photo par photo)
6. Formulaire pré-rempli → Résultat

**Si ça plante :** message rouge s'affiche "Vos photos sont conservées — réessayez"

---

## 🔴 STRIPE — À FINALISER (30 min)

- [ ] dashboard.stripe.com → récupérer **pk_live_...** (clé PUBLIQUE)
- [ ] Créer Payment Link CHF 29 (lancement)
- [ ] Créer Payment Link CHF 49 (standard)
- [ ] Créer Payment Link CHF 49/an (abonnement)
- [ ] Metadata : app=taix.ch, plan=particulier
- [ ] Variables Railway :
  - VITE_STRIPE_PUBLISHABLE_KEY = pk_live_...
  - VITE_STRIPE_PAYMENT_LINK_29 = https://buy.stripe.com/...
  - VITE_STRIPE_PAYMENT_LINK_49 = https://buy.stripe.com/...
  - VITE_STRIPE_PAYMENT_LINK_SUB = https://buy.stripe.com/...

---

## 🔴 SOLURIS — INTÉGRATION FISCALE (1 session)

- [ ] POST /api/fiscal-query dans Soluris (sans auth, clé TAIX_INTERNAL_KEY)
- [ ] Intégrer dans FiscalAdvisor.js → citer sources de loi sous chaque déduction

---

## 🟠 MIGRATION INFOMANIAK (destination finale)

- [ ] Étape 1 : Compte Infomaniak + VPS-1 (~CHF 9/mois)
- [ ] Étape 2 : Transférer domaines taix.ch + juraitax.ch (code EPP)
- [ ] Étape 3 : DNS A + CNAME www + SSL Let's Encrypt
- [ ] Étape 4 : Resend email — DKIM/SPF, contact@taix.ch
- [ ] Étape 5 : Build local → upload dist/ → public_html/
- [ ] Étape 6 : .htaccess React Router
- [ ] Étape 7 : Backend Node.js + PostgreSQL (subscribers, magic_links)
- [ ] Étape 8 : Magic Link login (sans mot de passe)
- [ ] Étape 9 : Couper Railway après validation

---

## 🟢 AMÉLIORATIONS UX FUTURES

- [ ] Toast de confirmation après analyse OCR réussie
- [ ] Résumé des données extraites avant de passer au formulaire
- [ ] Mode hors-ligne partiel (service worker)
- [ ] Cantons NE, BE, GE, VD, TI (après validation JU)

---

## ✅ FAIT CETTE SESSION (1er mars 2026)

### ChecklistDocs v6 — cross-platform
- [x] Architecture 2 phases strictes : COLLECTE (aucun OCR) → ANALYSE (bouton CTA)
- [x] **Fix iOS caméra** : key rotation `camKeys[inputId]` → remontage DOM → caméra rouvre
- [x] **Fix 35 photos plantaient** : compression canvas 1800px/JPEG82% + try/catch global + progress par fichier
- [x] **Fix drag & drop desktop** : addFiles useCallback stable
- [x] safe-area-inset-bottom → CTA visible sur iPhone avec home indicator
- [x] touchAction:"manipulation" → suppression délai 300ms iOS
- [x] minHeight:44px partout (Apple HIG)
- [x] Toast "📷 N photos ajoutées" → feedback immédiat
- [x] Message erreur rouge si crash OCR ("Vos photos sont conservées")

### store.js v2 — Persistence localStorage
- [x] Sauvegarde automatique fields/lang/canton/mode à chaque modification (300ms debounce)
- [x] Restauration au démarrage (expiration 12 mois)
- [x] reset() efface localStorage · resetDossier() garde lang/mode
- [x] hasSavedDossier() + savedAt() helpers

### screens.jsx v11 — Bannière reprise
- [x] Bannière verte "📂 Dossier en cours — Sauvegardé le [date]" sur Welcome
- [x] Bouton "Reprendre →" → screen checklist directement
- [x] Bouton "Nouveau" → reset complet

### Documentation
- [x] CONTEXT.md v6.2 — bugs résolus documentés avec code
- [x] TODO.md mis à jour

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
| Deploy | git push origin main (GitHub Actions automatique) |

---

## ✅ FAIT — compression immédiate + pellicule iOS (1er mars 2026)

- [x] **Fix compression immédiate** : `addFiles` est maintenant async — chaque photo compressée (canvas 1800px/JPEG82%) dès la sélection via `Promise.all`. 35 photos = 10MB en mémoire au lieu de 175MB. Aucune limite de nombre de photos.
- [x] **Pellicule iPhone** : limitation Apple — le bouton 📷 en web app ne sauvegarde pas dans la pellicule. Solution documentée : photographier avec l'app Appareil Photo native → puis bouton 🖼 Galerie dans tAIx pour importer tout d'un coup.
- [x] **À communiquer aux clients** : "Prenez vos photos avec l'app Appareil Photo, puis importez via Galerie"
