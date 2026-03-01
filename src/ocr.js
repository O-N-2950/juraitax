// ═══════════════════════════════════════════════════════════════════════
//  JurAI Tax / tAIx — OCR Service
//  Lit les documents fiscaux suisses via Claude claude-sonnet-4-6 Vision
//  Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════════════

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

// ── Convertit un File en base64 ──────────────────────────────────────
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Prompt par type de document ─────────────────────────────────────
const PROMPTS = {
  di_prev: `Tu es un expert fiscal suisse. Analyse cette déclaration d'impôt suisse.
Extrais UNIQUEMENT les informations d'identité (pas les montants fiscaux qui seront recalculés).
Réponds en JSON strict:
{
  "prenom": "",
  "nom": "",
  "naissance": "YYYY-MM-DD",
  "adresse": "",
  "commune": "",
  "no_contribuable": "",
  "etat_civil": "celibataire|marie|divorce|veuf|partenariat",
  "confession": "catholique|reformee|autre|aucune",
  "enfants": 0
}
Si une information est illisible ou absente, laisse la valeur vide. JSON uniquement, aucun autre texte.`,

  cert_sal: `Tu es un expert fiscal suisse. Analyse ce certificat de salaire suisse (formulaire officiel).
Réponds en JSON strict:
{
  "rev_salaire": 0,
  "rev_salaire_brut": 0,
  "cotisations_avs": 0,
  "cotisations_lpp": 0,
  "cotisations_ac": 0,
  "frais_prof_effectifs": 0,
  "frais_prof_forfait": 0,
  "employeur": "",
  "annee": 0,
  "indemnite_repas": 0,
  "remboursement_frais": 0
}
Champs numériques = montant CHF (entier). JSON uniquement.`,

  "3a": `Tu es un expert fiscal suisse. Analyse cette attestation pilier 3a.
Réponds en JSON strict:
{
  "montant_3a": 0,
  "institution": "",
  "annee": 0,
  "type": "banque|assurance",
  "titulaire": ""
}
JSON uniquement.`,

  rachat_lpp: `Tu es un expert fiscal suisse. Analyse ce document de rachat LPP / caisse de pension.
Réponds en JSON strict:
{
  "montant_rachat_lpp": 0,
  "caisse_pension": "",
  "annee": 0,
  "type_document": "rachat|attestation_solde|rente"
}
JSON uniquement.`,

  comptes: `Tu es un expert fiscal suisse. Analyse cet extrait de compte bancaire.
Extrais le solde au 31 décembre.
Réponds en JSON strict:
{
  "solde_31dec": 0,
  "banque": "",
  "type_compte": "courant|epargne|titres|3a",
  "iban": "",
  "annee": 0,
  "devise": "CHF"
}
JSON uniquement.`,

  hypotheque: `Tu es un expert fiscal suisse. Analyse ce décompte d'intérêts hypothécaires.
Réponds en JSON strict:
{
  "interets_hypothecaires": 0,
  "solde_hypotheque": 0,
  "banque": "",
  "annee": 0,
  "taux": 0,
  "type": "fixe|variable|libor_saron"
}
JSON uniquement.`,

  immobilier: `Tu es un expert fiscal suisse. Analyse ce document immobilier (valeur fiscale / estimation officielle).
Réponds en JSON strict:
{
  "valeur_fiscale": 0,
  "valeur_locative": 0,
  "commune_bien": "",
  "type_bien": "villa|appartement|terrain|immeuble_locatif",
  "adresse_bien": ""
}
JSON uniquement.`,

  entretien: `Tu es un expert fiscal suisse. Analyse cette facture de travaux d'entretien d'immeuble.
Réponds en JSON strict:
{
  "montant_ttc": 0,
  "montant_ht": 0,
  "prestataire": "",
  "date": "",
  "description_travaux": "",
  "type": "entretien|renovation_valeur_ajoutee",
  "deductible_fiscal": true
}
Pour le champ deductible_fiscal: true si c'est de l'entretien courant, false si c'est de la rénovation augmentant la valeur.
JSON uniquement.`,

  medicaux: `Tu es un expert fiscal suisse. Analyse cette facture médicale / note d'honoraires.
Réponds en JSON strict:
{
  "montant_facture": 0,
  "rembourse_assurance": 0,
  "montant_net_non_rembourse": 0,
  "prestateur": "",
  "date": "",
  "type_soin": ""
}
JSON uniquement.`,

  garde: `Tu es un expert fiscal suisse. Analyse cette facture de garde d'enfants (crèche/garderie).
Réponds en JSON strict:
{
  "montant_annuel": 0,
  "institution": "",
  "annee": 0,
  "nb_enfants": 0
}
JSON uniquement.`,

  dons: `Tu es un expert fiscal suisse. Analyse ce reçu de don.
Réponds en JSON strict:
{
  "montant_don": 0,
  "organisation": "",
  "date": "",
  "exoneration_fiscale": true,
  "numero_don": ""
}
JSON uniquement.`,

  leasing: `Tu es un expert fiscal suisse. Analyse ce contrat/décompte de leasing.
Réponds en JSON strict:
{
  "solde_restant_du": 0,
  "loyer_mensuel": 0,
  "societe_leasing": "",
  "objet": "",
  "date_fin": ""
}
JSON uniquement.`,

  // Générique pour tout autre document
  default: `Tu es un expert fiscal suisse. Analyse ce document fiscal.
Extrais toutes les informations financières pertinentes pour une déclaration d'impôt suisse.
Réponds en JSON avec les champs trouvés. JSON uniquement, aucun autre texte.`,
};

