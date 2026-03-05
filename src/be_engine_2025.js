// =============================================================================
// be_engine_2025.js — Moteur fiscal Berne 2025
// Source: PrivateTax 2025 (VRSG) / taxdata-2025 commun DrTax/Ringler
// Validé contre: be_answers_10questions.txt
// PRINCIPE: 100% validé au centime avant production
// =============================================================================

// ----------------------------------------------------------------------------
// BARÈMES REVENU ICC (impôt simple)
// TarifBE_1 = Grundtarif (célibataire)
// TarifBE_2 = Familientarif (marié / partenariat enregistré)
// PAS de splitting — double barème direct
// ----------------------------------------------------------------------------

const TARIF_BE_1 = [ // Célibataire
  { seuil: 0, base: 0, taux: 0.0195 },
  { seuil: 3300, base: 64.35, taux: 0.029 },
  { seuil: 6600, base: 160.05, taux: 0.036 },
  { seuil: 16400, base: 512.85, taux: 0.0415 },
  { seuil: 32400, base: 1176.85, taux: 0.0445 },
  { seuil: 59100, base: 2365.0, taux: 0.05 },
  { seuil: 85800, base: 3700.0, taux: 0.056 },
  { seuil: 112500, base: 5195.2, taux: 0.0575 },
  { seuil: 139200, base: 6730.45, taux: 0.059 },
  { seuil: 165900, base: 8305.75, taux: 0.0605 },
  { seuil: 192600, base: 9921.1, taux: 0.0615 },
  { seuil: 230000, base: 12221.2, taux: 0.063 },
  { seuil: 316400, base: 17664.4, taux: 0.064 },
  { seuil: 467600, base: 27341.2, taux: 0.065 },
];

const TARIF_BE_2 = [ // Marié / partenariat enregistré
  { seuil: 0, base: 0, taux: 0.0155 },
  { seuil: 3300, base: 51.15, taux: 0.0165 },
  { seuil: 6600, base: 105.6, taux: 0.0285 },
  { seuil: 16400, base: 384.9, taux: 0.0365 },
  { seuil: 32400, base: 968.9, taux: 0.038 },
  { seuil: 59100, base: 1983.5, taux: 0.043 },
  { seuil: 85800, base: 3131.6, taux: 0.0485 },
  { seuil: 112500, base: 4426.55, taux: 0.052 },
  { seuil: 139200, base: 5814.95, taux: 0.057 },
  { seuil: 180600, base: 8174.75, taux: 0.0585 },
  { seuil: 234600, base: 11333.75, taux: 0.0595 },
  { seuil: 288600, base: 14546.75, taux: 0.062 },
  { seuil: 342600, base: 17894.75, taux: 0.064 },
  { seuil: 483000, base: 26880.35, taux: 0.065 },
];

// ----------------------------------------------------------------------------
// BARÈME FORTUNE ICC — TarifBE_3
// Minimum imposable: 36 000 CHF (1ère tranche à 0‰)
// Un seul barème (pas de tarif famille séparé)
// ----------------------------------------------------------------------------

const TARIF_BE_3_FORTUNE = [
  { seuil: 0, base: 0, taux: 0 },
  { seuil: 36000, base: 0, taux: 0.0004 },
  { seuil: 77000, base: 16.4, taux: 0.0007 },
  { seuil: 216000, base: 113.7, taux: 0.0008 },
  { seuil: 437000, base: 290.5, taux: 0.001 },
  { seuil: 808000, base: 661.5, taux: 0.0012 },
  { seuil: 1359000, base: 1322.7, taux: 0.0013 },
  { seuil: 3728000, base: 4402.4, taux: 0.00135 },
  { seuil: 6303000, base: 7878.65, taux: 0.00125 },
];

// ----------------------------------------------------------------------------
// STEUERFUSS ÉTAT BE 2025
// Source: ModuleBE.java:34-36 — getModuleSteuerfuss() = 2.975
// ----------------------------------------------------------------------------

const STEUERFUSS_ETAT_BE = 2.975;

// ----------------------------------------------------------------------------
// COMMUNES BE (359 communes)
// id: identifiant interne taxdata | nom: affichage | npa: code postal
// steuerfuesse: { gemeinde, reformiert, katholisch, christkatholik, liegenschafft }
// Types: 4=Gemeinde_NP, 1=Reformiert_NP, 2=RoemischKatholik_NP,
//        3=ChristKatholik_NP, 9=Liegenschafft
// ----------------------------------------------------------------------------

