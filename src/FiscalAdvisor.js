// ═══════════════════════════════════════════════════════════════════════
//  tAIx — FiscalAdvisor.js
//  Cerveau IA de raisonnement fiscal en temps réel
//
//  Après l'OCR, analyse TOUS les documents ensemble et génère :
//  1. Détection des anomalies / changements vs année précédente
//  2. Questions ciblées selon le profil détecté
//  3. Déductions oubliées selon la situation
//  4. Alertes fiscales personnalisées
//
//  Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════════════

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

// ── Types de questions possibles ──────────────────────────────────────
// type: "oui_non" | "montant" | "choix" | "info"
// L'UI adapte le widget d'entrée automatiquement

// ── Prompt principal du conseiller fiscal IA ──────────────────────────
function buildAdvisorPrompt(ocrResults, storeData, lang = "fr") {

  const profil = detecterProfil(storeData);
  const changementsAnnee = detecterChangements(ocrResults, storeData);

  const langInstructions = {
    fr: "Réponds UNIQUEMENT en français.",
    de: "Antworte NUR auf Deutsch.",
    it: "Rispondi SOLO in italiano.",
    pt: "Responde APENAS em português.",
    es: "Responde SÓLO en español.",
    en: "Reply ONLY in English.",
    uk: "Відповідай ТІЛЬКИ українською.",
  };

  return `Tu es un expert fiscal suisse senior spécialisé dans le canton du Jura.
${langInstructions[lang] || langInstructions.fr}

## SITUATION DU CONTRIBUABLE
${JSON.stringify(storeData, null, 2)}

## DOCUMENTS OCR ANALYSÉS
${JSON.stringify(ocrResults, null, 2)}

## PROFIL DÉTECTÉ
${JSON.stringify(profil, null, 2)}

## CHANGEMENTS DÉTECTÉS VS ANNÉE PRÉCÉDENTE
${JSON.stringify(changementsAnnee, null, 2)}

## TA MISSION
Analyse TOUS ces éléments ensemble comme un expert fiscal ferait lors d'un entretien client.
Tu dois générer une liste de questions intelligentes et d'alertes personnalisées.

RÈGLES :
- Maximum 8 questions (prioriser les plus importantes fiscalement)
- Ne pose pas de questions dont tu connais déjà la réponse via les documents
- Priorise les questions qui peuvent réduire l'impôt
- Adapte le langage au profil (étudiant, retraité, famille, etc.)
- Si tu détectes quelque chose d'anormal, crée une alerte (pas une question)
- Chaque question doit avoir un IMPACT FISCAL estimé

Réponds en JSON strict, aucun autre texte :
{
  "questions": [
    {
      "id": "q1",
      "type": "oui_non",
      "question": "Avez-vous effectué un rachat dans votre caisse de pension en 2025 ?",
      "explication": "Un rachat LPP est déductible à 100% du revenu imposable.",
      "impact_estime": "jusqu'à CHF 2'000 d'économie",
      "deduction_si_oui": "rachat_lpp",
      "priorite": 1
    },
    {
      "id": "q2",
      "type": "montant",
      "question": "Quel montant avez-vous versé sur votre pilier 3a en 2025 ?",
      "explication": "Le maximum déductible est CHF 7'056 pour un salarié.",
      "impact_estime": "jusqu'à CHF 1'100 d'économie",
      "deduction_cible": "pilier_3a",
      "max_valeur": 7056,
      "priorite": 1
    },
    {
      "id": "q3",
      "type": "choix",
      "question": "Votre situation professionnelle en 2025 ?",
      "explication": "Certains frais ne sont déductibles que dans certains cas.",
      "impact_estime": "variable",
      "options": ["Salarié à temps plein","Salarié à temps partiel","Indépendant","Chômage","Retraité"],
      "deduction_cible": "activite",
      "priorite": 2
    }
  ],
  "alertes": [
    {
      "id": "a1",
      "type": "changement",
      "titre": "Nouveau compte bancaire détecté",
      "message": "Un compte Raiffeisen (CHF 45'200) apparaît dans vos documents mais n'était pas dans votre déclaration précédente. Est-ce un compte existant non déclaré ou un nouveau compte ouvert en 2025 ?",
      "action": "Vérifiez que tous vos comptes bancaires au 31.12.2025 sont bien inclus.",
      "severite": "warning"
    }
  ],
  "resume_profil": "Salarié avec famille, propriétaire immobilier, potentiel d'optimisation LPP identifié.",
  "economie_potentielle_totale": "CHF 1'500 – 3'200"
}`;
}

