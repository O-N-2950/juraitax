// ═══════════════════════════════════════════════
//  JurAI TAX — Configuration centrale
//  PEP's Swiss SA | Bellevue 7 | 2950 Courgenay
// ═══════════════════════════════════════════════

export const APP = {
  name: "JurAI Tax",
  tagline: "Déclaration fiscale optimisée par l'intelligence artificielle",
  editor: "PEP's Swiss SA",
  address: "Bellevue 7, 2950 Courgenay",
  partner: "WIN WIN Finance Group SARL",
  partnerFinma: "FINMA F01042365",
  email: "contact@juraitax.ch",
  emailCourrier: "documents@juraitax.ch",
  year: 2025,
};

// Comptes B2B partenaires — accès illimité gratuit
export const B2B_FREE_ACCOUNTS = [
  "winwin@winwinfinance.ch",
  "olivier@winwinfinance.ch",
  "admin@juraitax.ch",
];

// Tarifs
export const PRICING = {
  particulier: 49,
  particulierLaunch: 29,
  launchLimit: 100,
  prolongation: 9,
  b2b: {
    solo:      { price: 490,  quota: 20,  extra: 29 },
    cabinet:   { price: 990,  quota: 60,  extra: 29 },
    unlimited: { price: 1990, quota: null, extra: 0  },
  },
};

// Communes Canton du Jura
export const COMMUNES = [
  "Alle","Asuel","Bassecourt","Beurnevésin","Bonfol","Bourrignon","Bressaucourt",
  "Buix","Bure","Chenevez","Cœuve","Courchapoix","Courchavon","Courfaivre",
  "Courgenay","Courrendlin","Courroux","Courtedoux","Courtételle","Damphreux-Lugnez",
  "Delémont","Develier","Ederswiler","Fahy","Fontenais","Fregiécourt","Glovelier",
  "Grandfontaine","Lajoux","Mervelier","Mettembert","Miécourt","Montancy","Montignez",
  "Movelier","Moutier","Pleujouse","Pleigne","Porrentruy","Réclère","Rocourt",
  "Saignelégier","Saint-Brais","Saint-Ursanne","Saulcy","Soubey","Soyhières",
  "Undervelier","Vendlincourt","Vermes",
].sort();

// Multiplicateurs communaux 2025 (Canton du Jura)
export const MULTIPLICATEURS = {
  "Delémont": 1.02, "Porrentruy": 1.04, "Courgenay": 1.05,
  "Bassecourt": 1.05, "Glovelier": 1.06, "Saignelégier": 1.03,
  "Moutier": 1.04, "Courfaivre": 1.05, "Courroux": 1.04,
  "default": 1.05,
};

// Barèmes Jura 2025
export const BAREMES = {
  pilier3a_salarie: 7258,
  pilier3a_independant: 36288,
  frais_garde_max: 10600,
  primes_assurance_maries: 6800,
  primes_assurance_autres: 3400,
  primes_supplement_enfant: 790,
  deduction_couple: 3700,
  deduction_enfant: 5700,
  deduction_enfant_3plus: 6400,
  deduction_personne_seule_enfant: 2700,
  deduction_fortune_maries: 57000,
  deduction_fortune_autres: 28500,
  deduction_fortune_enfant: 28500,
  km_max: 9900,
  repas_forfait: 3200,
  dons_max_pct: 0.10,
  frais_maladie_franchise_pct: 0.05,

  // Subsides LAMal 2025
  subsides: {
    adulte_max_rdu: 26999,
    enfant_max_rdu: 52999,
    supplement_famille_rdu: 18000,
    fortune_max: 150000,
    adulte_montant_max: 225,   // CHF/mois
    enfant_montant: 97,         // CHF/mois
    jeune_formation_montant: 185, // CHF/mois
    supplement_famille_max: 300,  // CHF/mois
  },
};
