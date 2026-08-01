// ════════════════════════════════════════════════════════════════
//  MIEDA — Adaptations natives (iOS / Android via Capacitor)
//
//  IMPORTANT : tout est en import dynamique et protégé par
//  isNativePlatform(). Sur le site web (Vercel), rien de ce code
//  ne s'exécute et le bundle n'est pas alourdi — les plugins
//  Capacitor ne sont chargés que dans l'application installée.
// ════════════════════════════════════════════════════════════════

export async function initNative(): Promise<void> {
  const { Capacitor } = await import("@capacitor/core");
  if (!Capacitor.isNativePlatform()) return;

  // ── Barre d'état : texte clair sur fond bleu MIEDA ──
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    // La barre d'état occupe son propre espace (pas de superposition)
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: Style.Light });
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: "#1e40af" });
    }
  } catch { /* plugin absent : on ignore */ }

  // ── Masquer l'écran de démarrage une fois l'app prête ──
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch { /* noop */ }

  // ── Bouton « retour » Android : navigue en arrière, sinon quitte ──
  try {
    const { App } = await import("@capacitor/app");
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else App.exitApp();
    });
  } catch { /* noop */ }
}

// ── Notifications push (à appeler après connexion de l'utilisateur) ──
// Enregistre l'appareil et renvoie le jeton, à stocker côté Supabase
// pour cibler les envois (nouveau message du Prophète, annonces…).
export async function enregistrerPush(
  onToken?: (token: string) => void
): Promise<void> {
  const { Capacitor } = await import("@capacitor/core");
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    const perm = await PushNotifications.requestPermissions();
    if (perm.receive !== "granted") return;

    await PushNotifications.register();

    PushNotifications.addListener("registration", (token) => {
      onToken?.(token.value);
    });

    PushNotifications.addListener("registrationError", (err) => {
      console.error("Push : erreur d'enregistrement", err);
    });
  } catch { /* noop */ }
}
