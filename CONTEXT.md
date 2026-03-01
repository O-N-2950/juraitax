# CONTEXT.md — tAIx v6.2
**Dernière mise à jour : 1er mars 2026 — session ChecklistDocs cross-platform + persistence**

---

## 🏢 ENTITÉS & CONTACTS

| Entité | Rôle | Contact |
|--------|------|---------|
| **PEP's Swiss SA** | Éditeur tAIx | Bellevue 7, 2950 Courgenay |
| **WW Finance Group Sàrl** | Partenaire FINMA (subsides, 3a, assurances) | Bellevue 7, 2950 Courgenay · 032 466 11 00 · contact@winwin.swiss · FINMA F01042365 |

---

## 🌐 MARQUE & DOMAINES

- **Nom officiel** : tAIx (t minuscule, AI majuscule, x minuscule)
- **Tagline** : "Déclarations Fiscales Suisses Intelligentes"
- **Domaine** : taix.ch (acquis)
- **Logo HD** : public/logo_taix_hd.png (2400×1300px 300dpi)
- **Email** : contact@taix.ch

---

## 🏗 ARCHITECTURE TECHNIQUE

### Repo
- **GitHub** : https://github.com/O-N-2950/juraitax (branche main)
- **Stack** : React + Vite, CSS-in-JS inline
- **dist/ committé** dans le repo → Railway sert le dist/ directement

### Hébergement
- **TEST** : Railway → https://juraitax-app-production-f257.up.railway.app
- GitHub Actions → build → deploy Railway automatique sur push main ✅
- Service Railway : `juraitax-app` (flag --service juraitax-app dans deploy.yml)
- **CIBLE** : Infomaniak VPS (migration planifiée)

### Clés API
- **Anthropic** : env var Railway VITE_ANTHROPIC_API_KEY (ne jamais écrire la clé ici)
- **Stripe** : env var Railway STRIPE_SECRET_KEY (ne jamais écrire la clé ici)
- OCR via proxy Express /api/anthropic → évite CORS navigateur

---

## 📁 FICHIERS CLÉS

| Fichier | Rôle | Version |
|---------|------|---------|
| `ChecklistDocs.jsx` | Upload + collecte + OCR | **v6 — cross-platform** |
| `store.js` | Zustand state | **v2 — persistence localStorage** |
| `screens.jsx` | Welcome + bannière reprise | **v11** |
| `ocr.js` | OCR Claude Vision | stable |
| `server.js` | Express proxy Anthropic | stable |
| `config.js` | Barèmes, prix, communes | stable |
| `engine.js` | Calcul fiscal JU 2025 | stable |
| `FiscalAdvisor.js` | Questions IA conseiller | v2 |

---

## 🔧 BUGS RÉSOLUS — RÉFÉRENCE TECHNIQUE

### BUG 1 — 35 photos iOS plantaient silencieusement (1er mars 2026)
**Symptôme** : clic sur "Lancer l'analyse" → rien ne se passe
**Cause** : 35 × ~5MB iPhone = 175MB base64 en mémoire → iOS tue le processus JS sans message d'erreur
**Solution** :
- `compressImage()` : canvas resize 1800px max + JPEG 82% → ~300KB/photo (90% moins)
- `try/catch` global dans `analyzeAll()` → message d'erreur rouge visible si crash
- Progress par fichier : `⏳ Photo 3/35 — nom.jpg`
- OCR séquentiel (pas parallèle) → évite saturation mémoire

```javascript
function compressImage(file, maxDim = 1800, quality = 0.82) {
  return new Promise((resolve) => {
    if (file.type === "application/pdf") { resolve(file); return; }
    const img = new Image();
    img.onload = () => {
      const scale = maxDim / Math.max(img.width, img.height);
      // canvas resize → toBlob JPEG
    };
    img.src = URL.createObjectURL(file);
  });
}
```

### BUG 2 — iOS caméra ne se rouvrait pas après 1ère photo
**Cause** : `capture="environment"` + même input DOM → iOS bloque la réouverture
**Solution** : `key={camKeys[inputId]}` — chaque tap incrémente la clé → React remonte l'input → iOS rouvre

```javascript
// camKeys = { cam_global: 0, cam_cert_sal: 2, ... }
<input key={camKeys[inputId] || 0}
  type="file" capture="environment"
  onChange={e => { e.target.value = ""; bumpKey(inputId); addFiles(...); }} />
```

### BUG 3 — OCR déclenchait automatiquement à chaque photo
**Cause** : handleUpload() appelait runOCR() immédiatement
**Solution** : Architecture 2 phases strictes :
- PHASE 1 COLLECTE : photos → `pending[]`, zéro OCR
- PHASE 2 ANALYSE : bouton CTA → `analyzeAll()` → OCR séquentiel

### BUG 4 — Drag & drop closure stale (desktop)
**Cause** : `onDrop` capturait `addFiles` avant son initialisation
**Solution** : `addFiles = useCallback(..., [])` → stable → passé comme dépendance de `onDrop`

---

## ✅ FONCTIONNALITÉS ACTIVES

