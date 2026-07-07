import { useEffect, useRef, useState, useCallback } from "react";
import {
  Play, Pause, Volume2, VolumeX, X, ChevronLeft, ChevronRight,
  BookOpen, Repeat, Sparkles,
} from "lucide-react";
import { messagesProphetiques } from "@/data/messages-prophetiques";

// ══════════════════════════════════════════════
//  Utilitaires
// ══════════════════════════════════════════════
const messageActif = () => {
  const now = new Date();
  return messagesProphetiques.find((m) => {
    if (!m.actif) return false;
    if (m.dateDebut && new Date(m.dateDebut) > now) return false;
    if (m.dateFin && new Date(m.dateFin) < now) return false;
    return true;
  }) ?? null;
};

const PALETTES = {
  gold: {
    bg: "from-yellow-900/95 via-yellow-800/90 to-amber-900/95",
    border: "border-yellow-500/40",
    badge: "bg-yellow-500/20 text-yellow-200 border-yellow-400/30",
    texte: "text-yellow-50",
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
    texte: "text-blue-50",
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
    texte: "text-green-50",
    sous: "text-green-200/80",
    verset: "text-green-100",
    ref: "text-green-300",
    progress: "bg-green-400",
    btn: "bg-green-500/20 hover:bg-green-500/40 text-green-100 border-green-400/30",
    btnActif: "bg-green-400 text-green-900",
    glow: "shadow-green-500/20",
  },
};

