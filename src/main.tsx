import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initNative } from "./lib/native";

// ── Filet anti-écran-blanc : toute erreur fatale au démarrage
//    s'affiche à l'écran au lieu de laisser une page vide. ──
window.addEventListener("error", (e) => {
  const root = document.getElementById("root");
  if (root && !root.hasChildNodes()) {
    root.innerHTML =
      '<div style="font-family:sans-serif;padding:24px;color:#991b1b;background:#fef2f2;min-height:100vh">' +
      "<h2>⚠️ Erreur au démarrage</h2><pre style='white-space:pre-wrap;font-size:12px'>" +
      String(e.message || e.error || "Erreur inconnue") + "</pre></div>";
  }
});

createRoot(document.getElementById("root")!).render(<App />);

// Adaptations natives (ne s'exécute que dans l'app iOS/Android)
initNative();
