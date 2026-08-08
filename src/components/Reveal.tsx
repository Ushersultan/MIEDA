import { useEffect, useRef, useState, ReactNode } from "react";

// ════════════════════════════════════════════════════════════════
//  Reveal — anime son contenu quand il entre dans l'écran.
//  Léger, sans dépendance, et respecte « animations réduites »
//  (accessibilité). À envelopper autour de n'importe quel bloc.
// ════════════════════════════════════════════════════════════════

type Direction = "up" | "down" | "left" | "right" | "scale" | "fade";

interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;        // en millisecondes (pour l'effet en cascade)
  className?: string;
  once?: boolean;        // n'animer qu'une seule fois (défaut : oui)
}

const etatCache = (dir: Direction): string => {
  switch (dir) {
    case "up": return "opacity-0 translate-y-8";
    case "down": return "opacity-0 -translate-y-8";
    case "left": return "opacity-0 translate-x-8";
    case "right": return "opacity-0 -translate-x-8";
    case "scale": return "opacity-0 scale-95";
    default: return "opacity-0";
  }
};

const Reveal = ({ children, direction = "up", delay = 0, className = "", once = true }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduit, setReduit] = useState(false);

  useEffect(() => {
    // Respect du réglage système « réduire les animations »
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) { setReduit(true); setVisible(true); return; }

    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            if (once) obs.unobserve(e.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${
        reduit || visible ? "opacity-100 translate-x-0 translate-y-0 scale-100" : etatCache(direction)
      } ${className}`}
      style={{ transitionDelay: visible && !reduit ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
};

export default Reveal;
