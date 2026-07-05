/**
 * Liste curatée des domaines d'outils IA grand public.
 * Sert à la détection « Shadow AI » par simple navigation (spec 6.1).
 *
 * Un domaine correspond si le hostname visité est exactement ce domaine,
 * ou un sous-domaine (ex. `www.` ou `chat.`).
 */
export interface AiDomain {
  domain: string;
  name: string;
}

export const AI_DOMAINS: AiDomain[] = [
  { domain: "chat.openai.com", name: "ChatGPT" },
  { domain: "chatgpt.com", name: "ChatGPT" },
  { domain: "claude.ai", name: "Claude" },
  { domain: "gemini.google.com", name: "Gemini" },
  { domain: "aistudio.google.com", name: "Google AI Studio" },
  { domain: "perplexity.ai", name: "Perplexity" },
  { domain: "copilot.microsoft.com", name: "Microsoft Copilot" },
  { domain: "chat.mistral.ai", name: "Le Chat (Mistral)" },
  { domain: "mistral.ai", name: "Mistral" },
  { domain: "poe.com", name: "Poe" },
  { domain: "character.ai", name: "Character.AI" },
  { domain: "huggingface.co", name: "Hugging Face" },
  { domain: "midjourney.com", name: "Midjourney" },
  { domain: "leonardo.ai", name: "Leonardo.AI" },
  { domain: "runwayml.com", name: "Runway" },
  { domain: "deepseek.com", name: "DeepSeek" },
  { domain: "chat.deepseek.com", name: "DeepSeek" },
  { domain: "grok.com", name: "Grok" },
  { domain: "notebooklm.google.com", name: "NotebookLM" },
  { domain: "you.com", name: "You.com" },
];

/**
 * Renvoie l'outil IA correspondant à un hostname, ou null si non répertorié.
 */
export function matchAiDomain(hostname: string): AiDomain | null {
  const host = hostname.toLowerCase();
  for (const entry of AI_DOMAINS) {
    if (host === entry.domain || host.endsWith("." + entry.domain)) {
      return entry;
    }
  }
  return null;
}
