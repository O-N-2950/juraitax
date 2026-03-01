// ═══════════════════════════════════════════════════════════════════════
//  tAIx — Impression "Copie du contribuable"
//  Génère une page imprimable formatée A4
//  Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════════════

const LABELS = {
  fr: {
    title:      "Copie du Contribuable",
    subtitle:   "Récapitulatif de Déclaration d'Impôts",
    generated:  "Document généré le",
    by:         "par tAIx.ch — Déclarations Fiscales Suisses Intelligentes",
    identity:   "Identité du contribuable",
    name:       "Nom & prénom",
    dob:        "Date de naissance",
    npa:        "NPA / Commune",
    canton:     "Canton",
    year:       "Année fiscale",
    civil:      "État civil",
    children:   "Enfants à charge",
    tax_summary:"Résumé fiscal",
    icc:        "Impôt cantonal (ICC)",
    communal:   "Impôt communal",
    federal:    "Impôt fédéral direct",
    fortune:    "Impôt sur la fortune",
    total:      "TOTAL IMPÔTS",
    deductions: "Déductions appliquées",
    ded_3a:     "3ème pilier 3a",
    ded_lpp:    "Rachat LPP",
    ded_malad:  "Primes maladie",
    ded_garde:  "Frais de garde",
    ded_med:    "Frais médicaux",
    ded_dons:   "Dons",
    optimis:    "Optimisations fiscales identifiées",
    disclaimer: "Ce document est un récapitulatif informatif généré par tAIx.ch. Il ne constitue pas une déclaration fiscale officielle. La décision de taxation de l'autorité fiscale fait foi. Aucune donnée fiscale n'est conservée sur les serveurs de PEP's Swiss SA.",
    legal:      "PEP's Swiss SA · Bellevue 7 · 2950 Courgenay · Suisse · LPD (RS 235.1)",
    copy_note:  "⚠ Conservez ce document avec vos pièces justificatives fiscales",
  },
  de: {
    title:      "Steuerpflichtigenkopie",
    subtitle:   "Zusammenfassung der Steuererklärung",
    generated:  "Dokument erstellt am",
    by:         "von tAIx.ch — Schweizer Intelligente Steuererklärungen",
    identity:   "Identität des Steuerpflichtigen",
    name:       "Name & Vorname",
    dob:        "Geburtsdatum",
    npa:        "PLZ / Gemeinde",
    canton:     "Kanton",
    year:       "Steuerjahr",
    civil:      "Zivilstand",
    children:   "Unterhaltsberechtigte Kinder",
    tax_summary:"Steuerübersicht",
    icc:        "Kantonssteuer",
    communal:   "Gemeindesteuer",
    federal:    "Direkte Bundessteuer",
    fortune:    "Vermögenssteuer",
    total:      "STEUERN TOTAL",
    deductions: "Angewandte Abzüge",
    ded_3a:     "3. Säule 3a",
    ded_lpp:    "BVG-Einkauf",
    ded_malad:  "Krankenkassenprämien",
    ded_garde:  "Kinderbetreuungskosten",
    ded_med:    "Krankheitskosten",
    ded_dons:   "Spenden",
    optimis:    "Identifizierte Steueroptimierungen",
    disclaimer: "Dieses Dokument ist eine von tAIx.ch generierte Informationszusammenfassung. Es stellt keine offizielle Steuererklärung dar. Der Steuerveranlagungsentscheid der Behörde ist massgebend. Keine Steuerdaten werden auf den Servern von PEP's Swiss SA gespeichert.",
    legal:      "PEP's Swiss SA · Bellevue 7 · 2950 Courgenay · Schweiz · DSG (SR 235.1)",
    copy_note:  "⚠ Bewahren Sie dieses Dokument mit Ihren Steuerbelegen auf",
  },
  it: {
    title:      "Copia del Contribuente",
    subtitle:   "Riepilogo della Dichiarazione dei Redditi",
    generated:  "Documento generato il",
    by:         "da tAIx.ch — Dichiarazioni Fiscali Svizzere Intelligenti",
    identity:   "Identità del contribuente",
    name:       "Nome & cognome",
    dob:        "Data di nascita",
    npa:        "NPA / Comune",
    canton:     "Cantone",
    year:       "Anno fiscale",
    civil:      "Stato civile",
    children:   "Figli a carico",
    tax_summary:"Riepilogo fiscale",
    icc:        "Imposta cantonale",
    communal:   "Imposta comunale",
    federal:    "Imposta federale diretta",
    fortune:    "Imposta sulla sostanza",
    total:      "TOTALE IMPOSTE",
    deductions: "Deduzioni applicate",
    ded_3a:     "3° pilastro 3a",
    ded_lpp:    "Riscatto LPP",
    ded_malad:  "Premi di cassa malati",
    ded_garde:  "Spese di custodia",
    ded_med:    "Spese mediche",
    ded_dons:   "Donazioni",
    optimis:    "Ottimizzazioni fiscali identificate",
    disclaimer: "Questo documento è un riepilogo informativo generato da tAIx.ch. Non costituisce una dichiarazione fiscale ufficiale. La decisione di tassazione dell'autorità fiscale fa fede. Nessun dato fiscale viene conservato sui server di PEP's Swiss SA.",
    legal:      "PEP's Swiss SA · Bellevue 7 · 2950 Courgenay · Svizzera · LPD (RS 235.1)",
    copy_note:  "⚠ Conservate questo documento con i vostri giustificativi fiscali",
  },
};

