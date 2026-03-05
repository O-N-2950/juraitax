// ═══════════════════════════════════════════════════════════════════════
//  tAIx — FiscalExpert.js v1.0
//  LE CERVEAU : Expert fiscal IA qui raisonne comme un humain
//
//  PRINCIPES ABSOLUS :
//  1. Aucune estimation — document absent = champ bloqué
//  2. Raisonnement en chaîne : "je vois X → je déduis Y → je demande Z"
//  3. Questions intelligentes — jamais de question absurde selon le profil
//  4. Connaît les paramètres exacts JU / NE / BE 2025
//  5. Interactif — chaque réponse alimente le raisonnement suivant
//
//  Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────
// 1. BASE DE CONNAISSANCES CANTONALES 2025
//    Injectée directement dans le prompt — l'IA connaît TOUT
// ─────────────────────────────────────────────────────────────────────

const KNOWLEDGE_CANTONS = {

  JU: {
    nom: "Canton du Jura",
    annee: 2025,
    quotiteEtat: 2.85,

    forfaitAssurances: {
      marieSansPilier:       8380,  // Rentiers mariés sans pilier actif
      marieUnPilier:         7590,
      marieDeuxPiliers:      6800,
      seulSansPilier:        4190,
      seulAvecPilier:        3400,
      supplementEnfantCharge: 1020,
      supplementEnfantFormation: 3400,
    },

    deductions: {
      coupleMarié:           3600,
      fortuneMarié:         57000,
      fortuneSeul:          28000,
      fortuneParEnfant:     28000,
      fraisProTaux:            3,   // % du salaire brut
      fraisProMin:           2000,
      fraisProMax:           4000,
      doubleRevenuMax:      13500,
      fraisMaladieRanchisePct:  5,  // 5% revenu net I
      donsMaxPct:              20,  // 20% revenu net I
      forfaitImmoNeuf:         10,  // < 10 ans
      forfaitImmoAncien:       20,  // >= 10 ans
      pilier3aSalarie:       7258,
      pilier3aIndependantMax: 36288,
    },

    personnesAgees: {
      // Seuil au-delà duquel la déduction code 670 tombe à 0
      // Couple avec double rente : ~52'600
      // Couple avec rente unique : ~45'000
      // Seul : ~42'800
      seuilCouplDoubleRente: 52600,
      seuilCoupleRenteUnique: 45000,
      seuilSeul: 42800,
      note: "Déduction dégressive selon table officielle JuraTax — code 670",
    },

    immeuble: {
      valeurLocativeNote: "Fixée par le fisc — reprendre valeur DI précédente",
      fraisEffectifsVsForfait: "Toujours comparer — si sinistre/rénovation → effectifs souvent meilleurs",
      documentsRequis: ["Formule 4 ou factures entretien", "Estimation fiscale valeur immeuble"],
    },

    hypotheque: {
      note: "Intérêts SARON = taux variable trimestriel — attestation annuelle Raiffeisen/banque obligatoire",
      documentsRequis: ["Relevé hypothécaire annuel avec total intérêts 2025"],
    },

    impotEcclesiastique: {
      note: "Calculé sur l'impôt État — taux varie par commune (ex: Bure catholique 8.05%)",
    },
  },

  NE: {
    nom: "Canton de Neuchâtel",
    annee: 2025,
    centimesEtat: 124,
    splitting: 1.923077,

    forfaitAssurances: {
      // NE utilise des forfaits différents de JU
      avecPilier:   6125,  // VP marié avec pilier 3a/2e
      sansPilier:   6125,  // vérifier valeur exacte NE
      note: "Vérifier table NE — valeurs VP différentes de JU",
    },

    deductions: {
      coupleMarié:            3600,
      personneSeule:          2000,
      monoparental:           3600,
      zvaDoubleSalaireTaux:     25, // 25% du plus petit revenu
      zvaMax:                 1200,
      fraisProTaux:              3,
      fraisProMin:            2000,
      fraisProMax:            4000,
      fraisFormationMaxICC:  12400,
      fraisFormationMaxIFD:  13000,
      pilier3aSalarie:        7258,
      pilier3aIndependantMax: 36288,
      fraisMaladieFranchisePct:  5,
      donsMaxPct:               20,
      fortuneFranchise:          0, // NE: pas de franchise fortune
    },

    hypotheque: {
      plafondBase: 50000,
      note: "Plafond intérêts = fortune brute + 50'000 CHF",
      documentsRequis: ["Relevé hypothécaire annuel"],
    },
  },

  BE: {
    nom: "Canton de Berne",
    annee: 2025,

    deductions: {
      // BE a ses propres forfaits — vérifier be_engine_2025.js
      pilier3aSalarie:  7258,
      pilier3aIndependantMax: 36288,
      fraisMaladieFranchisePct: 5,
      donsMaxPct: 20,
      note: "Voir be_engine_2025.js pour barèmes complets",
    },
  },
};

