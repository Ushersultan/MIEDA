import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import logo from "@/assets/mieda-logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="MIEDA Logo" className="h-12 w-auto" />
              <span className="text-2xl font-bold">MIEDA</span>
            </div>
            <p className="text-primary-foreground/80 mb-6 max-w-md">
              Une église où chacun peut découvrir ce que Dieu peut faire à travers lui. Rejoignez notre communauté de foi.
            </p>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Liens Rapides</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#home" className="hover:text-primary-foreground transition-colors">Accueil</a></li>
              <li><a href="#about" className="hover:text-primary-foreground transition-colors">À Propos</a></li>
              <li><a href="#sermons" className="hover:text-primary-foreground transition-colors">Sermons</a></li>
              <li><a href="#events" className="hover:text-primary-foreground transition-colors">Événements</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>123 Avenue de la Foi</li>
              <li>75001 Paris, France</li>
              <li>+33 1 23 45 67 89</li>
              <li>contact@mieda.org</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/80">
          <p>&copy; {currentYear} MIEDA. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
