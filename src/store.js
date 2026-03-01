import { create } from "zustand";

export const SOURCE = {
  AI: "ai",
  USER: "user",
  MANUAL: "manual",
  IMPORTED: "imported",
};

export const useStore = create((set, get) => ({
  // ── Mode & Auth ──────────────────────────────────────────
  mode: "b2c",
  b2bUser: null,
  clientDossier: null,

  // ── Navigation ───────────────────────────────────────────
  screen: "welcome",
  section: 0,

  // ── 🌍 Langue & Canton (détectés depuis domaine) ─────────
  lang: "fr",
  canton: "JU",
  cantonConfig: null,

  // ── Formulaire ───────────────────────────────────────────
  fields: {},
  calcResult: null,
  clientCount: 47,

  // ── Actions ──────────────────────────────────────────────
  setScreen: (screen) => set({ screen }),
  setSection: (s) => set({ section: s }),
  setMode: (mode, user) => set({ mode, b2bUser: user || null }),
  setLang: (lang) => set({ lang }),
  setCantonConfig: (cfg) => set({
    canton: cfg.canton,
    cantonConfig: cfg,
    lang: cfg.lang,
  }),

  setField: (key, value, source = SOURCE.MANUAL) => {
    set((state) => ({
      fields: {
        ...state.fields,
        [key]: {
          value,
          source,
          modifiedAt: new Date().toISOString(),
          modifiedBy: source === SOURCE.USER ? "client" : "ai",
        },
      },
    }));
  },

  importFromDI: (extracted) => {
    const identiteKeys = [
      "prenom","nom","naissance","commune","adresse",
      "no_contribuable","etat_civil","confession","enfants",
    ];
    set((state) => {
      const newFields = { ...state.fields };
      for (const key of identiteKeys) {
        if (extracted[key] !== undefined) {
          newFields[key] = {
            value: extracted[key],
            source: SOURCE.IMPORTED,
            modifiedAt: new Date().toISOString(),
            modifiedBy: "ai",
            note: "Identité uniquement — chiffres recalculés depuis sources 2025",
          };
        }
      }
      return { fields: newFields };
    });
  },

  importFromDoc: (key, value, docName) => {
    set((state) => ({
      fields: {
        ...state.fields,
        [key]: {
          value,
          source: SOURCE.AI,
          modifiedAt: new Date().toISOString(),
          modifiedBy: "ai",
          docSource: docName || "document uploadé",
        },
      },
    }));
  },

  get: (key) => get().fields[key]?.value ?? null,
  getField: (key) => get().fields[key] ?? null,
  getAll: () => {
    const fields = get().fields;
    return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v.value]));
  },

  setCalcResult: (result) => set({ calcResult: result }),

  // ── Abonnement CHF 49/an ─────────────────────────────────
  subscriber: null,  // { email, nom, lang, canton, identite, subscribedAt }

  setSubscriber: (sub) => set({ subscriber: sub }),
  
  saveSubscriberProfile: () => {
    const { fields, lang, cantonConfig } = get();
    const identiteKeys = ["prenom","nom","naissance","commune","adresse",
      "no_contribuable","etat_civil","confession","enfants","nb_enfants"];
    const identite = {};
    for (const k of identiteKeys) {
      if (fields[k]?.value) identite[k] = fields[k].value;
    }
    const sub = {
      email: null, // set at subscription time
      nom: (fields.prenom?.value || "") + " " + (fields.nom?.value || ""),
      lang,
      canton: cantonConfig?.canton || "JU",
      identite,
      subscribedAt: new Date().toISOString(),
      nextReminderDates: [
        new Date(new Date().getFullYear() + 1, 2, 1).toISOString(),  // 1 mars
        new Date(new Date().getFullYear() + 1, 2, 20).toISOString(), // 20 mars
        new Date(new Date().getFullYear() + 1, 3, 5).toISOString(),  // 5 avril
      ]
    };
    set({ subscriber: sub });
    return sub;
  },

  reset: () => set({
    screen: "welcome", section: 0, fields: {}, calcResult: null,
  }),
}));
