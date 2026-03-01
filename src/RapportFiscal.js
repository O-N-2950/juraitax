// ═══════════════════════════════════════════════════════════════════════
//  JurAI Tax — Générateur Rapport Fiscal Personnalisé A4
//  Format: PDF 1 page A4 · Dynamique · 7 langues
//  Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════════════

import { jsPDF } from "jspdf";

// ── COULEURS ─────────────────────────────────────────────────────────────
const GOLD   = [201, 168, 76];
const DARK   = [26,  26,  46];
const ACCENT = [15,  52,  96];
const GREY   = [108, 117, 125];
const WHITE  = [255, 255, 255];
const GREEN  = [46,  125, 50];
const LIGHT  = [248, 249, 250];
const RED    = [198, 40,  40];

// ── TRADUCTIONS ──────────────────────────────────────────────────────────
const LABELS = {
  title:          { fr:"Rapport Fiscal Personnalisé",         de:"Persönlicher Steuerbericht",           it:"Rapporto Fiscale Personalizzato",       pt:"Relatório Fiscal Personalizado",        es:"Informe Fiscal Personalizado",          en:"Personalised Tax Report",               uk:"Персональний Податковий Звіт" },
  annee:          { fr:"Déclaration",                         de:"Steuererklärung",                      it:"Dichiarazione",                         pt:"Declaração",                            es:"Declaración",                           en:"Tax return",                            uk:"Декларація" },
  base_legale:    { fr:"Base légale appliquée",               de:"Angewendete Rechtsgrundlage",          it:"Base legale applicata",                 pt:"Base legal aplicada",                   es:"Base legal aplicada",                   en:"Applied legal basis",                   uk:"Застосована правова основа" },
  raisonnement:   { fr:"Raisonnement fiscal — décisions prises pour votre déclaration",
                                                              de:"Steuerliche Begründung — Entscheidungen für Ihre Steuererklärung",
                                                                                                         it:"Ragionamento fiscale — decisioni prese per la vostra dichiarazione",
                                                                                                                                                     pt:"Raciocínio fiscal — decisões tomadas para a sua declaração",
                                                                                                                                                                                                 es:"Razonamiento fiscal — decisiones tomadas para su declaración",
                                                                                                                                                                                                                                             en:"Tax reasoning — decisions made for your return",
                                                                                                                                                                                                                                                                                         uk:"Податкове обґрунтування — рішення прийняті для вашої декларації" },
  recapitulatif:  { fr:"Récapitulatif de l'optimisation",     de:"Zusammenfassung der Optimierung",      it:"Riepilogo dell'ottimizzazione",          pt:"Resumo da otimização",                  es:"Resumen de la optimización",            en:"Optimisation summary",                  uk:"Підсумок оптимізації" },
  revenu_init:    { fr:"Revenu brut initial",                 de:"Anfängliches Bruttoeinkommen",         it:"Reddito lordo iniziale",                pt:"Rendimento bruto inicial",              es:"Ingresos brutos iniciales",             en:"Initial gross income",                  uk:"Початковий валовий дохід" },
  total_ded:      { fr:"Total déductions admises",            de:"Zugelassene Gesamtabzüge",             it:"Totale deduzioni ammesse",              pt:"Total de deduções admitidas",           es:"Total deducciones admitidas",           en:"Total admitted deductions",             uk:"Загальні допущені відрахування" },
  revenu_impos:   { fr:"Revenu imposable net",                de:"Netto-steuerbares Einkommen",          it:"Reddito imponibile netto",              pt:"Rendimento tributável líquido",         es:"Ingreso neto imponible",                en:"Net taxable income",                    uk:"Чистий оподатковуваний дохід" },
  impot_total:    { fr:"Impôt total calculé",                 de:"Berechnete Gesamtsteuer",              it:"Imposta totale calcolata",              pt:"Imposto total calculado",               es:"Impuesto total calculado",              en:"Total calculated tax",                  uk:"Загальний розрахований податок" },
  economie:       { fr:"Économie d'impôt estimée",            de:"Geschätzte Steuerersparnis",           it:"Risparmio fiscale stimato",             pt:"Poupança fiscal estimada",              es:"Ahorro fiscal estimado",                en:"Estimated tax saving",                  uk:"Оцінена податкова економія" },
  footer_doc:     { fr:"Document établi par JurAI Tax sur la base des informations transmises. La décision de taxation de l'autorité fiscale compétente fait foi.",
                                                              de:"Dokument erstellt von JurAI Tax auf Grundlage der übermittelten Informationen. Der Steuerentscheid der zuständigen Steuerbehörde ist massgebend.",
                                                                                                         it:"Documento redatto da JurAI Tax sulla base delle informazioni trasmesse. La decisione di tassazione dell'autorità fiscale competente è determinante.",
                                                                                                                                                     pt:"Documento elaborado pela JurAI Tax com base nas informações transmitidas. A decisão de tributação da autoridade fiscal competente prevalece.",
                                                                                                                                                                                                 es:"Documento elaborado por JurAI Tax sobre la base de la información transmitida. La decisión de imposición de la autoridad fiscal competente prevalece.",
                                                                                                                                                                                                                                             en:"Document prepared by JurAI Tax based on the information provided. The tax assessment of the competent fiscal authority prevails.",
                                                                                                                                                                                                                                                                                         uk:"Документ підготовлено JurAI Tax на основі наданої інформації. Рішення про оподаткування компетентного фінансового органу є визначальним." },
  // Sections dynamiques
  s_3a:           { fr:"Pilier 3a — Prévoyance individuelle liée",    de:"Säule 3a — Gebundene Selbstvorsorge",     it:"Pilastro 3a — Previdenza individuale vincolata", pt:"Pilar 3a — Previdência individual vinculada",   es:"Pilar 3a — Previsión individual vinculada",     en:"Pillar 3a — Tied individual pension",           uk:"Стовп 3a — Зв'язане індивідуальне пенсійне забезпечення" },
  d_3a:           { fr:"Versement admis en déduction intégrale. Plafond légal 2025 appliqué (CHF 7'258 salarié / CHF 36'288 indépendant).",
                                                              de:"Einzahlung in vollem Umfang als Abzug zugelassen. Gesetzliche Grenze 2025 angewendet (CHF 7'258 Angestellte / CHF 36'288 Selbständige).",
                                                                                                         it:"Versamento ammesso in deduzione integrale. Limite legale 2025 applicato (CHF 7'258 dipendente / CHF 36'288 indipendente).",
                                                                                                                                                     pt:"Versamento admitido em dedução integral. Limite legal 2025 aplicado (CHF 7'258 assalariado / CHF 36'288 independente).",
                                                                                                                                                                                                 es:"Aportación admitida en deducción íntegra. Límite legal 2025 aplicado (CHF 7'258 asalariado / CHF 36'288 independiente).",
                                                                                                                                                                                                                                             en:"Contribution admitted as full deduction. 2025 legal limit applied (CHF 7,258 employee / CHF 36,288 self-employed).",
                                                                                                                                                                                                                                                                                         uk:"Внесок допущений до повного відрахування. Застосований законний ліміт 2025 (CHF 7'258 найманий / CHF 36'288 самозайнятий)." },
  s_lpp:          { fr:"Rachat LPP — Caisse de pension",              de:"BVG-Einkauf — Pensionskasse",             it:"Riscatto LPP — Cassa pensioni",                 pt:"Resgate LPP — Caixa de pensões",                es:"Rescate LPP — Caja de pensiones",               en:"LPP buy-in — Pension fund",                     uk:"Викуп LPP — Пенсійний фонд" },
  d_lpp:          { fr:"Rachat volontaire dans la caisse de pension. Déduction intégrale admise selon art. 33 al. 1 lit. d LIFD. Optimisation retraite.",
                                                              de:"Freiwilliger Einkauf in die Pensionskasse. Vollständiger Abzug gemäss Art. 33 Abs. 1 lit. d DBG zugelassen. Vorsorgeoptimierung.",
                                                                                                         it:"Riscatto volontario nella cassa pensioni. Deduzione integrale ammessa secondo art. 33 cpv. 1 lett. d LIFD. Ottimizzazione previdenziale.",
                                                                                                                                                     pt:"Resgate voluntário na caixa de pensões. Dedução integral admitida segundo art. 33 al. 1 lit. d LIFD. Otimização da reforma.",
                                                                                                                                                                                                 es:"Rescate voluntario en la caja de pensiones. Deducción íntegra admitida según art. 33 al. 1 lit. d LIFD. Optimización jubilación.",
                                                                                                                                                                                                                                             en:"Voluntary pension fund buy-in. Full deduction admitted under art. 33 al. 1 lit. d FDTA. Retirement optimisation.",
                                                                                                                                                                                                                                                                                         uk:"Добровільний викуп до пенсійного фонду. Повне відрахування допущено згідно ст. 33 ал. 1 літ. d LIFD. Оптимізація пенсії." },
  s_entretien:    { fr:"Frais d'entretien d'immeuble",                de:"Liegenschaftsunterhalt",                  it:"Spese di manutenzione dell'immobile",            pt:"Despesas de manutenção do imóvel",              es:"Gastos de mantenimiento del inmueble",           en:"Property maintenance costs",                    uk:"Витрати на обслуговування нерухомості" },
  d_entretien_f:  { fr:"Méthode forfaitaire retenue (20% de la valeur locative/de rendement). Plus avantageuse que les frais réels dans votre situation.",
                                                              de:"Pauschalmethode angewendet (20% des Miet-/Ertragswerts). In Ihrer Situation vorteilhafter als die effektiven Kosten.",
                                                                                                         it:"Metodo forfettario applicato (20% del valore locativo/di rendimento). Più vantaggioso dei costi effettivi nella vostra situazione.",
                                                                                                                                                     pt:"Método forfetário aplicado (20% do valor locativo/rendimento). Mais vantajoso que os custos reais na sua situação.",
                                                                                                                                                                                                 es:"Método de tanto alzado aplicado (20% del valor de alquiler/rendimiento). Más ventajoso que los costes reales en su situación.",
                                                                                                                                                                                                                                             en:"Flat-rate method applied (20% of rental/yield value). More advantageous than actual costs in your situation.",
                                                                                                                                                                                                                                                                                         uk:"Застосований метод фіксованої ставки (20% від орендної/дохідної вартості). Вигідніший ніж фактичні витрати у вашій ситуації." },
  d_entretien_r:  { fr:"Frais réels retenus (justificatifs fournis). Plus avantageux que le forfait de 20% dans votre situation.",
                                                              de:"Effektive Kosten angewendet (Belege vorhanden). In Ihrer Situation vorteilhafter als die Pauschale von 20%.",
                                                                                                         it:"Costi effettivi applicati (giustificativi forniti). Più vantaggiosi del forfait del 20% nella vostra situazione.",
                                                                                                                                                     pt:"Custos reais aplicados (comprovativos fornecidos). Mais vantajosos do que o forfait de 20% na sua situação.",
                                                                                                                                                                                                 es:"Costes reales aplicados (justificantes aportados). Más ventajosos que el forfait del 20% en su situación.",
                                                                                                                                                                                                                                             en:"Actual costs applied (receipts provided). More advantageous than the 20% flat rate in your situation.",
                                                                                                                                                                                                                                                                                         uk:"Застосовані фактичні витрати (надані підтверджуючі документи). Вигідніші ніж фіксована ставка 20% у вашій ситуації." },
  s_garde:        { fr:"Frais de garde d'enfants",                    de:"Kinderbetreuungskosten",                  it:"Spese di custodia dei figli",                   pt:"Custos de guarda de crianças",                  es:"Gastos de guardería infantil",                  en:"Childcare costs",                               uk:"Витрати на догляд за дітьми" },
  d_garde:        { fr:"Frais de garde admis en déduction dans la limite du plafond cantonal applicable.",
                                                              de:"Kinderbetreuungskosten im Rahmen des kantonalen Höchstbetrags als Abzug zugelassen.",
                                                                                                         it:"Spese di custodia ammesse in deduzione nei limiti del massimale cantonale applicabile.",
                                                                                                                                                     pt:"Custos de guarda admitidos em dedução dentro do limite máximo cantonal aplicável.",
                                                                                                                                                                                                 es:"Gastos de guardería admitidos en deducción dentro del límite cantonal aplicable.",
                                                                                                                                                                                                                                             en:"Childcare costs admitted as deduction within the applicable cantonal ceiling.",
                                                                                                                                                                                                                                                                                         uk:"Витрати на догляд допущені до відрахування в межах застосовного кантонального ліміту." },
  s_medicaux:     { fr:"Frais médicaux non remboursés",               de:"Nicht erstattete Krankheitskosten",       it:"Spese mediche non rimborsate",                  pt:"Despesas médicas não reembolsadas",             es:"Gastos médicos no reembolsados",                en:"Unreimbursed medical expenses",                 uk:"Невідшкодовані медичні витрати" },
  d_medicaux:     { fr:"Seuil de franchise franchi. Frais déductibles au-delà de 5% du revenu net (règle fédérale IFD).",
                                                              de:"Selbstbehalt überschritten. Kosten über 5% des Nettoeinkommens abziehbar (Bundesregel DBSt).",
                                                                                                         it:"Franchigia superata. Spese deducibili oltre il 5% del reddito netto (regola federale LIFD).",
                                                                                                                                                     pt:"Franquia ultrapassada. Despesas dedutíveis acima de 5% do rendimento líquido (regra federal LIFD).",
                                                                                                                                                                                                 es:"Franquicia superada. Gastos deducibles por encima del 5% de la renta neta (norma federal LIFD).",
                                                                                                                                                                                                                                             en:"Deductible threshold exceeded. Costs deductible above 5% of net income (federal FDTA rule).",
                                                                                                                                                                                                                                                                                         uk:"Перевищено поріг франшизи. Витрати вираховуються понад 5% чистого доходу (федеральне правило LIFD)." },
  s_dons:         { fr:"Dons à des associations reconnues",           de:"Spenden an anerkannte Organisationen",    it:"Donazioni ad associazioni riconosciute",         pt:"Donativos a associações reconhecidas",           es:"Donaciones a asociaciones reconocidas",          en:"Donations to recognised organisations",          uk:"Пожертви до визнаних організацій" },
  d_dons:         { fr:"Dons déduits dans la limite de 20% du revenu net (art. 33a LIFD). Reçus fournis.",
                                                              de:"Spenden im Rahmen von 20% des Nettoeinkommens abgezogen (Art. 33a DBG). Belege vorhanden.",
                                                                                                         it:"Donazioni dedotte nel limite del 20% del reddito netto (art. 33a LIFD). Ricevute fornite.",
                                                                                                                                                     pt:"Donativos deduzidos no limite de 20% do rendimento líquido (art. 33a LIFD). Recibos fornecidos.",
                                                                                                                                                                                                 es:"Donaciones deducidas dentro del límite del 20% de la renta neta (art. 33a LIFD). Recibos aportados.",
                                                                                                                                                                                                                                             en:"Donations deducted within the 20% of net income limit (art. 33a FDTA). Receipts provided.",
                                                                                                                                                                                                                                                                                         uk:"Пожертви вираховані в межах 20% чистого доходу (ст. 33a LIFD). Надані квитанції." },
  s_primes:       { fr:"Primes d'assurance maladie (LAMal + complémentaire)", de:"Krankenkassenprämien (KVG + Zusatz)",    it:"Premi di assicurazione malattia (LAMal + complementare)", pt:"Prémios de seguro de saúde (LAMal + complementar)", es:"Primas seguro de salud (LAMal + complementario)",  en:"Health insurance premiums (LAMal + supplemental)", uk:"Внески на медичне страхування (LAMal + доп.)" },
  d_primes:       { fr:"Primes déduites dans la limite du montant forfaitaire cantonal (JU 2025: CHF 3'000/adulte, CHF 1'200/enfant).",
                                                              de:"Prämien im Rahmen des kantonalen Pauschalbetrags abgezogen (JU 2025: CHF 3'000/Erwachsener, CHF 1'200/Kind).",
                                                                                                         it:"Premi dedotti nei limiti dell'importo forfetario cantonale (JU 2025: CHF 3'000/adulto, CHF 1'200/figlio).",
                                                                                                                                                     pt:"Prémios deduzidos no limite do montante forfetário cantonal (JU 2025: CHF 3'000/adulto, CHF 1'200/criança).",
                                                                                                                                                                                                 es:"Primas deducidas dentro del límite del importe cantonal (JU 2025: CHF 3'000/adulto, CHF 1'200/hijo).",
                                                                                                                                                                                                                                             en:"Premiums deducted within the cantonal flat-rate limit (JU 2025: CHF 3,000/adult, CHF 1,200/child).",
                                                                                                                                                                                                                                                                                         uk:"Внески вираховані в межах кантональної фіксованої суми (JU 2025: CHF 3'000/дорослий, CHF 1'200/дитина)." },
  chf:            { fr:"CHF", de:"CHF", it:"CHF", pt:"CHF", es:"CHF", en:"CHF", uk:"CHF" },
  deduit:         { fr:"Déduit:", de:"Abgezogen:", it:"Dedotto:", pt:"Deduzido:", es:"Deducido:", en:"Deducted:", uk:"Відраховано:" },
};