const COMMUNES_BE = [
  { id: 26, nom: 'Aarwangen', npa: '4912', gemeinde: 1.57, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 154, nom: 'Adelboden', npa: '3715', gemeinde: 1.99, reformiert: 0.184, katholisch: 0.23, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 80, nom: 'Aefligen', npa: '3426', gemeinde: 1.95, reformiert: 0.16, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 257, nom: 'Aegerten', npa: '2558', gemeinde: 1.79, reformiert: 0.2, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 155, nom: 'Aeschi b. Sp.', npa: '3703', gemeinde: 1.79, reformiert: 0.25, katholisch: 0.23, christkatholik: 0.23, liegenschafft: 1.3 },
  { id: 336, nom: 'Affoltern i. E.', npa: '3416', gemeinde: 1.86, reformiert: 0.238, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 81, nom: 'Alchenstorf', npa: '3473', gemeinde: 1.75, reformiert: 0.22, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 213, nom: 'Allmendingen b. B.', npa: '3112', gemeinde: 1.25, reformiert: 0.184, katholisch: 0.18, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 309, nom: 'Amsoldingen', npa: '3633', gemeinde: 1.85, reformiert: 0.246, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 66, nom: 'Arch', npa: '3296', gemeinde: 1.75, reformiert: 0.14, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 0.8 },
  { id: 185, nom: 'Arni', npa: '3508', gemeinde: 1.74, reformiert: 0.23, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 346, nom: 'Attiswil', npa: '4536', gemeinde: 1.64, reformiert: 0.207, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 27, nom: 'Auswil', npa: '4944', gemeinde: 1.75, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.25 },
  { id: 82, nom: 'B\u00e4riswil', npa: '3323', gemeinde: 1.64, reformiert: 0.21, katholisch: 0.207, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 129, nom: 'B\u00e4tterkinden', npa: '3315', gemeinde: 1.8, reformiert: 0.21, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 162, nom: 'B\u00f6nigen', npa: '3806', gemeinde: 1.9, reformiert: 0.184, katholisch: 0.207, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 67, nom: 'B\u00fcetigen', npa: '3263', gemeinde: 1.55, reformiert: 0.2, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.2 },
  { id: 260, nom: 'B\u00fchl', npa: '3274', gemeinde: 1.55, reformiert: 0.1836, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 0.0 },
  { id: 68, nom: 'B\u00fcren a. A.', npa: '3294', gemeinde: 1.64, reformiert: 0.197, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 28, nom: 'Bannwil', npa: '4913', gemeinde: 1.8, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 7, nom: 'Bargen', npa: '3282', gemeinde: 1.84, reformiert: 0.23, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.2 },
  { id: 161, nom: 'Beatenberg', npa: '3803', gemeinde: 1.98, reformiert: 0.2415, katholisch: 0.207, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 258, nom: 'Bellmund', npa: '2564', gemeinde: 1.3, reformiert: 0.21, katholisch: 0.23, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 1059, nom: 'Belp', npa: '3123', gemeinde: 1.4, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 226, nom: 'Belprahon', npa: '2744', gemeinde: 1.93, reformiert: 0.23, katholisch: 0.207, christkatholik: 0.306, liegenschafft: 1.0 },
  { id: 347, nom: 'Berken', npa: '3376', gemeinde: 1.1, reformiert: 0.17, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 51, nom: 'Bern', npa: '3000', gemeinde: 1.54, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 348, nom: 'Bettenhausen', npa: '3366', gemeinde: 1.55, reformiert: 0.17, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 64, nom: 'Biel', npa: '2500', gemeinde: 1.63, reformiert: 0.23, katholisch: 0.23, christkatholik: 0.28, liegenschafft: 1.5 },
  { id: 186, nom: 'Biglen', npa: '3507', gemeinde: 1.9, reformiert: 0.23, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 29, nom: 'Bleienbach', npa: '3368', gemeinde: 1.45, reformiert: 0.175, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 310, nom: 'Blumenstein', npa: '3638', gemeinde: 1.75, reformiert: 0.23, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 52, nom: 'Bolligen', npa: '3065', gemeinde: 1.6, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 297, nom: 'Boltigen', npa: '3766', gemeinde: 1.9, reformiert: 0.23, katholisch: 0.1377, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 188, nom: 'Bowil', npa: '3533', gemeinde: 1.84, reformiert: 0.207, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.1 },
  { id: 259, nom: 'Br\u00fcgg', npa: '2555', gemeinde: 1.69, reformiert: 0.2, katholisch: 0.23, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 115, nom: 'Br\u00fcttelen', npa: '3237', gemeinde: 1.9, reformiert: 0.18, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.5 },
  { id: 53, nom: 'Bremgarten', npa: '3047', gemeinde: 1.49, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 189, nom: 'Brenzikofen', npa: '3671', gemeinde: 1.86, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 163, nom: 'Brienz', npa: '3855', gemeinde: 1.75, reformiert: 0.23, katholisch: 0.2, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 164, nom: 'Brienzwiler', npa: '3856', gemeinde: 1.64, reformiert: 0.23, katholisch: 0.2, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 311, nom: 'Buchholterberg', npa: '3615', gemeinde: 1.8, reformiert: 0.253, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 83, nom: 'Burgdorf', npa: '3400', gemeinde: 1.63, reformiert: 0.184, katholisch: 0.207, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 1061, nom: 'Burgistein', npa: '3664', gemeinde: 1.95, reformiert: 0.184, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 30, nom: 'Busswil b. M.', npa: '4917', gemeinde: 1.6, reformiert: 0.19, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 228, nom: 'Champoz', npa: '2735', gemeinde: 1.7, reformiert: 0.23, katholisch: 0.23, christkatholik: 0.306, liegenschafft: 1.0 },
  { id: 230, nom: 'Corcelles', npa: '2747', gemeinde: 1.94, reformiert: 0.25, katholisch: 0.207, christkatholik: 0.306, liegenschafft: 1.5 },
  { id: 104, nom: 'Corg\u00e9mont', npa: '2606', gemeinde: 1.79, reformiert: 0.2142, katholisch: 0.197, christkatholik: 0.306, liegenschafft: 1.3 },
  { id: 105, nom: 'Cormoret', npa: '2612', gemeinde: 2.04, reformiert: 0.25, katholisch: 0.197, christkatholik: 0.306, liegenschafft: 1.3 },
  { id: 106, nom: 'Cort\u00e9bert', npa: '2607', gemeinde: 1.99, reformiert: 0.2142, katholisch: 0.197, christkatholik: 0.306, liegenschafft: 1.3 },
  { id: 231, nom: 'Court', npa: '2738', gemeinde: 1.94, reformiert: 0.253, katholisch: 0.23, christkatholik: 0.306, liegenschafft: 1.5 },
  { id: 107, nom: 'Courtelary', npa: '2608', gemeinde: 2.14, reformiert: 0.25, katholisch: 0.197, christkatholik: 0.306, liegenschafft: 1.1 },
  { id: 232, nom: 'Cr\u00e9mines', npa: '2746', gemeinde: 1.94, reformiert: 0.25, katholisch: 0.207, christkatholik: 0.306, liegenschafft: 1.3 },
  { id: 165, nom: 'D\u00e4rligen', npa: '3707', gemeinde: 1.85, reformiert: 0.15, katholisch: 0.207, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 282, nom: 'D\u00e4rstetten', npa: '3763', gemeinde: 1.6, reformiert: 0.16, katholisch: 0.23, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 337, nom: 'D\u00fcrrenroth', npa: '3465', gemeinde: 1.89, reformiert: 0.23, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.25 },
  { id: 131, nom: 'Deisswil b. M.', npa: '3053', gemeinde: 0.89, reformiert: 0.1955, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.3 },
  { id: 283, nom: 'Diemtigen', npa: '3754', gemeinde: 1.8, reformiert: 0.23, katholisch: 0.23, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 70, nom: 'Diessbach b. B.', npa: '3264', gemeinde: 1.8, reformiert: 0.2, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.2 },
  { id: 71, nom: 'Dotzigen', npa: '3293', gemeinde: 1.85, reformiert: 0.2, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.2 },
  { id: 1086, nom: 'Eggiwil', npa: '3537', gemeinde: 1.8, reformiert: 0.184, katholisch: 0.27, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 261, nom: 'Epsach', npa: '3272', gemeinde: 1.7, reformiert: 0.161, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.5 },
  { id: 338, nom: 'Eriswil', npa: '4952', gemeinde: 1.79, reformiert: 0.23, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 312, nom: 'Eriz', npa: '3619', gemeinde: 1.78, reformiert: 0.253, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 116, nom: 'Erlach', npa: '3235', gemeinde: 1.5, reformiert: 0.207, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.2 },
  { id: 284, nom: 'Erlenbach i. S.', npa: '3762', gemeinde: 1.64, reformiert: 0.23, katholisch: 0.23, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 84, nom: 'Ersigen', npa: '3423', gemeinde: 1.7, reformiert: 0.16, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 233, nom: 'Eschert', npa: '2743', gemeinde: 1.94, reformiert: 0.25, katholisch: 0.207, christkatholik: 0.306, liegenschafft: 1.0 },
  { id: 65, nom: 'Evilard (Leubringen)', npa: '2533', gemeinde: 1.52, reformiert: 0.23, katholisch: 0.23, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 313, nom: 'Fahrni', npa: '3617', gemeinde: 1.78, reformiert: 0.2415, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 350, nom: 'Farnern', npa: '4539', gemeinde: 1.79, reformiert: 0.207, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 216, nom: 'Ferenbalm', npa: '3206', gemeinde: 1.75, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 117, nom: 'Finsterhennen', npa: '2577', gemeinde: 1.8, reformiert: 0.23, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.5 },
  { id: 314, nom: 'Forst-L\u00e4ngenb\u00fchl', npa: '3636', gemeinde: 1.7, reformiert: 0.228, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 321, nom: 'Forst-L\u00e4ngenb\u00fchl (L\u00e4ngenb\u00fchl)', npa: '3636', gemeinde: 1.7, reformiert: 0.246, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 134, nom: 'Fraubrunnen', npa: '3312', gemeinde: 1.75, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 133, nom: 'Fraubrunnen (Etzelkofen, M\u00fclchi)', npa: '3312', gemeinde: 1.75, reformiert: 0.185, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 217, nom: 'Frauenkappelen', npa: '3202', gemeinde: 1.6, reformiert: 0.18, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 190, nom: 'Freimettigen', npa: '3510', gemeinde: 1.8, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 156, nom: 'Frutigen', npa: '3714', gemeinde: 1.85, reformiert: 0.21, katholisch: 0.23, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 168, nom: 'G\u00fcndlischwand', npa: '3815', gemeinde: 2.0, reformiert: 0.184, katholisch: 0.207, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 118, nom: 'Gals', npa: '3238', gemeinde: 1.39, reformiert: 0.135, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.2 },
  { id: 119, nom: 'Gampelen', npa: '3236', gemeinde: 1.39, reformiert: 0.135, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.4 },
  { id: 1064, nom: 'Gerzensee', npa: '3115', gemeinde: 1.54, reformiert: 0.207, katholisch: 0.195, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 31, nom: 'Gondiswil', npa: '4955', gemeinde: 1.84, reformiert: 0.19, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 351, nom: 'Graben', npa: '3376', gemeinde: 1.8, reformiert: 0.17, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 234, nom: 'Grandval', npa: '2745', gemeinde: 1.74, reformiert: 0.25, katholisch: 0.207, christkatholik: 0.306, liegenschafft: 1.2 },
  { id: 166, nom: 'Grindelwald', npa: '3818', gemeinde: 1.69, reformiert: 0.184, katholisch: 0.207, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 8, nom: 'Grossaffoltern', npa: '3257', gemeinde: 1.69, reformiert: 0.184, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 191, nom: 'Grossh\u00f6chstetten', npa: '3506', gemeinde: 1.62, reformiert: 0.207, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 207, nom: 'Grossh\u00f6chstetten (Schlosswil)', npa: '3506', gemeinde: 1.62, reformiert: 0.27, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 301, nom: 'Gsteig', npa: '3785', gemeinde: 1.3, reformiert: 0.153, katholisch: 0.1377, christkatholik: 0.23, liegenschafft: 0.8 },
  { id: 167, nom: 'Gsteigwiler', npa: '3814', gemeinde: 1.93, reformiert: 0.184, katholisch: 0.207, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 1056, nom: 'Guggisberg', npa: '3158', gemeinde: 1.89, reformiert: 0.23, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 219, nom: 'Gurbr\u00fc', npa: '3208', gemeinde: 1.9, reformiert: 0.2185, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.4 },
  { id: 1065, nom: 'Gurzelen', npa: '3663', gemeinde: 1.83, reformiert: 0.253, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 292, nom: 'Guttannen', npa: '3864', gemeinde: 1.65, reformiert: 0.23, katholisch: 0.2, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 192, nom: 'H\u00e4utligen', npa: '3510', gemeinde: 1.45, reformiert: 0.207, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 89, nom: 'H\u00f6chstetten', npa: '3429', gemeinde: 1.75, reformiert: 0.22, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 169, nom: 'Habkern', npa: '3804', gemeinde: 1.85, reformiert: 0.23, katholisch: 0.207, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 262, nom: 'Hagneck', npa: '2575', gemeinde: 1.5, reformiert: 0.161, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.5 },
  { id: 85, nom: 'Hasle b. B.', npa: '3415', gemeinde: 1.79, reformiert: 0.22, katholisch: 0.207, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 293, nom: 'Hasliberg', npa: '6085', gemeinde: 2.1, reformiert: 0.23, katholisch: 0.2, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 315, nom: 'Heiligenschwendi', npa: '3625', gemeinde: 1.89, reformiert: 0.2, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 316, nom: 'Heimberg', npa: '3627', gemeinde: 1.6, reformiert: 0.2, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 352, nom: 'Heimenhausen', npa: '3373', gemeinde: 1.55, reformiert: 0.17, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 86, nom: 'Heimiswil', npa: '3412', gemeinde: 1.84, reformiert: 0.23, katholisch: 0.207, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 87, nom: 'Hellsau', npa: '3429', gemeinde: 1.8, reformiert: 0.22, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 193, nom: 'Herbligen', npa: '3671', gemeinde: 1.9, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 263, nom: 'Hermrigen', npa: '3274', gemeinde: 1.8, reformiert: 0.161, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 354, nom: 'Herzogenbuchsee', npa: '3360', gemeinde: 1.65, reformiert: 0.17, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 317, nom: 'Hilterfingen', npa: '3652', gemeinde: 1.55, reformiert: 0.2, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 0.8 },
  { id: 88, nom: 'Hindelbank', npa: '3324', gemeinde: 1.59, reformiert: 0.21, katholisch: 0.207, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 170, nom: 'Hofstetten b. B.', npa: '3858', gemeinde: 1.7, reformiert: 0.23, katholisch: 0.2, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 319, nom: 'Homberg', npa: '3622', gemeinde: 1.84, reformiert: 0.253, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.1 },
  { id: 320, nom: 'Horrenbach-Buchen', npa: '3623', gemeinde: 1.7, reformiert: 0.253, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 3457, nom: 'Horrenbach-Buchen (Schwarzenegg)', npa: '3623', gemeinde: 1.7, reformiert: 0.253, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 339, nom: 'Huttwil', npa: '4950', gemeinde: 1.69, reformiert: 0.2, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 137, nom: 'Iffwil', npa: '3305', gemeinde: 1.4, reformiert: 0.218, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 355, nom: 'Inkwil', npa: '3375', gemeinde: 1.75, reformiert: 0.17, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 294, nom: 'Innertkirchen', npa: '3862', gemeinde: 1.6, reformiert: 0.23, katholisch: 0.2, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 291, nom: 'Innertkirchen (Gadmen)', npa: '3862', gemeinde: 1.6, reformiert: 0.276, katholisch: 0.2, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 120, nom: 'Ins', npa: '3232', gemeinde: 1.63, reformiert: 0.18, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.2 },
  { id: 171, nom: 'Interlaken', npa: '3800', gemeinde: 1.77, reformiert: 0.184, katholisch: 0.207, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 265, nom: 'Ipsach', npa: '2563', gemeinde: 1.59, reformiert: 0.21, katholisch: 0.23, christkatholik: 0.28, liegenschafft: 1.5 },
  { id: 172, nom: 'Iseltwald', npa: '3807', gemeinde: 1.85, reformiert: 0.184, katholisch: 0.207, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 62, nom: 'Ittigen', npa: '3063', gemeinde: 1.23, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.1 },
  { id: 1066, nom: 'Jaberg', npa: '3629', gemeinde: 1.49, reformiert: 0.185, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.0 },
  { id: 136, nom: 'Jegenstorf', npa: '3303', gemeinde: 1.53, reformiert: 0.218, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 146, nom: 'Jegenstorf (Scheunen)', npa: '3303', gemeinde: 1.53, reformiert: 0.185, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 264, nom: 'Jens', npa: '2565', gemeinde: 1.9, reformiert: 0.2, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 55, nom: 'K\u00f6niz', npa: '3098', gemeinde: 1.58, reformiert: 0.23, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 9, nom: 'Kallnach', npa: '3283', gemeinde: 1.45, reformiert: 0.161, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.5 },
  { id: 218, nom: 'Kallnach (Golaten)', npa: '3283', gemeinde: 1.45, reformiert: 0.2185, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 157, nom: 'Kandergrund', npa: '3716', gemeinde: 1.85, reformiert: 0.25, katholisch: 0.23, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 158, nom: 'Kandersteg', npa: '3718', gemeinde: 1.8, reformiert: 0.25, katholisch: 0.23, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 10, nom: 'Kappelen', npa: '3273', gemeinde: 1.6, reformiert: 0.16, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.2 },
  { id: 1067, nom: 'Kaufdorf', npa: '3126', gemeinde: 1.88, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 1068, nom: 'Kehrsatz', npa: '3122', gemeinde: 1.64, reformiert: 0.23, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 90, nom: 'Kernenried', npa: '3309', gemeinde: 1.5, reformiert: 0.16, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 194, nom: 'Kiesen', npa: '3629', gemeinde: 1.54, reformiert: 0.184, katholisch: 0.18, christkatholik: 0.23, liegenschafft: 1.0 },
  { id: 91, nom: 'Kirchberg', npa: '3422', gemeinde: 1.59, reformiert: 0.16, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.3 },
  { id: 1070, nom: 'Kirchdorf', npa: '3116', gemeinde: 1.51, reformiert: 0.185, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.0 },
  { id: 1063, nom: 'Kirchdorf (Gelterfingen)', npa: '3116', gemeinde: 1.51, reformiert: 0.185, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 1073, nom: 'Kirchdorf (M\u00fchledorf)', npa: '3116', gemeinde: 1.51, reformiert: 0.185, katholisch: 0.195, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 1076, nom: 'Kirchdorf (Noflen)', npa: '3116', gemeinde: 1.51, reformiert: 0.185, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.0 },
  { id: 54, nom: 'Kirchlindach', npa: '3038', gemeinde: 1.55, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 195, nom: 'Konolfingen', npa: '3510', gemeinde: 1.59, reformiert: 0.207, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 92, nom: 'Koppigen', npa: '3425', gemeinde: 1.65, reformiert: 0.22, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 159, nom: 'Krattigen', npa: '3704', gemeinde: 1.75, reformiert: 0.25, katholisch: 0.23, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 93, nom: 'Krauchthal', npa: '3326', gemeinde: 1.79, reformiert: 0.195, katholisch: 0.207, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 220, nom: 'Kriechenwil', npa: '3179', gemeinde: 1.79, reformiert: 0.19, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 121, nom: 'L\u00fcscherz', npa: '2576', gemeinde: 1.5, reformiert: 0.184, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.2 },
  { id: 175, nom: 'L\u00fctschental', npa: '3816', gemeinde: 1.5, reformiert: 0.184, katholisch: 0.207, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 340, nom: 'L\u00fctzelfl\u00fch', npa: '3432', gemeinde: 1.74, reformiert: 0.184, katholisch: 0.207, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 108, nom: 'La Ferri\u00e8re', npa: '2333', gemeinde: 1.94, reformiert: 0.253, katholisch: 0.2448, christkatholik: 0.306, liegenschafft: 1.5 },
  { id: 254, nom: 'La Neuveville', npa: '2520', gemeinde: 1.65, reformiert: 0.207, katholisch: 0.138, christkatholik: 0.28, liegenschafft: 1.2 },
  { id: 196, nom: 'Landiswil', npa: '3434', gemeinde: 1.85, reformiert: 0.23, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.3 },
  { id: 34, nom: 'Langenthal', npa: '4900', gemeinde: 1.44, reformiert: 0.1484, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 39, nom: 'Langenthal (Obersteckholz)', npa: '4900', gemeinde: 1.44, reformiert: 0.175, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 1087, nom: 'Langnau i. E.', npa: '3550', gemeinde: 1.94, reformiert: 0.184, katholisch: 0.27, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 302, nom: 'Lauenen', npa: '3782', gemeinde: 1.7, reformiert: 0.23, katholisch: 0.1377, christkatholik: 0.23, liegenschafft: 0.6 },
  { id: 221, nom: 'Laupen', npa: '3177', gemeinde: 1.74, reformiert: 0.19, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 1088, nom: 'Lauperswil', npa: '3438', gemeinde: 1.85, reformiert: 0.184, katholisch: 0.27, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 173, nom: 'Lauterbrunnen', npa: '3822', gemeinde: 1.84, reformiert: 0.23, katholisch: 0.207, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 174, nom: 'Leissigen', npa: '3706', gemeinde: 1.9, reformiert: 0.15, katholisch: 0.207, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 72, nom: 'Lengnau', npa: '2543', gemeinde: 1.49, reformiert: 0.22, katholisch: 0.2415, christkatholik: 0.28, liegenschafft: 1.1 },
  { id: 298, nom: 'Lenk', npa: '3775', gemeinde: 1.79, reformiert: 0.22, katholisch: 0.1377, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 73, nom: 'Leuzigen', npa: '3297', gemeinde: 1.79, reformiert: 0.18, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 266, nom: 'Ligerz', npa: '2514', gemeinde: 1.68, reformiert: 0.1683, katholisch: 0.23, christkatholik: 0.28, liegenschafft: 1.5 },
  { id: 197, nom: 'Linden', npa: '3673', gemeinde: 1.8, reformiert: 0.27, katholisch: 0.19, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 36, nom: 'Lotzwil', npa: '4932', gemeinde: 1.7, reformiert: 0.175, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 235, nom: 'Loveresse', npa: '2732', gemeinde: 1.94, reformiert: 0.23, katholisch: 0.23, christkatholik: 0.306, liegenschafft: 1.1 },
  { id: 11, nom: 'Lyss', npa: '3250', gemeinde: 1.6, reformiert: 0.184, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 3341, nom: 'Lyss (Busswil)', npa: '3250', gemeinde: 1.6, reformiert: 0.2, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 94, nom: 'Lyssach', npa: '3421', gemeinde: 1.39, reformiert: 0.16, katholisch: 0.207, christkatholik: 0.276, liegenschafft: 1.3 },
  { id: 268, nom: 'M\u00f6rigen', npa: '2572', gemeinde: 1.25, reformiert: 0.161, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 222, nom: 'M\u00fchleberg', npa: '3203', gemeinde: 1.4, reformiert: 0.19, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 142, nom: 'M\u00fcnchenbuchsee', npa: '3053', gemeinde: 1.64, reformiert: 0.1955, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 223, nom: 'M\u00fcnchenwiler', npa: '1797', gemeinde: 1.5, reformiert: 0.207, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 199, nom: 'M\u00fcnsingen', npa: '3110', gemeinde: 1.58, reformiert: 0.184, katholisch: 0.18, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 122, nom: 'M\u00fcntschemier', npa: '3225', gemeinde: 1.79, reformiert: 0.18, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.2 },
  { id: 37, nom: 'Madiswil', npa: '4934', gemeinde: 1.65, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 3342, nom: 'Madiswil (Kleindietwil, Leimiswil)', npa: '4934', gemeinde: 1.65, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 176, nom: 'Matten b. I.', npa: '3800', gemeinde: 1.88, reformiert: 0.184, katholisch: 0.207, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 139, nom: 'Mattstetten', npa: '3322', gemeinde: 1.48, reformiert: 0.218, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 74, nom: 'Meienried', npa: '3294', gemeinde: 1.0, reformiert: 0.197, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 12, nom: 'Meikirch', npa: '3045', gemeinde: 1.54, reformiert: 0.195, katholisch: 0.19, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 75, nom: 'Meinisberg', npa: '2554', gemeinde: 1.95, reformiert: 0.22, katholisch: 0.2415, christkatholik: 0.28, liegenschafft: 1.2 },
  { id: 295, nom: 'Meiringen', npa: '3860', gemeinde: 1.8, reformiert: 0.23, katholisch: 0.2, christkatholik: 0.23, liegenschafft: 1.3 },
  { id: 38, nom: 'Melchnau', npa: '4917', gemeinde: 1.74, reformiert: 0.19, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 267, nom: 'Merzligen', npa: '3274', gemeinde: 1.45, reformiert: 0.2, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 0.6 },
  { id: 198, nom: 'Mirchel', npa: '3532', gemeinde: 1.79, reformiert: 0.207, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 110, nom: 'Mont-Tramelan', npa: '2723', gemeinde: 2.04, reformiert: 0.25, katholisch: 0.25, christkatholik: 0.306, liegenschafft: 1.3 },
  { id: 140, nom: 'Moosseedorf', npa: '3302', gemeinde: 1.38, reformiert: 0.1955, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 238, nom: 'Moutier', npa: '2740', gemeinde: 1.94, reformiert: 0.23, katholisch: 0.207, christkatholik: 0.306, liegenschafft: 1.5 },
  { id: 56, nom: 'Muri', npa: '3074', gemeinde: 1.14, reformiert: 0.176, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 0.7 },
  { id: 224, nom: 'Neuenegg', npa: '3176', gemeinde: 1.49, reformiert: 0.1725, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 269, nom: 'Nidau', npa: '2560', gemeinde: 1.7, reformiert: 0.21, katholisch: 0.23, christkatholik: 0.28, liegenschafft: 1.5 },
  { id: 357, nom: 'Nieder\u00f6nz', npa: '3362', gemeinde: 1.65, reformiert: 0.17, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 356, nom: 'Niederbipp', npa: '4704', gemeinde: 1.65, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.3 },
  { id: 371, nom: 'Niederbipp (Wolfisberg)', npa: '4704', gemeinde: 1.65, reformiert: 0.207, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.3 },
  { id: 200, nom: 'Niederh\u00fcnigen', npa: '3504', gemeinde: 1.7, reformiert: 0.207, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 1075, nom: 'Niedermuhlern', npa: '3087', gemeinde: 1.79, reformiert: 0.275, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 177, nom: 'Niederried b. I.', npa: '3853', gemeinde: 1.94, reformiert: 0.19, katholisch: 0.207, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 255, nom: 'Nods', npa: '2518', gemeinde: 1.64, reformiert: 0.23, katholisch: 0.138, christkatholik: 0.28, liegenschafft: 1.5 },
  { id: 57, nom: 'Oberbalm', npa: '3096', gemeinde: 1.75, reformiert: 0.23, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.4 },
  { id: 358, nom: 'Oberbipp', npa: '4538', gemeinde: 1.59, reformiert: 0.207, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 97, nom: 'Oberburg', npa: '3414', gemeinde: 1.88, reformiert: 0.242, katholisch: 0.207, christkatholik: 0.276, liegenschafft: 1.1 },
  { id: 202, nom: 'Oberdiessbach', npa: '3672', gemeinde: 1.64, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.23, liegenschafft: 1.1 },
  { id: 212, nom: 'Oberh\u00fcnigen', npa: '3504', gemeinde: 1.88, reformiert: 0.27, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.3 },
  { id: 322, nom: 'Oberhofen', npa: '3653', gemeinde: 1.54, reformiert: 0.2, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.0 },
  { id: 323, nom: 'Oberlangenegg', npa: '3616', gemeinde: 1.95, reformiert: 0.253, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.3 },
  { id: 178, nom: 'Oberried a. Br.-S.', npa: '3854', gemeinde: 1.94, reformiert: 0.23, katholisch: 0.2, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 203, nom: 'Oberthal', npa: '3531', gemeinde: 1.87, reformiert: 0.207, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 76, nom: 'Oberwil b. B.', npa: '3298', gemeinde: 1.87, reformiert: 0.18, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 0.8 },
  { id: 287, nom: 'Oberwil i. S.', npa: '3765', gemeinde: 1.64, reformiert: 0.23, katholisch: 0.23, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 360, nom: 'Ochlenberg', npa: '3367', gemeinde: 1.6, reformiert: 0.17, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 40, nom: 'Oeschenbach', npa: '4943', gemeinde: 2.0, reformiert: 0.23, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 205, nom: 'Oppligen', npa: '3629', gemeinde: 1.5, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 270, nom: 'Orpund', npa: '2552', gemeinde: 1.85, reformiert: 0.19, katholisch: 0.23, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 111, nom: 'Orvin', npa: '2534', gemeinde: 1.88, reformiert: 0.18, katholisch: 0.23, christkatholik: 0.306, liegenschafft: 1.2 },
  { id: 63, nom: 'Ostermundigen', npa: '3072', gemeinde: 1.69, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 112, nom: 'P\u00e9ry-La Heutte', npa: '2603', gemeinde: 1.55, reformiert: 0.18, katholisch: 0.23, christkatholik: 0.306, liegenschafft: 1.2 },
  { id: 239, nom: 'Perrefitte', npa: '2742', gemeinde: 2.0, reformiert: 0.23, katholisch: 0.207, christkatholik: 0.306, liegenschafft: 1.2 },
  { id: 249, nom: 'Petit-Val', npa: '2748', gemeinde: 1.79, reformiert: 0.32, katholisch: 0.2415, christkatholik: 0.306, liegenschafft: 1.2 },
  { id: 2887, nom: 'Petit-Val (Fornet-Dessous)', npa: '2748', gemeinde: 1.79, reformiert: 0.32, katholisch: 0.3116, christkatholik: 0.306, liegenschafft: 1.2 },
  { id: 77, nom: 'Pieterlen', npa: '2542', gemeinde: 1.75, reformiert: 0.22, katholisch: 0.2415, christkatholik: 0.28, liegenschafft: 1.2 },
  { id: 252, nom: 'Plateau de Diesse', npa: '2517', gemeinde: 1.85, reformiert: 0.184, katholisch: 0.138, christkatholik: 0.28, liegenschafft: 1.3 },
  { id: 324, nom: 'Pohlern', npa: '3638', gemeinde: 1.72, reformiert: 0.23, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.0 },
  { id: 271, nom: 'Port', npa: '2562', gemeinde: 1.69, reformiert: 0.21, katholisch: 0.23, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 1089, nom: 'R\u00f6thenbach i. E.', npa: '3538', gemeinde: 2.0, reformiert: 0.23, katholisch: 0.27, christkatholik: 0.276, liegenschafft: 1.3 },
  { id: 304, nom: 'R\u00fcderswil', npa: '3437', gemeinde: 1.74, reformiert: 0.184, katholisch: 0.27, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 99, nom: 'R\u00fcdtligen-Alchenfl\u00fch', npa: '3422', gemeinde: 1.45, reformiert: 0.16, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 1078, nom: 'R\u00fceggisberg', npa: '3088', gemeinde: 1.85, reformiert: 0.265, katholisch: 0.195, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 341, nom: 'R\u00fcegsau', npa: '3417', gemeinde: 1.79, reformiert: 0.16, katholisch: 0.207, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 1057, nom: 'R\u00fcschegg', npa: '3153', gemeinde: 1.74, reformiert: 0.207, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 78, nom: 'R\u00fcti b. B.', npa: '3295', gemeinde: 1.85, reformiert: 0.279, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 101, nom: 'R\u00fcti b. L.', npa: '3421', gemeinde: 1.79, reformiert: 0.16, katholisch: 0.207, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 45, nom: 'R\u00fctschelen', npa: '4933', gemeinde: 1.6, reformiert: 0.175, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 14, nom: 'Radelfingen', npa: '3271', gemeinde: 1.69, reformiert: 0.23, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.3 },
  { id: 15, nom: 'Rapperswil', npa: '3255', gemeinde: 1.68, reformiert: 0.1955, katholisch: 0.19, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 144, nom: 'Rapperswil (Ruppoldsried)', npa: '3255', gemeinde: 1.68, reformiert: 0.185, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 251, nom: 'Reb\u00e9velier', npa: '2717', gemeinde: 2.0, reformiert: 0.32, katholisch: 0.3116, christkatholik: 0.306, liegenschafft: 1.2 },
  { id: 241, nom: 'Reconvilier', npa: '2732', gemeinde: 1.97, reformiert: 0.23, katholisch: 0.23, christkatholik: 0.306, liegenschafft: 1.5 },
  { id: 2880, nom: 'Reichenbach (Wengi, Schwandi)', npa: '3713', gemeinde: 1.77, reformiert: 0.21, katholisch: 0.23, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 160, nom: 'Reichenbach i. K.', npa: '3713', gemeinde: 1.77, reformiert: 0.23, katholisch: 0.23, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 41, nom: 'Reisiswil', npa: '4919', gemeinde: 1.79, reformiert: 0.19, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 1049, nom: 'Renan', npa: '2616', gemeinde: 2.04, reformiert: 0.306, katholisch: 0.197, christkatholik: 0.306, liegenschafft: 1.5 },
  { id: 288, nom: 'Reutigen', npa: '3647', gemeinde: 1.75, reformiert: 0.23, katholisch: 0.23, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 3463, nom: 'Reutigen (Zwieselberg)', npa: '3647', gemeinde: 1.75, reformiert: 0.246, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 1077, nom: 'Riggisberg', npa: '3132', gemeinde: 1.8, reformiert: 0.207, katholisch: 0.195, christkatholik: 0.276, liegenschafft: 1.4 },
  { id: 1079, nom: 'Riggisberg (R\u00fcmligen)', npa: '3132', gemeinde: 1.8, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.4 },
  { id: 179, nom: 'Ringgenberg', npa: '3852', gemeinde: 1.8, reformiert: 0.19, katholisch: 0.207, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 242, nom: 'Roches', npa: '2762', gemeinde: 1.94, reformiert: 0.23, katholisch: 0.207, christkatholik: 0.306, liegenschafft: 1.1 },
  { id: 42, nom: 'Roggwil', npa: '4914', gemeinde: 1.61, reformiert: 0.19, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 43, nom: 'Rohrbach', npa: '4938', gemeinde: 1.35, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.1 },
  { id: 44, nom: 'Rohrbachgraben', npa: '4938', gemeinde: 1.94, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 1050, nom: 'Romont', npa: '2538', gemeinde: 1.6, reformiert: 0.18, katholisch: 0.23, christkatholik: 0.306, liegenschafft: 1.1 },
  { id: 206, nom: 'Rubigen', npa: '3113', gemeinde: 1.44, reformiert: 0.184, katholisch: 0.18, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 100, nom: 'Rumendingen', npa: '3472', gemeinde: 1.0, reformiert: 0.207, katholisch: 0.207, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 362, nom: 'Rumisberg', npa: '4539', gemeinde: 1.89, reformiert: 0.207, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 303, nom: 'Saanen', npa: '3792', gemeinde: 1.1, reformiert: 0.153, katholisch: 0.1377, christkatholik: 0.23, liegenschafft: 0.5 },
  { id: 272, nom: 'Safnern', npa: '2553', gemeinde: 1.4, reformiert: 0.19, katholisch: 0.23, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 243, nom: 'Saicourt', npa: '2732', gemeinde: 1.95, reformiert: 0.23, katholisch: 0.23, christkatholik: 0.306, liegenschafft: 1.4 },
  { id: 1051, nom: 'Saint-Imier', npa: '2610', gemeinde: 1.75, reformiert: 0.256, katholisch: 0.197, christkatholik: 0.306, liegenschafft: 1.2 },
  { id: 1048, nom: 'Sauge', npa: '2536', gemeinde: 1.9, reformiert: 0.18, katholisch: 0.23, christkatholik: 0.306, liegenschafft: 1.25 },
  { id: 244, nom: 'Saules', npa: '2732', gemeinde: 1.94, reformiert: 0.23, katholisch: 0.23, christkatholik: 0.306, liegenschafft: 1.4 },
  { id: 180, nom: 'Saxeten', npa: '3813', gemeinde: 1.69, reformiert: 0.184, katholisch: 0.207, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 16, nom: 'Sch\u00fcpfen', npa: '3054', gemeinde: 1.74, reformiert: 0.21, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 305, nom: 'Schangnau', npa: '6197', gemeinde: 2.1, reformiert: 0.23, katholisch: 0.27, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 296, nom: 'Schattenhalb', npa: '3860', gemeinde: 1.94, reformiert: 0.23, katholisch: 0.2, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 245, nom: 'Schelten', npa: '2827', gemeinde: 2.2, reformiert: 0.23, katholisch: 0.2764, christkatholik: 0.306, liegenschafft: 1.5 },
  { id: 273, nom: 'Scheuren', npa: '2556', gemeinde: 1.78, reformiert: 0.19, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.2 },
  { id: 274, nom: 'Schwadernau', npa: '2556', gemeinde: 1.85, reformiert: 0.2, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 181, nom: 'Schwanden b. B.', npa: '3855', gemeinde: 1.75, reformiert: 0.23, katholisch: 0.2, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 1058, nom: 'Schwarzenburg', npa: '3150', gemeinde: 1.86, reformiert: 0.23, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.4 },
  { id: 46, nom: 'Schwarzh\u00e4usern', npa: '4911', gemeinde: 1.6, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 363, nom: 'Seeberg', npa: '3365', gemeinde: 1.75, reformiert: 0.23, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 25, nom: 'Seedorf', npa: '3267', gemeinde: 1.74, reformiert: 0.207, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 246, nom: 'Seehof', npa: '2747', gemeinde: 1.74, reformiert: 0.23, katholisch: 0.322, christkatholik: 0.306, liegenschafft: 1.2 },
  { id: 1081, nom: 'Seftigen', npa: '3662', gemeinde: 1.74, reformiert: 0.253, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.0 },
  { id: 306, nom: 'Signau', npa: '3534', gemeinde: 1.94, reformiert: 0.184, katholisch: 0.27, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 326, nom: 'Sigriswil', npa: '3655', gemeinde: 1.66, reformiert: 0.184, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 2883, nom: 'Sigriswil (Reust)', npa: '3655', gemeinde: 1.66, reformiert: 0.253, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 123, nom: 'Siselen', npa: '2577', gemeinde: 1.8, reformiert: 0.23, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.2 },
  { id: 1052, nom: 'Sonceboz-Sombeval', npa: '2605', gemeinde: 1.72, reformiert: 0.202, katholisch: 0.197, christkatholik: 0.306, liegenschafft: 1.1 },
  { id: 1053, nom: 'Sonvilier', npa: '2615', gemeinde: 2.07, reformiert: 0.23, katholisch: 0.197, christkatholik: 0.306, liegenschafft: 1.16 },
  { id: 248, nom: 'Sorvilier', npa: '2736', gemeinde: 1.8, reformiert: 0.253, katholisch: 0.23, christkatholik: 0.306, liegenschafft: 1.5 },
  { id: 289, nom: 'Spiez', npa: '3700', gemeinde: 1.65, reformiert: 0.174, katholisch: 0.23, christkatholik: 0.23, liegenschafft: 0.9 },
  { id: 299, nom: 'St. Stephan', npa: '3772', gemeinde: 1.84, reformiert: 0.23, katholisch: 0.1377, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 327, nom: 'Steffisburg', npa: '3612', gemeinde: 1.62, reformiert: 0.2415, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 325, nom: 'Steffisburg (Schwendibach)', npa: '3612', gemeinde: 1.62, reformiert: 0.207, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 58, nom: 'Stettlen', npa: '3066', gemeinde: 1.57, reformiert: 0.207, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 318, nom: 'Stocken-H\u00f6fen', npa: '3632', gemeinde: 1.79, reformiert: 0.246, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 286, nom: 'Stocken-H\u00f6fen (Ober-/Niederstocken)', npa: '3632', gemeinde: 1.79, reformiert: 0.23, katholisch: 0.23, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 275, nom: 'Studen', npa: '2557', gemeinde: 1.72, reformiert: 0.2, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 342, nom: 'Sumiswald', npa: '3454', gemeinde: 1.79, reformiert: 0.23, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 2884, nom: 'Sumiswald (Wasen)', npa: '3454', gemeinde: 1.79, reformiert: 0.2301, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 276, nom: 'Sutz-Lattrigen', npa: '2572', gemeinde: 1.7, reformiert: 0.23, katholisch: 0.23, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 277, nom: 'T\u00e4uffelen', npa: '2575', gemeinde: 1.59, reformiert: 0.161, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.25 },
  { id: 250, nom: 'Tavannes', npa: '2710', gemeinde: 1.92, reformiert: 0.23, katholisch: 0.23, christkatholik: 0.306, liegenschafft: 1.5 },
  { id: 328, nom: 'Teuffenthal', npa: '3623', gemeinde: 1.8, reformiert: 0.253, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 364, nom: 'Th\u00f6rigen', npa: '3367', gemeinde: 1.75, reformiert: 0.17, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 329, nom: 'Thierachern', npa: '3634', gemeinde: 1.81, reformiert: 0.2, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 330, nom: 'Thun', npa: '3600', gemeinde: 1.66, reformiert: 0.207, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 47, nom: 'Thunstetten', npa: '4922', gemeinde: 1.7, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 1071, nom: 'Thurnen', npa: '3127', gemeinde: 1.85, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.4 },
  { id: 1072, nom: 'Thurnen (Lohnstorf, M\u00fchlethurnen)', npa: '3127', gemeinde: 1.85, reformiert: 0.184, katholisch: 0.195, christkatholik: 0.276, liegenschafft: 1.4 },
  { id: 1082, nom: 'Toffen', npa: '3125', gemeinde: 1.6, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 343, nom: 'Trachselwald', npa: '3456', gemeinde: 1.88, reformiert: 0.23, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 1054, nom: 'Tramelan', npa: '2720', gemeinde: 1.94, reformiert: 0.25, katholisch: 0.25, christkatholik: 0.306, liegenschafft: 1.3 },
  { id: 124, nom: 'Treiten', npa: '3226', gemeinde: 1.4, reformiert: 0.18, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 307, nom: 'Trub', npa: '3556', gemeinde: 1.84, reformiert: 0.23, katholisch: 0.27, christkatholik: 0.276, liegenschafft: 1.4 },
  { id: 2885, nom: 'Trub (Kr\u00f6schenbrunnen)', npa: '3556', gemeinde: 1.84, reformiert: 0.184, katholisch: 0.27, christkatholik: 0.276, liegenschafft: 1.4 },
  { id: 308, nom: 'Trubschachen', npa: '3555', gemeinde: 1.99, reformiert: 0.184, katholisch: 0.27, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 125, nom: 'Tschugg', npa: '3233', gemeinde: 1.59, reformiert: 0.207, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.0 },
  { id: 279, nom: 'Twann-T\u00fcscherz', npa: '2513', gemeinde: 1.65, reformiert: 0.1683, katholisch: 0.23, christkatholik: 0.28, liegenschafft: 1.5 },
  { id: 331, nom: 'Uebeschi', npa: '3635', gemeinde: 1.9, reformiert: 0.2, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 332, nom: 'Uetendorf', npa: '3661', gemeinde: 1.48, reformiert: 0.2, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.1 },
  { id: 333, nom: 'Unterlangenegg', npa: '3614', gemeinde: 1.85, reformiert: 0.253, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.0 },
  { id: 182, nom: 'Unterseen', npa: '3800', gemeinde: 1.7, reformiert: 0.184, katholisch: 0.207, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 49, nom: 'Ursenbach', npa: '4937', gemeinde: 1.75, reformiert: 0.23, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 147, nom: 'Urtenen-Sch\u00f6nb\u00fchl', npa: '3322', gemeinde: 1.5, reformiert: 0.218, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 1083, nom: 'Uttigen', npa: '3628', gemeinde: 1.63, reformiert: 0.185, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.0 },
  { id: 148, nom: 'Utzenstorf', npa: '3427', gemeinde: 1.72, reformiert: 0.19, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 227, nom: 'Valbirse', npa: '2735', gemeinde: 2.0, reformiert: 0.23, katholisch: 0.23, christkatholik: 0.306, liegenschafft: 1.5 },
  { id: 59, nom: 'Vechigen', npa: '3067', gemeinde: 1.54, reformiert: 0.197, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 114, nom: 'Villeret', npa: '2613', gemeinde: 1.79, reformiert: 0.2185, katholisch: 0.197, christkatholik: 0.306, liegenschafft: 1.3 },
  { id: 126, nom: 'Vinelz', npa: '3234', gemeinde: 1.69, reformiert: 0.184, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.2 },
  { id: 334, nom: 'Wachseldorn', npa: '3618', gemeinde: 1.84, reformiert: 0.253, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 3034, nom: 'Wald', npa: '3086', gemeinde: 1.59, reformiert: 0.275, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.3 },
  { id: 209, nom: 'Walkringen', npa: '3512', gemeinde: 1.87, reformiert: 0.276, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.1 },
  { id: 365, nom: 'Walliswil b. N.', npa: '3380', gemeinde: 0.9, reformiert: 0.184, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 366, nom: 'Walliswil b. W.', npa: '3377', gemeinde: 1.5, reformiert: 0.1955, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 280, nom: 'Walperswil', npa: '3272', gemeinde: 1.65, reformiert: 0.1836, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 0.6 },
  { id: 344, nom: 'Walterswil', npa: '4942', gemeinde: 1.86, reformiert: 0.23, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 367, nom: 'Wangen a. A.', npa: '3380', gemeinde: 1.63, reformiert: 0.1955, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 1084, nom: 'Wattenwil', npa: '3665', gemeinde: 1.94, reformiert: 0.228, katholisch: 0.195, christkatholik: 0.23, liegenschafft: 1.2 },
  { id: 79, nom: 'Wengi', npa: '3251', gemeinde: 1.85, reformiert: 0.1955, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.1 },
  { id: 3033, nom: 'Wichtrach', npa: '3114', gemeinde: 1.64, reformiert: 0.184, katholisch: 0.18, christkatholik: 0.23, liegenschafft: 1.0 },
  { id: 370, nom: 'Wiedlisbach', npa: '4537', gemeinde: 1.82, reformiert: 0.207, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 149, nom: 'Wiggiswil', npa: '3053', gemeinde: 1.4, reformiert: 0.1955, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 183, nom: 'Wilderswil', npa: '3812', gemeinde: 1.69, reformiert: 0.184, katholisch: 0.207, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 150, nom: 'Wiler b. U.', npa: '3428', gemeinde: 1.7, reformiert: 0.19, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 225, nom: 'Wileroltigen', npa: '3207', gemeinde: 1.6, reformiert: 0.2185, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 102, nom: 'Willadingen', npa: '3425', gemeinde: 1.59, reformiert: 0.22, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 290, nom: 'Wimmis', npa: '3752', gemeinde: 1.57, reformiert: 0.23, katholisch: 0.23, christkatholik: 0.23, liegenschafft: 1.5 },
  { id: 60, nom: 'Wohlen', npa: '3033', gemeinde: 1.54, reformiert: 0.1955, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 210, nom: 'Worb', npa: '3076', gemeinde: 1.7, reformiert: 0.23, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.3 },
  { id: 281, nom: 'Worben', npa: '3252', gemeinde: 1.7, reformiert: 0.2, katholisch: 0.2, christkatholik: 0.28, liegenschafft: 1.2 },
  { id: 50, nom: 'Wynau', npa: '4923', gemeinde: 1.8, reformiert: 0.2, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 103, nom: 'Wynigen', npa: '3472', gemeinde: 1.75, reformiert: 0.207, katholisch: 0.207, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 345, nom: 'Wyssachen', npa: '4954', gemeinde: 1.9, reformiert: 0.23, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.5 },
  { id: 211, nom: 'Z\u00e4ziwil', npa: '3532', gemeinde: 1.89, reformiert: 0.207, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.3 },
  { id: 152, nom: 'Zielebach', npa: '4564', gemeinde: 1.5, reformiert: 0.19, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.2 },
  { id: 61, nom: 'Zollikofen', npa: '3052', gemeinde: 1.4, reformiert: 0.185, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 153, nom: 'Zuzwil', npa: '3303', gemeinde: 1.64, reformiert: 0.218, katholisch: 0.19, christkatholik: 0.276, liegenschafft: 1.0 },
  { id: 300, nom: 'Zweisimmen', npa: '3770', gemeinde: 1.8, reformiert: 0.195, katholisch: 0.1377, christkatholik: 0.23, liegenschafft: 1.5 },
];