### Upload documents — ChecklistDocs v6
- Zone drop globale (drag & drop desktop) + 3 boutons : 📷 Photo / 🖼 Galerie / 📎 PDF
- Photos s'accumulent sans aucun traitement (PHASE 1)
- Liste des fichiers en attente avec suppression individuelle
- OCR uniquement sur bouton CTA (PHASE 2)
- Compression auto avant OCR
- Progress fichier par fichier
- Boutons upload ciblés par type de document (forcedDocId)
- Classification automatique par nom de fichier + OCR sur contenu
- **Le nom du fichier (IMG_9542.jpg) n'a AUCUNE importance** — Claude lit le contenu

### Compatibilité plateforme
| Plateforme | Fix |
|-----------|-----|
| iOS Safari | key rotation + reset avant addFiles + safe-area-inset-bottom + touchAction |
| Android Chrome | key rotation + galerie multiple sans capture |
| Desktop | addFiles useCallback stable + drag & drop |
| Tous | minHeight:44px touch targets (Apple HIG) |

### Persistence localStorage — store.js v2
- **Sauvegardé** : fields, lang, canton, mode, b2bUser, subscriber
- **Non sauvegardé** : screen (repart à welcome), photos File objects
- Clé : `taix_dossier_v1` · Expiration : 12 mois
- Sauvegarde différée 300ms après chaque modification
- Bannière "📂 Dossier en cours" sur Welcome si fields non vide
- `reset()` → efface LS + state · `resetDossier()` → garde lang/mode

### Pricing
| Offre | Prix |
|-------|------|
| Particulier lancement (100 premiers) | CHF **29** |
| Particulier standard | CHF **49** |
| B2B Solo | CHF 490/an · 20 DI |
| B2B Cabinet | CHF 990/an · 60 DI |
| B2B Illimité | CHF 1'990/an |
| WinWin B2B | GRATUIT illimité |
| Moutier 2027 | CHF 39 |

### Temps OCR — référence
- 1 photo compressée = **2-4 secondes** par appel API Anthropic
- 35 photos = **~2-4 minutes** total (séquentiel)
- Progress visible photo par photo

---

## 🔗 SOLURIS — INTÉGRATION PRÉVUE
- **Repo** : https://github.com/O-N-2950/soluris
- FastAPI + pgvector + Cohere embeddings
- À faire : endpoint POST /api/fiscal-query
- Objectif : citer "Art. 82 LPP · ATF 148 II 121" sous chaque déduction

---

## 📅 MOUTIER 2027
Ne rien faire avant janvier 2027 · Prix CHF 39 · code MOUTIER2027

---

## 📸 PHOTOS — COMPORTEMENT iOS (important pour les clients)

### Pourquoi les photos ne vont pas dans la pellicule
C'est une **limitation Apple imposée** pour tous les navigateurs web. Quand on utilise `capture="environment"` dans un `<input type="file">`, iOS ouvre la caméra en mode "capture directe" → la photo va dans l'app mais PAS dans la pellicule. Ce n'est pas un bug tAIx.

### Solution recommandée aux clients
**Workflow optimal (pellicule + tAIx) :**
1. Photographier tous les documents avec l'**app Appareil Photo Apple** → photos dans la pellicule
2. Ouvrir tAIx → bouton **🖼 Galerie** → sélectionner toutes les photos d'un coup
3. Appuyer sur **▶ Analyser**

Avantages : photos conservées dans la pellicule, possibilité de relire avant envoi, sélection multiple en une fois.

### Fix compression immédiate (1er mars 2026)
**Problème** : compression uniquement avant OCR → 35 photos × 5MB = 175MB en mémoire → iOS plantait
**Solution** : compression dès l'ajout (`addFiles` async avec `Promise.all`)
- Chaque photo compressée en 0.2s après sélection (canvas 1800px / JPEG 82%)
- 35 photos en mémoire = 35 × 300KB = **10MB** (au lieu de 175MB)
- Aucune limite de nombre de photos
- Toast `⏳ 35 photos en cours…` pendant compression, puis `📷 35 photos ajoutées`

---

## 🔗 VISION COMPLÈTE — tAIx + Soluris

### Architecture cible
```
Photo → Claude OCR universel → données extraites
                ↓
        Soluris RAG interrogé (base juridique complète)
                ↓
        Claude génère conseils + CITE les sources exactes
                ↓
"CHF 2'700 déductibles (Art. 33 al. 1 let. h LIFD · seuil 5% revenu net)"
```

### Ce que Soluris doit contenir
**Fédéral :** LIFD, LHID, LPP/OPP2/OPP3, LAVS/LAI, circulaires AFC 1-45+, jurisprudence ATF fiscal
**Cantonal :** 26 lois fiscales (scraper existant), barèmes 2025 tous cantons, multiplicateurs communaux
**Diplômes :** Expert fiscal fédéral, Fiduciaire fédéral, Brevet comptable, Commentaire Suter-Koch-Locher

### État Soluris (1er mars 2026)
- Scraper 26 cantons : ✅ codé, 🔄 scraping en cours
- Endpoint /api/fiscal-query : ✅ codé et prêt
- pgvector Railway : à vérifier
- Données AFC/ATF/diplômes : à scraper
- Connexion tAIx ↔ Soluris : à faire (30 min dès que Soluris répond)

### Différenciateur concurrentiel
Aucun concurrent ne combine OCR universel + RAG juridique vérifié + conseils IA personnalisés.
Ni en Suisse, ni ailleurs. Chaque conseil sera cité article par article.