// ─────────────────────────────────────────────────────────────────────
// 2. RÈGLES DE RAISONNEMENT — ce que l'expert déduit automatiquement
//    Format : { condition, deduit, documentRequis, messageClient }
// ─────────────────────────────────────────────────────────────────────

const REGLES_DEDUCTION = [
  // ── IMMOBILIER ────────────────────────────────────────────────────
  {
    id: "hypo_interets",
    condition: (d) => (d.dette_hypotheque || d.solde_hypotheque || 0) > 0,
    deduit: "Il y a une hypothèque → des intérêts ont forcément été payés en 2025",
    champRequis: "interets_hypothecaires",
    documentRequis: "Relevé hypothécaire annuel 2025 (banque)",
    instructionClient: "Votre relevé annuel de prêt hypothécaire mentionne le total des intérêts payés en 2025. Cherchez 'intérêts' ou 'Schuldzinsen' dans votre e-banking → Documents fiscaux.",
    impactEstime: "Variable selon taux SARON",
    bloquant: true,
  },
  {
    id: "immo_valeur_locative",
    condition: (d) => d.fortune_immobilier > 0 || d.proprietaire === true,
    deduit: "Propriétaire → valeur locative imposable + frais d'entretien déductibles",
    champRequis: "valeur_locative",
    documentRequis: "Formule 4 ou estimation fiscale officielle",
    instructionClient: "La valeur locative figure sur votre ancienne déclaration d'impôt (code 300) ou sur l'avis de taxation de votre bien immobilier.",
    bloquant: true,
  },
  {
    id: "immo_frais_entretien",
    condition: (d) => d.valeur_locative > 0 || d.proprietaire === true,
    deduit: "Propriétaire → possibilité de déduire les frais d'entretien réels si > forfait",
    champRequis: "frais_entretien",
    documentRequis: "Factures travaux d'entretien 2025 (ramonage, réparations, etc.)",
    instructionClient: "Avez-vous payé des factures d'entretien pour votre logement en 2025 ? (réparations, ramonage, peinture, plomberie…) Ces frais peuvent être déduits si supérieurs au forfait de 20%.",
    bloquant: false, // pas bloquant — forfait s'applique si pas de factures
  },

  // ── REVENUS ───────────────────────────────────────────────────────
  {
    id: "avs_attestation",
    condition: (d) => d.revenus_avs > 0 || d.rev_avs > 0,
    deduit: "Rente AVS détectée → attestation annuelle CFC obligatoire",
    champRequis: "revenus_avs",
    documentRequis: "Attestation de rente AVS 2025 (Caisse fédérale de compensation)",
    instructionClient: "L'attestation de votre rente AVS pour 2025 vous a été envoyée par la CFC en janvier 2026. Elle mentionne le montant annuel exact.",
    bloquant: true,
  },
  {
    id: "lpp_attestation",
    condition: (d) => d.revenus_lpp > 0 || d.rev_lpp_rente > 0,
    deduit: "Rente LPP détectée → attestation caisse de pension obligatoire",
    champRequis: "revenus_lpp",
    documentRequis: "Attestation de rente LPP 2025 (caisse de pension)",
    instructionClient: "Votre caisse de pension vous a envoyé une attestation annuelle pour 2025. Elle indique le montant exact de votre rente perçue.",
    bloquant: true,
  },
  {
    id: "salaire_certificat",
    condition: (d) => (d.revenus_salaire || 0) > 0 || (d.activites || []).includes("salarie"),
    deduit: "Activité salariée → certificat de salaire obligatoire",
    champRequis: "revenus_salaire",
    documentRequis: "Certificat de salaire 2025 (employeur)",
    instructionClient: "Votre employeur doit vous remettre votre certificat de salaire pour 2025. Il mentionne salaire brut, cotisations sociales et éventuels avantages.",
    bloquant: true,
  },

  // ── TITRES ET CAPITAUX ───────────────────────────────────────────
  {
    id: "titres_rendement",
    condition: (d) => (d.titres || d.valeur_titres || 0) > 0 || (d.comptes_bancaires || 0) > 50000,
    deduit: "Avoirs bancaires/titres → intérêts et dividendes à déclarer",
    champRequis: "revenus_titres",
    documentRequis: "Relevés fiscaux bancaires 2025 (Formule 5 / attestation fiscale)",
    instructionClient: "Vos banques émettent une attestation fiscale annuelle mentionnant les intérêts perçus et l'impôt anticipé (35%) récupérable. Cherchez 'attestation fiscale' ou 'Steuerausweis'.",
    bloquant: true,
  },
  {
    id: "impot_anticipe",
    condition: (d) => (d.revenus_titres || 0) > 0 || (d.titres || 0) > 0,
    deduit: "Rendements détectés → vérifier impôt anticipé 35% récupérable",
    champRequis: "impot_anticipe",
    documentRequis: "Inclus dans l'attestation fiscale bancaire",
    instructionClient: null, // géré avec titres_rendement
    bloquant: false,
  },

  // ── MALADIE ───────────────────────────────────────────────────────
  {
    id: "primes_maladie",
    condition: (d) => true, // Tout le monde a une assurance maladie en Suisse
    deduit: "Toute personne domiciliée en Suisse a une assurance maladie obligatoire",
    champRequis: "primes_maladie",
    documentRequis: "Décompte annuel primes maladie 2025 (caisse maladie)",
    instructionClient: "Votre caisse maladie (KPT, CSS, Helsana, etc.) vous envoie un décompte annuel pour 2025 mentionnant les primes nettes payées. Il peut aussi figurer sur votre e-banking.",
    bloquant: true,
  },
  {
    id: "frais_maladie",
    condition: (d) => true, // À demander systématiquement
    deduit: "Frais médicaux non remboursés possibles → à vérifier",
    champRequis: "frais_maladie",
    documentRequis: null, // Déclaratif
    instructionClient: null, // Géré comme question
    bloquant: false,
  },

  // ── DÉDUCTIONS SPÉCIALES ─────────────────────────────────────────
  {
    id: "pilier3a",
    condition: (d) => {
      const age = d.naissance
        ? new Date().getFullYear() - parseInt((d.naissance || "").split(/[-/]/)[0])
        : null;
      const estActif = (d.revenus_salaire || 0) > 0 || (d.activites || []).includes("salarie") || (d.activites || []).includes("independant");
      return estActif && age && age < 65;
    },
    deduit: "Salarié/indépendant actif < 65 ans → pilier 3a déductible",
    champRequis: "pilier3a",
    documentRequis: "Attestation pilier 3a 2025 (banque ou assurance)",
    instructionClient: "Avez-vous versé dans un pilier 3a en 2025 ? Si oui, votre banque ou assurance vous remet une attestation. Déductible jusqu'à CHF 7'258.",
    bloquant: false,
  },
  {
    id: "frais_garde",
    condition: (d) => (d.nb_enfants || 0) > 0 && (() => {
      const age = d.naissance ? new Date().getFullYear() - parseInt((d.naissance||"").split(/[-/]/)[0]) : 99;
      return age < 64; // Parents actifs
    })(),
    deduit: "Enfants détectés + parents actifs → frais de garde possibles",
    champRequis: "frais_garde",
    documentRequis: "Factures crèche/garderie/parascolaire 2025",
    instructionClient: "Avez-vous payé des frais de garde pour vos enfants en 2025 ? (crèche, garderie, parascolaire, nounou) Ces frais sont déductibles.",
    bloquant: false,
  },
  {
    id: "dons",
    condition: (d) => true,
    deduit: "Dons possibles — à demander systématiquement",
    champRequis: "dons",
    documentRequis: null,
    instructionClient: null,
    bloquant: false,
  },
];