// ----------------------------------------------------------------------------
// DÉDUCTIONS ICC BE 2025 (ModuleConstantsNp.java case BE)
// ----------------------------------------------------------------------------

const DEDUCTIONS_BE = {
  // Enfants
  kinderabzug: 8300,           // par enfant
  kinderabzugEinkommenMax: 24000, // revenu max enfant déductible
  kinderbetreuungMax: 16000,    // frais garde max
  kinderbetreuungAlterMax: 14,  // âge max garde

  // Situation familiale
  abzugEhegatten: 10600,        // déduction couple (revenu)
  abzugAlleinerziehend: 5300,   // monoparental
  abzugEinzelperson: 5300,      // célibataire
  ubpAbzug: 4800,               // personne à charge

  // Fortune
  fortuneDeductionSeul: 0,      // déduction fortune célibataire
  fortuneDeductionCouple: 18000, // déduction fortune couple
  fortuneDeductionEnfant: 18000, // déduction fortune par enfant mineur

  // Assurances (VP)
  vpMariéAvec2p: 4900,          // couple avec cotisations 2e/3e pilier
  vpMariéSans2p: 7200,          // couple sans cotisations
  vpSeulAvec2p: 2450,           // célibataire avec cotisations
  vpSeulSans2p: 3600,           // célibataire sans cotisations
  vpEnfant: 700,                // par enfant

  // Frais professionnels
  transportMax: 7000,           // IUtcConstNP$BE
  formationMax: 12500,          // frais formation/perfectionnement

  // Pilier 3a (fédéral, identique tous cantons)
  pilier3aMax: 7258,            // salarié avec 2e pilier
  pilier3aMaxSE: 36288,         // indépendant plafond
  pilier3aTauxSE: 0.20,         // indépendant taux max 20%

  // Dons / ZVA
  zvaMax: 9500,                 // plafond dons
  zvaTaux: 0.02,                // taux minimum (2%)

  // Dons partis politiques
  partiPolitiqueMaxCouple: 10600,
  partiPolitiqueMaxSeul: 5300,
};

