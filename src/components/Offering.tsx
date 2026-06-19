import { useState } from "react";
import { Heart, Calculator, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ══════════════════════════════════════════════
//  CONFIGURATION
// ══════════════════════════════════════════════
const PAYPAL_EMAIL = "mieda.diaspora@gmail.com";
const CURRENCY = "USD";

// ── Utilitaire PayPal ──
function buildPayPalUrl(amount: string, description: string): string {
  const params = new URLSearchParams({
    cmd: "_donations",
    business: PAYPAL_EMAIL,
    item_name: description,
    amount,
    currency_code: CURRENCY,
    return: window.location.href,
    cancel_return: window.location.href,
  });
  return `https://www.paypal.com/donate?${params.toString()}`;
}

// ══════════════════════════════════════════════
//  ONGLET — DON LIBRE
// ══════════════════════════════════════════════
const FreeOfferingTab = () => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const presets = ["5", "10", "25", "50", "100"];

  const handleGive = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    const desc = note
      ? `Offrande MIEDA — ${note}`
      : "Offrande — Mission Internationale MIEDA";
    window.open(buildPayPalUrl(val.toFixed(2), desc), "_blank");
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm leading-relaxed">
        Donnez selon ce que le Seigneur a mis dans votre cœur. Chaque offrande
        soutient la mission d'évangélisation et les œuvres de l'église.
      </p>

      {/* Montants rapides */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
          Montant rapide
        </label>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                amount === p
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-foreground hover:border-primary"
              }`}
            >
              ${p}
            </button>
          ))}
        </div>
      </div>

      {/* Montant personnalisé */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Ou entrez un montant
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
            $
          </span>
          <Input
            type="number"
            min="1"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-7"
          />
        </div>
      </div>

      {/* Note optionnelle */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Désignation (optionnel)
        </label>
        <Input
          type="text"
          placeholder="Ex: Construction, Missions, Jeunes..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={60}
        />
      </div>

      <Button
        size="lg"
        className="w-full text-base"
        onClick={handleGive}
        disabled={!amount || parseFloat(amount) <= 0}
      >
        <Heart className="w-4 h-4 mr-2" />
        Donner ${amount || "0.00"} via PayPal
        <ExternalLink className="w-4 h-4 ml-2 opacity-60" />
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Vous serez redirigé vers PayPal pour finaliser votre don en toute sécurité.
      </p>
    </div>
  );
};

// ══════════════════════════════════════════════
//  ONGLET — DÎME
// ══════════════════════════════════════════════
const TitheTab = () => {
  const [salary, setSalary] = useState("");
  const [period, setPeriod] = useState<"monthly" | "biweekly" | "weekly">("monthly");

  const periodLabels = {
    monthly: "Mensuel",
    biweekly: "Bimensuel",
    weekly: "Hebdomadaire",
  };

  const tithe = salary ? (parseFloat(salary) * 0.1).toFixed(2) : "0.00";
  const hasAmount = parseFloat(tithe) > 0;

  const handleGive = () => {
    if (!hasAmount) return;
    const desc = `Dîme MIEDA (${periodLabels[period]}) — 10% de ${salary} ${CURRENCY}`;
    window.open(buildPayPalUrl(tithe, desc), "_blank");
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm leading-relaxed">
        La dîme représente 10% de vos revenus, en reconnaissance de la
        bénédiction de Dieu dans votre vie (Malachie 3:10).
      </p>

      {/* Fréquence */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
          Fréquence de revenu
        </label>
        <div className="flex gap-2">
          {(Object.keys(periodLabels) as Array<keyof typeof periodLabels>).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                period === p
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-foreground hover:border-primary"
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Salaire */}
      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Votre revenu ({periodLabels[period].toLowerCase()})
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
            $
          </span>
          <Input
            type="number"
            min="0"
            step="1"
            placeholder="0.00"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="pl-7"
          />
        </div>
      </div>

      {/* Résultat calculé */}
      <div className={`rounded-xl p-5 border transition-all ${
        hasAmount
          ? "bg-primary/5 border-primary/30"
          : "bg-muted/40 border-border"
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Votre dîme (10%)
          </span>
        </div>
        <p className={`text-3xl font-bold ${hasAmount ? "text-primary" : "text-muted-foreground"}`}>
          ${tithe}
          <span className="text-sm font-normal text-muted-foreground ml-2">
            {CURRENCY}
          </span>
        </p>
        {hasAmount && (
          <p className="text-xs text-muted-foreground mt-1">
            10% de ${parseFloat(salary).toLocaleString("fr-FR")} ({periodLabels[period].toLowerCase()})
          </p>
        )}
      </div>

      <Button
        size="lg"
        className="w-full text-base"
        onClick={handleGive}
        disabled={!hasAmount}
      >
        <Heart className="w-4 h-4 mr-2" />
        Payer ma dîme de ${tithe} via PayPal
        <ExternalLink className="w-4 h-4 ml-2 opacity-60" />
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Vous serez redirigé vers PayPal pour finaliser votre don en toute sécurité.
      </p>
    </div>
  );
};

// ══════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════
const Offering = () => {
  const [tab, setTab] = useState<"offering" | "tithe">("offering");

  return (
    <section id="offrandes" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* ── Côté gauche — Texte ── */}
          <div className="lg:sticky lg:top-24">
            <div className="inline-block px-4 py-2 bg-secondary/20 rounded-full mb-6">
              <span className="text-sm font-semibold text-secondary-foreground flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Offrandes &amp; Dîmes
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Soutenez la Mission de Dieu
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Vos dons permettent à MIEDA de poursuivre son œuvre
              d'évangélisation, d'enseignement et de délivrance partout dans le
              monde.
            </p>
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-8">
              « Apportez toutes les dîmes dans la maison du trésor… et éprouvez-moi
              ainsi, dit l'Éternel des armées. »
              <br />
              <span className="text-sm not-italic font-medium text-foreground mt-2 block">
                — Malachie 3:10
              </span>
            </blockquote>

            {/* Sécurité */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-500" fill="currentColor">
                  <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 0 1-.794.679H8.717a.483.483 0 0 1-.477-.558L9.416 12h1.92l-.272 1.718h.005c.17-1.044 1.062-1.818 2.123-1.818h.444c3.071 0 5.476-1.248 6.18-4.854.293-1.504.142-2.757-.749-3.568z"/>
                  <path d="M17.86 5.665c-.174-.05-.356-.096-.546-.136a6.78 6.78 0 0 0-1.353-.133H11.44a.804.804 0 0 0-.794.68L9.416 12h1.92l.395-2.5.013-.083a.804.804 0 0 1 .794-.68h1.664c3.237 0 5.773-1.314 6.514-5.12.022-.113.042-.223.059-.33a4.052 4.052 0 0 0-2.915-1.622z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Paiement sécurisé via PayPal</p>
                <p className="text-xs text-muted-foreground">Vos informations bancaires ne nous sont jamais transmises</p>
              </div>
            </div>
          </div>

          {/* ── Côté droit — Formulaire ── */}
          <div className="bg-background rounded-2xl border border-border shadow-lg overflow-hidden">
            {/* Onglets */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setTab("offering")}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${
                  tab === "offering"
                    ? "text-foreground border-b-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart className="w-4 h-4 inline mr-2" />
                Offrande libre
              </button>
              <button
                onClick={() => setTab("tithe")}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${
                  tab === "tithe"
                    ? "text-foreground border-b-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calculator className="w-4 h-4 inline mr-2" />
                Calculer ma dîme
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6">
              {tab === "offering" ? <FreeOfferingTab /> : <TitheTab />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Offering;
