import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "favicon.png", "apple-touch-icon.png"],
      manifest: {
        name: "MIEDA — Mission Internationale",
        short_name: "MIEDA",
        description:
          "Mission Internationale d'Évangélisation et de Délivrance des Âmes — messages, prières, dons et vie de l'église.",
        lang: "fr",
        theme_color: "#1e40af",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        categories: ["lifestyle", "education"],
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Le shell de l'app est mis en cache pour un chargement instantané
        // et un fonctionnement hors-ligne partiel.
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // NE JAMAIS servir index.html à la place des routes techniques
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api/],
        // On ne met JAMAIS en cache l'authentification ni les données Supabase
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin && url.pathname.startsWith("/api"),
            handler: "NetworkOnly",
          },
          {
            urlPattern: ({ url }) => url.hostname.endsWith("supabase.co"),
            handler: "NetworkOnly",
          },
          {
            // Images (bannières, photos) : cache réseau-d'abord, 30 jours
            urlPattern: ({ request }) => request.destination === "image",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "mieda-images",
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      devOptions: { enabled: false },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
