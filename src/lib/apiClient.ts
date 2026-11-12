
import { ApiError } from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;

// Obtener y validar la URL configurada
function getApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error(
      "No se configuró NEXT_PUBLIC_API_BASE_URL."
    );
  }

  const url = API_BASE_URL.replace(/\/+$/, "");

  if (!/^https?:\/\//.test(url)) {
    throw new Error(
      "La URL de la API debe comenzar con http:// o https://."
    );
  }

  return url;
}

// Realizar una petición GET a la API
export async function apiGet<T>(
  endpoint: string,
  signal?: AbortSignal
): Promise<T> {
  const baseUrl = getApiBaseUrl();

  if (!endpoint.startsWith("/")) {
    throw new Error(
      "El endpoint debe comenzar con /."
    );
  }

  const response = await fetch(
    `${baseUrl}${endpoint}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal,
    }
  );

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Error al consultar la API (${response.status}).`
    );
  }

  return (await response.json()) as T;
}
