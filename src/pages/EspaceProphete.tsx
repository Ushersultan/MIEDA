import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Loader2, Crown, Home, Users, Church, Search, X, MapPin, Globe2,
  HeartHandshake, Megaphone, TrendingUp, ChevronDown, ChevronRight, Phone, Mail,
  Clock, CheckCircle2, Filter, ShieldAlert,
} from "lucide-react";
import { eglises, ordreRegions, type Eglise } from "@/data/eglises";
import { nomEglise } from "@/lib/serviteurs";

type Tab = "monde" | "eglises" | "prieres";

interface Profil {
  id: string;
  full_name: string;
  role: string;
  eglise_id: string | null;
  phone: string;
  ville: string;
  pays: string;
  photo_url: string | null;
  created_at?: string;
}

interface Priere {
  id: string;
  nom: string;
  demande: string;
  traitee: boolean;
  eglise_id: string | null;
  created_at: string;
}

const EspaceProphete = () => {
  const { user, loading: authLoading, profil } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("monde");
  const [profils, setProfils] = useState<Profil[]>([]);
  const [prieres, setPrieres] = useState<Priere[]>([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [regionSel, setRegionSel] = useState<string>("toutes");
  const [egliseOuverte, setEgliseOuverte] = useState<string | null>(null);

  const isProphete = profil?.role === "prophete" || profil?.role === "admin";

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const charger = useCallback(async () => {
    if (!isProphete) { setChargement(false); return; }
    setChargement(true);
    const [p, pr] = await Promise.all([
      supabase.from("profiles").select("id, full_name, role, eglise_id, phone, ville, pays, photo_url, created_at"),
      supabase.from("prieres").select("id, nom, demande, traitee, eglise_id, created_at").order("created_at", { ascending: false }).limit(200),
    ]);
    if (p.data) setProfils(p.data as Profil[]);
    if (pr.data) setPrieres(pr.data as Priere[]);
    setChargement(false);
  }, [isProphete]);

  useEffect(() => { charger(); }, [charger]);

  // ── Regrouper les profils par église ──
  const parEglise = useMemo(() => {
    const map = new Map<string, { pasteurs: Profil[]; membres: Profil[] }>();
    for (const p of profils) {
      if (!p.eglise_id) continue;
      if (!map.has(p.eglise_id)) map.set(p.eglise_id, { pasteurs: [], membres: [] });
      const g = map.get(p.eglise_id)!;
      if (p.role === "pasteur" || p.role === "admin" || p.role === "prophete") g.pasteurs.push(p);
      else g.membres.push(p);
    }
    return map;
  }, [profils]);

  // ── Églises filtrées avec leurs comptes ──
  const eglisesFiltrees = useMemo(() => {
    let res = eglises;
    if (regionSel !== "toutes") {
      if (regionSel === "international") res = res.filter((e) => e.pays !== "Côte d'Ivoire");
      else res = res.filter((e) => e.region === regionSel);
    }
    if (recherche.trim()) {
      const q = recherche.trim().toLowerCase();
      res = res.filter((e) =>
        e.nom.toLowerCase().includes(q) ||
        e.ville.toLowerCase().includes(q) ||
        e.pasteur.nom.toLowerCase().includes(q) ||
        (parEglise.get(e.id)?.pasteurs.some((p) => p.full_name.toLowerCase().includes(q))) ||
        (parEglise.get(e.id)?.membres.some((m) => m.full_name.toLowerCase().includes(q)))
      );
    }
    return res;
  }, [regionSel, recherche, parEglise]);

  // ── Statistiques ──
  const stats = useMemo(() => {
    const parPays = new Set(eglises.map((e) => e.pays));
    const membresConnectes = profils.filter((p) => p.role === "membre").length;
    const pasteursConnectes = profils.filter((p) => p.role === "pasteur").length;
    const prieresEnAttente = prieres.filter((p) => !p.traitee).length;
    const nouveauxMembres = profils.filter((p) => {
      if (p.role !== "membre" || !p.created_at) return false;
      return Date.now() - new Date(p.created_at).getTime() < 7 * 86400000;
    }).length;
    return {
      eglises: eglises.length,
      pays: parPays.size,
      pasteursTotal: eglises.length, // via registre
      pasteursConnectes,
      membresConnectes,
      prieresEnAttente,
      nouveauxMembres,
    };
  }, [profils, prieres]);

  // ── Prières filtrées ──
  const prieresFiltrees = useMemo(() => {
    let res = prieres;
    if (regionSel !== "toutes") {
      const idsRegion = new Set(eglises
        .filter((e) => regionSel === "international" ? e.pays !== "Côte d'Ivoire" : e.region === regionSel)
        .map((e) => e.id));
      res = res.filter((p) => p.eglise_id && idsRegion.has(p.eglise_id));
    }
    if (recherche.trim()) {
      const q = recherche.trim().toLowerCase();
      res = res.filter((p) => p.demande.toLowerCase().includes(q) || p.nom.toLowerCase().includes(q));
    }
    return res;
  }, [prieres, regionSel, recherche]);

  if (authLoading || chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isProphete) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Accès réservé</h1>
          <p className="text-muted-foreground mb-6">
            Cette page est réservée au Prophète Fondateur et aux administrateurs MIEDA.
          </p>
          <Link to="/"><Button variant="outline"><Home className="w-4 h-4 mr-2" /> Accueil</Button></Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: "monde", label: "Vue mondiale", icon: Globe2 },
    { id: "eglises", label: "Églises & Pasteurs", icon: Church, count: eglises.length },
    { id: "prieres", label: "Prières", icon: HeartHandshake, count: stats.prieresEnAttente },
  ];

  const regions = ["toutes", ...ordreRegions, "international"];

  return (
    <div className="min-h-screen bg-[var(--section-bg)]">
      {/* En-tête doré (couleur du bandeau prophétique) */}
      <div className="text-white pt-8 pb-16 bg-gradient-to-r from-yellow-900 via-amber-800 to-yellow-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <Link to="/profil" className="flex items-center gap-2 text-white/90 hover:text-white mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Mon espace
          </Link>
          <div className="flex items-center gap-4">
            {profil?.photo_url ? (
              <img src={profil.photo_url} alt="" className="w-16 h-16 rounded-full object-cover ring-4 ring-yellow-400/40" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-yellow-400/20 flex items-center justify-center backdrop-blur-sm ring-4 ring-yellow-400/40">
                <Crown className="w-8 h-8 text-yellow-200" />
              </div>
            )}
            <div>
              <p className="text-yellow-200/85 text-sm">Que le Seigneur bénisse votre ministère</p>
              <h1 className="text-2xl md:text-3xl font-bold">Espace Prophète</h1>
              <p className="text-yellow-100/85 text-sm mt-0.5">{profil?.full_name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl -mt-8 pb-16">
        <div className="bg-card rounded-2xl shadow-xl overflow-hidden">
          {/* Onglets */}
          <div className="flex border-b border-border overflow-x-auto">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  tab === t.id ? "border-yellow-600 text-yellow-700 dark:text-yellow-500" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                <t.icon className="w-4 h-4" />
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-yellow-600 text-white" : "bg-muted text-muted-foreground"}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* ═══════ VUE MONDIALE ═══════ */}
            {tab === "monde" && (
              <div className="space-y-8">
                <p className="text-sm text-muted-foreground">
                  Vue d'ensemble de la mission MIEDA à travers le monde
                </p>

                {/* Grands nombres */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30">
                    <Church className="w-6 h-6 text-yellow-700 dark:text-yellow-500 mb-2" />
                    <p className="text-3xl font-bold text-foreground">{stats.eglises}</p>
                    <p className="text-xs text-muted-foreground">Églises</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30">
                    <Globe2 className="w-6 h-6 text-primary mb-2" />
                    <p className="text-3xl font-bold text-foreground">{stats.pays}</p>
                    <p className="text-xs text-muted-foreground">Pays</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/30">
                    <Users className="w-6 h-6 text-accent mb-2" />
                    <p className="text-3xl font-bold text-foreground">{stats.pasteursConnectes}</p>
                    <p className="text-xs text-muted-foreground">Pasteurs actifs</p>
                    <p className="text-[10px] text-muted-foreground mt-1">/ {eglises.length} au total</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
                    <Users className="w-6 h-6 text-green-700 dark:text-green-500 mb-2" />
                    <p className="text-3xl font-bold text-foreground">{stats.membresConnectes}</p>
                    <p className="text-xs text-muted-foreground">Fidèles inscrits</p>
                    {stats.nouveauxMembres > 0 && (
                      <p className="text-[10px] text-green-600 font-medium mt-1">+{stats.nouveauxMembres} cette semaine</p>
                    )}
                  </div>
                </div>

                {/* Prières en attente */}
                {stats.prieresEnAttente > 0 && (
                  <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-3 mb-3">
                      <HeartHandshake className="w-6 h-6 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {stats.prieresEnAttente} prière{stats.prieresEnAttente > 1 ? "s" : ""} en attente
                        </p>
                        <p className="text-xs text-muted-foreground">À travers toutes les églises MIEDA</p>
                      </div>
                    </div>
                    <button onClick={() => setTab("prieres")}
                      className="text-sm text-primary font-medium hover:underline">
                      Voir toutes les prières →
                    </button>
                  </div>
                )}

                {/* Répartition par région */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Répartition par région
                  </p>
                  <div className="grid md:grid-cols-2 gap-2">
                    {ordreRegions.map((r) => {
                      const nb = eglises.filter((e) => e.region === r).length;
                      const pct = Math.round((nb / eglises.length) * 100);
                      return (
                        <div key={r} className="flex items-center gap-3">
                          <p className="text-sm text-foreground flex-1 truncate">{r}</p>
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-xs font-medium text-muted-foreground w-10 text-right">{nb}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════ ÉGLISES & PASTEURS ═══════ */}
            {tab === "eglises" && (
              <div>
                {/* Recherche + filtre région */}
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={recherche} onChange={(e) => setRecherche(e.target.value)}
                      placeholder="Rechercher une église, un pasteur, un fidèle..."
                      className="w-full pl-10 pr-9 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-600" />
                    {recherche && (
                      <button onClick={() => setRecherche("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <select value={regionSel} onChange={(e) => setRegionSel(e.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-600">
                    <option value="toutes">Toutes les régions</option>
                    {ordreRegions.map((r) => <option key={r} value={r}>{r}</option>)}
                    <option value="international">International</option>
                  </select>
                </div>

                <p className="text-xs text-muted-foreground mb-3">
                  {eglisesFiltrees.length} église{eglisesFiltrees.length > 1 ? "s" : ""}
                </p>

                {/* Liste églises pliables */}
                <div className="space-y-2">
                  {eglisesFiltrees.map((e) => {
                    const groupe = parEglise.get(e.id);
                    const nbPasteurs = groupe?.pasteurs.length ?? 0;
                    const nbMembres = groupe?.membres.length ?? 0;
                    const ouvert = egliseOuverte === e.id;
                    return (
                      <div key={e.id} className="rounded-xl border border-border bg-card">
                        <button onClick={() => setEgliseOuverte(ouvert ? null : e.id)}
                          className="w-full p-4 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors">
                          <span className="text-2xl">{e.drapeau}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">{e.nom}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                              <span>{e.pasteur.nom}</span>
                              {e.region && <span>· {e.region}</span>}
                              <span className="ml-auto flex items-center gap-2">
                                {nbPasteurs > 0 && <span className="text-primary font-medium">{nbPasteurs} 👨‍🏫</span>}
                                {nbMembres > 0 && <span className="text-green-600 font-medium">{nbMembres} 🙏</span>}
                              </span>
                            </p>
                          </div>
                          {ouvert ? <ChevronDown className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                        </button>

                        {ouvert && (
                          <div className="border-t border-border p-4 space-y-3">
                            {nbPasteurs === 0 && nbMembres === 0 ? (
                              <p className="text-sm text-muted-foreground italic">
                                Aucun compte enregistré pour cette église.
                              </p>
                            ) : (
                              <>
                                {groupe!.pasteurs.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                      Serviteurs ({groupe!.pasteurs.length})
                                    </p>
                                    <div className="space-y-1.5">
                                      {groupe!.pasteurs.map((p) => (
                                        <PersonneRow key={p.id} p={p} accent />
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {groupe!.membres.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                      Fidèles ({groupe!.membres.length})
                                    </p>
                                    <div className="space-y-1.5">
                                      {groupe!.membres.map((p) => (
                                        <PersonneRow key={p.id} p={p} />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═══════ PRIÈRES ═══════ */}
            {tab === "prieres" && (
              <div>
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={recherche} onChange={(e) => setRecherche(e.target.value)}
                      placeholder="Rechercher une prière ou un nom..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-600" />
                  </div>
                  <select value={regionSel} onChange={(e) => setRegionSel(e.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-600">
                    <option value="toutes">Toutes les régions</option>
                    {ordreRegions.map((r) => <option key={r} value={r}>{r}</option>)}
                    <option value="international">International</option>
                  </select>
                </div>

                <p className="text-xs text-muted-foreground mb-3">
                  {prieresFiltrees.length} prière{prieresFiltrees.length > 1 ? "s" : ""}
                </p>

                <div className="space-y-2">
                  {prieresFiltrees.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Aucune prière correspondante.</p>
                  )}
                  {prieresFiltrees.map((p) => (
                    <div key={p.id} className={`p-4 rounded-xl border ${
                      p.traitee ? "border-border bg-muted/30" : "border-primary/30 bg-card"
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground">{p.demande}</p>
                          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{p.nom}</span>
                            {p.eglise_id && <span>· {nomEglise(p.eglise_id)}</span>}
                            <span>· {new Date(p.created_at).toLocaleDateString("fr-FR")}</span>
                          </p>
                        </div>
                        {p.traitee ? (
                          <span className="text-xs text-green-600 flex items-center gap-1 flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Portée
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-3.5 h-3.5" /> En attente
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant ligne personne
const PersonneRow = ({ p, accent = false }: { p: Profil; accent?: boolean }) => (
  <div className={`flex items-center gap-3 p-2.5 rounded-lg ${accent ? "bg-primary/5" : "bg-muted/30"}`}>
    {p.photo_url ? (
      <img src={p.photo_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
    ) : (
      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground text-xs font-semibold flex items-center justify-center flex-shrink-0">
        {(p.full_name || "?").slice(0, 1).toUpperCase()}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground truncate">{p.full_name || "(sans nom)"}</p>
      <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
        {p.ville && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.ville}</span>}
        {p.pays && p.pays !== p.ville && <span>· {p.pays}</span>}
      </p>
    </div>
    {p.phone && (
      <a href={`tel:${p.phone.replace(/[^+\d]/g, "")}`}
         className="w-7 h-7 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors flex-shrink-0"
         aria-label="Appeler">
        <Phone className="w-3.5 h-3.5" />
      </a>
    )}
  </div>
);

export default EspaceProphete;
