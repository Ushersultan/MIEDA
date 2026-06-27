import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User as UserIcon, MapPin, ArrowLeft, Loader2 } from "lucide-react";
import logo from "@/assets/mieda-logo.png";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [ville, setVille] = useState("");
  const [pays, setPays] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Redirige si déjà connecté
  useEffect(() => {
    if (user) navigate("/profil");
  }, [user, navigate]);

  const handleSubmit = async () => {
    if (!email || !password) {
      toast({ title: "Champs requis", description: "Email et mot de passe sont obligatoires.", variant: "destructive" });
      return;
    }
    if (mode === "signup" && !fullName) {
      toast({ title: "Nom requis", description: "Veuillez entrer votre nom complet.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Bienvenue ! 🙏", description: "Connexion réussie." });
        navigate("/profil");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, ville, pays },
          },
        });
        if (error) throw error;

        // Crée le profil dans la table profiles
        if (data.user) {
          await supabase.from("profiles").insert({
            id: data.user.id,
            full_name: fullName,
            ville,
            pays,
            role: "membre",
          });
        }

        toast({
          title: "Compte créé ! 🎉",
          description: "Vérifiez votre email pour confirmer votre inscription.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message === "Invalid login credentials"
          ? "Email ou mot de passe incorrect."
          : err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-section-bg px-4 py-12"
         style={{ background: "var(--hero-gradient)" }}>
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 text-white/90 hover:text-white mb-6 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        <div className="bg-card rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="MIEDA" className="h-16 w-auto mb-3" />
            <h1 className="text-2xl font-bold text-foreground">
              {mode === "login" ? "Connexion" : "Créer un compte"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              {mode === "login"
                ? "Accédez à votre espace membre MIEDA"
                : "Rejoignez la famille MIEDA"}
            </p>
          </div>

          <div className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Ville"
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Pays"
                  value={pays}
                  onChange={(e) => setPays(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              size="lg"
              className="w-full"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === "login" ? (
                "Se connecter"
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Pas encore de compte ?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-primary font-medium hover:underline"
                >
                  Créer un compte
                </button>
              </>
            ) : (
              <>
                Déjà membre ?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-primary font-medium hover:underline"
                >
                  Se connecter
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
