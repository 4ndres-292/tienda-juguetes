import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  adminSessionModeCookieName,
  applyAdminSessionMode,
  parseAdminSessionMode,
  type AdminSessionMode,
} from "@/features/admin/utils/adminSessionPersistence";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";

export async function createSupabaseServerClient(sessionMode?: AdminSessionMode) {
  const cookieStore = await cookies();
  const { url, publishableKey } = getPublicSupabaseConfig();
  const resolvedSessionMode = sessionMode ?? parseAdminSessionMode(
    cookieStore.get(adminSessionModeCookieName)?.value,
  );

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, applyAdminSessionMode(options, resolvedSessionMode));
          });
        } catch {
          // Los Server Components no pueden escribir cookies; Proxy refresca la sesión.
        }
      },
    },
  });
}

export function createPrivilegedSupabaseClient() {
  const { url } = getPublicSupabaseConfig();
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Supabase server configuration is missing");
  }

  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
