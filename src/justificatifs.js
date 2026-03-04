/**
 * ============================================================
 * tAIx — Module Justificatifs Fiscaux Jura 2025
 * Source: JuraTax 2025 model.xml (FlagJustificatif*) + resources_fr.properties
 * 6 langues: FR, DE, IT, PT, ES, EN
 * ============================================================
 */

// ============================================================
// 1. CATALOGUE COMPLET DES JUSTIFICATIFS
//    Clé unique → textes en 6 langues + condition de déclenchement
// ============================================================

const CATALOGUE_JUSTIFICATIFS = {

  // ── IMMOBILIER ──────────────────────────────────────────
  immo_eca: {
    categorie: "immeuble",
    condition: (d) => d.fraisExploitation?.assurance > 1000,
    fr: "Justificatifs assurance immobilière ECA (anciennement AIJ)",
    de: "Belege Gebäudeversicherung (Kantonale Gebäudeversicherung)",
    it: "Giustificativi assicurazione immobiliare ECA",
    pt: "Comprovativos do seguro imobiliário ECA",
    es: "Justificantes del seguro inmobiliario ECA",
    en: "Building insurance (ECA) supporting documents",
  },
  immo_rc: {
    categorie: "immeuble",
    condition: (d) => d.fraisExploitation?.responsabiliteCivile > 0,
    fr: "Justificatifs responsabilité civile et dégâts d'eau (mobilier de ménage exclu)",
    de: "Belege Haftpflicht- und Wasserschadenversicherung (ohne Hausrat)",
    it: "Giustificativi responsabilità civile e danni d'acqua (escluso arredo)",
    pt: "Comprovativos de responsabilidade civil e danos por água (excluindo mobiliário)",
    es: "Justificantes de responsabilidad civil y daños por agua (excluido mobiliario)",
    en: "Civil liability and water damage insurance documents (household excluded)",
  },
  immo_ramonage: {
    categorie: "immeuble",
    condition: (d) => d.fraisExploitation?.ramonage > 0,
    fr: "Justificatifs ramonage",
    de: "Belege Kaminfegerkosten",
    it: "Giustificativi spazzacamino",
    pt: "Comprovativos de limpeza de chaminé",
    es: "Justificantes de deshollinador",
    en: "Chimney sweep receipts",
  },
  immo_ordures: {
    categorie: "immeuble",
    condition: (d) => d.fraisExploitation?.orduresMenageres > 0,
    fr: "Justificatifs ordures ménagères",
    de: "Belege Kehrichtgebühren",
    it: "Giustificativi raccolta rifiuti",
    pt: "Comprovativos de recolha de lixo",
    es: "Justificantes de recogida de basuras",
    en: "Waste collection receipts",
  },
  immo_autres_contributions: {
    categorie: "immeuble",
    condition: (d) => d.fraisExploitation?.autresContributions > 0,
    fr: "Justificatifs autres contributions périodiques",
    de: "Belege übrige periodische Beiträge",
    it: "Giustificativi altri contributi periodici",
    pt: "Comprovativos de outras contribuições periódicas",
    es: "Justificantes de otras contribuciones periódicas",
    en: "Other periodic charges receipts",
  },
  immo_frais_entretien: {
    categorie: "immeuble",
    condition: (d) => d.fraisEntretien?.total > 0,
    fr: "Copies de toutes les factures de frais d'entretien (avec date et montant)",
    de: "Kopien aller Unterhaltskosten-Rechnungen (mit Datum und Betrag)",
    it: "Copie di tutte le fatture di manutenzione (con data e importo)",
    pt: "Cópias de todas as faturas de manutenção (com data e montante)",
    es: "Copias de todas las facturas de mantenimiento (con fecha e importe)",
    en: "Copies of all maintenance invoices (with date and amount)",
  },
  immo_nouveau: {
    categorie: "immeuble",
    condition: (d) => d.immeuble?.nouveau === true,
    fr: "Acte d'achat et document officiel indiquant la valeur officielle et locative de l'immeuble",
    de: "Kaufakt und offizielles Dokument mit Steuerwert und Mietwert",
    it: "Atto di acquisto e documento ufficiale con valore fiscale e locativo",
    pt: "Escritura de compra e documento oficial com valor fiscal e locativo",
    es: "Escritura de compra y documento oficial con valor fiscal y de alquiler",
    en: "Purchase deed and official document showing tax and rental value",
  },
  immo_vente: {
    categorie: "immeuble",
    condition: (d) => d.immeuble?.vendu === true,
    fr: "Acte de vente de l'immeuble",
    de: "Kaufvertrag (Verkauf der Liegenschaft)",
    it: "Atto di vendita dell'immobile",
    pt: "Escritura de venda do imóvel",
    es: "Escritura de venta del inmueble",
    en: "Property sale deed",
  },
  immo_loyer_nouveau_contrat: {
    categorie: "immeuble",
    condition: (d) => d.immeuble?.nouveauContratBail === true,
    fr: "Nouveau(x) contrat(s) de bail pour les loyers encaissés",
    de: "Neue Mietverträge für die erhaltenen Mietzinse",
    it: "Nuovo/i contratto/i di locazione per i canoni incassati",
    pt: "Novo(s) contrato(s) de arrendamento para as rendas recebidas",
    es: "Nuevo(s) contrato(s) de alquiler por las rentas cobradas",
    en: "New rental agreement(s) for rents received",
  },
  immo_photovoltaique: {
    categorie: "immeuble",
    condition: (d) => d.immeuble?.photovoltaique > 0,
    fr: "Décompte relatif à la production d'électricité liée aux panneaux photovoltaïques",
    de: "Abrechnung bezüglich Stromproduktion der Photovoltaik-Anlage",
    it: "Rendiconto relativo alla produzione di energia fotovoltaica",
    pt: "Extrato relativo à produção de eletricidade solar",
    es: "Liquidación relativa a la producción fotovoltaica",
    en: "Solar panel electricity production statement",
  },

  // ── DETTES & INTÉRÊTS ────────────────────────────────────
  dette_hypothecaire_nouveau: {
    categorie: "dettes",
    condition: (d) => d.dettes?.hypothequeNouvelle === true,
    fr: "Justificatifs concernant les intérêts hypothécaires",
    de: "Belege betreffend Hypothekarzinsen",
    it: "Giustificativi relativi agli interessi ipotecari",
    pt: "Comprovativos dos juros hipotecários",
    es: "Justificantes de los intereses hipotecarios",
    en: "Mortgage interest supporting documents",
  },
  dette_privee: {
    categorie: "dettes",
    condition: (d) => d.dettes?.dettePrivee > 0,
    fr: "Justificatifs quant aux dettes privées",
    de: "Belege betreffend Privatschulden",
    it: "Giustificativi relativi ai debiti privati",
    pt: "Comprovativos das dívidas privadas",
    es: "Justificantes de las deudas privadas",
    en: "Private debt supporting documents",
  },

  // ── TITRES & PLACEMENTS ──────────────────────────────────
  titres_releve_fiscal: {
    categorie: "titres",
    condition: (d) => d.titres?.relevesFiscaux?.length > 0,
    fr: "Relevé(s) fiscal(aux) du portefeuille de titres et annexe(s) bancaire(s)",
    de: "Steuerausweis(e) des Wertschriftenportfolios und Bankbeilagen",
    it: "Estratto/i fiscale/i del portafoglio titoli e allegato/i bancario/i",
    pt: "Extrato(s) fiscal(ais) da carteira de títulos e anexo(s) bancário(s)",
    es: "Extracto(s) fiscal(es) de la cartera de valores y anexo(s) bancario(s)",
    en: "Securities portfolio tax statement(s) and bank annex(es)",
  },
  titres_achat_actions: {
    categorie: "titres",
    condition: (d) => d.titres?.achatsActions?.length > 0,
    fr: "Décompte(s) d'achat des actions (avec année d'acquisition)",
    de: "Kaufabrechnung(en) der Aktien (mit Erwerbsjahr)",
    it: "Rendiconto/i di acquisto delle azioni (con anno di acquisizione)",
    pt: "Extrato(s) de compra de ações (com ano de aquisição)",
    es: "Liquidación(es) de compra de acciones (con año de adquisición)",
    en: "Share purchase statement(s) (with acquisition year)",
  },
  titres_vente_actions: {
    categorie: "titres",
    condition: (d) => d.titres?.ventesActions?.length > 0,
    fr: "Décompte(s) de vente des actions",
    de: "Verkaufsabrechnung(en) der Aktien",
    it: "Rendiconto/i di vendita delle azioni",
    pt: "Extrato(s) de venda de ações",
    es: "Liquidación(es) de venta de acciones",
    en: "Share sale statement(s)",
  },
  titres_da1: {
    categorie: "titres",
    condition: (d) => d.titres?.da1 === true,
    fr: "La feuille complémentaire DA-1 / R-US ainsi que les justificatifs",
    de: "Ergänzungsblatt DA-1 / R-US sowie die entsprechenden Belege",
    it: "Il foglio complementare DA-1 / R-US e i relativi giustificativi",
    pt: "A folha complementar DA-1 / R-US e os respetivos comprovativos",
    es: "La hoja complementaria DA-1 / R-US y los justificantes correspondientes",
    en: "Supplementary sheet DA-1 / R-US and supporting documents",
  },
  titres_frais_admin: {
    categorie: "titres",
    condition: (d) => d.titres?.fraisAdministration > 0,
    fr: "Justificatifs relatifs aux frais d'administration et de gestion de titres prouvables",
    de: "Belege für nachweisbare Verwaltungs- und Depotgebühren",
    it: "Giustificativi relativi alle spese di amministrazione titoli documentabili",
    pt: "Comprovativos das despesas de administração de títulos comprováveis",
    es: "Justificantes de los gastos de administración de valores comprobables",
    en: "Provable securities administration fee receipts",
  },

  // ── DÉDUCTIONS ───────────────────────────────────────────
  deduction_pilier3a: {
    categorie: "deductions",
    condition: (d) => d.pilier3a > 0,
    fr: "Attestation de cotisation pilier 3a",
    de: "Bescheinigung der Säule 3a-Beiträge",
    it: "Attestato di versamento pilastro 3a",
    pt: "Comprovativo de contribuição para o 3.º pilar",
    es: "Certificado de cotización al pilar 3a",
    en: "Pillar 3a contribution certificate",
  },
  deduction_rachat_2e_pilier: {
    categorie: "deductions",
    condition: (d) => d.rachat2ePilier > 0,
    fr: "Attestation de rachat 2ème pilier + feuille de calcul signée par l'institution de prévoyance",
    de: "Einkaufsbescheinigung 2. Säule + Berechnungsblatt der Vorsorgeeinrichtung",
    it: "Attestato di riscatto 2° pilastro + foglio di calcolo firmato dall'istituto",
    pt: "Comprovativo de resgate do 2.º pilar + folha de cálculo assinada",
    es: "Certificado de rescate del 2.º pilar + hoja de cálculo firmada",
    en: "2nd pillar buy-back certificate + calculation sheet signed by pension institution",
  },
  deduction_dons: {
    categorie: "deductions",
    condition: (d) => d.dons > 0,
    fr: "Justificatifs concernant les dons (reçus officiels)",
    de: "Belege betreffend Vergabungen (offizielle Quittungen)",
    it: "Giustificativi relativi alle donazioni (ricevute ufficiali)",
    pt: "Comprovativos das doações (recibos oficiais)",
    es: "Justificantes de las donaciones (recibos oficiales)",
    en: "Donation receipts (official acknowledgements)",
  },
  deduction_partis_politiques: {
    categorie: "deductions",
    condition: (d) => d.partisPolitiques > 0,
    fr: "Justificatifs concernant les cotisations et versements en faveur d'un parti politique",
    de: "Belege für Beiträge und Zahlungen zugunsten einer politischen Partei",
    it: "Giustificativi relativi alle quote e versamenti a favore di un partito politico",
    pt: "Comprovativos das quotizações a favor de um partido político",
    es: "Justificantes de las cuotas a favor de un partido político",
    en: "Political party membership fees and donations receipts",
  },
  deduction_frais_perfectionnement: {
    categorie: "deductions",
    condition: (d) => d.fraisPerfectionnement > 0,
    fr: "Factures et détails (planning) des cours suivis — frais de formation et perfectionnement",
    de: "Rechnungen und Belege (Kursplan) der besuchten Kurse — Aus- und Weiterbildungskosten",
    it: "Fatture e dettagli (programma) dei corsi seguiti — spese di formazione",
    pt: "Faturas e detalhes (horário) dos cursos — despesas de formação",
    es: "Facturas y detalles (horario) de los cursos — gastos de formación",
    en: "Invoices and details (schedule) of courses attended — training expenses",
  },
  deduction_cotisations_syndicales: {
    categorie: "deductions",
    condition: (d) => d.cotisationsSyndicales > 0,
    fr: "Cotisations syndicales et autres frais",
    de: "Gewerkschaftsbeiträge und übrige Kosten",
    it: "Contributi sindacali e altre spese",
    pt: "Quotizações sindicais e outras despesas",
    es: "Cuotas sindicales y otros gastos",
    en: "Union fees and other expenses",
  },

  // ── FRAIS MALADIE & HANDICAP ─────────────────────────────
  frais_maladie: {
    categorie: "sante",
    condition: (d) => d.fraisMaladie?.total > 0,
    fr: "Factures et décomptes de frais maladie",
    de: "Rechnungen und Abrechnungen der Krankheitskosten",
    it: "Fatture e rendiconti delle spese di malattia",
    pt: "Faturas e extratos das despesas de doença",
    es: "Facturas y liquidaciones de gastos de enfermedad",
    en: "Medical expense invoices and statements",
  },
  frais_handicap: {
    categorie: "sante",
    condition: (d) => d.fraisHandicap?.total > 0,
    fr: "Justificatifs concernant les frais de handicap",
    de: "Belege betreffend Invaliditätskosten",
    it: "Giustificativi relativi alle spese di invalidità",
    pt: "Comprovativos das despesas de deficiência",
    es: "Justificantes de los gastos de discapacidad",
    en: "Disability expense supporting documents",
  },

  // ── ASSURANCES (code 525) ────────────────────────────────
  assurances_polices: {
    categorie: "assurances",
    condition: (d) => d.subsidesRecus > 0,
    fr: "Copies des polices assurance maladie et accident (LAMAL, LCA) + assurance vie (avis de primes)",
    de: "Kopien der Kranken- und Unfallversicherungspolicen (KVG, VVG) + Lebensversicherung",
    it: "Copie delle polizze assicurazione malattia e infortuni (LAMal, LCA) + vita",
    pt: "Cópias das apólices de seguro de saúde e acidentes (LAMal, LCA) + vida",
    es: "Copias de las pólizas de seguro de enfermedad y accidentes (LAMal, LCA) + vida",
    en: "Copies of health and accident insurance policies (LAMal, LCA) + life insurance",
  },
  assurance_vie_fortune: {
    categorie: "assurances",
    condition: (d) => d.assuranceVie?.valeurRachat > 0,
    fr: "Attestation annuelle de la valeur de rachat de l'assurance vie",
    de: "Jährliche Bescheinigung des Rückkaufswertes der Lebensversicherung",
    it: "Attestato annuale del valore di riscatto dell'assicurazione sulla vita",
    pt: "Certificado anual do valor de resgate do seguro de vida",
    es: "Certificado anual del valor de rescate del seguro de vida",
    en: "Annual life insurance surrender value certificate",
  },

  // ── REVENUS ──────────────────────────────────────────────
  revenu_certificat_salaire: {
    categorie: "revenus",
    condition: (d) => d.revenus?.salaire > 0 && d.revenus?.nouveauEmployeur === true,
    fr: "Attestation complète de l'employeur (y compris annexes supplémentaires)",
    de: "Vollständige Arbeitgeberbescheinigung (inkl. Beilagen)",
    it: "Attestato completo del datore di lavoro (incl. allegati)",
    pt: "Declaração completa do empregador (incluindo anexos)",
    es: "Certificado completo del empleador (incluidos los anexos)",
    en: "Complete employer certificate (including annexes)",
  },
  revenu_rente_ai: {
    categorie: "revenus",
    condition: (d) => d.revenus?.renteAI > 0,
    fr: "Attestation de rentes AI",
    de: "IV-Rentenbescheinigung",
    it: "Attestato di rendita AI",
    pt: "Comprovativo de renda AI",
    es: "Certificado de renta AI",
    en: "Disability insurance (AI) pension certificate",
  },
  revenu_autres_rentes: {
    categorie: "revenus",
    condition: (d) => d.revenus?.autresRentes > 0,
    fr: "Attestation des autres rentes, prestations (SUVA, APG), indemnités journalières",
    de: "Bescheinigung anderer Renten, Leistungen (SUVA, EO), Taggelder",
    it: "Attestato di altre rendite, prestazioni (SUVA, IPG), indennità giornaliere",
    pt: "Comprovativo de outras rendas, prestações (SUVA, APG), subsídios diários",
    es: "Certificado de otras rentas, prestaciones (SUVA, APG), subsidios diarios",
    en: "Other pension, benefit (SUVA, APG) and daily allowance certificate",
  },
  revenu_etranger: {
    categorie: "revenus",
    condition: (d) => d.revenus?.revenuEtranger > 0,
    fr: "Justificatifs concernant les revenus provenant de l'étranger (avec preuve d'imposition étrangère si applicable)",
    de: "Belege betreffend ausländische Einkünfte (mit Nachweis ausländischer Besteuerung)",
    it: "Giustificativi relativi ai redditi provenienti dall'estero",
    pt: "Comprovativos dos rendimentos provenientes do estrangeiro",
    es: "Justificantes de los ingresos procedentes del extranjero",
    en: "Foreign income supporting documents (with proof of foreign taxation if applicable)",
  },

  // ── ENFANTS ──────────────────────────────────────────────
  enfant_frais_garde: {
    categorie: "enfants",
    condition: (d) => d.enfants?.fraisGarde > 0,
    fr: "Justificatifs frais de garde des enfants",
    de: "Belege Kinderbetreuungskosten",
    it: "Giustificativi spese di custodia dei bambini",
    pt: "Comprovativos das despesas de guarda de crianças",
    es: "Justificantes de los gastos de guardería",
    en: "Childcare expense receipts",
  },
  enfant_pension_versee: {
    categorie: "enfants",
    condition: (d) => d.enfants?.pensionAlimentaireVersee > 0,
    fr: "Justificatifs pension alimentaire versée — quittances de versement",
    de: "Belege bezahlte Unterhaltsbeiträge — Zahlungsquittungen",
    it: "Giustificativi assegno alimentare versato — ricevute di pagamento",
    pt: "Comprovativos da pensão alimentar paga — recibos de pagamento",
    es: "Justificantes de la pensión alimenticia pagada — recibos de pago",
    en: "Child support paid — payment receipts",
  },
  enfant_pension_recue: {
    categorie: "enfants",
    condition: (d) => d.enfants?.pensionAlimentaireRecue > 0,
    fr: "Justificatifs pension alimentaire reçue — quittances d'encaissement",
    de: "Belege erhaltene Unterhaltsbeiträge — Empfangsquittungen",
    it: "Giustificativi assegno alimentare ricevuto — ricevute di incasso",
    pt: "Comprovativos da pensão alimentar recebida — recibos",
    es: "Justificantes de la pensión alimenticia recibida — recibos de cobro",
    en: "Child support received — collection receipts",
  },
  enfant_autorite_parentale: {
    categorie: "enfants",
    condition: (d) => d.enfants?.autoriteParentaleConjointe === true,
    fr: "Copie du document officiel attestant de l'Autorité parentale conjointe",
    de: "Kopie des offiziellen Dokuments der gemeinsamen elterlichen Sorge",
    it: "Copia del documento ufficiale attestante l'autorità parentale congiunta",
    pt: "Cópia do documento oficial de autoridade parental conjunta",
    es: "Copia del documento oficial de autoridad parental conjunta",
    en: "Copy of official joint parental authority document",
  },
  enfant_attestation_etudes: {
    categorie: "enfants",
    condition: (d) => d.enfants?.enFormation === true,
    fr: "Attestation(s) d'immatriculation / études des enfants",
    de: "Immatrikulationsbescheinigung(en) der Kinder",
    it: "Attestato/i di immatricolazione dei figli",
    pt: "Comprovativo(s) de matrícula dos filhos",
    es: "Certificado(s) de matriculación de los hijos",
    en: "Children's enrollment / study certificate(s)",
  },

  // ── INDÉPENDANTS ─────────────────────────────────────────
  independant_bilan: {
    categorie: "independant",
    condition: (d) => d.independant?.avecCompta === true,
    fr: "Bilan, compte de pertes et profits et extrait détaillé du compte privé (datés et signés)",
    de: "Bilanz, Erfolgsrechnung und detaillierter Privatkontoauszug (datiert und unterschrieben)",
    it: "Bilancio, conto economico ed estratto dettagliato del conto privato (datati e firmati)",
    pt: "Balanço, conta de resultados e extrato detalhado da conta privada (datados e assinados)",
    es: "Balance, cuenta de pérdidas y ganancias y extracto detallado de la cuenta privada",
    en: "Balance sheet, income statement and detailed private account extract (dated and signed)",
  },
  independant_sans_compta: {
    categorie: "independant",
    condition: (d) => d.independant?.sansCompta === true,
    fr: "État des actifs et passifs, détail des recettes et dépenses, apports et prélèvements privés",
    de: "Status Aktiven und Passiven, Einnahmen und Ausgaben, Privateinlagen und -bezüge",
    it: "Stato degli attivi e passivi, dettaglio entrate e uscite, apporti e prelievi privati",
    pt: "Estado dos ativos e passivos, detalhe de receitas e despesas, aportes e levantamentos",
    es: "Estado de activos y pasivos, detalle de ingresos y gastos, aportaciones y retiradas",
    en: "Assets and liabilities statement, income and expense details, private contributions",
  },
};

