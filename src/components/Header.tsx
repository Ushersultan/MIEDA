import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu, X, ChevronDown, MapPin, Baby, Globe, User as UserIcon,
  Info, Building2, Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/mieda-logo.png";

// ── Sous-menu "L'Église" ──
const egliseItems = [
  { label: "À Propos / Le Fondateur", to: "/a-propos", icon: Info, desc: "Notre histoire et notre vision" },
  { label: "Départements & Instituts", to: "/departements", icon: Building2, desc: "Nos ministères et formations" },
  { label: "Nos Projets", to: "/projets", icon: Lightbulb, desc: "Ce que nous bâtissons" },
];

// ── Sous-menu "Cultes" ──
const culteItems = [
  { label: "Culte Yamoussoukro", to: "/cultes#culte-yamoussoukro", icon: MapPin, desc: "Siège principal" },
  { label: "Culte Enfants", to: "/cultes#culte-enfants", icon: Baby, desc: "Pour les 4–12 ans" },
  { label: "Culte en Ligne", to: "/cultes#culte-en-ligne", icon: Globe, desc: "MIEDA Diaspora · Zoom" },
];

type DropItem = { label: string; to: string; icon: any; desc: string };

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"eglise" | "cultes" | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const location = useLocation();

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
            <Link to="/" className={linkClass}>Accueil</Link>
            <Dropdown id="eglise" label="L'Église" items={egliseItems} />
            <Dropdown id="cultes" label="Cultes" items={culteItems} />
            <Link to="/evenements" className={linkClass}>Événements</Link>
            <Link to="/contact" className={linkClass}>Contact</Link>

            {user ? (
              <Link to="/profil">
                <Button variant="default" size="lg">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Mon espace
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="lg">Se Connecter</Button>
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
                Accueil
              </Link>

              {/* L'Église */}
              <div className="py-2 px-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  L'Église
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
                  Cultes
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
                Événements
              </Link>
              <Link to="/contact" className="font-medium py-2 px-2 rounded-lg hover:bg-muted text-foreground">
                Contact
              </Link>

              {user ? (
                <Link to="/profil">
                  <Button variant="default" size="lg" className="w-full mt-2">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Mon espace
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="default" size="lg" className="w-full mt-2">
                    Se Connecter
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
