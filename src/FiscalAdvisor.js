// ═══════════════════════════════════════════════════════════════════════
//  tAIx — FiscalAdvisor v3
//  Claude analyse le profil complet et génère les questions adaptées
//  Aucune règle codée en dur — Claude décide lui-même
//  Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════════════

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

// ── Génère les questions via Claude ─────────────────────────────────
export async function genererQuestionsIA(ocrResults, storeData, lang = "fr") {
  const data = { ...storeData, ...(ocrResults?._fusion || {}) };

  const prompt = `Tu es un conseiller fiscal suisse expert.

Voici les données extraites des documents d'un contribuable :
${JSON.stringify(data, null, 2)}

Analyse ce profil et génère une liste de questions UNIQUEMENT pertinentes pour cette personne spécifique.

RÈGLES ABSOLUES :
- Ne pose JAMAIS une question si la réponse est déjà dans les données
- Ne pose JAMAIS trajet/télétravail/3a/rachat LPP à un retraité
- Ne pose JAMAIS retraite/rente à un salarié actif sans rente
- Adapte à l'âge (déduit de naissance si disponible), au canton, à la situation familiale
- Maximum 6 questions, minimum 2
- Chaque question doit avoir un impact fiscal réel et quantifiable
- Langue de réponse : ${lang === "de" ? "allemand" : lang === "it" ? "italien" : lang === "en" ? "anglais" : lang === "pt" ? "portugais" : lang === "es" ? "espagnol" : "français"}

Réponds UNIQUEMENT en JSON strict :
{
  "resume_profil": "Description courte du profil en 1 phrase",
  "type_profil": "retraite|salarie|independant|chomage|etudiant|famille|mixte",
  "questions": [
    {
      "id": "q1",
      "type": "oui_non|montant|nombre|choix",
      "question": "Question claire et directe",
      "explication": "Pourquoi c'est déductible, base légale simplifiée",
      "impact_estime": "CHF XXX – YYY",
      "options": ["option1","option2"],
      "deduction_cible": "nom_champ_store",
      "deduction_si_oui": "nom_champ_store_si_oui_non"
    }
  ],
  "alertes": [
    {
      "type": "opportunite|anomalie|attention",
      "message": "Message court et actionnable"
    }
  ]
}

Pour type=oui_non : utilise deduction_si_oui
Pour type=montant ou nombre : utilise deduction_cible
Pour type=choix : inclus options ET deduction_cible
JSON uniquement, aucun texte avant ou après.`;

  try {
    const res = await fetch("/api/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(await res.text());

    const apiData = await res.json();
    const text    = apiData.content?.[0]?.text || "{}";
    const clean   = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(clean);

  } catch (err) {
    console.error("FiscalAdvisor error:", err);
    return getFallbackQuestions(data, lang);
  }
}

// ── Fallback si API indisponible ──────────────────────────────────────
// Logique minimale basée sur détection simple du profil
function getFallbackQuestions(data, lang = "fr") {
  const annee = new Date().getFullYear();
  const age   = data.naissance
    ? annee - parseInt((data.naissance || "").split(/[-/]/)[0])
    : null;

  const estRetraite = age >= 64
    || (data.rev_avs || 0) > 0
    || (data.rev_lpp_rente || 0) > 0
    || (data.rev_ai || 0) > 0;

  const estSalarie  = (data.rev_salaire || 0) > 0 || (data.rev_salaire_net || 0) > 0;
  const nbEnfants   = parseInt(data.nb_enfants || data.enfants || 0);

  const questions = [];

  // Subsides LAMal — pertinent pour tous
  questions.push({
    id: "q_subside", type: "oui_non",
    question: lang === "de" ? "Erhalten Sie bereits Prämienverbilligung (LAMal)?"
            : lang === "en" ? "Do you already receive LAMal premium subsidies?"
            : "Bénéficiez-vous déjà de subsides LAMal (réduction de prime) ?",
    explication: lang === "de" ? "Viele Berechtigte beantragen keine Verbilligung. Bis CHF 2'700/Jahr."
               : "Beaucoup de personnes éligibles ne demandent pas leurs subsides. Jusqu'à CHF 2'700/an.",
    impact_estime: "jusqu'à CHF 2'700/an",
    deduction_si_oui: "beneficie_subside",
  });

  if (estRetraite) {
    // Frais médicaux — priorité pour retraités
    if (!data.frais_medicaux || data.frais_medicaux === 0) {
      questions.push({
        id: "q_med", type: "montant",
        question: "Avez-vous eu des frais médicaux non remboursés en 2025 ?",
        explication: "Déductibles au-delà de 5% du revenu net. Médecin, dentiste, médicaments, lunettes.",
        impact_estime: "variable selon revenu",
        deduction_cible: "frais_medicaux",
      });
    }
    // Dons
    if (!data.dons || data.dons === 0) {
      questions.push({
        id: "q_dons", type: "oui_non",
        question: "Avez-vous fait des dons à des associations en 2025 ?",
        explication: "Dons > CHF 100 à des organisations reconnues d'utilité publique.",
        impact_estime: "variable",
        deduction_si_oui: "dons_montant",
      });
    }
  }

  if (estSalarie && !estRetraite) {
    // 3a
    if (!data.pilier_3a || data.pilier_3a === 0) {
      questions.push({
        id: "q_3a", type: "oui_non",
        question: "Avez-vous versé sur un pilier 3a en 2025 ?",
        explication: "Déductible jusqu'à CHF 7'056 (salarié) ou CHF 35'280 (indépendant).",
        impact_estime: "jusqu'à CHF 1'100 d'économie",
        deduction_si_oui: "pilier_3a_montant",
      });
    }
    // Trajet
    if (!data.km_trajet || data.km_trajet === 0) {
      questions.push({
        id: "q_transport", type: "nombre",
        question: "Quel est votre trajet domicile-travail aller-retour (km) ?",
        explication: "Frais de transport déductibles selon barème cantonal.",
        impact_estime: "CHF 300 – 1'500",
        deduction_cible: "km_trajet",
      });
    }
    // Télétravail
    questions.push({
      id: "q_teletravail", type: "choix",
      question: "Combien de jours par semaine travaillez-vous à domicile ?",
      explication: "Forfait télétravail déductible depuis 2022.",
      options: ["Non","1 jour/semaine","2 jours/semaine","3 jours/semaine","Plus de 3 jours"],
      impact_estime: "CHF 200 – 800",
      deduction_cible: "jours_teletravail",
    });
    // Enfants
    if (nbEnfants > 0 && (!data.frais_garde || data.frais_garde === 0)) {
      questions.push({
        id: "q_garde", type: "montant",
        question: "Avez-vous des frais de garde d'enfants (crèche, garderie) ?",
        explication: `Déductibles jusqu'à CHF 10'100 par enfant.`,
        impact_estime: "jusqu'à CHF 1'500",
        deduction_cible: "frais_garde",
      });
    }
  }

  const typeLabel = estRetraite ? `Retraité${age ? ` · ${age} ans` : ""}` : estSalarie ? "Salarié(e)" : "Contribuable";

  return {
    resume_profil: typeLabel + (data.commune ? ` · ${data.commune}` : ""),
    type_profil: estRetraite ? "retraite" : "salarie",
    questions: questions.slice(0, 6),
    alertes: [],
    _fallback: true,
  };
}

// ── Applique la réponse d'une question au store ───────────────────────
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
