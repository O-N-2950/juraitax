// ═══════════════════════════════════════════════════════════════════════
//  tAIx — SubsidyWinWin.jsx
//  Détection subsides LAMal + pilier 3a non maximisé
//  Redirection intelligente vers WinWin Finance Group
//  Mars 2026 — PEP's Swiss SA
// ═══════════════════════════════════════════════════════════════════════
import { useState } from "react";
import { BAREMES } from "./config";

// ── Coordonnées WinWin Finance Group ─────────────────────────────────
const WINWIN = {
  nom:     "WW Finance Group Sàrl",
  adresse: "Bellevue 7",
  npa:     "2950 Courgenay",
  tel:     "032 466 11 00",
  email:   "contact@winwin.swiss",
  finma:   "FINMA F01042365",
  url:     "https://winwin.swiss",
};

// ── Calcul éligibilité subsides LAMal ────────────────────────────────
export function calculerEligibiliteSubsides({ revenuImposable, fortune, etatCivil, nbEnfants, beneficieDejaSubside }) {
  const s = BAREMES.subsides;
  const marie = ["marie","partenariat","veuf"].includes(etatCivil);
  
  // RDU = Revenu Déterminant Unifié (simplifié : revenu imposable + 1/5 fortune)
  const rdu = revenuImposable + Math.round((fortune || 0) / 5);

  // Seuils 2025 Canton Jura (à adapter selon canton)
  let seuilMax = marie || nbEnfants > 0
    ? s.adulte_max_rdu + s.supplement_famille_rdu
    : s.adulte_max_rdu;

  const eligible = rdu <= seuilMax && (fortune || 0) <= s.fortune_max;

  // Estimation du montant mensuel
  let montantMensuel = 0;
  if (eligible) {
    if (rdu <= 18000) montantMensuel = s.adulte_montant_max;
    else if (rdu <= 22000) montantMensuel = Math.round(s.adulte_montant_max * 0.7);
    else montantMensuel = Math.round(s.adulte_montant_max * 0.4);
    if (nbEnfants > 0) montantMensuel += nbEnfants * s.enfant_montant;
  }

  return {
    eligible,
    rdu,
    seuilMax,
    montantMensuel,
    montantAnnuel: montantMensuel * 12,
    beneficieDejaSubside: beneficieDejaSubside === true,
    actionRequise: eligible && !beneficieDejaSubside,
  };
}

// ── Vérification 3a non maximisé ──────────────────────────────────────
export function verifier3aOptimisation({ pilier3a, activites, revenuImposable }) {
  const isIndep = (activites || []).includes("independant");
  const max3a = isIndep ? BAREMES.pilier3a_independant : BAREMES.pilier3a_salarie;
  const manquant = Math.max(0, max3a - (pilier3a || 0));
  const economieImpot = Math.round(manquant * 0.18); // ~18% d'économie moyenne JU

  return {
    max3a,
    verse: pilier3a || 0,
    manquant,
    pctUtilise: max3a > 0 ? Math.round(((pilier3a || 0) / max3a) * 100) : 0,
    economieImpot,
    actionRequise: manquant > 500,
  };
}

