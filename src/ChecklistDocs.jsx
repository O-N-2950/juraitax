// ═══════════════════════════════════════════════════════════════════════
//  tAIx — ChecklistDocs.jsx v4
//  UX Expert : Zone drop géante + multi-photos + B2B fallback + flow IA
//  PC / Tablette / Mobile — Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════════════

import { useState, useRef, useCallback } from "react";
import { useStore, SOURCE } from "./store";
import { ocrDocument, applyOCRToStore } from "./ocr";
import { genererQuestionsIA } from "./FiscalAdvisor";
import { AdvisorScreen } from "./AdvisorScreen";
import { GlobalStyles, T as S } from "./ui";
import LangSelector from "./LangSelector";
import { useT } from "./i18n";

// ── AUTO-CLASSIFICATION des fichiers déposés ──────────────────────────
// Mappe les noms de fichiers / mots-clés vers les types de documents
function classifyFile(filename) {
  const n = filename.toLowerCase();
  if (/d[ée]claration|di[-_]?2024|di[-_]?prev|tax.?return/.test(n)) return "di_prev";
  if (/certificat.?salaire|lohnausweis|salary/.test(n))              return "cert_sal";
  if (/3a|pilier.?3|saeule.?3/.test(n))                              return "3a";
  if (/lpp|rachat|pension.?fund|pensionskasse/.test(n))              return "rachat_lpp";
  if (/compte|bancaire|bank|iban|solde|extrait/.test(n))             return "comptes";
  if (/hypoth[eè]que|zinsen|mortgage/.test(n))                       return "hypotheque";
  if (/immobilier|valeur.?fiscale|grundst[uü]ck/.test(n))            return "immobilier";
  if (/entretien|travaux|renovation|unterhalt/.test(n))              return "entretien";
  if (/m[eé]dical|facture.?m[eé]d|arzt|doctor/.test(n))             return "medicaux";
  if (/garde|cr[eè]che|kita|daycare/.test(n))                        return "garde";
  if (/don|spen|charit|association/.test(n))                         return "dons";
  if (/avs|ahv|rente|pension/.test(n))                               return "avs";
  if (/leasing|dette|schuld/.test(n))                                return "leasing";
  return "default";
}

