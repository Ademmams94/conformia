"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { classifyTool } from "@/lib/classification/classify";

export type ToolActionState =
  | { error?: string; success?: string; fieldErrors?: Record<string, string[]> }
  | undefined;

const DeclareSchema = z.object({
  toolName: z.string().min(2, { error: "Nom de l'outil requis." }).trim(),
  description: z.string().trim().max(500).optional(),
});

/** Récupère l'utilisateur courant + son profil (company_id, role, secteur). */
async function requireProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, profile: null };

  const { data: profile } = await supabase
    .from("users")
    .select("id, role, company_id, companies ( sector )")
    .eq("id", user.id)
    .single();

  return { supabase, profile };
}

export async function declareTool(
  _prev: ToolActionState,
  formData: FormData,
): Promise<ToolActionState> {
  const parsed = DeclareSchema.safeParse({
    toolName: formData.get("toolName"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { supabase, profile } = await requireProfile();
  if (!profile) return { error: "Session expirée. Reconnectez-vous." };

  const { error } = await supabase.from("declared_tools").insert({
    company_id: profile.company_id,
    tool_name: parsed.data.toolName,
    description: parsed.data.description ?? null,
    declared_by_user_id: profile.id,
  });

  if (error) return { error: "Enregistrement impossible : " + error.message };

  revalidatePath("/dashboard");
  return { success: `« ${parsed.data.toolName} » ajouté.` };
}

/**
 * Classe (ou reclasse) tous les outils détectés + déclarés de la société via
 * les règles fixes. Réservé à l'admin (écriture sur risk_classifications).
 * Idempotent : upsert sur (tool_id, tool_source).
 */
export async function classifyCompanyTools(): Promise<ToolActionState> {
  const { supabase, profile } = await requireProfile();
  if (!profile) return { error: "Session expirée. Reconnectez-vous." };
  if (profile.role !== "admin") {
    return { error: "Seul un administrateur peut lancer la classification." };
  }

  const company = Array.isArray(profile.companies)
    ? profile.companies[0]
    : profile.companies;
  const sector = (company?.sector as string | null) ?? null;

  const [{ data: detected }, { data: declared }] = await Promise.all([
    supabase.from("detected_tools").select("id, domain, tool_name"),
    supabase.from("declared_tools").select("id, tool_name"),
  ]);

  const rows = [
    ...(detected ?? []).map((t) => ({
      tool_id: t.id,
      tool_source: "detected" as const,
      input: { name: t.tool_name, domain: t.domain },
    })),
    ...(declared ?? []).map((t) => ({
      tool_id: t.id,
      tool_source: "declared" as const,
      input: { name: t.tool_name, domain: null },
    })),
  ];

  if (rows.length === 0) {
    return { error: "Aucun outil à classer pour l'instant." };
  }

  const classifications = rows.map((r) => {
    const c = classifyTool(r.input, sector);
    return {
      company_id: profile.company_id,
      tool_id: r.tool_id,
      tool_source: r.tool_source,
      risk_level: c.riskLevel,
      annexe_iii_category: c.annexeIiiCategory,
      rationale: c.rationale,
      needs_legal_review: c.needsLegalReview,
    };
  });

  const { error } = await supabase
    .from("risk_classifications")
    .upsert(classifications, { onConflict: "tool_id,tool_source" });

  if (error) return { error: "Classification impossible : " + error.message };

  revalidatePath("/dashboard");
  return { success: `${classifications.length} outil(s) classé(s).` };
}
