import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Loader2, Church, HeartHandshake, Megaphone, Users, ShieldAlert,
  CheckCircle2, Clock, Send, Trash2, Calendar, Phone, MapPin, Home, XCircle,
  Inbox, LayoutDashboard, TrendingUp, Sparkles, Mail, UserPlus, Activity,
  Search, X, ChevronDown, ChevronRight, Cake, Briefcase, Home as HomeIcon,
  MessageCircle, Download, FileText,
} from "lucide-react";
import { nomEglise } from "@/lib/serviteurs";
import { departements } from "@/data/departements";
import { useLang } from "@/contexts/LanguageContext";

type Tab = "tableau" | "prieres" | "annonces" | "membres" | "demandes";

interface Priere { id: string; nom: string; demande: string; traitee: boolean; created_at: string; auteur_id?: string | null; }
interface Annonce { id: string; titre: string; contenu: string; date_evenement: string | null; created_at: string; }
interface Membre {
  id: string; full_name: string; phone: string; ville: string; pays: string;
  role: string; photo_url: string | null; created_at?: string;
  profession: string | null; quartier: string | null; bio: string | null;
  date_naissance: string | null;
}
interface DemandeDept { id: string; user_id: string; departement: string; message: string | null; statut: string; created_at: string; nom?: string; }

// ── Textes bilingues ──
const TXT = {
  fr: {
    retour: "Mon espace", titre: "Espace Pasteur", sansEglise: "Église non assignée",
    aucune: "Aucune église assignée",
    aucuneSous: "L'administration doit rattacher votre compte à une église pour activer la gestion.",
    tabs: { tableau: "Tableau de bord", prieres: "Prières", demandes: "Demandes", annonces: "Annonces", membres: "Membres" },
    bienvenue: "Que la grâce du Seigneur soit avec vous", stats: "Aperçu de votre ministère",
    total: "Total", nouveau7j: "Nouveaux (7 jours)", enAttente: "En attente", cetteSem: "cette semaine",
    prochains: "Prochain événement", aucunEv: "Aucun événement à venir",
    recent: "Activité récente", aucuneAct: "Aucune activité récente",
    voir: "Voir", jour: "aujourd'hui", hier: "hier", jours: "il y a {n} jours",
    portee: "Portée", marquer: "Marquer", approuver: "Approuver", refuser: "Refuser",
    approuvee: "Approuvée ✓", refusee: "Refusée", auteur: "de",
    nouvelleAnn: "Nouvelle annonce / événement", titreAnn: "Titre", contenuAnn: "Contenu de l'annonce...",
    dateEv: "Date d'événement (optionnel)", publier: "Publier",
    aucuneAnn: "Aucune annonce publiée.",
    aucunPri: "Aucune demande de prière pour le moment.",
    aucuneDem: "Aucune demande d'adhésion à un département.",
    aucunMem: "Aucun membre rattaché à votre église pour l'instant.",
    inscrit: "Inscrit", contact: "Contact",
    rechercheMem: "Rechercher un membre, un quartier, une profession...",
    anniv: "Anniversaires ce mois-ci",
    quartier: "Quartier", profession: "Profession", naissance: "Naissance",
    ans: "ans", departements: "Départements", aucunDept: "Aucun département",
    prieresEnv: "Prières envoyées", apropos: "À propos",
    appeler: "Appeler", whatsapp: "WhatsApp", exporter: "Exporter (CSV)",
    aucunResultat: "Aucun membre correspondant.",
  },
  en: {
    retour: "My space", titre: "Pastor's Space", sansEglise: "No church assigned",
    aucune: "No church assigned",
    aucuneSous: "The administration must link your account to a church to enable management.",
    tabs: { tableau: "Dashboard", prieres: "Prayers", demandes: "Requests", annonces: "Announcements", membres: "Members" },
    bienvenue: "May the grace of the Lord be with you", stats: "Overview of your ministry",
    total: "Total", nouveau7j: "New (7 days)", enAttente: "Pending", cetteSem: "this week",
    prochains: "Next event", aucunEv: "No upcoming events",
    recent: "Recent activity", aucuneAct: "No recent activity",
    voir: "View", jour: "today", hier: "yesterday", jours: "{n} days ago",
    portee: "Prayed", marquer: "Mark", approuver: "Approve", refuser: "Decline",
    approuvee: "Approved ✓", refusee: "Declined", auteur: "from",
    nouvelleAnn: "New announcement / event", titreAnn: "Title", contenuAnn: "Announcement content...",
    dateEv: "Event date (optional)", publier: "Publish",
    aucuneAnn: "No announcements published.",
    aucunPri: "No prayer requests for now.",
    aucuneDem: "No department membership requests.",
    aucunMem: "No members linked to your church yet.",
    inscrit: "Joined", contact: "Contact",
    rechercheMem: "Search a member, a neighbourhood, a profession...",
    anniv: "Birthdays this month",
    quartier: "Neighbourhood", profession: "Profession", naissance: "Birth date",
    ans: "years old", departements: "Departments", aucunDept: "No department",
    prieresEnv: "Prayers submitted", apropos: "About",
    appeler: "Call", whatsapp: "WhatsApp", exporter: "Export (CSV)",
    aucunResultat: "No matching member.",
  },
};

