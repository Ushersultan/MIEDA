import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { traductions, type Langue } from "@/data/traductions";

interface LangContextType {
  lang: Langue;
  setLang: (l: Langue) => void;
  t: (cle: string) => string;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

const LANG_KEY = "mieda-lang";

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Langue>(() => {
    try {
      const sauvee = localStorage.getItem(LANG_KEY);
      if (sauvee === "fr" || sauvee === "en") return sauvee;
      // Détection navigateur au premier passage
      return navigator.language?.startsWith("en") ? "en" : "fr";
    } catch {
      return "fr";
    }
  });

  const setLang = useCallback((l: Langue) => {
    setLangState(l);
    try { localStorage.setItem(LANG_KEY, l); } catch { /* noop */ }
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (cle: string): string => traductions[lang][cle] ?? traductions.fr[cle] ?? cle,
    [lang]
  );

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang doit être utilisé dans LanguageProvider");
  return ctx;
};
