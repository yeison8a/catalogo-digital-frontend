
/**
 * Catálogo Digital
 * Validación de configuración del servidor.
 *
 * Uso local:
 * node --env-file=.env.local scripts/check-server-config.mjs
 *
 * Uso en despliegue:
 * node scripts/check-server-config.mjs --production
 *
 * No imprime credenciales ni tokens.
 */

const productionCheck =
  process.argv.includes("--production");

const errors = [];
const warnings = [];

const rawApiBaseUrl = process.env.API_BASE_URL?.trim();

if (!rawApiBaseUrl) {
  errors.push(
    "Falta la variable de entorno API_BASE_URL."
  );
} else {
  try {
    const url = new URL(rawApiBaseUrl);

    // Permitir únicamente HTTP o HTTPS.
    if (!["http:", "https:"].includes(url.protocol)) {
      errors.push(
        "API_BASE_URL debe utilizar HTTP o HTTPS."
      );
    }

    // No permitir credenciales incrustadas.
    if (url.username || url.password) {
      errors.push(
        "API_BASE_URL no debe contener usuario ni contraseña."
      );
    }

    // La API está versionada en Spring Boot.
    const pathname =
      url.pathname.replace(/\/+$/, "");

    if (pathname !== "/api/v1") {
      errors.push(
        "API_BASE_URL debe terminar en /api/v1."
      );
    }

    // La URL no debe incluir parámetros ni fragmentos.
    if (url.search || url.hash) {
      errors.push(
        "API_BASE_URL no debe incluir parámetros ni fragmentos."
      );
    }

    if (productionCheck) {
      const localHosts = [
        "localhost",
        "127.0.0.1",
        "::1",
        "[::1]",
      ];

      if (localHosts.includes(url.hostname)) {
        warnings.push(
          "API_BASE_URL utiliza localhost. " +
          "Comprueba que Spring Boot se ejecute " +
          "en el mismo entorno de red que Next.js."
        );
      }

      if (url.protocol !== "https:") {
        warnings.push(
          "API_BASE_URL utiliza HTTP. " +
          "Confirma que la comunicación ocurra " +
          "en una red privada y protegida. " +
          "Usa HTTPS para comunicación por Internet."
        );
      }
    }
  } catch {
    errors.push(
      "API_BASE_URL no contiene una URL válida."
    );
  }
}

console.log("\nCatálogo Digital - Validación de configuración\n");

for (const warning of warnings) {
  console.warn(`ADVERTENCIA: ${warning}`);
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`ERROR: ${error}`);
  }

  console.error(
    "\nLa configuración no superó la validación."
  );

  process.exitCode = 1;
} else {
  console.log(
    "Configuración básica validada correctamente."
  );

  console.log(
    "Nota: esta comprobación no prueba " +
    "la disponibilidad real de Spring Boot."
  );
}