// ── Petits helpers ──
const initiales = (n: string) => (n || "M").split(/\s+/).slice(0, 2).map((x) => x[0]?.toUpperCase() ?? "").join("");
const ilYA = (iso: string, L: typeof TXT.fr) => {
  const j = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (j <= 0) return L.jour;
  if (j === 1) return L.hier;
  return L.jours.replace("{n}", String(j));
};

const EspacePasteur = () => {
  const { user, loading: authLoading, profil } = useAuth();
  const { lang } = useLang();
  const L = TXT[lang];
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tab, setTab] = useState<Tab>("tableau");
  const [prieres, setPrieres] = useState<Priere[]>([]);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [demandes, setDemandes] = useState<DemandeDept[]>([]);
  const [chargement, setChargement] = useState(true);
  const [rechercheMembre, setRechercheMembre] = useState("");
  const [membreOuvert, setMembreOuvert] = useState<string | null>(null);

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
    const [pr, an, me, de] = await Promise.all([
      supabase.from("prieres").select("id, nom, demande, traitee, created_at, auteur_id")
        .eq("eglise_id", egliseId).order("created_at", { ascending: false }),
      supabase.from("annonces").select("id, titre, contenu, date_evenement, created_at")
        .eq("eglise_id", egliseId).order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, phone, ville, pays, role, photo_url, created_at, profession, quartier, bio, date_naissance")
        .eq("eglise_id", egliseId),
      supabase.from("demandes_departement")
        .select("id, user_id, departement, message, statut, created_at")
        .eq("eglise_id", egliseId).order("created_at", { ascending: false }),
    ]);
    if (pr.data) setPrieres(pr.data as Priere[]);
    if (an.data) setAnnonces(an.data as Annonce[]);
    if (me.data) setMembres(me.data as Membre[]);
    if (de.data) {
      const noms = new Map((me.data ?? []).map((m: any) => [m.id, m.full_name]));
      setDemandes((de.data as DemandeDept[]).map((d) => ({ ...d, nom: noms.get(d.user_id) ?? "Membre" })));
    }
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
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else { toast({ title: "Annonce publiée ✓" }); setTitre(""); setContenu(""); setDateEv(""); charger(); }
    setPub(false);
  };

  const supprimerAnnonce = async (id: string) => {
    const { error } = await supabase.from("annonces").delete().eq("id", id);
    if (!error) setAnnonces((prev) => prev.filter((a) => a.id !== id));
  };

  const statuerDemande = async (id: string, statut: "approuvee" | "refusee") => {
    const { error } = await supabase.from("demandes_departement").update({ statut }).eq("id", id);
    if (!error) setDemandes((prev) => prev.map((d) => d.id === id ? { ...d, statut } : d));
  };

  // ── Statistiques calculées ──
  const stats = useMemo(() => {
    const il_y_a_7j = Date.now() - 7 * 86400000;
    const prochainEv = annonces
      .filter((a) => a.date_evenement && new Date(a.date_evenement).getTime() > Date.now())
      .sort((a, b) => new Date(a.date_evenement!).getTime() - new Date(b.date_evenement!).getTime())[0];
    return {
      prieresEnAttente: prieres.filter((p) => !p.traitee).length,
      prieresRecentes: prieres.filter((p) => new Date(p.created_at).getTime() > il_y_a_7j).length,
      demandesEnAttente: demandes.filter((d) => d.statut === "en_attente").length,
      nouveauxMembres: membres.filter((m) => m.created_at && new Date(m.created_at).getTime() > il_y_a_7j).length,
      prochainEv,
    };
  }, [prieres, annonces, membres, demandes]);

  // ── Index : départements approuvés et prières par membre ──
  const deptsParMembre = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const d of demandes) {
      if (d.statut !== "approuvee") continue;
      const dept = departements.find((x) => x.id === d.departement);
      const nom = dept ? (lang === "en" ? dept.titreEn : dept.titre) : d.departement;
      map.set(d.user_id, [...(map.get(d.user_id) ?? []), nom]);
    }
    return map;
  }, [demandes, lang]);

  const prieresParMembre = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of prieres) {
      if (!p.auteur_id) continue;
      map.set(p.auteur_id, (map.get(p.auteur_id) ?? 0) + 1);
    }
    return map;
  }, [prieres]);

  // ── Anniversaires du mois en cours ──
  const anniversaires = useMemo(() => {
    const moisCourant = new Date().getMonth();
    return membres
      .filter((m) => m.date_naissance && new Date(m.date_naissance + "T12:00:00").getMonth() === moisCourant)
      .sort((a, b) =>
        new Date(a.date_naissance! + "T12:00:00").getDate() -
        new Date(b.date_naissance! + "T12:00:00").getDate());
  }, [membres]);

  // ── Membres filtrés par la recherche ──
  const membresFiltres = useMemo(() => {
    const q = rechercheMembre.trim().toLowerCase();
    if (!q) return membres;
    return membres.filter((m) =>
      [m.full_name, m.ville, m.pays, m.quartier, m.profession, m.phone]
        .some((v) => (v ?? "").toLowerCase().includes(q)) ||
      (deptsParMembre.get(m.id) ?? []).some((d) => d.toLowerCase().includes(q))
    );
  }, [membres, rechercheMembre, deptsParMembre]);

  // ── Export CSV de la liste des membres ──
  const exporterMembres = () => {
    const lignes = ["Nom,Téléphone,Ville,Quartier,Pays,Profession,Naissance,Départements,Inscrit le"];
    for (const m of membresFiltres) {
      const champs = [
        m.full_name ?? "", m.phone ?? "", m.ville ?? "", m.quartier ?? "",
        m.pays ?? "", m.profession ?? "", m.date_naissance ?? "",
        (deptsParMembre.get(m.id) ?? []).join(" / "),
        m.created_at ? new Date(m.created_at).toLocaleDateString("fr-FR") : "",
      ];
      lignes.push(champs.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(","));
    }
    const blob = new Blob(["\uFEFF" + lignes.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "membres-" + (egliseId ?? "eglise") + "-" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Activité récente (les 5 derniers événements combinés) ──
  const activiteRecente = useMemo(() => {
    const items: { type: string; texte: string; date: string; icon: any; couleur: string }[] = [];
    prieres.slice(0, 3).forEach((p) => items.push({
      type: "priere", texte: `${p.nom} — prière`, date: p.created_at,
      icon: HeartHandshake, couleur: "text-primary",
    }));
    demandes.slice(0, 3).forEach((d) => {
      const dept = departements.find((x) => x.id === d.departement);
      items.push({
        type: "demande", texte: `${d.nom} → ${dept?.titre ?? d.departement}`,
        date: d.created_at, icon: Sparkles, couleur: "text-accent",
      });
    });
    membres
      .filter((m) => m.created_at)
      .slice(0, 3)
      .forEach((m) => items.push({
        type: "membre", texte: `${m.full_name || "Membre"} ${lang === "en" ? "joined" : "a rejoint"}`,
        date: m.created_at!, icon: UserPlus, couleur: "text-green-600",
      }));
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, [prieres, demandes, membres, lang]);

  if (authLoading || chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isPasteur) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {lang === "en" ? "Restricted access" : "Accès réservé"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {lang === "en"
              ? "This space is reserved for MIEDA pastors and leaders. If you are a pastor, contact the administration to activate your access."
              : "Cet espace est réservé aux pasteurs et responsables MIEDA. Si vous êtes pasteur, contactez l'administration pour activer votre accès."}
          </p>
          <Link to="/"><Button variant="outline"><Home className="w-4 h-4 mr-2" /> {lang === "en" ? "Home" : "Accueil"}</Button></Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: "tableau", label: L.tabs.tableau, icon: LayoutDashboard },
    { id: "prieres", label: L.tabs.prieres, icon: HeartHandshake, count: stats.prieresEnAttente },
    { id: "demandes", label: L.tabs.demandes, icon: Inbox, count: stats.demandesEnAttente },
    { id: "annonces", label: L.tabs.annonces, icon: Megaphone, count: annonces.length },
    { id: "membres", label: L.tabs.membres, icon: Users, count: membres.length },
  ];

  return (
    <div className="min-h-screen bg-[var(--section-bg)]">
      {/* ── En-tête ── */}
      <div className="text-white pt-8 pb-16" style={{ background: "var(--hero-gradient)" }}>
        <div className="container mx-auto px-4 max-w-5xl">
          <Link to="/profil" className="flex items-center gap-2 text-white/90 hover:text-white mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> {L.retour}
          </Link>
          <div className="flex items-center gap-4">
            {profil?.photo_url ? (
              <img src={profil.photo_url} alt="" className="w-16 h-16 rounded-full object-cover ring-4 ring-white/30" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <ShieldAlert className="w-8 h-8" />
              </div>
            )}
            <div>
              <p className="text-white/85 text-sm">{L.bienvenue}</p>
              <h1 className="text-2xl md:text-3xl font-bold">{profil?.full_name || L.titre}</h1>
              <p className="text-white/85 text-sm flex items-center gap-1.5 mt-0.5">
                <Church className="w-4 h-4" />
                {egliseNom ?? L.sansEglise}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl -mt-8 pb-16">
        {!egliseId ? (
          <div className="bg-card rounded-2xl shadow-xl p-8 text-center">
            <Church className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">{L.aucune}</p>
            <p className="text-sm text-muted-foreground">{L.aucuneSous}</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl shadow-xl overflow-hidden">
            {/* Onglets */}
            <div className="flex border-b border-border overflow-x-auto">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
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
              {/* ═══════ TABLEAU DE BORD ═══════ */}
              {tab === "tableau" && (
                <div>
                  <p className="text-sm text-muted-foreground mb-6">{L.stats}</p>

                  {/* Cartes statistiques */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <button onClick={() => setTab("membres")}
                      className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-left hover:border-primary/40 transition-colors">
                      <Users className="w-5 h-5 text-primary mb-2" />
                      <p className="text-2xl font-bold text-foreground">{membres.length}</p>
                      <p className="text-xs text-muted-foreground">{L.tabs.membres}</p>
                      {stats.nouveauxMembres > 0 && (
                        <p className="text-[10px] text-green-600 font-medium mt-1">+{stats.nouveauxMembres} {L.cetteSem}</p>
                      )}
                    </button>

                    <button onClick={() => setTab("prieres")}
                      className="p-4 rounded-xl bg-accent/5 border border-accent/20 text-left hover:border-accent/40 transition-colors">
                      <HeartHandshake className="w-5 h-5 text-accent mb-2" />
                      <p className="text-2xl font-bold text-foreground">{stats.prieresEnAttente}</p>
                      <p className="text-xs text-muted-foreground">{L.enAttente}</p>
                      {stats.prieresRecentes > 0 && (
                        <p className="text-[10px] text-primary font-medium mt-1">{stats.prieresRecentes} {L.cetteSem}</p>
                      )}
                    </button>

                    <button onClick={() => setTab("demandes")}
                      className="p-4 rounded-xl bg-secondary/20 border border-secondary/30 text-left hover:border-secondary/50 transition-colors">
                      <Inbox className="w-5 h-5 text-secondary-foreground mb-2" />
                      <p className="text-2xl font-bold text-foreground">{stats.demandesEnAttente}</p>
                      <p className="text-xs text-muted-foreground">{L.enAttente}</p>
                    </button>

                    <button onClick={() => setTab("annonces")}
                      className="p-4 rounded-xl bg-muted/50 border border-border text-left hover:border-primary/40 transition-colors">
                      <Megaphone className="w-5 h-5 text-foreground mb-2" />
                      <p className="text-2xl font-bold text-foreground">{annonces.length}</p>
                      <p className="text-xs text-muted-foreground">{L.total}</p>
                    </button>
                  </div>

                  {/* Prochain événement */}
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {L.prochains}
                    </p>
                    {stats.prochainEv ? (
                      <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                        <p className="font-semibold text-foreground">{stats.prochainEv.titre}</p>
                        <p className="text-sm text-primary font-medium mt-1">
                          {new Date(stats.prochainEv.date_evenement!).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR",
                            { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{stats.prochainEv.contenu}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">{L.aucunEv}</p>
                    )}
                  </div>

                  {/* Activité récente */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" /> {L.recent}
                    </p>
                    {activiteRecente.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">{L.aucuneAct}</p>
                    ) : (
                      <div className="space-y-2">
                        {activiteRecente.map((it, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                            <it.icon className={`w-4 h-4 flex-shrink-0 ${it.couleur}`} />
                            <p className="text-sm text-foreground flex-1 truncate">{it.texte}</p>
                            <span className="text-xs text-muted-foreground flex-shrink-0">{ilYA(it.date, L)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══════ PRIÈRES ═══════ */}
              {tab === "prieres" && (
                <div className="space-y-3">
                  {prieres.length === 0 && <p className="text-center text-muted-foreground py-8">{L.aucunPri}</p>}
                  {prieres.map((p) => (
                    <div key={p.id} className={`p-4 rounded-xl border ${p.traitee ? "border-border bg-muted/30" : "border-primary/30 bg-card"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-foreground">{p.demande}</p>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            {p.nom} · {new Date(p.created_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}
                          </p>
                        </div>
                        <button onClick={() => toggleTraitee(p)}
                          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors ${
                            p.traitee ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground hover:bg-muted/70"
                          }`}>
                          {p.traitee ? <><CheckCircle2 className="w-3.5 h-3.5" /> {L.portee}</> : <><Clock className="w-3.5 h-3.5" /> {L.marquer}</>}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ═══════ DEMANDES DE DÉPARTEMENT ═══════ */}
              {tab === "demandes" && (
                <div className="space-y-3">
                  {demandes.length === 0 && <p className="text-center text-muted-foreground py-8">{L.aucuneDem}</p>}
                  {demandes.map((d) => {
                    const dept = departements.find((x) => x.id === d.departement);
                    return (
                      <div key={d.id} className={`p-4 rounded-xl border ${
                        d.statut === "en_attente" ? "border-primary/30 bg-card" : "border-border bg-muted/30"
                      }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground">
                              {d.nom} → <span className="text-primary">{dept?.titre ?? d.departement}</span>
                            </p>
                            {d.message && <p className="text-sm text-muted-foreground mt-1 italic">« {d.message} »</p>}
                            <p className="text-xs text-muted-foreground mt-1.5">
                              {new Date(d.created_at).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR")}
                            </p>
                          </div>
                          {d.statut === "en_attente" ? (
                            <div className="flex gap-2 flex-shrink-0">
                              <button onClick={() => statuerDemande(d.id, "approuvee")}
                                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition-colors">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {L.approuver}
                              </button>
                              <button onClick={() => statuerDemande(d.id, "refusee")}
                                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                                <XCircle className="w-3.5 h-3.5" /> {L.refuser}
                              </button>
                            </div>
                          ) : (
                            <span className={`text-xs font-medium flex-shrink-0 ${
                              d.statut === "approuvee" ? "text-green-600" : "text-destructive"
                            }`}>
                              {d.statut === "approuvee" ? L.approuvee : L.refusee}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ═══════ ANNONCES ═══════ */}
              {tab === "annonces" && (
                <div>
                  <div className="bg-muted/40 rounded-xl p-4 mb-6 space-y-3">
                    <p className="font-medium text-foreground text-sm">{L.nouvelleAnn}</p>
                    <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)}
                      placeholder={L.titreAnn} maxLength={120}
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                    <textarea value={contenu} onChange={(e) => setContenu(e.target.value)}
                      placeholder={L.contenuAnn} rows={3}
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <input type="date" value={dateEv} onChange={(e) => setDateEv(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                      <span className="text-xs text-muted-foreground">{L.dateEv}</span>
                    </div>
                    <Button onClick={publierAnnonce} disabled={pub || !titre.trim() || !contenu.trim()} size="sm" className="w-full">
                      {pub ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> {L.publier}</>}
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {annonces.length === 0 && <p className="text-center text-muted-foreground py-4">{L.aucuneAnn}</p>}
                    {annonces.map((a) => (
                      <div key={a.id} className="p-4 rounded-xl border border-border bg-card">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground">{a.titre}</p>
                            {a.date_evenement && (
                              <p className="text-xs text-primary font-medium mt-0.5 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(a.date_evenement).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR",
                                  { day: "numeric", month: "long", year: "numeric" })}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground mt-1.5">{a.contenu}</p>
                          </div>
                          <button onClick={() => supprimerAnnonce(a.id)}
                            className="text-muted-foreground hover:text-destructive flex-shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══════ MEMBRES ═══════ */}
              {tab === "membres" && (
                <div>
                  {/* Recherche + export */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input type="text" value={rechercheMembre}
                        onChange={(e) => setRechercheMembre(e.target.value)}
                        placeholder={L.rechercheMem}
                        className="w-full pl-10 pr-9 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                      {rechercheMembre && (
                        <button onClick={() => setRechercheMembre("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {membres.length > 0 && (
                      <Button onClick={exporterMembres} variant="outline" size="sm" className="sm:w-auto">
                        <Download className="w-4 h-4 mr-1.5" /> {L.exporter}
                      </Button>
                    )}
                  </div>

                  {/* Anniversaires du mois */}
                  {anniversaires.length > 0 && (
                    <div className="mb-5 rounded-xl border border-accent/30 bg-accent/5 p-4">
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                        <Cake className="w-4 h-4 text-accent" /> {L.anniv}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {anniversaires.map((m) => (
                          <span key={m.id}
                            className="text-xs font-medium px-3 py-1.5 rounded-full bg-card border border-border">
                            {m.full_name} ·{" "}
                            {new Date(m.date_naissance! + "T12:00:00").toLocaleDateString(
                              lang === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "long" })}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mb-2">
                    {membresFiltres.length} / {membres.length}
                  </p>

                  <div className="space-y-2">
                    {membres.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">{L.aucunMem}</p>
                    )}
                    {membres.length > 0 && membresFiltres.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">{L.aucunResultat}</p>
                    )}

                    {membresFiltres.map((m) => {
                      const ouvert = membreOuvert === m.id;
                      const depts = deptsParMembre.get(m.id) ?? [];
                      const nbPrieres = prieresParMembre.get(m.id) ?? 0;
                      const tel = (m.phone ?? "").replace(/[^+\d]/g, "");
                      const age = m.date_naissance
                        ? Math.floor((Date.now() - new Date(m.date_naissance + "T12:00:00").getTime()) / 31557600000)
                        : null;
                      return (
                        <div key={m.id} className="rounded-xl border border-border bg-card overflow-hidden">
                          {/* Ligne repliée */}
                          <button onClick={() => setMembreOuvert(ouvert ? null : m.id)}
                            className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors">
                            {m.photo_url ? (
                              <img src={m.photo_url} alt="" className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center flex-shrink-0">
                                {initiales(m.full_name)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {m.full_name || (lang === "en" ? "Member" : "Membre")}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap mt-0.5">
                                {m.ville && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{m.ville}</span>}
                                {m.role !== "membre" && <span className="text-primary font-medium">{m.role}</span>}
                                {depts.length > 0 && <span className="text-accent">{depts.length} dép.</span>}
                                {m.created_at && <span>· {L.inscrit} {ilYA(m.created_at, L)}</span>}
                              </p>
                            </div>
                            {ouvert ? <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                                    : <ChevronRight className="w-4 h-4 flex-shrink-0 text-muted-foreground" />}
                          </button>

                          {/* Détails dépliés */}
                          {ouvert && (
                            <div className="border-t border-border p-4 space-y-4">
                              {/* Coordonnées */}
                              {tel && (
                                <div className="flex gap-2 flex-wrap">
                                  <a href={"tel:" + tel}
                                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                                    <Phone className="w-3.5 h-3.5" /> {L.appeler}
                                  </a>
                                  <a href={"https://wa.me/" + tel.replace(/\+/g, "")}
                                    target="_blank" rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-green-600 text-white hover:opacity-90 transition-opacity">
                                    <MessageCircle className="w-3.5 h-3.5" /> {L.whatsapp}
                                  </a>
                                  <span className="inline-flex items-center text-xs text-muted-foreground px-2">
                                    {m.phone}
                                  </span>
                                </div>
                              )}

                              {/* Fiche d'informations */}
                              <div className="grid sm:grid-cols-2 gap-3">
                                {m.quartier && (
                                  <div className="flex items-start gap-2">
                                    <HomeIcon className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{L.quartier}</p>
                                      <p className="text-sm text-foreground">{m.quartier}</p>
                                    </div>
                                  </div>
                                )}
                                {m.profession && (
                                  <div className="flex items-start gap-2">
                                    <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{L.profession}</p>
                                      <p className="text-sm text-foreground">{m.profession}</p>
                                    </div>
                                  </div>
                                )}
                                {m.date_naissance && (
                                  <div className="flex items-start gap-2">
                                    <Cake className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{L.naissance}</p>
                                      <p className="text-sm text-foreground">
                                        {new Date(m.date_naissance + "T12:00:00").toLocaleDateString(
                                          lang === "en" ? "en-US" : "fr-FR",
                                          { day: "numeric", month: "long", year: "numeric" })}
                                        {age !== null && <span className="text-muted-foreground"> · {age} {L.ans}</span>}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {(m.ville || m.pays) && (
                                  <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                        {lang === "en" ? "Location" : "Localisation"}
                                      </p>
                                      <p className="text-sm text-foreground">
                                        {[m.ville, m.pays].filter(Boolean).join(", ")}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Départements */}
                              <div>
                                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
                                  {L.departements}
                                </p>
                                {depts.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {depts.map((d) => (
                                      <span key={d}
                                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                        {d}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground italic">{L.aucunDept}</p>
                                )}
                              </div>

                              {/* À propos */}
                              {m.bio && (
                                <div>
                                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
                                    <FileText className="w-3 h-3" /> {L.apropos}
                                  </p>
                                  <p className="text-sm text-foreground italic">« {m.bio} »</p>
                                </div>
                              )}

                              {/* Engagement */}
                              <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <HeartHandshake className="w-3.5 h-3.5" /> {nbPrieres} {L.prieresEnv}
                                </span>
                                {m.created_at && (
                                  <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {L.inscrit} {new Date(m.created_at).toLocaleDateString(
                                      lang === "en" ? "en-US" : "fr-FR",
                                      { day: "numeric", month: "long", year: "numeric" })}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EspacePasteur;
