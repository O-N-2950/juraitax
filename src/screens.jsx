import { useState } from "react";
import { useStore } from "./store";
import { T, GlobalStyles, Btn, InfoBox } from "./ui";
import { APP, PRICING } from "./config";
import { calculerDeclaration } from "./engine";

// ═══════════════════════════════════════════════
//  ÉCRAN WELCOME
// ═══════════════════════════════════════════════
export function Welcome() {
  const { setScreen, clientCount, setMode } = useStore();
  const isLaunch = clientCount < PRICING.launchLimit;
  const prix = isLaunch ? PRICING.particulierLaunch : PRICING.particulier;
  const restant = PRICING.launchLimit - clientCount;

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 20px", position:"relative", overflow:"hidden" }}>
      <GlobalStyles />

      {/* Fond animé */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-30%", right:"-20%", width:"70vw", height:"70vw", borderRadius:"50%", background:`radial-gradient(circle,rgba(201,168,76,0.06) 0%,transparent 65%)` }} />
        <div style={{ position:"absolute", bottom:"-20%", left:"-15%", width:"50vw", height:"50vw", borderRadius:"50%", background:`radial-gradient(circle,rgba(201,168,76,0.04) 0%,transparent 65%)` }} />
        {/* Lignes décoratives */}
        <svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",opacity:0.04}} xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#C9A84C" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      <div style={{ maxWidth:480, width:"100%", position:"relative", zIndex:1 }}>

        {/* Badge lancement */}
        {isLaunch && (
          <div className="fu" style={{ textAlign:"center", marginBottom:20 }}>
            <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 16px", borderRadius:50, background:`${T.goldGlow}`, border:`1px solid rgba(201,168,76,0.4)`, fontSize:11, fontWeight:700, color:T.gold, fontFamily:"'Outfit',sans-serif", letterSpacing:"0.08em", textTransform:"uppercase" }}>
              <span style={{width:5,height:5,borderRadius:"50%",background:T.gold,animation:"pulse 1.5s infinite",display:"inline-block"}} />
              Offre lancement — {restant} places restantes à CHF {prix}
            </span>
          </div>
        )}

        {/* Logo */}
        <div className="fu1" style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:T.muted, fontFamily:"'Outfit',sans-serif", marginBottom:14 }}>
            Canton du Jura · Année fiscale 2025
          </div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:62, fontWeight:300, lineHeight:1.0, color:T.cream, letterSpacing:"-0.02em" }}>
            JurAI <span className="gold-text" style={{fontWeight:600}}>Tax</span>
          </h1>
          <p style={{ fontSize:15, color:T.textDim, marginTop:12, lineHeight:1.6, fontFamily:"'Outfit',sans-serif" }}>
            Votre déclaration d'impôts,<br/>remplie automatiquement par l'intelligence artificielle.
          </p>
        </div>

        {/* Avantages */}
        <div className="fu2" style={{ marginBottom:32 }}>
          {[
            { icon:"📎", title:"Upload, c'est tout", desc:"Téléversez vos documents — l'IA extrait tous les montants automatiquement. Zéro saisie manuelle." },
            { icon:"🧠", title:"Calculs recertifiés", desc:"Notre IA recalcule tout depuis les sources officielles. Les erreurs des années passées sont corrigées." },
            { icon:"🔒", title:"Audit trail complet", desc:"Chaque donnée est tracée — source IA, document d'origine, modifications client horodatées." },
          ].map((x, i) => (
            <div key={i} style={{ display:"flex", gap:14, padding:"14px 16px", borderRadius:12, background:T.surface, border:`1px solid ${T.border}`, marginBottom:8 }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{x.icon}</span>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:T.cream, fontFamily:"'Outfit',sans-serif", marginBottom:2 }}>{x.title}</div>
                <div style={{ fontSize:12, color:T.textDim, lineHeight:1.4 }}>{x.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA principal */}
        <div className="fu3">
          <Btn full onClick={() => setScreen("form")} style={{ padding:"18px", fontSize:17, borderRadius:14, animation:"glow 3s ease-in-out infinite" }}>
            Commencer — {prix} CHF
          </Btn>
          <div style={{ textAlign:"center", marginTop:10, fontSize:11, color:T.muted, fontFamily:"'Outfit',sans-serif" }}>
            Paiement uniquement après validation de votre déclaration
          </div>
        </div>

        {/* Accès B2B */}
        <div className="fu4" style={{ marginTop:20, display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={() => setScreen("b2b")} style={{ background:"none", border:`1px solid ${T.border}`, color:T.textDim, padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:12, fontFamily:"'Outfit',sans-serif" }}>
            💼 Accès fiduciaire / B2B
          </button>
          <button onClick={() => setScreen("courrier")} style={{ background:"none", border:`1px solid ${T.border}`, color:T.textDim, padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:12, fontFamily:"'Outfit',sans-serif" }}>
            ✉ Envoyer mes documents par courrier
          </button>
        </div>

        {/* Disclaimer */}
        <p className="fu5" style={{ marginTop:28, fontSize:9, color:T.muted, textAlign:"center", lineHeight:1.6, fontFamily:"'Outfit',sans-serif" }}>
          Édité par {APP.editor} · Partenaire: {APP.partner}, {APP.partnerFinma}<br/>
          Les calculs sont indicatifs. L'utilisateur est responsable des données fournies. La décision de taxation de l'autorité fiscale fait foi.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  ÉCRAN COURRIER — SENIORS
// ═══════════════════════════════════════════════
export function CourrierScreen() {
  const { setScreen } = useStore();
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
    "Décompte leasing 2025 si applicable",
    "Reçus de dons à des organisations reconnues",
    "Factures médicales non remboursées 2025",
    "Vos coordonnées complètes (nom, prénom, adresse, N° tél.)",
  ];

  return (
    <div style={{ minHeight:"100vh", background:T.bg, padding:"40px 20px" }}>
      <GlobalStyles />
      <div style={{ maxWidth:560, margin:"0 auto" }}>

        <button onClick={() => setScreen("welcome")} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:13, fontFamily:"'Outfit',sans-serif", marginBottom:28, display:"flex", alignItems:"center", gap:6 }}>
          ← Retour
        </button>

        <div className="fu">
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:34, fontWeight:300, color:T.cream, marginBottom:8 }}>
            Envoi par courrier
          </h2>
          <p style={{ fontSize:14, color:T.textDim, lineHeight:1.6, fontFamily:"'Outfit',sans-serif", marginBottom:28 }}>
            Vous n'êtes pas à l'aise avec internet ? Pas de problème. Envoyez-nous vos documents par courrier postal. Nous établissons votre déclaration et vous la retournons prête à signer.
          </p>
        </div>

        {/* Adresse */}
        <div className="fu1" style={{ padding:"20px 24px", borderRadius:14, background:T.surface, border:`1px solid ${T.borderHi}`, marginBottom:24, textAlign:"center" }}>
          <div style={{ fontSize:11, color:T.gold, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Outfit',sans-serif", marginBottom:10 }}>Adresse postale</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:T.cream, lineHeight:1.5 }}>
            {APP.editor}<br/>
            Bellevue 7<br/>
            2950 Courgenay
          </div>
        </div>

        {/* Tarif courrier */}
        <InfoBox type="gold">
          <strong>Tarif courrier :</strong> CHF 49 par déclaration · Paiement par bulletin de versement joint à votre dossier retourné · Délai : 5 jours ouvrables après réception de vos documents
        </InfoBox>

        {/* Checklist */}
        <div className="fu2" style={{ marginBottom:24 }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:T.cream, fontWeight:400, marginBottom:14 }}>
            Documents à nous envoyer
          </h3>
          {checklist.map((item, i) => (
            <div key={i} style={{ display:"flex", gap:12, padding:"10px 14px", borderRadius:8, background:T.card, border:`1px solid ${T.border}`, marginBottom:6 }}>
              <span style={{ color:T.gold, fontSize:14, flexShrink:0, marginTop:1 }}>◆</span>
              <span style={{ fontSize:13, color:T.text, fontFamily:"'Outfit',sans-serif", lineHeight:1.4 }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Bouton imprimer la checklist */}
        <div style={{ display:"flex", gap:10 }}>
          <Btn full onClick={() => { window.print(); setPrinted(true); }}>
            🖨 Imprimer cette checklist
          </Btn>
        </div>

        {printed && (
          <div style={{ marginTop:12, padding:"12px 16px", borderRadius:10, background:T.greenDim, border:`1px solid rgba(52,211,153,0.25)` }}>
            <div style={{ fontSize:13, color:T.green, fontFamily:"'Outfit',sans-serif" }}>
              ✓ Checklist envoyée à l'impression. Joignez-la à votre enveloppe.
            </div>
          </div>
        )}

        <p style={{ marginTop:20, fontSize:11, color:T.muted, textAlign:"center", lineHeight:1.6, fontFamily:"'Outfit',sans-serif" }}>
          Questions ? {APP.email} · Nous retournons votre déclaration par courrier recommandé, prête à signer et à envoyer au Service des contributions du Canton du Jura.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  ÉCRAN B2B — Fiduciaires
// ═══════════════════════════════════════════════
export function B2BLogin() {
  const { setScreen, setMode } = useStore();
  const [email, setEmail] = useState("");
  const [firm, setFirm] = useState("");
  const [client, setClient] = useState({ nom:"", prenom:"", noContribuable:"" });
  const [step, setStep] = useState("login"); // login | client

  const FREE_ACCOUNTS = ["winwin@winwinfinance.ch","olivier@winwinfinance.ch","admin@juraitax.ch"];
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
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
      <GlobalStyles />
      <div style={{ maxWidth:440, width:"100%" }}>
        <button onClick={() => setScreen("welcome")} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:13, fontFamily:"'Outfit',sans-serif", marginBottom:28, display:"flex", alignItems:"center", gap:6 }}>
          ← Retour
        </button>

        {step === "login" && (
          <div className="fu">
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, color:T.cream, fontWeight:300, marginBottom:6 }}>Accès professionnel</h2>
            <p style={{ fontSize:13, color:T.textDim, fontFamily:"'Outfit',sans-serif", marginBottom:28 }}>Fiduciaires, conseillers financiers, partenaires agréés</p>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, color:T.textDim, fontFamily:"'Outfit',sans-serif", display:"block", marginBottom:6 }}>Email professionnel</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@votre-fiduciaire.ch"
                style={{ width:"100%", padding:"13px 14px", borderRadius:10, border:`1px solid ${T.border}`, background:T.card, color:T.cream, fontSize:14, fontFamily:"'Outfit',sans-serif", outline:"none", boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}
              />
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ fontSize:12, color:T.textDim, fontFamily:"'Outfit',sans-serif", display:"block", marginBottom:6 }}>Nom de la fiduciaire</label>
              <input value={firm} onChange={e=>setFirm(e.target.value)} placeholder="Ex: Fiduciaire Dupont SA"
                style={{ width:"100%", padding:"13px 14px", borderRadius:10, border:`1px solid ${T.border}`, background:T.card, color:T.cream, fontSize:14, fontFamily:"'Outfit',sans-serif", outline:"none", boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}
              />
            </div>

            {isFree && email && (
              <div style={{ padding:"10px 14px", borderRadius:10, background:T.greenDim, border:`1px solid rgba(52,211,153,0.25)`, marginBottom:16 }}>
                <div style={{ fontSize:12, color:T.green, fontWeight:600, fontFamily:"'Outfit',sans-serif" }}>
                  ✓ Partenaire fondateur — accès illimité gratuit
                </div>
              </div>
            )}

            <Btn full onClick={handleLogin} disabled={!email}>Accéder au tableau de bord</Btn>

            <div style={{ marginTop:24, padding:"16px", borderRadius:10, background:T.card, border:`1px solid ${T.border}` }}>
              <div style={{ fontSize:11, fontWeight:600, color:T.gold, fontFamily:"'Outfit',sans-serif", marginBottom:8 }}>TARIFS B2B 2025</div>
              {[
                { plan:"Solo", price:"CHF 490/an", quota:"20 déclarations incluses" },
                { plan:"Cabinet", price:"CHF 990/an", quota:"60 déclarations incluses" },
                { plan:"Unlimited", price:"CHF 1'990/an", quota:"Déclarations illimitées" },
              ].map(p => (
                <div key={p.plan} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${T.border}` }}>
                  <span style={{ fontSize:12, color:T.text, fontFamily:"'Outfit',sans-serif" }}>{p.plan} — {p.quota}</span>
                  <span style={{ fontSize:12, color:T.gold, fontWeight:600, fontFamily:"'Outfit',sans-serif" }}>{p.price}</span>
                </div>
              ))}
              <div style={{ fontSize:10, color:T.muted, marginTop:8, fontFamily:"'Outfit',sans-serif" }}>Déclarations supplémentaires hors quota: CHF 29/unité</div>
            </div>
          </div>
        )}

        {step === "client" && (
          <div className="fu">
            <div style={{ padding:"12px 16px", borderRadius:10, background:T.greenDim, border:`1px solid rgba(52,211,153,0.25)`, marginBottom:20 }}>
              <div style={{ fontSize:12, color:T.green, fontFamily:"'Outfit',sans-serif" }}>
                ✓ Connecté: {email} — {isFree ? "Accès illimité gratuit" : "Plan Cabinet"}
              </div>
            </div>

            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, color:T.cream, fontWeight:300, marginBottom:6 }}>Nouveau dossier client</h2>
            <p style={{ fontSize:13, color:T.textDim, fontFamily:"'Outfit',sans-serif", marginBottom:24 }}>Renseignez l'identité du contribuable pour ouvrir son dossier.</p>

            {[
              { key:"prenom", label:"Prénom du client", ph:"André" },
              { key:"nom", label:"Nom de famille", ph:"Neukomm" },
              { key:"noContribuable", label:"N° contribuable (si connu)", ph:"Ex: 78234910" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, color:T.textDim, fontFamily:"'Outfit',sans-serif", display:"block", marginBottom:6 }}>{f.label}</label>
                <input value={client[f.key]||""} onChange={e=>setClient(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph}
                  style={{ width:"100%", padding:"13px 14px", borderRadius:10, border:`1px solid ${T.border}`, background:T.card, color:T.cream, fontSize:14, fontFamily:"'Outfit',sans-serif", outline:"none", boxSizing:"border-box" }}
                  onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}
                />
              </div>
            ))}

            <div style={{ marginTop:20, display:"flex", gap:10 }}>
              <Btn variant="ghost" onClick={()=>setStep("login")}>← Retour</Btn>
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
//  LOADING
// ═══════════════════════════════════════════════
export function Loading() {
  const steps = [
    "Analyse des documents téléversés…",
    "Extraction des montants par intelligence artificielle…",
    "Application des barèmes Jura 2025…",
    "Vérification des droits aux subsides LAMal…",
    "Calcul des optimisations fiscales…",
    "Génération du formulaire DI-2025 officiel…",
  ];
  const [step, setStep] = useState(0);
  useState(() => {
    const t = setInterval(() => setStep(s => Math.min(s+1, steps.length-1)), 350);
    return () => clearInterval(t);
  });

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
      <GlobalStyles />
      <div style={{ textAlign:"center", maxWidth:380 }}>
        {/* Cercle animé */}
        <div style={{ position:"relative", width:80, height:80, margin:"0 auto 32px" }}>
          <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:`2px solid ${T.border}` }} />
          <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:`2px solid transparent`, borderTop:`2px solid ${T.gold}`, animation:"spin 1s linear infinite" }} />
          <div style={{ position:"absolute", inset:8, borderRadius:"50%", border:`1px solid ${T.border}` }} />
          <div style={{ position:"absolute", inset:8, borderRadius:"50%", border:`1px solid transparent`, borderTop:`1px solid ${T.goldSoft}`, animation:"spin 0.6s linear infinite reverse" }} />
        </div>

        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:T.cream, fontWeight:300, marginBottom:24 }}>
          Analyse en cours
        </h2>

        {steps.map((s, i) => (
          <div key={i} style={{
            fontSize:12, fontFamily:"'Outfit',sans-serif", marginBottom:8,
            color: i < step ? T.green : i === step ? T.gold : T.muted,
            transition:"color 0.3s",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          }}>
            <span style={{fontSize:10}}>
              {i < step ? "✓" : i === step ? "◆" : "○"}
            </span>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  PAYWALL — Résultats floutés
// ═══════════════════════════════════════════════
export function Paywall() {
  const { calcResult, getAll, setScreen, mode, b2bUser, clientDossier } = useStore();
  const data = getAll();
  const r = calcResult;
  const isFree = mode === "b2b" && b2bUser?.plan === "unlimited_free";

  if (isFree) {
    // B2B gratuit — accès direct au résultat
    setScreen("result");
    return null;
  }

  const prix = PRICING.particulierLaunch;

  return (
    <div style={{ minHeight:"100vh", background:T.bg, padding:"32px 20px" }}>
      <GlobalStyles />
      <div style={{ maxWidth:560, margin:"0 auto" }}>

        {/* Header */}
        <div className="fu" style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:11, color:T.gold, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Outfit',sans-serif", marginBottom:8 }}>
            {data.prenom} {data.nom} · {data.commune} · {APP.year}
          </div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:T.textDim, fontWeight:300, marginBottom:4 }}>
            Votre déclaration est prête
          </h2>
          <p style={{ fontSize:13, color:T.muted, fontFamily:"'Outfit',sans-serif" }}>
            Débloquez l'accès complet pour télécharger votre DI-2025
          </p>
        </div>

        {/* Carte impôt — visible */}
        <div className="fu1" style={{ padding:"24px", borderRadius:16, background:T.surface, border:`1px solid ${T.border}`, marginBottom:16, textAlign:"center" }}>
          <div style={{ fontSize:12, color:T.textDim, fontFamily:"'Outfit',sans-serif", marginBottom:4 }}>Impôt total estimé 2025</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:52, color:T.cream, fontWeight:300, lineHeight:1 }}>
            CHF {r?.impotTotal?.toLocaleString("fr-CH") || "—"}
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:14 }}>
            {[
              { label:"ICC + communal", v: r ? r.impotCantonal + r.impotCommunal : "—" },
              { label:"IFD fédéral", v: r?.impotFed },
              { label:"Fortune", v: r?.impotFor },
            ].map((x,i) => (
              <div key={i} style={{ textAlign:"center" }}>
                <div style={{ fontSize:14, color:T.cream, fontFamily:"'Cormorant Garamond',serif" }}>
                  CHF {typeof x.v === "number" ? x.v.toLocaleString("fr-CH") : "—"}
                </div>
                <div style={{ fontSize:10, color:T.muted, fontFamily:"'Outfit',sans-serif" }}>{x.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Optimisations — FLOUTÉES */}
        <div className="fu2" style={{ position:"relative", marginBottom:16 }}>
          <div className="blur-paywall">
            {(r?.optimisations || []).map((o, i) => (
              <div key={i} style={{ padding:"14px 16px", borderRadius:10, background:T.card, border:`1px solid ${T.border}`, marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:T.cream, fontFamily:"'Outfit',sans-serif" }}>{o.label}</div>
                  <div style={{ fontSize:12, color:T.muted }}>{o.detail}</div>
                </div>
                <div style={{ fontSize:16, color:T.green, fontFamily:"'Cormorant Garamond',serif" }}>−CHF {o.economie?.toLocaleString("fr-CH")}</div>
              </div>
            ))}
            <div style={{ padding:"14px 16px", borderRadius:10, background:T.card, border:`1px solid ${T.border}`, marginBottom:8 }}>
              <div style={{ fontSize:13, fontWeight:600, color:T.cream, fontFamily:"'Outfit',sans-serif" }}>Détail des déductions</div>
              <div style={{ height:60, background:T.cardHi, borderRadius:6, marginTop:8 }} />
            </div>
          </div>
          {/* Overlay paywall */}
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"linear-gradient(to bottom, transparent 0%, rgba(8,12,20,0.95) 40%)", borderRadius:10 }}>
            <div style={{ textAlign:"center", padding:"20px" }}>
              <div style={{ fontSize:28, marginBottom:8 }}>🔒</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:T.cream, marginBottom:4 }}>
                {r?.optimisations?.length || 0} optimisation{r?.optimisations?.length > 1 ? "s" : ""} identifiée{r?.optimisations?.length > 1 ? "s" : ""}
              </div>
              <div style={{ fontSize:12, color:T.textDim, fontFamily:"'Outfit',sans-serif" }}>
                Débloquez pour voir le détail complet
              </div>
            </div>
          </div>
        </div>

        {/* CTA PAIEMENT */}
        <div className="fu3" style={{ padding:"24px", borderRadius:16, background:`linear-gradient(135deg,${T.card},${T.cardHi})`, border:`1px solid ${T.borderHi}` }}>
          <div style={{ textAlign:"center", marginBottom:16 }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, color:T.cream, marginBottom:4 }}>CHF {prix}.-</div>
            <div style={{ fontSize:12, color:T.textDim, fontFamily:"'Outfit',sans-serif" }}>Accès complet · PDF DI-2025 officiel · Rapport d'optimisation</div>
          </div>
          <Btn full onClick={() => setScreen("result")} style={{ fontSize:17, padding:"18px" }}>
            💳 Payer et télécharger ma déclaration
          </Btn>
          <div style={{ textAlign:"center", marginTop:10, fontSize:10, color:T.muted, fontFamily:"'Outfit',sans-serif" }}>
            Paiement sécurisé par Stripe · Satisfaction garantie
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  RÉSULTAT COMPLET
// ═══════════════════════════════════════════════
export function Result() {
  const { calcResult: r, getAll, setScreen, mode, b2bUser, clientDossier } = useStore();
  const data = getAll();
  const isB2B = mode === "b2b";
  const nomClient = isB2B && clientDossier ? `${clientDossier.prenom} ${clientDossier.nom}` : `${data.prenom||""} ${data.nom||""}`;

  return (
    <div style={{ minHeight:"100vh", background:T.bg, padding:"32px 20px 80px" }}>
      <GlobalStyles />
      <div style={{ maxWidth:600, margin:"0 auto" }}>

        {/* En-tête B2B */}
        {isB2B && (
          <div className="fu" style={{ padding:"10px 16px", borderRadius:10, background:T.greenDim, border:`1px solid rgba(52,211,153,0.25)`, marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, color:T.green, fontFamily:"'Outfit',sans-serif", fontWeight:600 }}>
              💼 {b2bUser?.firm} — Dossier: {nomClient}
            </span>
            <span style={{ fontSize:11, color:T.muted, fontFamily:"'Outfit',sans-serif" }}>Plan: Illimité gratuit</span>
          </div>
        )}

        {/* Impôt principal */}
        <div className="fu1" style={{ padding:"28px", borderRadius:16, background:T.surface, border:`1px solid ${T.border}`, marginBottom:14, textAlign:"center" }}>
          <div style={{ fontSize:11, color:T.gold, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Outfit',sans-serif", marginBottom:8 }}>
            {nomClient.trim() || "Contribuable"} · {data.commune} · {APP.year}
          </div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:58, color:T.cream, fontWeight:300, lineHeight:1 }}>
            CHF {r?.impotTotal?.toLocaleString("fr-CH")}
          </div>
          <div style={{ fontSize:12, color:T.textDim, marginTop:8, fontFamily:"'Outfit',sans-serif" }}>Impôt total estimé — recalculé depuis vos documents sources</div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginTop:20 }}>
            {[
              { l:"ICC", v: r?.impotCantonal },
              { l:"Communal", v: r?.impotCommunal },
              { l:"IFD fédéral", v: r?.impotFed },
              { l:"Fortune", v: r?.impotFor },
            ].map((x,i) => (
              <div key={i} style={{ padding:"10px 8px", borderRadius:8, background:T.card, border:`1px solid ${T.border}` }}>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, color:T.cream }}>CHF {x.v?.toLocaleString("fr-CH")}</div>
                <div style={{ fontSize:10, color:T.muted, fontFamily:"'Outfit',sans-serif", marginTop:2 }}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Optimisations */}
        {(r?.optimisations||[]).length > 0 && (
          <div className="fu2" style={{ marginBottom:14 }}>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:T.cream, fontWeight:400, marginBottom:12 }}>Optimisations identifiées</h3>
            {r.optimisations.map((o, i) => (
              <div key={i} style={{ padding:"16px", borderRadius:12, background:T.card, border:`1px solid ${T.border}`, marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:T.cream, fontFamily:"'Outfit',sans-serif" }}>{o.label}</div>
                  {o.economie > 0 && <div style={{ fontSize:14, color:T.green, fontFamily:"'Cormorant Garamond',serif", fontWeight:600 }}>−CHF {o.economie.toLocaleString("fr-CH")}/an</div>}
                </div>
                <div style={{ fontSize:12, color:T.textDim, fontFamily:"'Outfit',sans-serif", marginBottom: o.cta==="winwin" ? 10 : 0 }}>{o.detail}</div>
                {o.cta === "winwin" && (
                  <div style={{ padding:"8px 12px", borderRadius:8, background:T.goldGlow, border:`1px solid rgba(201,168,76,0.3)`, display:"inline-flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:11, color:T.gold, fontWeight:700, fontFamily:"'Outfit',sans-serif" }}>
                      Un conseiller WIN WIN Finance Group peut vous aider →
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Déductions détaillées */}
        <div className="fu3" style={{ padding:"20px", borderRadius:14, background:T.card, border:`1px solid ${T.border}`, marginBottom:14 }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:T.cream, fontWeight:400, marginBottom:14 }}>Déductions appliquées</h3>
          {[
            { l:"Pilier 3a", v: r?.detail?.pilier3a },
            { l:"Rachat LPP", v: r?.detail?.rachatLPP },
            { l:"Primes maladie (part déductible)", v: r?.detail?.primesDeductibles },
            { l:"Frais de garde", v: r?.detail?.fraisGardeDeductibles },
            { l:"Frais médicaux", v: r?.detail?.fraisMaladieDeductibles },
            { l:"Dons", v: r?.detail?.donsDeductibles },
            { l:"Frais professionnels", v: r?.detail?.fraisPro },
          ].filter(x => x.v > 0).map((x,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${T.border}` }}>
              <span style={{ fontSize:13, color:T.textDim, fontFamily:"'Outfit',sans-serif" }}>{x.l}</span>
              <span style={{ fontSize:13, color:T.cream, fontFamily:"'Cormorant Garamond',serif" }}>CHF {x.v?.toLocaleString("fr-CH")}</span>
            </div>
          ))}
          <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0 0", marginTop:4 }}>
            <span style={{ fontSize:13, fontWeight:700, color:T.text, fontFamily:"'Outfit',sans-serif" }}>Total déductions</span>
            <span style={{ fontSize:16, color:T.gold, fontFamily:"'Cormorant Garamond',serif" }}>CHF {((r?.deductionsObjectifs||0)+(r?.deductionsPersonnelles||0)).toLocaleString("fr-CH")}</span>
          </div>
        </div>

        {/* CTA WIN WIN — subtil, fin de parcours */}
        <div className="fu4" style={{ padding:"20px", borderRadius:14, background:`linear-gradient(135deg,rgba(13,27,42,0.8),rgba(201,168,76,0.06))`, border:`1px solid rgba(201,168,76,0.25)`, marginBottom:14 }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:T.cream, marginBottom:6, fontWeight:400 }}>
            Optimiser davantage votre situation ?
          </div>
          <p style={{ fontSize:13, color:T.textDim, fontFamily:"'Outfit',sans-serif", lineHeight:1.5, marginBottom:14 }}>
            WIN WIN Finance Group, partenaire JurAI Tax, propose un bilan gratuit de votre situation d'assurance et de prévoyance. Pilier 3a, subsides LAMal, couvertures — un conseiller vous contacte selon vos disponibilités.
          </p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <Btn small style={{ background:`${T.goldGlow}`, color:T.gold, border:`1px solid rgba(201,168,76,0.4)` }}>
              Demander un conseil gratuit →
            </Btn>
            <Btn small variant="ghost">Plus tard</Btn>
          </div>
        </div>

        {/* Boutons action */}
        <div className="fu5" style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <Btn style={{flex:1,minWidth:180}} onClick={() => alert("PDF DI-2025 en cours de génération…")}>
            📄 Télécharger le DI-2025
          </Btn>
          {isB2B && (
            <Btn variant="dark" onClick={() => setScreen("b2b")}>
              + Nouveau dossier
            </Btn>
          )}
          <Btn variant="ghost" onClick={() => { useStore.getState().reset(); }}>
            Recommencer
          </Btn>
        </div>

        <p style={{ marginTop:24, fontSize:9, color:T.muted, textAlign:"center", lineHeight:1.6, fontFamily:"'Outfit',sans-serif" }}>
          Édité par {APP.editor} · Partenaire: {APP.partner}, {APP.partnerFinma} ·
          Les calculs sont basés sur les informations fournies et les barèmes 2025. La décision de taxation de l'autorité fiscale fait foi.
          Chaque modification manuelle est tracée et engagée sous la responsabilité du client.
        </p>
      </div>
    </div>
  );
}