// ── Détection automatique du profil ──────────────────────────────────
function detecterProfil(data) {
  const profil = {
    type: "salarie",
    situation_familiale: "seul",
    nb_enfants: 0,
    proprietaire: false,
    a_3a: false,
    a_lpp: false,
    a_hypotheque: false,
    a_fortune_importante: false,
    jeune_contribuable: false,
    nouveau_contribuable: false,
    age: null,
    activites: [],
  };

  if (data.etat_civil === "marie" || data.etat_civil === "partenariat") {
    profil.situation_familiale = "marie";
  } else if (data.etat_civil === "divorce") {
    profil.situation_familiale = "divorce";
  } else if (data.etat_civil === "veuf") {
    profil.situation_familiale = "veuf";
  }

  profil.nb_enfants = parseInt(data.enfants || data.nb_enfants || 0);
  profil.a_3a        = (data.pilier_3a || 0) > 0;
  profil.a_lpp       = (data.cotisations_lpp || data.rachat_lpp || 0) > 0;
  profil.a_hypotheque = (data.interets_hypothecaires || 0) > 0;
  profil.proprietaire = (data.for_immobilier || 0) > 0;
  profil.a_fortune_importante = (data.solde_bancaire || 0) > 200000;

  // Détection âge depuis date de naissance
  if (data.naissance) {
    try {
      const anneeNaissance = parseInt((data.naissance || "").split(/[-/]/)[0]);
      if (anneeNaissance > 1900 && anneeNaissance < 2010) {
        profil.age = new Date().getFullYear() - anneeNaissance;
        if (profil.age < 27) profil.jeune_contribuable = true;
        if (profil.age >= 64) profil.type = "retraite";
      }
    } catch {}
  }

  // Détection retraité par revenus (même sans date de naissance)
  // Si rente AVS ou LPP présente et pas de salaire → retraité
  const hasRente = (data.rev_avs || 0) > 0 || (data.rev_lpp_rente || 0) > 0;
  const hasSalaire = (data.rev_salaire || 0) > 0;
  if (hasRente && !hasSalaire) profil.type = "retraite";

  // Surcharge explicite
  if ((data.activites || []).includes("independant")) profil.type = "independant";
  if ((data.activites || []).includes("chomage"))     profil.type = "chomage";
  if ((data.activites || []).includes("etudiant"))    profil.type = "etudiant";
  if ((data.activites || []).includes("retraite"))    profil.type = "retraite";

  profil.activites = data.activites || [];
  return profil;
}

