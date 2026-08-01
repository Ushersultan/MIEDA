import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initNative } from "./lib/native";

createRoot(document.getElementById("root")!).render(<App />);

// Adaptations natives (ne s'exécute que dans l'app iOS/Android)
initNative();
