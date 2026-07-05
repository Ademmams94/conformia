import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase « admin » utilisant la clé service_role — CONTOURNE la RLS.
 * À n'utiliser QUE dans du code serveur de confiance (ingestion extension,
 * moteur de classification). L'import "server-only" garantit qu'un bundle
 * client échouera à la compilation s'il tente de l'importer.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
