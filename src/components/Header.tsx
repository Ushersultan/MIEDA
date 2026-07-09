import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu, X, ChevronDown, MapPin, Baby, Globe, User as UserIcon,
  Info, Building2, Lightbulb, MapPinned, Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import logo from "@/assets/mieda-logo.png";

// ── Sous-menus construits avec les traductions ──
const buildEgliseItems = (t: (k: string) => string) => [
  { label: t("nav.apropos"), to: "/a-propos", icon: Info, desc: t("nav.apropos.desc") },
  { label: t("nav.lieux"), to: "/lieux-de-cultes", icon: MapPinned, desc: t("nav.lieux.desc") },
  { label: t("nav.departements"), to: "/departements", icon: Building2, desc: t("nav.departements.desc") },
  { label: t("nav.projets"), to: "/projets", icon: Lightbulb, desc: t("nav.projets.desc") },
];

const buildCulteItems = (t: (k: string) => string) => [
  { label: t("nav.culte.yakro"), to: "/cultes#culte-yamoussoukro", icon: MapPin, desc: t("nav.culte.yakro.desc") },
  { label: t("nav.culte.ecole"), to: "/cultes#ecole-de-dimanche", icon: Baby, desc: t("nav.culte.ecole.desc") },
  { label: t("nav.culte.ligne"), to: "/cultes#culte-en-ligne", icon: Globe, desc: t("nav.culte.ligne.desc") },
];

type DropItem = { label: string; to: string; icon: any; desc: string };

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"eglise" | "cultes" | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { lang, setLang, t } = useLang();
  const location = useLocation();
  const egliseItems = buildEgliseItems(t);
  const culteItems = buildCulteItems(t);

  // Ferme les menus au changement de page
  useEffect(() => {
    setOpenMenu(null);
    setIsMenuOpen(false);
  }, [location.pathname, location.hash]);

  // Ferme le dropdown si clic à l'extérieur
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const linkClass = "text-foreground hover:text-primary transition-colors font-medium";

  // Composant dropdown desktop
  const Dropdown = ({
    id, label, items,
  }: { id: "eglise" | "cultes"; label: string; items: DropItem[] }) => (
    <div className="relative">
      <button
        onClick={() => setOpenMenu(openMenu === id ? null : id)}
        className={`flex items-center gap-1 ${linkClass}`}
        aria-expanded={openMenu === id}
      >
        {label}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${openMenu === id ? "rotate-180" : ""}`}
        />
      </button>

      {openMenu === id && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
          <div className="p-1.5">
            {items.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Logo MIEDA" className="h-12 w-auto" />
            <span className="text-2xl font-bold text-accent">MIEDA</span>
          </Link>

          {/* Desktop Navigation */}
          <nav ref={navRef} className="hidden lg:flex items-center gap-7">
            <Link to="/" className={linkClass}>{t("nav.accueil")}</Link>
            <Dropdown id="eglise" label={t("nav.eglise")} items={egliseItems} />
            <Dropdown id="cultes" label={t("nav.cultes")} items={culteItems} />
            <Link to="/evenements" className={linkClass}>{t("nav.evenements")}</Link>
            <Link to="/contact" className={linkClass}>{t("nav.contact")}</Link>

            {/* Sélecteur de langue */}
            <button
              onClick={() => setLang(lang === "fr" ? "en" : "fr")}
              className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors border border-border rounded-lg px-2.5 py-1.5"
              aria-label="Changer de langue / Switch language"
            >
              <Languages className="w-4 h-4" />
              {lang === "fr" ? "EN" : "FR"}
            </button>

            {user ? (
              <Link to="/profil">
                <Button variant="default" size="lg">
                  <UserIcon className="w-4 h-4 mr-2" />
                  {t("nav.espace")}
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="lg">{t("nav.connecter")}</Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Ouvrir le menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t animate-fade-in max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-1">
              <Link to="/" className="font-medium py-2 px-2 rounded-lg hover:bg-muted text-foreground">
                {t("nav.accueil")}
              </Link>

              {/* L'Église */}
              <div className="py-2 px-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {t("nav.eglise")}
                </p>
                {egliseItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-foreground font-medium text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Cultes */}
              <div className="py-2 px-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {t("nav.cultes")}
                </p>
                {culteItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-foreground font-medium text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>

              <Link to="/evenements" className="font-medium py-2 px-2 rounded-lg hover:bg-muted text-foreground">
                {t("nav.evenements")}
              </Link>
              <Link to="/contact" className="font-medium py-2 px-2 rounded-lg hover:bg-muted text-foreground">
                {t("nav.contact")}
              </Link>

              <button
                onClick={() => setLang(lang === "fr" ? "en" : "fr")}
                className="flex items-center gap-2 font-medium py-2 px-2 rounded-lg hover:bg-muted text-foreground"
              >
                <Languages className="w-4 h-4 text-primary" />
                {lang === "fr" ? "English" : "Français"}
              </button>

              {user ? (
                <Link to="/profil">
                  <Button variant="default" size="lg" className="w-full mt-2">
                    <UserIcon className="w-4 h-4 mr-2" />
                    {t("nav.espace")}
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="default" size="lg" className="w-full mt-2">
                    {t("nav.connecter")}
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
