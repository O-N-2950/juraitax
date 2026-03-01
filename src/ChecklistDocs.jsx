// ═══════════════════════════════════════════════════════════════════════
//  tAIx — ChecklistDocs.jsx v5
//  DEUX PHASES STRICTEMENT SÉPARÉES :
//    PHASE 1 — COLLECTE  : photos s'accumulent, ZÉRO OCR automatique
//    PHASE 2 — ANALYSE   : OCR + advisor, uniquement sur bouton CTA
//  Compatible iOS (capture="environment" reopen), Android, desktop
//  Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════════════

import { useState, useRef, useCallback } from "react";
import { useStore, SOURCE } from "./store";
import { ocrDocument, applyOCRToStore } from "./ocr";
import { genererQuestionsIA } from "./FiscalAdvisor";
import { AdvisorScreen } from "./AdvisorScreen";
import { GlobalStyles, T as S } from "./ui";
import LangSelector from "./LangSelector";
import { useT } from "./i18n";

// ── Heuristique de classification par nom de fichier ─────────────────
function classifyFile(filename) {
  const n = (filename || "").toLowerCase();
  if (/d[ée]claration|di[-_]?202[0-9]|di[-_]?prev|steuerk/.test(n)) return "di_prev";
  if (/certificat.?salaire|lohnausweis|salary|cert[-_]?sal/.test(n)) return "cert_sal";
  if (/3a|pilier.?3|saeule.?3/.test(n))                              return "3a";
  if (/lpp|rachat|pension.?fund|pensionskasse|einkauf/.test(n))      return "rachat_lpp";
  if (/compte|bancaire|bank|iban|solde|extrait|konto/.test(n))       return "comptes";
  if (/hypoth[eè]que|zinsen|mortgage/.test(n))                       return "hypotheque";
  if (/immobilier|valeur.?fiscale|grundst[uü]ck/.test(n))            return "immobilier";
  if (/entretien|travaux|renovation|unterhalt/.test(n))              return "entretien";
  if (/m[eé]dical|facture.?m[eé]d|arzt|doctor/.test(n))             return "medicaux";
  if (/garde|cr[eè]che|kita|daycare/.test(n))                        return "garde";
  if (/don|spen|charit|association/.test(n))                         return "dons";
  if (/leasing|dette|schuld/.test(n))                                return "leasing";
  return "default";
}

