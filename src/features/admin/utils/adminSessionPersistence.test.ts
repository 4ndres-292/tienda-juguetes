import { describe, expect, it } from "vitest";
import { adminLoginSchema } from "@/features/admin/schemas/authSchema";
import {
  applyAdminSessionMode,
  getAdminSessionModeCookieOptions,
  parseAdminSessionMode,
} from "./adminSessionPersistence";

describe("admin session persistence", () => {
  it("keeps Supabase expiration for a persistent session", () => {
    const options = { httpOnly: true, maxAge: 1000, path: "/" };

    expect(applyAdminSessionMode(options, "persistent")).toEqual(options);
  });

  it("removes expiration from a temporary session cookie", () => {
    const expires = new Date("2030-01-01T00:00:00.000Z");
    const options = { expires, httpOnly: true, maxAge: 1000, path: "/" };

    expect(applyAdminSessionMode(options, "temporary")).toEqual({
      httpOnly: true,
      path: "/",
    });
  });

  it("preserves deletion cookies when signing out", () => {
    const options = { httpOnly: true, maxAge: 0, path: "/" };

    expect(applyAdminSessionMode(options, "temporary")).toEqual(options);
  });

  it("uses persistent mode for existing sessions without a marker", () => {
    expect(parseAdminSessionMode(undefined)).toBe("persistent");
    expect(parseAdminSessionMode("persistent")).toBe("persistent");
    expect(parseAdminSessionMode("temporary")).toBe("temporary");
  });

  it("creates a session cookie only for temporary mode", () => {
    expect(getAdminSessionModeCookieOptions("temporary", true)).toEqual({
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true,
    });
    expect(getAdminSessionModeCookieOptions("persistent", false)).toMatchObject({
      httpOnly: true,
      maxAge: expect.any(Number),
      secure: false,
    });
  });

  it("maps the login checkbox to a real persistence choice", () => {
    const credentials = { email: "admin@example.com", password: "secret" };

    expect(adminLoginSchema.parse(credentials).rememberMe).toBe(false);
    expect(adminLoginSchema.parse({ ...credentials, rememberMe: "on" }).rememberMe).toBe(true);
  });
});
