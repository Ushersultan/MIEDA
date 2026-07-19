import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Loader2, ShieldAlert, Home, Users, Church, KeyRound, Copy, Check,
  Send, Search, X, MapPin, Calendar, Clock, RefreshCw, TrendingUp, Mail,
  UserPlus, UserMinus, Sparkles, Filter, Download,
} from "lucide-react";
import { eglises, ordreRegions } from "@/data/eglises";
import { nomEglise } from "@/lib/serviteurs";

type Tab = "codes" | "membres" | "stats";

interface CodePasteur {
  code: string;
  eglise_id: string;
  description: string | null;
  actif: boolean;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
}

interface Profil {
  id: string;
  full_name: string;
  role: string;
  eglise_id: string | null;
  phone: string;
  ville: string;
  photo_url: string | null;
  created_at?: string;
}


// ── Détection des serviteurs : comparaison de noms tolérante ──
const MOTS_IGNORES = new Set([
  "rev", "reverend", "dr", "docteur", "pasteur", "pasteure", "prophete",
  "evangeliste", "apotre", "mme", "mr", "frere", "soeur", "ancien", "diacre",
  "le", "la", "les", "de", "du", "des", "et",
]);

const tokensNom = (t: string): string[] =>
  (t || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !MOTS_IGNORES.has(w));

// Registre officiel : serviteur principal + équipe de chaque église
const REGISTRE: { egliseId: string; nom: string; tokens: string[] }[] = eglises.flatMap((e) => [
  { egliseId: e.id, nom: e.pasteur.nom, tokens: tokensNom(e.pasteur.nom) },
  ...(e.equipe ?? []).map((m) => ({ egliseId: e.id, nom: m.nom, tokens: tokensNom(m.nom) })),
]);

