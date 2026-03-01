// ═══════════════════════════════════════════════════════════════════════
//  tAIx — ChecklistDocs.jsx v6
//  Cross-platform : iOS / Android / Tablette / PC
//
//  PHASE 1 — COLLECTE  : photos s'accumulent, zéro OCR automatique
//  PHASE 2 — ANALYSE   : uniquement sur bouton CTA
//
//  Fixes cross-platform :
//  • iOS : key rotation sur chaque input → caméra se rouvre à chaque tap
//  • iOS : safe-area-inset-bottom sur CTA fixe
//  • iOS/Android : touch targets ≥ 44px partout
//  • iOS : feedback toast visible "📷 Photo ajoutée"
//  • Desktop : drag & drop + addFiles useCallback stable
//  • Tous : paddingBottom 140px pour ne pas cacher le contenu sous le CTA
//
//  Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════════════

import { useState, useRef, useCallback, useEffect } from "react";
import { useStore, SOURCE } from "./store";
import { ocrDocument, applyOCRToStore } from "./ocr";
import { genererQuestionsIA } from "./FiscalAdvisor";
import { AdvisorScreen } from "./AdvisorScreen";
import { GlobalStyles, T as S } from "./ui";
import LangSelector from "./LangSelector";
import { useT } from "./i18n";

// ── Classification par nom de fichier ─────────────────────────────────
function classifyFile(filename) {
  const n = (filename || "").toLowerCase();
  if (/d[ée]claration|di[-_]?202[0-9]|di[-_]?prev|steuerk/.test(n)) return "di_prev";
  if (/certificat.?salaire|lohnausweis|salary|cert[-_]?sal/.test(n)) return "cert_sal";
  if (/\b3a\b|pilier.?3|saeule.?3/.test(n))                          return "3a";
  if (/\blpp\b|rachat|pensionskasse|einkauf/.test(n))                 return "rachat_lpp";
  if (/compte|bancaire|\bbank\b|iban|solde|extrait|konto/.test(n))   return "comptes";
  if (/hypoth[eè]que|zinsen|mortgage/.test(n))                       return "hypotheque";
  if (/immobilier|valeur.?fiscale|grundst[uü]ck/.test(n))            return "immobilier";
  if (/entretien|travaux|renovation|unterhalt/.test(n))              return "entretien";
  if (/m[eé]dical|facture.?m[eé]d|\barzt\b/.test(n))                return "medicaux";
  if (/garde|cr[eè]che|\bkita\b|daycare/.test(n))                    return "garde";
  if (/\bdon\b|\bspen\b|charit|association/.test(n))                 return "dons";
  if (/leasing|dette|schuld/.test(n))                                return "leasing";
  return "default";
}

