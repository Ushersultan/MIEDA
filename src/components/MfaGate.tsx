import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

// Only Supabase's authenticated assurance level grants privileged access.
const MfaGate = ({ children }: { children: ReactNode }) => {
  const { user, session, loading, profil, signOut, refreshProfil } = useAuth();
  const [state, setState] = useState<"loading" | "setup" | "challenge" | "ready" | "error">("loading");
  const [factorId, setFactorId] = useState("");
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState("");
  const privileged = ["admin", "pasteur", "prophete"].includes(profil?.role || "");

  const evaluate = useCallback(async () => {
    setState("loading"); setError("");
    try {
      const { data: assurance, error: assuranceError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assuranceError) throw assuranceError;
      if (assurance?.currentLevel === "aal2") {
        const { data } = await supabase.auth.getSession();
        setVerifiedToken(data.session?.access_token || "");
        setState("ready"); return;
      }
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const factor = data.totp.find(f => f.status === "verified");
      if (factor) { setFactorId(factor.id); setState("challenge"); }
      else if (privileged) setState("setup");
      else {
        const { data } = await supabase.auth.getSession();
        setVerifiedToken(data.session?.access_token || ""); setState("ready");
      }
    } catch { setError("Impossible de vérifier la sécurité de la session. Réessayez."); setState("error"); }
  }, [privileged]);

  useEffect(() => {
    if (!loading && user && profil) void evaluate();
  }, [loading, user, profil, session?.access_token, evaluate]);

  const enroll = async () => {
    setBusy(true); setError("");
    try {
      // Remove only abandoned, unverified enrollments; never verified factors.
      const listed = await supabase.auth.mfa.listFactors();
      if (listed.error) throw listed.error;
      for (const factor of listed.data.totp.filter(f => f.status === "unverified")) {
        const result = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        if (result.error) throw result.error;
      }
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", issuer: "MIEDA" });
      if (error) throw error;
      setFactorId(data.id); setQr(data.totp.qr_code); setSecret(data.totp.secret); setState("challenge");
    } catch { setError("Impossible de configurer l'authentification. Réessayez."); }
    finally { setBusy(false); }
  };
  const verify = async () => {
    setBusy(true); setError("");
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;
      const result = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.data.id, code });
      if (result.error) throw result.error;
      setCode(""); setSecret(""); setQr(""); await evaluate();
    } catch { setError("Code invalide ou expiré. Saisissez un nouveau code."); }
    finally { setBusy(false); }
  };

  if (!loading && !user) return <Navigate to="/auth" replace />;
  if (!loading && profil && state === "ready" && verifiedToken === session?.access_token) return <>{children}</>;
  return <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <section className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg space-y-5">
      <h1 className="text-2xl font-bold">Sécurité de votre compte</h1>
      {loading || state === "loading" ? <p>Vérification de votre session…</p> : null}
      {!loading && !profil ? <><p>Le profil ne peut pas être chargé.</p><Button onClick={refreshProfil}>Réessayer</Button></> : null}
      {state === "setup" && <><p>Protégez votre accès avec une application d'authentification (Google Authenticator, Microsoft Authenticator ou équivalent).</p><Button disabled={busy} onClick={enroll}>Configurer la double authentification</Button></>}
      {state === "challenge" && <form className="space-y-4" onSubmit={e => { e.preventDefault(); void verify(); }}>
        {qr && <><p>Scannez ce QR code avec votre application d'authentification.</p><img src={qr} alt="QR code de configuration MFA" className="w-56 h-56"/><p className="break-all text-sm">Clé manuelle : {secret}</p></>}
        <label htmlFor="mfa-code" className="block">Code à six chiffres</label>
        <input id="mfa-code" className="border rounded-lg p-3 w-full" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required maxLength={6}/>
        <Button disabled={busy || code.length !== 6} type="submit">{busy ? "Vérification…" : "Vérifier"}</Button>
      </form>}
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {state === "error" && <Button onClick={evaluate}>Réessayer</Button>}
      {user && <Button variant="outline" onClick={signOut}>Se déconnecter</Button>}
    </section>
  </main>;
};
export default MfaGate;
