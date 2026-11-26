export const adminSessionModeCookieName = "beetho-admin-session-mode";

export type AdminSessionMode = "persistent" | "temporary";

type CookieOptions = {
  expires?: Date;
  maxAge?: number;
  [key: string]: unknown;
};

const persistentSessionMaxAge = 400 * 24 * 60 * 60;

export function parseAdminSessionMode(value: string | undefined): AdminSessionMode {
  return value === "temporary" ? "temporary" : "persistent";
}

export function applyAdminSessionMode<T extends CookieOptions>(
  options: T,
  sessionMode: AdminSessionMode,
): T {
  const maxAge = options.maxAge;

  if (sessionMode === "persistent" || maxAge === 0) {
    return options;
  }

  const sessionOptions = { ...options };

  delete sessionOptions.expires;
  delete sessionOptions.maxAge;

  return sessionOptions;
}

export function getAdminSessionModeCookieOptions(
  sessionMode: AdminSessionMode,
  secure: boolean,
): {
  httpOnly: true;
  maxAge?: number;
  path: "/";
  sameSite: "lax";
  secure: boolean;
} {
  const commonOptions = {
    httpOnly: true as const,
    path: "/" as const,
    sameSite: "lax" as const,
    secure,
  };

  if (sessionMode === "temporary") {
    return commonOptions;
  }

  return { ...commonOptions, maxAge: persistentSessionMaxAge };
}
