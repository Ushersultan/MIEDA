import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Cultes from "./pages/Cultes";
import LieuxDeCultes from "./pages/LieuxDeCultes";
import APropos from "./pages/APropos";
import Evenements from "./pages/Evenements";
import Departements from "./pages/Departements";
import Projets from "./pages/Projets";
import ContactPage from "./pages/ContactPage";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
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
            </Route>

            {/* Pages plein écran (sans Header/Footer) */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/profil" element={<Profile />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
