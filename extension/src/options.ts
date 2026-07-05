/**
 * Page d'options de l'extension : configuration du jeton de société et de
 * l'URL du backend. Stocké dans chrome.storage.local.
 */

const DEFAULT_API_BASE = "http://localhost:3000";

const tokenInput = document.getElementById("token") as HTMLInputElement;
const apiInput = document.getElementById("apiBaseUrl") as HTMLInputElement;
const statusEl = document.getElementById("status") as HTMLParagraphElement;
const form = document.getElementById("form") as HTMLFormElement;

async function load() {
  const { token, apiBaseUrl } = await chrome.storage.local.get([
    "token",
    "apiBaseUrl",
  ]);
  tokenInput.value = (token as string) ?? "";
  apiInput.value = (apiBaseUrl as string) ?? DEFAULT_API_BASE;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = tokenInput.value.trim();
  const apiBaseUrl = apiInput.value.trim() || DEFAULT_API_BASE;

  await chrome.storage.local.set({ token, apiBaseUrl });
  statusEl.textContent = "Enregistré ✓";
  statusEl.style.color = "#059669";
  setTimeout(() => (statusEl.textContent = ""), 2500);
});

load();
