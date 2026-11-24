
"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { loginAdminAction } from "@/lib/auth/admin-login-actions";

type LoginState = Awaited<
  ReturnType<typeof loginAdminAction>
>;

const initialState: LoginState = {
  status: "idle",
  message: "",
};

export default function LoginForm() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    loginAdminAction,
    initialState
  );

  // El backend ya verificó las credenciales
  // y la Server Action creó la cookie.
  useEffect(() => {
    if (state.status === "success") {
      router.replace("/admin");
      router.refresh();
    }
  }, [state.status, router]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">

      {/* Identidad del panel */}
      <div className="mb-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Panel administrativo
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Ingresa tus credenciales para gestionar
          los productos y las categorías del catálogo.
        </p>
      </div>

      {/* Formulario conectado a Next.js */}
      <form action={formAction} className="space-y-5">

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Correo electrónico
          </label>

          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            maxLength={254}
            placeholder="admin@ejemplo.com"
            disabled={isPending}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-800 focus:ring-2 focus:ring-slate-200 disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Contraseña
          </label>

          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            maxLength={1024}
            placeholder="Ingresa tu contraseña"
            disabled={isPending}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-800 focus:ring-2 focus:ring-slate-200 disabled:opacity-60"
          />
        </div>

        {/* Mensajes de autenticación */}
        {state.status === "error" && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {state.message}
          </div>
        )}

        {state.status === "success" && (
          <div
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            Inicio de sesión correcto. Redirigiendo...
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || state.status === "success"}
          className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Verificando credenciales..."
            : state.status === "success"
              ? "Ingresando..."
              : "Iniciar sesión"}
        </button>

      </form>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="text-center text-xs text-slate-500">
          Acceso exclusivo para administradores autorizados.
        </p>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
          >
            Volver al catálogo
          </Link>
        </div>
      </div>

    </div>
  );
}