// ============================================================
// 2. CATÉGORIES (pour regroupement dans l'affichage)
// ============================================================

const CATEGORIES = {
  immeuble:    { fr: "Immeuble",                 de: "Liegenschaft",              it: "Immobile",                pt: "Imóvel",                    es: "Inmueble",              en: "Property"           },
  dettes:      { fr: "Dettes et intérêts",        de: "Schulden und Zinsen",       it: "Debiti e interessi",      pt: "Dívidas e juros",            es: "Deudas e intereses",    en: "Debts and interest"  },
  titres:      { fr: "Titres et placements",       de: "Wertschriften",             it: "Titoli e investimenti",   pt: "Títulos e investimentos",    es: "Valores e inversiones", en: "Securities"          },
  deductions:  { fr: "Déductions",                de: "Abzüge",                    it: "Deduzioni",               pt: "Deduções",                   es: "Deducciones",           en: "Deductions"          },
  sante:       { fr: "Frais maladie / handicap",   de: "Krankheits-/Invaliditätskosten", it: "Spese sanitarie", pt: "Despesas de saúde",          es: "Gastos de salud",       en: "Medical expenses"    },
  assurances:  { fr: "Assurances",                de: "Versicherungen",            it: "Assicurazioni",           pt: "Seguros",                    es: "Seguros",               en: "Insurance"           },
  revenus:     { fr: "Revenus",                   de: "Einkommen",                 it: "Redditi",                 pt: "Rendimentos",                es: "Ingresos",              en: "Income"              },
  enfants:     { fr: "Enfants",                   de: "Kinder",                    it: "Figli",                   pt: "Filhos",                     es: "Hijos",                 en: "Children"            },
  independant: { fr: "Activité indépendante",     de: "Selbständige Tätigkeit",    it: "Attività indipendente",   pt: "Atividade independente",     es: "Actividad independiente", en: "Self-employment"  },
};

