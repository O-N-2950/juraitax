import { useStore } from "./store";
import { Welcome, CourrierScreen, B2BLogin, Loading, Paywall, Result } from "./screens";
import Form from "./Form";
import { useEffect } from "react";

export default function App() {
  const screen = useStore(s => s.screen);
  useEffect(() => { window.scrollTo(0, 0); }, [screen]);
  switch(screen) {
    case "welcome":  return <Welcome />;
    case "courrier": return <CourrierScreen />;
    case "b2b":      return <B2BLogin />;
    case "form":     return <Form />;
    case "loading":  return <Loading />;
    case "paywall":  return <Paywall />;
    case "result":   return <Result />;
    default:         return <Welcome />;
  }
}
