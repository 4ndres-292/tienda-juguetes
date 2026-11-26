import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  adminSessionModeCookieName,
  applyAdminSessionMode,
  parseAdminSessionMode,
} from "@/features/admin/utils/adminSessionPersistence";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  const { url, publishableKey } = getPublicSupabaseConfig();
  const sessionMode = parseAdminSessionMode(
    request.cookies.get(adminSessionModeCookieName)?.value,
  );
  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, applyAdminSessionMode(options, sessionMode));
        });
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const isAdmin = data.user?.id === process.env.ADMIN_USER_ID;
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!isAdmin && !isLoginPage) {
    const redirectResponse = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  if (isAdmin && isLoginPage) {
    const redirectResponse = NextResponse.redirect(new URL("/admin", request.url));
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
