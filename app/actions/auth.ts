"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type AuthState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[]>;
      // Valeurs saisies renvoyées pour re-remplir le formulaire après une
      // erreur (React 19 réinitialise le form après une action). Jamais le mot de passe.
      values?: Record<string, string>;
    }
  | undefined;

const SECTORS = [
  "recrutement_rh",
  "fintech_credit",
  "assurance",
  "autre",
] as const;

const SignupSchema = z.object({
  email: z.email({ error: "Adresse e-mail invalide." }).trim(),
  password: z
    .string()
    .min(8, { error: "Au moins 8 caractères." })
    .regex(/[a-zA-Z]/, { error: "Au moins une lettre." })
    .regex(/[0-9]/, { error: "Au moins un chiffre." })
    .regex(/[^a-zA-Z0-9]/, { error: "Au moins un caractère spécial." }),
  companyName: z
    .string()
    .min(2, { error: "Le nom de la société est requis." })
    .trim(),
  siret: z.string().trim().optional(),
  sector: z.enum(SECTORS).optional(),
  employeeCount: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .catch(undefined),
});

const LoginSchema = z.object({
  email: z.email({ error: "Adresse e-mail invalide." }).trim(),
  password: z.string().min(1, { error: "Mot de passe requis." }),
});

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const values = {
    email: String(formData.get("email") ?? ""),
    companyName: String(formData.get("companyName") ?? ""),
    siret: String(formData.get("siret") ?? ""),
    sector: String(formData.get("sector") ?? ""),
    employeeCount: String(formData.get("employeeCount") ?? ""),
  };

  const parsed = SignupSchema.safeParse({
    email: values.email,
    password: formData.get("password"),
    companyName: values.companyName,
    siret: values.siret || undefined,
    sector: values.sector || undefined,
    employeeCount: values.employeeCount || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const { email, password, companyName, siret, sector, employeeCount } =
    parsed.data;
  const supabase = await createClient();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    return { error: signUpError.message, values };
  }

  // Confirmation e-mail activée côté Supabase : pas de session immédiate.
  if (!signUpData.session) {
    return {
      error:
        "Compte créé. Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi.",
      values,
    };
  }

  // Provisionne la société + le profil admin (RPC SECURITY DEFINER).
  const { error: rpcError } = await supabase.rpc("create_company_and_admin", {
    p_name: companyName,
    p_siret: siret ?? null,
    p_sector: sector ?? null,
    p_employee_count: employeeCount ?? null,
  });

  if (rpcError) {
    return {
      error: `Création de la société impossible : ${rpcError.message}`,
      values,
    };
  }

  redirect("/dashboard");
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const values = { email: String(formData.get("email") ?? "") };

  const parsed = LoginSchema.safeParse({
    email: values.email,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "E-mail ou mot de passe incorrect.", values };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
