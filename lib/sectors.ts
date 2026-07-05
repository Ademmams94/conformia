/** Libellés FR des secteurs d'activité (partagé dashboard / PDF). */
export const SECTOR_LABELS: Record<string, string> = {
  recrutement_rh: "Recrutement / RH",
  fintech_credit: "Fintech / Crédit",
  assurance: "Assurance",
  autre: "Autre",
};

export function sectorLabel(sector: string | null | undefined): string {
  if (!sector) return "Non renseigné";
  return SECTOR_LABELS[sector] ?? sector;
}
