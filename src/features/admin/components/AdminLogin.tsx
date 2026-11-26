"use client";

import { useActionState } from "react";
import { loginAdminAction } from "@/features/admin/actions/authActions";
import { initialAdminActionState } from "@/features/admin/types/admin";

export function AdminLogin() {
  const [state, action, pending] = useActionState(
    loginAdminAction,
    initialAdminActionState,
  );

  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-brand-primary">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 w-full rounded-xl border border-brand-secondary/40 px-4 py-3 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-secondary/20"
        />
        {state.fieldErrors?.email?.map((message) => (
          <p key={message} className="mt-1 text-sm text-red-700">{message}</p>
        ))}
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-brand-primary">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 w-full rounded-xl border border-brand-secondary/40 px-4 py-3 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-secondary/20"
        />
        {state.fieldErrors?.password?.map((message) => (
          <p key={message} className="mt-1 text-sm text-red-700">{message}</p>
        ))}
      </div>
      <label className="flex cursor-pointer items-start gap-3 text-sm text-brand-primary">
        <input
          name="rememberMe"
          type="checkbox"
          className="mt-0.5 size-4 rounded border-brand-secondary text-brand-primary accent-brand-primary"
        />
        <span>
          <span className="font-semibold">Mantener mi sesión iniciada</span>
          <span className="mt-0.5 block text-xs text-brand-secondary">
            Úsalo únicamente en un dispositivo personal.
          </span>
        </span>
      </label>
      {state.message ? (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand-primary px-5 py-3 font-bold text-white transition hover:bg-brand-secondary disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
