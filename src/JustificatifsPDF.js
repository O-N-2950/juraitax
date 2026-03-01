// ═══════════════════════════════════════════════════════════════════════
//  JurAI Tax / tAIx — Générateur Dossier Justificatifs
//  PDF regroupant toutes les pièces jointes à la déclaration d'impôt
//  Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════════════

import { jsPDF } from "jspdf";

const GOLD  = [201, 168, 76];
const DARK  = [26,  26,  46];
const GREY  = [108, 117, 125];
const WHITE = [255, 255, 255];
const GREEN = [46,  125, 50];
const BLUE  = [13,  71, 161];

// Documents obligatoires à joindre selon ce qui a été déclaré
function buildRequiredList(data, result, uploads) {
  const list = [];
  const d = result?.detail || {};

  if (d.pilier3a > 0 || uploads["3a"])
    list.push({ id:"3a", icon:"🏦", label:"Attestation Pilier 3a", ref:"Art. 33 al. 1 lit. e LIFD", obligatoire: true });

  if (d.rachatLPP > 0 || uploads["rachat_lpp"])
    list.push({ id:"rachat_lpp", icon:"💼", label:"Confirmation rachat LPP", ref:"Art. 33 al. 1 lit. d LIFD", obligatoire: true });

  if (uploads["entretien"])
    list.push({ id:"entretien", icon:"🔧", label:"Factures entretien d'immeuble", ref:"Art. 32 al. 2 LIFD", obligatoire: true });

  if (d.fraisGardeDeductibles > 0 || uploads["garde"])
    list.push({ id:"garde", icon:"👶", label:"Factures frais de garde d'enfants", ref:"Art. 33 al. 3 LIFD", obligatoire: true });

  if (d.fraisMaladieDeductibles > 0 || uploads["medicaux"])
    list.push({ id:"medicaux", icon:"🏥", label:"Factures frais médicaux non remboursés", ref:"Art. 33 al. 1 lit. h LIFD", obligatoire: true });

  if (d.donsDeductibles > 0 || uploads["dons"])
    list.push({ id:"dons", icon:"🤝", label:"Reçus de dons (organisations reconnues)", ref:"Art. 33a LIFD", obligatoire: true });

  if (d.primesDeductibles > 0 || uploads["cert_sal"])
    list.push({ id:"cert_sal", icon:"📄", label:"Certificat de salaire 2025", ref:"Art. 127 al. 1 LIFD", obligatoire: true });

  if (uploads["rachat_lpp"] || uploads["avs"])
    list.push({ id:"avs", icon:"🏛️", label:"Attestation rente AVS/AI", ref:"Art. 127 LIFD", obligatoire: false });

  return list;
}

