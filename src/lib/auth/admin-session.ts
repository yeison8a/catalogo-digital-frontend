
import "server-only";

import { cookies } from "next/headers";

/**
 * Nombre de la cookie que almacena
 * temporalmente el JWT administrativo.
 */
const ADMIN_SESSION_COOKIE = "admin_session";

/**
 * Duración máxima permitida:
 * 15 minutos, igual que el JWT de Spring Boot.
 */
const MAX_SESSION_SECONDS = 15 * 60;

/**
 * Guarda el JWT en una cookie HttpOnly.
 *
 * Solo debe llamarse después de que
 * Spring Boot autentique al administrador.
 *
 * Debe ejecutarse dentro de una Server Action
 * o un Route Handler de Next.js.
 */
export async function createAdminSession(
  accessToken: string,
  expiresIn: number
): Promise<void> {
  if (
    typeof accessToken !== "string" ||
    accessToken.trim().length === 0
  ) {
    throw new Error("Token de sesión inválido.");
  }

  if (
    !Number.isSafeInteger(expiresIn) ||
    expiresIn <= 0
  ) {
    throw new Error("Duración de sesión inválida.");
  }

  const sessionDuration = Math.min(
    expiresIn,
    MAX_SESSION_SECONDS
  );

  const cookieStore = await cookies();

  cookieStore.set(
    ADMIN_SESSION_COOKIE,
    accessToken,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionDuration,
      priority: "high",
    }
  );
}

/**
 * Recupera el JWT de la sesión actual.
 *
 * IMPORTANTE:
 * Leer una cookie NO significa que el JWT
 * sea válido ni que el usuario esté autorizado.
 *
 * Spring Boot deberá validar el JWT antes
 * de permitir cualquier operación administrativa.
 */
export async function getAdminSessionToken():
  Promise<string | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    ADMIN_SESSION_COOKIE
  )?.value;

  if (!token || token.trim().length === 0) {
    return null;
  }

  return token;
}

/**
 * Elimina la cookie de sesión.
 *
 * Debe ejecutarse desde una Server Action
 * o un Route Handler de Next.js.
 */
export async function deleteAdminSession():
  Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