// ══════════════════════════════════════════════
//  Composant principal
// ══════════════════════════════════════════════
const MessageProphetique = () => {
  const message = messageActif();
  const [visible, setVisible] = useState(true);
  const [versetIdx, setVersetIdx] = useState(0);
  const [defilAuto, setDefilAuto] = useState(true);
  const [lu, setLu] = useState(false);
  const [muet, setMuet] = useState(false);
  const [lectureSynth, setLectureSynth] = useState(false);
  const [decompte, setDecompte] = useState(0); // compteur de répétitions
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [progression, setProgression] = useState(0);
  const DELAI_MS = 7000; // 7 secondes par verset

  if (!message || !visible) return null;

  const pal = PALETTES[message.couleur ?? "gold"];
  const total = message.versets.length;
  const verset = message.versets[versetIdx];
  const estDernier = versetIdx === total - 1;

  // ── Défilement automatique ──
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const avancer = useCallback(() => {
    setVersetIdx((i) => {
      if (i < total - 1) return i + 1;
      setLu(true);
      setDecompte((c) => c + 1);
      return 0;
    });
    setProgression(0);
  }, [total]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!defilAuto) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (barRef.current) clearInterval(barRef.current);
      setProgression(0);
      return;
    }
    setProgression(0);
    const start = Date.now();
    barRef.current = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / DELAI_MS) * 100);
      setProgression(pct);
    }, 50);
    timerRef.current = setTimeout(avancer, DELAI_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (barRef.current) clearInterval(barRef.current);
    };
  }, [versetIdx, defilAuto, avancer]);

  // ── Synthèse vocale ──
  const parler = (texte: string) => {
    if (muet || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(texte);
    utter.lang = "fr-FR";
    utter.rate = 0.85;
    utter.pitch = 1;
    utter.onend = () => setLectureSynth(false);
    synthRef.current = utter;
    setLectureSynth(true);
    window.speechSynthesis.speak(utter);
  };

  const arreterSynth = () => {
    window.speechSynthesis.cancel();
    setLectureSynth(false);
  };

  const toggleAudio = () => {
    if (lectureSynth) {
      arreterSynth();
    } else {
      parler(verset);
    }
  };

  const aller = (idx: number) => {
    arreterSynth();
    setVersetIdx(idx);
    setProgression(0);
  };

  const fermer = () => {
    arreterSynth();
    setVisible(false);
  };

  return (
    <div className={`relative w-full bg-gradient-to-r ${pal.bg} border-b ${pal.border} shadow-xl ${pal.glow}`}>
      {/* Particules décoratives */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i}
            className="absolute w-1 h-1 rounded-full bg-white/10 animate-pulse"
            style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 30}%`, animationDelay: `${i * 0.4}s` }}
          />
        ))}
      </div>

      {/* Barre de progression (défilement auto) */}
      {defilAuto && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
          <div
            className={`h-full ${pal.progress} transition-none`}
            style={{ width: `${progression}%` }}
          />
        </div>
      )}

      <div className="container mx-auto px-4 max-w-5xl py-4 md:py-5">
        {/* En-tête */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${pal.badge}`}>
              <Sparkles className="w-3 h-3" />
              Message du Prophète
            </span>
            <span className={`text-xs ${pal.ref} font-semibold`}>
              {message.reference}
            </span>
            {decompte > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${pal.badge} opacity-70`}>
                <Repeat className="w-2.5 h-2.5 inline mr-1" />
                {decompte}× lu
              </span>
            )}
          </div>
          <button onClick={fermer}
            className={`flex-shrink-0 w-7 h-7 rounded-full border ${pal.btn} flex items-center justify-center transition-colors`}
            aria-label="Fermer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Instruction */}
        <p className={`text-xs font-medium ${pal.sous} mb-3 flex items-center gap-1.5`}>
          <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
          {message.instruction}
        </p>

        {/* Verset principal avec animation */}
        <div className="relative min-h-[3.5rem] flex items-center mb-4">
          <p
            key={versetIdx}
            className={`${pal.verset} text-base md:text-lg leading-relaxed font-medium animate-fade-in`}
            style={{ animation: "fadeSlideIn 0.5s ease-out" }}
          >
            <span className={`${pal.ref} font-bold mr-2`}>
              {message.reference} {verset.split("—")[0].trim()}
            </span>
            {verset.includes("—") ? "—" + verset.split("—").slice(1).join("—") : verset}
          </p>
        </div>

        {/* Contrôles */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Précédent */}
          <button
            onClick={() => aller(Math.max(0, versetIdx - 1))}
            disabled={versetIdx === 0}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors disabled:opacity-30 ${pal.btn}`}
            aria-label="Verset précédent">
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Défilement auto */}
          <button
            onClick={() => setDefilAuto(!defilAuto)}
            className={`px-3 h-8 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              defilAuto ? pal.btnActif : pal.btn
            }`}>
            {defilAuto ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {defilAuto ? "Pause" : "Défiler"}
          </button>

          {/* Audio */}
          <button
            onClick={toggleAudio}
            className={`px-3 h-8 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              lectureSynth ? pal.btnActif : pal.btn
            }`}>
            {lectureSynth
              ? <><Pause className="w-3 h-3" /> Arrêter</>
              : <><Volume2 className="w-3 h-3" /> Écouter</>}
          </button>

          {/* Muet */}
          <button
            onClick={() => { setMuet(!muet); if (!muet) arreterSynth(); }}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${pal.btn}`}
            aria-label={muet ? "Activer le son" : "Couper le son"}>
            {muet ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Suivant */}
          <button
            onClick={() => aller(Math.min(total - 1, versetIdx + 1))}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${pal.btn}`}
            aria-label="Verset suivant">
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Compteur / position */}
          <span className={`ml-auto text-xs ${pal.sous} tabular-nums`}>
            {versetIdx + 1} / {total}
          </span>
        </div>

        {/* Minimap des versets (points cliquables) */}
        <div className="flex items-center gap-1 mt-3 flex-wrap">
          {message.versets.map((_, i) => (
            <button
              key={i}
              onClick={() => aller(i)}
              className={`rounded-full transition-all ${
                i === versetIdx
                  ? `w-4 h-2 ${pal.progress}`
                  : i < versetIdx
                  ? `w-2 h-2 ${pal.progress} opacity-60`
                  : "w-2 h-2 bg-white/20"
              }`}
              aria-label={`Verset ${i + 1}`}
            />
          ))}
        </div>

        {/* Signature */}
        <p className={`text-[10px] ${pal.sous} mt-2 opacity-60`}>
          — {message.auteur}
        </p>
      </div>

      {/* Animation CSS inline */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MessageProphetique;