// ----------------------------------------------------------------------------
// FONCTIONS DE CALCUL
// ----------------------------------------------------------------------------

/**
 * Calcule l'impôt simple depuis un barème (base + taux marginal)
 * Même logique que AbstractEinkommenBetragTarif.java
 */
function calculerImpotSimple(revenuImposable, tarif) {
  if (revenuImposable <= 0) return 0;
  const rev = Math.floor(revenuImposable); // arrondi à l'unité
  let tranche = tarif[0];
  for (let i = tarif.length - 1; i >= 0; i--) {
    if (rev >= tarif[i].seuil) {
      tranche = tarif[i];
      break;
    }
  }
  return tranche.base + (rev - tranche.seuil) * tranche.taux;
}

/**
 * Calcule l'impôt fortune
 * Fortune minimum imposable: 36 000 CHF
 */
function calculerImpotFortune(fortune) {
  if (fortune <= 36000) return 0;
  return calculerImpotSimple(fortune, TARIF_BE_3_FORTUNE);
}

/**
 * Arrondi CHF à 5 centimes (pratique fiscale bernoise)
 */
function arrondi5ct(montant) {
  return Math.round(montant * 20) / 20;
}

/**
 * Calcule la déduction VP (assurances)
 * @param {boolean} estMarié
 * @param {boolean} aDeuxiemePilier
 * @param {number} nbEnfants
 */
