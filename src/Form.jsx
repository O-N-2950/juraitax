import { useState, useRef, useCallback } from "react";
import { useStore, SOURCE } from "./store";
import { T, GlobalStyles, Btn, SecHead, Field, Cards, YN, TxtIn, AmtUpload, AuditBadge, InfoBox, Divider } from "./ui";
import { COMMUNES, APP, BAREMES } from "./config";
import { calculerDeclaration } from "./engine";

// ═══════════════════════════════════════════════
//  FORMULAIRE PRINCIPAL
// ═══════════════════════════════════════════════

const SECTIONS = ["Identité", "Situation", "Revenus", "Déductions", "Fortune"];

export default function Form() {
  const store = useStore();
  const { section, setSection, setScreen, setCalcResult, getAll, get, setField, importFromDI, mode, b2bUser, clientDossier } = store;

  // Import DI précédente
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const importRef = useRef();

  // Commune autocomplete
  const [cq, setCq] = useState(get("commune") || (clientDossier?.commune || ""));
  const [showC, setShowC] = useState(false);
  const cRef = useRef();

  const acts = get("activites") || [];
  const isSal = acts.includes("salarie");
  const isInd = acts.includes("independant");
  const isRen = acts.includes("rentier");
  const enfants = get("enfants") || 0;
  const etat = get("etat_civil");
  const isDivorce = ["divorce","divorce_annee"].includes(etat);

  const filtC = COMMUNES.filter(c => cq.length === 0 || c.toLowerCase().includes(cq.toLowerCase())).slice(0, 8);

  // Si dossier B2B ouvert avec nom client, pré-remplir identité
  useState(() => {
    if (clientDossier?.nom && !get("nom")) {
      setField("nom", clientDossier.nom, SOURCE.MANUAL);
      setField("prenom", clientDossier.prenom, SOURCE.MANUAL);
      if (clientDossier.noContribuable) setField("no_contribuable", clientDossier.noContribuable, SOURCE.MANUAL);
    }
  });

  // Simulation import DI précédente
  const handleImportDI = () => {
    setImporting(true);
    setTimeout(() => {
      importFromDI({
        prenom:"André", nom:"Neukomm", naissance:"1946-03-15",
        commune:"Courgenay", adresse:"Rue des Champs 14",
        no_contribuable:"78234910", etat_civil:"veuf",
        confession:"catholique", enfants:0,
      });
      setCq("Courgenay");
      setImporting(false);
      setImported(true);
    }, 2000);
  };

  const canNext = () => {
    if (section === 0) return !!(get("prenom") && get("nom") && get("commune") && get("naissance"));
    if (section === 1) return acts.length > 0 && !!etat;
    if (section === 2) {
      if (isSal && !get("revenus_salaire")) return false;
      if (isRen && !get("revenus_avs") && !get("revenus_lpp")) return false;
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (section < SECTIONS.length - 1) {
      setSection(section + 1);
      window.scrollTo(0, 0);
    } else {
      // Calcul final
      setScreen("loading");
      const data = getAll();
      setTimeout(() => {
        const result = calculerDeclaration(data);
        setCalcResult(result);
        // B2B gratuit → résultat direct, sinon paywall
        const isFreeB2B = mode === "b2b" && b2bUser?.plan === "unlimited_free";
        setScreen(isFreeB2B ? "result" : "paywall");
      }, 2800);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Outfit',sans-serif" }}>
      <GlobalStyles />

      {/* HEADER */}
      <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:"13px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50, backdropFilter:"blur(10px)" }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:T.cream }}>
          JurAI <span style={{ color:T.gold }}>Tax</span>
        </div>
        {/* Progress */}
        <div style={{ display:"flex", gap:5, alignItems:"center" }}>
          {SECTIONS.map((s, i) => (
            <div key={i} onClick={() => i < section && setSection(i)}
              style={{ height:6, borderRadius:3, width: i === section ? 28 : 8, background: i <= section ? T.gold : T.border, transition:"all 0.3s", cursor: i < section ? "pointer" : "default" }}
              title={s}
            />
          ))}
        </div>
        <div style={{ fontSize:11, color:T.textDim }}>
          {section + 1}/{SECTIONS.length} · {SECTIONS[section]}
        </div>
      </div>

      <div style={{ maxWidth:580, margin:"0 auto", padding:"28px 20px 110px" }}>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 0 — IDENTITÉ
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {section === 0 && (
          <div>
            <SecHead icon="👤" title="Identité du contribuable" sub="Commencez par téléverser votre DI précédente — nous remplissons tout automatiquement" />

            {/* IMPORT DI PRÉCÉDENTE — HERO */}
            <div style={{ padding:"20px", borderRadius:14, background:`linear-gradient(135deg,${T.card},${T.cardHi})`, border:`1px solid ${T.border}`, marginBottom:28, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-20, right:-20, width:100, height:100, borderRadius:"50%", background:T.goldGlow, pointerEvents:"none" }} />

              <div style={{ fontSize:15, fontWeight:600, color:T.cream, fontFamily:"'Cormorant Garamond',serif", fontSize:20, marginBottom:6 }}>
                📂 Téléversez votre déclaration 2024
              </div>
              <p style={{ fontSize:12, color:T.textDim, lineHeight:1.5, marginBottom:14 }}>
                L'IA extrait votre identité, état civil, commune, composition familiale.
                <strong style={{color:T.amber}}> Les chiffres ne sont jamais repris</strong> — notre IA recalcule tout depuis vos nouvelles attestations 2025.
              </p>

              {!imported && !importing && (
                <div onClick={() => importRef.current?.click()}
                  style={{ padding:"14px", borderRadius:10, border:`2px dashed ${T.border}`, textAlign:"center", cursor:"pointer", transition:"all 0.2s" }}
                  onMouseOver={e=>{e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.background=T.goldGlow;}}
                  onMouseOut={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background="transparent";}}>
                  <div style={{fontSize:22,marginBottom:4}}>📎</div>
                  <div style={{fontSize:13,fontWeight:600,color:T.text}}>Fichier .tax ou PDF DI-2024</div>
                  <div style={{fontSize:11,color:T.muted,marginTop:2}}>Glissez ici ou cliquez pour parcourir</div>
                  <input ref={importRef} type="file" accept=".pdf,.tax,image/*" style={{display:"none"}} onChange={handleImportDI} />
                </div>
              )}
              {importing && (
                <div style={{textAlign:"center",padding:"14px"}}>
                  <div style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${T.border}`,borderTop:`2px solid ${T.gold}`,animation:"spin 0.8s linear infinite",margin:"0 auto 10px"}}/>
                  <div style={{fontSize:12,color:T.gold,animation:"pulse 1.5s infinite"}}>Extraction identité en cours… les chiffres seront recalculés</div>
                </div>
              )}
              {imported && (
                <div style={{padding:"10px 14px",borderRadius:8,background:T.greenDim,border:`1px solid rgba(52,211,153,0.25)`}}>
                  <div style={{fontSize:12,color:T.green,fontWeight:600}}>✓ Identité importée depuis DI 2024 — vérifiez et complétez ci-dessous</div>
                  <div style={{fontSize:10,color:T.muted,marginTop:2}}>Les montants de 2024 ne sont PAS repris. L'IA recalcule depuis vos documents 2025.</div>
                </div>
              )}

              <div style={{marginTop:12,fontSize:11,color:T.muted}}>
                Pas de déclaration précédente ? <button onClick={()=>{}} style={{background:"none",border:"none",color:T.gold,cursor:"pointer",fontSize:11,textDecoration:"underline"}}>Remplir manuellement</button>
              </div>
            </div>

            {/* CHAMPS IDENTITÉ */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
              <Field label="Prénom" required audit={store.getField("prenom")}>
                <TxtIn value={get("prenom")} onChange={v=>setField("prenom",v,SOURCE.USER)} placeholder="André"/>
              </Field>
              <Field label="Nom" required audit={store.getField("nom")}>
                <TxtIn value={get("nom")} onChange={v=>setField("nom",v,SOURCE.USER)} placeholder="Neukomm"/>
              </Field>
            </div>

            <Field label="Date de naissance" required audit={store.getField("naissance")}>
              <input type="date" value={get("naissance")||""}
                onChange={e=>setField("naissance",e.target.value,SOURCE.USER)}
                style={{width:"100%",padding:"13px 14px",borderRadius:10,border:`1px solid ${T.border}`,background:T.card,color:T.cream,fontSize:15,fontFamily:"'Outfit',sans-serif",outline:"none",boxSizing:"border-box"}}
                onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}
              />
            </Field>

            <Field label="Adresse (rue et n°)" audit={store.getField("adresse")}>
              <TxtIn value={get("adresse")} onChange={v=>setField("adresse",v,SOURCE.USER)} placeholder="Rue des Champs 14"/>
            </Field>

            {/* COMMUNE AUTOCOMPLETE */}
            <Field label="Commune de domicile au 31.12.2025" required hint="Détermine vos multiplicateurs communaux" audit={store.getField("commune")}>
              <div ref={cRef} style={{position:"relative"}}>
                <input value={cq} placeholder="Tapez votre commune…"
                  onChange={e=>{setCq(e.target.value);setShowC(true);if(!e.target.value)setField("commune",null,SOURCE.USER);}}
                  onFocus={()=>setShowC(true)}
                  style={{width:"100%",padding:"13px 46px 13px 14px",borderRadius:10,border:`1px solid ${get("commune")?T.gold:T.border}`,background:T.card,color:T.cream,fontSize:15,fontFamily:"'Outfit',sans-serif",outline:"none",boxSizing:"border-box"}}
                />
                {get("commune") && <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",color:T.gold,fontSize:16}}>✓</span>}
                {showC && filtC.length > 0 && (
                  <div style={{position:"absolute",top:"100%",left:0,right:0,background:T.surface,borderRadius:10,border:`1px solid ${T.border}`,boxShadow:"0 8px 24px rgba(0,0,0,0.4)",zIndex:100,maxHeight:200,overflowY:"auto",marginTop:3}}>
                    {filtC.map(c=>(
                      <div key={c} onClick={()=>{setField("commune",c,SOURCE.USER);setCq(c);setShowC(false);}}
                        style={{padding:"11px 16px",cursor:"pointer",fontSize:14,color:T.text,borderBottom:`1px solid ${T.border}`,fontFamily:"'Outfit',sans-serif"}}
                        onMouseOver={e=>e.currentTarget.style.background=T.card}
                        onMouseOut={e=>e.currentTarget.style.background="transparent"}
                      >{c}</div>
                    ))}
                  </div>
                )}
              </div>
            </Field>

            <Field label="N° de contribuable" hint="Extrait automatiquement si vous avez importé votre DI précédente" audit={store.getField("no_contribuable")}>
              <TxtIn value={get("no_contribuable")} onChange={v=>setField("no_contribuable",v,SOURCE.USER)} placeholder="Ex: 78234910"/>
            </Field>

            <Field label="Email (pour recevoir votre déclaration)">
              <TxtIn value={get("email")} onChange={v=>setField("email",v,SOURCE.USER)} placeholder="andre.neukomm@email.ch"/>
            </Field>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 1 — SITUATION
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {section === 1 && (
          <div>
            <SecHead icon="🧭" title="Votre situation" sub="État civil et activités — plusieurs sélections possibles si combinaison" />

            <Field label="État civil au 31.12.2025" required audit={store.getField("etat_civil")}>
              <Cards cols={2} options={[
                {value:"celibataire", icon:"👤", label:"Célibataire"},
                {value:"marie",       icon:"💑", label:"Marié(e) / Partenariat"},
                {value:"divorce_annee",icon:"⚖️", label:"Divorce en cours d'année", desc:"Proratisation auto"},
                {value:"divorce",    icon:"📋", label:"Divorcé(e)"},
                {value:"veuf",       icon:"🕊️", label:"Veuf / Veuve"},
                {value:"concubin",   icon:"🏠", label:"Concubinage", desc:"Imposition séparée"},
              ]} value={etat} onChange={v=>setField("etat_civil",v,SOURCE.USER)}/>
            </Field>

            {etat === "divorce_annee" && (
              <InfoBox type="warning">
                Divorce en cours d'année : notre IA gère la proratisation, le partage des déductions enfants et les pensions alimentaires dès la date de séparation.
              </InfoBox>
            )}

            <Field label="Activité(s) professionnelle(s) en 2025" required hint="Plusieurs choix possibles — ex: salarié ET indépendant simultanément" audit={store.getField("activites")}>
              <Cards cols={2} multi options={[
                {value:"salarie",    icon:"💼", label:"Salarié(e)",       desc:"Avec certificat de salaire"},
                {value:"independant",icon:"🏗️", label:"Indépendant(e)",   desc:"À votre propre compte"},
                {value:"rentier",   icon:"🌅", label:"Retraité(e)",      desc:"AVS / LPP"},
                {value:"chomage",   icon:"📭", label:"Chômage (AC)",     desc:"Indemnités reçues"},
                {value:"etudiant",  icon:"🎓", label:"Étudiant(e)",      desc:"Sans revenu principal"},
                {value:"sans",      icon:"🏡", label:"Sans activité",    desc:"Conjoint au foyer"},
              ]} value={acts} onChange={v=>setField("activites",v,SOURCE.USER)}/>
            </Field>

            {isSal && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <Field label="Voiture de société ?">
                  <YN value={get("voiture_societe")} onChange={v=>setField("voiture_societe",v,SOURCE.USER)}/>
                </Field>
                <Field label="Home office imposé ?">
                  <YN value={get("home_office")} onChange={v=>setField("home_office",v,SOURCE.USER)}/>
                </Field>
              </div>
            )}

            <Field label="Enfants à charge" hint="Mineurs ou en formation — entretien à plus de 50%" audit={store.getField("enfants")}>
              <Cards cols={5} options={[0,1,2,3,4].map(n=>({value:n,label:n===4?"4+":String(n),desc:n===0?"Aucun":n===1?"enfant":"enfants"}))}
                value={get("enfants")??null} onChange={v=>setField("enfants",v,SOURCE.USER)}/>
            </Field>

            {enfants > 0 && (
              <Field label="Modalité de garde">
                <Cards cols={1} options={[
                  {value:"moi",    label:"Garde principale chez moi (>50%)"},
                  {value:"partage",label:"Garde alternée 50/50", desc:"Déductions partagées"},
                  {value:"autre",  label:"Garde chez l'autre parent — je verse une pension"},
                ]} value={get("garde")} onChange={v=>setField("garde",v,SOURCE.USER)}/>
              </Field>
            )}

            <Field label="Confession" hint="Impôt ecclésiastique Canton du Jura" audit={store.getField("confession")}>
              <Cards cols={4} options={[
                {value:"catholique",label:"Catholique"},
                {value:"reforme",   label:"Réformé(e)"},
                {value:"autre",     label:"Autre"},
                {value:"sans",      label:"Sans"},
              ]} value={get("confession")} onChange={v=>setField("confession",v,SOURCE.USER)}/>
            </Field>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 2 — REVENUS
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {section === 2 && (
          <div>
            <SecHead icon="💰" title="Revenus 2025" sub="Téléversez chaque attestation — l'IA extrait les montants. Zéro saisie manuelle." />

            <InfoBox type="gold">
              <strong>Important :</strong> Nous recalculons tout depuis vos documents 2025. Si votre déclaration précédente comportait des erreurs, elles seront corrigées automatiquement.
            </InfoBox>

            {isSal && (
              <AmtUpload fieldKey="revenus_salaire"
                label={`Salaire brut 2025${get("nb_employeurs")>1?" — tous employeurs":""}`}
                hint="Case 11 de votre certificat de salaire · Téléversez tous vos certificats si plusieurs employeurs"
                docs="📋 Certificat(s) de salaire 2025"
              />
            )}

            {isInd && (
              <AmtUpload fieldKey="revenus_independant"
                label="Bénéfice net activité indépendante"
                hint="Décompte AVS ou bilan simplifié — recalculé depuis vos documents comptables"
                docs="📊 Bilan / décompte AVS"
              />
            )}

            {isRen && (
              <>
                <AmtUpload fieldKey="revenus_avs"
                  label="Rente AVS annuelle 2025"
                  hint="Décompte annuel de l'OCAS — envoyé automatiquement par l'AVS"
                  docs="📬 Attestation OCAS / rente AVS"
                />
                <AmtUpload fieldKey="revenus_lpp"
                  label="Rente LPP / caisse de pension annuelle"
                  hint="Attestation annuelle de votre caisse de pension"
                  docs="🏛 Attestation caisse de pension LPP"
                />
              </>
            )}

            {acts.includes("chomage") && (
              <AmtUpload fieldKey="revenus_chomage"
                label="Indemnités chômage perçues en 2025"
                hint="Attestation annuelle de votre caisse AC"
                docs="📭 Attestation caisse de chômage AC"
              />
            )}

            <AmtUpload fieldKey="revenus_titres"
              label="Revenus de la fortune (intérêts, dividendes)"
              hint="Téléversez tous vos relevés bancaires — l'IA additionne automatiquement chaque établissement"
              docs="🏦 Relevés bancaires / état des titres"
            />

            {isDivorce && (
              <AmtUpload fieldKey="pension_recue"
                label="Pension alimentaire reçue"
                hint="Imposable uniquement sous forme de rentes périodiques"
                docs="📄 Jugement / convention de divorce"
              />
            )}

            <Field label="Avez-vous des revenus locatifs (loyers perçus) ?">
              <YN value={get("has_loyers")} onChange={v=>setField("has_loyers",v,SOURCE.USER)}/>
              {get("has_loyers") && (
                <div style={{marginTop:10}}>
                  <AmtUpload fieldKey="revenus_loyers"
                    label="Total loyers bruts perçus 2025"
                    hint="Avant frais d'entretien et intérêts"
                    docs="📑 Baux / décomptes locataires"
                  />
                </div>
              )}
            </Field>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 3 — DÉDUCTIONS
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {section === 3 && (
          <div>
            <SecHead icon="🎯" title="Déductions 2025" sub="Chaque franc déduit réduit votre impôt — nous ne laissons rien passer" />

            {/* Pilier 3a */}
            <Field label={`Pilier 3a versé en 2025`} hint={`Plafond: CHF ${(isInd?BAREMES.pilier3a_independant:BAREMES.pilier3a_salarie).toLocaleString("fr-CH")} · Intégralement déductible`}>
              <YN value={get("has_pilier3a")} onChange={v=>setField("has_pilier3a",v,SOURCE.USER)}/>
              {get("has_pilier3a") === true && (
                <div style={{marginTop:10}}>
                  <AmtUpload fieldKey="pilier3a"
                    label=""
                    hint="Attestation de votre banque ou assureur — obligatoire"
                    docs="🏦 Attestation pilier 3a (banque ou assureur)"
                  />
                  {get("pilier3a") > 0 && get("pilier3a") < (isInd?BAREMES.pilier3a_independant:BAREMES.pilier3a_salarie) && (
                    <div style={{marginTop:8,padding:"10px 14px",borderRadius:8,background:T.goldGlow,border:`1px solid rgba(201,168,76,0.3)`}}>
                      <div style={{fontSize:12,color:T.gold,fontFamily:"'Outfit',sans-serif"}}>
                        💡 Reste CHF {((isInd?BAREMES.pilier3a_independant:BAREMES.pilier3a_salarie)-get("pilier3a")).toLocaleString("fr-CH")} à verser · Économie possible : ~CHF {Math.round(((isInd?BAREMES.pilier3a_independant:BAREMES.pilier3a_salarie)-get("pilier3a"))*0.28).toLocaleString("fr-CH")}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Field>

            {/* Rachat LPP */}
            <Field label="Rachat 2ème pilier (LPP) en 2025" hint="Intégralement déductible — le justificatif est obligatoire dans tous les cas">
              <YN value={get("has_rachat_lpp")} onChange={v=>setField("has_rachat_lpp",v,SOURCE.USER)}/>
              {get("has_rachat_lpp") && (
                <div style={{marginTop:10}}>
                  <AmtUpload fieldKey="rachat_lpp"
                    label=""
                    hint="Attestation de rachat délivrée par votre caisse de pension — pièce obligatoire"
                    docs="🏛 Attestation de rachat LPP (caisse de pension)"
                  />
                </div>
              )}
            </Field>

            {/* Primes maladie */}
            <AmtUpload fieldKey="primes_maladie"
              label="Primes maladie brutes payées en 2025"
              hint="Avant subside · décompte annuel de votre caisse LAMal"
              docs="🏥 Décompte annuel caisse maladie LAMal"
            />

            <Field label="Avez-vous reçu un subside ECAS en 2025 ?">
              <YN value={get("has_subside")} onChange={v=>setField("has_subside",v,SOURCE.USER)}/>
              {get("has_subside") && (
                <div style={{marginTop:10}}>
                  <TxtIn prefix="CHF" type="amount" value={get("subside_montant")} onChange={v=>setField("subside_montant",v,SOURCE.USER)} placeholder="Montant annuel reçu"/>
                </div>
              )}
            </Field>

            {enfants > 0 && (
              <AmtUpload fieldKey="frais_garde"
                label={`Frais de garde — crèche, maman de jour`}
                hint={`Max CHF ${(enfants*BAREMES.frais_garde_max).toLocaleString("fr-CH")} · enfants jusqu'à 14 ans · factures obligatoires`}
                docs="👶 Factures crèche / maman de jour"
              />
            )}

            <AmtUpload fieldKey="frais_maladie"
              label="Frais médicaux non remboursés 2025"
              hint="Médecin, hôpital, dentiste, pharmacie — part non prise en charge par l'assurance"
              docs="💊 Factures médicales / décomptes assurance"
            />

            <AmtUpload fieldKey="dons"
              label="Dons à des organisations d'utilité publique"
              hint="Max 10% du revenu net · reçus de dons obligatoires"
              docs="🎗️ Reçus de dons"
            />

            {isDivorce && (
              <AmtUpload fieldKey="pension_versee"
                label="Pension alimentaire versée à l'ex-conjoint(e)"
                hint="Déductible uniquement sous forme de rentes périodiques"
                docs="📄 Justificatifs de versement"
              />
            )}
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 4 — FORTUNE & DETTES
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {section === 4 && (
          <div>
            <SecHead icon="🏦" title="Fortune & Dettes" sub="Situation au 31 décembre 2025 — téléversez vos relevés de fin d'année" />

            <Field label="Êtes-vous propriétaire d'un bien immobilier ?">
              <YN value={get("proprietaire")} onChange={v=>setField("proprietaire",v,SOURCE.USER)}/>
            </Field>

            {get("proprietaire") && (
              <>
                <AmtUpload fieldKey="fortune_immobilier"
                  label="Valeur fiscale de l'immeuble"
                  hint="Valeur figurant sur votre avis de taxation ou estimation officielle"
                  docs="🏠 Estimation fiscale / acte de vente"
                />
                <AmtUpload fieldKey="interets_hypothecaires"
                  label="Intérêts hypothécaires payés en 2025"
                  hint="Uniquement les intérêts — pas le remboursement du capital"
                  docs="🏦 Relevé hypothécaire annuel (banque)"
                />
                <AmtUpload fieldKey="dette_hypotheque"
                  label="Solde hypothèque au 31.12.2025"
                  hint="Figurant sur votre relevé bancaire annuel"
                  docs="🏦 Relevé hypothécaire annuel au 31.12"
                />
              </>
            )}

            <AmtUpload fieldKey="comptes_bancaires"
              label="Comptes bancaires — soldes totaux au 31.12.2025"
              hint="Téléversez tous vos relevés — l'IA additionne chaque compte automatiquement"
              docs="🏦 Relevés bancaires au 31.12.2025 (tous établissements)"
            />

            <AmtUpload fieldKey="titres"
              label="Titres, actions, fonds de placement"
              hint="Valeur vénale au 31.12.2025"
              docs="📈 État des titres / relevé de portefeuille"
            />

            <AmtUpload fieldKey="assurance_vie"
              label="Valeur de rachat assurance-vie / pilier 3b"
              hint="Attestation de l'assureur au 31.12.2025"
              docs="📋 Attestation assureur au 31.12"
            />

            <Divider label="Dettes à déclarer" />

            <InfoBox type="info">
              Les intérêts sur dettes sont déductibles de vos revenus. Les dettes réduisent votre fortune imposable.
            </InfoBox>

            <AmtUpload fieldKey="dette_leasing"
              label="Leasing(s) en cours — solde total au 31.12.2025"
              hint="Solde restant sur chaque contrat de leasing"
              docs="🚗 Décompte(s) de leasing au 31.12"
            />

            <AmtUpload fieldKey="autres_dettes"
              label="Autres dettes (prêts personnels, cartes > CHF 3'000)"
              hint="Solde total au 31.12.2025"
              docs="📄 Contrats / relevés de dettes"
            />

            <Field label="Frais bancaires payés en 2025" hint="Tenue de compte, cartes, coffres">
              <TxtIn prefix="CHF" type="amount" value={get("frais_bancaires")} onChange={v=>setField("frais_bancaires",v,SOURCE.USER)} placeholder="Ex: 240"/>
            </Field>
          </div>
        )}
      </div>

      {/* NAVIGATION FIXE */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:`${T.surface}F0`, backdropFilter:"blur(12px)", borderTop:`1px solid ${T.border}`, padding:"12px 20px 24px" }}>
        <div style={{ maxWidth:580, margin:"0 auto", display:"flex", gap:10 }}>
          {section > 0 && (
            <Btn variant="ghost" onClick={() => { setSection(section-1); window.scrollTo(0,0); }}>
              ← Retour
            </Btn>
          )}
          <Btn full disabled={!canNext()} onClick={handleNext} style={{fontSize:16,padding:"16px"}}>
            {section === SECTIONS.length - 1
              ? "Calculer ma déclaration ✦"
              : `${SECTIONS[section+1]} →`}
          </Btn>
        </div>
        {!canNext() && (
          <div style={{textAlign:"center",marginTop:6,fontSize:11,color:T.muted,fontFamily:"'Outfit',sans-serif"}}>
            {section===0?"Prénom, nom, commune et date de naissance requis":section===1?"Sélectionnez votre état civil et activité":section===2?"Téléversez au moins un document de revenu":""}
          </div>
        )}
      </div>
    </div>
  );
}
