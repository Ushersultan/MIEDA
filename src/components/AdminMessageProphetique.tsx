import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen, Download, Loader2, Send, Archive, Trash2, Eye, Sparkles,
  Calendar, CheckCircle2, AlertCircle,
} from "lucide-react";

// ════════════════════════════════════════════════════════════════
//  Publication du message prophétique de la semaine
//  Saisir « Psaume 91 » → les versets se chargent automatiquement
//  (français Louis Segond + anglais King James, domaine public).
//  Tout reste modifiable à la main avant publication.
// ════════════════════════════════════════════════════════════════

interface MessageDb {
  id: string;
  reference: string;
  reference_en: string | null;
  auteur: string;
  instruction: string;
  instruction_en: string | null;
  versets: string[];
  versets_en: string[];
  couleur: string;
  actif: boolean;
  date_debut: string | null;
  date_fin: string | null;
  created_at: string;
}

// « Psaume 91 » → { livre: "Psaume", chapitre: 91 }
const analyserReference = (ref: string): { livre: string; chapitre: number } | null => {
  const m = ref.trim().match(/^(.+?)\s+(\d{1,3})\s*$/);
  if (!m) return null;
  const chapitre = parseInt(m[2], 10);
  if (!chapitre) return null;
  return { livre: m[1].trim(), chapitre };
};