// ── Catalogue documents ───────────────────────────────────────────────
const DOCS = () => ([
  {
    id: "identity",
    category: { fr:"Identité & Situation", de:"Identität & Situation", en:"Identity & Situation" },
    docs: [
      { id:"di_prev",  req:false, icon:"📋", label:{ fr:"Déclaration 2024 (N-1)", de:"Steuererklärung 2024", en:"2024 Tax Return" },    hint:{ fr:"Identité extraite automatiquement par OCR", de:"Identität automatisch extrahiert", en:"Identity auto-extracted" } },
      { id:"permis",   req:false, icon:"🪪", label:{ fr:"Carte d'identité / Permis", de:"Ausweis / Aufenthalt", en:"ID / Permit" },         hint:{ fr:"Si commune ou situation a changé", de:"Bei Änderung von Gemeinde/Status", en:"If situation has changed" } },
    ]
  },
  {
    id: "revenus",
    category: { fr:"Revenus", de:"Einkommen", en:"Income" },
    docs: [
      { id:"cert_sal",   req:true,  icon:"📄", label:{ fr:"Certificat de salaire 2025", de:"Lohnausweis 2025", en:"Salary certificate 2025" }, hint:{ fr:"Formulaire officiel de votre employeur", de:"Offizielles Formular", en:"Official form from employer" } },
      { id:"avs",        req:false, icon:"🏛️", label:{ fr:"Attestation rente AVS/AI", de:"AHV/IV-Rente", en:"AVS/AI pension" },               hint:{ fr:"Si vous percevez une rente", de:"Bei Bezug einer Rente", en:"If you receive a pension" } },
      { id:"lpp_att",    req:false, icon:"🏦", label:{ fr:"Rente LPP / caisse pension", de:"BVG-Rente", en:"LPP pension" },                    hint:{ fr:"Si vous percevez une rente LPP", de:"Bei Bezug PK-Rente", en:"If you receive LPP" } },
      { id:"dividendes", req:false, icon:"📈", label:{ fr:"Titres / dividendes 2025", de:"Wertschriften 2025", en:"Securities 2025" },          hint:{ fr:"Relevé fiscal annuel banque", de:"Steuerausweis Bank", en:"Annual tax statement" } },
      { id:"chomage",    req:false, icon:"📑", label:{ fr:"Indemnités chômage", de:"Arbeitslosengeld", en:"Unemployment" },                    hint:{ fr:"Si perçu en 2025", de:"Bei Bezug 2025", en:"If received in 2025" } },
    ]
  },
  {
    id: "deductions",
    category: { fr:"Déductions & Épargne", de:"Abzüge & Vorsorge", en:"Deductions" },
    docs: [
      { id:"3a",         req:false, icon:"🏦", label:{ fr:"Pilier 3a 2025", de:"Säule 3a 2025", en:"Pillar 3a 2025" },               hint:{ fr:"Plafond CHF 7'258 salarié", de:"Grenze CHF 7'258", en:"Limit CHF 7,258" } },
      { id:"rachat_lpp", req:false, icon:"💼", label:{ fr:"Rachat LPP", de:"BVG-Einkauf", en:"LPP buy-in" },                         hint:{ fr:"100% déductible — ne pas oublier !", de:"100% abzugsfähig!", en:"100% deductible!" }, star:true },
      { id:"medicaux",   req:false, icon:"🏥", label:{ fr:"Frais médicaux", de:"Krankheitskosten", en:"Medical expenses" },           hint:{ fr:"Au-delà de 5% du revenu net", de:"Über 5% Nettoeinkommen", en:"Above 5% net income" } },
      { id:"garde",      req:false, icon:"👶", label:{ fr:"Frais de garde d'enfants", de:"Kinderbetreuung", en:"Childcare" },         hint:{ fr:"Jusqu'à CHF 10'100/enfant", de:"Bis CHF 10'100/Kind", en:"Up to CHF 10,100/child" } },
      { id:"dons",       req:false, icon:"🤝", label:{ fr:"Dons associations", de:"Spenden", en:"Donations" },                       hint:{ fr:"Max 20% du revenu net", de:"Max 20%", en:"Max 20% net income" } },
    ]
  },
  {
    id: "fortune",
    category: { fr:"Fortune & Dettes", de:"Vermögen & Schulden", en:"Assets & Debts" },
    docs: [
      { id:"comptes",    req:true,  icon:"🏧", label:{ fr:"Extraits bancaires 31.12 (TOUS)", de:"Kontoauszüge 31.12 (ALLE)", en:"Bank statements 31.12 (ALL)" }, hint:{ fr:"Tous vos comptes — solde exact", de:"Alle Konten — exakter Saldo", en:"All accounts — exact balance" } },
      { id:"hypotheque", req:false, icon:"🏠", label:{ fr:"Intérêts hypothécaires 2025", de:"Hypothekarzinsen 2025", en:"Mortgage interest 2025" },             hint:{ fr:"Décompte annuel banque", de:"Jährliche Abrechnung", en:"Annual bank statement" }, star:true },
      { id:"immobilier", req:false, icon:"🏡", label:{ fr:"Valeur fiscale immeuble", de:"Steuerwert Liegenschaft", en:"Property value" },                       hint:{ fr:"Disponible en commune", de:"Bei Gemeinde erhältlich", en:"From municipality" } },
      { id:"entretien",  req:false, icon:"🔧", label:{ fr:"Factures entretien 2025", de:"Unterhaltsrechnungen 2025", en:"Maintenance 2025" },                   hint:{ fr:"Entretien uniquement (pas valeur ajoutée)", de:"Nur Unterhalt", en:"Maintenance only" } },
      { id:"leasing",    req:false, icon:"🚗", label:{ fr:"Leasing / dettes 2025", de:"Leasing / Schulden 2025", en:"Leasing / debts 2025" },                   hint:{ fr:"Solde dû au 31.12.2025", de:"Saldo 31.12.2025", en:"Balance 31.12.2025" } },
    ]
  }
]);

// ── Toast helper ──────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position:"fixed", bottom:120, left:"50%", transform:"translateX(-50%)",
      background:"#1A2540", border:`1px solid ${S.gold}`, color:S.gold,
      padding:"10px 20px", borderRadius:99, fontSize:13, fontFamily:"'Outfit',sans-serif",
      fontWeight:600, zIndex:999, whiteSpace:"nowrap",
      boxShadow:"0 4px 20px rgba(0,0,0,0.5)",
      animation:"fadeUp 0.2s ease",
    }}>
      {msg}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
