import { useEffect, useRef, useState, useCallback } from "react";
import {
  Play, Pause, Volume2, VolumeX, X, ChevronLeft, ChevronRight,
  BookOpen, Repeat, Sparkles, CheckCircle2, Quote,
} from "lucide-react";
import { messagesProphetiques, type MessageProphetique as TMessage } from "@/data/messages-prophetiques";
import { useLang } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

// Sépare un verset « 12 — texte », « 12 texte », « 12. texte » ou « texte »
// en { num, corps } de façon robuste (évite le doublage d'affichage).
const decouperVerset = (v: string): { num: string; corps: string } => {
  const m = (v ?? "").match(/^\s*(\d+)\s*[—–\-.:)]*\s*([\s\S]*)$/);
  if (m && m[1]) return { num: m[1], corps: m[2].trim() };
  return { num: "", corps: (v ?? "").trim() };
};


const messageActif = (): TMessage | null => {
  const now = new Date();
  return messagesProphetiques.find((m) => {
    if (!m.actif) return false;
    if (m.dateDebut && new Date(m.dateDebut) > now) return false;
    if (m.dateFin && new Date(m.dateFin + "T23:59:59") < now) return false;
    return true;
  }) ?? null;
};

const PALETTES = {
  gold: {
    bg: "from-yellow-900/95 via-yellow-800/90 to-amber-900/95",
    border: "border-yellow-500/40",
    badge: "bg-yellow-500/20 text-yellow-200 border-yellow-400/30",
    sous: "text-yellow-200/80",
    verset: "text-yellow-100",
    ref: "text-yellow-300",
    progress: "bg-yellow-400",
    btn: "bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-100 border-yellow-400/30",
    btnActif: "bg-yellow-400 text-yellow-900",
    glow: "shadow-yellow-500/20",
  },
  primary: {
    bg: "from-blue-900/95 via-blue-800/90 to-indigo-900/95",
    border: "border-blue-400/40",
    badge: "bg-blue-500/20 text-blue-100 border-blue-400/30",
    sous: "text-blue-200/80",
    verset: "text-blue-100",
    ref: "text-blue-300",
    progress: "bg-blue-400",
    btn: "bg-blue-500/20 hover:bg-blue-500/40 text-blue-100 border-blue-400/30",
    btnActif: "bg-blue-400 text-blue-900",
    glow: "shadow-blue-500/20",
  },
  vert: {
    bg: "from-green-900/95 via-green-800/90 to-emerald-900/95",
    border: "border-green-400/40",
    badge: "bg-green-500/20 text-green-100 border-green-400/30",
    sous: "text-green-200/80",
    verset: "text-green-100",
    ref: "text-green-300",
    progress: "bg-green-400",
    btn: "bg-green-500/20 hover:bg-green-500/40 text-green-100 border-green-400/30",
    btnActif: "bg-green-400 text-green-900",
    glow: "shadow-green-500/20",
  },
};

const DELAI_MS = 7000;      // défilement visuel : 7 s / verset
const MAX_BOUCLES = 3;      // la lecture audio s'arrête après 3 tours complets

