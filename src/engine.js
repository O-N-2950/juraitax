/**
 * ============================================================
 * tAIx — Moteur Fiscal Jura 2025
 * Reverse-engineered from JuraTax 2025 (model.xml + CF classes)
 * Source: dvbern/JuraTax 2025 v1.0 (Procyon decompiled)
 * ============================================================
 */

// ============================================================
// 1. BARÈMES ICC — IMPÔT SUR LE REVENU
// ============================================================

const BAREME_ICC_REVENU_MARIE = [
  // [revenu_min, impot_base, taux_par_100chf]
  [0,       0,         0       ],
  [12700,   2.50,      2.5080  ],
  [18900,   161.95,    6.4667  ],
  [28200,   766.15,    9.2397  ],
  [48500,   2644.30,   11.7477 ],
  [90600,   7591.95,   13.5974 ],
  [203000,  22878.00,  16.2365 ],
  [437300,  60920.00,  16.4987 ],
];

const BAREME_ICC_REVENU_CELIBATAIRE = [
  [0,       0,         0       ],
  [6900,    4.75,      4.7510  ],
  [14700,   379.55,    8.9747  ],
  [28700,   1638.50,   11.4827 ],
  [50500,   4144.25,   13.9907 ],
  [92600,   10036.15,  15.8403 ],
  [205000,  27840.65,  16.4987 ],
];

// ============================================================
// 2. BARÈMES ICC — IMPÔT SUR LA FORTUNE
// ============================================================

const BAREME_ICC_FORTUNE = [
  // [fortune_min, impot_base, taux_par_1000chf]
  [0,        0,       0      ],
  [58000,    82.65,   1.4250 ],
  [113000,   161.75,  2.1375 ],
  [449000,   880.50,  2.7075 ],
  [842000,   1945.00, 3.1350 ],
  [1684000,  4584.95, 3.4200 ],
];

// ============================================================
// 3. BARÈMES IFD — IMPÔT FÉDÉRAL DIRECT
// ============================================================

const BAREME_IFD_MARIE = [
  // [revenu_max_exclu, taux_%]
  [33000,   0    ],
  [53500,   1    ],
  [61400,   2    ],
  [79200,   3    ],
  [95000,   4    ],
  [108700,  5    ],
  [120600,  6    ],
  [130600,  7    ],
  [138400,  8    ],
  [144300,  9    ],
  [148300,  10   ],
  [150400,  11   ],
  [152400,  12   ],
  [940900,  13   ],
];

const BAREME_IFD_CELIBATAIRE = [
  [18500,   0    ],
  [33300,   0.77 ],
  [43600,   0.88 ],
  [58100,   2.64 ],
  [76200,   2.97 ],
  [82100,   5.94 ],
  [108900,  6.6  ],
  [141600,  8.8  ],
  [185000,  11   ],
  [793400,  13.2 ],
];

// ============================================================
// 4. COMMUNES JURASSIENNES
// noCantonal, noFederal, NPA, commune, quotite, tauxCath, tauxRef, taxeImmo
// ============================================================