const LABELS = {
  title:     { fr:"Dossier Pièces Justificatives",    de:"Belegsmappe",                       it:"Fascicolo Documenti Giustificativi",  pt:"Dossier Documentos Comprovativos",   es:"Dossier Documentos Justificativos",  en:"Supporting Documents File",          uk:"Папка Підтверджуючих Документів" },
  subtitle:  { fr:"À joindre à votre déclaration d'impôt", de:"Ihrer Steuererklärung beizulegen", it:"Da allegare alla vostra dichiarazione", pt:"A anexar à sua declaração",         es:"A adjuntar a su declaración",        en:"To attach to your tax return",       uk:"Додати до вашої декларації" },
  obligatoire: { fr:"OBLIGATOIRE", de:"PFLICHT", it:"OBBLIGATORIO", pt:"OBRIGATÓRIO", es:"OBLIGATORIO", en:"MANDATORY", uk:"ОБОВ'ЯЗКОВО" },
  conseille: { fr:"Conseillé", de:"Empfohlen", it:"Consigliato", pt:"Recomendado", es:"Recomendado", en:"Recommended", uk:"Рекомендовано" },
  joint:     { fr:"✓ JOINT", de:"✓ BEILIEGEND", it:"✓ ALLEGATO", pt:"✓ ANEXO", es:"✓ ADJUNTO", en:"✓ ATTACHED", uk:"✓ ДОДАНО" },
  manquant:  { fr:"À FOURNIR", de:"NACHZUREICHEN", it:"DA FORNIRE", pt:"A FORNECER", es:"A APORTAR", en:"TO PROVIDE", uk:"НАДАТИ" },
  footer:    { fr:"Présenté par JurAI Tax · PEP's Swiss SA · Bellevue 7 · 2950 Courgenay", de:"Erstellt durch JurAI Tax · PEP's Swiss SA · Bellevue 7 · 2950 Courgenay", it:"Preparato da JurAI Tax · PEP's Swiss SA · Bellevue 7 · 2950 Courgenay", pt:"Preparado por JurAI Tax · PEP's Swiss SA · Bellevue 7 · 2950 Courgenay", es:"Preparado por JurAI Tax · PEP's Swiss SA · Bellevue 7 · 2950 Courgenay", en:"Prepared by JurAI Tax · PEP's Swiss SA · Bellevue 7 · 2950 Courgenay", uk:"Підготовлено JurAI Tax · PEP's Swiss SA · Bellevue 7 · 2950 Courgenay" },
  notice:    { fr:"Ce dossier liste les pièces justificatives à joindre à votre déclaration d'impôt. Les documents marqués JOINT sont ceux que vous avez téléversés dans tAIx. Ceux marqués À FOURNIR doivent être joints manuellement à votre envoi.", de:"Diese Mappe listet die Belege auf, die Ihrer Steuererklärung beizulegen sind. Mit BEILIEGEND gekennzeichnete Dokumente wurden in tAIx hochgeladen. MIT NACHZUREICHEN gekennzeichnete müssen manuell beigelegt werden.", it:"Questo fascicolo elenca i documenti giustificativi da allegare. Quelli ALLEGATI sono stati caricati su tAIx. Quelli DA FORNIRE devono essere allegati manualmente.", pt:"Este dossier lista os documentos comprovativos a anexar. Os marcados ANEXO foram carregados no tAIx. Os marcados A FORNECER devem ser anexados manualmente.", es:"Este dossier lista los documentos justificativos a adjuntar. Los marcados ADJUNTO han sido subidos a tAIx. Los marcados A APORTAR deben adjuntarse manualmente.", en:"This file lists the supporting documents to attach to your return. Documents marked ATTACHED were uploaded in tAIx. Those marked TO PROVIDE must be attached manually.", uk:"Ця папка містить список підтверджуючих документів. Документи позначені ДОДАНО були завантажені до tAIx. Ті що позначені НАДАТИ потрібно додати вручну." },
};

function L(obj, lang) { return obj?.[lang] || obj?.fr || ""; }
function fCHF(v) { return "CHF " + Math.round(v || 0).toLocaleString("fr-CH"); }