const MessageProphetique = () => {
  const { lang, t } = useLang();
  // Message du fichier local = secours ; Supabase = source prioritaire
  const [message, setMessage] = useState<TMessage | null>(() => messageActif());
  const [photoProphete, setPhotoProphete] = useState<string | null>(null);

  const [visible, setVisible] = useState(true);
  const [versetIdx, setVersetIdx] = useState(0);
  const [defilAuto, setDefilAuto] = useState(true);
  const [muet, setMuet] = useState(false);
  const [lectureSynth, setLectureSynth] = useState(false);
  const [decompte, setDecompte] = useState(0);        // tours audio du cycle courant (max 3)
  const [cycleFini, setCycleFini] = useState(false);  // 3× atteint → invite à réécouter
  const [progression, setProgression] = useState(0);

  const boucleRef = useRef(false);
  const toursRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Source prioritaire : message publié depuis l'Espace Admin
  useEffect(() => {
    let annule = false;
    supabase
      .from("messages_prophetiques")
      .select("reference, reference_en, auteur, instruction, instruction_en, versets, versets_en, couleur, date_debut, date_fin")
      .eq("actif", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (annule || !data?.length) return;
        const m: any = data[0];
        const auj = new Date().toISOString().slice(0, 10);
        if (m.date_debut && m.date_debut > auj) return;
        if (m.date_fin && m.date_fin < auj) return;
        if (!Array.isArray(m.versets) || m.versets.length === 0) return;
        setMessage({
          id: "supabase",
          titre: "Message du Prophète",
          reference: m.reference,
          referenceEn: m.reference_en ?? undefined,
          auteur: m.auteur,
          instruction: m.instruction,
          instructionEn: m.instruction_en ?? undefined,
          versets: m.versets,
          versetsEn: (m.versets_en ?? []).length ? m.versets_en : undefined,
          couleur: (m.couleur ?? "gold") as TMessage["couleur"],
          actif: true,
        });
        setVersetIdx(0);
      });
    return () => { annule = true; };
  }, []);

  // Photo publique du compte Prophète enregistrée dans Supabase.
  useEffect(() => {
    let annule = false;
    supabase.rpc("photos_pasteurs").then(({ data }) => {
      if (annule || !data?.length) return;
      const lignes = data as Array<{ full_name?: string; photo_url?: string }>;
      const prophete = lignes.find((p) =>
        Boolean(p.photo_url) && /proph[eè]te.*djeha|djeha.*proph[eè]te/i.test(p.full_name ?? "")
      );
      if (prophete?.photo_url) setPhotoProphete(prophete.photo_url);
    });
    return () => { annule = true; };
  }, []);

  // Versets selon la langue (repli sur le français si pas de version EN)
  const versets = (lang === "en" && message?.versetsEn?.length ? message.versetsEn : message?.versets) ?? [];
  const reference = lang === "en" && message?.referenceEn ? message.referenceEn : message?.reference ?? "";
  const instruction = lang === "en" && message?.instructionEn ? message.instructionEn : message?.instruction ?? "";
  const total = versets.length;

  // ── Lecture audio en boucle, arrêt auto après 3 tours ──
  const lireVerset = useCallback((idx: number) => {
    if (!message) return;
    // speechSynthesis peut exister mais ne pas fonctionner dans le WebView Capacitor
    const synthDispo = "speechSynthesis" in window && typeof window.speechSynthesis?.speak === "function";
    if (!synthDispo) {
      console.warn("Synthèse vocale non disponible dans cet environnement");
      return;
    }
    const liste = (lang === "en" && message.versetsEn?.length ? message.versetsEn : message.versets);
    const texte = liste[idx];
    const { num, corps } = decouperVerset(texte);
    const utter = new SpeechSynthesisUtterance(
      lang === "en" ? `Verse ${num}. ${corps}` : `Verset ${num}. ${corps}`
    );
    utter.lang = lang === "en" ? "en-US" : "fr-FR";
    utter.rate = 0.85;
    utter.pitch = 1;
    utter.onend = () => {
      if (!boucleRef.current) return;
      const suivant = (idx + 1) % liste.length;
      if (suivant === 0) {
        toursRef.current += 1;
        setDecompte(toursRef.current);
        if (toursRef.current >= MAX_BOUCLES) {
          // 🛑 3 tours complets → arrêt automatique
          boucleRef.current = false;
          setLectureSynth(false);
          setCycleFini(true);
          setVersetIdx(0);
          setProgression(0);
          return;
        }
      }
      setVersetIdx(suivant);
      setProgression(0);
      lireVerset(suivant); // 🔁 enchaîne
    };
    window.speechSynthesis.speak(utter);
  }, [message, lang]);

  const demarrerLecture = useCallback((depuis: number) => {
    try { window.speechSynthesis?.cancel(); } catch { /* WebView */ }
    boucleRef.current = true;
    toursRef.current = 0;      // nouveau cycle de 3
    setDecompte(0);
    setCycleFini(false);
    setLectureSynth(true);
    setDefilAuto(false);
    lireVerset(depuis);
  }, [lireVerset]);

  const arreterLecture = useCallback(() => {
    boucleRef.current = false;
    try { window.speechSynthesis?.cancel(); } catch { /* WebView */ }
    setLectureSynth(false);
  }, []);

  const toggleAudio = () => {
    if (lectureSynth) arreterLecture();
    else if (!muet) demarrerLecture(cycleFini ? 0 : versetIdx);
  };

  const aller = (idx: number) => {
    setVersetIdx(idx);
    setProgression(0);
    if (lectureSynth) {
      try { window.speechSynthesis?.cancel(); } catch { /* WebView */ }
      lireVerset(idx);
    }
  };

  // Si la langue change pendant la lecture → on relit dans la nouvelle langue
  useEffect(() => {
    if (lectureSynth) {
      try { window.speechSynthesis?.cancel(); } catch { /* WebView */ }
      lireVerset(versetIdx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // ── Défilement visuel (quand l'audio est éteint) ──
  useEffect(() => {
    if (!message || !visible || !defilAuto || lectureSynth) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (barRef.current) clearInterval(barRef.current);
      return;
    }
    setProgression(0);
    const start = Date.now();
    barRef.current = setInterval(() => {
      setProgression(Math.min(100, ((Date.now() - start) / DELAI_MS) * 100));
    }, 50);
    timerRef.current = setTimeout(() => {
      setVersetIdx((i) => (i < total - 1 ? i + 1 : 0));
    }, DELAI_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (barRef.current) clearInterval(barRef.current);
    };
  }, [message, visible, defilAuto, lectureSynth, versetIdx, total]);

  // Nettoyage
  useEffect(() => {
    return () => {
      boucleRef.current = false;
      try { window.speechSynthesis?.cancel(); } catch { /* WebView */ }
    };
  }, []);

  if (!message || !visible || total === 0) return null;

  const pal = PALETTES[message.couleur ?? "gold"];
  const verset = versets[versetIdx];

  const fermer = () => {
    arreterLecture();
    setVisible(false);
  };

  return (
    <div className={`relative mt-20 w-full bg-gradient-to-r ${pal.bg} border-b ${pal.border} shadow-xl ${pal.glow}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i}
            className="absolute w-1 h-1 rounded-full bg-white/10 animate-pulse"
            style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 30}%`, animationDelay: `${i * 0.4}s` }} />
        ))}
      </div>

      {defilAuto && !lectureSynth && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
          <div className={`h-full ${pal.progress}`} style={{ width: `${progression}%` }} />
        </div>
      )}
      {lectureSynth && (
        <div className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden bg-white/10">
          <div className={`h-full w-1/3 ${pal.progress} animate-[slide_1.6s_linear_infinite]`} />
        </div>
      )}

      <div className="container mx-auto max-w-7xl px-4 py-6 lg:py-10">
        <div className={`grid overflow-hidden rounded-[2rem] border ${pal.border} bg-black/15 shadow-2xl lg:grid-cols-[minmax(360px,42%)_1fr]`}>
          {/* Portrait du Prophète — chargé automatiquement depuis Supabase */}
          <div className="relative min-h-[290px] overflow-hidden bg-black/20 sm:min-h-[380px] lg:min-h-[510px]">
            {photoProphete ? (
              <img
                src={photoProphete}
                alt={message.auteur}
                className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 hover:scale-[1.02]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-20 w-20 text-white/25" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white lg:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-yellow-200/90">
                {lang === "en" ? "A word from the Prophet" : "Une parole du Prophète"}
              </p>
              <p className="mt-2 text-base font-semibold leading-snug lg:text-lg">{message.auteur}</p>
            </div>
          </div>

          <div className="relative flex min-h-[460px] flex-col overflow-hidden p-6 sm:p-8 lg:min-h-[510px] lg:p-10 xl:p-12">
        <Quote className="pointer-events-none absolute -right-8 top-14 h-52 w-52 rotate-6 text-white/[0.045]" />
        <div className={`pointer-events-none absolute right-0 top-0 h-full w-1 ${pal.progress} opacity-70`} />
        {/* En-tête */}
        <div className="relative z-10 mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${pal.badge}`}>
              <Sparkles className="w-3 h-3" />
              {t("msg.badge")}
            </span>
            <span className={`text-xs ${pal.ref} font-semibold`}>{reference}</span>
            {lectureSynth && decompte > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${pal.badge} opacity-80`}>
                <Repeat className="w-2.5 h-2.5 inline mr-1" />
                {decompte}/{MAX_BOUCLES}
              </span>
            )}
          </div>
          <button onClick={fermer}
            className={`flex-shrink-0 w-7 h-7 rounded-full border ${pal.btn} flex items-center justify-center transition-colors`}
            aria-label={t("msg.fermer")}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className={`relative z-10 mb-5 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-medium ${pal.sous}`}>
          <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
          {instruction}
        </p>

        {/* Verset */}
        <div className="relative z-10 my-auto flex min-h-[12rem] items-center rounded-3xl border border-white/10 bg-black/10 p-5 shadow-inner sm:p-7 lg:p-8">
          <p key={`${lang}-${versetIdx}`}
            className={`${pal.verset} text-xl font-medium leading-relaxed sm:text-2xl xl:text-[1.75rem]`}
            style={{ animation: "fadeSlideIn 0.5s ease-out" }}>
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10" aria-hidden="true">
              <Quote className={`h-6 w-6 ${pal.ref}`} />
            </span>
            <span className={`${pal.ref} mr-2 font-extrabold`}>
              {reference}{decouperVerset(verset).num ? " : " + decouperVerset(verset).num : ""}
            </span>{decouperVerset(verset).corps}
          </p>
        </div>

        {/* Bandeau "3× terminé" */}
        {cycleFini && !lectureSynth && (
          <div className={`flex items-center gap-2 text-xs font-medium ${pal.sous} mb-3`}>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            {t("msg.termine")}
          </div>
        )}

        {/* Contrôles */}
        <div className="relative z-10 mt-6 flex flex-wrap items-center gap-2">
          <button onClick={() => aller((versetIdx - 1 + total) % total)}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${pal.btn}`}
            aria-label={t("msg.precedent")}>
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button onClick={() => setDefilAuto(!defilAuto)}
            disabled={lectureSynth}
            className={`px-3 h-8 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 ${
              defilAuto && !lectureSynth ? pal.btnActif : pal.btn
            }`}>
            {defilAuto ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {defilAuto ? t("msg.pause") : t("msg.defiler")}
          </button>

          {/* 🔁 Lecture : boucle jusqu'à arrêt ou 3 tours */}
          <button onClick={toggleAudio}
            disabled={muet}
            className={`px-3 h-8 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 ${
              lectureSynth ? pal.btnActif : pal.btn
            }`}>
            {lectureSynth
              ? <><Pause className="w-3 h-3" /> {t("msg.arreter")}</>
              : <><Volume2 className="w-3 h-3" /> {t("msg.ecouter")} {lang === "en" ? "🇺🇸" : "🇫🇷"}</>}
          </button>

          <button onClick={() => { if (!muet) arreterLecture(); setMuet(!muet); }}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${pal.btn}`}
            aria-label="Volume">
            {muet ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button onClick={() => aller((versetIdx + 1) % total)}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${pal.btn}`}
            aria-label={t("msg.suivant")}>
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className={`ml-auto text-xs ${pal.sous} tabular-nums`}>
            {versetIdx + 1} / {total}
          </span>
        </div>

        {/* Minimap */}
        <div className="relative z-10 mt-4 flex flex-wrap items-center gap-1">
          {versets.map((_, i) => (
            <button key={i} onClick={() => aller(i)}
              className={`rounded-full transition-all ${
                i === versetIdx ? `w-4 h-2 ${pal.progress}`
                : i < versetIdx ? `w-2 h-2 ${pal.progress} opacity-60`
                : "w-2 h-2 bg-white/20"
              }`}
              aria-label={`${i + 1}`} />
          ))}
        </div>

        <div className={`relative z-10 mt-5 border-t border-white/10 pt-4 text-xs ${pal.sous}`}>
          <span className="font-semibold">— {message.auteur}</span>
          <span className="mx-2 opacity-50">•</span>
          <span>{lang === "en" ? "A word of faith and hope" : "Une parole de foi et d’espérance"}</span>
        </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide {
          from { transform: translateX(-100%); }
          to   { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
};

export default MessageProphetique;