const COMMUNES_JU = [
  { id: 301, npa: "2942", nom: "Alle",                    quotite: 2.25, tauxCath: 8.0,  tauxRef: 8.1, taxeImmo: 1.4  },
  { id: 316, npa: "2923", nom: "Basse-Allaine",           quotite: 2.35, tauxCath: 10.5, tauxRef: 8.1, taxeImmo: 1.2  },
  { id: 304, npa: "2926", nom: "Boncourt",                quotite: 1.55, tauxCath: 10.7, tauxRef: 8.1, taxeImmo: 0.8  },
  { id: 308, npa: "2915", nom: "Bure",                    quotite: 2.25, tauxCath: 8.05, tauxRef: 8.1, taxeImmo: 1.0  },
  { id: 334, npa: "2882", nom: "Clos du Doubs",           quotite: 2.15, tauxCath: 9.7,  tauxRef: 8.1, taxeImmo: 1.3  },
  { id: 312, npa: "2952", nom: "Cornol",                  quotite: 2.05, tauxCath: 8.5,  tauxRef: 8.1, taxeImmo: 1.3  },
  { id: 314, npa: "2950", nom: "Courgenay",               quotite: 2.05, tauxCath: 8.0,  tauxRef: 8.1, taxeImmo: 1.4  },
  { id: 110, npa: "2852", nom: "Courtételle",             quotite: 1.65, tauxCath: 7.8,  tauxRef: 8.1, taxeImmo: 1.0  },
  { id: 111, npa: "2800", nom: "Delémont",                quotite: 1.90, tauxCath: 6.4,  tauxRef: 8.1, taxeImmo: 1.5  },
  { id: 319, npa: "2916", nom: "Fahy",                    quotite: 2.30, tauxCath: 11.3, tauxRef: 8.1, taxeImmo: 1.4  },
  { id: 320, npa: "2902", nom: "Fontenais",               quotite: 2.35, tauxCath: 7.2,  tauxRef: 8.1, taxeImmo: 1.35 },
  { id: 322, npa: "2908", nom: "Grandfontaine",           quotite: 2.25, tauxCath: 11.3, tauxRef: 8.1, taxeImmo: 1.5  },
  { id: 310, npa: "2906", nom: "Haute-Ajoie",             quotite: 2.15, tauxCath: 9.5,  tauxRef: 8.1, taxeImmo: 1.2  },
  { id: 101, npa: "2854", nom: "Haute-Sorne",             quotite: 2.10, tauxCath: 7.2,  tauxRef: 8.1, taxeImmo: 1.1  },
  { id: 330, npa: "2900", nom: "Porrentruy",              quotite: 2.05, tauxCath: 7.2,  tauxRef: 8.1, taxeImmo: 1.5  },
  { id: 218, npa: "2350", nom: "Saignelégier",            quotite: 2.30, tauxCath: 8.0,  tauxRef: 8.1, taxeImmo: 1.2  },
  { id: 219, npa: "2364", nom: "St-Brais",                quotite: 2.25, tauxCath: 10.0, tauxRef: 8.1, taxeImmo: 1.2  },
  { id: 128, npa: "2824", nom: "Val Terbi",               quotite: 2.20, tauxCath: 6.5,  tauxRef: 8.1, taxeImmo: 1.2  },
  { id: 336, npa: "2943", nom: "Vendlincourt",            quotite: 2.30, tauxCath: 9.6,  tauxRef: 8.1, taxeImmo: 1.2  },
  { id: 215, npa: "2340", nom: "Le Noirmont",             quotite: 1.70, tauxCath: 8.9,  tauxRef: 8.1, taxeImmo: 1.2  },
  { id: 203, npa: "2345", nom: "Les Breuleux",            quotite: 1.30, tauxCath: 8.7,  tauxRef: 8.1, taxeImmo: 1.15 },
  { id: 213, npa: "2338", nom: "Muriaux",                 quotite: 1.60, tauxCath: 8.0,  tauxRef: 8.1, taxeImmo: 1.5  },
  { id: 122, npa: "2842", nom: "Rossemaison",             quotite: 2.00, tauxCath: 6.4,  tauxRef: 8.1, taxeImmo: 1.0  },
  { id: 102, npa: "2856", nom: "Boécourt",                quotite: 2.00, tauxCath: 8.0,  tauxRef: 8.1, taxeImmo: 1.0  },
  // ... toutes les communes sont dans le fichier source complet
];

// ============================================================
// 5. DÉDUCTIONS PERSONNES ÂGÉES (code 670) — Mariés
// Source: deductionPersonneAgeeMariee.txt
// ============================================================

const DEDUCTION_PERSONNES_AGEES_MARIEES = [
  { min: 0,      max: 37199, renteUnique: 8900, renteDouble: 10300 },
  { min: 37200,  max: 37999, renteUnique: 8300, renteDouble: 9700  },
  { min: 38000,  max: 38899, renteUnique: 7800, renteDouble: 9200  },
  { min: 38900,  max: 39699, renteUnique: 7200, renteDouble: 8600  },
  { min: 39700,  max: 40599, renteUnique: 6700, renteDouble: 8100  },
  { min: 40600,  max: 41499, renteUnique: 6200, renteDouble: 7600  },
  { min: 41500,  max: 42299, renteUnique: 5600, renteDouble: 7000  },
  { min: 42300,  max: 43199, renteUnique: 5100, renteDouble: 6500  },
  { min: 43200,  max: 43999, renteUnique: 4500, renteDouble: 5900  },
  { min: 44000,  max: 44899, renteUnique: 4000, renteDouble: 5400  },
  { min: 44900,  max: 45799, renteUnique: 3500, renteDouble: 4900  },
  { min: 45800,  max: 46599, renteUnique: 2900, renteDouble: 4300  },
  { min: 46600,  max: 47499, renteUnique: 2400, renteDouble: 3800  },
  { min: 47500,  max: 48299, renteUnique: 1800, renteDouble: 3200  },
  { min: 48300,  max: 49199, renteUnique: 1300, renteDouble: 2700  },
  { min: 49200,  max: 50099, renteUnique: 800,  renteDouble: 2200  },
  { min: 50100,  max: 50899, renteUnique: 200,  renteDouble: 1600  },
  { min: 50900,  max: 51799, renteUnique: 0,    renteDouble: 1100  },
  { min: 51800,  max: 52599, renteUnique: 0,    renteDouble: 500   },
  { min: 52600,  max: 999999999, renteUnique: 0, renteDouble: 0   },
];

