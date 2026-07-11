import {
  Music, HandHelping, Megaphone, Flame, Church, Sparkles, Users, UserRound,
  BookOpen, HeartPulse, SprayCan, ClipboardCheck, ShieldCheck, Radio,
  Calculator, HeartHandshake, GraduationCap,
} from "lucide-react";
import { departements as departementsData, titreDept, descDept } from "@/data/departements";
import { useLang } from "@/contexts/LanguageContext";

const icones: Record<string, any> = {
  "louange": Music, "intercession": HandHelping, "evangelisation": Megaphone,
  "delivrance": Flame, "ecclesiastique": Church, "jeunesse": Sparkles,
  "hommes": Users, "femmes": UserRound, "ecole-de-dimanche": BookOpen,
  "priere-hopital": HeartPulse, "nettoyage": SprayCan, "service-ordre": ClipboardCheck,
  "securite": ShieldCheck, "communication": Radio, "comptabilite": Calculator,
  "social": HeartHandshake,
};

const buildDepartements = (lang: "fr" | "en") => departementsData.map((d) => ({
  icon: icones[d.id] ?? Users, title: titreDept(d, lang), desc: descDept(d, lang),
}));

const INSTITUTS = {
  fr: [
    { icon: BookOpen, title: "Institut Biblique", desc: "Une formation approfondie à la Parole de Dieu pour affermir les fidèles." },
    { icon: GraduationCap, title: "École de Formation Ministérielle", desc: "Équiper les serviteurs et futurs leaders pour le ministère." },
  ],
  en: [
    { icon: BookOpen, title: "Bible Institute", desc: "In-depth training in God's Word to strengthen the faithful." },
    { icon: GraduationCap, title: "School of Ministerial Training", desc: "Equipping servants and future leaders for ministry." },
  ],
};

const TXT = {
  fr: {
    titre: "Départements & Instituts",
    sous: "Les ministères et formations qui font vivre la mission MIEDA au quotidien.",
    badge1: "Nos Départements", h2a: "Servir ensemble",
    badge2: "Nos Instituts", h2b: "Se former, grandir, servir",
  },
  en: {
    titre: "Departments & Institutes",
    sous: "The ministries and training programs that bring the MIEDA mission to life every day.",
    badge1: "Our Departments", h2a: "Serving together",
    badge2: "Our Institutes", h2b: "Learn, grow, serve",
  },
};

const Departements = () => {
  const { lang } = useLang();
  const departements = buildDepartements(lang);
  const instituts = INSTITUTS[lang];
  const L = TXT[lang];
  return (
    <div className="pt-20">
      {/* Bandeau */}
      <div className="text-white py-16 md:py-20" style={{ background: "var(--hero-gradient)" }}>
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{L.titre}</h1>
          <p className="text-lg text-white/85 max-w-2xl mx-auto">
            {L.sous}
          </p>
        </div>
      </div>

      {/* Départements */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">{L.badge1}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">{L.h2a}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departements.map((d) => (
              <div key={d.title} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <d.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">{d.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instituts */}
      <section className="py-20 bg-[var(--section-bg)]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">{L.badge2}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">{L.h2b}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {instituts.map((i) => (
              <div key={i.title} className="bg-card border border-border rounded-2xl p-8">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <i.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground text-xl mb-2">{i.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{i.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Departements;
