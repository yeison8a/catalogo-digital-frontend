
"use server";

import { redirect } from "next/navigation";

import {
  authenticateAdmin,
  AdminLoginError,
} from "@/lib/auth/admin-auth-api";

import {
  createAdminSession,
} from "@/lib/auth/admin-session";

/**
 * Estado utilizado por el formulario
 * de autenticación con useActionState.
 *
 * Nunca contiene contraseñas ni JWT.
 */
type LoginActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

/**
 * Autentica al administrador y crea
 * una sesión mediante una cookie HttpOnly.
 *
 * Si las credenciales son válidas:
 * 1. Spring Boot devuelve un JWT.
 * 2. Next.js crea la cookie de sesión.
 * 3. Next.js redirige directamente a /admin.
 *
 * Si ocurre un error, devuelve un mensaje
 * seguro al formulario.
 */
export async function loginAdminAction(
  _previousState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {

  // 1. Recuperar los datos enviados.
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");

  // 2. Validar los tipos de datos.
  if (
    typeof emailValue !== "string" ||
    typeof passwordValue !== "string"
  ) {
    return {
      status: "error",
      message: "Ingresa tu correo y contraseña.",
    };
  }

  const email = emailValue.trim().toLowerCase();
  const password = passwordValue;

  // 3. Validación básica del servidor.
  if (
    !email ||
    !password ||
    email.length > 254 ||
    password.length > 1024
  ) {
    return {
      status: "error",
      message: "Revisa los datos ingresados.",
    };
  }

  let accessToken: string;
  let expiresIn: number;

  // 4. Autenticar contra Spring Boot.
  try {
    const result = await authenticateAdmin(
      email,
      password
    );

    accessToken = result.accessToken;
    expiresIn = result.expiresIn;

  } catch (error) {

    // No revelar si existe el correo.
    if (error instanceof AdminLoginError) {
      return {
        status: "error",
        message: "Correo o contraseña incorrectos.",
      };
    }

    // No revelar detalles internos.
    return {
      status: "error",
      message:
        "No fue posible iniciar sesión. Inténtalo más tarde.",
    };
  }

  // 5. Crear la sesión mediante cookie HttpOnly.
  //
  // Esta operación solo ocurre después
  // de validar las credenciales.
  await createAdminSession(
    accessToken,
    expiresIn
  );

  // 6. Redirigir directamente desde el servidor.
  //
  // IMPORTANTE:
  // redirect() debe estar fuera del try/catch.
  // No debemos capturar su excepción interna.
  redirect("/admin");
}