const DEDUCTION_PERSONNES_AGEES_SEULES = [
  { min: 0,      max: 29099, deduction: 8900 },
  { min: 29100,  max: 29899, deduction: 8300 },
  { min: 29900,  max: 30799, deduction: 7800 },
  { min: 30800,  max: 31599, deduction: 7200 },
  { min: 31600,  max: 32499, deduction: 6700 },
  { min: 32500,  max: 33399, deduction: 6200 },
  { min: 33400,  max: 34199, deduction: 5600 },
  { min: 34200,  max: 35099, deduction: 5100 },
  { min: 35100,  max: 35899, deduction: 4500 },
  { min: 35900,  max: 36799, deduction: 4000 },
  { min: 36800,  max: 37699, deduction: 3500 },
  { min: 37700,  max: 38499, deduction: 2900 },
  { min: 38500,  max: 39399, deduction: 2400 },
  { min: 39400,  max: 40199, deduction: 1800 },
  { min: 40200,  max: 41099, deduction: 1300 },
  { min: 41100,  max: 41999, deduction: 800  },
  { min: 42000,  max: 42799, deduction: 200  },
  { min: 42800,  max: 999999999, deduction: 0 },
];

// ============================================================
// 6. CONSTANTES FISCALES 2025
// ============================================================

const CONSTANTES = {
  // Code 525 ICC — Forfaits assurances maladie
  FORFAIT_525: {
    MARIE_SANS_PILIER:       8380,  // Mariés, aucun 2e/3e pilier actif
    MARIE_UN_PILIER:         7590,  // Mariés, un seul pilier
    MARIE_DEUX_PILIERS:      6800,  // Mariés, les deux ont un pilier
    SEUL_SANS_PILIER:        4190,  // Célibataire/veuf sans pilier
    SEUL_AVEC_PILIER:        3400,  // Célibataire/veuf avec pilier
    SUPPLEMENT_ENFANT_CHARGE: 1020, // Par enfant mineur à charge
    SUPPLEMENT_ENFANT_FORMATION: 3400, // Par enfant en formation
  },

  // Code 525 IFD — Forfaits fédéraux
  FORFAIT_525_IFD: {
    MARIE_SANS_PILIER:       5550,
    MARIE_AVEC_PILIER:       3700,
    SEUL_SANS_PILIER:        2700,
    SEUL_AVEC_PILIER:        1800,
    SUPPLEMENT_ENFANT:        700,
  },

  // Déductions personnelles ICC (code 680)
  DEDUCTION_COUPLE_MARIE:    3600,  // 2024: 3600, vérifier 2025
  DEDUCTION_MENAGE_INDEPENDANT: 1800,

  // Fortune — déduction générale (code 860)
  DEDUCTION_FORTUNE_MARIE:   57000,
  DEDUCTION_FORTUNE_SEUL:    28000,
  DEDUCTION_FORTUNE_ENFANT:  28000,

  // Frais professionnels forfait (code 500)
  FRAIS_PRO_MIN:             2000,
  FRAIS_PRO_MAX:             4000,
  FRAIS_PRO_TAUX:            3,    // 3%

  // Déduction double revenu (code 505)
  DEDUCTION_DOUBLE_REVENU_MAX: 13500,

  // Frais maladie — franchise 5% (code 575)
  FRANCHISE_FRAIS_MALADIE:   5,    // 5% du revenu net I

  // Dons (code 585) — max 20% revenu net I
  DONS_MAX_TAUX:             20,

  // Immobilier — déduction forfaitaire
  FORFAIT_IMMO_NEUF:         10,   // 10% si immeuble < 10 ans
  FORFAIT_IMMO_ANCIEN:       20,   // 20% si immeuble >= 10 ans

  // Impôt fédéral direct — taux forfaitaire final
  IFD_TAUX_FINAL:            13,   // 13% au-delà du dernier palier
};