// ── LISTE DES DOCUMENTS ───────────────────────────────────────────────
const DOCS = (t) => ([
  {
    id: "identity", icon: "👤",
    category: { fr:"Identité & Situation", de:"Identität & Situation", it:"Identità & Situazione", en:"Identity & Situation" },
    docs: [
      { id:"di_prev",  required:false, icon:"📋", label:{ fr:"Déclaration 2024 (N-1)", de:"Steuererklärung 2024", it:"Dichiarazione 2024", en:"2024 Tax Return" }, hint:{ fr:"Identité extraite automatiquement par OCR", de:"Identität automatisch per OCR extrahiert", it:"Identità estratta automaticamente", en:"Identity auto-extracted by OCR" }, camera:true },
      { id:"permis",   required:false, icon:"🪪", label:{ fr:"Carte d'identité / Permis", de:"Ausweis / Aufenthaltsbewilligung", it:"Carta d'identità", en:"ID / Residence permit" }, hint:{ fr:"Si commune ou situation a changé", de:"Bei Änderung von Gemeinde/Status", it:"Se comune o situazione cambiata", en:"If municipality or status changed" }, camera:true },
    ]
  },
  {
    id: "revenus", icon: "💰",
    category: { fr:"Revenus", de:"Einkommen", it:"Redditi", en:"Income" },
    docs: [
      { id:"cert_sal",    required:true,  icon:"📄", label:{ fr:"Certificat de salaire 2025", de:"Lohnausweis 2025", it:"Certificato di salario 2025", en:"2025 Salary certificate" }, hint:{ fr:"Formulaire officiel de votre employeur", de:"Offizielles Formular Ihres Arbeitgebers", it:"Modulo ufficiale del datore di lavoro", en:"Official form from your employer" }, camera:true },
      { id:"avs",         required:false, icon:"🏛️", label:{ fr:"Attestation rente AVS/AI", de:"AHV/IV-Rente", it:"Rendita AVS/AI", en:"AVS/AI Pension" }, hint:{ fr:"Si vous percevez une rente", de:"Bei Bezug einer Rente", it:"Se percepite una rendita", en:"If you receive a pension" }, camera:true },
      { id:"lpp_att",     required:false, icon:"🏦", label:{ fr:"Rente LPP / caisse pension", de:"BVG-Rente", it:"Rendita LPP", en:"LPP / Pension fund" }, hint:{ fr:"Si vous percevez une rente LPP", de:"Bei Bezug einer Pensionskassenrente", it:"Se percepite rendita LPP", en:"If you receive LPP income" }, camera:true },
      { id:"dividendes",  required:false, icon:"📈", label:{ fr:"Titres / dividendes 2025", de:"Wertschriften 2025", it:"Titoli / dividendi 2025", en:"Securities / dividends 2025" }, hint:{ fr:"Relevé fiscal annuel de votre banque", de:"Steuerausweis Ihrer Bank", it:"Estratto fiscale annuale", en:"Annual tax statement from bank" }, camera:true },
      { id:"chomage",     required:false, icon:"📑", label:{ fr:"Indemnités chômage", de:"Arbeitslosengeld", it:"Indennità disoccupazione", en:"Unemployment benefits" }, hint:{ fr:"Si vous avez perçu des indemnités en 2025", de:"Bei Bezug von Arbeitslosengeld 2025", it:"Se percepiti nel 2025", en:"If received in 2025" }, camera:true },
    ]
  },
  {
    id: "deductions", icon: "✂️",
    category: { fr:"Déductions & Épargne", de:"Abzüge & Vorsorge", it:"Deduzioni & Previdenza", en:"Deductions & Savings" },
    docs: [
      { id:"3a",          required:false, icon:"🏦", label:{ fr:"Pilier 3a 2025", de:"Säule 3a 2025", it:"Pilastro 3a 2025", en:"Pillar 3a 2025" }, hint:{ fr:"Plafond: CHF 7'258 salarié / CHF 36'288 indépendant", de:"Grenze: CHF 7'258 Angestellte", it:"Limite: CHF 7'258 dipendente", en:"Limit: CHF 7,258 employee" }, camera:true },
      { id:"rachat_lpp",  required:false, icon:"💼", label:{ fr:"Rachat LPP", de:"BVG-Einkauf", it:"Riscatto LPP", en:"LPP Buy-in" }, hint:{ fr:"Déduction 100% — ne pas oublier !", de:"100% abzugsfähig — nicht vergessen!", it:"Deduzione 100% — non dimenticare!", en:"100% deductible — don't forget!" }, camera:true, highlight:true },
      { id:"medicaux",    required:false, icon:"🏥", label:{ fr:"Frais médicaux non remboursés", de:"Krankheitskosten", it:"Spese mediche non rimborsate", en:"Unreimbursed medical expenses" }, hint:{ fr:"Au-delà de 5% du revenu net", de:"Über 5% des Nettoeinkommens", it:"Oltre il 5% del reddito netto", en:"Above 5% of net income" }, camera:true },
      { id:"garde",       required:false, icon:"👶", label:{ fr:"Frais de garde d'enfants", de:"Kinderbetreuung", it:"Spese di custodia", en:"Childcare costs" }, hint:{ fr:"Crèche, garderie — jusqu'à CHF 10'100/enfant", de:"Krippe, Kita — bis CHF 10'100/Kind", it:"Asilo — fino CHF 10'100/figlio", en:"Nursery — up to CHF 10,100/child" }, camera:true },
      { id:"dons",        required:false, icon:"🤝", label:{ fr:"Dons à associations", de:"Spenden", it:"Donazioni", en:"Charitable donations" }, hint:{ fr:"Max 20% du revenu net", de:"Max 20% des Nettoeinkommens", it:"Max 20% del reddito netto", en:"Max 20% of net income" }, camera:true },
    ]
  },
  {
    id: "fortune", icon: "🏦",
    category: { fr:"Fortune & Dettes", de:"Vermögen & Schulden", it:"Sostanza & Debiti", en:"Assets & Debts" },
    docs: [
      { id:"comptes",     required:true,  icon:"🏧", label:{ fr:"Extraits bancaires 31.12.2025 (TOUS)", de:"Kontoauszüge 31.12.2025 (ALLE)", it:"Estratti conto 31.12.2025 (TUTTI)", en:"Bank statements 31.12.2025 (ALL)" }, hint:{ fr:"Solde exact au 31 décembre — TOUS les comptes", de:"Exakter Saldo — ALLE Konten", it:"Saldo esatto — TUTTI i conti", en:"Exact balance — ALL accounts" }, camera:true },
      { id:"hypotheque",  required:false, icon:"🏠", label:{ fr:"Intérêts hypothécaires 2025", de:"Hypothekarzinsen 2025", it:"Interessi ipotecari 2025", en:"Mortgage interest 2025" }, hint:{ fr:"Décompte annuel banque", de:"Jährliche Abrechnung", it:"Conteggio annuale banca", en:"Annual bank statement" }, camera:true, highlight:true },
      { id:"immobilier",  required:false, icon:"🏡", label:{ fr:"Valeur fiscale immeuble", de:"Steuerwert Liegenschaft", it:"Valore fiscale immobile", en:"Property fiscal value" }, hint:{ fr:"Disponible en commune ou sur ancienne taxation", de:"Erhältlich bei der Gemeinde", it:"Disponibile al comune", en:"Available from municipality" }, camera:true },
      { id:"entretien",   required:false, icon:"🔧", label:{ fr:"Factures entretien 2025", de:"Unterhaltsrechnungen 2025", it:"Fatture manutenzione 2025", en:"Maintenance invoices 2025" }, hint:{ fr:"Travaux d'entretien (pas valeur ajoutée)", de:"Unterhalt (keine Wertvermehrung)", it:"Manutenzione (non a valore aggiunto)", en:"Maintenance (not capital improvements)" }, camera:true },
      { id:"leasing",     required:false, icon:"🚗", label:{ fr:"Leasing / dettes 2025", de:"Leasing / Schulden 2025", it:"Leasing / debiti 2025", en:"Leasing / debts 2025" }, hint:{ fr:"Solde dû au 31.12.2025", de:"Saldo per 31.12.2025", it:"Saldo al 31.12.2025", en:"Balance due 31.12.2025" }, camera:true },
    ]
  }
]);