export function genererJustificatifs({ data, result, uploads = {}, lang = "fr", canton = "JU" }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const M = 15;
  const CW = W - 2 * M;

  const nom = `${data.prenom || ""} ${data.nom || ""}`.trim() || "—";
  const required = buildRequiredList(data, result, uploads);

  // ── HEADER ────────────────────────────────────────────────────────
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, 22, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 22, W, 3, "F");

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.text("tAIx", M, 13);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  doc.text("Déclarations Fiscales Suisses Intelligentes · taix.ch", M, 19);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text(L(LABELS.title, lang), W - M, 11, { align: "right" });

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GOLD);
  doc.text(L(LABELS.subtitle, lang), W - M, 18, { align: "right" });

  let y = 30;

  // ── IDENTITÉ CONTRIBUABLE ─────────────────────────────────────────
  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.rect(M, y, CW, 14, "FD");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text(nom, M + 5, y + 8);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GREY);
  doc.text(`${data.commune || "—"} · Canton ${canton} · Déclaration ${new Date().getFullYear() - 1}`, W - M - 5, y + 8, { align: "right" });

  y += 18;

  // ── NOTICE ────────────────────────────────────────────────────────
  doc.setFillColor(232, 240, 254);
  doc.setDrawColor(13, 71, 161);
  doc.setLineWidth(0.5);
  doc.rect(M, y, 2, 16, "F");
  doc.rect(M, y, CW, 16, "D");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(33, 37, 41);
  const noticeLines = doc.splitTextToSize(L(LABELS.notice, lang), CW - 8);
  doc.text(noticeLines.slice(0, 3), M + 5, y + 6);
  y += 20;

  // ── TITRE SECTION ──────────────────────────────────────────────────
  doc.setFillColor(...DARK);
  doc.rect(M, y, CW, 8, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.text("📎 PIÈCES JUSTIFICATIVES — LISTE COMPLÈTE", M + 4, y + 5.5);
  y += 11;

  // ── LISTE DES DOCUMENTS ────────────────────────────────────────────
  required.forEach((item, i) => {
    const hasFile = !!uploads[item.id];
    const rowH = 14;
    const alt = i % 2 === 0;

    doc.setFillColor(alt ? 255 : 248, alt ? 255 : 249, alt ? 255 : 250);
    doc.rect(M, y, CW, rowH, "F");
    doc.setDrawColor(222, 226, 230);
    doc.setLineWidth(0.2);
    doc.line(M, y + rowH, M + CW, y + rowH);

    // Barre latérale couleur
    doc.setFillColor(...(item.obligatoire ? GOLD : GREY));
    doc.rect(M, y, 1.5, rowH, "F");

    // Badge état (joint ou manquant)
    const badgeW = 24;
    const badgeX = W - M - badgeW - 2;
    if (hasFile) {
      doc.setFillColor(46, 125, 50);
      doc.rect(badgeX, y + 3, badgeW, 8, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...WHITE);
      doc.text(L(LABELS.joint, lang), badgeX + badgeW / 2, y + 8.5, { align: "center" });
    } else {
      doc.setFillColor(198, 40, 40);
      doc.rect(badgeX, y + 3, badgeW, 8, "F");
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...WHITE);
      doc.text(L(LABELS.manquant, lang), badgeX + badgeW / 2, y + 8.5, { align: "center" });
    }

    // Contenu
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(item.label, M + 5, y + 6);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GREY);
    doc.text(item.ref, M + 5, y + 11);

    // Badge obligatoire
    if (item.obligatoire) {
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GOLD);
      doc.text(`★ ${L(LABELS.obligatoire, lang)}`, M + 5 + doc.getTextWidth(item.label) + 3, y + 6);
    }

    y += rowH;
  });

  y += 6;

  // ── RÉCAPITULATIF FISCAL ───────────────────────────────────────────
  if (result && y < 240) {
    doc.setFillColor(...DARK);
    doc.rect(M, y, CW, 8, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GOLD);
    doc.text("RÉCAPITULATIF FISCAL — À TITRE INDICATIF", M + 4, y + 5.5);
    y += 10;

    const rows = [
      { l: "Impôt cantonal + communal", v: (result.impotCantonal || 0) + (result.impotCommunal || 0) },
      { l: "Impôt fédéral direct (IFD)", v: result.impotFed },
      { l: "Impôt sur la fortune", v: result.impotFor },
      { l: "TOTAL", v: result.impotTotal, bold: true },
    ].filter(r => r.v > 0);

    rows.forEach((row, i) => {
      const rh = 8;
      doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 249, i % 2 === 0 ? 255 : 250);
      doc.rect(M, y, CW, rh, "F");
      doc.setFontSize(row.bold ? 9 : 8.5);
      doc.setFont("helvetica", row.bold ? "bold" : "normal");
      doc.setTextColor(row.bold ? 26 : 80, row.bold ? 26 : 80, row.bold ? 46 : 80);
      doc.text(row.l, M + 5, y + 5.5);
      if (row.bold) { doc.setTextColor(...GOLD); } else { doc.setTextColor(...DARK); }
      doc.text(fCHF(row.v), W - M - 3, y + 5.5, { align: "right" });
      y += rh;
    });
  }

  // ── FOOTER ─────────────────────────────────────────────────────────
  doc.setFillColor(...DARK);
  doc.rect(0, 282, W, 15, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 282, W, 1.5, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  doc.text(L(LABELS.footer, lang), M, 287);

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.text("taix.ch · WIN WIN Finance Group SARL · FINMA F01042365", W - M, 287, { align: "right" });
  doc.text("La décision de taxation de l'autorité fiscale compétente fait foi.", M, 292);
  doc.text(new Date().toLocaleDateString("fr-CH"), W - M, 292, { align: "right" });

  // ── TÉLÉCHARGEMENT ─────────────────────────────────────────────────
  const filename = `tAIx_Justificatifs_${nom.replace(/\s+/g, "_")}_${new Date().getFullYear() - 1}.pdf`;
  doc.save(filename);
}