// ============================================================
// 3. ADRESSE D'ENVOI OFFICIELLE
// Source: label.justificatifs.impression.adresse
// ============================================================

const ADRESSE_ENVOI = {
  fr: "Service des contributions\nCentre de scannage\n2, rue de la Justice\n2800 Delémont",
  de: "Steuerverwaltung\nScanningzentrum\nJustizgasse 2\n2800 Delémont",
  it: "Servizio delle contribuzioni\nCentro di scansione\n2, rue de la Justice\n2800 Delémont",
  pt: "Serviço de contribuições\nCentro de digitalização\n2, rue de la Justice\n2800 Delémont",
  es: "Servicio de contribuciones\nCentro de digitalización\n2, rue de la Justice\n2800 Delémont",
  en: "Tax Authority\nScanning Centre\n2, rue de la Justice\n2800 Delémont",
};

// ============================================================
// 4. TEXTES D'INTERFACE EN 6 LANGUES
// ============================================================

const TEXTES_UI = {
  titre:           { fr: "Documents à joindre à votre déclaration", de: "Ihrer Steuererklärung beizulegende Belege", it: "Documenti da allegare alla dichiarazione", pt: "Documentos a juntar à declaração", es: "Documentos a adjuntar a la declaración", en: "Documents to attach to your tax return" },
  aucun:           { fr: "Aucun justificatif requis.", de: "Keine Belege erforderlich.", it: "Nessun giustificativo richiesto.", pt: "Nenhum comprovativo necessário.", es: "No se requieren justificantes.", en: "No supporting documents required." },
  envoi:           { fr: "À envoyer à :", de: "Senden an:", it: "Da inviare a:", pt: "Enviar para:", es: "Enviar a:", en: "Send to:" },
  info_copies:     { fr: "⚠️ Merci de joindre des copies — les originaux ne seront pas retournés.", de: "⚠️ Bitte Kopien beilegen — Originale werden nicht zurückgeschickt.", it: "⚠️ Si prega di allegare copie — gli originali non saranno restituiti.", pt: "⚠️ Por favor, juntar cópias — os originais não serão devolvidos.", es: "⚠️ Por favor, adjuntar copias — los originales no serán devueltos.", en: "⚠️ Please attach copies — originals will not be returned." },
  nb_documents:    { fr: "document(s) requis", de: "Beleg(e) erforderlich", it: "documento/i richiesto/i", pt: "documento(s) necessário(s)", es: "documento(s) requerido(s)", en: "document(s) required" },
};

