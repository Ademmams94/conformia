import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Endpoint d'ingestion des événements de l'extension Chrome.
 *
 * L'extension n'envoie QUE : jeton de société, identifiant anonyme hashé,
 * domaine, horodatage (implicite côté serveur). Jamais de contenu de page.
 * L'authentification se fait par le jeton d'ingestion (secret par société) ;
 * l'écriture en base passe par la service_role via la RPC record_extension_event.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

const EventSchema = z.object({
  token: z.uuid(),
  userIdHash: z.string().min(16).max(128),
  domain: z.string().min(1).max(253),
  toolName: z.string().max(120).optional(),
});

function json(status: number, body: unknown) {
  return Response.json(body, { status, headers: CORS_HEADERS });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json(400, { error: "Corps JSON invalide" });
  }

  const parsed = EventSchema.safeParse(payload);
  if (!parsed.success) {
    return json(400, { error: "Requête invalide" });
  }

  const { token, userIdHash, domain, toolName } = parsed.data;
  const supabase = createAdminClient();

  const { error } = await supabase.rpc("record_extension_event", {
    p_token: token,
    p_user_id_hash: userIdHash,
    p_domain: domain,
    p_tool_name: toolName ?? null,
  });

  if (error) {
    // errcode 28000 = jeton invalide (levé par la RPC)
    if (error.code === "28000" || /jeton/i.test(error.message)) {
      return json(403, { error: "Jeton d'ingestion invalide" });
    }
    console.error("record_extension_event:", error);
    return json(500, { error: "Erreur serveur" });
  }

  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