// ── Composant principal ───────────────────────────────────────────────
export function SubsidyWinWinBlock({ data, result, lang }) {
  const [subsidySent, setSubsidySent] = useState(false);
  const [optim3aSent, setOptim3aSent] = useState(false);
  const [showSubsidy, setShowSubsidy] = useState(false);
  const [showOptim3a, setShowOptim3a] = useState(false);

  const subsidy = calculerEligibiliteSubsides({
    revenuImposable: result?.revenuImposable || data?.rev_salaire || 0,
    fortune:         data?.solde_bancaire || 0,
    etatCivil:       data?.etat_civil || "celibataire",
    nbEnfants:       data?.enfants || 0,
    beneficieDejaSubside: data?.beneficie_subside,
  });

  const optim3a = verifier3aOptimisation({
    pilier3a:       data?.pilier_3a || 0,
    activites:      data?.activites || [],
    revenuImposable: result?.revenuImposable || 0,
  });

  const T = {
    fr: {
      subside_titre:    "Vous pourriez bénéficier de subsides LAMal",
      subside_message:  `D'après votre déclaration (RDU estimé : CHF ${subsidy.rdu?.toLocaleString("fr-CH")}), vous semblez éligible à une réduction de prime de maladie de l'ordre de CHF ${subsidy.montantMensuel}/mois (environ CHF ${subsidy.montantAnnuel?.toLocaleString("fr-CH")}/an).`,
      subside_notice:   "⚠️ tAIx n'est pas habilité à traiter les demandes de subsides (hors périmètre FINMA). Nous vous conseillons fortement de contacter notre partenaire agréé :",
      subside_cta:      "Transférer ma demande à WinWin →",
      subside_already:  "✓ Demande transmise à WinWin Finance Group",
      subside_winwin:   "En tant que client sous gestion WinWin Finance Group, le suivi de vos subsides LAMal est inclus dans la prestation de gestion de vos assurances.",
      optim3a_titre:    "Pilier 3a non maximisé — économie fiscale manquée",
      optim3a_msg:      (v, m, e) => `Vous avez versé CHF ${v.toLocaleString("fr-CH")} sur un maximum de CHF ${m.toLocaleString("fr-CH")}. Il vous reste CHF ${(m-v).toLocaleString("fr-CH")} que vous pourriez encore verser pour économiser ~CHF ${e.toLocaleString("fr-CH")} d'impôts.`,
      optim3a_cta:      "WinWin peut m'aider à optimiser mon 3a →",
      optim3a_sent:     "✓ Demande transmise à WinWin Finance Group",
      contact_finma:    "Autorisations FINMA",
    },
    de: {
      subside_titre:    "Sie könnten Prämienverbilligung erhalten",
      subside_message:  `Gemäss Ihrer Erklärung (geschätztes RDU: CHF ${subsidy.rdu?.toLocaleString("fr-CH")}) scheinen Sie Anspruch auf eine Prämienverbilligung von ca. CHF ${subsidy.montantMensuel}/Monat zu haben.`,
      subside_notice:   "⚠️ tAIx ist nicht berechtigt, Subventionsanträge zu bearbeiten (ausserhalb des FINMA-Bereichs). Wir empfehlen dringend, unseren zugelassenen Partner zu kontaktieren:",
      subside_cta:      "Meinen Antrag an WinWin weiterleiten →",
      subside_already:  "✓ Antrag an WinWin Finance Group weitergeleitet",
      subside_winwin:   "Als WinWin-Finance-Group-Kunde ist die Betreuung Ihrer Prämienverbilligung in der Versicherungsverwaltung inbegriffen.",
      optim3a_titre:    "Säule 3a nicht maximiert — entgangene Steuerersparnis",
      optim3a_msg:      (v, m, e) => `Sie haben CHF ${v.toLocaleString("fr-CH")} von maximal CHF ${m.toLocaleString("fr-CH")} eingezahlt. CHF ${(m-v).toLocaleString("fr-CH")} könnten Sie noch einzahlen und ~CHF ${e.toLocaleString("fr-CH")} Steuern sparen.`,
      optim3a_cta:      "WinWin kann mir bei der Optimierung von 3a helfen →",
      optim3a_sent:     "✓ Anfrage an WinWin Finance Group weitergeleitet",
      contact_finma:    "FINMA-Zulassungen",
    },
    it: {
      subside_titre:    "Potete beneficiare di sussidi LAMal",
      subside_message:  `Secondo la vostra dichiarazione (RDU stimato: CHF ${subsidy.rdu?.toLocaleString("fr-CH")}), sembrate idonei a una riduzione del premio malattia di circa CHF ${subsidy.montantMensuel}/mese.`,
      subside_notice:   "⚠️ tAIx non è abilitato a trattare le domande di sussidio (fuori dall'ambito FINMA). Vi consigliamo vivamente di contattare il nostro partner autorizzato:",
      subside_cta:      "Trasmetti la mia richiesta a WinWin →",
      subside_already:  "✓ Richiesta trasmessa a WinWin Finance Group",
      subside_winwin:   "Come cliente WinWin Finance Group, la gestione dei vostri sussidi LAMal è inclusa nel servizio di gestione assicurativa.",
      optim3a_titre:    "Pilastro 3a non massimizzato — risparmio fiscale mancato",
      optim3a_msg:      (v, m, e) => `Avete versato CHF ${v.toLocaleString("fr-CH")} su un massimo di CHF ${m.toLocaleString("fr-CH")}. Potreste ancora versare CHF ${(m-v).toLocaleString("fr-CH")} e risparmiare ~CHF ${e.toLocaleString("fr-CH")} di imposte.`,
      optim3a_cta:      "WinWin può aiutarmi a ottimizzare il 3° pilastro →",
      optim3a_sent:     "✓ Richiesta trasmessa a WinWin Finance Group",
      contact_finma:    "Autorizzazioni FINMA",
    },
    en: {
      subside_titre:    "You may be eligible for health insurance subsidies",
      subside_message:  `Based on your tax return (estimated RDU: CHF ${subsidy.rdu?.toLocaleString("fr-CH")}), you appear eligible for a premium reduction of approx. CHF ${subsidy.montantMensuel}/month (CHF ${subsidy.montantAnnuel?.toLocaleString("fr-CH")}/year).`,
      subside_notice:   "⚠️ tAIx is not authorised to process subsidy applications (outside FINMA scope). We strongly recommend contacting our approved partner:",
      subside_cta:      "Forward my request to WinWin →",
      subside_already:  "✓ Request sent to WinWin Finance Group",
      subside_winwin:   "As a WinWin Finance Group client, LAMal subsidy management is included in your insurance management service.",
      optim3a_titre:    "Pillar 3a not maximised — missed tax saving",
      optim3a_msg:      (v, m, e) => `You contributed CHF ${v.toLocaleString("fr-CH")} out of a maximum CHF ${m.toLocaleString("fr-CH")}. You could still contribute CHF ${(m-v).toLocaleString("fr-CH")} and save ~CHF ${e.toLocaleString("fr-CH")} in taxes.`,
      optim3a_cta:      "WinWin can help me optimise my pillar 3a →",
      optim3a_sent:     "✓ Request sent to WinWin Finance Group",
      contact_finma:    "FINMA authorisations",
    },
  };
  const t = T[lang] || T.fr;

  const S = {
    card: { padding:"20px", borderRadius:14, marginBottom:14 },
    gold: "#C9A84C",
    green: "#34D399",
    blue: "#60A5FA",
    muted: "#5A7A99",
    cream: "#E8EDF2",
    btn: {
      display:"flex", alignItems:"center", gap:8, padding:"12px 18px",
      borderRadius:10, fontFamily:"'Outfit',sans-serif", fontSize:13,
      fontWeight:700, cursor:"pointer", border:"none", transition:"all 0.2s",
    },
  };

  function handleSendSubsidy() {
    // Prépare le mailto avec les données du contribuable
    const sujet = encodeURIComponent(`[tAIx] Demande subsides LAMal — ${data?.prenom || ""} ${data?.nom || ""}`);
    const corps = encodeURIComponent(
      `Bonjour WinWin Finance Group,\n\n` +
      `Je souhaite bénéficier de vos services pour une demande de subsides LAMal.\n\n` +
      `Coordonnées :\n` +
      `Nom : ${data?.prenom || ""} ${data?.nom || ""}\n` +
      `Canton : ${data?.canton || "JU"}\n` +
      `RDU estimé : CHF ${subsidy.rdu?.toLocaleString("fr-CH")}\n` +
      `Subsides estimés : CHF ${subsidy.montantMensuel}/mois\n\n` +
      `Déclaration établie via tAIx.ch\n` +
      `Cordialement`
    );
    window.open(`mailto:${WINWIN.email}?subject=${sujet}&body=${corps}`);
    setSubsidySent(true);
  }

  function handleSendOptim3a() {
    const sujet = encodeURIComponent(`[tAIx] Optimisation pilier 3a — ${data?.prenom || ""} ${data?.nom || ""}`);
    const corps = encodeURIComponent(
      `Bonjour WinWin Finance Group,\n\n` +
      `Je souhaite optimiser mon pilier 3a.\n\n` +
      `Situation actuelle :\n` +
      `Versé en 2025 : CHF ${optim3a.verse.toLocaleString("fr-CH")}\n` +
      `Maximum possible : CHF ${optim3a.max3a.toLocaleString("fr-CH")}\n` +
      `Économie fiscale potentielle : CHF ${optim3a.economieImpot.toLocaleString("fr-CH")}\n\n` +
      `Déclaration établie via tAIx.ch\n` +
      `Cordialement`
    );
    window.open(`mailto:${WINWIN.email}?subject=${sujet}&body=${corps}`);
    setOptim3aSent(true);
  }

  // Bloc carte WinWin Contact
  const WinWinCard = () => (
    <div style={{
      marginTop:12, padding:"14px 16px", borderRadius:10,
      background:"rgba(201,168,76,0.05)", border:"1px solid rgba(201,168,76,0.2)",
    }}>
      <div style={{ fontSize:13, fontWeight:700, color:S.gold,
                    fontFamily:"'Outfit',sans-serif", marginBottom:6 }}>
        🤝 {WINWIN.nom}
      </div>
      <div style={{ fontSize:11, color:S.muted, fontFamily:"'Outfit',sans-serif",
                    lineHeight:1.8 }}>
        <div>📍 {WINWIN.adresse}, {WINWIN.npa}</div>
        <div>📞 <a href={`tel:+41${WINWIN.tel.replace(/\s/g,"")}`} style={{color:S.blue, textDecoration:"none"}}>{WINWIN.tel}</a></div>
        <div>✉️ <a href={`mailto:${WINWIN.email}`} style={{color:S.blue, textDecoration:"none"}}>{WINWIN.email}</a></div>
        <div style={{marginTop:4, fontSize:10, color:"rgba(201,168,76,0.6)"}}>🛡️ {t.contact_finma} {WINWIN.finma}</div>
      </div>
    </div>
  );

  const hasContent = (subsidy.actionRequise) || (optim3a.actionRequise);
  if (!hasContent) return null;

  return (
    <div style={{ marginBottom:14 }}>

      {/* ── SUBSIDES LAMal ─── */}
      {subsidy.actionRequise && (
        <div style={{...S.card,
          background:"linear-gradient(135deg,rgba(96,165,250,0.06),rgba(13,27,42,0.9))",
          border:"1px solid rgba(96,165,250,0.25)"}}>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:19,
                          color:S.cream, fontWeight:400 }}>
              💊 {t.subside_titre}
            </div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18,
                          color:S.blue, fontWeight:600, whiteSpace:"nowrap", marginLeft:12 }}>
              ~CHF {subsidy.montantAnnuel?.toLocaleString("fr-CH")}/an
            </div>
          </div>

          <p style={{ fontSize:13, color:"#8B95A7", fontFamily:"'Outfit',sans-serif",
                      lineHeight:1.5, marginBottom:8 }}>
            {t.subside_message}
          </p>

          <p style={{ fontSize:12, color:"rgba(251,191,36,0.9)", fontFamily:"'Outfit',sans-serif",
                      lineHeight:1.5, marginBottom:12, padding:"8px 12px",
                      background:"rgba(251,191,36,0.06)", borderRadius:8,
                      border:"1px solid rgba(251,191,36,0.2)" }}>
            {t.subside_notice}
          </p>

          <p style={{ fontSize:12, color:S.blue, fontFamily:"'Outfit',sans-serif",
                      lineHeight:1.5, marginBottom:12, fontStyle:"italic" }}>
            {t.subside_winwin}
          </p>

          <WinWinCard />

          <div style={{ display:"flex", gap:8, marginTop:14, flexWrap:"wrap" }}>
            {!subsidySent ? (
              <button style={{...S.btn, background:"rgba(96,165,250,0.15)",
                              color:S.blue, border:"1px solid rgba(96,165,250,0.3)"}}
                      onClick={handleSendSubsidy}>
                📧 {t.subside_cta}
              </button>
            ) : (
              <div style={{ fontSize:12, color:S.green, fontFamily:"'Outfit',sans-serif",
                            display:"flex", alignItems:"center", gap:6 }}>
                ✅ {t.subside_already}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PILIER 3A NON MAXIMISÉ ─── */}
      {optim3a.actionRequise && (
        <div style={{...S.card,
          background:"linear-gradient(135deg,rgba(201,168,76,0.06),rgba(13,27,42,0.9))",
          border:"1px solid rgba(201,168,76,0.25)"}}>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:19,
                          color:S.cream, fontWeight:400 }}>
              💰 {t.optim3a_titre}
            </div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18,
                          color:S.gold, fontWeight:600, whiteSpace:"nowrap", marginLeft:12 }}>
              −CHF {optim3a.economieImpot?.toLocaleString("fr-CH")}
            </div>
          </div>

          {/* Barre de progression 3a */}
          <div style={{ marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:11, color:S.muted, fontFamily:"'Outfit',sans-serif" }}>
                CHF {optim3a.verse.toLocaleString("fr-CH")} versé / CHF {optim3a.max3a.toLocaleString("fr-CH")} max
              </span>
              <span style={{ fontSize:11, color:S.gold, fontFamily:"'Outfit',sans-serif",
                              fontWeight:700 }}>
                {optim3a.pctUtilise}%
              </span>
            </div>
            <div style={{ height:6, borderRadius:99, background:"rgba(255,255,255,0.08)" }}>
              <div style={{ height:"100%", borderRadius:99, width:`${optim3a.pctUtilise}%`,
                            background:`linear-gradient(90deg, #C9A84C, #FBBF24)`,
                            transition:"width 1s ease" }}/>
            </div>
          </div>

          <p style={{ fontSize:13, color:"#8B95A7", fontFamily:"'Outfit',sans-serif",
                      lineHeight:1.5, marginBottom:12 }}>
            {t.optim3a_msg(optim3a.verse, optim3a.max3a, optim3a.economieImpot)}
          </p>

          <WinWinCard />

          <div style={{ display:"flex", gap:8, marginTop:14 }}>
            {!optim3aSent ? (
              <button style={{...S.btn, background:"rgba(201,168,76,0.12)",
                              color:S.gold, border:"1px solid rgba(201,168,76,0.3)"}}
                      onClick={handleSendOptim3a}>
                📧 {t.optim3a_cta}
              </button>
            ) : (
              <div style={{ fontSize:12, color:S.green, fontFamily:"'Outfit',sans-serif",
                            display:"flex", alignItems:"center", gap:6 }}>
                ✅ {t.optim3a_sent}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Question "bénéficiez-vous de subsides ?" à poser dans le formulaire ──
// À intégrer dans le FiscalAdvisor (question supplémentaire)
export const SUBSIDE_QUESTION = {
  id: "q_subside",
  type: "oui_non",
  question: "Bénéficiez-vous déjà de subsides pour votre caisse maladie (réduction de prime LAMal) ?",
  explication: "Si votre revenu est sous un certain seuil, vous avez droit à une réduction automatique de prime. Beaucoup de personnes éligibles ne les demandent pas.",
  impact_estime: "jusqu'à CHF 2'700/an",
  deduction_cible: "beneficie_subside",
  priorite: 1,
};
