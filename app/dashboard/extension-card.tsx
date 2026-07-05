"use client";

import { useState } from "react";

export function ExtensionCard({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  async function copy(value: string, reset: () => void) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(reset, 2000);
    } catch {
      // Clipboard indisponible (contexte non sécurisé) : on ignore.
    }
  }

  return (
    <div className="mt-8 rounded-xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
      <h2 className="text-base font-semibold">Connecter l&apos;extension</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Installez l&apos;extension ConformIA sur les postes de votre équipe, puis
        collez ce jeton dans ses options pour commencer la détection.
      </p>

      <div className="mt-4">
        <span className="text-xs font-medium text-zinc-500">
          Jeton d&apos;ingestion
        </span>
        <div className="mt-1 flex items-center gap-2">
          <code className="flex-1 overflow-x-auto rounded-lg bg-zinc-100 px-3 py-2 font-mono text-sm dark:bg-zinc-800">
            {token}
          </code>
          <button
            type="button"
            onClick={() => copy(token, () => setCopied(false))}
            className="shrink-0 rounded-lg border border-black/10 px-3 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
          >
            {copied ? "Copié ✓" : "Copier"}
          </button>
        </div>
      </div>

      <p className="mt-3 text-xs text-zinc-400">
        Ce jeton est un secret : ne le partagez qu&apos;avec vos salariés
        concernés. Toute personne qui le possède peut envoyer des événements de
        détection pour votre société.
      </p>
    </div>
  );
}