// ============================================================
// 5. FONCTION PRINCIPALE — GÉNÉRER LA LISTE
// ============================================================

/**
 * Génère la liste personnalisée des justificatifs requis
 * @param {object} donneesDeclaration - données saisies par le contribuable
 * @param {string} langue - 'fr'|'de'|'it'|'pt'|'es'|'en'
 * @returns {object} - liste structurée + texte formaté
 */
function genererJustificatifs(donneesDeclaration, langue = 'fr') {
  const lang = langue;
  const requis = [];

  // Évaluer chaque justificatif
  for (const [cle, justif] of Object.entries(CATALOGUE_JUSTIFICATIFS)) {
    try {
      if (justif.condition(donneesDeclaration)) {
        requis.push({
          cle,
          categorie: justif.categorie,
          texte: justif[lang] || justif.fr,
        });
      }
    } catch (e) {
      // Condition mal évaluée = pas de déclenchement
    }
  }

  // Regrouper par catégorie
  const parCategorie = {};
  for (const item of requis) {
    if (!parCategorie[item.categorie]) {
      parCategorie[item.categorie] = {
        titre: CATEGORIES[item.categorie]?.[lang] || item.categorie,
        items: [],
      };
    }
    parCategorie[item.categorie].items.push(item.texte);
  }

  // Générer le texte formaté
  const texteFormate = _formaterTexte(parCategorie, requis.length, lang);

  return {
    total: requis.length,
    parCategorie,
    listeFlat: requis.map(r => r.texte),
    texteFormate,
    adresseEnvoi: ADRESSE_ENVOI[lang],
  };
}

