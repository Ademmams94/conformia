import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * `proxy.ts` remplace `middleware.ts` dans cette version de Next.js.
 * Rafraîchit la session Supabase et protège les routes privées à chaque requête.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Toutes les routes SAUF :
     * - les fichiers statiques (_next/static, _next/image)
     * - le favicon et les images/assets publics
     * Sinon la logique d'auth peut bloquer le chargement du CSS/JS/images.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