// ── OCR principal ────────────────────────────────────────────────────
export async function ocrDocument(file, docType = "default") {
  if (!ANTHROPIC_API_KEY) {
    console.warn("VITE_ANTHROPIC_API_KEY manquante — OCR désactivé");
    return { _error: "API key manquante", _docType: docType };
  }

  const isPDF = file.type === "application/pdf";
  const mediaType = isPDF ? "application/pdf" : (file.type || "image/jpeg");
  const base64 = await fileToBase64(file);
  const prompt = PROMPTS[docType] || PROMPTS.default;

  const body = {
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: [
        isPDF
          ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }
          : { type: "image",    source: { type: "base64", media_type: mediaType, data: base64 } },
        { type: "text", text: prompt }
      ]
    }]
  };

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Claude API error:", err);
      return { _error: err, _docType: docType };
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || "{}";

    // Parse JSON — strip markdown fences if present
    const clean = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(clean);
    return { ...parsed, _docType: docType, _filename: file.name };

  } catch (err) {
    console.error("OCR error:", err);
    return { _error: String(err), _docType: docType };
  }
}

// ── Applique les données OCR au store ───────────────────────────────
// Mapping OCR fields → store fields
const FIELD_MAP = {
  // Identité (di_prev)
  prenom:              "prenom",
  nom:                 "nom",
  naissance:           "naissance",
  adresse:             "adresse",
  commune:             "commune",
  no_contribuable:     "no_contribuable",
  etat_civil:          "etat_civil",
  confession:          "confession",
  enfants:             "enfants",

  // Revenus (cert_sal)
  rev_salaire:         "rev_salaire",
  cotisations_lpp:     "cotisations_lpp",

  // Déductions
  montant_3a:          "pilier_3a",
  montant_rachat_lpp:  "rachat_lpp",
  montant_annuel:      "frais_garde",  // garde enfants
  montant_don:         "dons",
  montant_net_non_rembourse: "frais_medicaux",

  // Fortune / Immobilier
  solde_31dec:         "solde_bancaire",
  interets_hypothecaires: "interets_hypothecaires",
  solde_hypotheque:    "for_hypotheque",
  valeur_fiscale:      "for_immobilier",
  valeur_locative:     "valeur_locative",
  solde_restant_du:    "dettes_leasing",

  // Entretien immeuble
  montant_ttc:         "_entretien_montant",
};

export function applyOCRToStore(ocrResult, importFromDoc, setField, SOURCE) {
  if (!ocrResult || ocrResult._error) return;

  for (const [ocrKey, storeKey] of Object.entries(FIELD_MAP)) {
    const val = ocrResult[ocrKey];
    if (val === undefined || val === null || val === "" || val === 0) continue;

    // Cas spécial entretien : accumuler
    if (storeKey === "_entretien_montant" && ocrResult.deductible_fiscal) {
      importFromDoc("frais_entretien_reel", val, ocrResult._filename);
      continue;
    }

    importFromDoc(storeKey, val, ocrResult._filename || ocrResult._docType);
  }
}

// ── OCR multiple (tous les fichiers de la checklist) ─────────────────
export async function ocrAllDocuments(uploads, importFromDoc, SOURCE, onProgress) {
  const entries = Object.entries(uploads).filter(([, file]) => file instanceof File);
  const results = {};
  let done = 0;

  for (const [docType, file] of entries) {
    onProgress?.(`📄 Lecture ${file.name}…`, Math.round((done / entries.length) * 80));
    const result = await ocrDocument(file, docType);
    results[docType] = result;
    applyOCRToStore(result, importFromDoc, null, SOURCE);
    done++;
  }

  onProgress?.("✅ Documents analysés", 90);
  return results;
}