// ============================================================
// 7. FONCTIONS DE CALCUL — ARRONDIS
// Source: CFRoundDown, CFArrondiMillierInferieur, CFArrondiCentaineInferieure
// ============================================================

const Arrondi = {
  /** Arrondi à l'unité inférieure selon place (1,10,100,1000...) */
  versLeBas: (n, place) => {
    if (![1,10,100,1000,10000,100000,1000000].includes(place)) return n;
    return Math.floor(n / place) * place;
  },

  /** Fortune imposable — arrondie au millier inférieur */
  millierInferieur: (n) => n - (n % 1000),

  /** Arrondi au 100 inférieur */
  centaineInferieure: (n) => n - (n % 100),

  /** Arrondi au 5 centimes — règle exacte JuraTax (CFDetermineImpotSurRevenuICC) */
  cinqCentimes: (impot) => {
    let impotCentimes = Math.trunc(impot * 100);
    const mod = impotCentimes % 5;
    if (mod > 2) {
      impotCentimes = impotCentimes + 5 - mod;
    } else {
      impotCentimes -= mod;
    }
    return impotCentimes / 100;
  },
};

// ============================================================
// 8. CALCUL IMPÔT SUR LE REVENU ICC
// Source: CFDetermineImpotSurRevenuICC.java
// ============================================================

/**
 * Cherche le palier dans un barème progressif
 * @param {number} revenu
 * @param {Array} bareme [[min, impot_base, taux], ...]
 * @returns {{palierMin, impotBase, tauxPar100}}
 */
function _getPalier(revenu, bareme) {
  let palier = bareme[0];
  for (let i = 0; i < bareme.length; i++) {
    if (bareme[i][0] <= revenu) {
      palier = bareme[i];
    } else {
      break;
    }
  }
  return { palierMin: palier[0], impotBase: palier[1], tauxPar100: palier[2] };
}

/**
 * Calcule l'impôt d'État ICC sur le revenu
 * @param {number} revenuImposable - code 690
 * @param {boolean} baremeMarital - true si marié
 * @returns {number} impôt en CHF (arrondi au 5 ct)
 */
function calculImpotRevenuICC(revenuImposable, baremeMarital) {
  if (revenuImposable <= 0) return 0;
  const bareme = baremeMarital ? BAREME_ICC_REVENU_MARIE : BAREME_ICC_REVENU_CELIBATAIRE;
  const { palierMin, impotBase, tauxPar100 } = _getPalier(revenuImposable, bareme);
  const montantSupp = revenuImposable - palierMin;
  const impot = impotBase + (montantSupp * tauxPar100 / 100);
  return Arrondi.cinqCentimes(impot);
}

/**
 * Calcule l'impôt communal ICC
 * @param {number} impotEtatBase - impôt d'État ICC
 * @param {number} quotiteCommune - quotité de la commune (ex: 2.25)
 * @returns {number}
 */
function calculImpotCommunalICC(impotEtatBase, quotiteCommune) {
  return Arrondi.cinqCentimes(impotEtatBase * quotiteCommune);
}

/**
 * Calcule l'impôt ecclésiastique
 * @param {number} impotEtatBase
 * @param {number} tauxConfession - taux catholique ou réformé
 * @returns {number}
 */
function calculImpotEcclesiastique(impotEtatBase, tauxConfession) {
  return Arrondi.cinqCentimes(impotEtatBase * tauxConfession / 100);
}

// ============================================================
// 9. CALCUL IMPÔT SUR LA FORTUNE ICC
// Source: CFDetermineImpotFortune.java
// ============================================================

/**
 * Calcule l'impôt d'État ICC sur la fortune
 * @param {number} fortuneImposable - code 890 (arrondi au millier inférieur)
 * @returns {number} impôt en CHF (arrondi au 5 ct)
 */
