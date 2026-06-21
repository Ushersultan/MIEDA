import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown, MapPin, Baby, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/mieda-logo.png";

const culteItems = [
  { label: "Culte Yamoussoukro", href: "#culte-yamoussoukro", icon: MapPin, desc: "Siège principal" },
  { label: "Culte Enfants", href: "#culte-enfants", icon: Baby, desc: "Pour les 4–12 ans" },
  { label: "Culte en Ligne", href: "#cultes", icon: Globe, desc: "Partout dans le monde" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cultesOpen, setCultesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCultesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navItems = [
    { label: "Accueil", href: "#home" },
    { label: "À Propos", href: "#about" },
    { label: "Événements", href: "#events" },
    { label: "Contactez-nous", href: "#contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo MIEDA" className="h-12 w-auto" />
            <span className="text-2xl font-bold text-accent">MIEDA</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              
                key={item.label}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {item.label}
              </a>
            ))}

            {/* Dropdown Cultes */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setCultesOpen(!cultesOpen)}
                className="flex items-center gap-1 text-foreground hover:text-primary transition-colors font-medium"
                aria-expanded={cultesOpen}
              >
                Cultes
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${cultesOpen ? "rotate-180" : ""}`}
                />
              </button>

              {cultesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="p-1.5">
                    {culteItems.map((item) => (
                      
                        key={item.label}
                        href={item.href}
                        onClick={() => setCultesOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/8 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <item.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="border-t border-border px-4 py-2.5 bg-muted/40">
                    
                      href="#cultes"
                      onClick={() => setCultesOpen(false)}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      Voir tous les cultes →
                    </a>
                  </div>
                </div>
              )}
            </div>

            <Button variant="default" size="lg">
              Se Connecter
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Ouvrir le menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t animate-fade-in">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                
                  key={item.label}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors font-medium py-2 px-2 rounded-lg hover:bg-muted"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}

              {/* Mobile Cultes */}
              <div className="py-2 px-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-0">
                  Cultes
                </p>
                {culteItems.map((item) => (
                  
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-foreground font-medium text-sm">{item.label}</span>
                  </a>
                ))}
              </div>

              <Button variant="default" size="lg" className="w-full mt-2">
                Se Connecter
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