function calculerDeductionVP(estMarié, aDeuxiemePilier, nbEnfants) {
  let base = estMarié
    ? (aDeuxiemePilier ? DEDUCTIONS_BE.vpMariéAvec2p : DEDUCTIONS_BE.vpMariéSans2p)
    : (aDeuxiemePilier ? DEDUCTIONS_BE.vpSeulAvec2p : DEDUCTIONS_BE.vpSeulSans2p);
  return base + (nbEnfants * DEDUCTIONS_BE.vpEnfant);
}

// ----------------------------------------------------------------------------
// FONCTION PRINCIPALE
// ----------------------------------------------------------------------------

/**
 * Calcule la déclaration BE 2025
 *
 * @param {Object} data
 * @param {number} data.communeId       - ID commune (depuis COMMUNES_BE)
 * @param {boolean} data.estMarié       - true si marié/partenariat enregistré
 * @param {number} data.revenuBrut      - revenu brut total
 * @param {number} data.deductions      - déductions salariales (frais prof, etc.)
 * @param {number} data.fortune         - fortune nette
 * @param {number} data.nbEnfants       - nombre d'enfants à charge
 * @param {boolean} data.aDeuxiemePilier - a des cotisations 2e/3e pilier
 * @param {number} data.pilier3a        - versements pilier 3a
 * @param {number} data.dons            - dons à des institutions reconnues
 * @param {number} data.fraisGarde      - frais de garde d'enfants
 * @param {number} data.fraisMaladie    - frais maladie non remboursés
 * @param {string} data.confession      - "reformiert"|"katholisch"|"christkatholik"|"keine"
 * @param {number} data.loyerValeurLocative - valeur locative immeuble
 * @param {number} data.interetsDettes  - intérêts passifs (dettes)
 * @returns {Object} résultat complet
 */
