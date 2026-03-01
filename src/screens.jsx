import { useState } from "react";
import { useStore } from "./store";
import { T as S, GlobalStyles, Btn, InfoBox } from "./ui";
import { APP, PRICING } from "./config";
import { calculerDeclaration } from "./engine";
import { useT } from "./i18n";
import LangSelector from "./LangSelector";

// ═══════════════════════════════════════════════
//  ÉCRAN WELCOME
// ═══════════════════════════════════════════════
export function Welcome() {
  const { setScreen, clientCount, setMode, lang, cantonConfig } = useStore();
  const t = useT(lang);
  const isLaunch = clientCount < PRICING.launchLimit;
  const prix = isLaunch ? PRICING.particulierLaunch : PRICING.particulier;
  const restant = PRICING.launchLimit - clientCount;

  const appName  = cantonConfig?.appName  || "JurAI Tax";
  const canton   = cantonConfig?.canton   || "JU";
  const accent   = cantonConfig?.accent   || "#C9A84C";

  const cantonLabel = {
    JU:"Canton du Jura", NE:"Neuchâtel", FR:"Fribourg",
    VD:"Vaud", VS:"Valais", GE:"Genève", TI:"Ticino", ZH:"Zürich",
  }[canton] || "Canton du Jura";

  return (
    <div style={{ minHeight:"100vh", background:S.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 20px", position:"relative", overflow:"hidden" }}>
      <GlobalStyles />

      {/* Fond animé */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-30%", right:"-20%", width:"70vw", height:"70vw", borderRadius:"50%", background:`radial-gradient(circle,${accent}12 0%,transparent 65%)` }} />
        <div style={{ position:"absolute", bottom:"-20%", left:"-15%", width:"50vw", height:"50vw", borderRadius:"50%", background:`radial-gradient(circle,${accent}0A 0%,transparent 65%)` }} />
        <svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",opacity:0.04}} xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke={accent} strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      {/* Sélecteur de langue — coin haut droit */}
      <div style={{ position:"fixed", top:16, right:16, zIndex:100 }}>
        <LangSelector />
      </div>

      <div style={{ maxWidth:480, width:"100%", position:"relative", zIndex:1 }}>

        {/* Badge lancement */}
        {isLaunch && (
          <div className="fu" style={{ textAlign:"center", marginBottom:20 }}>
            <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 16px", borderRadius:50, background:`${S.goldGlow}`, border:`1px solid rgba(201,168,76,0.4)`, fontSize:11, fontWeight:700, color:S.gold, fontFamily:"'Outfit',sans-serif", letterSpacing:"0.08em", textTransform:"uppercase" }}>
              <span style={{width:5,height:5,borderRadius:"50%",background:S.gold,animation:"pulse 1.5s infinite",display:"inline-block"}} />
              {restant} places — CHF {prix}
            </span>
          </div>
        )}

        {/* Logo / Hero */}
        <div className="fu1" style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:S.muted, fontFamily:"'Outfit',sans-serif", marginBottom:14 }}>
            {cantonLabel} · {t("app_year")}
          </div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:62, fontWeight:300, lineHeight:1.0, color:S.cream, letterSpacing:"-0.02em" }}>
            {appName.includes("Tax") ? (
              <>{appName.replace(" Tax","")}<span style={{color:accent, fontWeight:600}}> Tax</span></>
            ) : (
              <span style={{color:accent, fontWeight:600}}>{appName}</span>
            )}
          </h1>
          <p style={{ fontSize:15, color:S.textDim, marginTop:12, lineHeight:1.6, fontFamily:"'Outfit',sans-serif" }}>
            {t("hero_subtitle")}
          </p>
        </div>

        {/* Avantages — traduits */}
        <div className="fu2" style={{ marginBottom:32 }}>
          {[
            { icon:"📎", tk:"adv_zero_saisie",  dk:"adv_zero_saisie_desc" },
            { icon:"🧠", tk:"adv_optimise",      dk:"adv_optimise_desc" },
            { icon:"📄", tk:"adv_pdf",           dk:"adv_pdf_desc" },
          ].map((x, i) => (
            <div key={i} style={{ display:"flex", gap:14, padding:"14px 16px", borderRadius:12, background:S.surface, border:`1px solid ${S.border}`, marginBottom:8 }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{x.icon}</span>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:S.cream, fontFamily:"'Outfit',sans-serif", marginBottom:2 }}>{t(x.tk)}</div>
                <div style={{ fontSize:12, color:S.textDim, lineHeight:1.4 }}>{t(x.dk)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Badge 6 langues */}
        <div className="fu25" style={{ textAlign:"center", marginBottom:16 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 16px", borderRadius:50, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", fontSize:12, color:S.textDim, fontFamily:"'Outfit',sans-serif" }}>
            🌍 Interface disponible en&nbsp;
            <span style={{color:S.gold}}>Français · Deutsch · Italiano · Português · Español · English</span>
          </div>
        </div>

        {/* CTA */}
        <div className="fu3">
          <Btn full onClick={() => setScreen("form")} style={{ padding:"18px", fontSize:17, borderRadius:14, animation:"glow 3s ease-in-out infinite", background:`linear-gradient(135deg,${accent},${accent}CC)` }}>
            {t("hero_cta")} — CHF {prix}
          </Btn>
          <div style={{ textAlign:"center", marginTop:10, fontSize:11, color:S.muted, fontFamily:"'Outfit',sans-serif" }}>
            Paiement uniquement après validation · {isLaunch ? t("hero_price") : t("hero_price_normal")}
          </div>
        </div>

        {/* Accès B2B */}
        <div className="fu4" style={{ marginTop:20, display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={() => setScreen("b2b")} style={{ background:"none", border:`1px solid ${S.border}`, color:S.textDim, padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:12, fontFamily:"'Outfit',sans-serif" }}>
            💼 {t("nav_b2b")}
          </button>
          <button onClick={() => setScreen("courrier")} style={{ background:"none", border:`1px solid ${S.border}`, color:S.textDim, padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:12, fontFamily:"'Outfit',sans-serif" }}>
            ✉ {t("nav_mail")}
          </button>
        </div>

        {/* Disclaimer */}
        <p className="fu5" style={{ marginTop:28, fontSize:9, color:S.muted, textAlign:"center", lineHeight:1.6, fontFamily:"'Outfit',sans-serif" }}>
          Édité par {APP.editor} · Partenaire: {APP.partner}, {APP.partnerFinma}<br/>
          Les calculs sont indicatifs. La décision de taxation de l'autorité fiscale fait foi.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  ÉCRAN COURRIER — SENIORS
// ═══════════════════════════════════════════════
export function CourrierScreen() {
  const { setScreen, lang } = useStore();
  const t = useT(lang);
  const [printed, setPrinted] = useState(false);

  const checklist = [
    "Déclaration d'impôts 2024 (ou plus récente disponible)",
    "Certificat(s) de salaire 2025 — tous les employeurs",
    "Attestation rente AVS 2025 (décompte annuel OCAS)",
    "Attestation rente LPP / caisse de pension 2025",
    "Relevé bancaire(s) au 31.12.2025 — tous les comptes",
    "Attestation pilier 3a 2025 (banque ou assureur)",
    "Décompte annuel primes maladie 2025 (caisse LAMal)",
    "Attestation rachat LPP 2025 si applicable",
    "Relevé hypothécaire annuel 2025 si propriétaire",
    "Reçus de dons à des organisations reconnues",
    "Factures médicales non remboursées 2025",
    "Vos coordonnées complètes (nom, prénom, adresse, N° tél.)",
  ];

  return (
    <div style={{ minHeight:"100vh", background:S.bg, padding:"40px 20px" }}>
      <GlobalStyles />
      <div style={{ position:"fixed", top:16, right:16, zIndex:100 }}>
        <LangSelector />
      </div>
      <div style={{ maxWidth:560, margin:"0 auto" }}>
        <button onClick={() => setScreen("welcome")} style={{ background:"none", border:"none", color:S.muted, cursor:"pointer", fontSize:13, fontFamily:"'Outfit',sans-serif", marginBottom:28, display:"flex", alignItems:"center", gap:6 }}>
          ← {t("nav_back")}
        </button>

        <div className="fu">
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:34, fontWeight:300, color:S.cream, marginBottom:8 }}>
            {t("courrier_title")}
          </h2>
          <p style={{ fontSize:14, color:S.textDim, lineHeight:1.6, fontFamily:"'Outfit',sans-serif", marginBottom:28 }}>
            {t("courrier_desc")}
          </p>
        </div>

        {/* Adresse */}
        <div className="fu1" style={{ padding:"20px 24px", borderRadius:14, background:S.surface, border:`1px solid ${S.borderHi}`, marginBottom:24, textAlign:"center" }}>
          <div style={{ fontSize:11, color:S.gold, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Outfit',sans-serif", marginBottom:10 }}>Adresse postale</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:S.cream, lineHeight:1.5 }}>
            {t("courrier_address")}
          </div>
        </div>

        <InfoBox type="gold">
          <strong>Tarif :</strong> CHF 49 par déclaration · Délai : 5 jours ouvrables · Retour par courrier recommandé
        </InfoBox>

        <div className="fu2" style={{ marginBottom:24 }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:S.cream, fontWeight:400, marginBottom:14 }}>
            Documents à nous envoyer
          </h3>
          {checklist.map((item, i) => (
            <div key={i} style={{ display:"flex", gap:12, padding:"10px 14px", borderRadius:8, background:S.card, border:`1px solid ${S.border}`, marginBottom:6 }}>
              <span style={{ color:S.gold, fontSize:14, flexShrink:0, marginTop:1 }}>◆</span>
              <span style={{ fontSize:13, color:S.text, fontFamily:"'Outfit',sans-serif", lineHeight:1.4 }}>{item}</span>
            </div>
          ))}
        </div>

        <Btn full onClick={() => { window.print(); setPrinted(true); }}>
          🖨 Imprimer cette checklist
        </Btn>

        {printed && (
          <div style={{ marginTop:12, padding:"12px 16px", borderRadius:10, background:S.greenDim, border:`1px solid rgba(52,211,153,0.25)` }}>
            <div style={{ fontSize:13, color:S.green, fontFamily:"'Outfit',sans-serif" }}>
              ✓ Checklist envoyée à l'impression. Joignez-la à votre enveloppe.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  ÉCRAN B2B — Fiduciaires
// ═══════════════════════════════════════════════
export function B2BLogin() {
  const { setScreen, setMode, lang } = useStore();
  const t = useT(lang);
  const [email, setEmail] = useState("");
  const [firm, setFirm]   = useState("");
  const [client, setClient] = useState({ nom:"", prenom:"", noContribuable:"" });
  const [step, setStep]   = useState("login");

  const FREE_ACCOUNTS = ["contact@winwin.swiss","admin@juraitax.ch"];
  const isFree = FREE_ACCOUNTS.includes(email.toLowerCase());

  const handleLogin = () => {
    setMode("b2b", { email, firm: firm || "WIN WIN Finance Group", plan: isFree ? "unlimited_free" : "cabinet" });
    setStep("client");
  };

  const handleOpenDossier = () => {
    useStore.setState({ clientDossier: client });
    setScreen("form");
  };

  return (
    <div style={{ minHeight:"100vh", background:S.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
      <GlobalStyles />
      <div style={{ position:"fixed", top:16, right:16, zIndex:100 }}><LangSelector /></div>
      <div style={{ maxWidth:440, width:"100%" }}>
        <button onClick={() => setScreen("welcome")} style={{ background:"none", border:"none", color:S.muted, cursor:"pointer", fontSize:13, fontFamily:"'Outfit',sans-serif", marginBottom:28, display:"flex", alignItems:"center", gap:6 }}>
          ← {t("nav_back")}
        </button>

        {step === "login" && (
          <div className="fu">
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, color:S.cream, fontWeight:300, marginBottom:6 }}>{t("b2b_title")}</h2>
            <p style={{ fontSize:13, color:S.textDim, fontFamily:"'Outfit',sans-serif", marginBottom:28 }}>Fiduciaires, conseillers financiers, partenaires agréés</p>

            {["email","firm"].map((f,i) => (
              <div key={f} style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, color:S.textDim, fontFamily:"'Outfit',sans-serif", display:"block", marginBottom:6 }}>
                  {f === "email" ? t("b2b_email_placeholder") : "Nom de la fiduciaire"}
                </label>
                <input value={f==="email"?email:firm} onChange={e=>f==="email"?setEmail(e.target.value):setFirm(e.target.value)}
                  placeholder={f==="email"?"vous@fiduciaire.ch":"Ex: Fiduciaire Dupont SA"}
                  style={{ width:"100%", padding:"13px 14px", borderRadius:10, border:`1px solid ${S.border}`, background:S.card, color:S.cream, fontSize:14, fontFamily:"'Outfit',sans-serif", outline:"none", boxSizing:"border-box" }}
                  onFocus={e=>e.target.style.borderColor=S.gold} onBlur={e=>e.target.style.borderColor=S.border}
                />
              </div>
            ))}

            {isFree && email && (
              <div style={{ padding:"10px 14px", borderRadius:10, background:S.greenDim, border:`1px solid rgba(52,211,153,0.25)`, marginBottom:16 }}>
                <div style={{ fontSize:12, color:S.green, fontWeight:600, fontFamily:"'Outfit',sans-serif" }}>
                  ✓ {t("b2b_winwin_welcome")}
                </div>
              </div>
            )}

            <Btn full onClick={handleLogin} disabled={!email}>Accéder au tableau de bord</Btn>

            <div style={{ marginTop:24, padding:"16px", borderRadius:10, background:S.card, border:`1px solid ${S.border}` }}>
              <div style={{ fontSize:11, fontWeight:600, color:S.gold, fontFamily:"'Outfit',sans-serif", marginBottom:8 }}>TARIFS B2B 2025</div>
              {[
                { plan:"Solo",      price:"CHF 490/an",    quota:"20 déclarations" },
                { plan:"Cabinet",   price:"CHF 990/an",    quota:"60 déclarations" },
                { plan:"Unlimited", price:"CHF 1'990/an",  quota:"Illimité" },
              ].map(p => (
                <div key={p.plan} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${S.border}` }}>
                  <span style={{ fontSize:12, color:S.text, fontFamily:"'Outfit',sans-serif" }}>{p.plan} — {p.quota}</span>
                  <span style={{ fontSize:12, color:S.gold, fontWeight:600, fontFamily:"'Outfit',sans-serif" }}>{p.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "client" && (
          <div className="fu">
            <div style={{ padding:"12px 16px", borderRadius:10, background:S.greenDim, border:`1px solid rgba(52,211,153,0.25)`, marginBottom:20 }}>
              <div style={{ fontSize:12, color:S.green, fontFamily:"'Outfit',sans-serif" }}>
                ✓ {email} — {isFree ? t("b2b_winwin_welcome") : "Plan Cabinet"}
              </div>
            </div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, color:S.cream, fontWeight:300, marginBottom:6 }}>{t("b2b_new_dossier")}</h2>
            {[
              { key:"prenom", label:t("field_prenom"), ph:"André" },
              { key:"nom",    label:t("field_nom"),    ph:"Neukomm" },
              { key:"noContribuable", label:t("field_no_contribuable"), ph:"Ex: 78234910" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, color:S.textDim, fontFamily:"'Outfit',sans-serif", display:"block", marginBottom:6 }}>{f.label}</label>
                <input value={client[f.key]||""} onChange={e=>setClient(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph}
                  style={{ width:"100%", padding:"13px 14px", borderRadius:10, border:`1px solid ${S.border}`, background:S.card, color:S.cream, fontSize:14, fontFamily:"'Outfit',sans-serif", outline:"none", boxSizing:"border-box" }}
                  onFocus={e=>e.target.style.borderColor=S.gold} onBlur={e=>e.target.style.borderColor=S.border}
                />
              </div>
            ))}
            <div style={{ marginTop:20, display:"flex", gap:10 }}>
              <Btn variant="ghost" onClick={()=>setStep("login")}>← {t("nav_back")}</Btn>
              <Btn style={{flex:1}} onClick={handleOpenDossier} disabled={!client.prenom||!client.nom}>
                Ouvrir le dossier →
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  LOADING — traduit
// ═══════════════════════════════════════════════
export function Loading() {
  const { lang } = useStore();
  const t = useT(lang);

  const steps = [
    t("loading_step1"), t("loading_step2"), t("loading_step3"),
    t("loading_step4"), t("loading_step5"), t("loading_step6"),
  ];
  const [step, setStep] = useState(0);
  useState(() => {
    const interval = setInterval(() => setStep(s => Math.min(s+1, steps.length-1)), 350);
    return () => clearInterval(interval);
  });

  return (
    <div style={{ minHeight:"100vh", background:S.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
      <GlobalStyles />
      <div style={{ textAlign:"center", maxWidth:380 }}>
        <div style={{ position:"relative", width:80, height:80, margin:"0 auto 32px" }}>
          <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:`2px solid ${S.border}` }} />
          <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:`2px solid transparent`, borderTop:`2px solid ${S.gold}`, animation:"spin 1s linear infinite" }} />
          <div style={{ position:"absolute", inset:8, borderRadius:"50%", border:`1px solid ${S.border}` }} />
          <div style={{ position:"absolute", inset:8, borderRadius:"50%", border:`1px solid transparent`, borderTop:`1px solid ${S.goldSoft}`, animation:"spin 0.6s linear infinite reverse" }} />
        </div>

        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:S.cream, fontWeight:300, marginBottom:24 }}>
          {t("loading_step1")}
        </h2>

        {steps.map((s, i) => (
          <div key={i} style={{
            fontSize:12, fontFamily:"'Outfit',sans-serif", marginBottom:8,
            color: i < step ? S.green : i === step ? S.gold : S.muted,
            transition:"color 0.3s",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          }}>
            <span style={{fontSize:10}}>{i < step ? "✓" : i === step ? "◆" : "○"}</span>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  PAYWALL — traduit
// ═══════════════════════════════════════════════
export function Paywall() {
  const { calcResult, getAll, setScreen, mode, b2bUser, lang } = useStore();
  const t = useT(lang);
  const data = getAll();
  const r = calcResult;
  const isFree = mode === "b2b" && b2bUser?.plan === "unlimited_free";

  if (isFree) { setScreen("result"); return null; }

  const prix = PRICING.particulierLaunch;

  return (
    <div style={{ minHeight:"100vh", background:S.bg, padding:"32px 20px" }}>
      <GlobalStyles />
      <div style={{ position:"fixed", top:16, right:16, zIndex:100 }}><LangSelector /></div>
      <div style={{ maxWidth:560, margin:"0 auto" }}>

        <div className="fu" style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:11, color:S.gold, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Outfit',sans-serif", marginBottom:8 }}>
            {data.prenom} {data.nom} · {data.commune} · {APP.year}
          </div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:S.cream, fontWeight:300, marginBottom:4 }}>
            {t("paywall_title")}
          </h2>
          <p style={{ fontSize:13, color:S.muted, fontFamily:"'Outfit',sans-serif" }}>
            {t("paywall_includes")}
          </p>
        </div>

        {/* Impôt visible */}
        <div className="fu1" style={{ padding:"24px", borderRadius:16, background:S.surface, border:`1px solid ${S.border}`, marginBottom:16, textAlign:"center" }}>
          <div style={{ fontSize:12, color:S.textDim, fontFamily:"'Outfit',sans-serif", marginBottom:4 }}>{t("paywall_impot_total")}</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:52, color:S.cream, fontWeight:300, lineHeight:1 }}>
            CHF {r?.impotTotal?.toLocaleString("fr-CH") || "—"}
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:14 }}>
            {[
              { label:t("result_impot_cantonal"), v: r ? r.impotCantonal + r.impotCommunal : null },
              { label:t("result_impot_federal"),  v: r?.impotFed },
            ].map((x,i) => (
              <div key={i} style={{ textAlign:"center" }}>
                <div style={{ fontSize:14, color:S.cream, fontFamily:"'Cormorant Garamond',serif" }}>
                  CHF {typeof x.v === "number" ? x.v.toLocaleString("fr-CH") : "—"}
                </div>
                <div style={{ fontSize:10, color:S.muted, fontFamily:"'Outfit',sans-serif" }}>{x.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Optimisations floutées */}
        <div className="fu2" style={{ position:"relative", marginBottom:16 }}>
          <div className="blur-paywall">
            {(r?.optimisations || []).map((o, i) => (
              <div key={i} style={{ padding:"14px 16px", borderRadius:10, background:S.card, border:`1px solid ${S.border}`, marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:S.cream, fontFamily:"'Outfit',sans-serif" }}>{o.label}</div>
                  <div style={{ fontSize:12, color:S.muted }}>{o.detail}</div>
                </div>
                <div style={{ fontSize:16, color:S.green, fontFamily:"'Cormorant Garamond',serif" }}>−CHF {o.economie?.toLocaleString("fr-CH")}</div>
              </div>
            ))}
          </div>
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"linear-gradient(to bottom, transparent 0%, rgba(8,12,20,0.95) 40%)", borderRadius:10 }}>
            <div style={{ textAlign:"center", padding:"20px" }}>
              <div style={{ fontSize:28, marginBottom:8 }}>🔒</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:S.cream, marginBottom:4 }}>
                {r?.optimisations?.length || 0} {t("result_optimisations")}
              </div>
              <div style={{ fontSize:12, color:S.textDim, fontFamily:"'Outfit',sans-serif" }}>
                {t("paywall_unlock")}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="fu3" style={{ padding:"24px", borderRadius:16, background:`linear-gradient(135deg,${S.card},${S.cardHi})`, border:`1px solid ${S.borderHi}` }}>
          <div style={{ textAlign:"center", marginBottom:16 }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, color:S.cream, marginBottom:4 }}>CHF {prix}.-</div>
            <div style={{ fontSize:12, color:S.textDim, fontFamily:"'Outfit',sans-serif" }}>{t("paywall_includes")}</div>
          </div>
          <Btn full onClick={() => setScreen("result")} style={{ fontSize:17, padding:"18px" }}>
            💳 {t("paywall_unlock")}
          </Btn>
          <div style={{ textAlign:"center", marginTop:10, fontSize:10, color:S.muted, fontFamily:"'Outfit',sans-serif" }}>
            Paiement sécurisé par Stripe · Twint accepté
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  RÉSULTAT COMPLET — traduit
// ═══════════════════════════════════════════════
export function Result() {
  const { calcResult: r, getAll, setScreen, mode, b2bUser, clientDossier, lang } = useStore();
  const t = useT(lang);
  const data = getAll();
  const isB2B = mode === "b2b";
  const nomClient = isB2B && clientDossier
    ? `${clientDossier.prenom} ${clientDossier.nom}`
    : `${data.prenom||""} ${data.nom||""}`;

  return (
    <div style={{ minHeight:"100vh", background:S.bg, padding:"32px 20px 80px" }}>
      <GlobalStyles />
      <div style={{ position:"fixed", top:16, right:16, zIndex:100 }}><LangSelector /></div>
      <div style={{ maxWidth:600, margin:"0 auto" }}>

        {isB2B && (
          <div className="fu" style={{ padding:"10px 16px", borderRadius:10, background:S.greenDim, border:`1px solid rgba(52,211,153,0.25)`, marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, color:S.green, fontFamily:"'Outfit',sans-serif", fontWeight:600 }}>
              💼 {b2bUser?.firm} — {nomClient}
            </span>
            <span style={{ fontSize:11, color:S.muted, fontFamily:"'Outfit',sans-serif" }}>Plan: Illimité gratuit</span>
          </div>
        )}

        <div className="fu1" style={{ padding:"28px", borderRadius:16, background:S.surface, border:`1px solid ${S.border}`, marginBottom:14, textAlign:"center" }}>
          <div style={{ fontSize:11, color:S.gold, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Outfit',sans-serif", marginBottom:8 }}>
            {nomClient.trim() || "Contribuable"} · {data.commune} · {APP.year}
          </div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:58, color:S.cream, fontWeight:300, lineHeight:1 }}>
            CHF {r?.impotTotal?.toLocaleString("fr-CH")}
          </div>
          <div style={{ fontSize:12, color:S.textDim, marginTop:8, fontFamily:"'Outfit',sans-serif" }}>{t("result_title")}</div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginTop:20 }}>
            {[
              { l:"ICC", v: r?.impotCantonal },
              { l:"Communal", v: r?.impotCommunal },
              { l:t("result_impot_federal"), v: r?.impotFed },
              { l:"Fortune", v: r?.impotFor },
            ].map((x,i) => (
              <div key={i} style={{ padding:"10px 8px", borderRadius:8, background:S.card, border:`1px solid ${S.border}` }}>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, color:S.cream }}>CHF {x.v?.toLocaleString("fr-CH")}</div>
                <div style={{ fontSize:10, color:S.muted, fontFamily:"'Outfit',sans-serif", marginTop:2 }}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Optimisations */}
        {(r?.optimisations||[]).length > 0 && (
          <div className="fu2" style={{ marginBottom:14 }}>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:S.cream, fontWeight:400, marginBottom:12 }}>{t("result_optimisations")}</h3>
            {r.optimisations.map((o, i) => (
              <div key={i} style={{ padding:"16px", borderRadius:12, background:S.card, border:`1px solid ${S.border}`, marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:S.cream, fontFamily:"'Outfit',sans-serif" }}>{o.label}</div>
                  {o.economie > 0 && <div style={{ fontSize:14, color:S.green, fontFamily:"'Cormorant Garamond',serif", fontWeight:600 }}>−CHF {o.economie.toLocaleString("fr-CH")}/an</div>}
                </div>
                <div style={{ fontSize:12, color:S.textDim, fontFamily:"'Outfit',sans-serif", marginBottom: o.cta==="winwin" ? 10 : 0 }}>{o.detail}</div>
                {o.cta === "winwin" && (
                  <div style={{ padding:"8px 12px", borderRadius:8, background:S.goldGlow, border:`1px solid rgba(201,168,76,0.3)`, display:"inline-flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:11, color:S.gold, fontWeight:700, fontFamily:"'Outfit',sans-serif" }}>
                      {t("winwin_cta")} →
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Déductions */}
        <div className="fu3" style={{ padding:"20px", borderRadius:14, background:S.card, border:`1px solid ${S.border}`, marginBottom:14 }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:S.cream, fontWeight:400, marginBottom:14 }}>{t("section_deductions")}</h3>
          {[
            { l:t("ded_3a"),              v: r?.detail?.pilier3a },
            { l:t("ded_rachat_lpp"),      v: r?.detail?.rachatLPP },
            { l:t("ded_primes_maladie"),  v: r?.detail?.primesDeductibles },
            { l:t("ded_frais_garde"),     v: r?.detail?.fraisGardeDeductibles },
            { l:t("ded_frais_medicaux"),  v: r?.detail?.fraisMaladieDeductibles },
            { l:t("ded_dons"),            v: r?.detail?.donsDeductibles },
          ].filter(x => x.v > 0).map((x,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${S.border}` }}>
              <span style={{ fontSize:13, color:S.textDim, fontFamily:"'Outfit',sans-serif" }}>{x.l}</span>
              <span style={{ fontSize:13, color:S.cream, fontFamily:"'Cormorant Garamond',serif" }}>CHF {x.v?.toLocaleString("fr-CH")}</span>
            </div>
          ))}
        </div>

        {/* CTA WIN WIN — multilingue */}
        <div className="fu4" style={{ padding:"20px", borderRadius:14, background:`linear-gradient(135deg,rgba(13,27,42,0.8),rgba(201,168,76,0.06))`, border:`1px solid rgba(201,168,76,0.25)`, marginBottom:14 }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:S.cream, marginBottom:6, fontWeight:400 }}>
            {t("winwin_cta")}
          </div>
          <p style={{ fontSize:13, color:S.textDim, fontFamily:"'Outfit',sans-serif", lineHeight:1.5, marginBottom:6 }}>
            {t("winwin_desc")}
          </p>
          <p style={{ fontSize:12, color:S.gold, fontFamily:"'Outfit',sans-serif", lineHeight:1.5, marginBottom:14 }}>
            🌍 {t("winwin_multilang")}
          </p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <Btn small style={{ background:S.goldGlow, color:S.gold, border:`1px solid rgba(201,168,76,0.4)` }}>
              Demander un conseil gratuit →
            </Btn>
            <Btn small variant="ghost">Plus tard</Btn>
          </div>
        </div>

        {/* Boutons action */}
        <div className="fu5" style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <Btn style={{flex:1, minWidth:180}} onClick={() => alert("PDF DI-2025 en cours de génération…")}>
            📄 {t("result_download_pdf")}
          </Btn>
          {isB2B && (
            <Btn variant="dark" onClick={() => setScreen("b2b")}>
              + {t("b2b_new_dossier")}
            </Btn>
          )}
          <Btn variant="ghost" onClick={() => { useStore.getState().reset(); }}>
            ↺ Recommencer
          </Btn>
        </div>

        <p style={{ marginTop:24, fontSize:9, color:S.muted, textAlign:"center", lineHeight:1.6, fontFamily:"'Outfit',sans-serif" }}>
          Édité par {APP.editor} · Partenaire: {APP.partner}, {APP.partnerFinma} ·
          Les calculs sont basés sur les informations fournies et les barèmes 2025. La décision de taxation de l'autorité fiscale fait foi.
        </p>
      </div>
    </div>
  );
}
