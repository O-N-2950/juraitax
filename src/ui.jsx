import { useState, useRef, useCallback } from "react";
import { useStore, SOURCE } from "./store";

// ═══════════════════════════════════════════════
//  DESIGN TOKENS — Luxury Swiss Banking Dark
// ═══════════════════════════════════════════════
export const T = {
  bg:       "#080C14",
  surface:  "#0F1623",
  card:     "#141D2E",
  cardHi:   "#1A2540",
  border:   "#1E2D45",
  borderHi: "#C9A84C",
  navy:     "#0D1B2A",
  gold:     "#C9A84C",
  goldSoft: "#D4AF6A",
  goldGlow: "rgba(201,168,76,0.12)",
  goldGlowStr: "rgba(201,168,76,0.25)",
  cream:    "#EDE8DF",
  green:    "#34D399",
  greenDim: "rgba(52,211,153,0.10)",
  red:      "#F87171",
  redDim:   "rgba(248,113,113,0.10)",
  amber:    "#FBBF24",
  muted:    "#4B5563",
  textDim:  "#8B95A7",
  text:     "#D4D8E0",
};

// Source badge colors
export const SOURCE_STYLE = {
  ai:       { bg:"rgba(52,211,153,0.10)", border:"rgba(52,211,153,0.25)", text:"#34D399", label:"✓ IA" },
  imported: { bg:"rgba(251,191,36,0.10)", border:"rgba(251,191,36,0.25)", text:"#FBBF24", label:"↑ Importé" },
  user:     { bg:"rgba(248,113,113,0.10)", border:"rgba(248,113,113,0.25)", text:"#F87171", label:"✎ Modifié" },
  manual:   { bg:"rgba(139,149,167,0.10)", border:"rgba(139,149,167,0.20)", text:"#8B95A7", label:"— Manuel" },
};

// ── GLOBAL CSS ───────────────────────────────────────────────
export const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Outfit:wght@300;400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { min-height: 100vh; background: ${T.bg}; }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }

    @keyframes fadeUp {
      from { opacity:0; transform:translateY(14px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes glow {
      0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,0); }
      50% { box-shadow: 0 0 20px 4px rgba(201,168,76,0.15); }
    }

    .fu  { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
    .fu1 { animation: fadeUp 0.45s 0.06s cubic-bezier(0.16,1,0.3,1) both; }
    .fu2 { animation: fadeUp 0.45s 0.12s cubic-bezier(0.16,1,0.3,1) both; }
    .fu3 { animation: fadeUp 0.45s 0.18s cubic-bezier(0.16,1,0.3,1) both; }
    .fu4 { animation: fadeUp 0.45s 0.24s cubic-bezier(0.16,1,0.3,1) both; }
    .fu5 { animation: fadeUp 0.45s 0.30s cubic-bezier(0.16,1,0.3,1) both; }

    .blur-paywall { filter: blur(7px); user-select: none; pointer-events: none; }
    .gold-text {
      background: linear-gradient(90deg, ${T.gold} 0%, #F5D785 45%, ${T.gold} 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer 4s linear infinite;
    }
    .btn-primary:hover { transform: translateY(-1px); filter: brightness(1.08); }
    .btn-primary:active { transform: translateY(0); }
    .card-hover:hover { border-color: ${T.borderHi}; background: ${T.cardHi}; }
    .card-sel { border-color: ${T.gold} !important; background: ${T.goldGlow} !important; }
  `}</style>
);

// ── BOUTON ───────────────────────────────────────────────────
export function Btn({ children, onClick, variant = "primary", disabled, full, small, style = {} }) {
  const v = {
    primary: { background:`linear-gradient(135deg,${T.gold},#D4B55A)`, color:T.bg, boxShadow:`0 4px 24px ${T.goldGlow}` },
    ghost:   { background:"transparent", color:T.textDim, border:`1px solid ${T.border}` },
    dark:    { background:T.card, color:T.text, border:`1px solid ${T.border}` },
    danger:  { background:T.redDim, color:T.red, border:`1px solid rgba(248,113,113,0.3)` },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={variant === "primary" ? "btn-primary" : ""}
      style={{
        display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
        width: full ? "100%" : "auto",
        padding: small ? "9px 18px" : "15px 28px",
        borderRadius:12, border:"none", cursor: disabled ? "not-allowed" : "pointer",
        fontFamily:"'Outfit',sans-serif", fontWeight:600,
        fontSize: small ? 13 : 15,
        opacity: disabled ? 0.4 : 1,
        transition:"all 0.2s cubic-bezier(0.16,1,0.3,1)",
        ...v[variant], ...style,
      }}
    >{children}</button>
  );
}

// ── SECTION HEADER ───────────────────────────────────────────
export function SecHead({ icon, title, sub }) {
  return (
    <div className="fu" style={{ marginBottom:28 }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:6 }}>
        <div style={{
          width:42, height:42, borderRadius:12,
          background:`linear-gradient(135deg,${T.card},${T.cardHi})`,
          border:`1px solid ${T.border}`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0,
        }}>{icon}</div>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:400, color:T.cream, lineHeight:1.1 }}>{title}</h2>
      </div>
      {sub && <p style={{ fontSize:13, color:T.textDim, paddingLeft:56, lineHeight:1.5, fontFamily:"'Outfit',sans-serif" }}>{sub}</p>}
      <div style={{ height:1, background:`linear-gradient(90deg,${T.gold}40,transparent)`, marginTop:16 }} />
    </div>
  );
}

