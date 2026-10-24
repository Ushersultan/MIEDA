import { Link } from "react-router-dom";
import { ArrowDown, ArrowUpRight, Globe2, Heart, Play } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-worship.jpg";

const Hero = () => {
  const { lang } = useLang();
  const en = lang === "en";
  return (
    <section id="home" className="relative overflow-hidden bg-[#f8f6f0] text-[#142c43]">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-32 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-40">
        <div className="relative z-10">
          <p className="mb-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#305f75]"><span className="h-px w-9 bg-[#305f75]" />{en ? "Welcome to MIEDA" : "Bienvenue à la MIEDA"}</p>
          <h1 className="home-editorial-title text-[clamp(3.2rem,6vw,5.8rem)] leading-[1.04] tracking-[-0.04em]">
            {en ? <>A living faith.<br />A family <em className="text-[#35756c]">without<br className="hidden sm:block" /> borders.</em></> : <>Une foi vivante.<br />Une famille <em className="text-[#35756c]">sans<br className="hidden sm:block" /> frontières.</em></>}
          </h1>
          <p className="mt-7 max-w-md text-base leading-8 text-[#526574] sm:text-lg">{en ? "Together, let us grow in faith, share the Gospel and experience the love of Jesus Christ. There is a place for you here." : "Ensemble, grandissons dans la foi, partageons l’Évangile et vivons l’amour de Jésus-Christ. Ici, vous avez votre place."}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/cultes#culte-en-ligne" className="home-primary-link"><Play className="h-4 w-4" />{en ? "Join a service" : "Vivre un culte"}<ArrowUpRight className="h-4 w-4" /></Link>
            <Link to="/a-propos" className="inline-flex items-center gap-2 rounded-full border border-[#142c43]/20 px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">{en ? "Discover our church" : "Découvrir notre Église"}<ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[#142c43]/10 pt-6 text-xs text-[#526574]">
            <span className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-[#35756c]" />{en ? "One faith, across the world" : "Une même foi, à travers le monde"}</span>
            <a href="#decouvrir" className="flex items-center gap-2 font-semibold text-[#142c43]">{en ? "Explore" : "Explorer"}<ArrowDown className="h-3.5 w-3.5" /></a>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-xl pb-8 lg:pl-4">
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full border border-[#c8d8cd]" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-t-[9rem] rounded-b-[1.5rem] bg-[#d4ded8] sm:rounded-t-[12rem]">
            <img src={heroImage} alt={en ? "MIEDA worship gathering" : "Assemblée MIEDA en adoration"} fetchPriority="high" className="aspect-[4/5] max-h-[620px] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#142c43]/85 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-7 right-7 text-white"><span className="text-[10px] uppercase tracking-[0.24em] text-white/70">{en ? "Our purpose" : "Notre mission"}</span><p className="home-editorial-title mt-3 text-3xl leading-tight sm:text-4xl">{en ? "Share faith.\nTransform lives." : "Partager la foi.\nTransformer des vies."}</p></div>
          </div>
          <div className="absolute bottom-0 left-4 right-4 flex items-center gap-4 rounded-2xl border border-[#e4e7dd] bg-white p-5 shadow-[0_12px_40px_-15px_rgba(20,44,67,0.22)] sm:left-0 sm:right-auto sm:max-w-[290px]">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#edf4ee] text-[#35756c]"><Heart className="h-5 w-5" /></span><div><p className="text-sm font-semibold">{en ? "A family to belong to" : "Une famille pour vous accueillir"}</p><p className="mt-1 text-xs text-[#526574]">{en ? "Here and everywhere." : "Ici et partout dans le monde."}</p></div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Hero;