export function ChecklistScreen() {
  const { setScreen, lang, mode, importFromDoc } = useStore();
  const t  = useT(lang);
  const L  = useCallback((o) => o?.[lang] || o?.fr || o?.en || "", [lang]);
  const docs = DOCS();

  // ── PHASE 1 : Collecte ────────────────────────────────────────────
  // Chaque item : { file, docId, id (unique pour le key React) }
  const [pending, setPending]   = useState([]);
  // ── PHASE 2 : Après analyse ───────────────────────────────────────
  const [analyzed, setAnalyzed] = useState({});   // { docId: File[] }
  const [ocrStatus, setOcrStatus]     = useState({});
  const [ocrResults, setOcrResults]   = useState({});
  const [analyzing, setAnalyzing]     = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [progress, setProgress]       = useState({ done:0, total:0, label:"" });
  // ── B2B fallback ──────────────────────────────────────────────────
  const [showIdFallback, setShowIdFallback] = useState(false);
  const [manualId, setManualId]             = useState({ prenom:"", nom:"", no_contribuable:"" });
  // ── Advisor ───────────────────────────────────────────────────────
  const [advisorData, setAdvisorData]   = useState(null);
  const [showAdvisor, setShowAdvisor]   = useState(false);
  const [advisorLoading, setAdvisorLoading] = useState(false);
  // ── UX ────────────────────────────────────────────────────────────
  const [expanded, setExpanded]   = useState({ identity:true, revenus:true, deductions:false, fortune:false });
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast]           = useState(null);
  // ── iOS fix : key rotation pour chaque input caméra ──────────────
  // Chaque input caméra a son propre compteur de clé.
  // Quand on incrémente la clé, React remonte l'élément → iOS peut
  // rouvrir la caméra sans blocage.
  const [camKeys, setCamKeys] = useState({});   // { inputId: number }

  const isB2B = mode === "b2b";

  const pendingCount  = pending.length;
  const analyzedCount = Object.values(analyzed).reduce((s,a) => s + (a?.length||0), 0);
  const ocrDoneCount  = Object.values(ocrStatus).filter(s => s==="done").length;

  function bumpKey(inputId) {
    setCamKeys(k => ({ ...k, [inputId]: (k[inputId]||0) + 1 }));
  }

  // ── Afficher un toast bref ────────────────────────────────────────
  function showToast(msg) { setToast(msg); }

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 1 — COLLECTE : compression immédiate dès l'ajout
  // 35 photos iPhone × 5MB → 35 × ~300KB = 10MB en mémoire (pas 175MB)
  // ═══════════════════════════════════════════════════════════════════
  const addFiles = useCallback(async (fileList, forcedDocId) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    showToast(`⏳ ${files.length} photo${files.length>1?"s":""} en cours…`);
    // Comprimer toutes les photos en parallèle immédiatement
    const items = await Promise.all(files.map(async (f) => {
      const compressed = await compressImage(f);
      return {
        file:  compressed,
        docId: forcedDocId || classifyFile(f.name),
        name:  f.name || "photo",
        id:    `${Date.now()}_${Math.random()}`,
      };
    }));
    setPending(p => [...p, ...items]);
    showToast(`📷 ${files.length} photo${files.length>1?"s":""} ajoutée${files.length>1?"s":""}`);
  }, []);

  // Handler universel — reset immédiat de l'input + bump de clé iOS
  function onFilePick(e, inputId, forcedDocId) {
    const files = Array.from(e.target.files || []);
    // Reset AVANT addFiles pour que iOS puisse rouvrir la caméra
    e.target.value = "";
    // Bump de clé = remontage du composant input → iOS rouvre proprement
    if (inputId) bumpKey(inputId);
    addFiles(files, forcedDocId);
  }

  // Drag & drop (desktop)
  const onDragOver  = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback((e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false); }, []);
  const onDrop      = useCallback((e) => {
    e.preventDefault(); setIsDragging(false);
    addFiles(e.dataTransfer?.files);
  }, [addFiles]);  // addFiles est stable grâce à useCallback

  function removePending(id) { setPending(p => p.filter(x => x.id !== id)); }
  function clearPending()    { setPending([]); }

  // ── Compression image avant OCR (réduit 5MB → ~300KB) ────────────
  function compressImage(file, maxDim = 1800, quality = 0.82) {
    return new Promise((resolve) => {
      if (file.type === "application/pdf") { resolve(file); return; }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width: w, height: h } = img;
        if (w <= maxDim && h <= maxDim) { resolve(file); return; }
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale); h = Math.round(h * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        canvas.toBlob(blob => resolve(blob || file), "image/jpeg", quality);
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 2 — ANALYSE (bouton CTA uniquement)
  // ═══════════════════════════════════════════════════════════════════
  function mergeOcr(base, next) {
    const m = { ...base };
    const ADD = new Set(["solde_31dec","frais_medicaux","dons","frais_garde","montant_ttc"]);
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "" || v === 0 || k.startsWith("_")) continue;
      if (ADD.has(k) && typeof v === "number" && typeof m[k] === "number") m[k] += v;
      else if (m[k] == null) m[k] = v;
    }
    return m;
  }

  async function analyzeAll() {
    if (!pending.length && analyzedCount === 0) { setScreen("form"); return; }
    if (!pending.length && analyzedCount > 0)   { await launchAdvisor(ocrResults); return; }

    setAnalyzing(true);
    setAnalyzeError(null);

    try {
      // Grouper par docId
      const groups = {};
      for (const item of pending) {
        if (!groups[item.docId]) groups[item.docId] = [];
        groups[item.docId].push(item.file);
      }

      // Passer pending → analyzed
      setAnalyzed(a => {
        const next = { ...a };
        for (const [docId, files] of Object.entries(groups)) {
          next[docId] = [...(next[docId]||[]), ...files];
        }
        return next;
      });
      setPending([]);

      // OCR séquentiel avec compression
      const entries  = Object.entries(groups);
      // Compter le nombre total de fichiers (pas de groupes)
      const totalFiles = entries.reduce((s, [, fs]) => s + fs.length, 0);
      let doneFiles = 0;
      const newResults = {};

      for (const [docId, files] of entries) {
        setOcrStatus(s => ({ ...s, [docId]: "running" }));

        let merged = {};
        for (const file of files) {
          doneFiles++;
          setProgress({ done: doneFiles, total: totalFiles, label: file.name?.substring(0,24) || docId });
          try {
            // Photo déjà compressée à l'ajout — OCR direct
            const res = await ocrDocument(file, docId);
            if (!res._error) merged = mergeOcr(merged, res);
          } catch (e) {
            console.warn("OCR file error:", e);
          }
        }

        if (Object.keys(merged).length > 0) {
          applyOCRToStore(merged, importFromDoc, null, SOURCE);
          setOcrStatus(s => ({ ...s, [docId]: "done" }));
          setOcrResults(r => ({ ...r, [docId]: merged }));
          newResults[docId] = merged;
        } else {
          setOcrStatus(s => ({ ...s, [docId]: "error" }));
        }
      }

      setAnalyzing(false);

      if (isB2B) {
        const data = useStore.getState().getAll?.() || {};
        if (!data.nom && !data.prenom) setShowIdFallback(true);
      }

      await launchAdvisor({ ...ocrResults, ...newResults });

    } catch (err) {
      console.error("analyzeAll crash:", err);
      setAnalyzing(false);
      setAnalyzeError("Une erreur est survenue. Vos photos sont conservées — réessayez.");
    }
  }

  async function launchAdvisor(results) {
    if (!Object.keys(results).length) { setScreen("form"); return; }
    setAdvisorLoading(true);
    try {
      const storeData = useStore.getState().getAll?.() || {};
      const advice    = await genererQuestionsIA(results, storeData, lang);
      if (advice?.questions?.length > 0) {
        setAdvisorData(advice); setAdvisorLoading(false); setShowAdvisor(true); return;
      }
    } catch {}
    setAdvisorLoading(false);
    setScreen("form");
  }

  function confirmManualId() {
    if (manualId.prenom)          importFromDoc("prenom",          manualId.prenom,          "manuel");
    if (manualId.nom)             importFromDoc("nom",             manualId.nom,             "manuel");
    if (manualId.no_contribuable) importFromDoc("no_contribuable", manualId.no_contribuable, "manuel");
    setShowIdFallback(false);
  }

  if (showAdvisor && advisorData) {
    return <AdvisorScreen advisorData={advisorData} lang={lang}
             onComplete={() => { setShowAdvisor(false); setScreen("form"); }} />;
  }

  // ── Labels CTA ────────────────────────────────────────────────────
  const ctaLabel = () => {
    if (analyzing)      return `⏳ Photo ${progress.done}/${progress.total} — ${progress.label || "…"}`;
    if (advisorLoading) return "🧠 L'expert fiscal analyse votre dossier…";
    if (pendingCount > 0)
      return `▶ Analyser ${pendingCount} photo${pendingCount>1?"s":""}`;
    if (analyzedCount > 0)
      return `▶ Continuer (${ocrDoneCount} analysé${ocrDoneCount>1?"s":""})`;
    return L({ fr:"Continuer sans documents", de:"Ohne Dokumente weiter", en:"Continue without documents" });
  };

  const ctaActive = (pendingCount > 0 || analyzedCount > 0) && !analyzing && !advisorLoading;

  // ── Composant bouton upload cross-platform ────────────────────────
  // inputId : identifiant unique pour la rotation de clé iOS
  const UploadBtn = ({ inputId, forcedDocId, capture, accept, multiple, style, children }) => (
    <label style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
      minHeight:44, minWidth:44, cursor:"pointer", ...style }}>
      {children}
      <input
        key={camKeys[inputId] || 0}   // ← rotation de clé → remontage → iOS réouvre caméra
        type="file"
        accept={accept}
        capture={capture || undefined}
        multiple={multiple || undefined}
        style={{ display:"none" }}
        onChange={e => onFilePick(e, inputId, forcedDocId)}
      />
    </label>
  );

  // ════════════════════════════════════════════════════════════════════
  // RENDER
  // ── Détection iOS ─────────────────────────────────────────────────
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);

  // ════════════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight:"100vh", background:S.bg, paddingBottom:"calc(140px + env(safe-area-inset-bottom,0px))" }}>
      <GlobalStyles />
      <div style={{ position:"fixed", top:16, right:16, zIndex:100 }}><LangSelector /></div>

      {/* Toast feedback */}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {/* ── HEADER ──────────────────────────────────────────── */}
      <div style={{ position:"sticky", top:0, zIndex:50,
        background:`linear-gradient(180deg,${S.bg} 85%,transparent)`, paddingBottom:6 }}>
        <div style={{ maxWidth:680, margin:"0 auto", padding:"14px 20px 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
            <button onClick={() => setScreen("welcome")}
              style={{ background:"none", border:`1px solid ${S.border}`, color:S.textDim,
                borderRadius:8, padding:"8px 14px", cursor:"pointer", fontSize:13,
                fontFamily:"'Outfit',sans-serif", minHeight:44, minWidth:44 }}>
              ←
            </button>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:S.cream, fontWeight:300 }}>
                {L({ fr:"Documents du dossier", de:"Dokumente", en:"Dossier documents" })}
              </div>
              <div style={{ fontSize:11, color:S.textDim, fontFamily:"'Outfit',sans-serif", marginTop:2 }}>
                {pendingCount > 0 && <span style={{color:S.gold}}>📷 {pendingCount} en attente · </span>}
                {ocrDoneCount > 0 && <span style={{color:S.green}}>✨ {ocrDoneCount} analysé{ocrDoneCount>1?"s":""}</span>}
                {pendingCount === 0 && ocrDoneCount === 0 &&
                  L({ fr:"Ajoutez vos documents puis analysez", de:"Dokumente hinzufügen", en:"Add your documents" })}
              </div>
            </div>
          </div>
          {analyzing && (
            <div style={{ height:3, background:S.card, borderRadius:99, overflow:"hidden" }}>
              <div style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg,${S.gold},#D4B55A)`,
                width:`${Math.round((progress.done/Math.max(progress.total,1))*100)}%`, transition:"width 0.3s" }} />
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"0 20px" }}>

        {/* ── ZONE UPLOAD — adaptée à la plateforme ─────────── */}
        <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
          style={{ marginBottom:14, padding:"20px 16px", borderRadius:14,
            border:`2px dashed ${isDragging ? S.gold : S.border}`,
            background: isDragging ? `rgba(201,168,76,0.06)` : "transparent",
            textAlign:"center", transition:"all 0.2s" }}>

          <div style={{ fontSize:28, marginBottom:6 }}>📂</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:19, color:S.cream,
            fontWeight:300, marginBottom:4 }}>
            {L({ fr:"Tous vos documents ici", de:"Alle Dokumente hier", en:"All documents here" })}
          </div>

          {/* ══ iOS — caméra séquentielle avec tip clair ══ */}
          {isIOS && (
            <>
              {/* Tip iOS */}
              <div style={{ margin:"8px auto 14px", maxWidth:340, padding:"10px 14px",
                borderRadius:10, background:`rgba(201,168,76,0.08)`,
                border:`1px solid rgba(201,168,76,0.3)` }}>
                <div style={{ fontSize:12, color:S.gold, fontFamily:"'Outfit',sans-serif",
                  fontWeight:700, marginBottom:4 }}>
                  📱 {L({fr:"Sur iPhone — comment ajouter vos photos",de:"Auf iPhone — Fotos hinzufügen",en:"On iPhone — how to add photos"})}
                </div>
                <div style={{ fontSize:12, color:S.textDim, fontFamily:"'Outfit',sans-serif", lineHeight:1.5 }}>
                  {L({
                    fr:"Tapez 📷 → prenez la photo → tapez à nouveau 📷 pour la suivante. Répétez pour chaque document. Ou photographiez d'abord avec l'app Appareil Photo, puis tapez 🖼 Galerie.",
                    de:"Tippen Sie 📷 → Foto aufnehmen → erneut 📷 für das nächste. Oder zuerst mit der Kamera-App fotografieren, dann 🖼 Galerie.",
                    en:"Tap 📷 → take photo → tap 📷 again for next one. Or photograph first with Camera app, then tap 🖼 Gallery."
                  })}
                </div>
              </div>

              <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
                {/* Bouton caméra principal iOS — grand, doré, bien visible */}
                <UploadBtn inputId="cam_global" capture="environment" accept="image/*"
                  style={{ padding:"16px 28px", borderRadius:12,
                    background:`linear-gradient(135deg,${S.gold},#D4B55A)`,
                    color:S.bg, fontFamily:"'Outfit',sans-serif", fontSize:15,
                    fontWeight:700, gap:8, boxShadow:`0 6px 24px rgba(201,168,76,0.35)` }}>
                  📷 {L({ fr:"Prendre une photo", de:"Foto aufnehmen", en:"Take a photo" })}
                </UploadBtn>

                {/* Galerie iOS — secondaire, pour ceux qui ont déjà pris leurs photos */}
                <UploadBtn inputId="gal_global" accept="image/*" multiple
                  style={{ padding:"16px 20px", borderRadius:12, background:S.card,
                    border:`1px solid ${S.borderHi}`, color:S.cream,
                    fontFamily:"'Outfit',sans-serif", fontSize:14, gap:6 }}>
                  🖼 {L({ fr:"Galerie", de:"Galerie", en:"Gallery" })}
                </UploadBtn>

                {/* PDF */}
                <UploadBtn inputId="pdf_global" accept="application/pdf" multiple
                  style={{ padding:"16px 16px", borderRadius:12, background:S.card,
                    border:`1px solid ${S.border}`, color:S.textDim,
                    fontFamily:"'Outfit',sans-serif", fontSize:14, gap:6 }}>
                  📎 PDF
                </UploadBtn>
              </div>

              {/* Compteur en temps réel si des photos sont en attente — encourage à continuer */}
              {pendingCount > 0 && (
                <div style={{ marginTop:14, padding:"10px 16px", borderRadius:10,
                  background:`rgba(52,211,153,0.08)`, border:`1px solid rgba(52,211,153,0.25)`,
                  display:"inline-flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:20 }}>✅</span>
                  <span style={{ fontSize:14, fontWeight:700, color:S.green,
                    fontFamily:"'Outfit',sans-serif" }}>
                    {pendingCount} photo{pendingCount>1?"s":""} — {L({fr:"continuez ou analysez",de:"weiter oder analysieren",en:"keep going or analyse"})}
                  </span>
                </div>
              )}
            </>
          )}

          {/* ══ Android & Desktop — sélection multiple ══ */}
          {!isIOS && (
            <>
              <div style={{ fontSize:12, color:S.textDim, fontFamily:"'Outfit',sans-serif", marginBottom:14 }}>
                {isAndroid
                  ? L({fr:"Sélectionnez toutes vos photos en une fois depuis la galerie",de:"Alle Fotos auf einmal aus der Galerie wählen",en:"Select all your photos at once from gallery"})
                  : L({fr:"Glissez vos fichiers ici ou sélectionnez-les",de:"Dateien hierher ziehen oder auswählen",en:"Drag files here or select them"})}
              </div>
              <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
                {/* Galerie multiple — bouton principal sur Android */}
                <UploadBtn inputId="gal_global" accept="image/*" multiple
                  style={{ padding:"14px 24px", borderRadius:12,
                    background: isAndroid ? `linear-gradient(135deg,${S.gold},#D4B55A)` : S.card,
                    border: isAndroid ? "none" : `1px solid ${S.borderHi}`,
                    color: isAndroid ? S.bg : S.cream,
                    fontFamily:"'Outfit',sans-serif", fontSize:14, fontWeight:700, gap:8,
                    boxShadow: isAndroid ? `0 6px 24px rgba(201,168,76,0.35)` : "none" }}>
                  🖼 {L({ fr:"Sélectionner photos", de:"Fotos auswählen", en:"Select photos" })}
                </UploadBtn>

                {/* Caméra */}
                <UploadBtn inputId="cam_global" capture="environment" accept="image/*"
                  style={{ padding:"14px 20px", borderRadius:12,
                    background: !isAndroid ? `linear-gradient(135deg,${S.gold},#D4B55A)` : S.card,
                    border: !isAndroid ? "none" : `1px solid ${S.border}`,
                    color: !isAndroid ? S.bg : S.textDim,
                    fontFamily:"'Outfit',sans-serif", fontSize:14, fontWeight:700, gap:6 }}>
                  📷 {L({ fr:"Photo", de:"Foto", en:"Photo" })}
                </UploadBtn>

                {/* PDF */}
                <UploadBtn inputId="pdf_global" accept="image/*,application/pdf" multiple
                  style={{ padding:"14px 16px", borderRadius:12, background:S.card,
                    border:`1px solid ${S.border}`, color:S.textDim,
                    fontFamily:"'Outfit',sans-serif", fontSize:13, gap:6 }}>
                  📎 PDF
                </UploadBtn>
              </div>
            </>
          )}
        </div>

        {/* ── ZONE EN ATTENTE ─────────────────────────────────── */}
        {pendingCount > 0 && (
          <div style={{ marginBottom:14, padding:"12px 14px", borderRadius:12,
            background:`rgba(201,168,76,0.05)`, border:`1px solid rgba(201,168,76,0.25)` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <div style={{ fontSize:13, fontWeight:700, color:S.gold, fontFamily:"'Outfit',sans-serif" }}>
                📷 {pendingCount} {L({ fr:`photo${pendingCount>1?"s":""} prête${pendingCount>1?"s":""} à analyser`,
                                       de:`Foto${pendingCount>1?"s":""} bereit`,
                                       en:`photo${pendingCount>1?"s":""} ready` })}
              </div>
              <button onClick={clearPending}
                style={{ fontSize:11, color:S.muted, background:"none", border:"none",
                  cursor:"pointer", fontFamily:"'Outfit',sans-serif", padding:"4px 8px", minHeight:44 }}>
                {L({fr:"Tout supprimer",de:"Alle löschen",en:"Clear all"})}
              </button>
            </div>

            {/* Liste des fichiers en attente */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
              {pending.map((item) => (
                <div key={item.id} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 10px",
                  borderRadius:8, background:S.card, border:`1px solid ${S.border}` }}>
                  <span style={{ fontSize:13 }}>🖼</span>
                  <span style={{ fontSize:11, color:S.cream, fontFamily:"'Outfit',sans-serif",
                    maxWidth:110, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {item.name.length > 16 ? item.name.substring(0,14)+"…" : item.name}
                  </span>
                  <button onClick={() => removePending(item.id)}
                    style={{ fontSize:12, color:S.muted, background:"none", border:"none",
                      cursor:"pointer", padding:"0 2px", minHeight:44, minWidth:24 }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Bouton pour continuer à ajouter des photos */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <UploadBtn inputId="cam_add" capture="environment" accept="image/*"
                style={{ padding:"8px 14px", borderRadius:9, background:S.surface,
                  border:`1px solid rgba(201,168,76,0.35)`, color:S.gold,
                  fontFamily:"'Outfit',sans-serif", fontSize:12, fontWeight:600, gap:6 }}>
                + 📷 {L({fr:"Photo",de:"Foto",en:"Photo"})}
              </UploadBtn>
              <UploadBtn inputId="gal_add" accept="image/*" multiple
                style={{ padding:"8px 14px", borderRadius:9, background:S.surface,
                  border:`1px solid ${S.border}`, color:S.textDim,
                  fontFamily:"'Outfit',sans-serif", fontSize:12, gap:6 }}>
                + 🖼 {L({fr:"Galerie",de:"Galerie",en:"Gallery"})}
              </UploadBtn>
            </div>
          </div>
        )}

        {/* ── B2B IDENTITY FALLBACK ─────────────────────────── */}
        {isB2B && showIdFallback && (
          <div style={{ marginBottom:14, padding:"14px 16px", borderRadius:12,
            background:`rgba(201,168,76,0.05)`, border:`1px solid rgba(201,168,76,0.3)` }}>
            <div style={{ fontSize:12, fontWeight:700, color:S.gold,
              fontFamily:"'Outfit',sans-serif", marginBottom:8 }}>
              🔍 {L({fr:"Client non identifié — saisir manuellement",de:"Nicht identifiziert",en:"Not identified"})}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
              {[["prenom", L({fr:"Prénom",de:"Vorname",en:"First name"})],
                ["nom",    L({fr:"Nom",de:"Nachname",en:"Last name"})]].map(([k,ph]) => (
                <input key={k} value={manualId[k]} placeholder={ph}
                  onChange={e => setManualId(p=>({...p,[k]:e.target.value}))}
                  style={{ padding:"12px", borderRadius:8, border:`1px solid ${S.border}`,
                    background:S.card, color:S.cream, fontSize:14,
                    fontFamily:"'Outfit',sans-serif", outline:"none", minHeight:44 }} />
              ))}
            </div>
            <input value={manualId.no_contribuable}
              placeholder={L({fr:"N° contribuable (facultatif)",de:"Steuernummer",en:"Tax ID"})}
              onChange={e => setManualId(p=>({...p,no_contribuable:e.target.value}))}
              style={{ width:"100%", padding:"12px", borderRadius:8, border:`1px solid ${S.border}`,
                background:S.card, color:S.cream, fontSize:14, fontFamily:"'Outfit',sans-serif",
                outline:"none", boxSizing:"border-box", marginBottom:8, minHeight:44 }} />
            <button onClick={confirmManualId}
              disabled={!manualId.prenom || !manualId.nom}
              style={{ padding:"12px 22px", borderRadius:9, minHeight:44,
                background: manualId.prenom && manualId.nom ? `linear-gradient(135deg,${S.gold},#D4B55A)` : S.card,
                color: manualId.prenom && manualId.nom ? S.bg : S.textDim,
                border:"none", fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:700,
                cursor: manualId.prenom && manualId.nom ? "pointer" : "default" }}>
              {L({fr:"Confirmer",de:"Bestätigen",en:"Confirm"})} →
            </button>
          </div>
        )}

        {/* ── CATALOGUE PAR CATÉGORIE ──────────────────────────── */}
        {docs.map(cat => (
          <div key={cat.id} style={{ marginBottom:10 }}>
            {/* En-tête de catégorie cliquable */}
            <button onClick={() => setExpanded(e => ({...e, [cat.id]: !e[cat.id]}))}
              style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                background:S.card, border:`1px solid ${S.border}`, borderRadius:10,
                padding:"12px 16px", cursor:"pointer", marginBottom: expanded[cat.id] ? 8 : 0,
                minHeight:44 }}>
              <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:700, color:S.cream }}>
                {L(cat.category)}
              </span>
              <span style={{ fontSize:11, color:S.textDim }}>
                {cat.docs.filter(d => (analyzed[d.id]?.length||0) > 0).length}/{cat.docs.length}
                {" "}{expanded[cat.id] ? "▲" : "▼"}
              </span>
            </button>

            {expanded[cat.id] && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))", gap:8 }}>
                {cat.docs.map(doc => {
                  const status   = ocrStatus[doc.id];
                  const pages    = analyzed[doc.id]?.length || 0;
                  const hasPend  = pending.some(p => p.docId === doc.id);
                  const isDone   = status === "done";
                  const isRunning = status === "running";

                  return (
                    <div key={doc.id} style={{ padding:"11px 12px", borderRadius:10,
                      background: isDone ? `rgba(52,211,153,0.05)` : hasPend ? `rgba(201,168,76,0.05)` : S.card,
                      border:`1px solid ${isDone ? "rgba(52,211,153,0.25)" : hasPend ? "rgba(201,168,76,0.25)" : S.border}`,
                      transition:"all 0.2s" }}>
                      <div style={{ display:"flex", gap:7, alignItems:"flex-start", marginBottom:6 }}>
                        <span style={{ fontSize:16 }}>{doc.icon}</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, fontWeight:600, lineHeight:1.3,
                            color: isDone ? S.green : doc.star ? S.gold : S.cream,
                            fontFamily:"'Outfit',sans-serif", marginBottom:2 }}>
                            {L(doc.label)}
                            {doc.star && !isDone && (
                              <span style={{ marginLeft:4, fontSize:9, background:"rgba(201,168,76,0.15)",
                                border:"1px solid rgba(201,168,76,0.3)", color:S.gold,
                                borderRadius:99, padding:"1px 5px" }}>★</span>
                            )}
                          </div>
                          {isRunning  && <div style={{ fontSize:10, color:S.gold, fontFamily:"'Outfit',sans-serif" }}>⏳ Analyse…</div>}
                          {isDone     && <div style={{ fontSize:10, color:S.green, fontFamily:"'Outfit',sans-serif" }}>✨ {pages}p extrait{pages>1?"s":""}</div>}
                          {status==="error" && <div style={{ fontSize:10, color:S.red, fontFamily:"'Outfit',sans-serif" }}>⚠️ À vérifier</div>}
                          {hasPend && !isDone && <div style={{ fontSize:10, color:S.gold, fontFamily:"'Outfit',sans-serif" }}>📷 En attente</div>}
                        </div>
                      </div>

                      {/* Boutons upload ciblés — COLLECTE uniquement */}
                      <div style={{ display:"flex", gap:6 }}>
                        <UploadBtn inputId={`cam_${doc.id}`} forcedDocId={doc.id}
                          capture="environment" accept="image/*"
                          style={{ flex:1, padding:"8px 0", borderRadius:8, background:S.surface,
                            border:`1px solid ${S.border}`, fontSize:12, color:S.gold,
                            fontFamily:"'Outfit',sans-serif", fontWeight:600 }}>
                          📷
                        </UploadBtn>
                        <UploadBtn inputId={`gal_${doc.id}`} forcedDocId={doc.id}
                          accept="image/*,application/pdf" multiple
                          style={{ flex:2, padding:"8px 0", borderRadius:8, background:S.surface,
                            border:`1px solid ${S.border}`, fontSize:11, color:S.textDim,
                            fontFamily:"'Outfit',sans-serif", gap:4 }}>
                          📎 {L({fr:"Fichier(s)",de:"Datei(en)",en:"File(s)"})}
                        </UploadBtn>
                        {(pages > 0 || hasPend) && (
                          <button onClick={() => {
                              setAnalyzed(a=>({...a,[doc.id]:[]}));
                              setOcrStatus(s=>({...s,[doc.id]:null}));
                              setPending(p => p.filter(x => x.docId !== doc.id));
                            }}
                            style={{ padding:"8px 9px", borderRadius:8, background:"none",
                              border:`1px solid ${S.border}`, color:S.muted, fontSize:11,
                              cursor:"pointer", minHeight:44, minWidth:36 }}>
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── CTA FIXE EN BAS ─────────────────────────────────── */}
      {/* paddingBottom = safe-area-inset-bottom pour iPhone avec home indicator */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:100,
        background:`linear-gradient(transparent,${S.bg} 30%)`,
        padding:`20px 20px calc(28px + env(safe-area-inset-bottom, 0px))` }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          {analyzeError && (
            <div style={{ marginBottom:10, padding:"12px 16px", borderRadius:10,
              background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.3)",
              color:S.red, fontSize:13, fontFamily:"'Outfit',sans-serif", textAlign:"center" }}>
              ⚠️ {analyzeError}
            </div>
          )}
          <button onClick={analyzeAll}
            disabled={analyzing || advisorLoading}
            style={{ width:"100%", padding:"18px 24px", minHeight:56,
              background: ctaActive ? `linear-gradient(135deg,${S.gold},#D4B55A)` : S.card,
              color: ctaActive ? S.bg : S.textDim,
              border:"none", borderRadius:14,
              cursor: analyzing || advisorLoading ? "wait" : "pointer",
              fontFamily:"'Outfit',sans-serif", fontSize:15, fontWeight:700,
              boxShadow: ctaActive ? `0 8px 32px rgba(201,168,76,0.3)` : "none",
              transition:"all 0.3s",
              // Touch : éviter le 300ms delay sur mobile
              touchAction:"manipulation",
            }}>
            {ctaLabel()}
          </button>
          {!analyzing && !advisorLoading && pendingCount === 0 && analyzedCount === 0 && (
            <button onClick={() => setScreen("form")}
              style={{ width:"100%", background:"none", border:"none", cursor:"pointer",
                color:S.textDim, fontSize:12, fontFamily:"'Outfit',sans-serif",
                marginTop:8, padding:"8px 4px", touchAction:"manipulation" }}>
              {L({fr:"Continuer sans documents (saisie manuelle)",de:"Ohne Dokumente weiter",en:"Continue without documents"})}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
