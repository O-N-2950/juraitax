// ═══════════════════════════════════════════════════════════════════════
//  tAIx — OCR Service v2
//  UN SEUL prompt universel — Claude identifie et extrait tout lui-même
//  Fonctionne pour tous cantons, tous types de documents, toutes situations
//  Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════════════

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── PROMPT UNIVERSEL ─────────────────────────────────────────────────
const PROMPT_UNIVERSEL = `Tu es un expert fiscal suisse avec 30 ans d'expérience dans tous les cantons.
Analyse ce document fiscal suisse. Tu ne connais pas à l'avance son type.

ÉTAPE 1 — Identifie le document parmi :
certificat de salaire, déclaration d'impôt (DI), extrait bancaire, attestation AVS/AI,
attestation LPP/rente, attestation pilier 3a, rachat caisse de pension, facture médicale,
facture entretien immeuble, valeur fiscale immeuble, décompte hypothèque, reçu de don,
facture garde enfants, décompte chômage, document identité/permis, autre document fiscal.

ÉTAPE 2 — Extrais TOUTES les informations fiscalement pertinentes présentes.

Réponds UNIQUEMENT en JSON strict. N'inclus QUE les champs réellement lisibles dans le document :

{
  "_type": "cert_sal|di_prev|extrait_bancaire|avs_ai|lpp_rente|attestation_3a|rachat_lpp|facture_med|entretien|valeur_fiscale|hypotheque|don|garde|chomage|identite|autre",
  "_canton": "JU|NE|FR|VD|VS|GE|TI|ZH|BE|AG|SH|SG|LU|UR|SZ|OW|NW|GL|ZG|SO|BL|BS|AR|AI|GR|TG",
  "_annee": 2025,
  "_confiance": "haute|moyenne|faible",

  "prenom": "",
  "nom": "",
  "naissance": "YYYY-MM-DD",
  "adresse": "",
  "commune": "",
  "no_contribuable": "",
  "etat_civil": "celibataire|marie|divorce|veuf|partenariat",
  "confession": "catholique|reformee|autre|aucune",
  "nb_enfants": 0,

  "rev_salaire_net": 0,
  "rev_salaire_brut": 0,
  "rev_avs": 0,
  "rev_ai": 0,
  "rev_lpp_rente": 0,
  "rev_chomage": 0,
  "rev_independant": 0,
  "valeur_locative": 0,
  "rev_titres_dividendes": 0,

  "cotisations_avs": 0,
  "cotisations_lpp": 0,
  "cotisations_ac": 0,
  "primes_assurance_maladie": 0,
  "primes_assurance_vie": 0,

  "montant_3a": 0,
  "institution_3a": "",
  "montant_rachat_lpp": 0,
  "caisse_pension": "",

  "solde_31dec": 0,
  "banque": "",
  "type_compte": "courant|epargne|titres|3a|autre",
  "iban": "",
  "valeur_titres": 0,

  "interets_hypothecaires": 0,
  "solde_hypotheque": 0,
  "valeur_fiscale": 0,
  "adresse_bien": "",

  "frais_medicaux_brut": 0,
  "rembourse_assurance": 0,
  "frais_medicaux_net": 0,

  "montant_don": 0,
  "organisation_don": "",

  "frais_garde": 0,
  "montant_ttc": 0,
  "type_travaux": "entretien|valeur_ajoutee",
  "deductible_fiscal": true,

  "frais_prof_effectifs": 0,
  "km_trajet": 0,
  "employeur": "",
  "taux_activite": 0,
  "dettes": 0,
  "leasing_solde": 0
}

RÈGLES :
- N'inclus QUE les champs présents et lisibles
- Montants en CHF entier (pas de décimales)
- _confiance = "faible" si document flou ou partiel
- JSON uniquement, aucun texte avant ou après`;