// ── Détection des changements vs année précédente ─────────────────────
function detecterChangements(ocrResults, storeData) {
  const changements = [];
  const diPrev = ocrResults.di_prev || {};  // données DI précédente
  const comptesActuels = [];

  // Collecter tous les comptes détectés cette année
  for (const [key, result] of Object.entries(ocrResults)) {
    if (result.banque && result.solde_31dec) {
      comptesActuels.push({
        banque: result.banque,
        solde: result.solde_31dec,
        iban: result.iban || "",
        type: result.type_compte || "inconnu",
      });
    }
  }

  // Comparer avec l'année précédente si disponible
  if (diPrev.solde_bancaire_total && comptesActuels.length > 0) {
    const totalActuel = comptesActuels.reduce((s, c) => s + c.solde, 0);
    const diff = totalActuel - (diPrev.solde_bancaire_total || 0);

    if (Math.abs(diff) > 10000) {
      changements.push({
        type: "fortune_variation",
        label: diff > 0 ? "Fortune bancaire augmentée" : "Fortune bancaire diminuée",
        detail: `Variation de CHF ${Math.abs(diff).toLocaleString("fr-CH")} vs année précédente`,
        action_requise: Math.abs(diff) > 50000,
      });
    }
  }

  // Détecter variations de salaire importantes
  if (diPrev.rev_salaire && storeData.rev_salaire) {
    const varSal = ((storeData.rev_salaire - diPrev.rev_salaire) / diPrev.rev_salaire) * 100;
    if (Math.abs(varSal) > 15) {
      changements.push({
        type: "salaire_variation",
        label: varSal > 0 ? "Salaire significativement augmenté" : "Baisse de salaire significative",
        detail: `${Math.round(Math.abs(varSal))}% de variation vs ${new Date().getFullYear() - 1}`,
        action_requise: false,
      });
    }
  }

  // Détecter changement de situation familiale
  if (diPrev.etat_civil && storeData.etat_civil && diPrev.etat_civil !== storeData.etat_civil) {
    changements.push({
      type: "situation_familiale",
      label: "Changement de situation familiale",
      detail: `${diPrev.etat_civil} → ${storeData.etat_civil}`,
      action_requise: true,
    });
  }

  // Détecter comptes détectés dans les documents mais pas dans la DI précédente
  for (const compte of comptesActuels) {
    changements.push({
      type: "compte_bancaire",
      label: `Compte ${compte.banque} — CHF ${compte.solde.toLocaleString("fr-CH")}`,
      detail: "Vérifier que ce compte était déclaré l'année précédente",
      banque: compte.banque,
      solde: compte.solde,
      action_requise: true,
    });
  }

  return changements;
}

