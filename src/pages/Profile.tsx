import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CLE_CODE_PENDING, tenterActivationCode } from "@/pages/Auth";
import {
  User as UserIcon, Mail, MapPin, Phone, LogOut, ArrowLeft, Loader2, Save,
  Church, ShieldCheck, HeartHandshake, Send, Clock, CheckCircle2, Camera,
  Megaphone, Users, Heart, ExternalLink, Calendar, XCircle, Sparkles, KeyRound,
} from "lucide-react";
import { eglisesGroupees, nomEglise } from "@/lib/serviteurs";
import { departements } from "@/data/departements";

// ── Types ──
interface PriereRow { id: string; demande: string; est_publique: boolean; traitee: boolean; created_at: string; }
interface AnnonceRow { id: string; titre: string; contenu: string; date_evenement: string | null; created_at: string; }
interface DemandeDept { id: string; departement: string; statut: string; created_at: string; }

type Tab = "profil" | "eglise" | "departements" | "prieres" | "soutenir";

const PAYPAL_EMAIL = "mieda.diaspora@gmail.com";
const buildPayPalUrl = (amount: string, description: string) => {
  const params = new URLSearchParams({
    cmd: "_donations", business: PAYPAL_EMAIL, item_name: description,
    amount, currency_code: "USD",
    return: window.location.href, cancel_return: window.location.href,
  });
  return `https://www.paypal.com/donate?${params.toString()}`;
};

const getInitials = (nom: string) => {
  const parts = nom.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "M";
};