function L(lang) { return LABELS[lang] || LABELS.fr; }
function fmt(n) { return n ? `CHF ${Number(n).toLocaleString("fr-CH")}` : "—"; }

export function imprimerCopieContribuable({ data, result: r, lang = "fr", canton = "JU" }) {
  const lbl = L(lang);
  const date = new Date().toLocaleDateString("fr-CH", { day:"2-digit", month:"long", year:"numeric" });

  const deductions = [
    { l: lbl.ded_3a,    v: r?.detail?.pilier3a },
    { l: lbl.ded_lpp,   v: r?.detail?.rachatLPP },
    { l: lbl.ded_malad, v: r?.detail?.primesDeductibles },
    { l: lbl.ded_garde, v: r?.detail?.fraisGardeDeductibles },
    { l: lbl.ded_med,   v: r?.detail?.fraisMaladieDeductibles },
    { l: lbl.ded_dons,  v: r?.detail?.donsDeductibles },
  ].filter(x => x.v > 0);

  const optimisations = (r?.optimisations || []).slice(0, 4);

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${lbl.title} — ${data.prenom} ${data.nom} — ${canton} 2025</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4; margin: 20mm 18mm; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11pt; color: #1a2a4a; background: white; }

    .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 3px solid #1a2a4a; padding-bottom: 14px; margin-bottom: 20px; }
    .logo-text { font-size: 28pt; font-weight: 900; color: #1a2a4a; letter-spacing: -1px; }
    .logo-text span { color: #2563eb; }
    .doc-title { text-align:right; }
    .doc-title h1 { font-size: 16pt; font-weight: 700; color: #1a2a4a; }
    .doc-title p { font-size: 9pt; color: #666; margin-top: 3px; }
    .doc-title .date { font-size: 8pt; color: #999; margin-top: 5px; }

    .canton-badge { display:inline-block; background:#1a2a4a; color:white; font-size:8pt; font-weight:700; padding:3px 10px; border-radius:4px; margin-bottom:16px; letter-spacing:0.05em; text-transform:uppercase; }

    .copy-note { background: #FEF9C3; border: 1px solid #EAB308; padding: 8px 12px; border-radius: 6px; font-size: 9pt; color: #854D0E; margin-bottom: 16px; }

    section { margin-bottom: 18px; }
    h2 { font-size: 10pt; font-weight: 700; color: #1a2a4a; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .field { padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; }
    .field-label { font-size: 8pt; color: #64748b; margin-bottom: 2px; }
    .field-value { font-size: 10pt; font-weight: 600; color: #1a2a4a; }

    .tax-box { background: #1a2a4a; color: white; border-radius: 10px; padding: 20px; margin-bottom: 12px; text-align:center; }
    .tax-total { font-size: 36pt; font-weight: 300; letter-spacing: -1px; color: white; }
    .tax-label { font-size: 9pt; color: rgba(255,255,255,0.7); margin-top: 4px; }

    .tax-grid { display:grid; grid-template-columns: repeat(4,1fr); gap:8px; }
    .tax-item { padding:10px 8px; text-align:center; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; }
    .tax-item-amount { font-size:13pt; font-weight:700; color:#1a2a4a; }
    .tax-item-label  { font-size:8pt; color:#64748b; margin-top:3px; }

    .ded-row { display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #f1f5f9; font-size:10pt; }
    .ded-label { color:#64748b; }
    .ded-value { font-weight:600; color:#1a2a4a; }

    .optim-item { padding:8px 12px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; margin-bottom:6px; }
    .optim-label { font-size:10pt; font-weight:600; color:#166534; }
    .optim-economie { font-size:9pt; color:#16a34a; font-weight:700; }
    .optim-detail { font-size:9pt; color:#374151; margin-top:2px; }

    .footer { border-top: 2px solid #e2e8f0; padding-top: 12px; margin-top: 20px; display:flex; justify-content:space-between; align-items:flex-end; }
    .footer-logo { font-size: 14pt; font-weight: 900; color: #1a2a4a; }
    .footer-logo span { color: #2563eb; }
    .footer-legal { font-size: 7.5pt; color: #94a3b8; text-align:right; line-height:1.5; }
    .disclaimer { font-size: 7.5pt; color: #94a3b8; margin-top: 10px; line-height:1.5; font-style:italic; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div>
      <div class="logo-text">t<span>AI</span>x</div>
      <div style="font-size:8pt;color:#64748b;margin-top:3px;">Déclarations Fiscales Suisses Intelligentes 🇨🇭</div>
    </div>
    <div class="doc-title">
      <h1>${lbl.title}</h1>
      <p>${lbl.subtitle}</p>
      <div class="date">${lbl.generated} ${date}</div>
    </div>
  </div>

  <div class="canton-badge">🏔 Canton ${canton} · Année fiscale 2025</div>

  <div class="copy-note">${lbl.copy_note}</div>

  <!-- IDENTITÉ -->
  <section>
    <h2>${lbl.identity}</h2>
    <div class="grid-2">
      <div class="field">
        <div class="field-label">${lbl.name}</div>
        <div class="field-value">${data.prenom || "—"} ${data.nom || ""}</div>
      </div>
      <div class="field">
        <div class="field-label">${lbl.dob}</div>
        <div class="field-value">${data.naissance || "—"}</div>
      </div>
      <div class="field">
        <div class="field-label">${lbl.npa}</div>
        <div class="field-value">${data.npa || ""} ${data.commune || "—"}</div>
      </div>
      <div class="field">
        <div class="field-label">${lbl.canton} · ${lbl.year}</div>
        <div class="field-value">${canton} · 2025</div>
      </div>
      ${data.etat_civil ? `
      <div class="field">
        <div class="field-label">${lbl.civil}</div>
        <div class="field-value">${data.etat_civil}</div>
      </div>` : ""}
      ${(data.nb_enfants > 0) ? `
      <div class="field">
        <div class="field-label">${lbl.children}</div>
        <div class="field-value">${data.nb_enfants}</div>
      </div>` : ""}
    </div>
  </section>

  <!-- RÉSUMÉ FISCAL -->
  <section>
    <h2>${lbl.tax_summary}</h2>
    <div class="tax-box">
      <div class="tax-total">CHF ${Number(r?.impotTotal || 0).toLocaleString("fr-CH")}</div>
      <div class="tax-label">${lbl.total} — Canton ${canton} 2025</div>
    </div>
    <div class="tax-grid">
      <div class="tax-item">
        <div class="tax-item-amount">${fmt(r?.impotCantonal)}</div>
        <div class="tax-item-label">${lbl.icc}</div>
      </div>
      <div class="tax-item">
        <div class="tax-item-amount">${fmt(r?.impotCommunal)}</div>
        <div class="tax-item-label">${lbl.communal}</div>
      </div>
      <div class="tax-item">
        <div class="tax-item-amount">${fmt(r?.impotFed)}</div>
        <div class="tax-item-label">${lbl.federal}</div>
      </div>
      <div class="tax-item">
        <div class="tax-item-amount">${fmt(r?.impotFor)}</div>
        <div class="tax-item-label">${lbl.fortune}</div>
      </div>
    </div>
  </section>

  ${deductions.length > 0 ? `
  <!-- DÉDUCTIONS -->
  <section>
    <h2>${lbl.deductions}</h2>
    ${deductions.map(d => `
    <div class="ded-row">
      <span class="ded-label">${d.l}</span>
      <span class="ded-value">${fmt(d.v)}</span>
    </div>`).join("")}
  </section>` : ""}

  ${optimisations.length > 0 ? `
  <!-- OPTIMISATIONS -->
  <section>
    <h2>${lbl.optimis}</h2>
    ${optimisations.map(o => `
    <div class="optim-item">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div class="optim-label">${o.label}</div>
        ${o.economie > 0 ? `<div class="optim-economie">−${fmt(o.economie)}/an</div>` : ""}
      </div>
      <div class="optim-detail">${o.detail}</div>
    </div>`).join("")}
  </section>` : ""}

  <!-- FOOTER -->
  <div class="footer">
    <div>
      <div class="footer-logo">t<span>AI</span>x<span style="font-size:8pt;font-weight:400;color:#64748b;margin-left:8px;">© PEP's Swiss SA 2026</span></div>
    </div>
    <div class="footer-legal">${lbl.legal}<br>${lbl.by}</div>
  </div>
  <div class="disclaimer">${lbl.disclaimer}</div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  // Ouvrir dans un nouvel onglet et déclencher l'impression
  const win = window.open("", "_blank", "width=900,height=700");
  win.document.write(html);
  win.document.close();
}
