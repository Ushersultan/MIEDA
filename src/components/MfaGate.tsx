import { useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Smartphone, KeyRound, LogOut, RefreshCw } from "lucide-react";

// ════════════════════════════════════════════════════════════════
//  PORTAIL MFA — impose la double authentification (TOTP)
//  Enveloppe les pages protégées : sans MFA vérifié, pas d'accès.
//  ENFORCE_FOR_ALL = true  → tous les comptes (membres inclus)
//  ENFORCE_FOR_ALL = false → seulement pasteurs/admins
// ════════════════════════════════════════════════════════════════
const ENFORCE_FOR_ALL = true;

type Etape = "verification" | "enrolement" | "defi" | "ok";

const MfaGate = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading, profil, signOut } = useAuth();
  const [etape, setEtape] = useState<Etape>("verification");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");

  const doitImposer = ENFORCE_FOR_ALL || profil?.role === "pasteur" || profil?.role === "admin";

  // ── Évaluer l'état MFA du compte ──
  const evaluer = useCallback(async () => {
    if (!user) return;
    setErreur("");
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.currentLevel === "aal2") {
      setEtape("ok");
      return;
    }
    const { data: facteurs } = await supabase.auth.mfa.listFactors();
    const verifie = facteurs?.totp?.find((f) => f.status === "verified");

    if (verifie) {
      // Facteur existant → demander le code (défi)
      const { data: defi, error } = await supabase.auth.mfa.challenge({ factorId: verifie.id });
      if (error) { setErreur(error.message); return; }
      setFactorId(verifie.id);
      setChallengeId(defi.id);
      setEtape("defi");
    } else if (doitImposer) {
      // Aucun facteur → enrôlement obligatoire
      // Nettoyer les enrôlements abandonnés
      const abandonnes = facteurs?.all?.filter((f) => f.status !== "verified") ?? [];
      for (const f of abandonnes) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "MIEDA",
      });
      if (error) { setErreur(error.message); return; }
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setEtape("enrolement");
    } else {
      setEtape("ok"); // membre non concerné par l'obligation
    }
  }, [user, doitImposer]);

  useEffect(() => {
    if (!authLoading && user && profil) evaluer();
  }, [authLoading, user, profil, evaluer]);

  // ── Vérifier le code à 6 chiffres ──
  const verifierCode = async () => {
    if (code.length !== 6) return;
    setBusy(true);
    setErreur("");
    try {
      let chId = challengeId;
      if (!chId) {
        const { data: defi, error: e1 } = await supabase.auth.mfa.challenge({ factorId });
        if (e1) throw e1;
        chId = defi.id;
      }
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: chId,
        code,
      });
      if (error) throw error;
      setCode("");
      setEtape("ok");
    } catch (e: any) {
      setErreur("Code incorrect ou expiré. Réessayez.");
      setChallengeId("");
    }
    setBusy(false);
  };

  // ── Rendus ──
  if (authLoading || !user || !profil) return <>{children}</>; // les pages gèrent la redirection /auth
  if (etape === "ok") return <>{children}</>;

  if (etape === "verification") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const CarteMfa = ({ titre, sousTitre, children: contenu }: { titre: string; sousTitre: string; children: ReactNode }) => (
    <div className="min-h-screen flex items-center justify-center bg-[var(--section-bg)] px-4 py-10">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground text-center mb-1">{titre}</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">{sousTitre}</p>
        {contenu}
        {erreur && <p className="text-sm text-destructive text-center mt-4">{erreur}</p>}
        <button
          onClick={() => signOut()}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mx-auto mt-6"
        >
          <LogOut className="w-3 h-3" /> Se déconnecter
        </button>
      </div>
    </div>
  );

  // ── Écran d'enrôlement (première fois) ──
  if (etape === "enrolement") {
    return (
      <CarteMfa
        titre="Sécurisez votre compte"
        sousTitre="MIEDA impose la double authentification. Scannez ce code avec Google Authenticator, Microsoft Authenticator ou toute app TOTP."
      >
        <div className="bg-white rounded-xl p-4 flex justify-center mb-4">
          {qrCode && (
            <img
              src={`data:image/svg+xml;utf8,${encodeURIComponent(qrCode)}`}
              alt="QR code MFA"
              className="w-44 h-44"
            />
          )}
        </div>
        <details className="mb-4">
          <summary className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1">
            <KeyRound className="w-3 h-3" /> Impossible de scanner ? Clé manuelle
          </summary>
          <code className="block mt-2 p-2 bg-muted rounded text-xs break-all select-all">{secret}</code>
        </details>
        <div className="flex items-center gap-2 mb-2">
          <Smartphone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="Code à 6 chiffres"
            className="flex-1 px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-center text-lg tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button onClick={verifierCode} disabled={busy || code.length !== 6} className="w-full" size="lg">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Activer la protection"}
        </Button>
      </CarteMfa>
    );
  }

  // ── Écran de défi (connexions suivantes) ──
  return (
    <CarteMfa
      titre="Vérification en deux étapes"
      sousTitre="Entrez le code à 6 chiffres de votre application d'authentification."
    >
      <div className="flex items-center gap-2 mb-2">
        <Smartphone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && verifierCode()}
          placeholder="000000"
          autoFocus
          className="flex-1 px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-center text-lg tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <Button onClick={verifierCode} disabled={busy || code.length !== 6} className="w-full" size="lg">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Vérifier"}
      </Button>
      <button
        onClick={evaluer}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mx-auto mt-3"
      >
        <RefreshCw className="w-3 h-3" /> Nouveau code
      </button>
    </CarteMfa>
  );
};

export default MfaGate;
