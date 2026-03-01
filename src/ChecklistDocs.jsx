// ═══════════════════════════════════════════════════════════════════════
//  JurAI Tax — Checklist Documents A4 · Écran "Préparez vos documents"
//  UX Mobile-first · Camera capture · 7 langues · Mars 2026
// ═══════════════════════════════════════════════════════════════════════

import { useState, useRef } from "react";
import { useStore, SOURCE } from "./store";
import { ocrDocument, applyOCRToStore } from "./ocr";
import { genererQuestionsIA } from "./FiscalAdvisor";
import { AdvisorScreen } from "./AdvisorScreen";
import { GlobalStyles, T as S } from "./ui";
import LangSelector from "./LangSelector";
import { useT } from "./i18n";

// ── LISTE COMPLÈTE DES DOCUMENTS ──────────────────────────────────────
const DOCS = (t) => ([
  {
    id: "identity",
    icon: "👤",
    category: { fr:"Identité & Situation", de:"Identität & Situation", it:"Identità & Situazione", pt:"Identidade & Situação", es:"Identidad & Situación", en:"Identity & Situation", uk:"Особистість та ситуація" },
    docs: [
      { id:"di_prev",    required: true,  icon:"📋", label:{ fr:"Déclaration d'impôt 2024 (N-1)", de:"Steuererklärung 2024 (N-1)", it:"Dichiarazione 2024 (N-1)", pt:"Declaração 2024 (N-1)", es:"Declaración 2024 (N-1)", en:"2024 tax return (N-1)", uk:"Декларація 2024 (N-1)" }, hint:{ fr:"Optionnel — l'IA importe uniquement votre identité", de:"Optional — KI importiert nur Ihre Identität", it:"Facoltativo — l'IA importa solo la vostra identità", pt:"Opcional — a IA importa apenas a sua identidade", es:"Opcional — la IA importa solo su identidad", en:"Optional — AI imports your identity only", uk:"Необов'язково — ШІ імпортує лише вашу особистість" }, required: false, camera: true },
      { id:"permis",     required: false, icon:"🪪", label:{ fr:"Carte d'identité / Permis de séjour", de:"Ausweis / Aufenthaltsbewilligung", it:"Carta d'identità / Permesso di soggiorno", pt:"Bilhete de identidade / Autorização de residência", es:"DNI / Permiso de residencia", en:"ID card / Residence permit", uk:"Посвідчення особи / Дозвіл на проживання" }, hint:{ fr:"Utile si votre commune ou confession ont changé", de:"Nützlich bei Änderung von Gemeinde oder Konfession", it:"Utile se la vostra comune o confessione è cambiata", pt:"Útil se o seu município ou confissão mudou", es:"Útil si su municipio o confesión ha cambiado", en:"Useful if your municipality or denomination changed", uk:"Корисно якщо змінилися муніципалітет або конфесія" }, camera: true },
    ]
  },
  {
    id: "revenus",
    icon: "💰",
    category: { fr:"Revenus", de:"Einkommen", it:"Redditi", pt:"Rendimentos", es:"Ingresos", en:"Income", uk:"Доходи" },
    docs: [
      { id:"cert_sal",   required: true,  icon:"📄", label:{ fr:"Certificat de salaire 2025", de:"Lohnausweis 2025", it:"Certificato di salario 2025", pt:"Certificado de salário 2025", es:"Certificado de salario 2025", en:"2025 salary certificate", uk:"Сертифікат зарплати 2025" }, hint:{ fr:"Remis par votre employeur (formulaire officiel)", de:"Von Ihrem Arbeitgeber ausgestellt (offizielles Formular)", it:"Rilasciato dal vostro datore di lavoro (modulo ufficiale)", pt:"Emitido pelo seu empregador (formulário oficial)", es:"Emitido por su empleador (formulario oficial)", en:"Issued by your employer (official form)", uk:"Виданий вашим роботодавцем (офіційна форма)" }, camera: true },
      { id:"avs",        required: false, icon:"🏛️", label:{ fr:"Attestation rente AVS/AI (OCAS)", de:"AHV/IV-Rentenbestätigung (AKOS)", it:"Attestato rendita AVS/AI (OCAS)", pt:"Comprovativo renda AVS/AI (OCAS)", es:"Certificado renta AVS/AI (OCAS)", en:"AVS/AI pension statement (OCAS)", uk:"Підтвердження пенсії AVS/AI (OCAS)" }, hint:{ fr:"Si vous percevez une rente AVS, AI ou APG", de:"Bei Bezug einer AHV-, IV- oder EO-Rente", it:"Se percepite una rendita AVS, AI o IPG", pt:"Se receber uma renda AVS, AI ou APG", es:"Si recibe una renta AVS, AI o APG", en:"If you receive an AVS, AI or APG pension", uk:"Якщо ви отримуєте пенсію AVS, AI або APG" }, camera: true },
      { id:"lpp_att",    required: false, icon:"🏦", label:{ fr:"Attestation rente LPP / caisse de pension", de:"BVG-Renten- / Pensionskassenausweis", it:"Attestato rendita LPP / cassa pensioni", pt:"Comprovativo renda LPP / fundo de pensões", es:"Certificado renta LPP / fondo de pensiones", en:"LPP pension / pension fund statement", uk:"Підтвердження пенсії LPP / пенсійного фонду" }, hint:{ fr:"Si vous percevez une rente de caisse de pension", de:"Bei Bezug einer Pensionskassenrente", it:"Se percepite una rendita dalla cassa pensioni", pt:"Se receber uma renda do fundo de pensões", es:"Si recibe una renta del fondo de pensiones", en:"If you receive pension fund income", uk:"Якщо ви отримуєте дохід пенсійного фонду" }, camera: true },
      { id:"independant",required: false, icon:"🏢", label:{ fr:"Bilan & compte de résultat (indépendants)", de:"Bilanz & Erfolgsrechnung (Selbständige)", it:"Bilancio & conto economico (indipendenti)", pt:"Balanço & conta de resultados (independentes)", es:"Balance & cuenta de resultados (independientes)", en:"Balance sheet & P&L (self-employed)", uk:"Баланс та звіт про прибутки (самозайняті)" }, hint:{ fr:"Uniquement si vous exercez une activité indépendante", de:"Nur bei selbständiger Erwerbstätigkeit", it:"Solo se esercitate un'attività indipendente", pt:"Apenas se exercer uma atividade independente", es:"Solo si ejerce una actividad independiente", en:"Only if you are self-employed", uk:"Лише якщо ви є самозайнятою особою" }, camera: false },
      { id:"dividendes", required: false, icon:"📈", label:{ fr:"Relevés titres / dividendes / coupons 2025", de:"Wertschriftenausweis / Dividenden 2025", it:"Estratti titoli / dividendi / cedole 2025", pt:"Extratos de títulos / dividendos / cupões 2025", es:"Extractos valores / dividendos / cupones 2025", en:"Securities / dividends / coupons 2025", uk:"Витяги цінних паперів / дивіденди 2025" }, hint:{ fr:"Relevé fiscal annuel de votre banque (attestation IS)", de:"Jährlicher Steuerausweis Ihrer Bank", it:"Estratto fiscale annuale della vostra banca", pt:"Extrato fiscal anual do seu banco", es:"Extracto fiscal anual de su banco", en:"Annual tax statement from your bank", uk:"Річна податкова виписка вашого банку" }, camera: true },
      { id:"chomage",    required: false, icon:"📑", label:{ fr:"Attestation indemnités chômage (APG)", de:"Bescheinigung Arbeitslosengeld (ALV)", it:"Attestato indennità disoccupazione (IPG)", pt:"Declaração subsídio de desemprego (APG)", es:"Certificado prestación desempleo (APG)", en:"Unemployment benefit statement (APG)", uk:"Довідка допомоги з безробіття (APG)" }, hint:{ fr:"Si vous avez perçu des indemnités chômage en 2025", de:"Bei Bezug von Arbeitslosengeldern in 2025", it:"Se avete percepito indennità di disoccupazione nel 2025", pt:"Se recebeu subsídio de desemprego em 2025", es:"Si percibió prestación de desempleo en 2025", en:"If you received unemployment benefit in 2025", uk:"Якщо ви отримували допомогу з безробіття у 2025" }, camera: true },
    ]
  },
  {
    id: "deductions",
    icon: "✂️",
    category: { fr:"Déductions & Épargne", de:"Abzüge & Vorsorge", it:"Deduzioni & Previdenza", pt:"Deduções & Poupança", es:"Deducciones & Ahorro", en:"Deductions & Savings", uk:"Відрахування та заощадження" },
    docs: [
      { id:"3a",         required: false, icon:"🏦", label:{ fr:"Attestation pilier 3a 2025 (banque / assurance)", de:"Säule-3a-Bescheinigung 2025 (Bank / Versicherung)", it:"Attestato pilastro 3a 2025 (banca / assicurazione)", pt:"Comprovativo pilar 3a 2025 (banco / seguradora)", es:"Certificado pilar 3a 2025 (banco / aseguradora)", en:"Pillar 3a certificate 2025 (bank / insurer)", uk:"Сертифікат стовпа 3a 2025 (банк / страховик)" }, hint:{ fr:"Plafond 2025: CHF 7'258 (salarié) · CHF 36'288 (indépendant)", de:"Grenze 2025: CHF 7'258 (Angestellte) · CHF 36'288 (Selbständige)", it:"Limite 2025: CHF 7'258 (dipendente) · CHF 36'288 (indipendente)", pt:"Limite 2025: CHF 7'258 (assalariado) · CHF 36'288 (independente)", es:"Límite 2025: CHF 7'258 (asalariado) · CHF 36'288 (independiente)", en:"2025 limit: CHF 7,258 (employee) · CHF 36,288 (self-employed)", uk:"Ліміт 2025: CHF 7'258 (найманий) · CHF 36'288 (самозайнятий)" }, camera: true },
      { id:"rachat_lpp", required: false, icon:"💼", label:{ fr:"Confirmation rachat LPP (caisse de pension)", de:"Bestätigung BVG-Einkauf (Pensionskasse)", it:"Conferma riscatto LPP (cassa pensioni)", pt:"Confirmação resgate LPP (fundo de pensões)", es:"Confirmación rescate LPP (fondo de pensiones)", en:"LPP buy-in confirmation (pension fund)", uk:"Підтвердження викупу LPP (пенсійний фонд)" }, hint:{ fr:"Déduction intégrale — très important à ne pas oublier!", de:"Vollständig abzugsfähig — sehr wichtig, nicht vergessen!", it:"Deduzione integrale — molto importante da non dimenticare!", pt:"Dedução integral — muito importante não esquecer!", es:"Deducción íntegra — ¡muy importante no olvidar!", en:"Full deduction — very important, don't forget!", uk:"Повне відрахування — дуже важливо не забути!" }, camera: true, highlight: true },
      { id:"frm_prof",   required: false, icon:"🎓", label:{ fr:"Attestation formation professionnelle / cours", de:"Berufsausbildungsnachweis / Kursbestätigung", it:"Attestato formazione professionale / corsi", pt:"Comprovativo formação profissional / cursos", es:"Certificado formación profesional / cursos", en:"Professional training / course certificate", uk:"Сертифікат професійної підготовки / курси" }, hint:{ fr:"Frais de formation liés à votre activité professionnelle actuelle", de:"Berufsauslagen für aktuelle berufliche Tätigkeit", it:"Spese di formazione legate alla vostra attività professionale attuale", pt:"Despesas de formação ligadas à sua atividade profissional atual", es:"Gastos de formación vinculados a su actividad profesional actual", en:"Training costs related to your current professional activity", uk:"Витрати на навчання пов'язані з вашою поточною професійною діяльністю" }, camera: true },
      { id:"medicaux",   required: false, icon:"🏥", label:{ fr:"Factures frais médicaux non remboursés 2025", de:"Nicht erstattete Krankheitskosten 2025", it:"Fatture spese mediche non rimborsate 2025", pt:"Faturas despesas médicas não reembolsadas 2025", es:"Facturas gastos médicos no reembolsados 2025", en:"Unreimbursed medical expense invoices 2025", uk:"Рахунки невідшкодованих медичних витрат 2025" }, hint:{ fr:"Déductibles au-delà de 5% du revenu net (IFD) ou 5% (ICC Jura)", de:"Abzugsfähig über 5% des Nettoeinkommens (DBSt/kant. Steuer)", it:"Deducibili oltre il 5% del reddito netto (LIFD)", pt:"Dedutíveis acima de 5% do rendimento líquido (LIFD)", es:"Deducibles por encima del 5% de la renta neta (LIFD)", en:"Deductible above 5% of net income (FDTA)", uk:"Вираховуються понад 5% чистого доходу (LIFD)" }, camera: true },
      { id:"garde",      required: false, icon:"👶", label:{ fr:"Justificatifs frais de garde d'enfants", de:"Kinderbetreuungskostenbelege", it:"Giustificativi spese di custodia dei figli", pt:"Comprovativos custos de guarda de crianças", es:"Justificantes gastos de guardería", en:"Childcare cost receipts", uk:"Підтверджуючі документи витрат на догляд за дітьми" }, hint:{ fr:"Crèche, garderie, famille de jour — factures officielles", de:"Krippe, Kita, Tagesfamilie — offizielle Rechnungen", it:"Asilo nido, centro diurno, famiglia diurna — fatture ufficiali", pt:"Creche, jardim de infância — faturas oficiais", es:"Guardería, jardín de infancia — facturas oficiales", en:"Nursery, daycare — official invoices", uk:"Ясла, дитячий садок — офіційні рахунки" }, camera: true },
      { id:"dons",       required: false, icon:"🤝", label:{ fr:"Reçus de dons à des associations reconnues", de:"Spendenbelege an anerkannte Organisationen", it:"Ricevute donazioni ad associazioni riconosciute", pt:"Recibos de donativos a associações reconhecidas", es:"Recibos de donaciones a organizaciones reconocidas", en:"Donation receipts from recognised organisations", uk:"Квитанції пожертв до визнаних організацій" }, hint:{ fr:"Maximum déductible: 20% du revenu net", de:"Maximal abzugsfähig: 20% des Nettoeinkommens", it:"Massimo deducibile: 20% del reddito netto", pt:"Máximo dedutível: 20% do rendimento líquido", es:"Máximo deducible: 20% de la renta neta", en:"Maximum deductible: 20% of net income", uk:"Максимально вираховуваний: 20% чистого доходу" }, camera: true },
      { id:"pension_al", required: false, icon:"👨‍👩‍👧", label:{ fr:"Attestation pension alimentaire versée/reçue", de:"Nachweis geleisteter/erhaltener Unterhaltsbeiträge", it:"Attestato alimenti versati/ricevuti", pt:"Comprovativo pensão alimentar paga/recebida", es:"Certificado pensión alimenticia pagada/recibida", en:"Alimony paid/received certificate", uk:"Підтвердження сплачених/отриманих аліментів" }, hint:{ fr:"Jugement de divorce ou convention homologuée", de:"Scheidungsurteil oder genehmigte Vereinbarung", it:"Sentenza di divorzio o accordo omologato", pt:"Sentença de divórcio ou convenção homologada", es:"Sentencia de divorcio o convenio homologado", en:"Divorce decree or approved agreement", uk:"Рішення про розлучення або затверджена угода" }, camera: true },
    ]
  },
  {
    id: "fortune",
    icon: "🏦",
    category: { fr:"Fortune & Dettes", de:"Vermögen & Schulden", it:"Sostanza & Debiti", pt:"Fortuna & Dívidas", es:"Patrimonio & Deudas", en:"Assets & Debts", uk:"Майно та борги" },
    docs: [
      { id:"comptes",    required: true,  icon:"🏧", label:{ fr:"Extraits de compte bancaire au 31.12.2025 (TOUS les comptes)", de:"Kontoauszüge per 31.12.2025 (ALLE Konten)", it:"Estratti conto bancari al 31.12.2025 (TUTTI i conti)", pt:"Extratos de conta bancária em 31.12.2025 (TODAS as contas)", es:"Extractos de cuenta bancaria a 31.12.2025 (TODAS las cuentas)", en:"Bank statements at 31.12.2025 (ALL accounts)", uk:"Банківські виписки станом на 31.12.2025 (ВСІ рахунки)" }, hint:{ fr:"Solde exact au 31 décembre — déterminant pour l'impôt sur la fortune", de:"Exakter Saldo per 31. Dezember — massgebend für die Vermögenssteuer", it:"Saldo esatto al 31 dicembre — determinante per l'imposta sulla sostanza", pt:"Saldo exato em 31 de dezembro — determinante para o imposto sobre a fortuna", es:"Saldo exacto a 31 de diciembre — determinante para el impuesto sobre el patrimonio", en:"Exact balance at 31 December — determining for wealth tax", uk:"Точний залишок на 31 грудня — визначальний для податку на майно" }, camera: true },
      { id:"hypotheque", required: false, icon:"🏠", label:{ fr:"Situation hypothécaire — décompte d'intérêts 2025", de:"Hypothekarsituation — Zinsabrechnung 2025", it:"Situazione ipotecaria — conteggio interessi 2025", pt:"Situação hipotecária — extrato de juros 2025", es:"Situación hipotecaria — liquidación de intereses 2025", en:"Mortgage situation — interest statement 2025", uk:"Іпотечна ситуація — виписка відсотків 2025" }, hint:{ fr:"Attestation annuelle de votre banque (intérêts + solde capital)", de:"Jährliche Bestätigung Ihrer Bank (Zinsen + Kapitalschuld)", it:"Attestato annuale della vostra banca (interessi + capitale)", pt:"Declaração anual do seu banco (juros + saldo capital)", es:"Certificado anual de su banco (intereses + saldo capital)", en:"Annual certificate from your bank (interest + capital balance)", uk:"Щорічна виписка вашого банку (відсотки + залишок капіталу)" }, camera: true, highlight: true },
      { id:"immobilier", required: false, icon:"🏡", label:{ fr:"Valeur fiscale de l'immeuble / appartement", de:"Steuerwert der Liegenschaft / Wohnung", it:"Valore fiscale dell'immobile / appartamento", pt:"Valor fiscal do imóvel / apartamento", es:"Valor fiscal del inmueble / apartamento", en:"Fiscal value of property / apartment", uk:"Фіскальна вартість нерухомості / квартири" }, hint:{ fr:"Disponible auprès de la commune ou sur l'avis de taxation précédent", de:"Erhältlich bei der Gemeinde oder aus dem letzten Steuerveranlagungsbescheid", it:"Disponibile presso il comune o sull'avviso di tassazione precedente", pt:"Disponível na junta de freguesia ou no aviso de tributação anterior", es:"Disponible en el ayuntamiento o en el aviso de imposición anterior", en:"Available from the municipality or on the previous tax assessment", uk:"Доступна в муніципалітеті або у попередньому повідомленні про оподаткування" }, camera: true },
      { id:"entretien",  required: false, icon:"🔧", label:{ fr:"Factures entretien d'immeuble 2025 (frais réels)", de:"Unterhaltsrechnungen 2025 (effektive Kosten)", it:"Fatture manutenzione immobile 2025 (costi effettivi)", pt:"Faturas manutenção imóvel 2025 (custos reais)", es:"Facturas mantenimiento inmueble 2025 (costes reales)", en:"Property maintenance invoices 2025 (actual costs)", uk:"Рахунки за обслуговування нерухомості 2025 (фактичні витрати)" }, hint:{ fr:"Si vous avez eu des travaux d'entretien (non valeur ajoutée). L'IA compare forfait 20% vs réel", de:"Bei Unterhaltsarbeiten (keine Wertvermehrung). KI vergleicht 20% Pauschale vs. effektiv", it:"Se avete avuto lavori di manutenzione (non a valore aggiunto). L'IA confronta forfait 20% vs effettivo", pt:"Se teve trabalhos de manutenção (não valorização). A IA compara forfait 20% vs real", es:"Si tuvo trabajos de mantenimiento (no de valorización). La IA compara forfait 20% vs real", en:"If you had maintenance work (not capital improvements). AI compares 20% flat rate vs actual", uk:"Якщо були ремонтні роботи (не капітальні). ШІ порівнює 20% фіксовану ставку та фактичні витрати" }, camera: true },
      { id:"leasing",    required: false, icon:"🚗", label:{ fr:"Contrats de leasing / dettes en cours 2025", de:"Leasingverträge / laufende Schulden 2025", it:"Contratti di leasing / debiti in corso 2025", pt:"Contratos de leasing / dívidas em curso 2025", es:"Contratos de leasing / deudas en curso 2025", en:"Leasing contracts / current debts 2025", uk:"Лізингові контракти / поточні борги 2025" }, hint:{ fr:"Solde dû au 31.12.2025 — à déclarer dans les dettes", de:"Ausstehender Saldo per 31.12.2025 — als Schulden zu deklarieren", it:"Saldo dovuto al 31.12.2025 — da dichiarare nei debiti", pt:"Saldo devido em 31.12.2025 — a declarar nas dívidas", es:"Saldo pendiente al 31.12.2025 — a declarar en las deudas", en:"Balance due at 31.12.2025 — to declare in debts", uk:"Залишок на 31.12.2025 — декларувати у боргах" }, camera: true },
      { id:"assurance_v",required: false, icon:"📋", label:{ fr:"Polices assurance-vie (valeur de rachat au 31.12.2025)", de:"Lebensversicherungspolicen (Rückkaufswert per 31.12.2025)", it:"Polizze assicurazione vita (valore di riscatto al 31.12.2025)", pt:"Apólices de seguro de vida (valor de resgate em 31.12.2025)", es:"Pólizas de seguro de vida (valor de rescate al 31.12.2025)", en:"Life insurance policies (surrender value at 31.12.2025)", uk:"Поліси страхування життя (викупна вартість на 31.12.2025)" }, hint:{ fr:"Attestation annuelle de votre compagnie d'assurance", de:"Jährliche Bestätigung Ihrer Versicherungsgesellschaft", it:"Attestato annuale della vostra compagnia di assicurazione", pt:"Declaração anual da sua companhia de seguros", es:"Certificado anual de su compañía de seguros", en:"Annual certificate from your insurance company", uk:"Щорічна довідка вашої страхової компанії" }, camera: true },
    ]
  }
]);

// ── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────
export function ChecklistScreen() {
  const { setScreen, lang, cantonConfig } = useStore();
  const t = useT(lang);
  const [checked, setChecked] = useState({});
  const [uploads, setUploads] = useState({});
  const [expanded, setExpanded] = useState({ identity: true, revenus: true, deductions: false, fortune: false });
  const [ocrStatus, setOcrStatus] = useState({}); // { docId: 'loading'|'done'|'error' }
  const [advisorData, setAdvisorData] = useState(null);
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [allOcrResults, setAllOcrResults] = useState({});
  const fileRefs = useRef({});

  const docs = DOCS(t);
  const L = (obj) => obj?.[lang] || obj?.fr || "";

  const allRequired = docs.flatMap(cat => cat.docs.filter(d => d.required));
  const totalDocs = docs.flatMap(cat => cat.docs).length;
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const uploadCount = Object.values(uploads).filter(Boolean).length;
  const progress = Math.round(((checkedCount + uploadCount) / (totalDocs * 2)) * 100);
  const canProceed = allRequired.every(d => checked[d.id] || uploads[d.id]);

  const { importFromDoc } = useStore();

  async function handleUpload(docId, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploads(u => ({ ...u, [docId]: file }));
    setChecked(c => ({ ...c, [docId]: true }));
    
    // Lancer OCR automatiquement
    setOcrStatus(s => ({ ...s, [docId]: "loading" }));
    try {
      const result = await ocrDocument(file, docId);
      if (!result._error) {
        applyOCRToStore(result, importFromDoc, null, SOURCE);
        setOcrStatus(s => ({ ...s, [docId]: "done" }));
        setAllOcrResults(r => ({ ...r, [docId]: result }));
      } else {
        setOcrStatus(s => ({ ...s, [docId]: "error" }));
      }
    } catch {
      setOcrStatus(s => ({ ...s, [docId]: "error" }));
    }
  }

  function toggleCheck(docId) {
    setChecked(c => ({ ...c, [docId]: !c[docId] }));
  }

  const labels = {
    title:    { fr:"Préparez vos documents",           de:"Bereiten Sie Ihre Unterlagen vor",       it:"Preparate i vostri documenti",           pt:"Prepare os seus documentos",             es:"Prepare sus documentos",                 en:"Prepare your documents",                 uk:"Підготуйте ваші документи" },
    subtitle: { fr:"Cochez chaque document disponible ou téléversez-le directement. L'IA s'occupe du reste.", de:"Haken Sie verfügbare Dokumente ab oder laden Sie sie hoch. Die KI erledigt den Rest.", it:"Spuntate i documenti disponibili o caricateli. L'IA fa il resto.", pt:"Marque os documentos disponíveis ou carregue-os. A IA trata do resto.", es:"Marque los documentos disponibles o súbalos. La IA hace el resto.", en:"Tick each available document or upload it directly. AI does the rest.", uk:"Позначте кожен доступний документ або завантажте його. ШІ зробить решту." },
    proceed:  { fr:"Commencer ma déclaration →",       de:"Steuererklärung starten →",              it:"Inizia la mia dichiarazione →",           pt:"Iniciar a minha declaração →",            es:"Iniciar mi declaración →",               en:"Start my tax return →",                   uk:"Почати мою декларацію →" },
    docs_ok:  { fr:"document(s) prêt(s)",              de:"Dokument(e) bereit",                     it:"documento/i pronto/i",                    pt:"documento(s) pronto(s)",                  es:"documento(s) listo(s)",                  en:"document(s) ready",                      uk:"документ(и) готовий/і" },
    photo:    { fr:"📷 Photo",                          de:"📷 Foto",                                it:"📷 Foto",                                  pt:"📷 Foto",                                 es:"📷 Foto",                                en:"📷 Photo",                               uk:"📷 Фото" },
    upload:   { fr:"📎 Fichier",                        de:"📎 Datei",                               it:"📎 File",                                  pt:"📎 Ficheiro",                             es:"📎 Archivo",                             en:"📎 File",                               uk:"📎 Файл" },
    required: { fr:"Recommandé",                        de:"Empfohlen",                              it:"Consigliato",                              pt:"Recomendado",                             es:"Recomendado",                            en:"Recommended",                            uk:"Рекомендовано" },
    skip:     { fr:"Passer sans ce document",           de:"Ohne dieses Dokument weiter",            it:"Continua senza questo documento",          pt:"Continuar sem este documento",            es:"Continuar sin este documento",           en:"Skip this document",                     uk:"Пропустити цей документ" },
  };

  return (
    <div style={{ minHeight:"100vh", background: S.bg, paddingBottom: 120 }}>
      <GlobalStyles />
      <div style={{ position:"fixed", top:16, right:16, zIndex:100 }}><LangSelector /></div>

      {/* HEADER FIXE AVEC PROGRESS */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: `linear-gradient(180deg, ${S.bg} 85%, transparent)`,
        paddingBottom: 8,
      }}>
        <div style={{ maxWidth: 640, margin:"0 auto", padding: "16px 20px 0" }}>
          {/* Back + titre */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom: 12 }}>
            <button onClick={() => setScreen("welcome")}
              style={{ background:"none", border:`1px solid ${S.border}`, color: S.textDim,
                       borderRadius: 8, padding:"6px 12px", cursor:"pointer", fontSize:13, fontFamily:"'Outfit',sans-serif" }}>
              ← {t("nav_back")}
            </button>
            <div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: 22, color: S.cream, fontWeight: 300 }}>
                {L(labels.title)}
              </div>
              <div style={{ fontSize: 10, color: S.textDim, fontFamily:"'Outfit',sans-serif" }}>
                {cantonConfig?.appName || "JurAI Tax"} · {checkedCount + uploadCount} {L(labels.docs_ok)}
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div style={{ background: S.card, borderRadius: 99, height: 6, overflow:"hidden", border:`1px solid ${S.border}` }}>
            <div style={{
              height:"100%", width:`${Math.min(progress, 100)}%`,
              background: `linear-gradient(90deg, ${S.gold}, #D4B55A)`,
              borderRadius: 99, transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)"
            }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
            <span style={{ fontSize:10, color: S.textDim, fontFamily:"'Outfit',sans-serif" }}>
              {L(labels.subtitle).substring(0, 60)}…
            </span>
            <span style={{ fontSize:10, color: S.gold, fontFamily:"'Outfit',sans-serif", fontWeight:600 }}>
              {Math.min(progress, 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ maxWidth: 640, margin:"0 auto", padding:"8px 20px" }}>

        {docs.map(cat => (
          <div key={cat.id} style={{ marginBottom: 16 }}>
            {/* En-tête catégorie */}
            <button
              onClick={() => setExpanded(e => ({ ...e, [cat.id]: !e[cat.id] }))}
              style={{
                width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                background: S.surface, border:`1px solid ${S.border}`,
                borderRadius: expanded[cat.id] ? "12px 12px 0 0" : 12,
                padding:"14px 16px", cursor:"pointer", marginBottom: expanded[cat.id] ? 0 : 0
              }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:20 }}>{cat.icon}</span>
                <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:14, fontWeight:600, color: S.cream }}>
                  {L(cat.category)}
                </span>
                {/* Badge docs complétés dans cette catégorie */}
                {(() => {
                  const done = cat.docs.filter(d => checked[d.id] || uploads[d.id]).length;
                  return done > 0 ? (
                    <span style={{ background:`rgba(52,211,153,0.12)`, border:`1px solid rgba(52,211,153,0.25)`,
                                   borderRadius:99, padding:"2px 8px", fontSize:10, color: S.green,
                                   fontFamily:"'Outfit',sans-serif", fontWeight:600 }}>
                      {done}/{cat.docs.length}
                    </span>
                  ) : null;
                })()}
              </div>
              <span style={{ color: S.textDim, fontSize:16, transition:"transform 0.2s",
                             transform: expanded[cat.id] ? "rotate(180deg)" : "none" }}>▾</span>
            </button>

            {/* Documents de la catégorie */}
            {expanded[cat.id] && (
              <div style={{ border:`1px solid ${S.border}`, borderTop:"none", borderRadius:"0 0 12px 12px", overflow:"hidden" }}>
                {cat.docs.map((doc, i) => {
                  const isChecked = checked[doc.id];
                  const hasUpload = uploads[doc.id];
                  const isDone = isChecked || hasUpload;

                  return (
                    <div key={doc.id}
                      style={{
                        padding:"14px 16px",
                        background: isDone
                          ? `rgba(52,211,153,0.05)`
                          : doc.highlight ? `rgba(201,168,76,0.04)` : (i%2===0 ? S.card : S.surface),
                        borderBottom: i < cat.docs.length-1 ? `1px solid ${S.border}` : "none",
                        transition:"background 0.3s",
                      }}>

                      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleCheck(doc.id)}
                          style={{
                            flexShrink:0, width:24, height:24, borderRadius:6, cursor:"pointer",
                            border:`2px solid ${isDone ? "#34D399" : doc.highlight ? S.gold : S.border}`,
                            background: isDone ? "rgba(52,211,153,0.15)" : "transparent",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:14, transition:"all 0.2s", marginTop:2
                          }}>
                          {isDone ? "✓" : ""}
                        </button>

                        {/* Contenu */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:3 }}>
                            <span style={{ fontSize:16 }}>{doc.icon}</span>
                            <span style={{
                              fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:600,
                              color: isDone ? S.green : doc.highlight ? S.gold : S.cream,
                              textDecoration: isDone && !hasUpload ? "line-through" : "none",
                              opacity: isDone && !hasUpload ? 0.7 : 1,
                            }}>
                              {L(doc.label)}
                            </span>
                            {doc.highlight && !isDone && (
                              <span style={{ fontSize:9, background:`rgba(201,168,76,0.15)`, border:`1px solid rgba(201,168,76,0.3)`,
                                             color: S.gold, borderRadius:99, padding:"1px 7px",
                                             fontFamily:"'Outfit',sans-serif", fontWeight:700, letterSpacing:"0.05em" }}>
                                ★ {L(labels.required)}
                              </span>
                            )}
                            {hasUpload && (
                              <span style={{ fontSize:9, background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.25)",
                                             color: S.green, borderRadius:99, padding:"1px 7px",
                                             fontFamily:"'Outfit',sans-serif", fontWeight:700 }}>
                                ✓ {uploads[doc.id].name?.substring(0,20)}
                              </span>
                            )}
                            {ocrStatus[doc.id] === "loading" && (
                              <span style={{ fontSize:9, background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.3)",
                                             color:"#C9A84C", borderRadius:99, padding:"1px 7px",
                                             fontFamily:"'Outfit',sans-serif", fontWeight:700 }}>
                                ⏳ IA lit le document…
                              </span>
                            )}
                            {ocrStatus[doc.id] === "done" && (
                              <span style={{ fontSize:9, background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.25)",
                                             color:"#34D399", borderRadius:99, padding:"1px 7px",
                                             fontFamily:"'Outfit',sans-serif", fontWeight:700 }}>
                                ✨ Données extraites
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize:11, color: S.textDim, fontFamily:"'Outfit',sans-serif", lineHeight:1.4, marginBottom:8 }}>
                            {L(doc.hint)}
                          </div>

                          {/* Boutons upload */}
                          {doc.camera && !isDone && (
                            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                              {/* Prise de photo directe (mobile) */}
                              <label style={{
                                display:"inline-flex", alignItems:"center", gap:5,
                                background: S.surface, border:`1px solid ${S.border}`,
                                borderRadius:8, padding:"6px 12px", cursor:"pointer",
                                fontSize:12, color: S.gold, fontFamily:"'Outfit',sans-serif", fontWeight:600
                              }}>
                                {L(labels.photo)}
                                <input type="file" accept="image/*" capture="environment"
                                  style={{ display:"none" }}
                                  onChange={(e) => handleUpload(doc.id, e)} />
                              </label>
                              {/* Upload fichier (desktop) */}
                              <label style={{
                                display:"inline-flex", alignItems:"center", gap:5,
                                background: S.surface, border:`1px solid ${S.border}`,
                                borderRadius:8, padding:"6px 12px", cursor:"pointer",
                                fontSize:12, color: S.textDim, fontFamily:"'Outfit',sans-serif"
                              }}>
                                {L(labels.upload)}
                                <input type="file" accept="image/*,application/pdf,.pdf"
                                  style={{ display:"none" }}
                                  onChange={(e) => handleUpload(doc.id, e)} />
                              </label>
                            </div>
                          )}
                          {isDone && hasUpload && (
                            <button onClick={() => { setUploads(u => ({...u, [doc.id]: null})); setChecked(c=>({...c,[doc.id]:false})); }}
                              style={{ fontSize:10, color:S.muted, background:"none", border:"none", cursor:"pointer",
                                       fontFamily:"'Outfit',sans-serif", padding:0 }}>
                              ✕ Supprimer
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* SPACER pour le bouton fixe */}
        <div style={{ height: 80 }} />
      </div>

      {/* BOUTON CTA FIXE EN BAS */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:100,
        background:`linear-gradient(transparent, ${S.bg} 30%)`,
        padding:"24px 20px 28px",
      }}>
        <div style={{ maxWidth: 640, margin:"0 auto" }}>
          <button
            onClick={async () => {
              if (Object.keys(allOcrResults).length > 0 && !advisorData) {
                setAdvisorLoading(true);
                try {
                  const storeSnap = useStore.getState(); const allData = storeSnap?.getAll ? storeSnap.getAll() : {};
                  const advice = await genererQuestionsIA(allOcrResults, allData, lang);
                  setAdvisorData(advice);
                  if (advice?.questions?.length > 0) { setAdvisorLoading(false); setShowAdvisor(true); return; }
                } catch(e) { console.warn("Advisor error:", e); }
                setAdvisorLoading(false);
              }
              setScreen("form");
            }}
            style={{
              width:"100%", padding:"18px 24px",
              background: canProceed
                ? `linear-gradient(135deg, ${S.gold}, #D4B55A)`
                : S.card,
              color: canProceed ? S.bg : S.textDim,
              border: canProceed ? "none" : `1px solid ${S.border}`,
              borderRadius: 14, cursor:"pointer",
              fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:700,
              boxShadow: canProceed ? `0 8px 32px rgba(201,168,76,0.3)` : "none",
              transition:"all 0.3s",
            }}>
            {L(labels.proceed)}
            {uploadCount > 0 && (
              <span style={{ marginLeft:8, fontSize:12, opacity:0.8, fontWeight:400 }}>
                · {uploadCount} fichier{uploadCount > 1 ? "s" : ""} prêt{uploadCount > 1 ? "s" : ""}
              </span>
            )}
          </button>
          {!canProceed && (
            <button onClick={() => setScreen("form")}
              style={{ width:"100%", background:"none", border:"none", cursor:"pointer",
                       color: S.textDim, fontSize:12, fontFamily:"'Outfit',sans-serif",
                       marginTop:8, padding:4 }}>
              {L(labels.skip)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
