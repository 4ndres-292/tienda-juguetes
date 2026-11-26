"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminLoginSchema } from "@/features/admin/schemas/authSchema";
import { isAllowedAdmin } from "@/features/admin/utils/adminAuthorization";
import type { AdminActionState } from "@/features/admin/types/admin";
import {
  adminSessionModeCookieName,
  getAdminSessionModeCookieOptions,
  type AdminSessionMode,
} from "@/features/admin/utils/adminSessionPersistence";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function setAdminSessionMode(sessionMode: AdminSessionMode): Promise<void> {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(
    adminSessionModeCookieName,
    sessionMode,
    getAdminSessionModeCookieOptions(sessionMode, secure),
  );
}

export async function loginAdminAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsedCredentials = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    rememberMe: formData.get("rememberMe"),
  });

  if (!parsedCredentials.success) {
    return {
      status: "error",
      message: "Revisa los datos ingresados.",
      fieldErrors: parsedCredentials.error.flatten().fieldErrors,
    };
  }

  const { rememberMe, ...credentials } = parsedCredentials.data;
  const sessionMode: AdminSessionMode = rememberMe ? "persistent" : "temporary";
  const supabase = await createSupabaseServerClient(sessionMode);
  const { data, error } = await supabase.auth.signInWithPassword(credentials);

  if (error || !isAllowedAdmin(data.user?.id, process.env.ADMIN_USER_ID)) {
    await supabase.auth.signOut();
    return { status: "error", message: "Correo o contraseña incorrectos." };
  }

  await setAdminSessionMode(sessionMode);
  redirect("/admin");
}

export async function logoutAdminAction(): Promise<never> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();
  cookieStore.delete(adminSessionModeCookieName);
  redirect("/admin/login");
}
