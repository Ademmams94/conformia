/**
 * Règles de classification fixes (Annexe III de l'AI Act).
 *
 * Choix d'ingénierie (spec §7.1) : une classification à portée réglementaire
 * doit rester AUDITABLE et REPRODUCTIBLE. On code donc des règles explicites sur
 * les cas connus, avec une justification textuelle et un drapeau de relecture
 * juridique. Les cas non répertoriés sont couverts par un fallback LLM (à venir)
 * et, en attendant, classés en préliminaire avec relecture obligatoire.
 *
 * RAPPEL FONDAMENTAL : le niveau de risque AI Act dépend de l'USAGE, pas de
 * l'outil. Un assistant généraliste est « risque limité » par défaut, mais son
 * usage dans un domaine de l'Annexe III (recrutement, scoring crédit, évaluation
 * de salariés…) le fait basculer en « haut risque ». Le moteur ne tranche donc
 * jamais seul un « haut risque » sur la seule base du domaine : il signale et
 * demande une relecture.
 */

export type RiskLevel = "prohibited" | "high" | "limited" | "minimal";

export interface Classification {
  riskLevel: RiskLevel;
  annexeIiiCategory: string | null;
  rationale: string;
  needsLegalReview: boolean;
  /** Méthode ayant produit la classification (traçabilité). */
  method: "rule" | "rule-default" | "llm";
}

interface ToolRule {
  /** Domaines correspondants (pour les outils détectés). */
  domains?: string[];
  /** Fragments de nom (minuscule) correspondants (pour les outils déclarés). */
  nameMatches?: string[];
  riskLevel: RiskLevel;
  annexeIiiCategory: string | null;
  rationale: string;
  needsLegalReview: boolean;
}

/**
 * Assistants IA généralistes : « risque limité » par défaut (obligations de
 * transparence, art. 50 — informer l'utilisateur qu'il interagit avec une IA,
 * marquer les contenus générés). Le risque réel dépend de l'usage.
 */
const GENERAL_ASSISTANT: Omit<ToolRule, "domains" | "nameMatches"> = {
  riskLevel: "limited",
  annexeIiiCategory: null,
  rationale:
    "Assistant IA généraliste. Soumis aux obligations de transparence (art. 50 AI Act). Le niveau de risque réel dépend de l'usage qui en est fait : un usage dans un domaine de l'Annexe III (recrutement, évaluation, scoring) relèverait du haut risque.",
  needsLegalReview: false,
};

export const TOOL_RULES: ToolRule[] = [
  {
    domains: ["chat.openai.com", "chatgpt.com"],
    nameMatches: ["chatgpt", "openai"],
    ...GENERAL_ASSISTANT,
  },
  { domains: ["claude.ai"], nameMatches: ["claude", "anthropic"], ...GENERAL_ASSISTANT },
  { domains: ["gemini.google.com", "aistudio.google.com"], nameMatches: ["gemini"], ...GENERAL_ASSISTANT },
  { domains: ["copilot.microsoft.com"], nameMatches: ["copilot"], ...GENERAL_ASSISTANT },
  { domains: ["perplexity.ai"], nameMatches: ["perplexity"], ...GENERAL_ASSISTANT },
  { domains: ["chat.mistral.ai", "mistral.ai"], nameMatches: ["mistral", "le chat"], ...GENERAL_ASSISTANT },
  { domains: ["deepseek.com", "chat.deepseek.com"], nameMatches: ["deepseek"], ...GENERAL_ASSISTANT },
  { domains: ["grok.com"], nameMatches: ["grok"], ...GENERAL_ASSISTANT },
  { domains: ["you.com"], nameMatches: ["you.com"], ...GENERAL_ASSISTANT },
  { domains: ["poe.com"], nameMatches: ["poe"], ...GENERAL_ASSISTANT },
  { domains: ["notebooklm.google.com"], nameMatches: ["notebooklm"], ...GENERAL_ASSISTANT },
  {
    domains: ["character.ai"],
    nameMatches: ["character.ai", "character ai"],
    riskLevel: "limited",
    annexeIiiCategory: null,
    rationale:
      "Agent conversationnel. Obligations de transparence (art. 50) : l'utilisateur doit être informé qu'il interagit avec une IA.",
    needsLegalReview: false,
  },
  {
    domains: ["midjourney.com", "leonardo.ai", "runwayml.com"],
    nameMatches: ["midjourney", "leonardo", "runway"],
    riskLevel: "limited",
    annexeIiiCategory: null,
    rationale:
      "Génération d'images/vidéos. Obligations de transparence (art. 50) : les contenus de synthèse (y compris deepfakes) doivent être marqués comme générés par IA.",
    needsLegalReview: false,
  },
  {
    domains: ["huggingface.co"],
    nameMatches: ["hugging face", "huggingface"],
    riskLevel: "minimal",
    annexeIiiCategory: null,
    rationale:
      "Plateforme de modèles/outils IA. Usage très variable ; risque minimal par défaut, à préciser selon les modèles réellement utilisés.",
    needsLegalReview: true,
  },
];

/**
 * Domaines / secteurs d'activité de l'entreprise qui relèvent typiquement de
 * l'Annexe III (haut risque). Si l'entreprise opère dans l'un d'eux, tout outil
 * IA peut y être utilisé pour un usage haut risque → relecture juridique forcée.
 */
export const HIGH_RISK_SECTORS: Record<string, string> = {
  recrutement_rh:
    "Emploi et gestion des travailleurs (Annexe III §4) : tri de candidatures, évaluation.",
  fintech_credit:
    "Accès aux services essentiels (Annexe III §5) : évaluation de solvabilité / scoring de crédit.",
  assurance:
    "Accès aux services essentiels (Annexe III §5) : tarification et évaluation des risques en assurance-vie/santé.",
};

/** Classification par défaut d'un outil non répertorié (avant fallback LLM). */
export const UNKNOWN_DEFAULT: Classification = {
  riskLevel: "limited",
  annexeIiiCategory: null,
  rationale:
    "Outil non répertorié dans la liste curatée. Classification préliminaire par défaut, à confirmer (relecture juridique ou analyse de l'usage).",
  needsLegalReview: true,
  method: "rule-default",
};

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

/** Recherche une règle par domaine (outils détectés) ou par nom (déclarés). */
export function findRule(opts: { domain?: string; name?: string }): ToolRule | null {
  const domain = opts.domain ? normalize(opts.domain) : null;
  const name = opts.name ? normalize(opts.name) : null;

  for (const rule of TOOL_RULES) {
    if (domain && rule.domains?.some((d) => domain === d || domain.endsWith("." + d))) {
      return rule;
    }
    if (name && rule.nameMatches?.some((n) => name.includes(n))) {
      return rule;
    }
  }
  return null;
}
