"use client";

import { useActionState } from "react";
import { classifyCompanyTools, type ToolActionState } from "@/app/actions/tools";

export function ClassifyButton() {
  const [state, action, pending] = useActionState<ToolActionState, FormData>(
    async () => classifyCompanyTools(),
    undefined,
  );

  return (
    <form action={action} className="flex items-center gap-3">
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
      >
        {pending ? "Classification…" : "Classer les outils"}
      </button>
      {state?.success && (
        <span className="text-xs text-emerald-600">{state.success}</span>
      )}
      {state?.error && (
        <span className="text-xs text-red-600">{state.error}</span>
      )}
    </form>
  );
}
