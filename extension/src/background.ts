/**
 * Service worker de l'extension ConformIA (Manifest V3).
 *
 * Écoute les navigations (chrome.webNavigation) et, à la visite d'un domaine IA
 * connu, envoie au backend : jeton de société + identifiant anonyme hashé +
 * domaine. GARDE-FOUS (spec 8) :
 *   - jamais de contenu de page, seulement le domaine ;
 *   - identifiant salarié hashé côté client (SHA-256) avant envoi ;
 *   - aucune action de blocage, visibilité seule.
 */
import { matchAiDomain } from "./ai-domains.js";

const DEFAULT_API_BASE = "http://localhost:3000";
const THROTTLE_MS = 2 * 60 * 1000; // 1 événement max par domaine / 2 min

interface Config {
  token?: string;
  apiBaseUrl?: string;
  installId?: string;
}

async function getConfig(): Promise<Config> {
  return chrome.storage.local.get(["token", "apiBaseUrl", "installId"]);
}

/**
 * Identifiant anonyme et stable par installation, puis hashé.
 * Un UUID aléatoire (aucune donnée personnelle) généré au premier lancement.
 */
async function getUserIdHash(): Promise<string> {
  let { installId } = await getConfig();
  if (!installId) {
    installId = crypto.randomUUID();
    await chrome.storage.local.set({ installId });
  }
  const bytes = new TextEncoder().encode(installId);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Anti-flood : retient le dernier envoi par domaine dans storage.session. */
async function shouldSend(domain: string): Promise<boolean> {
  const key = `last:${domain}`;
  const store = await chrome.storage.session.get(key);
  const last = store[key] as number | undefined;
  const now = Date.now();
  if (last && now - last < THROTTLE_MS) return false;
  await chrome.storage.session.set({ [key]: now });
  return true;
}

async function sendEvent(domain: string, toolName: string): Promise<void> {
  const { token, apiBaseUrl } = await getConfig();
  if (!token) return; // extension non configurée : on ne fait rien

  const userIdHash = await getUserIdHash();
  const base = (apiBaseUrl || DEFAULT_API_BASE).replace(/\/$/, "");

  try {
    await fetch(`${base}/api/extension/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, userIdHash, domain, toolName }),
    });
  } catch {
    // Réseau indisponible : on abandonne silencieusement cet événement.
  }
}

chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return; // frame principale uniquement

  let hostname: string;
  try {
    hostname = new URL(details.url).hostname;
  } catch {
    return;
  }

  const match = matchAiDomain(hostname);
  if (!match) return;

  if (await shouldSend(match.domain)) {
    await sendEvent(match.domain, match.name);
  }
});
