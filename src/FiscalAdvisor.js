// ═══════════════════════════════════════════════════════════════════════
//  tAIx — FiscalAdvisor v3
//  Claude génère les questions LUI-MÊME selon le profil réel de la personne
//  Pas de logique codée en dur. Pas de cas prévus à l'avance.
//  Fonctionne pour tout profil, tout canton, toute situation de vie.
//  Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════════════

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

// ── Prompt conseiller fiscal IA ──────────────────────────────────────
function buildPrompt(donneesOCR, lang) {
  const langLabel = { fr:"français", de:"allemand", it:"italien", pt:"portugais", es:"espagnol", en:"anglais" }[lang] || "français";

  return `Tu es un conseiller fiscal suisse expert, bienveillant et précis.
Tu viens d'analyser les documents d'un contribuable suisse. Voici les données extraites :

${JSON.stringify(donneesOCR, null, 2)}

En te basant UNIQUEMENT sur ces données réelles (pas de suppositions génériques) :

1. IDENTIFIE le profil exact de cette personne :
   - Âge et situation de vie (retraité, salarié, indépendant, étudiant, au chômage, famille...)
   - Canton et commune si détectés
   - Ce que tu sais déjà grâce aux documents
   - Ce qui MANQUE encore pour optimiser sa déclaration

2. GÉNÈRE des questions PERTINENTES pour CETTE personne spécifique.
   - Un retraité de 80 ans ne reçoit JAMAIS de questions sur le trajet domicile-travail, le télétravail, ou le pilier 3a actif
   - Un salarié sans enfants ne reçoit pas de question sur les frais de garde
   - Un propriétaire reçoit des questions sur l'entretien de son bien
   - Adapte le ton à l'âge (langage simple pour les seniors)
   - Maximum 6 questions, priorisées par impact fiscal

3. DÉTECTE les optimisations fiscales spécifiques à cette personne
   - Déductions manquantes probables selon son profil
   - Alertes si quelque chose semble anormal

Réponds en JSON strict :
{
  "resume_profil": "Description courte ex: Retraité, 87 ans, Jura, marié",
  "type_profil": "retraite|salarie|independant|etudiant|chomage|famille|mixte",
  "ce_que_je_sais": ["revenu AVS CHF 32'400", "propriétaire à Bure", "..."],
  "questions": [
    {
      "id": "q1",
      "type": "oui_non|montant|nombre|choix",
      "question": "Question claire et adaptée à l'âge/situation",
      "explication": "Pourquoi cette question est importante pour lui",
      "impact_estime": "CHF XXX – YYY",
      "options": ["option1","option2"],
      "deduction_cible": "nom_champ_store",
      "priorite": 1
    }
  ],
  "alertes": [
    {
      "type": "opportunite|anomalie|attention",
      "message": "Message concret et actionnable"
    }
  ],
  "optimisations_detectees": ["Déduction frais médicaux probablement sous-déclarée", "..."]
}

Réponds en ${langLabel}. JSON uniquement, aucun texte avant ou après.`;
}

// ── Appel principal ──────────────────────────────────────────────────
export async function genererQuestionsIA(donneesOCR, storeData, lang = "fr") {
  // Fusionne données OCR + données déjà dans le store
  const toutesLesDonnees = { ...storeData, ...donneesOCR };

  // Nettoie les champs vides pour ne pas polluer le prompt
  const donneesPropres = Object.fromEntries(
    Object.entries(toutesLesDonnees)
      .filter(([, v]) => v !== null && v !== "" && v !== 0 && v !== undefined)
  );

  if (!ANTHROPIC_API_KEY) {
    console.warn("Pas de clé API — questions génériques");
    return getQuestionsSecours(donneesPropres, lang);
  }

  try {
    const res = await fetch("/api/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        messages: [{ role: "user", content: buildPrompt(donneesPropres, lang) }],
      }),
    });

    if (!res.ok) throw new Error(await res.text());

    const data   = await res.json();
    const text   = data.content?.[0]?.text || "{}";
    const clean  = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(clean);

    // Validation minimale
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Réponse invalide — pas de questions");
    }

    return parsed;

  } catch (err) {
    console.error("FiscalAdvisor error:", err);
    return getQuestionsSecours(donneesPropres, lang);
  }
}