// ── OCR principal ────────────────────────────────────────────────────
export async function ocrDocument(file) {
  if (!ANTHROPIC_API_KEY) {
    return { _error: "API key manquante", _type: "autre" };
  }

  const isPDF     = file.type === "application/pdf";
  const mediaType = isPDF ? "application/pdf" : (file.type || "image/jpeg");
  const base64    = await fileToBase64(file);

  const body = {
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{
      role: "user",
      content: [
        isPDF
          ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }
          : { type: "image",    source: { type: "base64", media_type: mediaType, data: base64 } },
        { type: "text", text: PROMPT_UNIVERSEL }
      ]
    }]
  };

  try {
    const res = await fetch("/api/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return { _error: await res.text(), _type: "autre" };
    }

    const data   = await res.json();
    const text   = data.content?.[0]?.text || "{}";
    const clean  = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(clean);
    return { ...parsed, _filename: file.name };

  } catch (err) {
    console.error("OCR error:", err);
    return { _error: String(err), _type: "autre" };
  }
}

// ── Fusion intelligente de plusieurs résultats OCR ───────────────────
const ADDITIFS = new Set([
  "solde_31dec","valeur_titres","frais_medicaux_brut","frais_medicaux_net",
  "rembourse_assurance","montant_don","frais_garde","montant_ttc",
  "interets_hypothecaires","rev_titres_dividendes","cotisations_avs",
  "cotisations_ac","primes_assurance_maladie",
]);

const IDENTITE = new Set([
  "prenom","nom","naissance","adresse","commune","no_contribuable",
  "etat_civil","confession","nb_enfants","employeur","taux_activite",
]);

export function fusionnerOCR(resultats) {
  const fusion = {};
  for (const r of resultats) {
    if (!r || r._error) continue;
    for (const [k, v] of Object.entries(r)) {
      if (k.startsWith("_") || v === null || v === "" || v === undefined) continue;
      if (typeof v === "number" && v === 0) continue;
      if (ADDITIFS.has(k) && typeof v === "number") {
        fusion[k] = (fusion[k] || 0) + v;
      } else if (IDENTITE.has(k)) {
        if (!fusion[k]) fusion[k] = v;
      } else {
        if (!fusion[k]) fusion[k] = v;
      }
    }
  }
  return fusion;
}

// ── Applique les données OCR au store ───────────────────────────────
// CRITIQUE : les clés doivent correspondre EXACTEMENT aux fieldKey du Form.jsx
const FIELD_MAP = {
  // Identité — clés identiques entre OCR et form
  prenom:               "prenom",
  nom:                  "nom",
  naissance:            "naissance",
  adresse:              "adresse",
  commune:              "commune",
  no_contribuable:      "no_contribuable",
  etat_civil:           "etat_civil",
  confession:           "confession",
  nb_enfants:           "nb_enfants",
  taux_activite:        "taux_activite",
  employeur:            "employeur",

  // Revenus → fieldKeys Form.jsx
  rev_salaire_net:      "revenus_salaire",
  rev_salaire_brut:     "revenus_salaire",   // fallback si net absent
  rev_avs:              "revenus_avs",
  rev_ai:               "revenus_avs",        // AI = même champ que AVS
  rev_lpp_rente:        "revenus_lpp",
  rev_chomage:          "revenus_chomage",
  rev_independant:      "revenus_independant",
  rev_titres_dividendes:"revenus_titres",
  valeur_locative:      "valeur_locative",

  // Cotisations / primes
  cotisations_lpp:      "cotisations_lpp",
  primes_assurance_maladie: "primes_maladie",

  // Épargne / déductions
  montant_3a:           "pilier3a",
  montant_rachat_lpp:   "rachat_lpp",

  // Fortune / comptes
  solde_31dec:          "comptes_bancaires",
  valeur_titres:        "titres",
  assurance_vie_valeur: "assurance_vie",

  // Immobilier
  interets_hypothecaires: "interets_hypothecaires",
  solde_hypotheque:     "dette_hypotheque",
  valeur_fiscale:       "fortune_immobilier",

  // Frais / dons / dettes
  frais_medicaux_net:   "frais_maladie",
  montant_don:          "dons",
  frais_garde:          "frais_garde",
  frais_entretien:      "frais_entretien",
  dettes:               "autres_dettes",
  leasing_solde:        "dette_leasing",
};

export function applyOCRToStore(ocrResult, importFromDoc) {
  if (!ocrResult || ocrResult._error) return;
  const src = ocrResult._filename || ocrResult._type || "document";
  for (const [ocrKey, storeKey] of Object.entries(FIELD_MAP)) {
    const val = ocrResult[ocrKey];
    if (val === undefined || val === null || val === "" || val === 0) continue;
    importFromDoc(storeKey, val, src);
  }
}