const Admin = () => {
  const { user, loading: authLoading, profil } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tab, setTab] = useState<Tab>("codes");
  const [codes, setCodes] = useState<CodePasteur[]>([]);
  const [profils, setProfils] = useState<Profil[]>([]);
  const [chargement, setChargement] = useState(true);
  const [filtre, setFiltre] = useState<"tous" | "actives" | "attente">("tous");
  const [recherche, setRecherche] = useState("");
  const [codeCopie, setCodeCopie] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Génération de code
  const [gEglise, setGEglise] = useState("");
  const [gDescription, setGDescription] = useState("");

  const isAdmin = profil?.role === "admin";

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const charger = useCallback(async () => {
    if (!isAdmin) { setChargement(false); return; }
    setChargement(true);
    const [c, p] = await Promise.all([
      supabase.from("codes_pasteur").select("*").order("eglise_id", { ascending: true }),
      supabase.from("profiles").select("id, full_name, role, eglise_id, phone, ville, photo_url, created_at")
        .order("created_at", { ascending: false }),
    ]);
    if (c.data) setCodes(c.data as CodePasteur[]);
    if (p.data) setProfils(p.data as Profil[]);
    setChargement(false);
  }, [isAdmin]);

  useEffect(() => { charger(); }, [charger]);

  // Rafraîchit automatiquement au retour sur l'onglet (nouveaux inscrits visibles sans F5)
  useEffect(() => {
    const onFocus = () => { if (document.visibilityState === "visible") charger(); };
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [charger]);

  // ── Actions ──
  const copier = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCodeCopie(code);
      setTimeout(() => setCodeCopie(null), 1500);
    } catch { /* noop */ }
  };

  const genererMessage = (c: CodePasteur) => {
    const eglise = nomEglise(c.eglise_id) || c.eglise_id;
    const nomPasteur = c.description?.split("—")[0].trim() || "Pasteur";
    return `Shalom ${nomPasteur} 🙏

Voici votre code d'accès au nouvel Espace Pasteur du site MIEDA :

*${c.code}*

Étapes :
1. Allez sur eglisesmieda.org
2. Cliquez "Se Connecter" puis "Créer un compte"
3. Cochez "Je suis serviteur MIEDA" et entrez ce code
4. Votre Espace Pasteur (${eglise}) s'activera automatiquement

Le code est à usage unique et personnel — ne le partagez pas.

Que Dieu vous bénisse dans votre ministère 🙏`;
  };

  const partagerWhatsApp = (c: CodePasteur) => {
    const message = encodeURIComponent(genererMessage(c));
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const partagerEmail = (c: CodePasteur) => {
    const message = encodeURIComponent(genererMessage(c));
    const sujet = encodeURIComponent(`Code d'accès Espace Pasteur MIEDA — ${c.eglise_id}`);
    window.open(`mailto:?subject=${sujet}&body=${message}`, "_blank");
  };

  const genererCode = async () => {
    if (!gEglise || !gDescription.trim()) return;
    setBusy(true);
    const { data: res, error } = await supabase.rpc("admin_generer_code", {
      p_eglise_id: gEglise, p_description: gDescription.trim(),
    });
    if (error || res === "refuse") {
      toast({ title: "Erreur", description: error?.message ?? "Refusé", variant: "destructive" });
    } else {
      toast({ title: `Code créé : ${res}` });
      setGDescription("");
      charger();
    }
    setBusy(false);
  };

  const promouvoir = async (uid: string, egliseId: string) => {
    const { error } = await supabase.rpc("admin_promouvoir_pasteur", {
      p_user_id: uid, p_eglise_id: egliseId,
    });
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else { toast({ title: "Promu pasteur ✓" }); charger(); }
  };

  const retrograder = async (uid: string) => {
    if (!confirm("Retirer le rôle pasteur à ce compte ?")) return;
    const { error } = await supabase.rpc("admin_retrograder", { p_user_id: uid });
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else { toast({ title: "Rétrogradé ✓" }); charger(); }
  };

  const exporterCSV = () => {
    const lignes = ["code,eglise_id,description,statut,used_at"];
    for (const c of codesFiltres) {
      const statut = c.used_by ? "activé" : c.actif ? "en attente" : "expiré";
      lignes.push(`"${c.code}","${c.eglise_id}","${(c.description || "").replace(/"/g, '""')}","${statut}","${c.used_at || ""}"`);
    }
    const blob = new Blob([lignes.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codes-pasteurs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Filtres ──
  const codesFiltres = useMemo(() => {
    let res = codes;
    if (filtre === "actives") res = res.filter((c) => c.used_by);
    if (filtre === "attente") res = res.filter((c) => !c.used_by && c.actif);
    if (recherche.trim()) {
      const q = recherche.trim().toLowerCase();
      res = res.filter((c) =>
        c.code.toLowerCase().includes(q) ||
        c.eglise_id.toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q) ||
        (nomEglise(c.eglise_id) || "").toLowerCase().includes(q)
      );
    }
    return res;
  }, [codes, filtre, recherche]);

  const profilsFiltres = useMemo(() => {
    if (!recherche.trim()) return profils;
    const q = recherche.trim().toLowerCase();
    return profils.filter((p) =>
      (p.full_name || "").toLowerCase().includes(q) ||
      (p.ville || "").toLowerCase().includes(q) ||
      (p.role || "").toLowerCase().includes(q) ||
      (nomEglise(p.eglise_id) || "").toLowerCase().includes(q)
    );
  }, [profils, recherche]);

  // ── Statistiques ──
  const stats = useMemo(() => {
    const total = codes.length;
    const actives = codes.filter((c) => c.used_by).length;
    const attente = codes.filter((c) => !c.used_by && c.actif).length;
    const pourcent = total ? Math.round((actives / total) * 100) : 0;
    const derniers = codes
      .filter((c) => c.used_at)
      .sort((a, b) => new Date(b.used_at!).getTime() - new Date(a.used_at!).getTime())
      .slice(0, 5);
    const il_y_a_7j = Date.now() - 7 * 86400000;
    return {
      total, actives, attente, pourcent, derniers,
      membres: profils.filter((p) => p.role === "membre").length,
      pasteurs: profils.filter((p) => p.role === "pasteur").length,
      admins: profils.filter((p) => p.role === "admin").length,
      nouveaux: profils.filter((p) => p.created_at && new Date(p.created_at).getTime() > il_y_a_7j),
    };
  }, [codes, profils]);

  // ── Membres dont le nom figure au registre des serviteurs ──
  const serviteursDetectes = useMemo(() => {
    const res: { profil: Profil; eglises: { id: string; nom: string }[] }[] = [];
    for (const p of profils) {
      if (p.role !== "membre" || !p.full_name) continue;
      const tp = tokensNom(p.full_name);
      if (tp.length < 2) continue;
      const trouves = REGISTRE.filter(
        (r) => r.tokens.filter((t) => tp.includes(t)).length >= 2
      );
      if (trouves.length === 0) continue;
      const parEglise = new Map<string, string>();
      for (const t of trouves) parEglise.set(t.egliseId, t.nom);
      res.push({
        profil: p,
        eglises: [...parEglise].map(([id, nom]) => ({ id, nom })),
      });
    }
    return res;
  }, [profils]);

  // Options d'églises groupées par région pour le sélecteur
  const eglisesOptions = useMemo(() => {
    const civ = eglises.filter((e) => e.pays === "Côte d'Ivoire");
    const groupes = ordreRegions.map((r) => ({
      groupe: `Région ${r}`,
      options: civ.filter((e) => e.region === r).sort((a, b) => a.nom.localeCompare(b.nom)),
    })).filter((g) => g.options.length > 0);
    const intl = eglises.filter((e) => e.pays !== "Côte d'Ivoire");
    if (intl.length > 0) groupes.push({ groupe: "International", options: intl });
    return groupes;
  }, []);

  if (authLoading || chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Accès réservé</h1>
          <p className="text-muted-foreground mb-6">
            Cette page est réservée aux administrateurs MIEDA.
          </p>
          <Link to="/"><Button variant="outline"><Home className="w-4 h-4 mr-2" /> Accueil</Button></Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: "codes", label: "Codes serviteurs", icon: KeyRound, count: stats.attente },
    { id: "membres", label: "Utilisateurs", icon: Users, count: profils.length },
    { id: "stats", label: "Statistiques", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[var(--section-bg)]">
      {/* En-tête */}
      <div className="text-white pt-8 pb-16" style={{ background: "var(--hero-gradient)" }}>
        <div className="container mx-auto px-4 max-w-6xl">
          <Link to="/profil" className="flex items-center gap-2 text-white/90 hover:text-white mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Mon espace
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Administration MIEDA</h1>
              <p className="text-white/85 text-sm mt-1">
                {stats.actives} / {stats.total} codes activés · {profils.length} comptes
              </p>
            </div>
            <button onClick={charger}
              className="ml-auto w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Actualiser">
              <RefreshCw className="w-4 h-4" />
            </button>
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
            {/* ═══════ CODES SERVITEURS ═══════ */}
            {tab === "codes" && (
              <div>
                {/* Barre de recherche + filtres + export */}
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={recherche} onChange={(e) => setRecherche(e.target.value)}
                      placeholder="Rechercher code, église, pasteur..."
                      className="w-full pl-10 pr-9 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                    {recherche && (
                      <button onClick={() => setRecherche("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(["tous", "attente", "actives"] as const).map((f) => (
                      <button key={f} onClick={() => setFiltre(f)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          filtre === f ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-foreground hover:border-primary"
                        }`}>
                        {f === "tous" ? "Tous" : f === "attente" ? "⏳ En attente" : "✓ Activés"}
                      </button>
                    ))}
                    <Button onClick={exporterCSV} size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1.5" /> CSV
                    </Button>
                  </div>
                </div>

                {/* Générer un nouveau code */}
                <details className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <summary className="cursor-pointer text-sm font-medium text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Générer un nouveau code
                  </summary>
                  <div className="mt-4 grid md:grid-cols-2 gap-3">
                    <select value={gEglise} onChange={(e) => setGEglise(e.target.value)}
                      className="px-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">— Choisir une église —</option>
                      {eglisesOptions.map((g) => (
                        <optgroup key={g.groupe} label={g.groupe}>
                          {g.options.map((e) => (
                            <option key={e.id} value={e.id}>{e.nom}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <input type="text" value={gDescription} onChange={(e) => setGDescription(e.target.value)}
                      placeholder="Nom du serviteur (ex: Pasteur Yao Kouadio Paul)"
                      className="px-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <Button onClick={genererCode} disabled={busy || !gEglise || !gDescription.trim()} className="mt-3 w-full">
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Générer le code"}
                  </Button>
                </details>

                {/* Liste des codes */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    {codesFiltres.length} code{codesFiltres.length > 1 ? "s" : ""}
                    {filtre !== "tous" && ` · ${filtre === "attente" ? "en attente" : "activés"}`}
                  </p>
                  {codesFiltres.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Aucun code correspondant.</p>
                  )}
                  {codesFiltres.map((c) => {
                    const active = !!c.used_by;
                    return (
                      <div key={c.code} className={`p-4 rounded-xl border transition-colors ${
                        active ? "border-border bg-muted/30" : "border-primary/30 bg-card"
                      }`}>
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <code className="font-mono text-sm font-bold text-foreground bg-muted px-2 py-0.5 rounded">
                                {c.code}
                              </code>
                              {active ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                  ✓ ACTIVÉ
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                  ⏳ EN ATTENTE
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-foreground">{c.description}</p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                              <Church className="w-3 h-3" />
                              {nomEglise(c.eglise_id) || c.eglise_id}
                              {active && c.used_at && (
                                <span className="ml-2">
                                  · Activé le {new Date(c.used_at).toLocaleDateString("fr-FR")}
                                </span>
                              )}
                            </p>
                          </div>
                          {!active && (
                            <div className="flex gap-1.5 flex-shrink-0">
                              <button onClick={() => copier(c.code)}
                                className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors"
                                aria-label="Copier le code">
                                {codeCopie === c.code ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                              </button>
                              <button onClick={() => partagerWhatsApp(c)}
                                className="px-3 h-8 rounded-lg bg-green-600 text-white text-xs font-medium flex items-center gap-1.5 hover:bg-green-700 transition-colors">
                                <Send className="w-3.5 h-3.5" /> WhatsApp
                              </button>
                              <button onClick={() => partagerEmail(c)}
                                className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors"
                                aria-label="Envoyer par email">
                                <Mail className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═══════ UTILISATEURS ═══════ */}
            {tab === "membres" && (
              <div>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={recherche} onChange={(e) => setRecherche(e.target.value)}
                    placeholder="Rechercher par nom, ville, rôle, église..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                {stats.nouveaux.length > 0 && (
                  <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                      <UserPlus className="w-4 h-4 text-green-600" />
                      {stats.nouveaux.length} nouvelle{stats.nouveaux.length > 1 ? "s" : ""} inscription{stats.nouveaux.length > 1 ? "s" : ""} cette semaine
                    </p>
                    <div className="space-y-1.5">
                      {stats.nouveaux.slice(0, 6).map((p) => (
                        <div key={p.id} className="flex items-center gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600 flex-shrink-0" />
                          <span className="text-foreground truncate">{p.full_name || "(sans nom)"}</span>
                          <span className="text-xs text-muted-foreground truncate">
                            {p.eglise_id ? nomEglise(p.eglise_id) : "église non renseignée"}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                            {new Date(p.created_at!).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {serviteursDetectes.length > 0 && (
                  <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-primary" />
                      {serviteursDetectes.length} serviteur{serviteursDetectes.length > 1 ? "s" : ""} inscrit{serviteursDetectes.length > 1 ? "s" : ""} comme membre
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Ces comptes portent le nom d'un serviteur du registre officiel.
                      Activez leur Espace Pasteur en un clic — rien ne leur sera demandé.
                    </p>
                    <div className="space-y-2">
                      {serviteursDetectes.map(({ profil: sp, eglises: opts }) => (
                        <div key={sp.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card flex-wrap">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{sp.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {sp.eglise_id
                                ? "A choisi : " + nomEglise(sp.eglise_id)
                                : "Aucune église choisie"}
                            </p>
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            {opts.map((o) => (
                              <button key={o.id}
                                onClick={() => promouvoir(sp.id, o.id)}
                                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                                Activer · {nomEglise(o.id) ?? o.id}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                    <p className="text-2xl font-bold text-foreground">{stats.membres}</p>
                    <p className="text-xs text-muted-foreground">Membres</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
                    <p className="text-2xl font-bold text-primary">{stats.pasteurs}</p>
                    <p className="text-xs text-muted-foreground">Pasteurs</p>
                  </div>
                  <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 text-center">
                    <p className="text-2xl font-bold text-accent">{stats.admins}</p>
                    <p className="text-xs text-muted-foreground">Admins</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{profilsFiltres.length} compte{profilsFiltres.length > 1 ? "s" : ""}</p>
                <div className="space-y-2">
                  {profilsFiltres.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                      {p.photo_url ? (
                        <img src={p.photo_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center flex-shrink-0">
                          {(p.full_name || "?").slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.full_name || "(sans nom)"}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p.role === "admin" ? "bg-accent/20 text-accent"
                            : p.role === "pasteur" ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                          }`}>{p.role.toUpperCase()}</span>
                          {p.eglise_id && <span className="flex items-center gap-1"><Church className="w-3 h-3" />{nomEglise(p.eglise_id)}</span>}
                          {p.ville && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.ville}</span>}
                        </p>
                      </div>
                      {p.role === "membre" && p.eglise_id && (
                        <button onClick={() => promouvoir(p.id, p.eglise_id!)}
                          className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                          title="Promouvoir pasteur">
                          <UserPlus className="w-3 h-3 inline" />
                        </button>
                      )}
                      {p.role === "pasteur" && (
                        <button onClick={() => retrograder(p.id)}
                          className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          aria-label="Rétrograder">
                          <UserMinus className="w-3 h-3 inline" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════ STATISTIQUES ═══════ */}
            {tab === "stats" && (
              <div className="space-y-6">
                {/* Progression */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">Progression des activations</p>
                    <p className="text-lg font-bold text-primary">{stats.pourcent}%</p>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${stats.pourcent}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>{stats.actives} activés</span>
                    <span>{stats.attente} en attente</span>
                    <span>{stats.total} au total</span>
                  </div>
                </div>

                {/* Grands nombres */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-xl bg-card border border-border">
                    <Users className="w-6 h-6 text-primary mb-2" />
                    <p className="text-3xl font-bold text-foreground">{profils.length}</p>
                    <p className="text-sm text-muted-foreground">Comptes totaux</p>
                  </div>
                  <div className="p-5 rounded-xl bg-card border border-border">
                    <Church className="w-6 h-6 text-primary mb-2" />
                    <p className="text-3xl font-bold text-foreground">{eglises.length}</p>
                    <p className="text-sm text-muted-foreground">Églises</p>
                  </div>
                  <div className="p-5 rounded-xl bg-card border border-border">
                    <Clock className="w-6 h-6 text-primary mb-2" />
                    <p className="text-3xl font-bold text-foreground">{stats.derniers.length}</p>
                    <p className="text-sm text-muted-foreground">Activations récentes</p>
                  </div>
                </div>

                {/* Dernières activations */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Dernières activations
                  </p>
                  {stats.derniers.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">Aucune activation encore.</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.derniers.map((c) => (
                        <div key={c.code} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{c.description}</p>
                            <p className="text-xs text-muted-foreground">{nomEglise(c.eglise_id)}</p>
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {new Date(c.used_at!).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