// ── Appel principal — génère les questions IA ─────────────────────────
export async function genererQuestionsIA(ocrResults, storeData, lang = "fr") {
  if (!ANTHROPIC_API_KEY) {
    console.warn("FiscalAdvisor: clé Anthropic manquante");
    return getFallbackQuestions(storeData, lang);
  }

  const prompt = buildAdvisorPrompt(ocrResults, storeData, lang);

  try {
    const res = await fetch("/api/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system: "Tu es un expert fiscal suisse. Réponds toujours en JSON valide uniquement.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    const text = data.content?.[0]?.text || "{}";
    const clean = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(clean);

  } catch (err) {
    console.error("FiscalAdvisor error:", err);
    return getFallbackQuestions(storeData, lang);
  }
}

// ── Questions de secours si pas d'API ────────────────────────────────
function getFallbackQuestions(data, lang = "fr") {
  const profil = detecterProfil(data);
  const questions = [];
  let prio = 1;
  const estRetraite = profil.type === "retraite";

  const T = {
    fr: {
      q3a:        "Avez-vous versé sur un pilier 3a en 2025 ?",
      q3a_exp:    "Déductible jusqu'à CHF 7'058. Impact fiscal direct.",
      qlpp:       "Avez-vous effectué un rachat dans votre caisse de pension ?",
      qlpp_exp:   "100% déductible du revenu imposable.",
      qgarde:     "Avez-vous des frais de garde d'enfants ?",
      qgarde_exp: "Déductibles jusqu'à CHF 10'100 par enfant.",
      qetudiant:  "Avez-vous des frais de formation ou de perfectionnement ?",
      qetudiant_exp: "Déductibles jusqu'à CHF 12'000.",
      qtransport: "Quel est votre trajet domicile-travail (km aller-retour) ?",
      qtransport_exp: "Frais de transport déductibles selon barème.",
      qtelework:  "Avez-vous travaillé à domicile en 2025 ? (jours/semaine)",
      qtelework_exp: "Forfait télétravail déductible depuis 2022.",
      qdon:       "Avez-vous fait des dons à des associations en 2025 ?",
      qdon_exp:   "Dons > CHF 100 déductibles (associations reconnues).",
      qmed:       "Avez-vous eu des frais médicaux importants en 2025 ?",
      qmed_exp:   "Déductibles au-delà de 5% du revenu net. Factures médecin, dentiste, médicaments non remboursés.",
      qsubside:   "Bénéficiez-vous déjà de subsides LAMal (réduction de prime) ?",
      qsubside_exp: "Les retraités sont souvent éligibles. Jusqu'à CHF 2'700/an.",
    },
    de: {
      q3a:        "Haben Sie 2025 in die Säule 3a einbezahlt?",
      q3a_exp:    "Abzugsfähig bis CHF 7'058.",
      qlpp:       "Haben Sie einen Einkauf in Ihre Pensionskasse getätigt?",
      qlpp_exp:   "100% vom steuerbaren Einkommen abzugsfähig.",
      qgarde:     "Haben Sie Kinderbetreuungskosten?",
      qgarde_exp: "Bis CHF 10'100 pro Kind abzugsfähig.",
      qetudiant:  "Haben Sie Aus- oder Weiterbildungskosten?",
      qetudiant_exp: "Bis CHF 12'000 abzugsfähig.",
      qtransport: "Wie lang ist Ihr Arbeitsweg? (km Hin- und Rückfahrt)",
      qtransport_exp: "Fahrtkosten nach Tarif abzugsfähig.",
      qtelework:  "Haben Sie 2025 im Homeoffice gearbeitet?",
      qtelework_exp: "Homeoffice-Pauschale seit 2022 abzugsfähig.",
      qdon:       "Haben Sie 2025 Spenden geleistet?",
      qdon_exp:   "Spenden > CHF 100 an anerkannte Organisationen abzugsfähig.",
      qmed:       "Hatten Sie 2025 hohe Krankheitskosten?",
      qmed_exp:   "Abzugsfähig über 5% des Nettoeinkommens.",
      qsubside:   "Erhalten Sie bereits Prämienverbilligung?",
      qsubside_exp: "Viele Rentner sind berechtigt. Bis CHF 2'700/Jahr.",
    },
  };
  const t = T[lang] || T.fr;

  // ── SUBSIDE LAMal — toujours (retraités très éligibles) ──────────
  questions.push({
    id: "q_subside", type: "oui_non",
    question: t.qsubside,
    explication: t.qsubside_exp,
    impact_estime: "jusqu'à CHF 2'700/an",
    deduction_cible: "beneficie_subside",
    priorite: prio++
  });

  // ── FRAIS MÉDICAUX — retraités en priorité ───────────────────────
  if (estRetraite || (profil.age && profil.age >= 55)) {
    if (!data.frais_medicaux || data.frais_medicaux === 0) {
      questions.push({
        id: "q_med", type: "montant",
        question: t.qmed,
        explication: t.qmed_exp,
        impact_estime: "variable selon revenu",
        deduction_cible: "frais_medicaux",
        priorite: prio++
      });
    }
  }

  // ── DONS ─────────────────────────────────────────────────────────
  if (!data.dons || data.dons === 0) {
    questions.push({
      id: "q_dons", type: "oui_non",
      question: t.qdon,
      explication: t.qdon_exp,
      impact_estime: "variable",
      deduction_si_oui: "dons_montant",
      priorite: prio++
    });
  }

  // ── QUESTIONS SPÉCIFIQUES ACTIFS (PAS pour retraités) ────────────
  if (!estRetraite) {
    // 3a — uniquement actifs (retraités ne peuvent plus cotiser après l'âge de la retraite)
    if (!data.pilier_3a || data.pilier_3a === 0) {
      questions.push({
        id: "q_3a", type: "oui_non",
        question: t.q3a, explication: t.q3a_exp,
        impact_estime: "jusqu'à CHF 1'100",
        deduction_si_oui: "pilier_3a_montant",
        priorite: prio++
      });
    }

    // Rachat LPP — uniquement actifs
    if (!data.rachat_lpp || data.rachat_lpp === 0) {
      questions.push({
        id: "q_lpp", type: "oui_non",
        question: t.qlpp, explication: t.qlpp_exp,
        impact_estime: "jusqu'à CHF 2'500",
        deduction_si_oui: "rachat_lpp_montant",
        priorite: prio++
      });
    }

    // Trajet domicile-travail — uniquement actifs
    questions.push({
      id: "q_transport", type: "nombre",
      question: t.qtransport, explication: t.qtransport_exp,
      impact_estime: "CHF 300 – 1'500",
      deduction_cible: "km_trajet",
      priorite: prio++
    });

    // Télétravail — uniquement actifs
    questions.push({
      id: "q_telework", type: "choix",
      question: t.qtelework, explication: t.qtelework_exp,
      options: ["Non","1 jour/semaine","2 jours/semaine","3 jours/semaine","Plus de 3 jours"],
      impact_estime: "CHF 200 – 800",
      deduction_cible: "jours_teletravail",
      priorite: prio++
    });
  }

  // ── ENFANTS → frais de garde (pas pour retraités) ────────────────
  if (!estRetraite && profil.nb_enfants > 0 && (!data.frais_garde || data.frais_garde === 0)) {
    questions.push({
      id: "q_garde", type: "montant",
      question: t.qgarde, explication: t.qgarde_exp,
      impact_estime: "jusqu'à CHF 1'500",
      deduction_cible: "frais_garde", max_valeur: 10100,
      priorite: prio++
    });
  }

  // ── ÉTUDIANT → frais formation ───────────────────────────────────
  if (profil.jeune_contribuable || profil.type === "etudiant") {
    questions.push({
      id: "q_formation", type: "montant",
      question: t.qetudiant, explication: t.qetudiant_exp,
      impact_estime: "jusqu'à CHF 1'800",
      deduction_cible: "frais_formation", max_valeur: 12000,
      priorite: prio++
    });
  }

  const resumeProfil = estRetraite
    ? (profil.age ? `Retraité${profil.situation_familiale==="veuf"?" (veuf/ve)":""}${profil.age ? ` · ${profil.age} ans` : ""}` : "Retraité(e)")
    : profil.nb_enfants > 0 ? `Famille avec ${profil.nb_enfants} enfant(s)`
    : profil.type === "etudiant" ? "Étudiant(e)"
    : profil.type === "chomage" ? "En recherche d'emploi"
    : "Salarié(e)";

  return {
    questions: questions.slice(0, 8),
    alertes: [],
    resume_profil: resumeProfil,
    type_profil: profil.type,
  };
}

// ── Applique la réponse d'une question au store ───────────────────────
export function appliquerReponseQuestion(question, reponse, setField) {
  if (reponse === null || reponse === undefined || reponse === "") return;

  const { type, deduction_si_oui, deduction_cible } = question;

  if (type === "oui_non") {
    if (reponse === true || reponse === "oui") {
      // Ouvre une sous-question pour le montant
      return { need_amount: true, field: deduction_si_oui };
    }
  } else if (type === "montant" && deduction_cible) {
    const amount = parseFloat(String(reponse).replace(/[' ]/g, ""));
    if (!isNaN(amount) && amount > 0) {
      setField(deduction_cible, amount);
    }
  } else if (type === "nombre" && deduction_cible) {
    setField(deduction_cible, parseInt(reponse) || 0);
  } else if (type === "choix" && deduction_cible) {
    setField(deduction_cible, reponse);
  }

  return null;
}
