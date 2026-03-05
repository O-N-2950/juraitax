// ═══════════════════════════════════════════════════════════════════════
//  tAIx — AdvisorScreen.jsx v2
//  Expert fiscal Taxy — dialogue interactif, documents manquants, optimisations
//  Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════════════
import { useState } from "react";
import { repondreQuestion } from "./FiscalExpert";

// ── Message Taxy ──────────────────────────────────────────────────────
function MessageTaxy({ message }) {
  if (!message) return null;
  return (
    <div style={{ padding:"18px 20px", borderRadius:14, marginBottom:16,
                  background:"linear-gradient(135deg,rgba(37,99,235,0.15),rgba(13,27,42,0.9))",
                  border:"1px solid rgba(37,99,235,0.35)" }}>
      <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
        <div style={{ fontSize:28, lineHeight:1 }}>🧑‍💼</div>
        <div>
          <div style={{ fontSize:11, color:"#60A5FA", fontFamily:"'Outfit',sans-serif",
                        fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>
            Taxy — Expert fiscal tAIx
          </div>
          <div style={{ fontSize:15, color:"#E8EDF2", fontFamily:"'Cormorant Garamond',serif",
                        fontWeight:400, lineHeight:1.6, whiteSpace:"pre-line" }}>
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Ajustements automatiques ──────────────────────────────────────────
function AjustementsAuto({ ajustements }) {
  if (!ajustements || ajustements.length === 0) return null;
  return (
    <div style={{ padding:"16px", borderRadius:12, marginBottom:16,
                  background:"rgba(52,211,153,0.06)", border:"1px solid rgba(52,211,153,0.25)" }}>
      <div style={{ fontSize:11, color:"#34D399", fontFamily:"'Outfit',sans-serif",
                    fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>
        ✅ Optimisations appliquées automatiquement
      </div>
      {ajustements.map((aj, i) => (
        <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
                               padding:"8px 0", borderBottom: i < ajustements.length-1 ? "1px solid rgba(52,211,153,0.1)" : "none" }}>
          <div style={{ flex:1, paddingRight:12 }}>
            <div style={{ fontSize:13, color:"#E8EDF2", fontFamily:"'Outfit',sans-serif" }}>{aj.description}</div>
            <div style={{ fontSize:11, color:"#5A7A99", fontFamily:"'Outfit',sans-serif", marginTop:2 }}>{aj.note}</div>
          </div>
          <div style={{ textAlign:"right", minWidth:100 }}>
            {aj.avant > 0 && (
              <div style={{ fontSize:10, color:"#5A7A99", textDecoration:"line-through" }}>
                CHF {Number(aj.avant).toLocaleString("fr-CH")}
              </div>
            )}
            <div style={{ fontSize:13, color:"#34D399", fontWeight:700 }}>
              CHF {Number(aj.apres).toLocaleString("fr-CH")}
            </div>
            {aj.impact && <div style={{ fontSize:10, color:"#C9A84C", marginTop:2 }}>{aj.impact}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Document manquant bloquant ────────────────────────────────────────
function DocumentManquant({ doc }) {
  return (
    <div style={{ padding:"16px", borderRadius:12, marginBottom:10,
                  background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.35)" }}>
      <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
        <span style={{ fontSize:20 }}>🔴</span>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"#F87171",
                        fontFamily:"'Outfit',sans-serif", marginBottom:4 }}>
            Document obligatoire : {doc.document}
          </div>
          {doc.instruction_precise && (
            <div style={{ fontSize:12, color:"#8B95A7", fontFamily:"'Outfit',sans-serif",
                          lineHeight:1.6, marginBottom:6 }}>
              {doc.instruction_precise}
            </div>
          )}
          <div style={{ fontSize:11, color:"#F87171", fontStyle:"italic" }}>
            ⛔ Calcul impossible sans ce document
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Alerte ────────────────────────────────────────────────────────────
function Alerte({ alerte }) {
  const styles = {
    error:   { bg:"rgba(248,113,113,0.08)", border:"rgba(248,113,113,0.3)",  text:"#F87171", icon:"🔴" },
    warning: { bg:"rgba(251,191,36,0.08)",  border:"rgba(251,191,36,0.3)",   text:"#FBBF24", icon:"⚠️" },
    info:    { bg:"rgba(96,165,250,0.08)",  border:"rgba(96,165,250,0.3)",   text:"#60A5FA", icon:"ℹ️" },
  };
  const s = styles[alerte.severite] || styles.info;
  return (
    <div style={{ padding:"14px 16px", borderRadius:12, marginBottom:10,
                  background:s.bg, border:`1px solid ${s.border}` }}>
      <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
        <span style={{ fontSize:16 }}>{s.icon}</span>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:s.text,
                        fontFamily:"'Outfit',sans-serif", marginBottom:4 }}>{alerte.titre}</div>
          <div style={{ fontSize:12, color:"#8B95A7", fontFamily:"'Outfit',sans-serif", lineHeight:1.5 }}>
            {alerte.message}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Question ──────────────────────────────────────────────────────────
function Question({ q, onAnswer, lang }) {
  const [val, setVal]         = useState("");
  const [answered, setAnswered] = useState(false);
  const [showAmt, setShowAmt] = useState(false);
  const [amtVal, setAmtVal]   = useState("");

  const t = {
    fr: { oui:"Oui", non:"Non", confirm:"Confirmer →", skip:"Passer", chf:"CHF" },
    de: { oui:"Ja",  non:"Nein", confirm:"Bestätigen →", skip:"Überspringen", chf:"CHF" },
    it: { oui:"Sì",  non:"No",  confirm:"Confermare →", skip:"Saltare", chf:"CHF" },
    en: { oui:"Yes", non:"No",  confirm:"Confirm →",    skip:"Skip",   chf:"CHF" },
    pt: { oui:"Sim", non:"Não", confirm:"Confirmar →",  skip:"Passar", chf:"CHF" },
    es: { oui:"Sí",  non:"No",  confirm:"Confirmar →",  skip:"Omitir", chf:"CHF" },
  }[lang] || { oui:"Oui", non:"Non", confirm:"Confirmer →", skip:"Passer", chf:"CHF" };

  const S = {
    box: { padding:"18px", borderRadius:14, marginBottom:12, transition:"all 0.3s",
           background: answered ? "rgba(52,211,153,0.05)" : "rgba(13,27,42,0.8)",
           border: answered ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(42,58,88,0.8)" },
    q:   { fontFamily:"'Cormorant Garamond',serif", fontSize:17, color:"#E8EDF2", lineHeight:1.4, marginBottom:6 },
    exp: { fontSize:12, color:"#5A7A99", fontFamily:"'Outfit',sans-serif", lineHeight:1.5, marginBottom:12 },
    imp: { display:"inline-block", fontSize:11, color:"#C9A84C", fontWeight:700,
           background:"rgba(201,168,76,0.08)", border:"1px solid rgba(201,168,76,0.2)",
           padding:"3px 10px", borderRadius:99, marginBottom:12 },
    btn: { padding:"9px 18px", borderRadius:8, fontFamily:"'Outfit',sans-serif",
           fontSize:13, fontWeight:600, cursor:"pointer", border:"none", transition:"all 0.2s" },
    inp: { width:"100%", padding:"10px 14px", borderRadius:8, fontSize:14,
           fontFamily:"'Outfit',sans-serif", background:"rgba(255,255,255,0.06)",
           border:"1px solid rgba(42,58,88,0.8)", color:"#E8EDF2", outline:"none", marginBottom:10, boxSizing:"border-box" },
  };

  function submit(answer) {
    if (q.type === "oui_non" && answer === true && q.champ_store?.includes("verse")) {
      setShowAmt(true); return;
    }
    setAnswered(true);
    onAnswer(q, answer);
  }

  function submitAmt() {
    const n = parseFloat(amtVal.replace(/[' ]/g, ""));
    if (!isNaN(n) && n > 0) { setAnswered(true); onAnswer(q, n); }
  }

  if (answered) {
    return (
      <div style={S.box}>
        <div style={{ fontSize:12, color:"#34D399", fontFamily:"'Outfit',sans-serif", display:"flex", gap:6 }}>
          <span>✓</span><span>{q.question}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={S.box}>
      <div style={{ fontSize:10, color:"#5A7A99", fontFamily:"'Outfit',sans-serif",
                    marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>
        Taxy — Conseiller tAIx
      </div>
      <div style={S.q}>{q.question}</div>
      {q.explication && <div style={S.exp}>{q.explication}</div>}
      {q.impact_estime_chf && <div style={S.imp}>💰 {q.impact_estime_chf}</div>}

      {showAmt ? (
        <div>
          <input style={S.inp} type="number" placeholder={`Montant en ${t.chf}`}
                 value={amtVal} onChange={e => setAmtVal(e.target.value)}
                 onKeyDown={e => e.key === "Enter" && submitAmt()} autoFocus />
          <div style={{ display:"flex", gap:8 }}>
            <button style={{...S.btn, background:"#1A3A5C", color:"#60A5FA"}} onClick={submitAmt}>{t.confirm}</button>
            <button style={{...S.btn, background:"transparent", color:"#5A7A99", border:"1px solid #2A3A58"}}
                    onClick={() => { setAnswered(true); onAnswer(q, null); }}>{t.skip}</button>
          </div>
        </div>
      ) : q.type === "oui_non" ? (
        <div style={{ display:"flex", gap:10 }}>
          <button style={{...S.btn, background:"rgba(52,211,153,0.15)", color:"#34D399", border:"1px solid rgba(52,211,153,0.3)"}}
                  onClick={() => submit(true)}>✓ {t.oui}</button>
          <button style={{...S.btn, background:"rgba(248,113,113,0.10)", color:"#F87171", border:"1px solid rgba(248,113,113,0.25)"}}
                  onClick={() => submit(false)}>✗ {t.non}</button>
          <button style={{...S.btn, background:"transparent", color:"#5A7A99", border:"1px solid #2A3A58", marginLeft:"auto"}}
                  onClick={() => { setAnswered(true); onAnswer(q, null); }}>{t.skip}</button>
        </div>
      ) : q.type === "montant" || q.type === "nombre" ? (
        <div>
          <input style={S.inp} type="number" placeholder={`${t.chf}...`}
                 value={val} onChange={e => setVal(e.target.value)}
                 onKeyDown={e => e.key === "Enter" && submit(val)} />
          <div style={{ display:"flex", gap:8 }}>
            <button style={{...S.btn, background:"#1A3A5C", color:"#60A5FA"}} onClick={() => submit(val)}>{t.confirm}</button>
            <button style={{...S.btn, background:"transparent", color:"#5A7A99", border:"1px solid #2A3A58"}}
                    onClick={() => { setAnswered(true); onAnswer(q, null); }}>{t.skip}</button>
          </div>
        </div>
      ) : q.type === "choix" ? (
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {(q.options || []).map((opt, i) => (
            <button key={i}
                    style={{...S.btn, background: val===opt?"#1A3A5C":"transparent",
                            color: val===opt?"#60A5FA":"#8B95A7",
                            border:`1px solid ${val===opt?"#2A5A8C":"#2A3A58"}`}}
                    onClick={() => { setVal(opt); submit(opt); }}>
              {opt}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ── Écran principal ───────────────────────────────────────────────────
export function AdvisorScreen({ advisorData, lang = "fr", onComplete, setField, donneesClient }) {
  const [currentData, setCurrentData]   = useState(advisorData);
  const [conversation, setConversation] = useState([]);
  const [answered, setAnswered]         = useState({});
  const [loading, setLoading]           = useState(false);

  const questions       = currentData?.questions || [];
  const alertes         = currentData?.alertes   || [];
  const ajustementsAuto = currentData?.ajustements_auto || [];
  const docsBloquants   = (currentData?.documents_requis || []).filter(d => d.bloquant);
  const calcPossible    = currentData?.calcul_possible !== false && docsBloquants.length === 0;
  const totalQ          = questions.length;
  const answeredCount   = Object.keys(answered).length;

  const tLabel = {
    fr: { next:"Calculer ma déclaration →", nextBlock:"⛔ Document manquant — calcul impossible",
          title:"Taxy — Expert fiscal tAIx", loading:"Taxy analyse vos réponses…" },
    de: { next:"Steuererklärung berechnen →", nextBlock:"⛔ Fehlende Dokumente",
          title:"Taxy — tAIx Steuerexperte", loading:"Taxy analysiert…" },
    en: { next:"Calculate my tax return →", nextBlock:"⛔ Missing document",
          title:"Taxy — tAIx Tax Expert", loading:"Taxy is analysing…" },
  }[lang] || { next:"Calculer →", nextBlock:"⛔ Document manquant", title:"Taxy", loading:"…" };

  async function handleAnswer(question, reponse) {
    // Appliquer au store
    if (reponse !== null && reponse !== undefined && question.champ_store) {
      const n = parseFloat(String(reponse).replace(/[' ]/g, ""));
      setField(question.champ_store, isNaN(n) ? reponse : n);
    }

    setAnswered(prev => ({ ...prev, [question.id]: reponse }));

    // Relancer l'expert après chaque réponse pour dialogue continu
    if (reponse !== null && donneesClient) {
      setLoading(true);
      try {
        const suite = await repondreQuestion({
          question,
          reponse,
          donneesClient,
          histoireConversation: conversation,
          lang,
        });
        if (suite?.questions?.length > 0 || suite?.message_client) {
          const newConv = [...conversation, { role:"client", message:`${question.question} → ${reponse}` }];
          setConversation(newConv);
          setCurrentData(prev => ({
            ...prev,
            message_client: suite.message_client,
            questions: [...(prev.questions || []).filter(q => answered[q.id] !== undefined),
                        ...(suite.questions || [])],
            alertes: [...(prev.alertes || []), ...(suite.alertes || [])],
            calcul_possible: suite.calcul_possible,
          }));
        }
      } catch(e) { console.error(e); }
      setLoading(false);
    }
  }

  return (
    <div style={{ padding:"0 0 20px" }}>

      {/* Header */}
      <div style={{ padding:"18px 20px", borderRadius:14, marginBottom:14,
                    background:"linear-gradient(135deg,rgba(26,42,74,0.95),rgba(37,99,235,0.15))",
                    border:"1px solid rgba(37,99,235,0.3)" }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:"#E8EDF2",
                      fontWeight:400, marginBottom:4 }}>
          🧑‍💼 {tLabel.title}
        </div>
        <div style={{ fontSize:12, color:"#5A7A99", fontFamily:"'Outfit',sans-serif" }}>
          {currentData?.resume_profil || "Analyse de votre situation fiscale"}
        </div>
        {totalQ > 0 && (
          <div style={{ marginTop:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:11, color:"#5A7A99", fontFamily:"'Outfit',sans-serif" }}>
                {answeredCount}/{totalQ} questions
              </span>
              <span style={{ fontSize:11, color:"#34D399", fontFamily:"'Outfit',sans-serif" }}>
                {Math.round((answeredCount/totalQ)*100)}%
              </span>
            </div>
            <div style={{ height:3, borderRadius:99, background:"rgba(255,255,255,0.08)" }}>
              <div style={{ height:"100%", borderRadius:99,
                            width:`${Math.round((answeredCount/Math.max(totalQ,1))*100)}%`,
                            background:"linear-gradient(90deg,#2563EB,#34D399)", transition:"width 0.4s" }}/>
            </div>
          </div>
        )}
      </div>

      {/* Ajustements automatiques */}
      <AjustementsAuto ajustements={ajustementsAuto} />

      {/* Message Taxy */}
      <MessageTaxy message={currentData?.message_client} />

      {/* Documents manquants BLOQUANTS */}
      {docsBloquants.map(d => <DocumentManquant key={d.id} doc={d} />)}

      {/* Alertes */}
      {alertes.filter(a => a.severite !== "error").map((a, i) => <Alerte key={i} alerte={a} />)}

      {/* Questions */}
      {loading && (
        <div style={{ padding:"16px", textAlign:"center", color:"#60A5FA",
                      fontFamily:"'Outfit',sans-serif", fontSize:13 }}>
          ⏳ {tLabel.loading}
        </div>
      )}
      {questions.map(q => (
        <Question key={q.id} q={q} onAnswer={handleAnswer} lang={lang} />
      ))}

      {/* CTA */}
      <button
        onClick={calcPossible ? onComplete : undefined}
        style={{
          width:"100%", padding:"16px", marginTop:12, borderRadius:12, border:"none",
          cursor: calcPossible ? "pointer" : "not-allowed",
          background: calcPossible
            ? "linear-gradient(135deg,#1A2A4A,#2563EB)"
            : "rgba(42,58,88,0.5)",
          color: calcPossible ? "white" : "#5A7A99",
          fontSize:15, fontWeight:700, fontFamily:"'Outfit',sans-serif",
          boxShadow: calcPossible ? "0 4px 24px rgba(37,99,235,0.3)" : "none",
          transition:"all 0.2s",
        }}
      >
        {calcPossible ? tLabel.next : tLabel.nextBlock}
      </button>
    </div>
  );
}
