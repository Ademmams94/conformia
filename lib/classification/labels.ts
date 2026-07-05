import type { RiskLevel } from "./rules";

/** Libellés FR + styles des niveaux de risque (du plus grave au plus faible). */
export const RISK_META: Record<
  RiskLevel,
  { label: string; className: string; order: number }
> = {
  prohibited: {
    label: "Interdit",
    className:
      "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
    order: 0,
  },
  high: {
    label: "Haut risque",
    className:
      "bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300",
    order: 1,
  },
  limited: {
    label: "Risque limité",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    order: 2,
  },
  minimal: {
    label: "Risque minimal",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
    order: 3,
  },
};