// ── Catalogue de documents ────────────────────────────────────────────
const DOCS = (t) => ([
  {
    id: "identity",
    category: { fr:"Identité & Situation", de:"Identität & Situation", it:"Identità", en:"Identity" },
    docs: [
      { id:"di_prev",  required:false, icon:"📋", label:{ fr:"Déclaration 2024 (N-1)", de:"Steuererklärung 2024", en:"2024 Tax Return" },    hint:{ fr:"Identité extraite automatiquement", de:"Identität automatisch extrahiert", en:"Identity auto-extracted" }, camera:true },
      { id:"permis",   required:false, icon:"🪪", label:{ fr:"Carte d'identité / Permis", de:"Ausweis / Aufenthalt", en:"ID / Permit" },        hint:{ fr:"Si commune ou situation a changé", de:"Bei Änderung von Gemeinde/Status", en:"If municipality or status changed" }, camera:true },
    ]
  },
  {
    id: "revenus",
    category: { fr:"Revenus", de:"Einkommen", it:"Redditi", en:"Income" },
    docs: [
      { id:"cert_sal",    required:true,  icon:"📄", label:{ fr:"Certificat de salaire 2025", de:"Lohnausweis 2025", en:"2025 Salary certificate" }, hint:{ fr:"Formulaire officiel de votre employeur", de:"Offizielles Formular", en:"Official form from employer" }, camera:true },
      { id:"avs",         required:false, icon:"🏛️", label:{ fr:"Rente AVS/AI", de:"AHV/IV-Rente", en:"AVS/AI Pension" },                         hint:{ fr:"Si vous percevez une rente", de:"Bei Bezug einer Rente", en:"If you receive a pension" }, camera:true },
      { id:"lpp_att",     required:false, icon:"🏦", label:{ fr:"Rente LPP / caisse pension", de:"BVG-Rente", en:"LPP Pension" },                  hint:{ fr:"Si vous percevez une rente LPP", de:"Bei Bezug PK-Rente", en:"If you receive LPP income" }, camera:true },
      { id:"dividendes",  required:false, icon:"📈", label:{ fr:"Titres / dividendes 2025", de:"Wertschriften 2025", en:"Securities 2025" },        hint:{ fr:"Relevé fiscal annuel banque", de:"Steuerausweis Bank", en:"Annual tax statement" }, camera:true },
      { id:"chomage",     required:false, icon:"📑", label:{ fr:"Indemnités chômage", de:"Arbeitslosengeld", en:"Unemployment" },                   hint:{ fr:"Si perçu en 2025", de:"Bei Bezug 2025", en:"If received in 2025" }, camera:true },
    ]
  },
  {
    id: "deductions",
    category: { fr:"Déductions & Épargne", de:"Abzüge & Vorsorge", it:"Deduzioni", en:"Deductions" },
    docs: [
      { id:"3a",          required:false, icon:"🏦", label:{ fr:"Pilier 3a 2025", de:"Säule 3a 2025", en:"Pillar 3a 2025" },             hint:{ fr:"Plafond CHF 7'258 salarié", de:"Grenze CHF 7'258", en:"Limit CHF 7,258 employee" }, camera:true },
      { id:"rachat_lpp",  required:false, icon:"💼", label:{ fr:"Rachat LPP", de:"BVG-Einkauf", en:"LPP Buy-in" },                       hint:{ fr:"Déduction 100% — ne pas oublier !", de:"100% abzugsfähig!", en:"100% deductible!" }, camera:true, highlight:true },
      { id:"medicaux",    required:false, icon:"🏥", label:{ fr:"Frais médicaux non remboursés", de:"Krankheitskosten", en:"Medical" },   hint:{ fr:"Au-delà de 5% du revenu net", de:"Über 5% Nettoeinkommen", en:"Above 5% net income" }, camera:true },
      { id:"garde",       required:false, icon:"👶", label:{ fr:"Frais de garde d'enfants", de:"Kinderbetreuung", en:"Childcare" },       hint:{ fr:"Jusqu'à CHF 10'100/enfant", de:"Bis CHF 10'100/Kind", en:"Up to CHF 10,100/child" }, camera:true },
      { id:"dons",        required:false, icon:"🤝", label:{ fr:"Dons à associations", de:"Spenden", en:"Donations" },                   hint:{ fr:"Max 20% du revenu net", de:"Max 20% Nettoeinkommen", en:"Max 20% net income" }, camera:true },
    ]
  },
  {
    id: "fortune",
    category: { fr:"Fortune & Dettes", de:"Vermögen & Schulden", it:"Sostanza", en:"Assets & Debts" },
    docs: [
      { id:"comptes",     required:true,  icon:"🏧", label:{ fr:"Extraits bancaires 31.12 (TOUS)", de:"Kontoauszüge 31.12 (ALLE)", en:"Bank statements 31.12 (ALL)" }, hint:{ fr:"Solde exact — TOUS les comptes", de:"Exakter Saldo — ALLE Konten", en:"Exact balance — ALL accounts" }, camera:true },
      { id:"hypotheque",  required:false, icon:"🏠", label:{ fr:"Intérêts hypothécaires 2025", de:"Hypothekarzinsen 2025", en:"Mortgage interest 2025" },             hint:{ fr:"Décompte annuel banque", de:"Jährliche Abrechnung", en:"Annual bank statement" }, camera:true, highlight:true },
      { id:"immobilier",  required:false, icon:"🏡", label:{ fr:"Valeur fiscale immeuble", de:"Steuerwert Liegenschaft", en:"Property fiscal value" },                hint:{ fr:"Disponible en commune", de:"Erhältlich bei Gemeinde", en:"Available from municipality" }, camera:true },
      { id:"entretien",   required:false, icon:"🔧", label:{ fr:"Factures entretien 2025", de:"Unterhaltsrechnungen 2025", en:"Maintenance invoices 2025" },           hint:{ fr:"Travaux d'entretien (pas valeur ajoutée)", de:"Unterhalt (keine Wertvermehrung)", en:"Maintenance only" }, camera:true },
      { id:"leasing",     required:false, icon:"🚗", label:{ fr:"Leasing / dettes 2025", de:"Leasing / Schulden 2025", en:"Leasing / debts 2025" },                   hint:{ fr:"Solde dû au 31.12.2025", de:"Saldo per 31.12.2025", en:"Balance due 31.12.2025" }, camera:true },
    ]
  }
]);

