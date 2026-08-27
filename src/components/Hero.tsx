import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";
import { Sparkles, ArrowRight, LogIn } from "lucide-react";
import heroImage from "@/assets/hero-worship.jpg";

const Hero = () => {
  const { t } = useLang();
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Image de fond + superposition riche */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Worship Service"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-accent/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-primary/30" />
      </div>

      {/* Halos décoratifs flottants */}
      <div className="absolute top-24 right-8 w-72 h-72 bg-secondary/25 rounded-full blur-3xl animate-pulse-slow z-0" />
      <div className="absolute bottom-24 left-8 w-96 h-96 bg-accent/25 rounded-full blur-3xl z-0" />
      <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-highlight/20 rounded-full blur-2xl z-0" />

      {/* Contenu */}
      <div className="container mx-auto px-4 z-10 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          {/* Badge pilule */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/25 text-white/90 text-sm font-medium mb-8 shadow-lg">
            <Sparkles className="w-4 h-4 text-secondary" />
            {t("hero.mission")}
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            {t("hero.bienvenue")}
          </h1>

          {/* Ligne dorée d'accent */}
          <div className="w-28 h-1.5 bg-gradient-to-r from-secondary via-highlight to-secondary rounded-full mx-auto mb-8" />

          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t("hero.verset")}
            <br />
            <span className="text-white/80">Rejoignez notre communauté de foi.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              asChild
            >
              <Link to="/auth">
                <LogIn className="w-5 h-5 mr-1" />
                {t("nav.connecter")}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 rounded-full bg-white/10 backdrop-blur-md border-white/40 text-white hover:bg-white hover:text-primary hover:scale-105 transition-all group"
              asChild
            >
              <Link to="/a-propos">
                {t("hero.savoir")}
                <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Indicateur de défilement */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-white/50 rounded-full mt-2" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
