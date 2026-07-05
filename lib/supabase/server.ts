import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase pour le code serveur (Server Components, Server Actions,
 * Route Handlers). Lit et rafraîchit la session via les cookies Next.js.
 *
 * `cookies()` est asynchrone dans cette version de Next.js : ce helper doit
 * donc être `await`é à chaque appel.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Appelé depuis un Server Component : l'écriture de cookies y est
            // interdite. Le rafraîchissement de session est géré par proxy.ts,
            // donc on peut ignorer cette erreur en toute sécurité.
          }
        },
      },
    },
  );
}
