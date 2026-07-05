"use client";

import { useActionState } from "react";
import { declareTool, type ToolActionState } from "@/app/actions/tools";

const inputClass =
  "rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/15 dark:bg-zinc-900";

export function DeclareForm() {
  const [state, action, pending] = useActionState<ToolActionState, FormData>(
    declareTool,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex-1">
        <input
          name="toolName"
          required
          placeholder="Nom de l'outil (ex : module IA de notre CRM)"
          className={`w-full ${inputClass}`}
        />
        {state?.fieldErrors?.toolName && (
          <p className="mt-1 text-xs text-red-600">
            {state.fieldErrors.toolName[0]}
          </p>
        )}
      </div>
      <input
        name="description"
        placeholder="Usage (optionnel)"
        className={`flex-1 ${inputClass}`}
      />
      <button
        type="submit"
        disabled={pending}
        className="h-[38px] shrink-0 rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {pending ? "Ajout…" : "Déclarer"}
      </button>
      {state?.success && (
        <p className="self-center text-xs text-emerald-600">{state.success}</p>
      )}
      {state?.error && (
        <p className="self-center text-xs text-red-600">{state.error}</p>
      )}
    </form>
  );
}
