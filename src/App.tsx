import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Layout from "@/components/Layout";
import MfaGate from "@/components/MfaGate";
import Index from "./pages/Index";
import { Loader2 } from "lucide-react";

// Pages chargées à la demande (code splitting → site plus rapide)
const Cultes = lazy(() => import("./pages/Cultes"));
const LieuxDeCultes = lazy(() => import("./pages/LieuxDeCultes"));
const APropos = lazy(() => import("./pages/APropos"));
const Evenements = lazy(() => import("./pages/Evenements"));
const Departements = lazy(() => import("./pages/Departements"));
const Projets = lazy(() => import("./pages/Projets"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const Serviteur = lazy(() => import("./pages/Serviteur"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const EspacePasteur = lazy(() => import("./pages/EspacePasteur"));
const Admin = lazy(() => import("./pages/Admin"));
const EspaceProphete = lazy(() => import("./pages/EspaceProphete"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Pages du site avec Header + Footer */}
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/cultes" element={<Cultes />} />
                <Route path="/lieux-de-cultes" element={<LieuxDeCultes />} />
                <Route path="/a-propos" element={<APropos />} />
                <Route path="/evenements" element={<Evenements />} />
                <Route path="/departements" element={<Departements />} />
                <Route path="/projets" element={<Projets />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/serviteur/:egliseId/:slug" element={<Serviteur />} />
              </Route>

              {/* Pages plein écran (sans Header/Footer) */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/profil" element={<MfaGate><Profile /></MfaGate>} />
              <Route path="/espace-pasteur" element={<MfaGate><EspacePasteur /></MfaGate>} />
              <Route path="/admin" element={<MfaGate><Admin /></MfaGate>} />
              <Route path="/espace-prophete" element={<MfaGate><EspaceProphete /></MfaGate>} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
