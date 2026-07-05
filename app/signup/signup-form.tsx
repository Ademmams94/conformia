"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type AuthState } from "@/app/actions/auth";

const inputClass =
  "rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/15 dark:bg-zinc-900";

export function SignupForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signup,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="companyName" className="text-sm font-medium">
          Nom de la société
        </label>
        <input
          id="companyName"
          name="companyName"
          required
          defaultValue={state?.values?.companyName ?? ""}
          className={inputClass}
        />
        {state?.fieldErrors?.companyName && (
          <p className="text-xs text-red-600">
            {state.fieldErrors.companyName[0]}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sector" className="text-sm font-medium">
            Secteur
          </label>
          <select
            id="sector"
            name="sector"
            defaultValue={state?.values?.sector ?? ""}
            className={inputClass}
          >
            <option value="">—</option>
            <option value="recrutement_rh">Recrutement / RH</option>
            <option value="fintech_credit">Fintech / Crédit</option>
            <option value="assurance">Assurance</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="employeeCount" className="text-sm font-medium">
            Effectif
          </label>
          <input
            id="employeeCount"
            name="employeeCount"
            type="number"
            min={1}
            placeholder="ex : 25"
            defaultValue={state?.values?.employeeCount ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="siret" className="text-sm font-medium">
          SIRET <span className="text-zinc-400">(optionnel)</span>
        </label>
        <input
          id="siret"
          name="siret"
          defaultValue={state?.values?.siret ?? ""}
          className={inputClass}
        />
      </div>

      <hr className="my-1 border-black/5 dark:border-white/10" />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.values?.email ?? ""}
          className={inputClass}
        />
        {state?.fieldErrors?.email && (
          <p className="text-xs text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className={inputClass}
        />
        <p className="text-xs text-zinc-500">
          8 caractères min., avec une lettre, un chiffre et un caractère spécial.
        </p>
        {state?.fieldErrors?.password && (
          <ul className="text-xs text-red-600">
            {state.fieldErrors.password.map((msg) => (
              <li key={msg}>• {msg}</li>
            ))}
          </ul>
        )}
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex h-11 items-center justify-center rounded-full bg-emerald-600 px-6 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
      >
        {pending ? "Création…" : "Créer mon compte"}
      </button>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-emerald-600">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