const dansNJours = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const AdminMessageProphetique = () => {
  const { toast } = useToast();

  const [reference, setReference] = useState("");
  const [referenceEn, setReferenceEn] = useState("");
  const [instruction, setInstruction] = useState("À lire 3 fois par jour cette semaine");
  const [instructionEn, setInstructionEn] = useState("To be read 3 times a day this week");
  const [auteur, setAuteur] = useState("Rév. Dr Prophète Djeha Kouadio");
  const [versetsFr, setVersetsFr] = useState("");
  const [versetsEn, setVersetsEn] = useState("");
  const [couleur, setCouleur] = useState("gold");
  const [dateDebut, setDateDebut] = useState(dansNJours(0));
  const [dateFin, setDateFin] = useState(dansNJours(7));

  const [chargement, setChargement] = useState(false);
  const [publication, setPublication] = useState(false);
  const [apercu, setApercu] = useState(false);
  const [historique, setHistorique] = useState<MessageDb[]>([]);

  const chargerHistorique = useCallback(async () => {
    const { data } = await supabase
      .from("messages_prophetiques")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12);
    if (data) setHistorique(data as MessageDb[]);
  }, []);

  useEffect(() => { chargerHistorique(); }, [chargerHistorique]);

  // ── Charger les versets depuis la bibliothèque biblique ──
  const chargerVersets = async () => {
    const parse = analyserReference(reference);
    if (!parse) {
      toast({
        title: "Référence incomplète",
        description: "Écrivez le livre puis le chapitre, par exemple « Psaume 91 ».",
        variant: "destructive",
      });
      return;
    }
    setChargement(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const entetes = { Authorization: "Bearer " + (session?.access_token ?? "") };

      const appel = async (langue: "fr" | "en") => {
        const rep = await fetch(
          `/api/bible?livre=${encodeURIComponent(parse.livre)}&chapitre=${parse.chapitre}&langue=${langue}`,
          { headers: entetes }
        );
        const json = await rep.json();
        if (!rep.ok) throw new Error(json.error ?? "Erreur");
        return json.versets as string[];
      };

      const fr = await appel("fr");
      setVersetsFr(fr.join("\n"));

      // L'anglais est un bonus : s'il échoue, le français suffit
      try {
        const en = await appel("en");
        setVersetsEn(en.join("\n"));
      } catch {
        toast({
          title: "Versets français chargés ✓",
          description: "La version anglaise n'a pas pu être récupérée — vous pouvez la saisir à la main.",
        });
        setChargement(false);
        return;
      }

      toast({ title: `${fr.length} versets chargés ✓` });
    } catch (e: any) {
      toast({ title: "Chargement impossible", description: e.message, variant: "destructive" });
    }
    setChargement(false);
  };

  // ── Publier : archive les anciens, active le nouveau ──
  const publier = async () => {
    const lignesFr = versetsFr.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!reference.trim() || lignesFr.length === 0) {
      toast({
        title: "Message incomplet",
        description: "Une référence et au moins un verset sont nécessaires.",
        variant: "destructive",
      });
      return;
    }
    setPublication(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Archiver les messages actuellement actifs
      await supabase.from("messages_prophetiques")
        .update({ actif: false }).eq("actif", true);

      const { error } = await supabase.from("messages_prophetiques").insert({
        reference: reference.trim(),
        reference_en: referenceEn.trim() || null,
        auteur: auteur.trim(),
        instruction: instruction.trim(),
        instruction_en: instructionEn.trim() || null,
        versets: lignesFr,
        versets_en: versetsEn.split("\n").map((l) => l.trim()).filter(Boolean),
        couleur,
        actif: true,
        date_debut: dateDebut || null,
        date_fin: dateFin || null,
        cree_par: user?.id ?? null,
      });
      if (error) throw error;

      toast({
        title: "Message publié ✓",
        description: "Il s'affiche dès maintenant sur la page d'accueil.",
      });
      chargerHistorique();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
    setPublication(false);
  };

  const archiver = async (id: string) => {
    const { error } = await supabase.from("messages_prophetiques")
      .update({ actif: false }).eq("id", id);
    if (!error) { toast({ title: "Message archivé" }); chargerHistorique(); }
  };

  const reactiver = async (id: string) => {
    await supabase.from("messages_prophetiques").update({ actif: false }).eq("actif", true);
    const { error } = await supabase.from("messages_prophetiques")
      .update({ actif: true }).eq("id", id);
    if (!error) { toast({ title: "Message réactivé ✓" }); chargerHistorique(); }
  };

  const supprimer = async (id: string) => {
    if (!confirm("Supprimer définitivement ce message ?")) return;
    const { error } = await supabase.from("messages_prophetiques").delete().eq("id", id);
    if (!error) { toast({ title: "Message supprimé" }); chargerHistorique(); }
  };

  const nbFr = versetsFr.split("\n").filter((l) => l.trim()).length;
  const nbEn = versetsEn.split("\n").filter((l) => l.trim()).length;

  const champ = (label: string, valeur: string, set: (v: string) => void, ph = "") => (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      <input type="text" value={valeur} onChange={(e) => set(e.target.value)} placeholder={ph}
        className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ── Référence + chargement automatique ── */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-primary" /> Message de la semaine
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Saisissez le livre et le chapitre — les versets se chargent automatiquement
          en français (Louis Segond) et en anglais (King James).
        </p>
        <div className="flex gap-2 flex-wrap">
          <input type="text" value={reference}
            onChange={(e) => setReference(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && chargerVersets()}
            placeholder="Psaume 91"
            className="flex-1 min-w-[200px] px-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          <Button onClick={chargerVersets} disabled={chargement || !reference.trim()}>
            {chargement
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><Download className="w-4 h-4 mr-1.5" /> Charger les versets</>}
          </Button>
        </div>
      </div>

      {/* ── Détails ── */}
      <div className="grid md:grid-cols-2 gap-4">
        {champ("Référence anglaise", referenceEn, setReferenceEn, "Psalm 91")}
        {champ("Auteur", auteur, setAuteur)}
        {champ("Instruction (français)", instruction, setInstruction)}
        {champ("Instruction (anglais)", instructionEn, setInstructionEn)}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Affiché du
          </label>
          <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Jusqu'au
          </label>
          <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      {/* ── Couleur du bandeau ── */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Couleur du bandeau
        </label>
        <div className="flex gap-2">
          {([["gold", "Doré"], ["primary", "Bleu"], ["vert", "Vert"]] as const).map(([val, lbl]) => (
            <button key={val} onClick={() => setCouleur(val)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                couleur === val
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-foreground hover:border-primary"
              }`}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* ── Versets modifiables ── */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Versets — français</span>
            <span className={nbFr > 0 ? "text-primary" : ""}>{nbFr} verset(s)</span>
          </label>
          <textarea value={versetsFr} onChange={(e) => setVersetsFr(e.target.value)}
            rows={12} placeholder={"1 — Celui qui demeure sous l'abri du Très-Haut...\n2 — Je dis à l'Éternel : Mon refuge..."}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary resize-y" />
          <p className="text-[11px] text-muted-foreground mt-1">Un verset par ligne.</p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Versets — anglais</span>
            <span className={nbEn > 0 ? "text-primary" : ""}>{nbEn} verse(s)</span>
          </label>
          <textarea value={versetsEn} onChange={(e) => setVersetsEn(e.target.value)}
            rows={12} placeholder={"1 — He that dwelleth in the secret place..."}
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary resize-y" />
          <p className="text-[11px] text-muted-foreground mt-1">Facultatif — le site retombe sur le français.</p>
        </div>
      </div>

      {nbFr > 0 && nbEn > 0 && nbFr !== nbEn && (
        <p className="text-xs text-yellow-600 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          Le nombre de versets diffère entre les deux langues ({nbFr} / {nbEn}).
        </p>
      )}

      {/* ── Aperçu ── */}
      <div>
        <button onClick={() => setApercu(!apercu)}
          className="text-sm text-primary font-medium hover:underline flex items-center gap-1.5">
          <Eye className="w-4 h-4" /> {apercu ? "Masquer l'aperçu" : "Voir l'aperçu du bandeau"}
        </button>
        {apercu && nbFr > 0 && (
          <div className={`mt-3 rounded-xl p-5 text-white bg-gradient-to-r ${
            couleur === "gold" ? "from-yellow-900 via-yellow-800 to-amber-900"
            : couleur === "vert" ? "from-green-900 via-green-800 to-emerald-900"
            : "from-blue-900 via-blue-800 to-indigo-900"
          }`}>
            <p className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Message du Prophète · {reference || "—"}
            </p>
            <p className="text-xs opacity-70 mt-1.5">{instruction}</p>
            <p className="text-base mt-3 leading-relaxed">
              {versetsFr.split("\n").filter(Boolean)[0]}
            </p>
            <p className="text-[10px] opacity-60 mt-3">— {auteur}</p>
          </div>
        )}
      </div>

      <Button onClick={publier} disabled={publication || nbFr === 0} size="lg" className="w-full">
        {publication
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <><Send className="w-4 h-4 mr-2" /> Publier sur le site</>}
      </Button>

      {/* ── Historique ── */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Messages publiés
        </p>
        {historique.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Aucun message publié depuis l'administration.
            Le site affiche celui du fichier de secours.
          </p>
        ) : (
          <div className="space-y-2">
            {historique.map((m) => (
              <div key={m.id} className={`p-3 rounded-lg border flex items-center gap-3 flex-wrap ${
                m.actif ? "border-primary/40 bg-primary/5" : "border-border bg-card"
              }`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    {m.reference}
                    {m.actif && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        EN LIGNE
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap mt-0.5">
                    <span>{m.versets?.length ?? 0} versets</span>
                    {m.date_debut && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(m.date_debut).toLocaleDateString("fr-FR")}
                        {m.date_fin && " → " + new Date(m.date_fin).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {m.actif ? (
                    <button onClick={() => archiver(m.id)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/70 transition-colors">
                      <Archive className="w-3.5 h-3.5 inline mr-1" /> Archiver
                    </button>
                  ) : (
                    <button onClick={() => reactiver(m.id)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> Remettre en ligne
                    </button>
                  )}
                  <button onClick={() => supprimer(m.id)}
                    className="w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessageProphetique;
