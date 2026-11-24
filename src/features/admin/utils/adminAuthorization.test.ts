import { describe, expect, it } from "vitest";
import { assertAllowedAdmin, isAllowedAdmin } from "@/features/admin/utils/adminAuthorization";

describe("isAllowedAdmin", () => {
  it("allows only the configured user", () => {
    expect(isAllowedAdmin("admin-id", "admin-id")).toBe(true);
    expect(isAllowedAdmin("other-id", "admin-id")).toBe(false);
    expect(isAllowedAdmin(undefined, "admin-id")).toBe(false);
  });

  it("blocks administrative operations without authorization", () => {
    expect(() => assertAllowedAdmin(undefined, "admin-id")).toThrow(
      "Administrator authorization required",
    );
    expect(() => assertAllowedAdmin("other-id", "admin-id")).toThrow();
  });
});
