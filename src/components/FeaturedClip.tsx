import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LanguageContext";
import defaultClip from "../../public/media/featured-clip.json";

type Clip = { id: string; available: boolean; video: string; poster: string | null; date: string; fr: { title: string; body: string }; en: { title: string; body: string } };

const FeaturedClip = () => {
  const { lang } = useLang();
  const en = lang === "en";
  const [clip, setClip] = useState<Clip>(defaultClip);
  const [failed, setFailed] = useState(false);
  const origin = Capacitor.isNativePlatform() ? "https://www.eglisesmieda.org" : "";

  useEffect(() => {
    const controller = new AbortController();
    const refresh = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const response = await fetch(origin + "/media/featured-clip.json", { cache: "no-store", signal: controller.signal });
        if (!response.ok) return;
        const next = await response.json();
        const validPath = (value: unknown) => typeof value === "string" && /^\/media\/[a-zA-Z0-9._-]+$/.test(value);
        if (typeof next.id !== "string" || typeof next.available !== "boolean" || !validPath(next.video) || (next.poster !== null && !validPath(next.poster)) || typeof next.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(next.date) || ![next.fr?.title, next.fr?.body, next.en?.title, next.en?.body].every(value => typeof value === "string")) return;
        setClip(current => JSON.stringify(current) === JSON.stringify(next) ? current : next);
      } catch { /* Keep bundled content when offline. */ }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60000);
    document.addEventListener("visibilitychange", refresh);
    return () => { controller.abort(); window.clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, [origin]);

  useEffect(() => setFailed(false), [clip.id, clip.video]);
  const copy = clip[en ? "en" : "fr"];
  const dateLabel = new Date(clip.date + "T12:00:00").toLocaleDateString(en ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric" });
  return (
    <section className="relative overflow-hidden bg-[#142c43] py-20 text-white sm:py-28">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="mb-5 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c5dbbb]"><Sparkles className="h-4 w-4" />{en ? "A moment of faith" : "Un instant de foi"}</span>
          <h2 className="home-editorial-title max-w-xl text-4xl leading-[1.14] sm:text-5xl">{copy.title}</h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-slate-300">{copy.body}</p>
          <p className="mt-5 text-xs uppercase tracking-[0.14em] text-[#c5dbbb]">MIEDA Diaspora · {dateLabel}</p>
          <Button asChild size="lg" className="mt-8 rounded-full bg-[#c5dbbb] text-[#142c43] hover:bg-white"><Link to="/cultes#culte-en-ligne"><Play className="mr-2 h-4 w-4" />{en ? "Watch our services" : "Voir nos cultes"}<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>
        <figure className="overflow-hidden rounded-3xl border border-white/15 bg-[#0d2134] shadow-2xl">
          {clip.available && !failed ? <video key={clip.id + ":" + clip.video} className="aspect-[27/23] w-full bg-black object-contain" src={origin + clip.video} poster={clip.poster ? origin + clip.poster : undefined} aria-label={en ? "MIEDA online worship service" : "Extrait du culte en ligne MIEDA"} playsInline controls preload="metadata" onError={() => setFailed(true)} /> : <div role="status" className="flex aspect-[27/23] items-center justify-center p-8 text-center text-sm text-slate-300">{en ? "This clip is temporarily unavailable. You can find our services using the link beside it." : "Cet extrait est temporairement indisponible. Retrouvez nos cultes grâce au lien ci-contre."}</div>}
          <figcaption className="flex items-center gap-2 px-5 py-4 text-sm text-slate-200"><Play className="h-4 w-4 text-[#c5dbbb]" />{en ? "A moment from our online service" : "Un moment de notre culte en ligne"}</figcaption>
        </figure>
      </div>
    </section>
  );
};
export default FeaturedClip;
