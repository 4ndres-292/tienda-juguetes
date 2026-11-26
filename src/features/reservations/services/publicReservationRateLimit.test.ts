import { describe, expect, it } from "vitest";
import { ReservationRateLimiter } from "./publicReservationRateLimit";

describe("ReservationRateLimiter", () => {
  it("blocks attempts after the configured limit", () => {
    const rateLimiter = new ReservationRateLimiter(2, 1000);

    expect(rateLimiter.allow("client", 0)).toBe(true);
    expect(rateLimiter.allow("client", 1)).toBe(true);
    expect(rateLimiter.allow("client", 2)).toBe(false);
  });

  it("opens a new window after expiration", () => {
    const rateLimiter = new ReservationRateLimiter(1, 1000);

    expect(rateLimiter.allow("client", 0)).toBe(true);
    expect(rateLimiter.allow("client", 1000)).toBe(true);
  });
});
