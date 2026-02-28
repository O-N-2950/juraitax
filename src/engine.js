// ═══════════════════════════════════════════════
//  MOTEUR FISCAL JURA 2025
//  Calcul automatique impôts + optimisations
// ═══════════════════════════════════════════════

import { BAREMES, MULTIPLICATEURS } from "./config";

// ── Impôt cantonal barème I (personnes seules) ──
function impotCantI(revenu) {
  if (revenu <= 0) return 0;
  const tranches = [
    [14300, 0], [3900, 0.03], [3900, 0.05], [3900, 0.07],
    [7700, 0.09], [7800, 0.11], [11700, 0.12], [11700, 0.13],
    [19600, 0.14], [39000, 0.15], [Infinity, 0.16],
  ];
  let impot = 0, base = 0;
  for (const [limite, taux] of tranches) {
    if (revenu <= base) break;
    const tranche = Math.min(revenu - base, limite);
    impot += tranche * taux;
    base += limite;
  }
  return Math.round(impot);
}

// ── Impôt cantonal barème II (mariés) ──
function impotCantII(revenu) {
  if (revenu <= 0) return 0;
  const tranches = [
    [28500, 0], [5700, 0.03], [5700, 0.05], [5700, 0.07],
    [11500, 0.09], [11500, 0.11], [17300, 0.12], [17300, 0.13],
    [28900, 0.14], [57800, 0.15], [Infinity, 0.155],
  ];
  let impot = 0, base = 0;
  for (const [limite, taux] of tranches) {
    if (revenu <= base) break;
    const tranche = Math.min(revenu - base, limite);
    impot += tranche * taux;
    base += limite;
  }
  return Math.round(impot);
}

// ── IFD fédéral ──
function impotFederal(revenu, marie) {
  if (revenu <= 0) return 0;
  const tranchesSeul = [
    [17800, 0], [24400, 0.0077], [9100, 0.0088], [13200, 0.022],
    [17800, 0.033], [13600, 0.044], [16100, 0.066], [11100, 0.088],
    [14800, 0.11], [895400, 0.132], [Infinity, 0.132],
  ];
  const tranchesMarie = [
    [28300, 0], [25700, 0.01], [20700, 0.02], [34700, 0.03],
    [52500, 0.04], [103900, 0.05], [Infinity, 0.132],
  ];
  const tranches = marie ? tranchesMarie : tranchesSeul;
  let impot = 0, base = 0;
  for (const [limite, taux] of tranches) {
    if (revenu <= base) break;
    const tranche = Math.min(revenu - base, limite);
    impot += tranche * taux;
    base += limite;
  }
  return Math.round(impot);
}

// ── Impôt fortune ──
function impotFortune(fortune) {
  if (fortune <= 0) return 0;
  const tranches = [
    [100000, 0.004], [100000, 0.005], [100000, 0.006],
    [Infinity, 0.0065],
  ];
  let impot = 0, base = 0;
  for (const [limite, taux] of tranches) {
    if (fortune <= base) break;
    const tranche = Math.min(fortune - base, limite);
    impot += tranche * taux;
    base += limite;
  }
  return Math.round(impot);
}

