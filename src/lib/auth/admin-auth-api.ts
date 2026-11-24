
import "server-only";

/**
 * Respuesta de autenticación del backend Spring Boot.
 */
export type AdminLoginResult = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
};

/**
 * Error controlado para autenticación.
 *
 * No revela información sensible del backend.
 */
export class AdminLoginError extends Error {
  constructor() {
    super("Correo o contraseña incorrectos.");
    this.name = "AdminLoginError";
  }
}

/**
 * Dirección del backend.
 *
 * API_BASE_URL es una variable del servidor,
 * no debe utilizar NEXT_PUBLIC_.
 */
function getApiBaseUrl(): string {
  const baseUrl =
    process.env.API_BASE_URL ??
    "http://127.0.0.1:8080/api/v1";

  return baseUrl.replace(/\/+$/, "");
}

/**
 * Comprueba que la respuesta del backend
 * contiene un JWT y sus metadatos.
 */
function isValidLoginResponse(
  value: unknown
): value is {
  authenticated: true;
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
} {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const result = value as Record<string, unknown>;

  return (
    result.authenticated === true &&
    typeof result.accessToken === "string" &&
    result.accessToken.length > 0 &&
    result.tokenType === "Bearer" &&
    typeof result.expiresIn === "number" &&
    Number.isFinite(result.expiresIn) &&
    result.expiresIn > 0
  );
}

/**
 * Verifica las credenciales contra Spring Boot.
 *
 * IMPORTANTE:
 * - Solo puede ejecutarse en el servidor.
 * - No imprime credenciales ni JWT.
 * - No guarda el token todavía.
 * - No expone la respuesta completa al navegador.
 */
export async function authenticateAdmin(
  email: string,
  password: string
): Promise<AdminLoginResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    throw new AdminLoginError();
  }

  const response = await fetch(
    `${getApiBaseUrl()}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: normalizedEmail,
        password,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    }
  );

  if (response.status === 401) {
    throw new AdminLoginError();
  }

  if (!response.ok) {
    throw new Error(
      "No fue posible completar la autenticación."
    );
  }

  const data: unknown = await response.json();

  if (!isValidLoginResponse(data)) {
    throw new Error(
      "La respuesta de autenticación no es válida."
    );
  }

  return {
    accessToken: data.accessToken,
    tokenType: data.tokenType,
    expiresIn: data.expiresIn,
  };
}
