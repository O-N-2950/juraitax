// ═══════════════════════════════════════════════════════════════════════
//  tAIx — AdvisorScreen.jsx
//  Écran "Questions du conseiller IA"
//  Affiché après l'OCR, avant le calcul final
//  Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { appliquerReponseQuestion } from "./FiscalAdvisor";

// ── Composant question unique ─────────────────────────────────────────
function Question({ q, onAnswer, lang }) {
  const [val, setVal] = useState("");
  const [answered, setAnswered] = useState(false);
  const [showAmount, setShowAmount] = useState(false);
  const [amountVal, setAmountVal] = useState("");

  const T = {
    fr: { oui:"Oui",  non:"Non",  confirmer:"Confirmer →", skip:"Passer", chf:"CHF" },
    de: { oui:"Ja",   non:"Nein", confirmer:"Bestätigen →", skip:"Überspringen", chf:"CHF" },
    it: { oui:"Sì",   non:"No",   confirmer:"Confermare →", skip:"Saltare", chf:"CHF" },
    en: { oui:"Yes",  non:"No",   confirmer:"Confirm →",    skip:"Skip",  chf:"CHF" },
    pt: { oui:"Sim",  non:"Não",  confirmer:"Confirmar →",  skip:"Passar", chf:"CHF" },
    es: { oui:"Sí",   non:"No",   confirmer:"Confirmar →",  skip:"Omitir", chf:"CHF" },
    uk: { oui:"Так",  non:"Ні",   confirmer:"Підтвердити →",skip:"Пропустити", chf:"ШВФ" },
  };
  const t = T[lang] || T.fr;

  const S = {
    box: { padding:"20px", borderRadius:14, background:"rgba(13,27,42,0.8)",
           border: answered ? "1px solid rgba(52,211,153,0.4)" : "1px solid rgba(42,58,88,0.8)",
           marginBottom:12, transition:"all 0.3s ease" },
    question: { fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:"#E8EDF2",
                fontWeight:400, marginBottom:8, lineHeight:1.4 },
    explication: { fontSize:12, color:"#5A7A99", fontFamily:"'Outfit',sans-serif",
                   marginBottom:14, lineHeight:1.5 },
    impact: { display:"inline-block", fontSize:11, color:"#C9A84C", fontWeight:700,
              background:"rgba(201,168,76,0.08)", border:"1px solid rgba(201,168,76,0.2)",
              padding:"3px 10px", borderRadius:99, marginBottom:14 },
    answered_badge: { fontSize:11, color:"#34D399", fontFamily:"'Outfit',sans-serif",
                      display:"flex", alignItems:"center", gap:6 },
    btn: { padding:"9px 18px", borderRadius:8, fontFamily:"'Outfit',sans-serif",
           fontSize:13, fontWeight:600, cursor:"pointer", border:"none", transition:"all 0.2s" },
    input: { width:"100%", padding:"10px 14px", borderRadius:8, fontSize:14,
             fontFamily:"'Outfit',sans-serif", background:"rgba(255,255,255,0.06)",
             border:"1px solid rgba(42,58,88,0.8)", color:"#E8EDF2",
             outline:"none", marginBottom:10 },
  };

  function submitAnswer(answer) {
    const result = appliquerReponseQuestion(q, answer, () => {});
    if (result?.need_amount) {
      setShowAmount(true);
      return;
    }
    setAnswered(true);
    onAnswer(q.id, answer, q.deduction_cible || q.deduction_si_oui);
  }

  function submitAmount() {
    const amount = parseFloat(amountVal.replace(/[' ]/g,""));
    if (!isNaN(amount) && amount > 0) {
      setAnswered(true);
      onAnswer(q.id, amount, q.deduction_si_oui || q.deduction_cible);
    }
  }

  if (answered) {
    return (
      <div style={S.box}>
        <div style={S.answered_badge}>
          <span>✓</span>
          <span style={{fontFamily:"'Outfit',sans-serif", fontSize:12}}>{q.question}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={S.box}>
      <div style={{ fontSize:10, color:"#5A7A99", fontFamily:"'Outfit',sans-serif",
                    marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>
        Conseiller tAIx
      </div>
      <div style={S.question}>{q.question}</div>
      <div style={S.explication}>{q.explication}</div>
      {q.impact_estime && (
        <div style={S.impact}>💰 {q.impact_estime}</div>
      )}

      {showAmount ? (
        <div>
          <input
            style={S.input}
            type="number"
            placeholder={`Montant en ${t.chf}`}
            value={amountVal}
            onChange={e => setAmountVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submitAmount()}
            autoFocus
          />
          <div style={{ display:"flex", gap:8 }}>
            <button style={{...S.btn, background:"#1A3A5C", color:"#60A5FA"}} onClick={submitAmount}>
              {t.confirmer}
            </button>
            <button style={{...S.btn, background:"transparent", color:"#5A7A99", border:"1px solid #2A3A58"}}
                    onClick={() => { setAnswered(true); onAnswer(q.id, null, null); }}>
              {t.skip}
            </button>
          </div>
        </div>
      ) : q.type === "oui_non" ? (
        <div style={{ display:"flex", gap:10 }}>
          <button style={{...S.btn, background:"rgba(52,211,153,0.15)", color:"#34D399",
                          border:"1px solid rgba(52,211,153,0.3)"}}
                  onClick={() => submitAnswer(true)}>
            ✓ {t.oui}
          </button>
          <button style={{...S.btn, background:"rgba(248,113,113,0.10)", color:"#F87171",
                          border:"1px solid rgba(248,113,113,0.25)"}}
                  onClick={() => submitAnswer(false)}>
            ✗ {t.non}
          </button>
          <button style={{...S.btn, background:"transparent", color:"#5A7A99",
                          border:"1px solid #2A3A58", marginLeft:"auto"}}
                  onClick={() => { setAnswered(true); onAnswer(q.id, null, null); }}>
            {t.skip}
          </button>
        </div>
      ) : q.type === "montant" ? (
        <div>
          <input
            style={S.input}
            type="number"
            placeholder={`Montant en ${t.chf}${q.max_valeur ? ` (max ${q.max_valeur.toLocaleString("fr-CH")})` : ""}`}
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submitAnswer(val)}
          />
          <div style={{display:"flex",gap:8}}>
            <button style={{...S.btn, background:"#1A3A5C", color:"#60A5FA"}}
                    onClick={() => submitAnswer(val)}>{t.confirmer}</button>
            <button style={{...S.btn, background:"transparent", color:"#5A7A99",
                            border:"1px solid #2A3A58"}}
                    onClick={() => { setAnswered(true); onAnswer(q.id, null, null); }}>{t.skip}</button>
          </div>
        </div>
      ) : q.type === "nombre" ? (
        <div>
          <input
            style={S.input}
            type="number"
            placeholder="ex: 40"
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submitAnswer(val)}
          />
          <div style={{display:"flex",gap:8}}>
            <button style={{...S.btn, background:"#1A3A5C", color:"#60A5FA"}}
                    onClick={() => submitAnswer(val)}>{t.confirmer}</button>
            <button style={{...S.btn, background:"transparent", color:"#5A7A99",
                            border:"1px solid #2A3A58"}}
                    onClick={() => { setAnswered(true); onAnswer(q.id, null, null); }}>{t.skip}</button>
          </div>
        </div>
      ) : q.type === "choix" ? (
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {(q.options || []).map((opt, i) => (
            <button key={i}
                    style={{...S.btn, background: val===opt ? "#1A3A5C" : "transparent",
                            color: val===opt ? "#60A5FA" : "#8B95A7",
                            border: `1px solid ${val===opt ? "#2A5A8C" : "#2A3A58"}`}}
                    onClick={() => { setVal(opt); submitAnswer(opt); }}>
              {opt}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ── Composant alerte ──────────────────────────────────────────────────
function Alerte({ alerte }) {
  const colors = {
    warning: { bg:"rgba(251,191,36,0.08)", border:"rgba(251,191,36,0.3)", text:"#FBBF24", icon:"⚠️" },
    error:   { bg:"rgba(248,113,113,0.08)", border:"rgba(248,113,113,0.3)", text:"#F87171", icon:"🔴" },
    info:    { bg:"rgba(96,165,250,0.08)", border:"rgba(96,165,250,0.3)", text:"#60A5FA", icon:"ℹ️" },
  };
  const c = colors[alerte.severite] || colors.info;

  return (
    <div style={{ padding:"14px 16px", borderRadius:12, background:c.bg,
                  border:`1px solid ${c.border}`, marginBottom:10 }}>
      <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
        <span style={{fontSize:16}}>{c.icon}</span>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:c.text,
                        fontFamily:"'Outfit',sans-serif", marginBottom:4 }}>
            {alerte.titre}
          </div>
          <div style={{ fontSize:12, color:"#8B95A7",
                        fontFamily:"'Outfit',sans-serif", lineHeight:1.5 }}>
            {alerte.message}
          </div>
          {alerte.action && (
            <div style={{ fontSize:11, color:c.text, marginTop:6, fontStyle:"italic" }}>
              → {alerte.action}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Écran principal Conseiller IA ─────────────────────────────────────
export function AdvisorScreen({ advisorData, lang = "fr", onComplete, setField }) {
  const [answers, setAnswers] = useState({});
  const [progress, setProgress] = useState(0);

  const questions = advisorData?.questions || [];
  const alertes   = advisorData?.alertes   || [];
  const totalQ    = questions.length;

  const T = {
    fr: { title:"Votre conseiller fiscal tAIx", subtitle:"Questions personnalisées basées sur vos documents",
          progress:"questions répondues", next:"Calculer ma déclaration →",
          economist:"Économie potentielle identifiée", profil:"Votre profil" },
    de: { title:"Ihr tAIx-Steuerberater", subtitle:"Personalisierte Fragen basierend auf Ihren Dokumenten",
          progress:"Fragen beantwortet", next:"Meine Steuererklärung berechnen →",
          economist:"Identifiziertes Sparpotenzial", profil:"Ihr Profil" },
    it: { title:"Il vostro consulente fiscale tAIx", subtitle:"Domande personalizzate basate sui vostri documenti",
          progress:"domande risposte", next:"Calcola la mia dichiarazione →",
          economist:"Risparmio potenziale identificato", profil:"Il vostro profilo" },
    en: { title:"Your tAIx tax advisor", subtitle:"Personalised questions based on your documents",
          progress:"questions answered", next:"Calculate my tax return →",
          economist:"Identified savings potential", profil:"Your profile" },
  };
  const t = T[lang] || T.fr;

  function handleAnswer(qId, value, fieldName) {
    const newAnswers = { ...answers, [qId]: value };
    setAnswers(newAnswers);

    // Appliquer au store
    if (value !== null && value !== undefined && fieldName) {
      const numVal = parseFloat(String(value).replace(/[' ]/g,""));
      if (!isNaN(numVal)) setField(fieldName, numVal);
      else setField(fieldName, value);
    }

    // Calculer progress
    const answered = Object.keys(newAnswers).length;
    setProgress(Math.round((answered / totalQ) * 100));
  }

  return (
    <div style={{ padding:"0 0 20px" }}>

      {/* Header conseiller */}
      <div style={{ padding:"20px", borderRadius:14, marginBottom:16,
                    background:"linear-gradient(135deg,rgba(26,42,74,0.95),rgba(37,99,235,0.15))",
                    border:"1px solid rgba(37,99,235,0.3)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22,
                          color:"#E8EDF2", fontWeight:400, marginBottom:4 }}>
              🧠 {t.title}
            </div>
            <div style={{ fontSize:12, color:"#5A7A99", fontFamily:"'Outfit',sans-serif" }}>
              {t.subtitle}
            </div>
          </div>
          {advisorData?.economie_potentielle_totale && (
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:10, color:"#C9A84C", fontFamily:"'Outfit',sans-serif",
                            textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>
                {t.economist}
              </div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18,
                            color:"#C9A84C", fontWeight:600 }}>
                {advisorData.economie_potentielle_totale}
              </div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {totalQ > 0 && (
          <div style={{ marginTop:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:11, color:"#5A7A99", fontFamily:"'Outfit',sans-serif" }}>
                {Object.keys(answers).length}/{totalQ} {t.progress}
              </span>
              <span style={{ fontSize:11, color:"#34D399", fontFamily:"'Outfit',sans-serif" }}>
                {progress}%
              </span>
            </div>
            <div style={{ height:4, borderRadius:99, background:"rgba(255,255,255,0.08)" }}>
              <div style={{ height:"100%", width:`${progress}%`, borderRadius:99,
                            background:"linear-gradient(90deg,#2563EB,#34D399)",
                            transition:"width 0.4s ease" }}/>
            </div>
          </div>
        )}
      </div>

      {/* Alertes */}
      {alertes.map(a => <Alerte key={a.id} alerte={a} />)}

      {/* Questions */}
      {questions.map(q => (
        <Question key={q.id} q={q} onAnswer={handleAnswer} lang={lang} />
      ))}

      {/* CTA calculer */}
      <button
        onClick={onComplete}
        style={{
          width:"100%", padding:"16px", marginTop:8,
          borderRadius:12, border:"none", cursor:"pointer",
          background:"linear-gradient(135deg,#1A2A4A,#2563EB)",
          color:"white", fontSize:15, fontWeight:700,
          fontFamily:"'Outfit',sans-serif",
          boxShadow:"0 4px 24px rgba(37,99,235,0.3)",
          transition:"all 0.2s",
        }}
      >
        {t.next}
      </button>
    </div>
  );
}