// ── COMPOSANT PRINCIPAL ───────────────────────────────────────────────
export function ChecklistScreen() {
  const { setScreen, lang, cantonConfig, mode, getAll } = useStore();
  const t = useT(lang);
  const { importFromDoc } = useStore();

  const [uploads, setUploads]       = useState({});     // { docId: File[] }
  const [ocrStatus, setOcrStatus]   = useState({});     // { docId: 'loading_N_T'|'done'|'error' }
  const [allOcrResults, setAllOcrResults] = useState({});
  const [expanded, setExpanded]     = useState({ identity:true, revenus:true, deductions:false, fortune:false });
  const [advisorData, setAdvisorData] = useState(null);
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [advisorLoading, setAdvisorLoading] = useState(false);

  // Drag & drop master zone
  const [isDragging, setIsDragging] = useState(false);
  const [dropStatus, setDropStatus]  = useState(null);  // null | 'classifying' | 'done'
  const [droppedCount, setDroppedCount] = useState(0);
  const masterInputRef = useRef(null);

  // B2B identity fallback
  const [showIdentityFallback, setShowIdentityFallback] = useState(false);
  const [manualIdentity, setManualIdentity] = useState({ prenom:"", nom:"", no_contribuable:"" });
  const isB2B = mode === "b2b";

  const docs = DOCS(t);
  const L = (obj) => obj?.[lang] || obj?.fr || obj?.en || "";

  const uploadCount = Object.values(uploads).filter(Boolean).length;
  const ocrDoneCount = Object.values(ocrStatus).filter(s => s === "done").length;
  const allRequired = docs.flatMap(c => c.docs.filter(d => d.required));
  const canProceed = allRequired.some(d => uploads[d.id]);

  // ── OCR single doc ─────────────────────────────────────────────────
  async function runOCR(docId, files) {
    const arr = Array.isArray(files) ? files : [files];
    setOcrStatus(s => ({ ...s, [docId]: `loading_0_${arr.length}` }));
    let merged = {};
    for (let i = 0; i < arr.length; i++) {
      setOcrStatus(s => ({ ...s, [docId]: `loading_${i+1}_${arr.length}` }));
      const result = await ocrDocument(arr[i], docId);
      if (!result._error) {
        merged = mergeOcrResults(merged, result);
      }
    }
    if (Object.keys(merged).length > 0) {
      applyOCRToStore(merged, importFromDoc, null, SOURCE);
      setOcrStatus(s => ({ ...s, [docId]: "done" }));
      setAllOcrResults(r => ({ ...r, [docId]: merged }));

      // B2B: check if identity was found after di_prev OCR
      if (isB2B && docId === "di_prev") {
        const data = useStore.getState().getAll();
        if (!data.nom && !data.prenom) {
          setShowIdentityFallback(true);
        }
      }
    } else {
      setOcrStatus(s => ({ ...s, [docId]: "error" }));
    }
  }

  // ── Upload handler (individual doc) ───────────────────────────────
  async function handleUpload(docId, e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploads(u => {
      const prev = Array.isArray(u[docId]) ? u[docId] : u[docId] ? [u[docId]] : [];
      return { ...u, [docId]: [...prev, ...files] };
    });
    e.target.value = "";
    await runOCR(docId, files);
  }

  // ── MASTER DROP ZONE ───────────────────────────────────────────────
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer?.files || []);
    if (!files.length) return;
    await processMasterFiles(files);
  }, []);

  const handleMasterInput = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = "";
    await processMasterFiles(files);
  };

  async function processMasterFiles(files) {
    setDropStatus("classifying");
    setDroppedCount(files.length);

    // Classify each file
    const classified = {};
    for (const file of files) {
      const docId = classifyFile(file.name);
      if (!classified[docId]) classified[docId] = [];
      classified[docId].push(file);
    }

    // Add to uploads
    setUploads(u => {
      const next = { ...u };
      for (const [docId, newFiles] of Object.entries(classified)) {
        const prev = Array.isArray(next[docId]) ? next[docId] : next[docId] ? [next[docId]] : [];
        next[docId] = [...prev, ...newFiles];
      }
      return next;
    });

    setDropStatus("done");

    // OCR each group in parallel
    const ocrPromises = Object.entries(classified).map(([docId, docFiles]) =>
      runOCR(docId, docFiles)
    );
    await Promise.all(ocrPromises);
  }

  // ── Merge OCR results ──────────────────────────────────────────────
  function mergeOcrResults(base, next) {
    const merged = { ...base };
    const ADDITIVE = new Set(["solde_bancaire","solde_31dec","frais_medicaux","dons","frais_garde"]);
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "" || v === 0) continue;
      if (ADDITIVE.has(k) && typeof v === "number" && typeof merged[k] === "number") {
        merged[k] = (merged[k] || 0) + v;
      } else if (!merged[k]) {
        merged[k] = v;
      }
    }
    return merged;
  }

  // ── Proceed ───────────────────────────────────────────────────────
  async function handleProceed() {
    // Apply manual identity if B2B fallback was used
    if (isB2B && showIdentityFallback && (manualIdentity.nom || manualIdentity.prenom)) {
      if (manualIdentity.prenom) importFromDoc("prenom", manualIdentity.prenom, "saisie_manuelle");
      if (manualIdentity.nom)    importFromDoc("nom",    manualIdentity.nom,    "saisie_manuelle");
      if (manualIdentity.no_contribuable) importFromDoc("no_contribuable", manualIdentity.no_contribuable, "saisie_manuelle");
    }

    if (Object.keys(allOcrResults).length > 0 && !advisorData) {
      setAdvisorLoading(true);
      try {
        const storeSnap = useStore.getState();
        const allData = storeSnap?.getAll ? storeSnap.getAll() : {};
        const advice = await genererQuestionsIA(allOcrResults, allData, lang);
        setAdvisorData(advice);
        if (advice?.questions?.length > 0) {
          setAdvisorLoading(false);
          setShowAdvisor(true);
          return;
        }
      } catch(e) { console.warn("Advisor error:", e); }
      setAdvisorLoading(false);
    }
    setScreen("form");
  }

  // ── Advisor callback ───────────────────────────────────────────────
  if (showAdvisor && advisorData) {
    return (
      <AdvisorScreen
        advisorData={advisorData}
        lang={lang}
        onComplete={() => { setShowAdvisor(false); setScreen("form"); }}
      />
    );
  }

  // ── Render ─────────────────────────────────────────────────────────
  const ocrLoadingCount = Object.values(ocrStatus).filter(s => typeof s === "string" && s.startsWith("loading")).length;
  const totalPages = Object.values(uploads).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : arr ? 1 : 0), 0);

  return (
    <div style={{ minHeight:"100vh", background:S.bg, paddingBottom:120 }}>
      <GlobalStyles />
      <div style={{ position:"fixed", top:16, right:16, zIndex:100 }}><LangSelector /></div>

      {/* HEADER */}
      <div style={{ position:"sticky", top:0, zIndex:50, background:`linear-gradient(180deg,${S.bg} 85%,transparent)`, paddingBottom:8 }}>
        <div style={{ maxWidth:680, margin:"0 auto", padding:"16px 20px 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
            <button onClick={() => setScreen("welcome")}
              style={{ background:"none", border:`1px solid ${S.border}`, color:S.textDim, borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13, fontFamily:"'Outfit',sans-serif" }}>
              ← {t("nav_back")}
            </button>
            <div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:S.cream, fontWeight:300 }}>
                {lang==="de"?"Unterlagen vorbereiten":lang==="it"?"Preparate i documenti":lang==="en"?"Prepare your documents":"Préparez vos documents"}
              </div>
              <div style={{ fontSize:10, color:S.textDim, fontFamily:"'Outfit',sans-serif" }}>
                {totalPages} {lang==="de"?"Seiten":lang==="en"?"pages":"page(s)"} · {ocrDoneCount} {lang==="de"?"analysiert":lang==="en"?"analysed":"analysé(s)"}
                {ocrLoadingCount > 0 && <span style={{color:S.gold}}> · ⏳ {ocrLoadingCount} en cours…</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"0 20px" }}>

        {/* ══ MASTER DROP ZONE ══════════════════════════════════════ */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => masterInputRef.current?.click()}
          style={{
            marginBottom:20,
            padding:"28px 20px",
            borderRadius:16,
            border:`2px dashed ${isDragging ? S.gold : S.border}`,
            background: isDragging
              ? `rgba(201,168,76,0.08)`
              : `rgba(201,168,76,0.03)`,
            cursor:"pointer",
            textAlign:"center",
            transition:"all 0.2s",
            position:"relative",
          }}>
          <input
            ref={masterInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,.pdf"
            style={{ display:"none" }}
            onChange={handleMasterInput}
          />

          {dropStatus === "classifying" ? (
            <div>
              <div style={{ fontSize:32, marginBottom:8 }}>⚡</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:S.gold, marginBottom:4 }}>
                Classification en cours…
              </div>
              <div style={{ fontSize:12, color:S.textDim, fontFamily:"'Outfit',sans-serif" }}>
                {droppedCount} fichier(s) analysé(s) par l'IA
              </div>
            </div>
          ) : dropStatus === "done" ? (
            <div>
              <div style={{ fontSize:32, marginBottom:8 }}>✅</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:S.green, marginBottom:4 }}>
                {droppedCount} document(s) classifié(s) automatiquement
              </div>
              <div style={{ fontSize:12, color:S.textDim, fontFamily:"'Outfit',sans-serif" }}>
                Ajoutez d'autres documents ou continuez
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize:36, marginBottom:10 }}>📂</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:S.cream, fontWeight:300, marginBottom:6 }}>
                {lang==="de"?"Alle Dokumente hier ablegen":lang==="en"?"Drop all documents here":"Déposez tous vos documents ici"}
              </div>
              <div style={{ fontSize:13, color:S.textDim, fontFamily:"'Outfit',sans-serif", marginBottom:12 }}>
                {lang==="de"?"Drag & Drop oder klicken":lang==="en"?"Drag & drop or click to select":"Glisser-déposer ou cliquer pour sélectionner"}
              </div>
              <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
                {["📷 Photos", "📄 PDF", "🖼️ Scan"].map(tag => (
                  <span key={tag} style={{ padding:"4px 12px", borderRadius:99, background:"rgba(255,255,255,0.05)", border:`1px solid ${S.border}`, fontSize:11, color:S.textDim, fontFamily:"'Outfit',sans-serif" }}>
                    {tag}
                  </span>
                ))}
              </div>
              <div style={{ marginTop:12, fontSize:11, color:S.muted, fontFamily:"'Outfit',sans-serif" }}>
                L'IA classe automatiquement chaque document par type
              </div>
            </div>
          )}
        </div>

        {/* ══ B2B: bouton photo caméra en haut si mobile ═══════════ */}
        <label style={{
          display:"flex", alignItems:"center", justifyContent:"center", gap:10,
          padding:"14px", borderRadius:12, marginBottom:20,
          background:`rgba(201,168,76,0.06)`, border:`1px solid rgba(201,168,76,0.25)`,
          cursor:"pointer",
        }}>
          <span style={{ fontSize:20 }}>📷</span>
          <div style={{ textAlign:"left" }}>
            <div style={{ fontSize:13, fontWeight:600, color:S.gold, fontFamily:"'Outfit',sans-serif" }}>
              {lang==="de"?"Fotos aufnehmen (mehrere)":lang==="en"?"Take multiple photos":"Prendre plusieurs photos d'un coup"}
            </div>
            <div style={{ fontSize:11, color:S.textDim, fontFamily:"'Outfit',sans-serif" }}>
              {lang==="de"?"Alle Seiten nacheinander fotografieren":lang==="en"?"Photograph all pages in a row":"Photographiez toutes les pages à la suite"}
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            style={{ display:"none" }}
            onChange={handleMasterInput}
          />
        </label>

        {/* ══ B2B IDENTITY FALLBACK ═════════════════════════════════ */}
        {isB2B && showIdentityFallback && (
          <div style={{ padding:"16px 20px", borderRadius:14, background:`rgba(201,168,76,0.06)`, border:`1px solid rgba(201,168,76,0.3)`, marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:S.gold, fontFamily:"'Outfit',sans-serif", marginBottom:10, letterSpacing:"0.05em", textTransform:"uppercase" }}>
              🔍 Client non identifié par OCR — saisie manuelle
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
              {[
                { key:"prenom", ph:"Prénom", label:"Prénom" },
                { key:"nom",    ph:"Nom",    label:"Nom" },
              ].map(f => (
                <input key={f.key}
                  value={manualIdentity[f.key]}
                  onChange={e => setManualIdentity(p => ({...p, [f.key]: e.target.value}))}
                  placeholder={f.ph}
                  style={{ padding:"10px 12px", borderRadius:8, border:`1px solid ${S.border}`, background:S.card, color:S.cream, fontSize:13, fontFamily:"'Outfit',sans-serif", outline:"none" }}
                  onFocus={e=>e.target.style.borderColor=S.gold}
                  onBlur={e=>e.target.style.borderColor=S.border}
                />
              ))}
            </div>
            <input
              value={manualIdentity.no_contribuable}
              onChange={e => setManualIdentity(p => ({...p, no_contribuable: e.target.value}))}
              placeholder="N° contribuable (optionnel)"
              style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1px solid ${S.border}`, background:S.card, color:S.cream, fontSize:13, fontFamily:"'Outfit',sans-serif", outline:"none", boxSizing:"border-box" }}
              onFocus={e=>e.target.style.borderColor=S.gold}
              onBlur={e=>e.target.style.borderColor=S.border}
            />
            <button onClick={() => setShowIdentityFallback(false)}
              style={{ marginTop:10, fontSize:11, color:S.textDim, background:"none", border:"none", cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
              ✓ Ces infos seront extraites plus tard par l'OCR
            </button>
          </div>
        )}

        {/* ══ LISTE DOCUMENTS PAR CATÉGORIE ════════════════════════ */}
        {docs.map(cat => (
          <div key={cat.id} style={{ marginBottom:12 }}>
            <button
              onClick={() => setExpanded(e => ({...e, [cat.id]: !e[cat.id]}))}
              style={{
                width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                background:S.surface, border:`1px solid ${S.border}`,
                borderRadius: expanded[cat.id] ? "12px 12px 0 0" : 12,
                padding:"13px 16px", cursor:"pointer",
              }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:18 }}>{cat.icon}</span>
                <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:14, fontWeight:600, color:S.cream }}>{L(cat.category)}</span>
                {(() => {
                  const done = cat.docs.filter(d => uploads[d.id]).length;
                  const total = cat.docs.length;
                  return (
                    <span style={{
                      background: done > 0 ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${done > 0 ? "rgba(52,211,153,0.25)" : S.border}`,
                      borderRadius:99, padding:"2px 8px", fontSize:10,
                      color: done > 0 ? S.green : S.muted,
                      fontFamily:"'Outfit',sans-serif", fontWeight:600
                    }}>
                      {done}/{total}
                    </span>
                  );
                })()}
              </div>
              <span style={{ color:S.textDim, transition:"transform 0.2s", transform: expanded[cat.id] ? "rotate(180deg)" : "none" }}>▾</span>
            </button>

            {expanded[cat.id] && (
              <div style={{ border:`1px solid ${S.border}`, borderTop:"none", borderRadius:"0 0 12px 12px", overflow:"hidden" }}>
                {cat.docs.map((doc, i) => {
                  const hasUpload = uploads[doc.id];
                  const pages = Array.isArray(hasUpload) ? hasUpload.length : hasUpload ? 1 : 0;
                  const status = ocrStatus[doc.id];
                  const isDone = !!hasUpload;

                  return (
                    <div key={doc.id} style={{
                      padding:"13px 16px",
                      background: isDone ? "rgba(52,211,153,0.04)" : doc.highlight ? "rgba(201,168,76,0.03)" : (i%2===0 ? S.card : S.surface),
                      borderBottom: i < cat.docs.length-1 ? `1px solid ${S.border}` : "none",
                    }}>
                      <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>

                        {/* Checkbox */}
                        <div style={{
                          flexShrink:0, width:24, height:24, borderRadius:6, marginTop:2,
                          border:`2px solid ${isDone ? "#34D399" : doc.highlight ? S.gold : S.border}`,
                          background: isDone ? "rgba(52,211,153,0.15)" : "transparent",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:14,
                        }}>
                          {isDone ? "✓" : ""}
                        </div>

                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:2 }}>
                            <span style={{ fontSize:15 }}>{doc.icon}</span>
                            <span style={{
                              fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:600,
                              color: isDone ? S.green : doc.highlight ? S.gold : S.cream,
                            }}>
                              {L(doc.label)}
                            </span>
                            {doc.highlight && !isDone && (
                              <span style={{ fontSize:9, background:"rgba(201,168,76,0.15)", border:"1px solid rgba(201,168,76,0.3)", color:S.gold, borderRadius:99, padding:"1px 7px", fontFamily:"'Outfit',sans-serif", fontWeight:700 }}>
                                ★ TOP
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize:11, color:S.textDim, fontFamily:"'Outfit',sans-serif", lineHeight:1.4, marginBottom:7 }}>
                            {L(doc.hint)}
                          </div>

                          {/* Status badges */}
                          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom: isDone ? 6 : 0 }}>
                            {status?.startsWith("loading") && (() => {
                              const [,,cur,tot] = status.split("_");
                              return (
                                <span style={{ fontSize:10, background:"rgba(201,168,76,0.1)", border:"1px solid rgba(201,168,76,0.3)", color:S.gold, borderRadius:99, padding:"2px 8px", fontFamily:"'Outfit',sans-serif", fontWeight:600 }}>
                                  ⏳ IA lit… {cur}/{tot}
                                </span>
                              );
                            })()}
                            {status === "done" && (
                              <span style={{ fontSize:10, background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.25)", color:"#34D399", borderRadius:99, padding:"2px 8px", fontFamily:"'Outfit',sans-serif", fontWeight:700 }}>
                                ✨ Données extraites
                              </span>
                            )}
                            {status === "error" && (
                              <span style={{ fontSize:10, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:"#F87171", borderRadius:99, padding:"2px 8px", fontFamily:"'Outfit',sans-serif" }}>
                                ⚠️ Relire
                              </span>
                            )}
                          </div>

                          {/* Upload buttons or pages info */}
                          {isDone ? (
                            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                              <span style={{ fontSize:11, color:S.gold, fontFamily:"'Outfit',sans-serif" }}>
                                ✅ {pages} page{pages > 1 ? "s" : ""} chargée{pages > 1 ? "s" : ""}
                              </span>
                              <label style={{ fontSize:11, color:"#60A5FA", fontFamily:"'Outfit',sans-serif", cursor:"pointer", textDecoration:"underline" }}>
                                + Ajouter pages
                                <input type="file" accept="image/*,application/pdf,.pdf" multiple style={{ display:"none" }}
                                  onChange={(e) => handleUpload(doc.id, e)} />
                              </label>
                              <button onClick={() => {
                                setUploads(u => ({...u, [doc.id]: null}));
                                setOcrStatus(s => ({...s, [doc.id]: null}));
                              }} style={{ fontSize:10, color:S.muted, background:"none", border:"none", cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
                                ✕
                              </button>
                            </div>
                          ) : (
                            doc.camera && (
                              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                {/* Photo(s) — mobile */}
                                <label style={{
                                  display:"inline-flex", alignItems:"center", gap:5,
                                  background:S.surface, border:`1px solid ${S.border}`,
                                  borderRadius:8, padding:"7px 14px", cursor:"pointer",
                                  fontSize:12, color:S.gold, fontFamily:"'Outfit',sans-serif", fontWeight:600
                                }}>
                                  📷 {lang==="de"?"Foto(s)":lang==="en"?"Photo(s)":"Photo(s)"}
                                  <input type="file" accept="image/*" capture="environment" multiple
                                    style={{ display:"none" }}
                                    onChange={(e) => handleUpload(doc.id, e)} />
                                </label>
                                {/* Fichier(s) — desktop */}
                                <label style={{
                                  display:"inline-flex", alignItems:"center", gap:5,
                                  background:S.surface, border:`1px solid ${S.border}`,
                                  borderRadius:8, padding:"7px 14px", cursor:"pointer",
                                  fontSize:12, color:S.textDim, fontFamily:"'Outfit',sans-serif"
                                }}>
                                  📎 {lang==="de"?"Dateien":lang==="en"?"Files":"Fichiers"}
                                  <input type="file" accept="image/*,application/pdf,.pdf" multiple
                                    style={{ display:"none" }}
                                    onChange={(e) => handleUpload(doc.id, e)} />
                                </label>
                              </div>
                            )
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

        <div style={{ height:100 }} />
      </div>

      {/* ══ CTA FIXE EN BAS ═════════════════════════════════════════ */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:100,
        background:`linear-gradient(transparent, ${S.bg} 30%)`,
        padding:"20px 20px 28px",
      }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          <button
            onClick={handleProceed}
            disabled={advisorLoading}
            style={{
              width:"100%", padding:"18px 24px",
              background: advisorLoading ? S.card : canProceed
                ? `linear-gradient(135deg, ${S.gold}, #D4B55A)`
                : `linear-gradient(135deg, rgba(201,168,76,0.5), rgba(201,168,76,0.35))`,
              color: advisorLoading ? S.textDim : S.bg,
              border:"none", borderRadius:14, cursor: advisorLoading ? "wait" : "pointer",
              fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:700,
              boxShadow: canProceed && !advisorLoading ? `0 8px 32px rgba(201,168,76,0.3)` : "none",
              transition:"all 0.3s",
            }}>
            {advisorLoading
              ? "🧠 L'expert analyse vos documents…"
              : `${canProceed ? "▶" : "→"} Lancer l'analyse fiscale`
            }
            {totalPages > 0 && !advisorLoading && (
              <span style={{ marginLeft:8, fontSize:12, opacity:0.8, fontWeight:400 }}>
                · {totalPages} page{totalPages > 1 ? "s" : ""}
              </span>
            )}
          </button>
          {!canProceed && !advisorLoading && (
            <button onClick={() => setScreen("form")}
              style={{ width:"100%", background:"none", border:"none", cursor:"pointer", color:S.textDim, fontSize:12, fontFamily:"'Outfit',sans-serif", marginTop:8, padding:4 }}>
              {lang==="de"?"Ohne Dokumente weiter":lang==="en"?"Continue without documents":"Continuer sans documents"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
