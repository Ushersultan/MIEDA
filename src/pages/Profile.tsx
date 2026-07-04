import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  User as UserIcon, Mail, MapPin, Phone, LogOut, ArrowLeft, Loader2, Save,
  Church, ShieldCheck, HeartHandshake, Send, Clock, CheckCircle2,
} from "lucide-react";
import { eglisesGroupees, nomEglise } from "@/lib/serviteurs";

interface PriereRow {
  id: string;
  demande: string;
  est_publique: boolean;
  traitee: boolean;
  created_at: string;
}

const Profile = () => {
  const { user, loading: authLoading, profil, refreshProfil, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    full_name: "", phone: "", ville: "", pays: "", eglise_locale: "", eglise_id: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Prières
  const [demande, setDemande] = useState("");
  const [publique, setPublique] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [mesPrieres, setMesPrieres] = useState<PriereRow[]>([]);

  const groupes = eglisesGroupees();
  const isPasteur = profil?.role === "pasteur" || profil?.role === "admin";

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profil) {
      setForm({
        full_name: profil.full_name, phone: profil.phone, ville: profil.ville,
        pays: profil.pays, eglise_locale: profil.eglise_locale,
        eglise_id: profil.eglise_id ?? "",
      });
      setLoading(false);
    }
  }, [profil]);

  // Charger mes prières
  useEffect(() => {
    if (!user) return;
    supabase.from("prieres").select("id, demande, est_publique, traitee, created_at")
      .eq("auteur_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setMesPrieres(data as PriereRow[]); });
  }, [user, envoi]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: form.full_name, phone: form.phone, ville: form.ville,
      pays: form.pays, eglise_locale: form.eglise_locale,
      eglise_id: form.eglise_id || null,
      role: profil?.role ?? "membre",
    });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Enregistré ✓", description: "Votre profil a été mis à jour." });
      await refreshProfil();
    }
    setSaving(false);
  };

  const soumettrePriere = async () => {
    if (!user || !demande.trim()) return;
    setEnvoi(true);
    const { error } = await supabase.from("prieres").insert({
      nom: form.full_name || "Membre MIEDA",
      demande: demande.trim(),
      est_publique: publique,
      eglise_id: form.eglise_id || null,
      auteur_id: user.id,
    });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Prière envoyée 🙏", description: "Votre demande a été transmise." });
      setDemande(""); setPublique(false);
    }
    setEnvoi(false);
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
    label: string, icon: React.ReactNode, value: string,
    onChange: (v: string) => void, placeholder: string, type = "text"
  ) => (
    <div>
      <label className="text-sm font-medium text-foreground mb-1.5 block">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <input type={type} value={value} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--section-bg)]">
      {/* En-tête */}
      <div className="text-white py-8" style={{ background: "var(--hero-gradient)" }}>
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/" className="flex items-center gap-2 text-white/90 hover:text-white mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{form.full_name || "Mon espace"}</h1>
              <p className="text-white/80 text-sm flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl -mt-6 space-y-6 pb-16">
        {/* Bandeau Espace Pasteur */}
        {isPasteur && (
          <div className="bg-primary text-primary-foreground rounded-2xl shadow-xl p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 flex-shrink-0" />
              <div>
                <p className="font-semibold">Vous êtes pasteur / responsable</p>
                <p className="text-sm text-primary-foreground/80">
                  Accédez à la gestion de votre église.
                </p>
              </div>
            </div>
            <Link to="/espace-pasteur">
              <Button variant="secondary" size="lg">Espace Pasteur</Button>
            </Link>
          </div>
        )}

        {/* Informations */}
        <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">Informations personnelles</h2>
          <div className="space-y-4">
            {field("Nom complet", <UserIcon className="w-4 h-4" />, form.full_name, (v) => setForm({ ...form, full_name: v }), "Votre nom")}
            {field("Téléphone", <Phone className="w-4 h-4" />, form.phone, (v) => setForm({ ...form, phone: v }), "+225 ...", "tel")}
            <div className="grid grid-cols-2 gap-4">
              {field("Ville", <MapPin className="w-4 h-4" />, form.ville, (v) => setForm({ ...form, ville: v }), "Ville")}
              {field("Pays", <MapPin className="w-4 h-4" />, form.pays, (v) => setForm({ ...form, pays: v }), "Pays")}
            </div>

            {/* Église MIEDA */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Mon église MIEDA</label>
              <div className="relative">
                <Church className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={form.eglise_id}
                  onChange={(e) => setForm({ ...form, eglise_id: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                >
                  <option value="">— Sélectionnez votre église —</option>
                  {groupes.map((g) => (
                    <optgroup key={g.groupe} label={g.groupe}>
                      {g.options.map((o) => (
                        <option key={o.id} value={o.id}>{o.nom}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Rattachez-vous à votre assemblée pour recevoir ses annonces.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button onClick={handleSave} disabled={saving} size="lg" className="flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Enregistrer</>}
            </Button>
            <Button onClick={handleSignOut} variant="outline" size="lg">
              <LogOut className="w-4 h-4 mr-2" /> Se déconnecter
            </Button>
          </div>
        </div>

        {/* Demandes de prière */}
        <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <HeartHandshake className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Demande de prière</h2>
          </div>
          <textarea
            value={demande}
            onChange={(e) => setDemande(e.target.value)}
            placeholder="Partagez votre sujet de prière..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <label className="flex items-center gap-2 mt-3 text-sm text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={publique} onChange={(e) => setPublique(e.target.checked)}
              className="rounded border-input" />
            Rendre visible sur le mur de prières public (anonymisé)
          </label>
          <Button onClick={soumettrePriere} disabled={envoi || !demande.trim()} className="w-full mt-4">
            {envoi ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Envoyer ma demande</>}
          </Button>

          {/* Historique */}
          {mesPrieres.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Mes demandes ({mesPrieres.length})
              </p>
              <div className="space-y-2">
                {mesPrieres.map((p) => (
                  <div key={p.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                    {p.traitee ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">{p.demande}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(p.created_at).toLocaleDateString("fr-FR")}
                        {p.traitee ? " · Prière portée 🙏" : " · En attente"}
                        {p.est_publique ? " · Publique" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
