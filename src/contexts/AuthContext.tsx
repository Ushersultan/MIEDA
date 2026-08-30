import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface ProfilData {
  photo_url: string;
  full_name: string;
  phone: string;
  ville: string;
  pays: string;
  eglise_locale: string;
  eglise_id: string | null;
  role: string; // 'membre' | 'pasteur' | 'prophete' | 'admin'
  profession: string;
  quartier: string;
  bio: string;
  date_naissance: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profil: ProfilData | null;
  refreshProfil: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profil, setProfil] = useState<ProfilData | null>(null);
  const [loading, setLoading] = useState(true);

  // Mémorise l'utilisateur déjà chargé : évite de recharger le profil
  // (et de le passer à null) à chaque rafraîchissement de jeton ou
  // retour de focus sur l'onglet — cause du « je perds ma session admin ».
  const idCharge = useRef<string | null>(null);

  const loadProfil = useCallback(async (u: User | null) => {
    if (!u) { setProfil(null); return; }
    try {
      const { data } = await supabase
        .from("profiles").select("*").eq("id", u.id).maybeSingle();
      if (data) {
        setProfil({
          photo_url: data.photo_url ?? "",
          full_name: data.full_name ?? "",
          phone: data.phone ?? "",
          ville: data.ville ?? "",
          pays: data.pays ?? "",
          eglise_locale: data.eglise_locale ?? "",
          eglise_id: data.eglise_id ?? null,
          role: data.role ?? "membre",
          profession: data.profession ?? "",
          quartier: data.quartier ?? "",
          bio: data.bio ?? "",
          date_naissance: data.date_naissance ?? "",
        });
      }
      // Si data est absent (souci transitoire), on garde le profil
      // précédent au lieu de le vider — pas de perte d'accès.
    } catch {
      /* erreur réseau transitoire : conserver le profil courant */
    }
  }, []);

  useEffect(() => {
    let monte = true;

    const traiter = async (s: Session | null) => {
      if (!monte) return;
      setSession(s);
      const u = s?.user ?? null;
      setUser(u);
      const nouvelId = u?.id ?? null;
      // Ne jamais conserver le profil (et donc les droits) du compte précédent
      // pendant le chargement d'une nouvelle session.
      if (nouvelId !== idCharge.current) {
        setLoading(true);
        setProfil(null);
        idCharge.current = nouvelId;
        await loadProfil(u);
      }
      if (monte) setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => traiter(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // Différé pour éviter tout blocage dans le callback Supabase
        setTimeout(() => traiter(session), 0);
      }
    );

    return () => { monte = false; subscription.unsubscribe(); };
  }, [loadProfil]);

  // Récupère aussi les changements de rôle effectués par un administrateur
  // lorsque l'utilisateur revient sur l'application.
  useEffect(() => {
    if (!user) return;
    const rafraichir = () => {
      if (document.visibilityState === "visible") loadProfil(user);
    };
    document.addEventListener("visibilitychange", rafraichir);
    window.addEventListener("focus", rafraichir);
    return () => {
      document.removeEventListener("visibilitychange", rafraichir);
      window.removeEventListener("focus", rafraichir);
    };
  }, [user, loadProfil]);

  const refreshProfil = useCallback(async () => {
    await loadProfil(user);
  }, [user, loadProfil]);

  const signOut = async () => {
    await supabase.auth.signOut();
    idCharge.current = null;
    setProfil(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, profil, refreshProfil, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
};