function calculerDeclarationBE(data) {
  const {
    communeId,
    estMarié = false,
    revenuBrut = 0,
    deductions = 0,
    fortune = 0,
    nbEnfants = 0,
    aDeuxiemePilier = true,
    pilier3a = 0,
    dons = 0,
    fraisGarde = 0,
    fraisMaladie = 0,
    confession = "keine",
    loyerValeurLocative = 0,
    interetsDettes = 0,
  } = data;

  // --- Trouver la commune ---
  const commune = COMMUNES_BE.find(c => c.id === communeId);
  if (!commune) throw new Error(`Commune BE introuvable: ${communeId}`);

  // --- 1. REVENU NET IMPOSABLE ---
  let revenuNet = revenuBrut
    - deductions
    - Math.min(pilier3a, DEDUCTIONS_BE.pilier3aMax)
    + loyerValeurLocative
    - interetsDettes;

  // Déductions sociales
  const deductionVP = calculerDeductionVP(estMarié, aDeuxiemePilier, nbEnfants);
  revenuNet -= deductionVP;

  // Frais de garde enfants
  if (nbEnfants > 0) {
    revenuNet -= Math.min(fraisGarde, DEDUCTIONS_BE.kinderbetreuungMax);
  }

  // Frais maladie (franchise 5% du revenu net)
  const franchiseMaladie = revenuNet * 0.05;
  if (fraisMaladie > franchiseMaladie) {
    revenuNet -= (fraisMaladie - franchiseMaladie);
  }

  // Dons (ZVA) — min 2% du revenu net, plafond 9500 CHF
  const donsDeductibles = Math.min(dons, DEDUCTIONS_BE.zvaMax);
  revenuNet -= donsDeductibles;

  // Déductions enfants ICC
  revenuNet -= nbEnfants * DEDUCTIONS_BE.kinderabzug;

  // Déduction situation familiale
  if (estMarié) {
    revenuNet -= DEDUCTIONS_BE.abzugEhegatten; // 10 600 CHF
  } else {
    revenuNet -= DEDUCTIONS_BE.abzugEinzelperson; // 5 300 CHF
  }

  revenuNet = Math.max(0, Math.floor(revenuNet));

  // --- 2. IMPÔT SIMPLE REVENU ---
  const tarif = estMarié ? TARIF_BE_2 : TARIF_BE_1;
  const impotSimpleRevenu = calculerImpotSimple(revenuNet, tarif);

  // --- 3. IMPÔT CANTONAL REVENU ---
  // ICC = impôt simple × Steuerfuss Etat (2.975)
  const impotCantonalRevenu = arrondi5ct(impotSimpleRevenu * STEUERFUSS_ETAT_BE);

  // --- 4. IMPÔT COMMUNAL REVENU ---
  const impotCommunalRevenu = arrondi5ct(impotSimpleRevenu * commune.gemeinde);

  // --- 5. IMPÔT ÉGLISE ---
  let impotEglise = 0;
  if (confession === "reformiert") {
    impotEglise = arrondi5ct(impotSimpleRevenu * commune.reformiert);
  } else if (confession === "katholisch") {
    impotEglise = arrondi5ct(impotSimpleRevenu * commune.katholisch);
  } else if (confession === "christkatholik") {
    impotEglise = arrondi5ct(impotSimpleRevenu * commune.christkatholik);
  }

  // --- 6. FORTUNE NETTE IMPOSABLE ---
  let fortuneImposable = fortune;
  if (estMarié) {
    fortuneImposable -= DEDUCTIONS_BE.fortuneDeductionCouple; // 18 000
  }
  fortuneImposable -= nbEnfants * DEDUCTIONS_BE.fortuneDeductionEnfant; // 18 000/enfant
  fortuneImposable = Math.max(0, Math.floor(fortuneImposable));

  // --- 7. IMPÔT FORTUNE ---
  const impotSimpleFortune = calculerImpotFortune(fortuneImposable);
  const impotCantonalFortune = arrondi5ct(impotSimpleFortune * STEUERFUSS_ETAT_BE);
  const impotCommunalFortune = arrondi5ct(impotSimpleFortune * commune.gemeinde);

  // --- 8. IFD (Impôt Fédéral Direct) ---
  // IFD BE: mêmes barèmes fédéraux que les autres cantons
  // Barèmes fédéraux 2025 (LIFD)
  const IFD_TARIF_SEUL = [
    { seuil: 0, base: 0, taux: 0 },
    { seuil: 14500, base: 0, taux: 0.0077 },
    { seuil: 31600, base: 131.65, taux: 0.0088 },
    { seuil: 41400, base: 217.9, taux: 0.026 },
    { seuil: 55200, base: 576.5, taux: 0.033 },
    { seuil: 72500, base: 1147.5, taux: 0.044 },
    { seuil: 78100, base: 1394.3, taux: 0.055 },
    { seuil: 103600, base: 2796.8, taux: 0.065 },
    { seuil: 134600, base: 4811.8, taux: 0.088 },
    { seuil: 176000, base: 8453.0, taux: 0.11 },
    { seuil: 755200, base: 72227.0, taux: 0.115 },
  ];
  const IFD_TARIF_MARIE = [
    { seuil: 0, base: 0, taux: 0 },
    { seuil: 28300, base: 0, taux: 0.01 },
    { seuil: 50900, base: 226.0, taux: 0.02 },
    { seuil: 58400, base: 376.0, taux: 0.03 },
    { seuil: 75300, base: 883.0, taux: 0.04 },
    { seuil: 90300, base: 1483.0, taux: 0.05 },
    { seuil: 103400, base: 2138.0, taux: 0.06 },
    { seuil: 114700, base: 2816.0, taux: 0.07 },
    { seuil: 124200, base: 3481.0, taux: 0.08 },
    { seuil: 131700, base: 4081.0, taux: 0.09 },
    { seuil: 141200, base: 4936.0, taux: 0.10 },
    { seuil: 159200, base: 6736.0, taux: 0.115 },
  ];

  // Revenu net IFD (déductions légèrement différentes)
  let revenuNetIFD = revenuNet; // simplification — à affiner
  const tarifdIFD = estMarié ? IFD_TARIF_MARIE : IFD_TARIF_SEUL;
  const ifd = arrondi5ct(calculerImpotSimple(revenuNetIFD, tarifdIFD));

  // --- 9. TOTAUX ---
  const totalICC = impotCantonalRevenu + impotCommunalRevenu + impotEglise
                 + impotCantonalFortune + impotCommunalFortune;
  const totalGlobal = totalICC + ifd;

  return {
    // Données de base
    canton: "BE",
    commune: commune.nom,
    communeId,
    estMarié,
    nbEnfants,
    confession,

    // Revenus
    revenuBrut,
    revenuNet,
    revenuNetIFD,

    // Fortune
    fortune,
    fortuneImposable,

    // Impôts simples
    impotSimpleRevenu: Math.round(impotSimpleRevenu * 100) / 100,
    impotSimpleFortune: Math.round(impotSimpleFortune * 100) / 100,

    // ICC Revenu
    impotCantonalRevenu,
    impotCommunalRevenu,
    impotEglise,

    // ICC Fortune
    impotCantonalFortune,
    impotCommunalFortune,

    // IFD
    ifd,

    // Totaux
    totalICC,
    totalGlobal,

    // Steuerfuss
    steuerfussEtat: STEUERFUSS_ETAT_BE,
    steuerfussCommune: commune.gemeinde,
  };
}

// ----------------------------------------------------------------------------
// EXPORTS
// ----------------------------------------------------------------------------

export {
  calculerDeclarationBE,
  COMMUNES_BE,
  TARIF_BE_1,
  TARIF_BE_2,
  TARIF_BE_3_FORTUNE,
  DEDUCTIONS_BE,
  STEUERFUSS_ETAT_BE,
};