import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Building2, Lightbulb, Radio, ArrowRight } from "lucide-react";
import MessageProphetique from "@/components/MessageProphetique";
import Hero from "@/components/Hero";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import Experience from "@/components/Experience";
import Offering from "@/components/Offering";
import Reveal from "@/components/Reveal";
import FeaturedClip from "@/components/FeaturedClip";

const AnniversaryBanner = () => {
  const { lang } = useLang();
  const [paused, setPaused] = useState(false);
  const { user, profil, loading } = useAuth();
  const canControlAnimation = !loading && !!user && (profil?.role === "admin" || profil?.role === "prophete");
  const en = lang === "en";
  return (
    <aside aria-label={en ? "MIEDA 29th anniversary" : "29ᵉ anniversaire de la MIEDA"} className="pt-20">
      <style>{`
        @keyframes mieda-anniversary-light {
          from { transform: translateX(-120%) skewX(-18deg); }
          to { transform: translateX(500%) skewX(-18deg); }
        }
        .mieda-anniversary { position: relative; overflow: hidden; background: linear-gradient(115deg, #103e35, #1d6654 55%, #103e35); color: #fff; }
        .mieda-anniversary::before { content: ''; position: absolute; inset: 0 auto 0 0; width: 25%; background: linear-gradient(90deg, transparent, rgba(255,224,150,.16), transparent); animation: mieda-anniversary-light 9s linear infinite; pointer-events: none; }
        .mieda-anniversary[data-can-control=true]::before { animation-duration: 9s; animation-iteration-count: infinite; }
        .mieda-anniversary[data-can-control=true][data-paused=true]::before { animation-play-state: paused; }

        @keyframes mieda-firework-burst {
          0%, 8% { transform: scale(.08); opacity: 0; }
          14% { opacity: .85; }
          44% { transform: scale(1); opacity: .7; }
          70%, 100% { transform: scale(1.25) translateY(12px); opacity: 0; }
        }
        .mieda-fireworks { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .mieda-firework { position: absolute; left: 5%; top: 38%; width: 1px; height: 1px; }
        .mieda-firework:nth-child(2) { left: 91%; top: 44%; }
        .mieda-firework:nth-child(3) { left: 66%; top: 14%; }
        .mieda-firework::before { content: ''; position: absolute; width: 3px; height: 3px; border-radius: 50%; background: #fff1b8; opacity: 0; box-shadow: 0 -44px #f6dd9b, 17px -41px #ffecc2, 31px -31px #d8b866, 41px -17px #f6dd9b, 44px 0 #ffecc2, 41px 17px #d8b866, 31px 31px #f6dd9b, 17px 41px #ffecc2, 0 44px #d8b866, -17px 41px #f6dd9b, -31px 31px #ffecc2, -41px 17px #d8b866, -44px 0 #f6dd9b, -41px -17px #ffecc2, -31px -31px #d8b866, -17px -41px #f6dd9b, 12px -22px #fff5db, 22px 12px #f6dd9b, -12px 22px #fff5db, -22px -12px #f6dd9b; animation: mieda-firework-burst 3.8s ease-out infinite both; }
        .mieda-firework:nth-child(2)::before { animation-delay: .4s; }
        .mieda-firework:nth-child(3)::before { animation-delay: .8s; }
        .mieda-anniversary[data-can-control=true] .mieda-firework::before { animation-iteration-count: infinite; }
        .mieda-anniversary[data-paused=true] .mieda-firework::before { animation-play-state: paused; }
        @media (max-width: 639px) { .mieda-firework:nth-child(3) { left: 80%; top: 80%; } }
        @media (prefers-reduced-motion: reduce) { .mieda-firework::before { animation: none; display: none; } }
        @media (prefers-reduced-motion: reduce) { .mieda-anniversary::before { animation: none; } }
      `}</style>
      <div className="mieda-anniversary border-b border-[#d5b66a]/40" data-paused={paused} data-can-control={canControlAnimation}>
        <div className="mieda-fireworks" aria-hidden="true"><span className="mieda-firework" /><span className="mieda-firework" /><span className="mieda-firework" /></div>
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-4 px-5 py-6 sm:flex-nowrap sm:justify-between sm:px-8">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#e5c77f]/70 bg-white/5 font-serif text-4xl text-[#f6dd9b]" aria-hidden="true">29</span>
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f6dd9b]">{en ? "A journey of faith · MIEDA" : "Une histoire de foi · MIEDA"}</p>
              <h2 className="font-serif text-xl leading-tight sm:text-3xl">{en ? "Celebrating MIEDA’s 29th anniversary!" : "Joyeux 29ᵉ anniversaire à la MIEDA !"}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/85">{en ? "29 years of faith, evangelism and transformed lives. To God be the glory!" : "29 ans de foi, d’évangélisation et de vies transformées. À Dieu toute la gloire !"}</p>
            </div>
          </div>
          {canControlAnimation && <button type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused} className="shrink-0 rounded-full border border-white/35 px-4 py-2 text-xs font-medium text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f6dd9b]">
            {en ? (paused ? "Resume animation" : "Pause animation") : (paused ? "Reprendre l’animation" : "Pause animation")}
          </button>}
        </div>
      </div>
    </aside>
  );
};

