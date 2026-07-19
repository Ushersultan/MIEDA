import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface ProfilData {
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

  const loadProfil = useCallback(async (u: User | null) => {
    if (!u) { setProfil(null); return; }
    const { data } = await supabase
      .from("profiles").select("*").eq("id", u.id).single();
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
    } else {
      setProfil(null);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        // Ne pas faire d'appel Supabase directement dans le callback (deadlock)
        setTimeout(() => loadProfil(session?.user ?? null), 0);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      loadProfil(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfil]);

  const refreshProfil = useCallback(async () => {
    await loadProfil(user);
  }, [user, loadProfil]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfil(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, profil, refreshProfil, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};