function L(key, lang) {
  return LABELS[key]?.[lang] || LABELS[key]?.["fr"] || key;
}

function fCHF(v) {
  if (!v || v === 0) return "CHF 0";
  return "CHF " + Math.round(v).toLocaleString("fr-CH");
}

// ── GÉNÉRATEUR PRINCIPAL ────────────────────────────────────────────────
export function genererRapportFiscal({ data, result, lang = "fr", canton = "JU", b2bFirm = null }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const M = 15; // margin
  const CW = W - 2 * M; // content width

  let y = 0;

  // ── helper draw functions ─────────────────────────────────────────────
  function setColor(rgb) { doc.setTextColor(...rgb); }
  function setFill(rgb)  { doc.setFillColor(...rgb); }
  function setDraw(rgb)  { doc.setDrawColor(...rgb); }

  function rect(x, ry, w, h, fill) {
    if (fill) { setFill(fill); doc.rect(x, ry, w, h, "F"); }
  }

  function line(x1, y1, x2, y2, color = GREY) {
    setDraw(color);
    doc.setLineWidth(0.3);
    doc.line(x1, y1, x2, y2);
  }

  function text(txt, x, ty, opts = {}) {
    const { size = 9, color = [33, 37, 41], bold = false, align = "left", maxW } = opts;
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    setColor(color);
    if (maxW) {
      const lines = doc.splitTextToSize(txt, maxW);
      doc.text(lines, x, ty, { align });
      return lines.length * (size * 0.4);
    }
    doc.text(txt, x, ty, { align });
    return size * 0.4;
  }

  // ── HEADER ─────────────────────────────────────────────────────────────
  rect(0, 0, W, 22, DARK);
  rect(0, 22, W, 3, GOLD);

  // Logo zone
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.text("JurAI Tax", M, 13);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  doc.text("PEP's Swiss SA · Bellevue 7 · 2950 Courgenay · Jura", M, 19);

  // Titre rapport (droite)
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text(L("title", lang), W - M, 11, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GOLD);
  doc.text(`${L("annee", lang)} ${new Date().getFullYear() - 1} · Canton ${canton}`, W - M, 18, { align: "right" });

  y = 30;

  // ── IDENTITÉ CLIENT ────────────────────────────────────────────────────
  const nom = `${data.prenom || ""} ${data.nom || ""}`.trim() || "—";
  const commune = data.commune || "—";
  const contribuable = data.no_contribuable ? `N° ${data.no_contribuable}` : "";

  rect(M, y, CW, 14, LIGHT);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.rect(M, y, CW, 14, "D");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text(nom, M + 5, y + 8);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GREY);
  const rightInfo = [commune, contribuable, b2bFirm || ""].filter(Boolean).join("  ·  ");
  doc.text(rightInfo, W - M - 5, y + 8, { align: "right" });

  y += 19;

  // ── BASE LÉGALE ────────────────────────────────────────────────────────
  rect(M, y, CW, 11, [232, 240, 254]);
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.5);
  doc.rect(M, y, 2, 11, "F");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...ACCENT);
  doc.text(L("base_legale", lang) + ":", M + 5, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...[33, 37, 41]);
  const baseLegale = canton === "TI"
    ? "Legge tributaria del Cantone Ticino (LT) · Legge federale sull'imposta federale diretta (LIFD) 2025"
    : canton === "NE"
    ? "Loi sur les contributions directes du Canton de Neuchâtel (LCdir) · LIFD · Édition 2025"
    : canton === "ZH"
    ? "Steuergesetz des Kantons Zürich (StG) · Bundesgesetz über die direkte Bundessteuer (DBG) 2025"
    : "Loi cantonale sur les contributions directes (LJDF Jura) · Loi fédérale sur l'impôt fédéral direct (LIFD) · Édition 2025";
  doc.text(baseLegale, M + 5, y + 9.5);

  y += 15;

  // ── SECTION RAISONNEMENT ───────────────────────────────────────────────
  rect(M, y, CW, 7, DARK);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.text(L("raisonnement", lang), M + 4, y + 5);
  y += 10;

  // ── Construire les sections dynamiques ────────────────────────────────
  const sections = [];
  const d = result?.detail || {};

  if (d.pilier3a > 0)
    sections.push({ icon: "🏦", title: L("s_3a", lang), amount: d.pilier3a, desc: L("d_3a", lang) });

  if (d.rachatLPP > 0)
    sections.push({ icon: "💼", title: L("s_lpp", lang), amount: d.rachatLPP, desc: L("d_lpp", lang) });

  const immVal = parseFloat(data.for_immobilier || 0);
  if (immVal > 0) {
    const forfait = immVal * 0.2;
    const reel = parseFloat(data.frais_entretien_reel || 0);
    const useForfait = reel === 0 || forfait >= reel;
    sections.push({
      icon: "🏠",
      title: L("s_entretien", lang),
      amount: useForfait ? forfait : reel,
      desc: useForfait ? L("d_entretien_f", lang) : L("d_entretien_r", lang)
    });
  }

  if (d.fraisGardeDeductibles > 0)
    sections.push({ icon: "👨‍👩‍👧", title: L("s_garde", lang), amount: d.fraisGardeDeductibles, desc: L("d_garde", lang) });

  if (d.fraisMaladieDeductibles > 0)
    sections.push({ icon: "🏥", title: L("s_medicaux", lang), amount: d.fraisMaladieDeductibles, desc: L("d_medicaux", lang) });

  if (d.primesDeductibles > 0)
    sections.push({ icon: "🛡️", title: L("s_primes", lang), amount: d.primesDeductibles, desc: L("d_primes", lang) });

  if (d.donsDeductibles > 0)
    sections.push({ icon: "🤝", title: L("s_dons", lang), amount: d.donsDeductibles, desc: L("d_dons", lang) });

  // Hauteur disponible pour les sections (réserver 60mm pour récap + footer)
  const maxY = 255;
  const availH = maxY - y;
  const sectionH = sections.length > 0 ? Math.min(24, availH / sections.length) : 24;

  sections.forEach((sec, i) => {
    const alt = i % 2 === 0;
    const rowH = sectionH;

    if (y + rowH > maxY) return; // safety

    rect(M, y, CW, rowH, alt ? [255, 255, 255] : LIGHT);
    line(M, y + rowH, M + CW, y + rowH, [222, 226, 230]);

    // Barre couleur latérale
    setFill(GOLD);
    doc.rect(M, y, 1.5, rowH, "F");

    // Titre + montant
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(sec.title, M + 5, y + 5.5);

    // Montant (droit)
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GREEN);
    doc.text(`−${fCHF(sec.amount)}`, W - M - 3, y + 5.5, { align: "right" });

    // Description
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GREY);
    const descLines = doc.splitTextToSize(sec.desc, CW - 10);
    const descShown = descLines.slice(0, 2);
    doc.text(descShown, M + 5, y + 10.5);

    y += rowH;
  });

  if (sections.length === 0) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...GREY);
    doc.text("Aucune déduction spécifique significative — déclaration standard appliquée.", M + 4, y + 7);
    y += 12;
  }

  y += 4;

  // ── RÉCAPITULATIF ──────────────────────────────────────────────────────
  if (y < maxY) {
    rect(M, y, CW, 7, DARK);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GOLD);
    doc.text(L("recapitulatif", lang), M + 4, y + 5);
    y += 9;

    const revBrut = parseFloat(data.rev_salaire || 0) + parseFloat(data.rev_avs || 0) +
                    parseFloat(data.rev_lpp || 0) + parseFloat(data.rev_independant || 0);
    const totalDed = sections.reduce((s, sec) => s + (sec.amount || 0), 0);
    const revNet = result?.revenuImposable || (revBrut - totalDed);
    const impot = result?.impotTotal || 0;

    // Estimation économie (comparaison impôt sans déductions)
    const impotSansDed = result?.impotSansDed || null;
    const economie = impotSansDed ? Math.max(0, impotSansDed - impot) : null;

    const rows = [
      { label: L("revenu_init", lang),  value: fCHF(revBrut),  color: [33, 37, 41] },
      { label: L("total_ded", lang),    value: `−${fCHF(totalDed)}`, color: GREEN },
      { label: L("revenu_impos", lang), value: fCHF(revNet),   color: ACCENT, bold: true },
      { label: L("impot_total", lang),  value: fCHF(impot),    color: RED, bold: true },
    ];
    if (economie !== null && economie > 0)
      rows.push({ label: L("economie", lang), value: `−${fCHF(economie)}`, color: GREEN, bold: true });

    rows.forEach((row, i) => {
      const rh = 8;
      const alt = i % 2 === 0;
      rect(M, y, CW, rh, alt ? [255, 255, 255] : LIGHT);
      line(M, y + rh, M + CW, y + rh, [222, 226, 230]);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", row.bold ? "bold" : "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(row.label, M + 5, y + 5.5);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...row.color);
      doc.text(row.value, W - M - 3, y + 5.5, { align: "right" });
      y += rh;
    });

    // Boite impôt total mise en valeur
    y += 2;
    rect(M, y, CW, 12, [26, 26, 46]);
    rect(M, y, 3, 12, GOLD);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...WHITE);
    doc.text(L("impot_total", lang), M + 7, y + 8);
    doc.setFontSize(13);
    doc.setTextColor(...GOLD);
    doc.text(fCHF(impot), W - M - 4, y + 8, { align: "right" });
    y += 15;
  }

  // ── FOOTER ─────────────────────────────────────────────────────────────
  rect(0, 282, W, 15, DARK);
  rect(0, 282, W, 1.5, GOLD);

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  const footerLines = doc.splitTextToSize(L("footer_doc", lang), CW);
  doc.text(footerLines[0] || "", M, 286);
  if (footerLines[1]) doc.text(footerLines[1], M, 290);

  doc.setTextColor(...GOLD);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("JurAI Tax · PEP's Swiss SA · admin@juraitax.ch", W - M, 286, { align: "right" });
  doc.text("WIN WIN Finance Group SARL · FINMA F01042365", W - M, 291, { align: "right" });

  // ── TÉLÉCHARGEMENT ──────────────────────────────────────────────────────
  const filename = `JurAI_Tax_Rapport_${nom.replace(/\s+/g, "_")}_${new Date().getFullYear() - 1}.pdf`;
  doc.save(filename);
}
