"use server";

import { redirect } from "next/navigation";
import { adminLoginSchema } from "@/features/admin/schemas/authSchema";
import { isAllowedAdmin } from "@/features/admin/utils/adminAuthorization";
import type { AdminActionState } from "@/features/admin/types/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function loginAdminAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsedCredentials = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedCredentials.success) {
    return {
      status: "error",
      message: "Revisa los datos ingresados.",
      fieldErrors: parsedCredentials.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsedCredentials.data);

  if (error || !isAllowedAdmin(data.user?.id, process.env.ADMIN_USER_ID)) {
    await supabase.auth.signOut();
    return { status: "error", message: "Correo o contraseña incorrectos." };
  }

  redirect("/admin");
}

export async function logoutAdminAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
