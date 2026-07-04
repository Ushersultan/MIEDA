import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Loader2, Church, HeartHandshake, Megaphone, Users, ShieldAlert,
  CheckCircle2, Clock, Send, Trash2, Calendar, Phone, MapPin, Home,
} from "lucide-react";
import { nomEglise } from "@/lib/serviteurs";

type Tab = "prieres" | "annonces" | "membres";

interface Priere { id: string; nom: string; demande: string; traitee: boolean; created_at: string; }
interface Annonce { id: string; titre: string; contenu: string; date_evenement: string | null; created_at: string; }
interface Membre { id: string; full_name: string; phone: string; ville: string; role: string; }

const EspacePasteur = () => {
  const { user, loading: authLoading, profil, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tab, setTab] = useState<Tab>("prieres");
  const [prieres, setPrieres] = useState<Priere[]>([]);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [chargement, setChargement] = useState(true);

  // Formulaire annonce
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [dateEv, setDateEv] = useState("");
  const [pub, setPub] = useState(false);

  const egliseId = profil?.eglise_id ?? null;
  const egliseNom = nomEglise(egliseId);
  const isPasteur = profil?.role === "pasteur" || profil?.role === "admin";

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const charger = useCallback(async () => {
    if (!egliseId) { setChargement(false); return; }
    setChargement(true);
    const [pr, an, me] = await Promise.all([
      supabase.from("prieres").select("id, nom, demande, traitee, created_at")
        .eq("eglise_id", egliseId).order("created_at", { ascending: false }),
      supabase.from("annonces").select("id, titre, contenu, date_evenement, created_at")
        .eq("eglise_id", egliseId).order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, phone, ville, role")
        .eq("eglise_id", egliseId),
    ]);
    if (pr.data) setPrieres(pr.data as Priere[]);
    if (an.data) setAnnonces(an.data as Annonce[]);
    if (me.data) setMembres(me.data as Membre[]);
    setChargement(false);
  }, [egliseId]);

  useEffect(() => {
    if (isPasteur && egliseId) charger();
    else if (!authLoading) setChargement(false);
  }, [isPasteur, egliseId, charger, authLoading]);

  const toggleTraitee = async (p: Priere) => {
    const { error } = await supabase.from("prieres")
      .update({ traitee: !p.traitee }).eq("id", p.id);
    if (!error) setPrieres((prev) => prev.map((x) => x.id === p.id ? { ...x, traitee: !x.traitee } : x));
  };

  const publierAnnonce = async () => {
    if (!user || !egliseId || !titre.trim() || !contenu.trim()) return;
    setPub(true);
    const { error } = await supabase.from("annonces").insert({
      eglise_id: egliseId, titre: titre.trim(), contenu: contenu.trim(),
      date_evenement: dateEv || null, auteur_id: user.id,
    });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Annonce publiée ✓" });
      setTitre(""); setContenu(""); setDateEv("");
      charger();
    }
    setPub(false);
  };

  const supprimerAnnonce = async (id: string) => {
    const { error } = await supabase.from("annonces").delete().eq("id", id);
    if (!error) setAnnonces((prev) => prev.filter((a) => a.id !== id));
  };

  if (authLoading || chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Accès réservé
  if (!isPasteur) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Accès réservé</h1>
          <p className="text-muted-foreground mb-6">
            Cet espace est réservé aux pasteurs et responsables MIEDA. Si vous êtes
            pasteur, contactez l'administration pour activer votre accès.
          </p>
          <Link to="/"><Button variant="outline"><Home className="w-4 h-4 mr-2" /> Accueil</Button></Link>
        </div>
      </div>
    );
  }

  const prieresEnAttente = prieres.filter((p) => !p.traitee).length;

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: "prieres", label: "Prières", icon: HeartHandshake, count: prieresEnAttente },
    { id: "annonces", label: "Annonces", icon: Megaphone, count: annonces.length },
    { id: "membres", label: "Membres", icon: Users, count: membres.length },
  ];

  return (
    <div className="min-h-screen bg-[var(--section-bg)]">
      {/* En-tête */}
      <div className="text-white py-8" style={{ background: "var(--hero-gradient)" }}>
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/profil" className="flex items-center gap-2 text-white/90 hover:text-white mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Mon espace
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Espace Pasteur</h1>
              <p className="text-white/85 text-sm flex items-center gap-1.5">
                <Church className="w-4 h-4" />
                {egliseNom ?? "Église non assignée"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl -mt-6 pb-16">
        {!egliseId ? (
          <div className="bg-card rounded-2xl shadow-xl p-8 text-center">
            <Church className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">Aucune église assignée</p>
            <p className="text-sm text-muted-foreground">
              L'administration doit rattacher votre compte à une église pour activer la gestion.
            </p>
          </div>
        ) : (
          <>
            {/* Onglets */}
            <div className="bg-card rounded-2xl shadow-xl overflow-hidden">
              <div className="flex border-b border-border overflow-x-auto">
                {tabs.map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}>
                    <t.icon className="w-4 h-4" />
                    {t.label}
                    {t.count !== undefined && t.count > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {t.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* PRIÈRES */}
                {tab === "prieres" && (
                  <div className="space-y-3">
                    {prieres.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Aucune demande de prière pour le moment.
                      </p>
                    )}
                    {prieres.map((p) => (
                      <div key={p.id} className={`p-4 rounded-xl border ${p.traitee ? "border-border bg-muted/30" : "border-primary/30 bg-card"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-foreground">{p.demande}</p>
                            <p className="text-xs text-muted-foreground mt-1.5">
                              {p.nom} · {new Date(p.created_at).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          <button onClick={() => toggleTraitee(p)}
                            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors ${
                              p.traitee ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground hover:bg-muted/70"
                            }`}>
                            {p.traitee ? <><CheckCircle2 className="w-3.5 h-3.5" /> Portée</> : <><Clock className="w-3.5 h-3.5" /> Marquer</>}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ANNONCES */}
                {tab === "annonces" && (
                  <div>
                    <div className="bg-muted/40 rounded-xl p-4 mb-6 space-y-3">
                      <p className="font-medium text-foreground text-sm">Nouvelle annonce / événement</p>
                      <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)}
                        placeholder="Titre" maxLength={120}
                        className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                      <textarea value={contenu} onChange={(e) => setContenu(e.target.value)}
                        placeholder="Contenu de l'annonce..." rows={3}
                        className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <input type="date" value={dateEv} onChange={(e) => setDateEv(e.target.value)}
                          className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                        <span className="text-xs text-muted-foreground">Date d'événement (optionnel)</span>
                      </div>
                      <Button onClick={publierAnnonce} disabled={pub || !titre.trim() || !contenu.trim()} size="sm" className="w-full">
                        {pub ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Publier</>}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {annonces.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">Aucune annonce publiée.</p>
                      )}
                      {annonces.map((a) => (
                        <div key={a.id} className="p-4 rounded-xl border border-border bg-card">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground">{a.titre}</p>
                              {a.date_evenement && (
                                <p className="text-xs text-primary font-medium mt-0.5 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(a.date_evenement).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground mt-1.5">{a.contenu}</p>
                            </div>
                            <button onClick={() => supprimerAnnonce(a.id)}
                              className="text-muted-foreground hover:text-destructive flex-shrink-0" aria-label="Supprimer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MEMBRES */}
                {tab === "membres" && (
                  <div className="space-y-2">
                    {membres.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Aucun membre rattaché à votre église pour l'instant.
                      </p>
                    )}
                    {membres.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center flex-shrink-0">
                          {(m.full_name || "M").slice(0, 1).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{m.full_name || "Membre"}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                            {m.ville && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{m.ville}</span>}
                            {m.role !== "membre" && <span className="text-primary font-medium">{m.role}</span>}
                          </p>
                        </div>
                        {m.phone && (
                          <a href={`tel:${m.phone.replace(/[^+\d]/g, "")}`}
                             className="text-primary hover:text-primary/80 flex-shrink-0" aria-label="Appeler">
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EspacePasteur;
