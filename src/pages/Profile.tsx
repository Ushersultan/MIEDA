import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User as UserIcon, Mail, MapPin, Phone, LogOut, ArrowLeft, Loader2, Save } from "lucide-react";
import logo from "@/assets/mieda-logo.png";

interface ProfileData {
  full_name: string;
  phone: string;
  ville: string;
  pays: string;
  eglise_locale: string;
  role: string;
}

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    phone: "",
    ville: "",
    pays: "",
    eglise_locale: "",
    role: "membre",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Redirige si non connecté
  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  // Charge le profil
  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name ?? "",
          phone: data.phone ?? "",
          ville: data.ville ?? "",
          pays: data.pays ?? "",
          eglise_locale: data.eglise_locale ?? "",
          role: data.role ?? "membre",
        });
      }
      setLoading(false);
    };
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: profile.full_name,
        phone: profile.phone,
        ville: profile.ville,
        pays: profile.pays,
        eglise_locale: profile.eglise_locale,
        role: profile.role,
      });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Enregistré ✓", description: "Votre profil a été mis à jour." });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "À bientôt ! 🙏", description: "Vous êtes déconnecté." });
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const field = (
    label: string,
    icon: React.ReactNode,
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    type = "text"
  ) => (
    <div>
      <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-section-bg">
      {/* Header */}
      <div className="text-white py-8" style={{ background: "var(--hero-gradient)" }}>
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/" className="flex items-center gap-2 text-white/90 hover:text-white mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.full_name || "Mon profil"}</h1>
              <p className="text-white/80 text-sm flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="container mx-auto px-4 max-w-3xl -mt-6">
        <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">Informations personnelles</h2>

          <div className="space-y-4">
            {field("Nom complet", <UserIcon className="w-4 h-4" />, profile.full_name, (v) => setProfile({ ...profile, full_name: v }), "Votre nom")}
            {field("Téléphone", <Phone className="w-4 h-4" />, profile.phone, (v) => setProfile({ ...profile, phone: v }), "+225 ...", "tel")}
            <div className="grid grid-cols-2 gap-4">
              {field("Ville", <MapPin className="w-4 h-4" />, profile.ville, (v) => setProfile({ ...profile, ville: v }), "Ville")}
              {field("Pays", <MapPin className="w-4 h-4" />, profile.pays, (v) => setProfile({ ...profile, pays: v }), "Pays")}
            </div>
            {field("Église locale", <MapPin className="w-4 h-4" />, profile.eglise_locale, (v) => setProfile({ ...profile, eglise_locale: v }), "Votre assemblée")}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button onClick={handleSave} disabled={saving} size="lg" className="flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Enregistrer</>}
            </Button>
            <Button onClick={handleSignOut} variant="outline" size="lg">
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
