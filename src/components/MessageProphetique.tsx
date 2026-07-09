import { useEffect, useRef, useState, useCallback } from "react";
import {
  Play, Pause, Volume2, VolumeX, X, ChevronLeft, ChevronRight,
  BookOpen, Repeat, Sparkles, CheckCircle2,
} from "lucide-react";
import { messagesProphetiques, type MessageProphetique as TMessage } from "@/data/messages-prophetiques";
import { useLang } from "@/contexts/LanguageContext";

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
  const [message] = useState<TMessage | null>(() => messageActif());

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

  // Versets selon la langue (repli sur le français si pas de version EN)
  const versets = (lang === "en" && message?.versetsEn?.length ? message.versetsEn : message?.versets) ?? [];
  const reference = lang === "en" && message?.referenceEn ? message.referenceEn : message?.reference ?? "";
  const instruction = lang === "en" && message?.instructionEn ? message.instructionEn : message?.instruction ?? "";
  const total = versets.length;

  // ── Lecture audio en boucle, arrêt auto après 3 tours ──
  const lireVerset = useCallback((idx: number) => {
    if (!message || !("speechSynthesis" in window)) return;
    const liste = (lang === "en" && message.versetsEn?.length ? message.versetsEn : message.versets);
    const texte = liste[idx];
    const num = texte.split("—")[0].trim();
    const corps = texte.split("—").slice(1).join("—").trim() || texte;
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
    window.speechSynthesis?.cancel();
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
    window.speechSynthesis?.cancel();
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
      window.speechSynthesis?.cancel();
      lireVerset(idx);
    }
  };

  // Si la langue change pendant la lecture → on relit dans la nouvelle langue
  useEffect(() => {
    if (lectureSynth) {
      window.speechSynthesis?.cancel();
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
      window.speechSynthesis?.cancel();
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
    <div className={`relative w-full bg-gradient-to-r ${pal.bg} border-b ${pal.border} shadow-xl ${pal.glow}`}>
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

      <div className="container mx-auto px-4 max-w-5xl py-4 md:py-5">
        {/* En-tête */}
        <div className="flex items-start justify-between gap-3 mb-3">
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

        <p className={`text-xs font-medium ${pal.sous} mb-3 flex items-center gap-1.5`}>
          <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
          {instruction}
        </p>

        {/* Verset */}
        <div className="relative min-h-[3.5rem] flex items-center mb-4">
          <p key={`${lang}-${versetIdx}`}
            className={`${pal.verset} text-base md:text-lg leading-relaxed font-medium`}
            style={{ animation: "fadeSlideIn 0.5s ease-out" }}>
            <span className={`${pal.ref} font-bold mr-2`}>
              {reference} : {verset.split("—")[0].trim()}
            </span>
            {verset.includes("—") ? "— " + verset.split("—").slice(1).join("—").trim() : verset}
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
        <div className="flex items-center gap-2 flex-wrap">
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
        <div className="flex items-center gap-1 mt-3 flex-wrap">
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

        <p className={`text-[10px] ${pal.sous} mt-2 opacity-60`}>— {message.auteur}</p>
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
