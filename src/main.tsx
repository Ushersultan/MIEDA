import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initNative } from "./lib/native";

// ── Filet anti-écran-blanc : toute erreur fatale au démarrage
//    s'affiche à l'écran au lieu de laisser une page vide. ──
window.addEventListener("error", (e) => {
  const root = document.getElementById("root");
  if (root && !root.hasChildNodes()) {
    const panel = document.createElement("div");
    panel.className = "min-h-screen bg-red-50 p-6 font-sans text-red-800";
    const title = document.createElement("h2");
    title.textContent = "⚠️ Erreur au démarrage";
    const message = document.createElement("pre");
    message.className = "whitespace-pre-wrap text-xs";
    message.textContent = String(e.message || e.error || "Erreur inconnue");
    panel.append(title, message);
    root.replaceChildren(panel);
  }
});

createRoot(document.getElementById("root")!).render(<App />);

// Adaptations natives (ne s'exécute que dans l'app iOS/Android)
initNative();
