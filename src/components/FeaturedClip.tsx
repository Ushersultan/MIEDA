import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LanguageContext";

const FeaturedClip = () => {
  const { lang } = useLang();
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
            {copy.title}
          </h2>
          <div className="my-7 h-1 w-24 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500" />
          <p className="max-w-xl text-lg leading-relaxed text-slate-200">
            {copy.body}
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
            <video
              className="aspect-[9/16] w-full object-cover"
              src="/media/mieda-perseverance-oct4.mp4"
              poster="/media/mieda-perseverance-oct4-poster.jpg"
              aria-label={copy.video}
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
            />
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-slate-900/90 px-4 py-2 text-xs font-medium text-white shadow-xl backdrop-blur">
            MIEDA · 4 octobre 2026
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedClip;
