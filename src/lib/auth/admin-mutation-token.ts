
import "server-only";

import {
  getAdminSessionToken,
} from "@/lib/auth/admin-session";

/**
 * Recupera el JWT administrativo almacenado
 * en la cookie HttpOnly.
 *
 * Esta función se utiliza exclusivamente
 * desde las Server Actions de Next.js.
 *
 * No expone el token al navegador.
 */
export async function getAdminMutationToken():
  Promise<string | null> {

  const token = await getAdminSessionToken();

  if (!token) {
    return null;
  }

  return token;
}
