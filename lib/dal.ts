import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Data Access Layer — centralise la vérification de session et l'accès au
 * profil. `cache()` mémoïse le résultat le temps d'un rendu React pour éviter
 * les requêtes dupliquées.
 *
 * Recommandation de la doc Next.js : faire les checks d'auth au plus près de la
 * donnée (ici et dans les pages/actions), pas seulement dans le proxy.
 */

export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
});

/**
 * Profil applicatif de l'utilisateur courant + sa société (jointure).
 * La RLS garantit qu'on ne récupère que la ligne de l'utilisateur connecté.
 */
export const getProfile = cache(async () => {
  const user = await getUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select(
      "id, email, role, company_id, companies ( name, sector, siret, employee_count, ingest_token )",
    )
    .eq("id", user.id)
    .single();

  if (error || !data) {
    // Utilisateur authentifié mais sans profil (signup interrompu avant la RPC)
    return null;
  }

  return data;
});

/** Outils IA détectés par l'extension (RLS : limité à la société courante). */
export const getDetectedTools = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("detected_tools")
    .select("id, domain, tool_name, distinct_users_count, last_seen")
    .order("last_seen", { ascending: false });
  return data ?? [];
});

/** Outils IA déclarés manuellement (RLS : limité à la société courante). */
export const getDeclaredTools = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("declared_tools")
    .select("id, tool_name, description, created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
});