// ════════════════════════════════════════════════════════════════════════
export function ChecklistScreen() {
  const { setScreen, lang, mode, getAll, importFromDoc } = useStore();
  const t = useT(lang);
  const L = useCallback((obj) => obj?.[lang] || obj?.fr || obj?.en || "", [lang]);

  // ── PHASE 1 — COLLECTE (aucun OCR) ────────────────────────────────
  // pending : liste plate de { file, docId, preview }
  const [pending, setPending] = useState([]);

  // ── PHASE 2 — ANALYSE (sur bouton uniquement) ──────────────────────
  const [analyzed, setAnalyzed]     = useState({});   // { docId: File[] }
  const [ocrStatus, setOcrStatus]   = useState({});   // { docId: 'running'|'done'|'error' }
  const [ocrResults, setOcrResults] = useState({});
  const [analyzing, setAnalyzing]   = useState(false);
  const [progress, setProgress]     = useState({ done:0, total:0, label:"" });

  // ── B2B fallback ───────────────────────────────────────────────────
  const [showIdFallback, setShowIdFallback] = useState(false);
  const [manualId, setManualId]             = useState({ prenom:"", nom:"", no_contribuable:"" });

  // ── Advisor ────────────────────────────────────────────────────────
  const [advisorData, setAdvisorData]   = useState(null);
  const [showAdvisor, setShowAdvisor]   = useState(false);
  const [advisorLoading, setAdvisorLoading] = useState(false);

  // ── UI ─────────────────────────────────────────────────────────────
  const [expanded, setExpanded]  = useState({ identity:true, revenus:true, deductions:false, fortune:false });
  const [isDragging, setIsDragging] = useState(false);
  const isB2B = mode === "b2b";
  const docs  = DOCS(t);

  // Compteurs
  const pendingCount   = pending.length;
  const analyzedCount  = Object.values(analyzed).reduce((s, a) => s + (a?.length||0), 0);
  const totalFiles     = pendingCount + analyzedCount;
  const ocrDoneCount   = Object.values(ocrStatus).filter(s => s==="done").length;

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 1 — COLLECTE : ajouter des fichiers SANS rien déclencher
  // ═══════════════════════════════════════════════════════════════════
  function addFiles(fileList, forcedDocId) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const items = files.map(f => ({
      file:  f,
      docId: forcedDocId || classifyFile(f.name),
      name:  f.name || "photo",
      size:  f.size,
    }));
    setPending(p => [...p, ...items]);
  }

  // Handler générique — reset l'input APRÈS avoir copié les fichiers
  // (le reset est nécessaire pour iOS qui sinon n'ouvre plus l'appareil photo)
  function onFilePick(e, forcedDocId) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";          // reset immédiat → iOS peut re-ouvrir la caméra
    addFiles(files, forcedDocId);
  }

  function removePending(idx) {
    setPending(p => p.filter((_, i) => i !== idx));
  }

  const onDragOver  = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback((e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false); }, []);
  const onDrop      = useCallback((e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer?.files); }, []);

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 2 — ANALYSE : appelée UNIQUEMENT par le bouton CTA
  // ═══════════════════════════════════════════════════════════════════
  function mergeOcr(base, next) {
    const m = { ...base };
    const ADD = new Set(["solde_31dec","frais_medicaux","dons","frais_garde","montant_ttc"]);
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "" || v === 0 || k.startsWith("_")) continue;
      if (ADD.has(k) && typeof v === "number" && typeof m[k] === "number") m[k] = m[k] + v;
      else if (!m[k]) m[k] = v;
    }
    return m;
  }

  async function analyzeAll() {
    if (!pending.length && analyzedCount === 0) { setScreen("form"); return; }
    if (!pending.length && analyzedCount > 0)   { launchAdvisor(ocrResults); return; }

    setAnalyzing(true);

    // Grouper les pending par docId
    const groups = {};
    for (const item of pending) {
      if (!groups[item.docId]) groups[item.docId] = [];
      groups[item.docId].push(item.file);
    }

    // Déplacer dans analyzed
    setAnalyzed(a => {
      const next = { ...a };
      for (const [docId, files] of Object.entries(groups)) {
        next[docId] = [...(next[docId]||[]), ...files];
      }
      return next;
    });
    setPending([]);

    // OCR séquentiel (un groupe à la fois pour ne pas surcharger)
    const entries   = Object.entries(groups);
    const allNew    = {};
    let done = 0;

    for (const [docId, files] of entries) {
      setProgress({ done, total: entries.length, label: files[0]?.name?.substring(0,28) || docId });
      setOcrStatus(s => ({ ...s, [docId]: "running" }));

      let merged = {};
      for (let i = 0; i < files.length; i++) {
        try {
          const res = await ocrDocument(files[i], docId);
          if (!res._error) merged = mergeOcr(merged, res);
        } catch {}
      }

      if (Object.keys(merged).length > 0) {
        applyOCRToStore(merged, importFromDoc, null, SOURCE);
        setOcrStatus(s => ({ ...s, [docId]: "done" }));
        setOcrResults(r => { allNew[docId] = merged; return { ...r, [docId]: merged }; });
      } else {
        setOcrStatus(s => ({ ...s, [docId]: "error" }));
      }
      done++;
      setProgress({ done, total: entries.length, label: "" });
    }

    setAnalyzing(false);

    // Vérifier identité B2B
    if (isB2B) {
      const data = useStore.getState().getAll?.() || {};
      if (!data.nom && !data.prenom) setShowIdFallback(true);
    }

    const combined = { ...ocrResults, ...allNew };
    await launchAdvisor(combined);
  }

  async function launchAdvisor(results) {
    if (!Object.keys(results).length) { setScreen("form"); return; }
    setAdvisorLoading(true);
    try {
      const storeData = useStore.getState().getAll?.() || {};
      const advice    = await genererQuestionsIA(results, storeData, lang);
      if (advice?.questions?.length > 0) {
        setAdvisorData(advice);
        setAdvisorLoading(false);
        setShowAdvisor(true);
        return;
      }
    } catch {}
    setAdvisorLoading(false);
    setScreen("form");
  }

  // ── B2B identity confirm ───────────────────────────────────────────
  function confirmManualId() {
    if (manualId.prenom)           importFromDoc("prenom",           manualId.prenom,           "manuel");
    if (manualId.nom)              importFromDoc("nom",              manualId.nom,              "manuel");
    if (manualId.no_contribuable)  importFromDoc("no_contribuable",  manualId.no_contribuable,  "manuel");
    setShowIdFallback(false);
  }

  // ── Advisor screen ─────────────────────────────────────────────────
  if (showAdvisor && advisorData) {
    return <AdvisorScreen advisorData={advisorData} lang={lang}
             onComplete={() => { setShowAdvisor(false); setScreen("form"); }} />;
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  const ctaLabel = () => {
    if (analyzing)      return `⏳ Analyse ${progress.done}/${progress.total}… ${progress.label}`;
    if (advisorLoading) return "🧠 L'expert fiscal analyse votre dossier…";
    if (pendingCount > 0)
      return `▶ Analyser le dossier — ${pendingCount} photo${pendingCount>1?"s":""} en attente`;
    if (analyzedCount > 0)
      return `▶ Continuer (${ocrDoneCount} document${ocrDoneCount>1?"s":""} analysé${ocrDoneCount>1?"s":""})`;
    return L({ fr:"Continuer sans documents", de:"Ohne Dokumente weiter", en:"Continue without documents" });
  };

  return (
    <div style={{ minHeight:"100vh", background:S.bg, paddingBottom:140 }}>
      <GlobalStyles />
      <div style={{ position:"fixed", top:16, right:16, zIndex:100 }}><LangSelector /></div>

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div style={{ position:"sticky", top:0, zIndex:50, background:`linear-gradient(180deg,${S.bg} 85%,transparent)`, paddingBottom:8 }}>
        <div style={{ maxWidth:680, margin:"0 auto", padding:"16px 20px 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
            <button onClick={() => setScreen("welcome")}
              style={{ background:"none", border:`1px solid ${S.border}`, color:S.textDim, borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13, fontFamily:"'Outfit',sans-serif" }}>
              ←
            </button>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:21, color:S.cream, fontWeight:300 }}>
                {L({ fr:"Documents du dossier", de:"Dokumente", en:"Dossier documents" })}
              </div>
              <div style={{ fontSize:11, color:S.textDim, fontFamily:"'Outfit',sans-serif" }}>
                {pendingCount > 0 && <span style={{color:S.gold}}>📷 {pendingCount} en attente · </span>}
                {ocrDoneCount > 0 && <span style={{color:"#34D399"}}>✨ {ocrDoneCount} analysé{ocrDoneCount>1?"s":""}</span>}
                {pendingCount === 0 && ocrDoneCount === 0 && L({ fr:"Ajoutez vos documents", de:"Dokumente hinzufügen", en:"Add your documents" })}
              </div>
            </div>
          </div>
          {/* Barre de progression analyse */}
          {analyzing && (
            <div style={{ height:3, background:S.card, borderRadius:99, overflow:"hidden", marginBottom:4 }}>
              <div style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg,${S.gold},#D4B55A)`,
                width:`${Math.round((progress.done/Math.max(progress.total,1))*100)}%`, transition:"width 0.3s" }} />
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"0 20px" }}>

        {/* ── DROP ZONE GLOBALE ────────────────────────────────── */}
        <div
          onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
          style={{
            marginBottom:16, padding:"24px 20px", borderRadius:16,
            border:`2px dashed ${isDragging ? S.gold : S.border}`,
            background: isDragging ? `rgba(201,168,76,0.06)` : `rgba(201,168,76,0.02)`,
            textAlign:"center", transition:"all 0.2s",
          }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📂</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:S.cream, fontWeight:300, marginBottom:6 }}>
            {L({ fr:"Déposez tous vos documents ici", de:"Alle Dokumente hier ablegen", en:"Drop all documents here" })}
          </div>
          <div style={{ fontSize:12, color:S.textDim, fontFamily:"'Outfit',sans-serif", marginBottom:14 }}>
            {L({ fr:"Photos ou PDF — tAIx classe et analyse automatiquement",
                  de:"Fotos oder PDF — tAIx klassifiziert automatisch",
                  en:"Photos or PDF — tAIx classifies automatically" })}
          </div>
          {/* 3 boutons distincts pour éviter les conflits iOS */}
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
            {/* Bouton caméra — chaque tap ouvre la caméra, la photo s'ajoute et la caméra se REFERME */}
            <label style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"12px 18px",
              borderRadius:11, background:`linear-gradient(135deg,${S.gold},#D4B55A)`,
              color:S.bg, fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              📷 {L({ fr:"Photo", de:"Foto", en:"Photo" })}
              <input type="file" accept="image/*" capture="environment"
                style={{ display:"none" }} onChange={e => onFilePick(e)} />
            </label>
            {/* Galerie — sélection multiple iOS/Android sans forcer la caméra */}
            <label style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"12px 18px",
              borderRadius:11, background:S.card, border:`1px solid ${S.borderHi}`,
              color:S.cream, fontFamily:"'Outfit',sans-serif", fontSize:13, cursor:"pointer" }}>
              🖼 {L({ fr:"Galerie", de:"Galerie", en:"Gallery" })}
              <input type="file" accept="image/*" multiple
                style={{ display:"none" }} onChange={e => onFilePick(e)} />
            </label>
            {/* PDF / fichiers desktop */}
            <label style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"12px 18px",
              borderRadius:11, background:S.card, border:`1px solid ${S.border}`,
              color:S.textDim, fontFamily:"'Outfit',sans-serif", fontSize:13, cursor:"pointer" }}>
              📎 PDF
              <input type="file" accept="image/*,application/pdf" multiple
                style={{ display:"none" }} onChange={e => onFilePick(e)} />
            </label>
          </div>
        </div>

        {/* ── FILE EN ATTENTE — aperçu et suppression ──────────── */}
        {pendingCount > 0 && (
          <div style={{ marginBottom:16, padding:"14px 16px", borderRadius:12,
            background:`rgba(201,168,76,0.06)`, border:`1px solid rgba(201,168,76,0.25)` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ fontSize:13, fontWeight:700, color:S.gold, fontFamily:"'Outfit',sans-serif" }}>
                📷 {pendingCount} photo{pendingCount>1?"s":""} prête{pendingCount>1?"s":""} à analyser
              </div>
              <button onClick={() => setPending([])}
                style={{ fontSize:11, color:S.muted, background:"none", border:"none", cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
                Tout supprimer
              </button>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {pending.map((item, i) => (
                <div key={i} style={{ position:"relative", maxWidth:200 }}>
                  <div style={{ padding:"6px 10px", borderRadius:8, background:S.card,
                    border:`1px solid ${S.border}`, display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:14 }}>🖼</span>
                    <span style={{ fontSize:11, color:S.cream, fontFamily:"'Outfit',sans-serif",
                      maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {item.name.length > 18 ? item.name.substring(0,16)+"…" : item.name}
                    </span>
                    <button onClick={() => removePending(i)}
                      style={{ fontSize:12, color:S.muted, background:"none", border:"none", cursor:"pointer", padding:0, lineHeight:1 }}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Bouton pour ajouter d'autres photos dans la même session */}
            <div style={{ marginTop:10, display:"flex", gap:8, flexWrap:"wrap" }}>
              <label style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"8px 14px",
                borderRadius:9, background:S.surface, border:`1px solid rgba(201,168,76,0.3)`,
                color:S.gold, fontFamily:"'Outfit',sans-serif", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                + 📷 {L({ fr:"Ajouter une photo", de:"Foto hinzufügen", en:"Add photo" })}
                <input type="file" accept="image/*" capture="environment"
                  style={{ display:"none" }} onChange={e => onFilePick(e)} />
              </label>
              <label style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"8px 14px",
                borderRadius:9, background:S.surface, border:`1px solid ${S.border}`,
                color:S.textDim, fontFamily:"'Outfit',sans-serif", fontSize:12, cursor:"pointer" }}>
                + 🖼 {L({ fr:"Galerie", de:"Galerie", en:"Gallery" })}
                <input type="file" accept="image/*" multiple
                  style={{ display:"none" }} onChange={e => onFilePick(e)} />
              </label>
            </div>
          </div>
        )}

        {/* ── B2B IDENTITY FALLBACK ─────────────────────────────── */}
        {isB2B && showIdFallback && (
          <div style={{ marginBottom:16, padding:"16px 18px", borderRadius:12,
            background:`rgba(201,168,76,0.06)`, border:`1px solid rgba(201,168,76,0.3)` }}>
            <div style={{ fontSize:12, fontWeight:700, color:S.gold, fontFamily:"'Outfit',sans-serif", marginBottom:8 }}>
              🔍 {L({ fr:"Client non identifié — saisie manuelle", de:"Kunde nicht identifiziert — manuell", en:"Client not found — manual entry" })}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
              {[["prenom", L({fr:"Prénom",de:"Vorname",en:"First name"})],
                ["nom",    L({fr:"Nom",de:"Nachname",en:"Last name"})]].map(([k,ph]) => (
                <input key={k} value={manualId[k]} placeholder={ph}
                  onChange={e => setManualId(p=>({...p,[k]:e.target.value}))}
                  style={{ padding:"10px 12px", borderRadius:8, border:`1px solid ${S.border}`,
                    background:S.card, color:S.cream, fontSize:13, fontFamily:"'Outfit',sans-serif", outline:"none" }} />
              ))}
            </div>
            <input value={manualId.no_contribuable}
              placeholder={L({fr:"N° contribuable (facultatif)",de:"Steuernummer (optional)",en:"Tax ID (optional)"})}
              onChange={e => setManualId(p=>({...p,no_contribuable:e.target.value}))}
              style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1px solid ${S.border}`,
                background:S.card, color:S.cream, fontSize:13, fontFamily:"'Outfit',sans-serif",
                outline:"none", boxSizing:"border-box", marginBottom:8 }} />
            <button onClick={confirmManualId}
              disabled={!manualId.prenom || !manualId.nom}
              style={{ padding:"10px 20px", borderRadius:9,
                background: manualId.prenom && manualId.nom ? `linear-gradient(135deg,${S.gold},#D4B55A)` : S.card,
                color: manualId.prenom && manualId.nom ? S.bg : S.textDim,
                border:"none", fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:700,
                cursor: manualId.prenom && manualId.nom ? "pointer" : "default" }}>
              {L({fr:"Confirmer",de:"Bestätigen",en:"Confirm"})} →
            </button>
          </div>
        )}

        {/* ── CATALOGUE PAR CATÉGORIE — upload ciblé ──────────── */}
        {docs.map(cat => (
          <div key={cat.id} style={{ marginBottom:12 }}>
            <button
              onClick={() => setExpanded(e => ({...e, [cat.id]: !e[cat.id]}))}
              style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                background:S.card, border:`1px solid ${S.border}`, borderRadius:10,
                padding:"10px 16px", cursor:"pointer", marginBottom: expanded[cat.id] ? 8 : 0 }}>
              <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:700,
                color:S.cream, letterSpacing:"0.04em" }}>
                {L(cat.category)}
              </span>
              <span style={{ fontSize:11, color:S.textDim }}>
                {cat.docs.filter(d => analyzed[d.id]?.length > 0).length}/{cat.docs.length}
                {" "}{expanded[cat.id] ? "▲" : "▼"}
              </span>
            </button>

            {expanded[cat.id] && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(195px,1fr))", gap:8 }}>
                {cat.docs.map(doc => {
                  const status  = ocrStatus[doc.id];
                  const pages   = analyzed[doc.id]?.length || 0;
                  const hasPend = pending.some(p => p.docId === doc.id);
                  const isDone  = status === "done";
                  const isRunning = status === "running";

                  return (
                    <div key={doc.id} style={{
                      padding:"12px 13px", borderRadius:11,
                      background: isDone ? `rgba(52,211,153,0.05)` : hasPend ? `rgba(201,168,76,0.06)` : S.card,
                      border:`1px solid ${isDone ? "rgba(52,211,153,0.25)" : hasPend ? "rgba(201,168,76,0.25)" : S.border}`,
                      transition:"all 0.2s",
                    }}>
                      <div style={{ display:"flex", gap:7, alignItems:"flex-start", marginBottom:6 }}>
                        <span style={{ fontSize:17 }}>{doc.icon}</span>
                        <div>
                          <div style={{ fontSize:12, fontWeight:600, lineHeight:1.3,
                            color: isDone ? "#34D399" : doc.highlight ? S.gold : S.cream,
                            fontFamily:"'Outfit',sans-serif" }}>
                            {L(doc.label)}
                            {doc.highlight && !isDone && (
                              <span style={{ marginLeft:4, fontSize:9, background:"rgba(201,168,76,0.15)",
                                border:"1px solid rgba(201,168,76,0.3)", color:S.gold,
                                borderRadius:99, padding:"1px 6px", fontWeight:700 }}>★</span>
                            )}
                          </div>
                          {/* Status */}
                          {isRunning && <div style={{ fontSize:10, color:S.gold, fontFamily:"'Outfit',sans-serif" }}>⏳ Analyse…</div>}
                          {isDone    && <div style={{ fontSize:10, color:"#34D399", fontFamily:"'Outfit',sans-serif" }}>✨ {pages}p extraite{pages>1?"s":""}</div>}
                          {status==="error" && <div style={{ fontSize:10, color:"#F87171", fontFamily:"'Outfit',sans-serif" }}>⚠️ À vérifier</div>}
                          {hasPend && !isDone && <div style={{ fontSize:10, color:S.gold, fontFamily:"'Outfit',sans-serif" }}>📷 En attente</div>}
                        </div>
                      </div>
                      {/* Boutons upload ciblés — COLLECTE uniquement, zéro OCR */}
                      <div style={{ display:"flex", gap:6 }}>
                        <label style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center",
                          padding:"7px 0", borderRadius:8, background:S.surface,
                          border:`1px solid ${S.border}`, cursor:"pointer",
                          fontSize:11, color:S.gold, fontFamily:"'Outfit',sans-serif", fontWeight:600 }}>
                          📷
                          <input type="file" accept="image/*" capture="environment"
                            style={{ display:"none" }} onChange={e => onFilePick(e, doc.id)} />
                        </label>
                        <label style={{ flex:2, display:"flex", alignItems:"center", justifyContent:"center", gap:4,
                          padding:"7px 0", borderRadius:8, background:S.surface,
                          border:`1px solid ${S.border}`, cursor:"pointer",
                          fontSize:11, color:S.textDim, fontFamily:"'Outfit',sans-serif" }}>
                          📎 {L({fr:"Fichier",de:"Datei",en:"File"})}
                          <input type="file" accept="image/*,application/pdf" multiple
                            style={{ display:"none" }} onChange={e => onFilePick(e, doc.id)} />
                        </label>
                        {(pages > 0 || hasPend) && (
                          <button onClick={() => {
                            if (pages > 0) { setAnalyzed(a=>({...a,[doc.id]:[]})); setOcrStatus(s=>({...s,[doc.id]:null})); }
                            setPending(p => p.filter(x => x.docId !== doc.id));
                          }}
                            style={{ padding:"7px 9px", borderRadius:8, background:"none",
                              border:`1px solid ${S.border}`, color:S.muted, fontSize:11, cursor:"pointer" }}>
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

        <div style={{ height:100 }} />
      </div>

      {/* ── CTA FIXE EN BAS ──────────────────────────────────────── */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:100,
        background:`linear-gradient(transparent,${S.bg} 28%)`, padding:"20px 20px 30px" }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          <button
            onClick={analyzeAll}
            disabled={analyzing || advisorLoading}
            style={{
              width:"100%", padding:"18px 24px",
              background: (pendingCount > 0 || analyzedCount > 0) && !analyzing && !advisorLoading
                ? `linear-gradient(135deg,${S.gold},#D4B55A)` : S.card,
              color: (pendingCount > 0 || analyzedCount > 0) && !analyzing && !advisorLoading
                ? S.bg : S.textDim,
              border:"none", borderRadius:14,
              cursor: analyzing || advisorLoading ? "wait" : "pointer",
              fontFamily:"'Outfit',sans-serif", fontSize:15, fontWeight:700,
              boxShadow: pendingCount > 0 ? `0 8px 32px rgba(201,168,76,0.35)` : "none",
              transition:"all 0.3s",
            }}>
            {ctaLabel()}
          </button>
          {pendingCount === 0 && analyzedCount === 0 && (
            <button onClick={() => setScreen("form")}
              style={{ width:"100%", background:"none", border:"none", cursor:"pointer",
                color:S.textDim, fontSize:12, fontFamily:"'Outfit',sans-serif", marginTop:8, padding:4 }}>
              {L({fr:"Continuer sans documents (saisie manuelle)",de:"Ohne Dokumente weiter",en:"Continue without documents"})}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