// ── FIELD WRAPPER ────────────────────────────────────────────
export function Field({ label, hint, required, children, audit }) {
  return (
    <div style={{ marginBottom:22 }}>
      {label && (
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
          <span style={{ fontSize:13, fontWeight:500, color:T.textDim, fontFamily:"'Outfit',sans-serif" }}>{label}</span>
          {required && <span style={{ color:T.gold, fontSize:11, fontWeight:700 }}>requis</span>}
          {audit && <AuditBadge field={audit} />}
        </div>
      )}
      {hint && <p style={{ fontSize:11, color:T.muted, marginBottom:8, lineHeight:1.5, fontFamily:"'Outfit',sans-serif" }}>{hint}</p>}
      {children}
    </div>
  );
}

// ── AUDIT BADGE ──────────────────────────────────────────────
export function AuditBadge({ field }) {
  if (!field) return null;
  const s = SOURCE_STYLE[field.source] || SOURCE_STYLE.manual;
  return (
    <span style={{
      fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:20,
      background:s.bg, border:`1px solid ${s.border}`, color:s.text,
      fontFamily:"'Outfit',sans-serif",
    }}>{s.label}</span>
  );
}

// ── SÉLECTEUR CARTE ──────────────────────────────────────────
export function Cards({ options, value, onChange, cols = 2, multi = false }) {
  const isSelected = (v) => multi ? (value || []).includes(v) : value === v;
  const toggle = (v) => {
    if (multi) {
      const cur = value || [];
      onChange(isSelected(v) ? cur.filter(x => x !== v) : [...cur, v]);
    } else {
      onChange(v);
    }
  };
  return (
    <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:8 }}>
      {options.map(o => (
        <div key={o.value}
          onClick={() => toggle(o.value)}
          className={`card-hover ${isSelected(o.value) ? "card-sel" : ""}`}
          style={{
            padding:"12px 14px", borderRadius:10,
            border:`1px solid ${T.border}`,
            background:T.card,
            cursor:"pointer",
            display:"flex", alignItems:"center", gap:10,
            transition:"all 0.15s",
          }}
        >
          {o.icon && <span style={{fontSize:18,flexShrink:0}}>{o.icon}</span>}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:500,color:T.text,lineHeight:1.2}}>{o.label}</div>
            {o.desc && <div style={{fontSize:11,color:T.muted,marginTop:2}}>{o.desc}</div>}
          </div>
          {isSelected(o.value) && (
            <div style={{width:18,height:18,borderRadius:"50%",background:T.gold,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{color:T.bg,fontSize:10,fontWeight:800}}>✓</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── OUI / NON ────────────────────────────────────────────────
export function YN({ value, onChange }) {
  return (
    <div style={{ display:"flex", gap:10 }}>
      {[{v:true,l:"✓  Oui"},{v:false,l:"✗  Non"}].map(o => (
        <div key={String(o.v)} onClick={() => onChange(o.v)}
          className={`card-hover ${value === o.v ? "card-sel" : ""}`}
          style={{ flex:1, padding:"12px", borderRadius:10, textAlign:"center", border:`1px solid ${T.border}`, background:T.card, cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontSize:14, fontWeight:500, color: value===o.v?T.gold:T.text, transition:"all 0.15s" }}>
          {o.l}
        </div>
      ))}
    </div>
  );
}

// ── INPUT TEXTE ──────────────────────────────────────────────
export function TxtIn({ value, onChange, placeholder, type = "text", prefix, large }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
      {prefix && <span style={{ position:"absolute", left:14, fontFamily:"'Cormorant Garamond',serif", fontSize:15, color:T.gold, pointerEvents:"none", zIndex:1 }}>{prefix}</span>}
      <input
        type={type === "amount" ? "number" : type}
        value={value || ""}
        onChange={e => {
          const v = type === "amount" ? (parseFloat(e.target.value) || null) : e.target.value;
          onChange(v);
        }}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholder={placeholder || ""}
        style={{
          width:"100%",
          padding:`13px 14px 13px ${prefix ? "46px" : "14px"}`,
          borderRadius:10,
          border:`1px solid ${focus ? T.gold : T.border}`,
          background:T.card,
          color:T.cream,
          fontSize: large ? 18 : 15,
          fontFamily: type === "amount" ? "'Cormorant Garamond',serif" : "'Outfit',sans-serif",
          outline:"none",
          transition:"border-color 0.2s",
          WebkitAppearance:"none",
        }}
      />
    </div>
  );
}

// ── UPLOAD + MONTANT (avec audit trail) ──────────────────────
export function AmtUpload({ fieldKey, label, hint, docs }) {
  const store = useStore();
  const field = store.getField(fieldKey);
  const value = field?.value ?? null;
  const [uploading, setUploading] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const fileRef = useRef();

  const MOCK = { revenus_salaire:72400,revenus_avs:28800,revenus_lpp:18000,primes_maladie:5640,interets_hypothecaires:8200,dette_hypotheque:185000,rachat_lpp:12000,frais_garde:8400,revenus_titres:1240,comptes_bancaires:42300,pilier3a:7258,revenus_loyers:14400,autres_dettes:8000,frais_maladie:2800,fortune_immobilier:380000,titres:24000,assurance_vie:18000 };

  const handleFile = useCallback(() => {
    setUploading(true);
    setTimeout(() => {
      const v = MOCK[fieldKey] || Math.floor(Math.random()*40000+2000);
      store.importFromDoc(fieldKey, v, label);
      setUploading(false);
      setShowManual(false);
    }, 1400 + Math.random()*800);
  }, [fieldKey, label]);

  const handleManualChange = (v) => {
    store.setField(fieldKey, v, SOURCE.USER);
  };

  return (
    <Field label={label} hint={hint} audit={field}>
      {/* Valeur extraite affichée */}
      {value !== null && !uploading && (
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:10, background:T.greenDim, border:`1px solid rgba(52,211,153,0.2)`, marginBottom:8 }}>
          <span style={{color:T.green,fontSize:18}}>✓</span>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:T.cream}}>
              CHF {value.toLocaleString("fr-CH")}
            </div>
            <div style={{fontSize:10,color:T.muted,marginTop:1,fontFamily:"'Outfit',sans-serif"}}>
              {field?.source === SOURCE.AI ? `Extrait depuis: ${field.docSource||"document"}` :
               field?.source === SOURCE.USER ? `⚠ Modifié manuellement — ${new Date(field.modifiedAt).toLocaleString("fr-CH")}` :
               "Saisi manuellement"}
            </div>
          </div>
          <button onClick={() => store.setField(fieldKey, null, SOURCE.MANUAL)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:20,lineHeight:1}}>×</button>
        </div>
      )}

      {/* Zone upload */}
      {!uploading && value === null && !showManual && (
        <div
          onClick={() => fileRef.current?.click()}
          style={{ padding:"18px 16px", borderRadius:10, border:`2px dashed ${T.border}`, background:"transparent", cursor:"pointer", textAlign:"center", transition:"all 0.2s" }}
          onMouseOver={e=>{e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.background=T.goldGlow;}}
          onMouseOut={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background="transparent";}}
        >
          <div style={{fontSize:24,marginBottom:6}}>📎</div>
          <div style={{fontSize:13,fontWeight:600,color:T.text,fontFamily:"'Outfit',sans-serif"}}>
            {docs || "Téléverser le document"}
          </div>
          <div style={{fontSize:11,color:T.muted,marginTop:3}}>PDF · JPG · PNG — extraction automatique par IA</div>
          <input ref={fileRef} type="file" multiple accept=".pdf,image/*" style={{display:"none"}} onChange={handleFile} />
        </div>
      )}

      {uploading && (
        <div style={{padding:"18px",borderRadius:10,background:T.card,border:`1px solid ${T.border}`,textAlign:"center"}}>
          <div style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${T.border}`,borderTop:`2px solid ${T.gold}`,animation:"spin 0.8s linear infinite",margin:"0 auto 10px"}}/>
          <div style={{fontSize:12,color:T.gold,fontFamily:"'Outfit',sans-serif",animation:"pulse 1.5s infinite"}}>IA en cours d'analyse…</div>
        </div>
      )}

      {/* Saisie manuelle option */}
      {!uploading && (
        <div style={{marginTop:8}}>
          {!showManual ? (
            <button onClick={()=>setShowManual(true)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:11,fontFamily:"'Outfit',sans-serif",textDecoration:"underline"}}>
              Saisir manuellement
            </button>
          ) : (
            <div>
              <TxtIn type="amount" prefix="CHF" value={value} onChange={handleManualChange} placeholder="Saisie manuelle" />
              {value !== null && <div style={{fontSize:10,color:T.amber,marginTop:4,fontFamily:"'Outfit',sans-serif"}}>⚠ Saisie manuelle — tracée dans l'audit</div>}
            </div>
          )}
        </div>
      )}
    </Field>
  );
}

// ── DIVIDER ──────────────────────────────────────────────────
export function Divider({ label }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,margin:"20px 0"}}>
      <div style={{flex:1,height:1,background:T.border}}/>
      {label && <span style={{fontSize:11,color:T.muted,fontFamily:"'Outfit',sans-serif",whiteSpace:"nowrap"}}>{label}</span>}
      <div style={{flex:1,height:1,background:T.border}}/>
    </div>
  );
}

// ── INFO BOX ─────────────────────────────────────────────────
export function InfoBox({ type = "info", children }) {
  const styles = {
    info:    { bg:`rgba(59,130,246,0.08)`,  border:"rgba(59,130,246,0.25)",  icon:"ℹ",  color:"#60A5FA" },
    warning: { bg:"rgba(251,191,36,0.08)",  border:"rgba(251,191,36,0.25)",  icon:"⚠",  color:T.amber },
    success: { bg:T.greenDim,               border:"rgba(52,211,153,0.25)",  icon:"✓",  color:T.green },
    gold:    { bg:T.goldGlow,               border:"rgba(201,168,76,0.30)",  icon:"✦",  color:T.gold },
  };
  const s = styles[type];
  return (
    <div style={{display:"flex",gap:12,padding:"14px 16px",borderRadius:10,background:s.bg,border:`1px solid ${s.border}`,marginBottom:16}}>
      <span style={{color:s.color,fontSize:16,flexShrink:0}}>{s.icon}</span>
      <div style={{fontSize:13,color:T.text,lineHeight:1.5,fontFamily:"'Outfit',sans-serif"}}>{children}</div>
    </div>
  );
}
