// Utilitaires pour retrouver un serviteur et générer les liens de pages perso
import { eglises, type Eglise, type Pasteur } from "@/data/eglises";

export const slugifyNom = (nom: string) =>
  nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export interface ServiteurComplet {
  pasteur: Pasteur;
  eglise: Eglise;
  estPrincipal: boolean;
}

export const lienServiteur = (eglise: Eglise, p: Pasteur) =>
  `/serviteur/${eglise.id}/${slugifyNom(p.nom)}`;

export function trouverServiteur(egliseId: string, slug: string): ServiteurComplet | null {
  const eglise = eglises.find((e) => e.id === egliseId);
  if (!eglise) return null;
  if (slugifyNom(eglise.pasteur.nom) === slug) {
    return { pasteur: eglise.pasteur, eglise, estPrincipal: true };
  }
  const autre = eglise.equipe?.find((p) => slugifyNom(p.nom) === slug);
  if (autre) return { pasteur: autre, eglise, estPrincipal: false };
  return null;
}

// Options d'églises groupées par région (pour les menus déroulants)
export interface EgliseOption { id: string; nom: string; }
export interface GroupeOptions { groupe: string; options: EgliseOption[]; }

export function eglisesGroupees(): GroupeOptions[] {
  const groupes = new Map<string, EgliseOption[]>();
  for (const e of eglises) {
    const cle = e.pays === "Côte d'Ivoire" ? (e.region ? `Région ${e.region}` : "Côte d'Ivoire") : "International";
    if (!groupes.has(cle)) groupes.set(cle, []);
    groupes.get(cle)!.push({ id: e.id, nom: e.nom });
  }
  return Array.from(groupes.entries()).map(([groupe, options]) => ({
    groupe,
    options: options.sort((a, b) => a.nom.localeCompare(b.nom)),
  }));
}

export function nomEglise(egliseId: string | null): string | null {
  if (!egliseId) return null;
  return eglises.find((e) => e.id === egliseId)?.nom ?? null;
}