// ─────────────────────────────────────────────────────────────────────
// 3. PROMPT EXPERT — injecté à Claude avec TOUT le contexte
// ─────────────────────────────────────────────────────────────────────

function buildExpertPrompt(donneesClient, canton, histoireConversation, lang) {
  const langLabel = {
    fr: "français", de: "allemand", it: "italien",
    pt: "portugais", es: "espagnol", en: "anglais"
  }[lang] || "français";

  const kc = KNOWLEDGE_CANTONS[canton] || KNOWLEDGE_CANTONS.JU;

  // Calculer l'âge
  const anneeNaissance = donneesClient.naissance
    ? parseInt((donneesClient.naissance || "").split(/[-/]/)[0])
    : null;
  const age = anneeNaissance ? (2025 - anneeNaissance) : null;

  // Détecter profil
  const estRetraite = (donneesClient.revenus_avs > 0 || donneesClient.rev_avs > 0)
    && !(donneesClient.revenus_salaire > 0);
  const estProprietaire = donneesClient.fortune_immobilier > 0
    || donneesClient.proprietaire === true
    || donneesClient.dette_hypotheque > 0
    || donneesClient.valeur_locative > 0;
  const aHypotheque = (donneesClient.dette_hypotheque || donneesClient.solde_hypotheque || 0) > 0;
  const aEnfants = (donneesClient.nb_enfants || 0) > 0;
  const aMaries = donneesClient.etat_civil === "marie" || donneesClient.etat_civil === "marié";

  // Documents déjà fournis (champs non vides)
  const champsRemplis = Object.entries(donneesClient)
    .filter(([, v]) => v !== null && v !== undefined && v !== "" && v !== 0)
    .map(([k]) => k);

  // Détecter documents manquants via règles
  const documentsManquants = REGLES_DEDUCTION
    .filter(r => r.bloquant && r.condition(donneesClient) && !(donneesClient[r.champRequis] > 0))
    .map(r => ({ id: r.id, document: r.documentRequis, instruction: r.instructionClient }));

  return `Tu es un expert fiscal suisse avec 30 ans d'expérience. Tu travailles pour tAIx — cabinet fiscal digital suisse.
Tu t'appelles ALIX et tu t'adresses au client directement, de manière chaleureuse et professionnelle.
Tu connais parfaitement la législation fiscale suisse et les règles spécifiques du canton du client.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFIL DU CLIENT (extrait de ses documents)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(donneesClient, null, 2)}

ANALYSE AUTOMATIQUE :
- Âge estimé : ${age ? `${age} ans` : "inconnu"}
- Profil : ${estRetraite ? "RETRAITÉ" : "ACTIF"}
- Propriétaire : ${estProprietaire ? "OUI" : "NON"}
- Hypothèque : ${aHypotheque ? `OUI — CHF ${(donneesClient.dette_hypotheque || donneesClient.solde_hypotheque || 0).toLocaleString("fr-CH")}` : "NON"}
- Marié : ${aMaries ? "OUI" : "NON"}
- Enfants : ${aEnfants ? donneesClient.nb_enfants : "NON"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARAMÈTRES FISCAUX ${kc.nom} 2025
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(kc, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCUMENTS DÉJÀ REÇUS (champs remplis)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${champsRemplis.join(", ")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCUMENTS OBLIGATOIRES ENCORE MANQUANTS
(détectés automatiquement par logique fiscale)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${documentsManquants.length > 0
  ? documentsManquants.map(d => `• ${d.document}`).join("\n")
  : "Aucun — tous les documents obligatoires sont présents"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HISTORIQUE DE LA CONVERSATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${histoireConversation.length > 0
  ? histoireConversation.map(m => `${m.role === "client" ? "CLIENT" : "ALIX"}: ${m.message}`).join("\n")
  : "Première interaction"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLES DE COMPORTEMENT ABSOLUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. RAISONNEMENT EN CHAÎNE obligatoire :
   Tu VOIS quelque chose → tu DÉDUIS → tu DEMANDES ou tu INFORMES
   Ex: "Je vois une dette hypothécaire de CHF 168'000. Des intérêts ont
   forcément été payés en 2025. J'ai besoin de votre relevé Raiffeisen."

2. JAMAIS DE QUESTIONS INUTILES selon le profil :
   - Retraité → JAMAIS de question sur trajet domicile-travail, télétravail, pilier 3a actif
   - Sans enfants → JAMAIS de question sur frais de garde
   - Locataire → JAMAIS de question sur valeur locative ou entretien immeuble
   - Si un champ est déjà rempli → ne PAS redemander

3. DOCUMENTS MANQUANTS = PRIORITÉ ABSOLUE :
   Si un document obligatoire manque → c'est la PREMIÈRE chose à demander
   Explique EXACTEMENT où trouver ce document (e-banking, courrier, employeur...)

4. LANGAGE ADAPTÉ :
   - Senior (> 70 ans) → phrases courtes, mots simples, rassurant
   - Jeune actif → direct, efficace
   - Toujours en ${langLabel}

5. UNE SEULE CHOSE À LA FOIS :
   Maximum 1-2 demandes par message. Ne pas noyer le client.

6. TRANSPARENCE FISCALE :
   Explique POURQUOI tu demandes quelque chose et quel est l'impact en CHF estimé.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CE QUE TU DOIS FAIRE MAINTENANT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Réponds en JSON strict :
{
  "message_client": "Message chaleureux et professionnel pour le client. Max 3-4 phrases. Une action claire.",
  "raisonnement_interne": "Explication de ta logique fiscale (pas visible par le client)",
  "documents_requis": [
    {
      "id": "identifiant_unique",
      "document": "Nom exact du document",
      "instruction_precise": "Où et comment le trouver exactement",
      "champ_store": "nom_champ_a_remplir",
      "bloquant": true
    }
  ],
  "questions": [
    {
      "id": "q1",
      "question": "Question courte et claire",
      "type": "oui_non|montant|nombre|choix|upload",
      "explication": "Pourquoi cette question (impact fiscal)",
      "options": [],
      "champ_store": "nom_champ",
      "impact_estime_chf": "CHF 100–500",
      "priorite": 1
    }
  ],
  "optimisations_detectees": [
    "Description d'une opportunité fiscale spécifique à ce client"
  ],
  "calcul_possible": false,
  "raison_blocage": "Document X manquant — impossible de calculer sans"
}

JSON uniquement. Aucun texte avant ou après.`;
}