function calculImpotFortuneICC(fortuneImposable) {
  if (fortuneImposable <= 0) return 0;
  // Fortune arrondie au millier inférieur (règle JuraTax)
  const fortuneArrondie = Arrondi.millierInferieur(fortuneImposable);
  const { palierMin, impotBase, tauxPar100: tauxParMille } = _getPalier(fortuneArrondie, BAREME_ICC_FORTUNE);
  const milliersSupp = (fortuneArrondie - palierMin) / 1000;
  const impot = impotBase + (milliersSupp * tauxParMille);
  return Arrondi.cinqCentimes(impot);
}

// ============================================================
// 10. CALCUL IMPÔT FÉDÉRAL DIRECT (IFD)
// Source: CFDetermineImpotIfd.java
// ============================================================

/**
 * Calcule l'IFD sur le revenu
 * @param {number} revenuImposableIFD - code 690 IFD
 * @param {boolean} baremeMarital
 * @returns {number} impôt en CHF
 */
function calculImpotIFD(revenuImposableIFD, baremeMarital) {
  if (revenuImposableIFD <= 0) return 0;
  const bareme = baremeMarital ? BAREME_IFD_MARIE : BAREME_IFD_CELIBATAIRE;
  // IFD: barème par tranches avec taux marginal
  let impot = 0;
  let revenuRestant = revenuImposableIFD;
  for (let i = 0; i < bareme.length; i++) {
    const [maxExclu, taux] = bareme[i];
    const minTranche = i === 0 ? 0 : bareme[i-1][0];
    if (revenuImposableIFD <= minTranche) break;
    const montantTranche = Math.min(revenuImposableIFD, maxExclu) - minTranche;
    impot += montantTranche * taux / 100;
    if (revenuImposableIFD < maxExclu) break;
  }
  return Arrondi.cinqCentimes(impot);
}

// ============================================================
// 11. CODE 525 — FORFAIT ASSURANCES
// Source: CFCotisationCaisseMaladieICC.java (EXACT)
// ============================================================

/**
 * Calcule le forfait déductible assurances (code 525 ICC)
 * @param {object} params
 * @param {number} params.etatCivil - 2=marié, autres=célibataire/veuf/divorcé
 * @param {number} params.pilier2_3_homme - cotisations 2e+3e pilier homme (0 si rentier)
 * @param {number} params.pilier2_3_femme - cotisations 2e+3e pilier femme (0 si rentier)
 * @param {number} params.nbEnfantsMineurs - nombre enfants mineurs à charge
 * @param {number} params.nbEnfantsInstruction - nombre enfants en formation
 * @param {number} params.primesEffectives - primes maladie réelles payées (5250)
 * @param {number} params.interetsEpargne - intérêts épargne (5256)
 * @param {number} params.subsidesRecus - subsides caisse compensation (5252)
 * @returns {{forfait, total5259, deductible}}
 */
function calcul525ICC({
  etatCivil = 2,
  pilier2_3_homme = 0,
  pilier2_3_femme = 0,
  nbEnfantsMineurs = 0,
  nbEnfantsInstruction = 0,
  primesEffectives = 0,
  interetsEpargne = 0,
  subsidesRecus = 0,
}) {
  const C = CONSTANTES.FORFAIT_525;

  // Calcul du forfait selon situation (logique exacte CFCotisationCaisseMaladieICC)
  let forfait;
  if (etatCivil === 2) { // Marié
    if (pilier2_3_homme > 0 && pilier2_3_femme > 0) {
      forfait = C.MARIE_DEUX_PILIERS;      // 6'800
    } else if (pilier2_3_homme === 0 && pilier2_3_femme === 0) {
      forfait = C.MARIE_SANS_PILIER;       // 8'380 ← cas Neukomm (rentiers)
    } else {
      forfait = C.MARIE_UN_PILIER;         // 7'590
    }
  } else { // Célibataire / veuf / divorcé
    if (pilier2_3_homme + pilier2_3_femme > 0) {
      forfait = C.SEUL_AVEC_PILIER;        // 3'400
    } else {
      forfait = C.SEUL_SANS_PILIER;        // 4'190
    }
  }

  // Suppléments enfants
  forfait += nbEnfantsMineurs * C.SUPPLEMENT_ENFANT_CHARGE;
  forfait += nbEnfantsInstruction * C.SUPPLEMENT_ENFANT_FORMATION;

  // Total 5259 (primes + intérêts - subsides)
  const total5259 = primesEffectives + interetsEpargne - subsidesRecus;

  // PlafondMaximaAutorise — logique exacte du XML:
  // Si total5259 > forfait → déductible = total5259 (plafonné par forfait)
  // Sinon → déductible = forfait (si subsides = 0)
  let deductible;
  if (total5259 > forfait) {
    deductible = forfait; // Plafonné au forfait
  } else {
    // Le forfait s'applique (déduction forfaitaire)
    deductible = subsidesRecus > 0
      ? Math.max(forfait - subsidesRecus, 0)
      : forfait;
  }

  return { forfait, total5259, deductible };
}

