import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import defaultClip from "../../public/media/featured-clip.json";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LanguageContext";

const FeaturedClip = () => {
  const { lang } = useLang();
  const [clip, setClip] = useState(defaultClip);
  const [failed, setFailed] = useState(false);
  const origin = Capacitor.isNativePlatform() ? "https://www.eglisesmieda.org" : "";

  useEffect(() => {
    const controller = new AbortController();
    const refresh = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const response = await fetch(`${origin}/media/featured-clip.json`, {
          cache: "no-store", signal: controller.signal,
        });
        if (!response.ok) return;
        const next = await response.json();
        // Only church-hosted media paths are accepted.
        const validPath = (value: unknown) => typeof value === "string" &&
          /^\/media\/[a-zA-Z0-9._-]+$/.test(value);
        if (typeof next.id !== "string" || typeof next.available !== "boolean" ||
            !validPath(next.video) || !validPath(next.poster) ||
            typeof next.date !== "string" ||
            ![next.fr?.title, next.fr?.body, next.en?.title, next.en?.body].every(v => typeof v === "string")) return;
        setClip(current => JSON.stringify(current) === JSON.stringify(next) ? current : next);
      } catch { /* Keep the bundled content when offline. */ }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      controller.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [origin]);

  useEffect(() => setFailed(false), [clip.id, clip.video]);
  const copy = lang === "en"
    ? {
        badge: "A moment of faith",
        title: "At the end of perseverance lies victory",
        body: "A short encouragement from the October 4 service: keep going, remain faithful, and remember what God has said.",
        cta: "Watch our services",
        video: "MIEDA service highlight about perseverance and victory",
      }
    : {
        badge: "Un instant de foi",
        title: "Au bout de la persévérance se trouve la victoire",
        body: "Une courte exhortation tirée du culte du 4 octobre : continuez d’avancer, demeurez fidèles et souvenez-vous de ce que Dieu a dit.",
        cta: "Voir nos cultes",
        video: "Extrait du culte MIEDA sur la persévérance et la victoire",
      };

  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 text-white">
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-yellow-400/15 blur-3xl" />

      <div className="container relative mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-[1fr_390px]">
        <div className="max-w-2xl">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-yellow-300/30 bg-yellow-300/10 px-4 py-2 text-sm font-semibold text-yellow-200">
            <Sparkles className="h-4 w-4" /> {copy.badge}
          </span>
          <h2 className="text-4xl font-bold leading-tight md:text-5xl">
            {clip[lang === "en" ? "en" : "fr"].title}
          </h2>
          <div className="my-7 h-1 w-24 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500" />
          <p className="max-w-xl text-lg leading-relaxed text-slate-200">
            {clip[lang === "en" ? "en" : "fr"].body}
          </p>
          <Button asChild size="lg" className="mt-8 rounded-full bg-white text-slate-950 hover:bg-yellow-100">
            <Link to="/cultes">
              <Play className="mr-2 h-4 w-4 fill-current" />
              {copy.cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="relative mx-auto w-full max-w-[390px]">
          <div className="absolute -inset-3 rotate-2 rounded-[2.25rem] bg-gradient-to-br from-yellow-300/35 via-primary/30 to-transparent blur-sm" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-black shadow-2xl shadow-black/40">
            {clip.available && !failed ? <video
              key={`${clip.id}:${clip.video}`}
              className="aspect-[9/16] w-full object-cover"
              src={`${origin}${clip.video}`}
              poster={`${origin}${clip.poster}`}
              aria-label={copy.video}
              playsInline
              controls
              preload="metadata"
              onError={() => setFailed(true)}
            /> : <div className="relative">
              <img src={`${origin}${clip.poster}`} alt={copy.video} className="aspect-[9/16] w-full object-cover" />
              <p role="status" className="absolute bottom-0 w-full bg-black/80 p-4 text-center text-sm">
                {lang === "en" ? "This clip is temporarily unavailable. Watch our services below." : "Cet extrait est temporairement indisponible. Retrouvez nos cultes ci-dessous."}
              </p>
            </div>}
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-slate-900/90 px-4 py-2 text-xs font-medium text-white shadow-xl backdrop-blur">
            MIEDA · {new Date(`${clip.date}T12:00:00`).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedClip;
