import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { assertAllowedAdmin, isAllowedAdmin } from "@/features/admin/utils/adminAuthorization";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export class UnauthorizedAdminError extends Error {
  constructor() {
    super("Administrator authorization required");
    this.name = "UnauthorizedAdminError";
  }
}

async function readAuthenticatedAdmin(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const allowedAdminId = process.env.ADMIN_USER_ID;

  if (error || !isAllowedAdmin(data.user?.id, allowedAdminId)) {
    return null;
  }

  return data.user;
}

export async function getAuthenticatedAdmin(): Promise<User | null> {
  "use cache: private";
  return readAuthenticatedAdmin();
}

export async function requireAdminPage(): Promise<User> {
  "use cache: private";
  const admin = await readAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

export async function requireAdmin(): Promise<User> {
  const admin = await readAuthenticatedAdmin();

  if (!admin) {
    throw new UnauthorizedAdminError();
  }

  assertAllowedAdmin(admin.id, process.env.ADMIN_USER_ID);
  return admin;
}