const buildExplorer = (t: (k: string) => string) => [
  { icon: Radio, title: t("accueil.explorer.cultes"), desc: t("accueil.explorer.cultes.desc"), to: "/cultes", color: "text-primary", bg: "bg-primary/10" },
  { icon: Calendar, title: t("accueil.explorer.event"), desc: t("accueil.explorer.event.desc"), to: "/evenements", color: "text-accent", bg: "bg-accent/10" },
  { icon: Building2, title: t("accueil.explorer.dept"), desc: t("accueil.explorer.dept.desc"), to: "/departements", color: "text-primary", bg: "bg-primary/10" },
  { icon: Lightbulb, title: t("accueil.explorer.projets"), desc: t("accueil.explorer.projets.desc"), to: "/projets", color: "text-accent", bg: "bg-accent/10" },
];

const Index = () => {
  const { t, lang } = useLang();
  const explorer = buildExplorer(t);
  return (
    <div className="mieda-home">
      <AnniversaryBanner />
      <Hero />
      <MessageProphetique embedded />
      <Reveal>
        <Experience />
      </Reveal>

      <Reveal>
        <FeaturedClip />
      </Reveal>

      {/* Explorer le site */}
      <section className="bg-[#f8f6f0] py-20 text-[#142c43] sm:py-28">
        <div className="container mx-auto px-4 max-w-6xl">
          <Reveal className="mb-12">
            <h2 className="home-editorial-title mb-4 text-4xl sm:text-5xl">
              {t("accueil.explorer.titre")}
            </h2>
            <p className="max-w-xl text-base leading-7 text-[#657580]">
              {t("accueil.explorer.sous")}
            </p>
          </Reveal>

          <div className="grid gap-px overflow-hidden rounded-3xl border border-[#dde3da] bg-[#dde3da] sm:grid-cols-2">
            {explorer.map((item, i) => (
              <Reveal key={item.title} direction="up" delay={i * 90}>
              <Link
                to={item.to}
                className="group flex h-full items-start gap-5 bg-[#f8f6f0] p-7 transition-colors hover:bg-white sm:p-9"
              >
                <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-[#142c43]">{item.title}</h3>
                  <p className="text-sm leading-7 text-[#657580]">{item.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
              </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eaf0e8] py-16 text-[#142c43]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 sm:flex-row sm:items-center sm:px-8">
          <div><p className="home-eyebrow mb-3">{lang === "en" ? "Every gesture matters" : "Chaque geste compte"}</p><h2 className="home-editorial-title text-3xl sm:text-4xl">{lang === "en" ? "Together, let us share hope." : "Ensemble, faisons grandir l’espérance."}</h2></div>
          <a href="#offrandes" className="home-primary-link shrink-0">{lang === "en" ? "Make a donation" : "Faire un don"}<ArrowRight className="h-4 w-4" /></a>
        </div>
      </section>
      {/* Dons / Offrandes */}
      <Reveal>
        <Offering />
      </Reveal>
    </div>
  );
};

export default Index;