const Profile = () => {
  const { user, loading: authLoading, profil, refreshProfil, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>("profil");
  const [form, setForm] = useState({
    full_name: "", phone: "", ville: "", pays: "", eglise_id: "", photo_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Prières
  const [demande, setDemande] = useState("");
  const [publique, setPublique] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [mesPrieres, setMesPrieres] = useState<PriereRow[]>([]);

  // Église / annonces
  const [annonces, setAnnonces] = useState<AnnonceRow[]>([]);

  // Départements
  const [mesDemandes, setMesDemandes] = useState<DemandeDept[]>([]);
  const [deptChoisi, setDeptChoisi] = useState<string | null>(null);
  const [messageDept, setMessageDept] = useState("");
  const [envoiDept, setEnvoiDept] = useState(false);

  // Code serviteur
  const [codeServ, setCodeServ] = useState("");
  const [activation, setActivation] = useState(false);

  // Soutien
  const [montant, setMontant] = useState("");

  const isPasteur = profil?.role === "pasteur" || profil?.role === "admin";
  const egliseNom = nomEglise(form.eglise_id || null);
  const groupes = eglisesGroupees();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  // ── Auto-activation du code serviteur en attente (inscription interrompue) ──
  useEffect(() => {
    const codePending = (() => {
      try { return localStorage.getItem(CLE_CODE_PENDING); } catch { return null; }
    })();
    if (!user || !profil || !codePending) return;
    if (profil.role !== "membre") {
      try { localStorage.removeItem(CLE_CODE_PENDING); } catch { /* noop */ }
      return;
    }
    (async () => {
      const res = await tenterActivationCode(codePending);
      if (res === "ok") {
        try { localStorage.removeItem(CLE_CODE_PENDING); } catch { /* noop */ }
        toast({ title: "Espace Pasteur activé ✓", description: "Bienvenue, serviteur de Dieu ! 🙏" });
        setTimeout(() => window.location.reload(), 1200);
      } else if (res === "code_invalide") {
        try { localStorage.removeItem(CLE_CODE_PENDING); } catch { /* noop */ }
        setCodeServ(codePending); // pré-remplir le champ pour correction manuelle
        toast({
          title: "Code non reconnu",
          description: "Vérifiez-le dans le champ « serviteur MIEDA » ci-dessous.",
          variant: "destructive",
        });
      }
      // 'reessayer' → on laisse le code en attente pour la prochaine visite
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profil]);

  useEffect(() => {
    if (profil) {
      setForm({
        full_name: profil.full_name, phone: profil.phone, ville: profil.ville,
        pays: profil.pays, eglise_id: profil.eglise_id ?? "",
        photo_url: profil.photo_url ?? "",
      });
      setLoading(false);
    }
  }, [profil]);

  // Sécurité : si le compte n'a pas encore de ligne profil, ne pas bloquer l'écran
  useEffect(() => {
    if (!authLoading && user && profil === null) {
      const t = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(t);
    }
  }, [authLoading, user, profil]);

  // Mes prières
  useEffect(() => {
    if (!user) return;
    supabase.from("prieres").select("id, demande, est_publique, traitee, created_at")
      .eq("auteur_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setMesPrieres(data as PriereRow[]); });
  }, [user, envoi]);

  // Annonces de mon église
  useEffect(() => {
    if (!form.eglise_id) { setAnnonces([]); return; }
    supabase.from("annonces").select("id, titre, contenu, date_evenement, created_at")
      .eq("eglise_id", form.eglise_id).order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => { if (data) setAnnonces(data as AnnonceRow[]); });
  }, [form.eglise_id]);

  // Mes demandes de département
  const chargerDemandes = useCallback(() => {
    if (!user) return;
    supabase.from("demandes_departement").select("id, departement, statut, created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setMesDemandes(data as DemandeDept[]); });
  }, [user]);
  useEffect(() => { chargerDemandes(); }, [chargerDemandes]);

  // ── Actions ──
  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 4 * 1024 * 1024) {
      toast({ title: "Photo trop lourde", description: "Maximum 4 Mo.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      toast({ title: "Erreur d'envoi", description: upErr.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${pub.publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ photo_url: url }).eq("id", user.id);
    setForm((f) => ({ ...f, photo_url: url }));
    toast({ title: "Photo mise à jour ✓" });
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id, full_name: form.full_name, phone: form.phone,
      ville: form.ville, pays: form.pays, eglise_id: form.eglise_id || null,
      role: profil?.role ?? "membre",
    });
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else { toast({ title: "Enregistré ✓" }); await refreshProfil(); }
    setSaving(false);
  };

  const soumettrePriere = async () => {
    if (!user || !demande.trim()) return;
    setEnvoi(true);
    const { error } = await supabase.from("prieres").insert({
      nom: form.full_name || "Membre MIEDA", demande: demande.trim(),
      est_publique: publique, eglise_id: form.eglise_id || null, auteur_id: user.id,
    });
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else { toast({ title: "Prière envoyée 🙏" }); setDemande(""); setPublique(false); }
    setEnvoi(false);
  };

  const demanderDepartement = async () => {
    if (!user || !deptChoisi) return;
    if (!form.eglise_id) {
      toast({ title: "Église requise", description: "Choisissez d'abord votre église dans l'onglet Profil.", variant: "destructive" });
      return;
    }
    setEnvoiDept(true);
    const { error } = await supabase.from("demandes_departement").insert({
      user_id: user.id, eglise_id: form.eglise_id,
      departement: deptChoisi, message: messageDept.trim() || null,
    });
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Demande envoyée ✓", description: "Votre pasteur examinera votre demande." });
      setDeptChoisi(null); setMessageDept(""); chargerDemandes();
    }
    setEnvoiDept(false);
  };

  const activerCode = async () => {
    if (!codeServ.trim()) return;
    setActivation(true);
    const { data: res, error } = await supabase.rpc("activer_code_pasteur", {
      p_code: codeServ.trim(),
    });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else if (res === "ok") {
      toast({ title: "Espace Pasteur activé ✓", description: "Bienvenue, serviteur de Dieu ! 🙏" });
      setCodeServ("");
      await refreshProfil();
    } else {
      toast({ title: "Code invalide", description: "Vérifiez le code auprès de l'administration.", variant: "destructive" });
    }
    setActivation(false);
  };

  const donner = () => {
    const val = parseFloat(montant);
    if (!val || val <= 0) return;
    const desc = `Don MIEDA — ${form.full_name || "Membre"}`;
    window.open(buildPayPalUrl(val.toFixed(2), desc), "_blank");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statutDept = (s: string) =>
    s === "approuvee" ? { icon: CheckCircle2, cls: "text-green-600", label: "Approuvée" }
    : s === "refusee" ? { icon: XCircle, cls: "text-destructive", label: "Refusée" }
    : { icon: Clock, cls: "text-muted-foreground", label: "En attente" };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "profil", label: "Profil", icon: UserIcon },
    { id: "eglise", label: "Mon église", icon: Church },
    { id: "departements", label: "Départements", icon: Users },
    { id: "prieres", label: "Prières", icon: HeartHandshake },
    { id: "soutenir", label: "Soutenir", icon: Heart },
  ];

  const field = (label: string, icon: React.ReactNode, value: string,
    onChange: (v: string) => void, placeholder: string, type = "text") => (
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
      {/* ── En-tête ── */}
      <div className="text-white pt-8 pb-16" style={{ background: "var(--hero-gradient)" }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/" className="flex items-center gap-2 text-white/90 hover:text-white mb-8 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
          </Link>
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Avatar avec upload */}
            <div className="relative group flex-shrink-0">
              {form.photo_url ? (
                <img src={form.photo_url} alt={form.full_name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-white/30 shadow-xl" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm ring-4 ring-white/30 flex items-center justify-center text-3xl font-bold shadow-xl">
                  {getInitials(form.full_name || "M")}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white text-primary shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="Changer ma photo"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>

            <div className="text-center sm:text-left">
              <h1 className="text-2xl md:text-3xl font-bold">{form.full_name || "Mon espace"}</h1>
              <p className="text-white/80 text-sm flex items-center justify-center sm:justify-start gap-2 mt-1">
                <Mail className="w-3.5 h-3.5" /> {user?.email}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 flex-wrap">
                {egliseNom && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                    <Church className="w-3 h-3" /> {egliseNom}
                  </span>
                )}
                {isPasteur && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                    <ShieldCheck className="w-3 h-3" /> Pasteur
                  </span>
                )}
              </div>
            </div>

            {(isPasteur || profil?.role === "prophete" || profil?.role === "admin") && (
              <div className="sm:ml-auto flex flex-col gap-2">
                {profil?.role === "prophete" && (
                  <Link to="/espace-prophete">
                    <Button variant="secondary" size="lg" className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                      👑 Espace Prophète
                    </Button>
                  </Link>
                )}
                {profil?.role === "admin" && (
                  <Link to="/admin">
                    <Button variant="secondary" size="lg" className="w-full">
                      🛡️ Administration
                    </Button>
                  </Link>
                )}
                {isPasteur && (
                  <Link to="/espace-pasteur">
                    <Button variant="secondary" size="lg" className="w-full">
                      <ShieldCheck className="w-4 h-4 mr-2" /> Espace Pasteur
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="container mx-auto px-4 max-w-4xl -mt-8 pb-16">
        <div className="bg-card rounded-2xl shadow-xl overflow-hidden">
          {/* Onglets */}
          <div className="flex border-b border-border overflow-x-auto">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {/* ═══ PROFIL ═══ */}
            {tab === "profil" && (
              <div className="space-y-4">
                {field("Nom complet", <UserIcon className="w-4 h-4" />, form.full_name, (v) => setForm({ ...form, full_name: v }), "Votre nom")}
                {field("Téléphone", <Phone className="w-4 h-4" />, form.phone, (v) => setForm({ ...form, phone: v }), "+1 ...", "tel")}
                <div className="grid grid-cols-2 gap-4">
                  {field("Ville", <MapPin className="w-4 h-4" />, form.ville, (v) => setForm({ ...form, ville: v }), "Ville")}
                  {field("Pays", <MapPin className="w-4 h-4" />, form.pays, (v) => setForm({ ...form, pays: v }), "Pays")}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Mon église MIEDA</label>
                  <div className="relative">
                    <Church className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <select value={form.eglise_id}
                      onChange={(e) => setForm({ ...form, eglise_id: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
                      <option value="">— Sélectionnez votre église —</option>
                      {groupes.map((g) => (
                        <optgroup key={g.groupe} label={g.groupe}>
                          {g.options.map((o) => <option key={o.id} value={o.id}>{o.nom}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
                {!isPasteur && (
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <p className="text-sm font-medium text-foreground flex items-center gap-2 mb-1">
                      <KeyRound className="w-4 h-4 text-primary" />
                      Vous êtes serviteur MIEDA ?
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Entrez le code serviteur fourni par l'administration pour activer
                      votre Espace Pasteur.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={codeServ}
                        onChange={(e) => setCodeServ(e.target.value.toUpperCase())}
                        placeholder="MIEDA-XXXX-XXXX"
                        className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <Button onClick={activerCode} disabled={activation || !codeServ.trim()} size="sm" className="px-4">
                        {activation ? <Loader2 className="w-4 h-4 animate-spin" /> : "Activer"}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button onClick={handleSave} disabled={saving} size="lg" className="flex-1">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Enregistrer</>}
                  </Button>
                  <Button onClick={handleSignOut} variant="outline" size="lg">
                    <LogOut className="w-4 h-4 mr-2" /> Se déconnecter
                  </Button>
                </div>
              </div>
            )}

            {/* ═══ MON ÉGLISE ═══ */}
            {tab === "eglise" && (
              <div>
                {!form.eglise_id ? (
                  <div className="text-center py-10">
                    <Church className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium text-foreground mb-2">Aucune église sélectionnée</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Rattachez-vous à votre assemblée dans l'onglet Profil pour voir ses annonces.
                    </p>
                    <Button variant="outline" onClick={() => setTab("profil")}>Choisir mon église</Button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <Megaphone className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-semibold text-foreground">Annonces de {egliseNom}</h2>
                    </div>
                    {annonces.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Aucune annonce pour le moment. Revenez bientôt ! 🙏
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {annonces.map((a) => (
                          <div key={a.id} className="p-5 rounded-xl border border-border bg-background">
                            <div className="flex items-start justify-between gap-3 mb-1">
                              <p className="font-semibold text-foreground">{a.titre}</p>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {new Date(a.created_at).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                            {a.date_evenement && (
                              <p className="text-xs text-primary font-medium mb-2 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(a.date_evenement).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground leading-relaxed">{a.contenu}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ═══ DÉPARTEMENTS ═══ */}
            {tab === "departements" && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Servir dans un département</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Choisissez un département de votre église locale et envoyez votre demande.
                  Votre pasteur l'examinera.
                </p>

                {/* Mes demandes en cours */}
                {mesDemandes.length > 0 && (
                  <div className="mb-6 space-y-2">
                    {mesDemandes.map((d) => {
                      const st = statutDept(d.statut);
                      const dept = departements.find((x) => x.id === d.departement);
                      return (
                        <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                          <st.icon className={`w-4 h-4 flex-shrink-0 ${st.cls}`} />
                          <p className="text-sm text-foreground flex-1">{dept?.titre ?? d.departement}</p>
                          <span className={`text-xs font-medium ${st.cls}`}>{st.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Grille des départements */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {departements.map((d) => {
                    const dejaDemande = mesDemandes.some((x) => x.departement === d.id && x.statut !== "refusee");
                    const actif = deptChoisi === d.id;
                    return (
                      <button key={d.id}
                        onClick={() => !dejaDemande && setDeptChoisi(actif ? null : d.id)}
                        disabled={dejaDemande}
                        className={`text-left p-4 rounded-xl border transition-all ${
                          dejaDemande ? "border-border bg-muted/30 opacity-60 cursor-not-allowed"
                          : actif ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-background hover:border-primary/50"
                        }`}>
                        <p className="font-medium text-foreground text-sm mb-1">{d.titre}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{d.desc}</p>
                        {dejaDemande && <p className="text-[11px] text-primary font-medium mt-2">Demande déjà envoyée ✓</p>}
                      </button>
                    );
                  })}
                </div>

                {/* Formulaire d'envoi */}
                {deptChoisi && (
                  <div className="mt-6 p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                    <p className="text-sm font-medium text-foreground">
                      Demande : {departements.find((d) => d.id === deptChoisi)?.titre}
                    </p>
                    <textarea value={messageDept} onChange={(e) => setMessageDept(e.target.value)}
                      placeholder="Un mot pour votre pasteur (optionnel) : vos motivations, disponibilités..."
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                    <Button onClick={demanderDepartement} disabled={envoiDept} className="w-full">
                      {envoiDept ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Envoyer ma demande</>}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ═══ PRIÈRES ═══ */}
            {tab === "prieres" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <HeartHandshake className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Demande de prière</h2>
                </div>
                <textarea value={demande} onChange={(e) => setDemande(e.target.value)}
                  placeholder="Partagez votre sujet de prière..." rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                <label className="flex items-center gap-2 mt-3 text-sm text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={publique} onChange={(e) => setPublique(e.target.checked)}
                    className="rounded border-input" />
                  Rendre visible sur le mur de prières public (anonymisé)
                </label>
                <Button onClick={soumettrePriere} disabled={envoi || !demande.trim()} className="w-full mt-4">
                  {envoi ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Envoyer ma demande</>}
                </Button>

                {mesPrieres.length > 0 && (
                  <div className="mt-8">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Mes demandes ({mesPrieres.length})
                    </p>
                    <div className="space-y-2">
                      {mesPrieres.map((p) => (
                        <div key={p.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                          {p.traitee ? <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            : <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />}
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
            )}

            {/* ═══ SOUTENIR ═══ */}
            {tab === "soutenir" && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Soutenir l'œuvre de Dieu</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  « Chacun donne ce qu'il a décidé en son cœur, sans tristesse ni contrainte. » — 2 Corinthiens 9:7
                </p>

                {/* Type */}
                <div className="flex gap-2 mb-4">
                  {([["ponctuel", "Ponctuel"], ["periodique", "Récurrent"]] as const).map(([val, lbl]) => (
                    <button key={val} onClick={() => setTypeDon(val)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                        "don" === val ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-foreground hover:border-primary"
                      }`}>{lbl}</button>
                  ))}
                </div>

                {/* Montants */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {["10", "25", "50", "100", "200"].map((p) => (
                    <button key={p} onClick={() => setMontant(p)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                        montant === p ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-foreground hover:border-primary"
                      }`}>${p}</button>
                  ))}
                </div>
                <div className="relative mb-4">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                  <input type="number" min="1" step="0.01" placeholder="Montant personnalisé"
                    value={montant} onChange={(e) => setMontant(e.target.value)}
                    className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>

                <Button size="lg" className="w-full" onClick={donner}
                  disabled={!montant || parseFloat(montant) <= 0}>
                  <Heart className="w-4 h-4 mr-2" />
                  Donner ${montant || "0.00"} via PayPal
                  <ExternalLink className="w-4 h-4 ml-2 opacity-60" />
                </Button>

                <div className="mt-6 p-4 rounded-xl bg-muted/40 border border-border">
                  <p className="text-sm text-foreground font-medium mb-1">Autres moyens de donner</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Virement bancaire (USA), Wave (Côte d'Ivoire), virement IBAN (France/International).
                  </p>
                  <Link to="/contact#offrandes">
                    <Button variant="outline" size="sm" className="w-full">
                      Voir tous les moyens de donner
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