// ============================================================
// 12. CODE 670 — DÉDUCTION PERSONNES ÂGÉES
// Source: CFDeductionPourPersonnesAgeesOuInfirmes.java
// ============================================================

/**
 * Déduction personnes âgées (code 670)
 * @param {number} revenuNet2 - code 590 (revenu net II)
 * @param {boolean} marie
 * @param {boolean} renteDouble - les deux conjoints ont une rente
 * @returns {number} déduction en CHF
 */
function calculDeduction670(revenuNet2, marie, renteDouble = false) {
  if (marie) {
    const tranche = DEDUCTION_PERSONNES_AGEES_MARIEES.find(
      t => revenuNet2 >= t.min && revenuNet2 <= t.max
    );
    if (!tranche) return 0;
    return renteDouble ? tranche.renteDouble : tranche.renteUnique;
  } else {
    const tranche = DEDUCTION_PERSONNES_AGEES_SEULES.find(
      t => revenuNet2 >= t.min && revenuNet2 <= t.max
    );
    return tranche ? tranche.deduction : 0;
  }
}

// ============================================================
// 13. MOTEUR PRINCIPAL — CALCUL COMPLET
// ============================================================

/**
 * Calcule la déclaration fiscale complète (ICC + IFD)
 * @param {object} data - données du contribuable
 * @returns {object} - tous les codes DI calculés
 */