// ── Secours si API indisponible ──────────────────────────────────────
// Logique minimale basée sur les données — Claude n'est pas disponible
function getQuestionsSecours(data, lang) {
  const age = data.naissance
    ? new Date().getFullYear() - parseInt((data.naissance || "").split(/[-/]/)[0])
    : null;
  const estRetraite = age >= 64
    || (data.revenus_avs || data.rev_avs || 0) > 0
    || ((data.revenus_lpp || data.rev_lpp_rente || 0) > 0 && !(data.revenus_salaire || data.rev_salaire || 0));

  const fr = {
    subside: "Bénéficiez-vous de subsides pour votre caisse maladie (LAMal) ?",
    subside_exp: "Beaucoup de personnes éligibles ne demandent pas leurs subsides. Jusqu'à CHF 2'700/an.",
    med: "Avez-vous eu des frais médicaux importants non remboursés en 2025 ?",
    med_exp: "Médecin, dentiste, médicaments, lunettes. Déductibles au-delà de 5% du revenu.",
    dons: "Avez-vous fait des dons à des associations ou fondations en 2025 ?",
    dons_exp: "Dons > CHF 100 à des organisations reconnues d'utilité publique.",
    transport: "Quel est votre trajet domicile-travail en km (aller-retour) ?",
    transport_exp: "Frais de transport déductibles selon barème cantonal.",
    teletravail: "Avez-vous travaillé depuis chez vous en 2025 ?",
    teletravail_exp: "Forfait télétravail déductible depuis 2022.",
    "3a": "Avez-vous versé dans un pilier 3a en 2025 ?",
    "3a_exp": "Déductible jusqu'à CHF 7'258. Impact fiscal direct.",
  };

  const questions = [];
  let p = 1;

  questions.push({ id:"q_sub", type:"oui_non", question:fr.subside, explication:fr.subside_exp, impact_estime:"jusqu'à CHF 2'700/an", deduction_cible:"beneficie_subside", priorite:p++ });

  if (estRetraite || (age && age >= 55)) {
    questions.push({ id:"q_med", type:"montant", question:fr.med, explication:fr.med_exp, impact_estime:"variable", deduction_cible:"frais_medicaux", priorite:p++ });
  }

  questions.push({ id:"q_dons", type:"oui_non", question:fr.dons, explication:fr.dons_exp, impact_estime:"variable", deduction_si_oui:"dons_montant", priorite:p++ });

  if (!estRetraite) {
    if (!(data.pilier_3a > 0)) questions.push({ id:"q_3a", type:"oui_non", question:fr["3a"], explication:fr["3a_exp"], impact_estime:"jusqu'à CHF 1'100", deduction_si_oui:"pilier_3a_montant", priorite:p++ });
    questions.push({ id:"q_transport", type:"nombre", question:fr.transport, explication:fr.transport_exp, impact_estime:"CHF 300–1'500", deduction_cible:"km_trajet", priorite:p++ });
    questions.push({ id:"q_teletravail", type:"choix", question:fr.teletravail, explication:fr.teletravail_exp, options:["Non","1 jour/semaine","2 jours/semaine","3 jours/semaine","Plus de 3 jours"], impact_estime:"CHF 200–800", deduction_cible:"jours_teletravail", priorite:p++ });
  }

  return {
    resume_profil: estRetraite ? `Retraité(e)${age ? ` · ${age} ans` : ""}` : "Contribuable",
    type_profil: estRetraite ? "retraite" : "salarie",
    ce_que_je_sais: [],
    questions: questions.slice(0, 6),
    alertes: [],
    optimisations_detectees: [],
    _fallback: true,
  };
}

// ── Applique la réponse d'une question au store ──────────────────────
export function appliquerReponseQuestion(question, reponse, setField) {
  if (reponse === null || reponse === undefined || reponse === "") return null;
  const { type, deduction_si_oui, deduction_cible } = question;

  if (type === "oui_non") {
    if (reponse === true || reponse === "oui") {
      return { need_amount: true, field: deduction_si_oui };
    }
  } else if (type === "montant" && deduction_cible) {
    const amount = parseFloat(String(reponse).replace(/[' ]/g, ""));
    if (!isNaN(amount) && amount > 0) setField(deduction_cible, amount);
  } else if (type === "nombre" && deduction_cible) {
    setField(deduction_cible, parseInt(reponse) || 0);
  } else if (type === "choix" && deduction_cible) {
    setField(deduction_cible, reponse);
  }
  return null;
}
