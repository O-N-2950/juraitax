import { useStore } from "./store";
import { Welcome, CourrierScreen, B2BLogin, Loading, Paywall, Result, SubscriptionOffer } from "./screens";
import { ChecklistScreen } from "./ChecklistDocs";
import Form from "./Form";
import { useEffect } from "react";
import { detectCantonConfig, applyCantonTheme } from "./cantonDetector";

export default function App() {
  const screen        = useStore(s => s.screen);
  const setCantonConfig = useStore(s => s.setCantonConfig);

  // ── Détection canton + langue au démarrage ───────────────
  useEffect(() => {
    const cfg = detectCantonConfig();
    setCantonConfig(cfg);
    applyCantonTheme(cfg.accent);
    // Titre de l'onglet dynamique
    document.title = `${cfg.appName} — Déclaration fiscale 2025`;
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [screen]);

  switch(screen) {
    case "welcome":  return <Welcome />;
    case "courrier": return <CourrierScreen />;
    case "b2b":      return <B2BLogin />;
    case "checklist": return <ChecklistScreen />;
    case "form":     return <Form />;
    case "loading":  return <Loading />;
    case "paywall":  return <Paywall />;
    case "result":   return <Result />;
    case "subscription": return <SubscriptionOffer />;
    default:         return <Welcome />;
  }
}