// ─────────────────────────────────────────────────────────────────────
// 4. MOTEUR DE RAISONNEMENT LOCAL
//    Utilisé en fallback si API indisponible
//    Aussi utilisé pour pré-filtrer AVANT l'appel IA
// ─────────────────────────────────────────────────────────────────────

export function analyserDocumentsManquants(donneesClient) {
  const obligatoires = [];
  const recommandes  = [];

  for (const regle of REGLES_DEDUCTION) {
    if (!regle.condition(donneesClient)) continue;

    const valeur = donneesClient[regle.champRequis];
    const manque = !valeur || valeur === 0 || valeur === "" || valeur === null;

    if (!manque) continue;
    if (!regle.documentRequis) continue;

    const item = {
      id:           regle.id,
      champ:        regle.champRequis,
      document:     regle.documentRequis,
      instruction:  regle.instructionClient,
      bloquant:     regle.bloquant,
      raisonnement: regle.deduit,
    };

    if (regle.bloquant) obligatoires.push(item);
    else recommandes.push(item);
  }

  return { obligatoires, recommandes, calcul_possible: obligatoires.length === 0 };
}

// ─────────────────────────────────────────────────────────────────────
// 5. APPEL PRINCIPAL — Expert IA
// ─────────────────────────────────────────────────────────────────────

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export async function consulterExpertFiscal({
  donneesClient,
  histoireConversation = [],
  lang = "fr",
}) {
  // Détecter canton
  const canton = (
    donneesClient.canton ||
    donneesClient._canton ||
    detecterCanton(donneesClient.commune || "")
  ).toUpperCase();

  // Pré-analyse locale (même si API indisponible)
  const analyse = analyserDocumentsManquants(donneesClient);

  // Si pas d'API → fallback local intelligent
  if (!ANTHROPIC_API_KEY) {
    return fallbackExpert(donneesClient, analyse, lang);
  }

  try {
    const prompt = buildExpertPrompt(donneesClient, canton, histoireConversation, lang);

    const res = await fetch("/api/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(await res.text());

    const data   = await res.json();
    const text   = data.content?.[0]?.text || "{}";
    const clean  = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(clean);

    // Enrichir avec l'analyse locale (source de vérité pour les blocages)
    return {
      ...parsed,
      _analyse_locale: analyse,
      calcul_possible: analyse.calcul_possible && parsed.calcul_possible !== false,
    };

  } catch (err) {
    console.error("FiscalExpert error:", err);
    return fallbackExpert(donneesClient, analyse, lang);
  }
}

// ─────────────────────────────────────────────────────────────────────
// 6. RÉPONSE À UNE QUESTION CLIENT — maintient le dialogue
// ─────────────────────────────────────────────────────────────────────

export async function repondreQuestion({
  question,
  reponse,
  donneesClient,
  histoireConversation,
  lang = "fr",
}) {
  // Mettre à jour les données client avec la réponse
  const donneesMAJ = { ...donneesClient };

  if (question.champ_store && reponse !== null && reponse !== undefined) {
    if (question.type === "montant" || question.type === "nombre") {
      const n = parseFloat(String(reponse).replace(/[' ]/g, ""));
      if (!isNaN(n)) donneesMAJ[question.champ_store] = n;
    } else if (question.type === "oui_non") {
      donneesMAJ[question.champ_store] = reponse;
    } else {
      donneesMAJ[question.champ_store] = reponse;
    }
  }

  // Ajouter à l'historique
  const histoireMAJ = [
    ...histoireConversation,
    { role: "client", message: `[${question.question}] → ${reponse}` },
  ];

  // Relancer l'expert avec le contexte mis à jour
  return consulterExpertFiscal({
    donneesClient: donneesMAJ,
    histoireConversation: histoireMAJ,
    lang,
  });
}

// ─────────────────────────────────────────────────────────────────────
// 7. DÉTECTION CANTON PAR COMMUNE
// ─────────────────────────────────────────────────────────────────────

const COMMUNES_JU = ["Bure","Porrentruy","Delémont","Courgenay","Alle","Boncourt",
  "Saignelégier","Fontenais","Basse-Allaine","Cornol","Fahy","Grandfontaine",
  "Haute-Ajoie","Vendlincourt","Le Noirmont","Clos du Doubs","Courtételle",
  "Val Terbi","Rossemaison","Boécourt","Muriaux","Les Breuleux","Moutier"];

const COMMUNES_NE = ["Neuchâtel","La Chaux-de-Fonds","Le Locle","Boudry","Cernier",
  "Fleurier","Val-de-Ruz","Val-de-Travers","Dombresson","Cortaillod","Bevaix",
  "Peseux","Corcelles","Colombier","Le Landeron","Marin","Thielle"];

const COMMUNES_BE = ["Berne","Biel/Bienne","Thun","Köniz","Langenthal","Burgdorf",
  "Ostermundigen","Worb","Münsingen","Steffisburg","Ittigen","Lyss"];

function detecterCanton(commune) {
  const c = commune.toLowerCase();
  if (COMMUNES_JU.some(x => x.toLowerCase() === c)) return "JU";
  if (COMMUNES_NE.some(x => x.toLowerCase() === c)) return "NE";
  if (COMMUNES_BE.some(x => x.toLowerCase() === c)) return "BE";
  return "JU"; // défaut
}

// ─────────────────────────────────────────────────────────────────────
// 8. FALLBACK — Si API indisponible, raisonnement 100% local
// ─────────────────────────────────────────────────────────────────────

function fallbackExpert(donneesClient, analyse, lang) {
  const { obligatoires, recommandes } = analyse;

  const age = donneesClient.naissance
    ? 2025 - parseInt((donneesClient.naissance || "").split(/[-/]/)[0])
    : null;
  const estRetraite = (donneesClient.revenus_avs || 0) > 0
    && !(donneesClient.revenus_salaire > 0);

  // Construire le message prioritaire
  let message_client = "";
  const doc_prioritaire = obligatoires[0];

  if (doc_prioritaire) {
    message_client = `Bonjour ! Pour compléter votre déclaration, j'ai besoin d'un document important : **${doc_prioritaire.document}**. ${doc_prioritaire.instruction || ""}`;
  } else if (recommandes.length > 0) {
    message_client = `Vos documents principaux sont en ordre. Voyons si nous pouvons encore optimiser votre situation.`;
  } else {
    message_client = `Tous vos documents sont complets. Je peux calculer votre impôt.`;
  }

  // Questions selon profil
  const questions = [];
  let p = 1;

  if (!estRetraite && age && age < 65 && !(donneesClient.pilier3a > 0)) {
    questions.push({
      id: "q_3a", type: "oui_non",
      question: "Avez-vous versé dans un pilier 3a en 2025 ?",
      explication: `Déductible jusqu'à CHF 7'258 — économie fiscale directe`,
      champ_store: "pilier3a_verse",
      impact_estime_chf: "CHF 1'000–2'500",
      priorite: p++,
    });
  }

  if (!donneesClient.frais_maladie && !donneesClient._frais_maladie_demande) {
    questions.push({
      id: "q_frais_med", type: "montant",
      question: age && age > 65
        ? "Avez-vous eu des frais de médecin ou dentiste non remboursés en 2025 ?"
        : "Avez-vous eu des frais médicaux importants non remboursés en 2025 ?",
      explication: "Déductibles au-delà de 5% de votre revenu net",
      champ_store: "frais_maladie",
      impact_estime_chf: "Variable",
      priorite: p++,
    });
  }

  if (!donneesClient.dons) {
    questions.push({
      id: "q_dons", type: "oui_non",
      question: "Avez-vous fait des dons à des associations en 2025 ?",
      explication: "Dons > CHF 100 à des organisations d'utilité publique — déductibles",
      champ_store: "dons_verse",
      impact_estime_chf: "Variable",
      priorite: p++,
    });
  }

  return {
    message_client,
    raisonnement_interne: "Fallback local — API Claude indisponible",
    documents_requis: obligatoires.map(d => ({
      id:                d.id,
      document:          d.document,
      instruction_precise: d.instruction,
      champ_store:       d.champ,
      bloquant:          d.bloquant,
    })),
    questions: questions.slice(0, 3),
    optimisations_detectees: [],
    calcul_possible:   analyse.calcul_possible,
    raison_blocage:    obligatoires.length > 0
      ? `Document manquant : ${obligatoires[0].document}`
      : null,
    _fallback:         true,
    _analyse_locale:   analyse,
  };
}