// ═══════════════════════════════════════════════
//  CALCUL PRINCIPAL
// ═══════════════════════════════════════════════
export function calculerDeclaration(data) {
  const marie = ["marie","veuf"].includes(data.etat_civil);
  const enfants = data.enfants || 0;
  const commune = data.commune || "default";
  const mult = MULTIPLICATEURS[commune] || MULTIPLICATEURS.default;
  const isIndep = (data.activites||[]).includes("independant");

  // ── REVENUS ──
  const revSalaire     = data.revenus_salaire       || 0;
  const revIndep       = data.revenus_independant   || 0;
  const revAVS         = data.revenus_avs           || 0;
  const revLPP         = data.revenus_lpp           || 0;
  const revChomage     = data.revenus_chomage       || 0;
  const revTitres      = data.revenus_titres        || 0;
  const revLoyers      = data.revenus_loyers        || 0;
  const pensionRecue   = data.pension_recue         || 0;

  const revenuBrut = revSalaire + revIndep + revAVS + revLPP +
                     revChomage + revTitres + revLoyers + pensionRecue;

  // ── DÉDUCTIONS OBJECTIFS ──
  // Frais professionnels (forfait simplifié)
  let fraisPro = 0;
  if (revSalaire > 0) {
    const km = Math.min(data.frais_km || 0, BAREMES.km_max);
    const repas = data.repas_travail ? BAREMES.repas_forfait : 0;
    const autresFrais = data.autres_frais_pro || 0;
    fraisPro = km + repas + autresFrais;
    if (fraisPro === 0) fraisPro = Math.min(revSalaire * 0.03, 4000); // forfait min
  }

  // Intérêts hypothécaires
  const interetsHyp = data.interets_hypothecaires || 0;

  // Revenus immobiliers — frais d'entretien
  const fraisEntretien = revLoyers > 0 ? Math.min(data.frais_entretien || revLoyers * 0.1, revLoyers) : 0;

  const deductionsObjectifs = fraisPro + interetsHyp + fraisEntretien;

  const revenuNetI = Math.max(0, revenuBrut - deductionsObjectifs);

  // ── DÉDUCTIONS PERSONNELLES ──
  const pilier3a = Math.min(data.pilier3a_montant || 0, isIndep ? BAREMES.pilier3a_independant : BAREMES.pilier3a_salarie);
  const rachatLPP = data.rachat_lpp || 0;

  // Primes maladie (limites)
  const plafondPrimes = marie
    ? BAREMES.primes_assurance_maries + enfants * BAREMES.primes_supplement_enfant
    : BAREMES.primes_assurance_autres + enfants * BAREMES.primes_supplement_enfant;
  const primesDeductibles = Math.min((data.primes_maladie || 0) - (data.subside_montant || 0), plafondPrimes);

  // Frais garde
  const fraisGardeDeductibles = enfants > 0
    ? Math.min(data.frais_garde || 0, enfants * BAREMES.frais_garde_max)
    : 0;

  // Frais maladie (franchise 5% revenu net I)
  const franchiseMaladie = revenuNetI * BAREMES.frais_maladie_franchise_pct;
  const fraisMaladieDeductibles = Math.max(0, (data.frais_maladie || 0) - franchiseMaladie);

  // Dons
  const donsDeductibles = Math.min(data.dons || 0, revenuNetI * BAREMES.dons_max_pct);

  // Pensions versées
  const pensionVersee = data.pension_versee || 0;

  // Déductions sociales
  const deductionCouple = marie ? BAREMES.deduction_couple : 0;
  const deductionEnfants = enfants > 0
    ? (enfants <= 2 ? enfants * BAREMES.deduction_enfant : 2 * BAREMES.deduction_enfant + (enfants - 2) * BAREMES.deduction_enfant_3plus)
    : 0;
  const deductionParentSeul = (!marie && enfants > 0) ? BAREMES.deduction_personne_seule_enfant : 0;

  const deductionsPersonnelles = pilier3a + rachatLPP + primesDeductibles +
    fraisGardeDeductibles + fraisMaladieDeductibles + donsDeductibles +
    pensionVersee + deductionCouple + deductionEnfants + deductionParentSeul;

  const revenuImposable = Math.max(0, revenuNetI - deductionsPersonnelles);
  const revenuArrondi = Math.floor(revenuImposable / 100) * 100;

  // ── FORTUNE ──
  const fortuneBrute = (data.fortune_immobilier || 0) + (data.comptes_bancaires || 0) +
                       (data.titres || 0) + (data.assurance_vie || 0) +
                       (data.autres_fortune || 0);
  const dettesTotales = (data.dette_hypotheque || 0) + (data.dette_leasing || 0) +
                        (data.autres_dettes || 0);
  const fortuneNette = Math.max(0, fortuneBrute - dettesTotales);
  const deductionFortune = marie
    ? BAREMES.deduction_fortune_maries + enfants * BAREMES.deduction_fortune_enfant
    : BAREMES.deduction_fortune_autres + enfants * BAREMES.deduction_fortune_enfant;
  const fortuneImposable = Math.max(0, Math.floor((fortuneNette - deductionFortune) / 1000) * 1000);

  // ── CALCUL IMPÔTS ──
  const impotCantonal = marie ? impotCantII(revenuArrondi) : impotCantI(revenuArrondi);
  const impotCommunal = Math.round(impotCantonal * mult);
  const confession = data.confession;
  const multEglise = confession === "catholique" ? 0.21 : confession === "reforme" ? 0.15 : 0;
  const impotEglise = Math.round(impotCantonal * multEglise);
  const impotFed = impotFederal(revenuArrondi, marie);
  const impotFor = impotFortune(fortuneImposable);

  const impotTotal = impotCantonal + impotCommunal + impotEglise + impotFed + impotFor;

  // ── CALCUL RDU SUBSIDES ──
  const rdu = revenuImposable + fortuneImposable * 0.10;
  const droitSubside = rdu < BAREMES.subsides.adulte_max_rdu && fortuneNette < BAREMES.subsides.fortune_max;
  const subsideEstime = droitSubside
    ? Math.max(15, Math.min(BAREMES.subsides.adulte_montant_max, Math.round((BAREMES.subsides.adulte_max_rdu - rdu) / 1000)))
    : 0;

  // ── OPTIMISATIONS MANQUÉES ──
  const maxP3a = isIndep ? BAREMES.pilier3a_independant : BAREMES.pilier3a_salarie;
  const gapP3a = maxP3a - pilier3a;
  const ecoP3a = Math.round(gapP3a * 0.28);

  const optimisations = [];
  if (gapP3a > 0) {
    optimisations.push({
      id: "pilier3a",
      label: "Pilier 3a non maximisé",
      detail: `Vous pourriez verser CHF ${gapP3a.toLocaleString("fr-CH")} de plus`,
      economie: ecoP3a,
      cta: "winwin",
    });
  }
  if (!data.dons && revenuNetI > 0) {
    optimisations.push({
      id: "dons",
      label: "Dons non déclarés",
      detail: `Jusqu'à CHF ${Math.round(revenuNetI * 0.10).toLocaleString("fr-CH")} déductibles`,
      economie: Math.round(revenuNetI * 0.10 * 0.14),
      cta: null,
    });
  }
  if (droitSubside) {
    optimisations.push({
      id: "subsides",
      label: `Subside LAMal possible`,
      detail: `Jusqu'à CHF ${subsideEstime}/mois selon votre caisse`,
      economie: subsideEstime * 12,
      cta: "winwin",
    });
  }

  return {
    // Revenus
    revenuBrut, revenuNetI, revenuImposable: revenuArrondi,
    // Déductions
    deductionsObjectifs, deductionsPersonnelles,
    // Fortune
    fortuneNette, fortuneImposable,
    // Impôts
    impotCantonal, impotCommunal, impotEglise, impotFed, impotFor, impotTotal,
    // Subsides
    rdu, droitSubside, subsideEstime,
    // Optimisations
    optimisations,
    // Détails déductions
    detail: { pilier3a, rachatLPP, primesDeductibles, fraisGardeDeductibles, fraisMaladieDeductibles, donsDeductibles, fraisPro },
  };
}