function calculerDeclaration(data) {
  const {
    // Revenus
    avs_homme = 0,           // code 200
    avs_femme = 0,           // code 200C
    lpp = 0,                 // code 220
    rendementImmoNet = 0,    // code 300 (frais effectifs déjà déduits)
    rendementTitresNet = 0,  // code 340

    // Situation personnelle
    etatCivil = 2,           // 2=marié
    marie = true,
    commune = "Bure",

    // Piliers pour calcul 525
    pilier2_3_homme = 0,
    pilier2_3_femme = 0,
    nbEnfantsMineurs = 0,
    nbEnfantsInstruction = 0,

    // Assurances (5250, 5256, 5252)
    primesAssuranceMaladie = 0,
    interetsEpargne = 0,
    subsidesRecus = 0,

    // Déductions
    interetsHypothecaires = 0, // code 530
    dons = 0,                  // code 585
    fraisMaladie = 0,          // code 570 (brut)

    // Fortune
    biensFonciers = 0,         // code 700
    titresPrives = 0,          // code 740
    dettesHypothecaires = 0,   // code 800

    // Confession
    confession = "catholique", // pour impôt ecclésiastique
    renteDouble = true,        // les deux conjoints ont rente AVS
  } = data;

  // --- REVENUS ---
  const DI200  = avs_homme;
  const DI200C = avs_femme;
  const DI220  = lpp;
  const DI300  = rendementImmoNet;
  const DI340  = rendementTitresNet;
  const DI490  = DI200 + DI200C + DI220 + DI300 + DI340;

  // --- DÉDUCTIONS OBJECTIVES ---
  // Code 525
  const res525 = calcul525ICC({
    etatCivil, pilier2_3_homme, pilier2_3_femme,
    nbEnfantsMineurs, nbEnfantsInstruction,
    primesEffectives: primesAssuranceMaladie,
    interetsEpargne, subsidesRecus,
  });
  const DI525 = res525.deductible;
  const DI530 = interetsHypothecaires;
  const totalDeductionsObjectives = DI525 + DI530;

  // Code 560 — Revenu net I
  const DI560 = DI490 - totalDeductionsObjectives;

  // Code 575 — Franchise frais maladie (5% du revenu net I)
  const DI575 = Math.round(DI560 * CONSTANTES.FRANCHISE_FRAIS_MALADIE / 100);

  // Code 580 — Frais maladie déductibles
  const fraisMaladieDeductibles = Math.max(fraisMaladie - DI575, 0);
  const DI580 = fraisMaladieDeductibles;

  // Code 585 — Dons (max 20% revenu net I)
  const DI585 = Math.min(dons, Math.round(DI560 * CONSTANTES.DONS_MAX_TAUX / 100));

  // Code 590 — Revenu net II
  const DI590 = DI560 - DI580 - DI585;

  // --- DÉDUCTIONS PERSONNELLES ---
  // Code 670 — Personnes âgées
  const DI670 = calculDeduction670(DI590, marie, renteDouble);

  // Code 680 — Couple marié
  const DI680 = marie ? CONSTANTES.DEDUCTION_COUPLE_MARIE : 0;

  const totalDeductionsPersonnelles = DI670 + DI680;

  // Code 690 — Revenu imposable
  const DI690 = Math.max(DI590 - totalDeductionsPersonnelles, 0);

  // --- FORTUNE ---
  const DI700 = biensFonciers;
  const DI740 = titresPrives;
  const DI790 = DI700 + DI740;
  const DI800 = dettesHypothecaires;
  const DI840 = DI790 - DI800;

  // Code 860 — Déduction fortune
  const DI860 = marie
    ? CONSTANTES.DEDUCTION_FORTUNE_MARIE + (nbEnfantsMineurs * CONSTANTES.DEDUCTION_FORTUNE_ENFANT)
    : CONSTANTES.DEDUCTION_FORTUNE_SEUL;

  // Code 890 — Fortune imposable
  const DI890 = Math.max(DI840 - DI860, 0);
  const DI890rounded = Arrondi.millierInferieur(DI890);

  // --- CALCULS D'IMPÔTS ---
  const baremeMarital = etatCivil === 2;
  const communeData = COMMUNES_JU.find(c => c.nom === commune) || COMMUNES_JU.find(c => c.nom === "Bure");

  const impotEtatRevenu    = calculImpotRevenuICC(DI690, baremeMarital);
  const impotCommunalRevenu = calculImpotCommunalICC(impotEtatRevenu, communeData.quotite);
  const tauxEcclesiastique = confession === "catholique" ? communeData.tauxCath : communeData.tauxRef;
  const impotEcclesiastique = calculImpotEcclesiastique(impotEtatRevenu, tauxEcclesiastique);

  const impotEtatFortune    = calculImpotFortuneICC(DI890rounded);
  const impotCommunalFortune = calculImpotCommunalICC(impotEtatFortune, communeData.quotite);

  const impotIFD = calculImpotIFD(DI690, baremeMarital);

  // Total impôts
  const totalImpots = impotEtatRevenu + impotCommunalRevenu + impotEcclesiastique
                    + impotEtatFortune + impotCommunalFortune + impotIFD;

  return {
    // Revenus
    DI200, DI200C, DI220, DI300, DI340, DI490,

    // Déductions et revenus nets
    DI525, DI525_detail: res525,
    DI530,
    DI560, DI575, DI580, DI585, DI590,

    // Déductions personnelles
    DI670, DI680, DI690,

    // Fortune
    DI700, DI740, DI790, DI800, DI840, DI860, DI890, DI890rounded,

    // Impôts
    impotEtatRevenu,
    impotCommunalRevenu,
    impotEcclesiastique,
    impotEtatFortune,
    impotCommunalFortune,
    impotIFD,
    totalImpots,

    // Métadonnées
    commune: communeData.nom,
    quotiteCommune: communeData.quotite,
    taxeImmo: communeData.taxeImmo,
  };
}

// ============================================================
// 14. VALIDATION CROISÉE — ALERTES
// ============================================================

function validerDeclaration(result, inputData) {
  const alertes = [];

  // ALERTE 1 — 525: si primes saisies = 0 mais forfait appliqué
  if (inputData.primesAssuranceMaladie === 0) {
    alertes.push({
      code: "525",
      niveau: "INFO",
      message: `Forfait assurances appliqué: ${result.DI525} CHF. Avez-vous saisi vos primes maladie réelles?`,
    });
  }

  // ALERTE 2 — Frais immo effectifs vs forfait
  if (inputData.rendementImmoNet > 0 && !inputData.fraisEffectifsDocumentes) {
    alertes.push({
      code: "300",
      niveau: "WARNING",
      message: "N'oubliez pas d'inclure: taxe immobilière, ECA, RC bâtiment, ordures, ramonage dans les frais effectifs.",
    });
  }

  // ALERTE 3 — Dons plafonnés
  if (inputData.dons > result.DI585) {
    alertes.push({
      code: "585",
      niveau: "INFO",
      message: `Dons plafonnés à ${result.DI585} CHF (20% du revenu net I de ${result.DI560} CHF).`,
    });
  }

  // ALERTE 4 — Déduction personnes âgées = 0 alors qu'éligible
  if (inputData.marie && result.DI670 === 0 && result.DI590 > 37200) {
    alertes.push({
      code: "670",
      niveau: "INFO",
      message: "Revenu trop élevé pour la déduction personnes âgées (plafond: 52'600 CHF).",
    });
  }

  return alertes;
}

