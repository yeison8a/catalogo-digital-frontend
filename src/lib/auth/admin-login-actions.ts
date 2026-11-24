
"use server";

import {
  authenticateAdmin,
  AdminLoginError,
} from "@/lib/auth/admin-auth-api";

import {
  createAdminSession,
} from "@/lib/auth/admin-session";

/**
 * Estado que posteriormente utilizará
 * el formulario con useActionState.
 *
 * Nunca incluye contraseñas ni JWT.
 */
type LoginActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

/**
 * Autentica al administrador y crea
 * su sesión mediante una cookie HttpOnly.
 *
 * Solo retorna información segura
 * para mostrar en el navegador.
 */
export async function loginAdminAction(
  _previousState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {

  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");

  // No confiamos en los datos enviados
  // desde el navegador.
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

  // Validación básica del lado del servidor.
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

  try {
    // Spring Boot verifica la contraseña,
    // el rol ADMIN y el estado del usuario.
    const result = await authenticateAdmin(
      email,
      password
    );

    accessToken = result.accessToken;
    expiresIn = result.expiresIn;

  } catch (error) {

    // No revelar si el correo existe.
    if (error instanceof AdminLoginError) {
      return {
        status: "error",
        message: "Correo o contraseña incorrectos.",
      };
    }

    // No mostrar errores internos del servidor.
    return {
      status: "error",
      message:
        "No fue posible iniciar sesión. Inténtalo más tarde.",
    };
  }

  // Solo se ejecuta cuando Spring Boot
  // ha confirmado la autenticación.
  await createAdminSession(
    accessToken,
    expiresIn
  );

  // El JWT NO forma parte de la respuesta
  // enviada al componente del navegador.
  return {
    status: "success",
    message: "Inicio de sesión correcto.",
  };
}