/**
 * Formater en texte lisible
 */
function _formaterTexte(parCategorie, total, lang) {
  const t = TEXTES_UI;
  let texte = `📋 ${t.titre[lang]}\n`;
  texte += `${'═'.repeat(50)}\n\n`;

  if (total === 0) {
    texte += `✅ ${t.aucun[lang]}\n`;
    return texte;
  }

  texte += `${total} ${t.nb_documents[lang]}\n\n`;
  texte += `${t.info_copies[lang]}\n\n`;

  for (const [cat, data] of Object.entries(parCategorie)) {
    texte += `📁 ${data.titre.toUpperCase()}\n`;
    for (const item of data.items) {
      texte += `   □ ${item}\n`;
    }
    texte += '\n';
  }

  texte += `${'─'.repeat(50)}\n`;
  texte += `✉️  ${t.envoi[lang]}\n`;
  texte += ADRESSE_ENVOI[lang];

  return texte;
}

// ============================================================
// 6. EXPORT
// ============================================================

if (typeof module !== 'undefined') {
  module.exports = {
    genererJustificatifs,
    CATALOGUE_JUSTIFICATIFS,
    CATEGORIES,
    ADRESSE_ENVOI,
    TEXTES_UI,
  };
}

// ============================================================
// 7. TEST — CAS NEUKOMM 2025
// ============================================================

function testJustificatifsNeukomm() {
  console.log("=== TEST JUSTIFICATIFS — NEUKOMM 2025 ===\n");

  const donnees = {
    fraisExploitation: {
      assurance: 415,         // ECA < 1000 → pas de justif
      responsabiliteCivile: 500,
      ramonage: 150,
      orduresMenageres: 140,
      autresContributions: 498,
    },
    fraisEntretien: { total: 2103 },
    dettes: { hypothequeNouvelle: false },
    titres: {
      relevesFiscaux: ["Raiffeisen"],
    },
    dons: 1000,
    subsidesRecus: 0,
    pilier3a: 0,
    enfants: null,
    independant: null,
    revenus: { salaire: 0, renteAI: 0, autresRentes: 0, revenuEtranger: 0 },
  };

  // Test en 6 langues
  const langues = ['fr', 'de', 'it', 'pt', 'es', 'en'];
  for (const lang of langues) {
    const result = genererJustificatifs(donnees, lang);
    console.log(`\n${'='.repeat(50)}`);
    console.log(`LANGUE: ${lang.toUpperCase()} — ${result.total} documents`);
    console.log(result.texteFormate);
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  testJustificatifsNeukomm();
}
