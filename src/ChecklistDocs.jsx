// ═══════════════════════════════════════════════════════════════════════
//  tAIx — ChecklistDocs.jsx v4
//  UX "Tout en vrac" : drop zone globale + identification automatique
//  Fallback identité inline si OCR ne trouve pas le client
//  Multi-photos optimisé mobile + tablet + desktop
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

// ── MAPPING EXTENSION/MIME → TYPE DE DOCUMENT ──────────────────────────
// Quand l'utilisateur dépose un fichier sans préciser son type,
// le nom du fichier et quelques heuristiques permettent de deviner.
function guessDocType(file) {
  const name = (file.name || "").toLowerCase();
  if (/di[_\s-]?202[0-9]|declaration|steuererklaerung/.test(name)) return "di_prev";
  if (/salaire|lohnausweis|sal[_\s-]?2025/.test(name)) return "cert_sal";
  if (/3a|pilier|saeule|previdenza/.test(name)) return "3a";
  if (/lpp|rachat|einkauf|pkasse/.test(name)) return "rachat_lpp";
  if (/compte|konto|relevé|auszug|extrait/.test(name)) return "comptes";
  if (/hypotheque|hypoth|zinsen/.test(name)) return "hypotheque";
  if (/immobilier|immeuble|liegen/.test(name)) return "immobilier";
  if (/medical|medizin|soin|arzt|facture/.test(name)) return "medicaux";
  if (/garde|kinder|creche|crèche/.test(name)) return "garde";
  if (/don|spende|donation/.test(name)) return "dons";
  if (/leasing|auto|vehicule/.test(name)) return "leasing";
  if (/entretien|unterhalt|reparation/.test(name)) return "entretien";
  return "default";
}

// ── LISTE DES TYPES DE DOCUMENTS ───────────────────────────────────────
const DOC_TYPES = (L) => ([
  { id:"di_prev",    icon:"📋", label: L({ fr:"Déclaration 2024 (N-1)", de:"Steuererklärung 2024", en:"2024 Tax Return" }), required:false, cat:"Identité" },
  { id:"permis",     icon:"🪪", label: L({ fr:"Carte d'identité / Permis", de:"Ausweis / Aufenthaltsbewilligung", en:"ID / Residence permit" }), required:false, cat:"Identité" },
  { id:"cert_sal",   icon:"📄", label: L({ fr:"Certificat de salaire 2025", de:"Lohnausweis 2025", en:"Salary certificate 2025" }), required:true,  cat:"Revenus" },
  { id:"avs",        icon:"🏛️", label: L({ fr:"Rente AVS/AI", de:"AHV/IV-Rente", en:"AVS/AI pension" }), required:false, cat:"Revenus" },
  { id:"lpp_att",    icon:"🏦", label: L({ fr:"Rente LPP / caisse pension", de:"BVG-Rente / PK", en:"LPP pension fund" }), required:false, cat:"Revenus" },
  { id:"independant",icon:"🏢", label: L({ fr:"Bilan indépendant", de:"Bilanz Selbständige", en:"Self-employed P&L" }), required:false, cat:"Revenus" },
  { id:"dividendes", icon:"📈", label: L({ fr:"Titres / dividendes", de:"Wertschriften / Dividenden", en:"Securities / dividends" }), required:false, cat:"Revenus" },
  { id:"chomage",    icon:"📑", label: L({ fr:"Indemnités chômage", de:"Arbeitslosengeld", en:"Unemployment benefit" }), required:false, cat:"Revenus" },
  { id:"3a",         icon:"🏦", label: L({ fr:"Pilier 3a 2025", de:"Säule 3a 2025", en:"Pillar 3a 2025" }), required:false, cat:"Déductions", highlight:true },
  { id:"rachat_lpp", icon:"💼", label: L({ fr:"Rachat LPP", de:"PK-Einkauf", en:"LPP buy-in" }), required:false, cat:"Déductions", highlight:true },
  { id:"medicaux",   icon:"🏥", label: L({ fr:"Frais médicaux", de:"Krankheitskosten", en:"Medical expenses" }), required:false, cat:"Déductions" },
  { id:"garde",      icon:"👶", label: L({ fr:"Frais de garde", de:"Kinderbetreuung", en:"Childcare" }), required:false, cat:"Déductions" },
  { id:"dons",       icon:"🤝", label: L({ fr:"Dons associations", de:"Spendenbelege", en:"Donation receipts" }), required:false, cat:"Déductions" },
  { id:"comptes",    icon:"🏧", label: L({ fr:"Extraits bancaires 31.12", de:"Kontoauszüge 31.12", en:"Bank statements 31.12" }), required:true,  cat:"Fortune" },
  { id:"hypotheque", icon:"🏠", label: L({ fr:"Intérêts hypothécaires", de:"Hypothekarzinsen", en:"Mortgage interest" }), required:false, cat:"Fortune", highlight:true },
  { id:"immobilier", icon:"🏡", label: L({ fr:"Valeur fiscale immeuble", de:"Steuerwert Liegenschaft", en:"Property fiscal value" }), required:false, cat:"Fortune" },
  { id:"entretien",  icon:"🔧", label: L({ fr:"Travaux d'entretien", de:"Unterhaltsarbeiten", en:"Maintenance works" }), required:false, cat:"Fortune" },
  { id:"leasing",    icon:"🚗", label: L({ fr:"Leasing / dettes", de:"Leasing / Schulden", en:"Leasing / debts" }), required:false, cat:"Fortune" },
  { id:"assurance_v",icon:"📋", label: L({ fr:"Assurance-vie (valeur rachat)", de:"Lebensversicherung", en:"Life insurance" }), required:false, cat:"Fortune" },
]);

// ── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────
export function ChecklistScreen() {
  const { setScreen, lang, cantonConfig, mode, b2bUser } = useStore();
  const t = useT(lang);
  const L = useCallback((obj) => obj?.[lang] || obj?.fr || "", [lang]);

  // État documents : { docId: File[] }
  const [uploads, setUploads] = useState({});
  // État OCR : { docId: 'loading_1_3' | 'done' | 'error' }
  const [ocrStatus, setOcrStatus] = useState({});
  // Résultats OCR fusionnés
  const [allOcrResults, setAllOcrResults] = useState({});
  // Identité extraite par OCR
  const [identiteOCR, setIdentiteOCR] = useState({});
  // Fallback identité manuelle (si OCR ne trouve pas)
  const [showIdentiteForm, setShowIdentiteForm] = useState(false);
  const [identiteManuelle, setIdentiteManuelle] = useState({ prenom:"", nom:"", no_contribuable:"" });
  // Zone de dépôt globale
  const [dragOver, setDragOver] = useState(false);
  const [globalAnalyzing, setGlobalAnalyzing] = useState(false);
  const [globalProgress, setGlobalProgress] = useState({ done:0, total:0, current:"" });
  // Advisor
  const [advisorData, setAdvisorData] = useState(null);
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [advisorLoading, setAdvisorLoading] = useState(false);
  // Vue
  const [view, setView] = useState("drop"); // "drop" | "detail"
  const globalInputRef = useRef(null);
  const { importFromDoc, setField } = useStore();

  const docs = DOC_TYPES(L);
  const totalUploaded = Object.values(uploads).reduce((s, arr) => s + (arr?.length || 0), 0);
  const totalOcrDone  = Object.values(ocrStatus).filter(s => s === "done").length;
  const identiteConnue = identiteOCR.nom || identiteManuelle.nom;

  // ── Merge OCR results ──────────────────────────────────────────────
  function mergeOcrResults(base, next) {
    const merged = { ...base };
    const ADDITIVE = new Set(["solde_bancaire","solde_31dec","frais_medicaux","dons","frais_garde","montant_ttc"]);
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "" || v === 0 || k.startsWith("_")) continue;
      if (ADDITIVE.has(k) && typeof v === "number" && typeof merged[k] === "number") {
        merged[k] = (merged[k] || 0) + v;
      } else if (!merged[k]) {
        merged[k] = v;
      }
    }
    return merged;
  }

  // ── OCR d'un ou plusieurs fichiers pour un docType ─────────────────
  async function processFiles(files, docType) {
    if (!files.length) return;
    setOcrStatus(s => ({ ...s, [docType]: `loading_0_${files.length}` }));

    let merged = {};
    for (let i = 0; i < files.length; i++) {
      setOcrStatus(s => ({ ...s, [docType]: `loading_${i+1}_${files.length}` }));
      try {
        const result = await ocrDocument(files[i], docType);
        if (!result._error) {
          merged = mergeOcrResults(merged, result);
        }
      } catch(e) { /* continue */ }
    }

    if (Object.keys(merged).length > 0) {
      applyOCRToStore(merged, importFromDoc, null, SOURCE);
      setOcrStatus(s => ({ ...s, [docType]: "done" }));
      setAllOcrResults(r => {
        const updated = { ...r, [docType]: merged };
        return updated;
      });
      // Détecter identité
      if (docType === "di_prev" || docType === "permis") {
        if (merged.nom || merged.prenom || merged.no_contribuable) {
          setIdentiteOCR(prev => ({ ...prev, ...merged }));
        }
      }
    } else {
      setOcrStatus(s => ({ ...s, [docType]: "error" }));
    }
  }

  // ── Upload depuis le sélecteur par type ────────────────────────────
  async function handleUpload(docType, e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploads(u => {
      const prev = Array.isArray(u[docType]) ? u[docType] : [];
      return { ...u, [docType]: [...prev, ...files] };
    });
    await processFiles(files, docType);
    e.target.value = "";
  }

  // ── DROP ZONE GLOBALE — analyse automatique ────────────────────────
  const handleGlobalDrop = useCallback(async (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer?.files || e.target?.files || []);
    if (!files.length) return;
    await analyzeFiles(files);
  }, []);

  async function analyzeFiles(files) {
    setGlobalAnalyzing(true);
    setGlobalProgress({ done:0, total:files.length, current:"" });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const docType = guessDocType(file);
      setGlobalProgress({ done:i, total:files.length, current: file.name });

      setUploads(u => {
        const prev = Array.isArray(u[docType]) ? u[docType] : [];
        return { ...u, [docType]: [...prev, file] };
      });
      setOcrStatus(s => ({ ...s, [docType]: `loading_${i+1}_${files.length}` }));

      try {
        const result = await ocrDocument(file, docType);
        if (!result._error) {
          applyOCRToStore(result, importFromDoc, null, SOURCE);
          setAllOcrResults(r => ({ ...r, [docType]: mergeOcrResults(r[docType] || {}, result) }));
          setOcrStatus(s => ({ ...s, [docType]: "done" }));
          if ((docType === "di_prev" || docType === "permis") && (result.nom || result.prenom)) {
            setIdentiteOCR(prev => ({ ...prev, ...result }));
          }
        } else {
          setOcrStatus(s => ({ ...s, [docType]: "error" }));
        }
      } catch {
        setOcrStatus(s => ({ ...s, [docType]: "error" }));
      }
      setGlobalProgress({ done:i+1, total:files.length, current: file.name });
    }

    setGlobalAnalyzing(false);
    setView("detail");

    // Si aucune identité trouvée → proposer la saisie
    setTimeout(() => {
      const stored = useStore.getState().getAll();
      if (!stored.nom && !stored.prenom) {
        setShowIdentiteForm(true);
      }
    }, 500);
  }

  // ── Confirmer identité manuelle ────────────────────────────────────
  function confirmerIdentiteManuelle() {
    if (identiteManuelle.prenom) importFromDoc("prenom", identiteManuelle.prenom, "saisie_manuelle");
    if (identiteManuelle.nom) importFromDoc("nom", identiteManuelle.nom, "saisie_manuelle");
    if (identiteManuelle.no_contribuable) importFromDoc("no_contribuable", identiteManuelle.no_contribuable, "saisie_manuelle");
    setShowIdentiteForm(false);
  }

  // ── Lancer le conseiller fiscal ────────────────────────────────────
  async function lancerConseiller() {
    if (Object.keys(allOcrResults).length === 0) {
      setScreen("form");
      return;
    }
    setAdvisorLoading(true);
    try {
      const storeSnap = useStore.getState();
      const allData = storeSnap.getAll ? storeSnap.getAll() : {};
      const advice = await genererQuestionsIA(allOcrResults, allData, lang);
      setAdvisorData(advice);
      if (advice?.questions?.length > 0) {
        setAdvisorLoading(false);
        setShowAdvisor(true);
        return;
      }
    } catch(e) { console.warn("Advisor:", e); }
    setAdvisorLoading(false);
    setScreen("form");
  }

  // ── Si AdvisorScreen est actif ─────────────────────────────────────
  if (showAdvisor && advisorData) {
    return (
      <AdvisorScreen
        advisorData={advisorData}
        onComplete={() => setScreen("form")}
        onBack={() => setShowAdvisor(false)}
        lang={lang}
      />
    );
  }

  // ── OcrStatus label ────────────────────────────────────────────────
  const ocrLabel = (docId) => {
    const s = ocrStatus[docId];
    if (!s) return null;
    if (s.startsWith("loading")) {
      const [,done,total] = s.split("_");
      return { text: total > 1 ? `⏳ ${done}/${total}…` : "⏳ Analyse…", color: S.gold };
    }
    if (s === "done") return { text: "✨ Extrait", color: "#34D399" };
    if (s === "error") return { text: "⚠️ À vérifier", color: "#F87171" };
    return null;
  };

  const cats = [...new Set(docs.map(d => d.cat))];
  const uploadedIds = Object.keys(uploads).filter(k => uploads[k]?.length > 0);

  // ────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────
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
              ←
            </button>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:S.cream, fontWeight:300 }}>
                {L({ fr:"Documents du dossier", de:"Dokumente", en:"Dossier documents" })}
              </div>
              {mode === "b2b" && b2bUser && (
                <div style={{ fontSize:11, color:S.gold, fontFamily:"'Outfit',sans-serif" }}>
                  💼 {b2bUser.firm} {identiteConnue ? `— ${identiteOCR.prenom || identiteManuelle.prenom} ${identiteOCR.nom || identiteManuelle.nom}` : "— Nouveau client"}
                </div>
              )}
            </div>
            {totalUploaded > 0 && (
              <div style={{ fontSize:12, color:S.green, fontFamily:"'Outfit',sans-serif", fontWeight:600 }}>
                {totalUploaded} fichier{totalUploaded > 1 ? "s" : ""} · {totalOcrDone} analysé{totalOcrDone > 1 ? "s" : ""}
              </div>
            )}
          </div>
          {/* Barre de progression globale */}
          {totalUploaded > 0 && (
            <div style={{ background:S.card, borderRadius:99, height:4, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${Math.round((totalOcrDone / Math.max(uploadedIds.length, 1)) * 100)}%`, background:`linear-gradient(90deg,${S.gold},#D4B55A)`, borderRadius:99, transition:"width 0.4s ease" }} />
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"8px 20px" }}>

        {/* ══════════════════════════════════════════════════════════
            ZONE DE DÉPÔT GLOBALE
        ═══════════════════════════════════════════════════════════ */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleGlobalDrop}
          onClick={() => !globalAnalyzing && globalInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? S.gold : S.borderHi}`,
            borderRadius: 18,
            padding: "28px 20px",
            textAlign: "center",
            cursor: globalAnalyzing ? "wait" : "pointer",
            background: dragOver ? `rgba(201,168,76,0.06)` : S.surface,
            transition: "all 0.25s",
            marginBottom: 16,
            position: "relative",
          }}>
          <input
            ref={globalInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            capture={undefined}
            style={{ display:"none" }}
            onChange={e => analyzeFiles(Array.from(e.target.files || []))}
          />

          {globalAnalyzing ? (
            <>
              <div style={{ fontSize:32, marginBottom:10 }}>⏳</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:S.cream, marginBottom:6 }}>
                {L({ fr:"Analyse en cours…", de:"Wird analysiert…", en:"Analysing…" })}
              </div>
              <div style={{ fontSize:13, color:S.gold, fontFamily:"'Outfit',sans-serif", marginBottom:8 }}>
                {globalProgress.done}/{globalProgress.total} — {globalProgress.current?.substring(0,35)}
              </div>
              <div style={{ height:6, background:S.card, borderRadius:99, overflow:"hidden", maxWidth:300, margin:"0 auto" }}>
                <div style={{ height:"100%", width:`${Math.round((globalProgress.done/Math.max(globalProgress.total,1))*100)}%`, background:`linear-gradient(90deg,${S.gold},#D4B55A)`, borderRadius:99, transition:"width 0.3s ease" }} />
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize:40, marginBottom:12 }}>📂</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, color:S.cream, fontWeight:300, marginBottom:6 }}>
                {L({ fr:"Déposez tous les documents ici", de:"Alle Dokumente hier ablegen", en:"Drop all documents here" })}
              </div>
              <div style={{ fontSize:13, color:S.textDim, fontFamily:"'Outfit',sans-serif", lineHeight:1.5, marginBottom:16 }}>
                {L({ fr:"Photos, PDF, plusieurs fichiers à la fois — tAIx identifie et analyse chaque document automatiquement",
                      de:"Fotos, PDFs, mehrere Dateien auf einmal — tAIx erkennt und analysiert jedes Dokument automatisch",
                      en:"Photos, PDFs, multiple files at once — tAIx identifies and analyses each document automatically" })}
              </div>
              {/* Boutons selon appareil */}
              <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                {/* Mobile : appareil photo direct */}
                <label style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 22px", borderRadius:12, background:`linear-gradient(135deg,${S.gold},#D4B55A)`, color:S.bg, fontFamily:"'Outfit',sans-serif", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                  📷 {L({ fr:"Photographier", de:"Fotografieren", en:"Take photos" })}
                  <input type="file" accept="image/*" capture="environment" multiple style={{ display:"none" }}
                    onChange={e => analyzeFiles(Array.from(e.target.files || []))} />
                </label>
                {/* Desktop : sélecteur de fichiers */}
                <label style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 22px", borderRadius:12, background:S.card, border:`1px solid ${S.border}`, color:S.cream, fontFamily:"'Outfit',sans-serif", fontSize:14, cursor:"pointer" }}>
                  📎 {L({ fr:"Sélectionner fichiers", de:"Dateien wählen", en:"Select files" })}
                  <input type="file" accept="image/*,application/pdf" multiple style={{ display:"none" }}
                    onChange={e => analyzeFiles(Array.from(e.target.files || []))} />
                </label>
                {/* Galerie : sélection multiple sans capture */}
                <label style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 22px", borderRadius:12, background:S.card, border:`1px solid ${S.border}`, color:S.textDim, fontFamily:"'Outfit',sans-serif", fontSize:14, cursor:"pointer" }}>
                  🖼 {L({ fr:"Galerie photo", de:"Fotogalerie", en:"Photo gallery" })}
                  <input type="file" accept="image/*" multiple style={{ display:"none" }}
                    onChange={e => analyzeFiles(Array.from(e.target.files || []))} />
                </label>
              </div>
              {dragOver && (
                <div style={{ position:"absolute", inset:0, borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", background:`rgba(201,168,76,0.12)`, border:`2px solid ${S.gold}` }}>
                  <div style={{ fontSize:18, color:S.gold, fontFamily:"'Outfit',sans-serif", fontWeight:700 }}>
                    📂 {L({ fr:"Déposez ici", de:"Hier ablegen", en:"Drop here" })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════
            FALLBACK IDENTITÉ — si OCR n'a pas trouvé le client
        ═══════════════════════════════════════════════════════════ */}
        {showIdentiteForm && (
          <div style={{ padding:"20px", borderRadius:14, background:`rgba(201,168,76,0.06)`, border:`1px solid rgba(201,168,76,0.3)`, marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:S.gold, fontFamily:"'Outfit',sans-serif" }}>
                  👤 {L({ fr:"Identité du client non trouvée dans les documents", de:"Kundenidentität nicht in Dokumenten gefunden", en:"Client identity not found in documents" })}
                </div>
                <div style={{ fontSize:11, color:S.textDim, fontFamily:"'Outfit',sans-serif", marginTop:2 }}>
                  {L({ fr:"Renseignez les informations manuellement ou uploadez la DI 2024 / carte d'identité",
                        de:"Geben Sie die Daten manuell ein oder laden Sie die Steuererklärung / den Ausweis hoch",
                        en:"Enter details manually or upload the 2024 tax return / ID card" })}
                </div>
              </div>
              <button onClick={() => setShowIdentiteForm(false)}
                style={{ background:"none", border:"none", color:S.muted, cursor:"pointer", fontSize:18 }}>✕</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
              {[
                { key:"prenom", placeholder: L({ fr:"Prénom", de:"Vorname", en:"First name" }) },
                { key:"nom",    placeholder: L({ fr:"Nom de famille", de:"Nachname", en:"Last name" }) },
              ].map(f => (
                <input key={f.key} value={identiteManuelle[f.key]} onChange={e => setIdentiteManuelle(p => ({...p,[f.key]:e.target.value}))}
                  placeholder={f.placeholder}
                  style={{ padding:"12px 14px", borderRadius:10, border:`1px solid ${S.border}`, background:S.card, color:S.cream, fontSize:14, fontFamily:"'Outfit',sans-serif", outline:"none", boxSizing:"border-box" }}
                  onFocus={e=>e.target.style.borderColor=S.gold} onBlur={e=>e.target.style.borderColor=S.border}
                />
              ))}
            </div>
            <input value={identiteManuelle.no_contribuable} onChange={e => setIdentiteManuelle(p => ({...p,no_contribuable:e.target.value}))}
              placeholder={L({ fr:"N° contribuable (facultatif)", de:"Steuernummer (optional)", en:"Tax ID (optional)" })}
              style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:`1px solid ${S.border}`, background:S.card, color:S.cream, fontSize:14, fontFamily:"'Outfit',sans-serif", outline:"none", boxSizing:"border-box", marginBottom:10 }}
              onFocus={e=>e.target.style.borderColor=S.gold} onBlur={e=>e.target.style.borderColor=S.border}
            />
            <button onClick={confirmerIdentiteManuelle}
              disabled={!identiteManuelle.prenom || !identiteManuelle.nom}
              style={{ padding:"12px 24px", borderRadius:10, background: identiteManuelle.prenom && identiteManuelle.nom ? `linear-gradient(135deg,${S.gold},#D4B55A)` : S.card, color: identiteManuelle.prenom && identiteManuelle.nom ? S.bg : S.textDim, fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:700, border:"none", cursor: identiteManuelle.prenom && identiteManuelle.nom ? "pointer" : "default" }}>
              {L({ fr:"Confirmer", de:"Bestätigen", en:"Confirm" })} →
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            RÉSUMÉ OCR — ce qui a été extrait
        ═══════════════════════════════════════════════════════════ */}
        {(identiteOCR.nom || totalOcrDone > 0) && (
          <div style={{ padding:"14px 16px", borderRadius:12, background:S.greenDim, border:`1px solid rgba(52,211,153,0.25)`, marginBottom:16, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            {(identiteOCR.nom || identiteManuelle.nom) && (
              <span style={{ fontSize:13, color:S.green, fontFamily:"'Outfit',sans-serif", fontWeight:600 }}>
                👤 {identiteOCR.prenom || identiteManuelle.prenom} {identiteOCR.nom || identiteManuelle.nom}
                {(identiteOCR.no_contribuable || identiteManuelle.no_contribuable) && ` · N° ${identiteOCR.no_contribuable || identiteManuelle.no_contribuable}`}
              </span>
            )}
            {totalOcrDone > 0 && (
              <span style={{ fontSize:12, color:S.textDim, fontFamily:"'Outfit',sans-serif" }}>
                ✨ {totalOcrDone} document{totalOcrDone > 1 ? "s" : ""} analysé{totalOcrDone > 1 ? "s" : ""}
              </span>
            )}
            {!identiteConnue && totalUploaded > 0 && !showIdentiteForm && (
              <button onClick={() => setShowIdentiteForm(true)}
                style={{ fontSize:11, color:S.gold, background:"none", border:`1px solid rgba(201,168,76,0.4)`, borderRadius:6, padding:"3px 10px", cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
                + {L({ fr:"Saisir identité", de:"Identität eingeben", en:"Enter identity" })}
              </button>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            VUE DÉTAIL PAR CATÉGORIE — ajout ciblé par type
        ═══════════════════════════════════════════════════════════ */}
        {(view === "detail" || totalUploaded > 0) && (
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ fontSize:12, color:S.textDim, fontFamily:"'Outfit',sans-serif", fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase" }}>
                {L({ fr:"Ajouter par type de document", de:"Nach Dokumenttyp hinzufügen", en:"Add by document type" })}
              </div>
              <button onClick={() => setView(view === "detail" ? "drop" : "detail")}
                style={{ fontSize:11, color:S.gold, background:"none", border:`1px solid rgba(201,168,76,0.3)`, borderRadius:6, padding:"4px 10px", cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
                {view === "detail" ? "▲" : "▼"}
              </button>
            </div>

            {cats.map(cat => (
              <div key={cat} style={{ marginBottom:12 }}>
                <div style={{ fontSize:11, color:S.muted, fontFamily:"'Outfit',sans-serif", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6, paddingLeft:4 }}>
                  {cat}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:8 }}>
                  {docs.filter(d => d.cat === cat).map(doc => {
                    const hasUpload = uploads[doc.id]?.length > 0;
                    const status = ocrLabel(doc.id);
                    const pageCount = uploads[doc.id]?.length || 0;

                    return (
                      <div key={doc.id}
                        style={{
                          padding:"12px 14px",
                          borderRadius:12,
                          background: hasUpload ? `rgba(52,211,153,0.05)` : doc.highlight ? `rgba(201,168,76,0.04)` : S.card,
                          border: `1px solid ${hasUpload ? "rgba(52,211,153,0.25)" : doc.highlight ? "rgba(201,168,76,0.2)" : S.border}`,
                          transition:"all 0.2s",
                        }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                          <span style={{ fontSize:18 }}>{doc.icon}</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:12, fontWeight:600, color: hasUpload ? S.green : doc.highlight ? S.gold : S.cream, fontFamily:"'Outfit',sans-serif", lineHeight:1.3 }}>
                              {doc.label}
                            </div>
                            {status && (
                              <div style={{ fontSize:10, color:status.color, fontFamily:"'Outfit',sans-serif", fontWeight:600 }}>
                                {status.text}
                              </div>
                            )}
                            {hasUpload && !status && (
                              <div style={{ fontSize:10, color:S.green, fontFamily:"'Outfit',sans-serif" }}>
                                ✓ {pageCount} page{pageCount > 1 ? "s" : ""}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Boutons upload compacts */}
                        <div style={{ display:"flex", gap:6 }}>
                          <label style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:4, padding:"7px 0", borderRadius:8, background:S.surface, border:`1px solid ${S.border}`, cursor:"pointer", fontSize:11, color:S.gold, fontFamily:"'Outfit',sans-serif", fontWeight:600 }}>
                            📷
                            <input type="file" accept="image/*" capture="environment" multiple style={{ display:"none" }}
                              onChange={e => handleUpload(doc.id, e)} />
                          </label>
                          <label style={{ flex:2, display:"flex", alignItems:"center", justifyContent:"center", gap:4, padding:"7px 0", borderRadius:8, background:S.surface, border:`1px solid ${S.border}`, cursor:"pointer", fontSize:11, color:S.textDim, fontFamily:"'Outfit',sans-serif" }}>
                            📎 {L({ fr:"Fichier(s)", de:"Datei(en)", en:"File(s)" })}
                            <input type="file" accept="image/*,application/pdf" multiple style={{ display:"none" }}
                              onChange={e => handleUpload(doc.id, e)} />
                          </label>
                          {hasUpload && (
                            <button onClick={() => { setUploads(u=>({...u,[doc.id]:[]})); setOcrStatus(s=>({...s,[doc.id]:null})); }}
                              style={{ padding:"7px 10px", borderRadius:8, background:"none", border:`1px solid ${S.border}`, color:S.muted, fontSize:11, cursor:"pointer" }}>
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Spacer pour le CTA fixe */}
        <div style={{ height:80 }} />
      </div>

      {/* ══════════════════════════════════════════════════════════
          CTA FIXE EN BAS
      ═══════════════════════════════════════════════════════════ */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:100, background:`linear-gradient(transparent,${S.bg} 30%)`, padding:"20px 20px 28px" }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          <button
            onClick={lancerConseiller}
            disabled={advisorLoading || (totalUploaded === 0 && !identiteConnue)}
            style={{
              width:"100%", padding:"18px 24px",
              background: totalUploaded > 0
                ? `linear-gradient(135deg,${S.gold},#D4B55A)`
                : S.card,
              color: totalUploaded > 0 ? S.bg : S.textDim,
              border: "none", borderRadius:14, cursor: totalUploaded > 0 ? "pointer" : "default",
              fontFamily:"'Outfit',sans-serif", fontSize:16, fontWeight:700,
              boxShadow: totalUploaded > 0 ? `0 8px 32px rgba(201,168,76,0.3)` : "none",
              transition:"all 0.3s",
            }}>
            {advisorLoading
              ? `⏳ ${L({ fr:"Le conseiller analyse…", de:"Berater analysiert…", en:"Advisor analysing…" })}`
              : totalUploaded > 0
                ? `🧠 ${L({ fr:"Analyser le dossier →", de:"Dossier analysieren →", en:"Analyse dossier →" })} (${totalUploaded} fichier${totalUploaded > 1 ? "s" : ""})`
                : L({ fr:"Déposez vos documents pour commencer", de:"Dokumente hochladen zum Starten", en:"Upload documents to start" })
            }
          </button>
          {totalUploaded === 0 && (
            <button onClick={() => setScreen("form")}
              style={{ width:"100%", background:"none", border:"none", cursor:"pointer", color:S.textDim, fontSize:12, fontFamily:"'Outfit',sans-serif", marginTop:8, padding:4 }}>
              {L({ fr:"Continuer sans document (saisie manuelle)", de:"Ohne Dokument weiter (manuelle Eingabe)", en:"Continue without documents (manual entry)" })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
