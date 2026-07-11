import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Gère le défilement lors des changements de page :
 * - Sans ancre (#) : remonte en haut de la page
 * - Avec ancre : défile en douceur vers l'élément ciblé
 */
const ScrollManager = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      // Laisse le temps au contenu de se rendre avant de défiler
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo(0, 0);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollManager;
