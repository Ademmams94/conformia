import {
  findRule,
  HIGH_RISK_SECTORS,
  UNKNOWN_DEFAULT,
  type Classification,
} from "./rules";

export interface ToolInput {
  name?: string | null;
  domain?: string | null;
}

/**
 * Classe un outil IA selon les règles fixes (Annexe III), en tenant compte du
 * secteur de l'entreprise.
 *
 * Règle de prudence : le moteur ne fait jamais basculer un outil en « haut
 * risque » sur la seule base du domaine (le risque dépend de l'usage). En
 * revanche, si l'entreprise opère dans un secteur sensible de l'Annexe III, il
 * force une relecture juridique et l'explicite dans la justification.
 */
export function classifyTool(
  tool: ToolInput,
  sector: string | null,
): Classification {
  const rule = findRule({
    domain: tool.domain ?? undefined,
    name: tool.name ?? undefined,
  });

  const base: Classification = rule
    ? {
        riskLevel: rule.riskLevel,
        annexeIiiCategory: rule.annexeIiiCategory,
        rationale: rule.rationale,
        needsLegalReview: rule.needsLegalReview,
        method: "rule",
      }
    : { ...UNKNOWN_DEFAULT };

  // Ajustement secteur : usage potentiellement haut risque (Annexe III).
  const sectorNote = sector ? HIGH_RISK_SECTORS[sector] : undefined;
  if (sectorNote) {
    return {
      ...base,
      needsLegalReview: true,
      rationale: `${base.rationale} ⚠️ Secteur sensible — ${sectorNote} Un tel usage relèverait du haut risque et impose une relecture juridique.`,
    };
  }

  return base;
}