// ============================================================
// 15. EXPORT
// ============================================================

// Export Node.js / ES Module
if (typeof module !== 'undefined') {
  module.exports = {
    calculerDeclaration,
    calcul525ICC,
    calculImpotRevenuICC,
    calculImpotFortuneICC,
    calculImpotIFD,
    calculDeduction670,
    validerDeclaration,
    CONSTANTES,
    COMMUNES_JU,
    BAREME_ICC_REVENU_MARIE,
    BAREME_ICC_REVENU_CELIBATAIRE,
    BAREME_ICC_FORTUNE,
    BAREME_IFD_MARIE,
    BAREME_IFD_CELIBATAIRE,
    Arrondi,
  };
}

// ============================================================
// 16. TEST INTÉGRATION — CAS NEUKOMM 2025
// ============================================================

function testNeukomm2025() {
  console.log("=== TEST NEUKOMM 2025 ===\n");

  const result = calculerDeclaration({
    avs_homme:              22680,
    avs_femme:              21876,
    lpp:                    35931,
    rendementImmoNet:       4627,
    rendementTitresNet:     378,
    etatCivil:              2,
    marie:                  true,
    commune:                "Bure",
    pilier2_3_homme:        0,     // Rentier — pas de pilier actif
    pilier2_3_femme:        0,     // Rentière — pas de pilier actif
    nbEnfantsMineurs:       0,
    nbEnfantsInstruction:   0,
    primesAssuranceMaladie: 0,     // Pas saisies dans JuraTax
    interetsEpargne:        378,
    subsidesRecus:          0,
    interetsHypothecaires:  2121,
    dons:                   1000,
    fraisMaladie:           134,
    biensFonciers:          415460,
    titresPrives:           263723,
    dettesHypothecaires:    168000,
    confession:             "catholique",
    renteDouble:            true,
  });

  // Comparaison avec JuraTax officiel
  const juratax = {
    DI490: 85492, DI525: 8380, DI530: 2121,
    DI560: 74991, DI580: 0,    DI585: 1000,
    DI590: 73991, DI670: 0,    DI680: 3600,
    DI690: 70391, DI890: 454183,
  };

  console.log("Code  | tAIx     | JuraTax  | OK?");
  console.log("------|----------|----------|----");
  const codes = ['DI490','DI525','DI530','DI560','DI580','DI585','DI590','DI680','DI690'];
  codes.forEach(code => {
    const ok = result[code] === juratax[code] ? "✅" : "❌";
    console.log(`${code.padEnd(5)} | ${String(result[code]).padEnd(8)} | ${String(juratax[code]).padEnd(8)} | ${ok}`);
  });

  console.log("\n--- Impôts calculés ---");
  console.log(`Impôt État revenu:     ${result.impotEtatRevenu} CHF`);
  console.log(`Impôt communal:        ${result.impotCommunalRevenu} CHF`);
  console.log(`Impôt ecclésiastique:  ${result.impotEcclesiastique} CHF`);
  console.log(`Impôt État fortune:    ${result.impotEtatFortune} CHF`);
  console.log(`Impôt communal fort.:  ${result.impotCommunalFortune} CHF`);
  console.log(`IFD:                   ${result.impotIFD} CHF`);
  console.log(`TOTAL IMPÔTS:          ${result.totalImpots} CHF`);

  const alertes = validerDeclaration(result, { primesAssuranceMaladie: 0, dons: 1000 });
  console.log("\n--- Alertes ---");
  alertes.forEach(a => console.log(`[${a.niveau}] ${a.code}: ${a.message}`));

  return result;
}

// Lancer le test si exécuté directement
if (typeof require !== 'undefined' && require.main === module) {
  testNeukomm2025();
}
