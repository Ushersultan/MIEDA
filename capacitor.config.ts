import type { CapacitorConfig } from "@capacitor/cli";

// ════════════════════════════════════════════════════════════════
//  MIEDA — Configuration de l'application mobile (iOS + Android)
//
//  L'application embarque le site React construit (dossier « dist »).
//  C'est une vraie app native : elle fonctionne hors-ligne pour la
//  partie consultation, reçoit des notifications push, et respecte
//  les encoches des téléphones.
// ════════════════════════════════════════════════════════════════

const config: CapacitorConfig = {
  appId: "org.eglisesmieda.app",
  appName: "MIEDA",
  webDir: "dist",

  // Le navigateur interne charge les fichiers via https:// (recommandé)
  server: {
    androidScheme: "https",
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      // Texte clair sur fond bleu MIEDA (posé aussi au runtime)
      style: "LIGHT",
      backgroundColor: "#1e40af",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
