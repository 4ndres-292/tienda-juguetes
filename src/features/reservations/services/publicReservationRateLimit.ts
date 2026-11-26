type RateLimitEntry = { count: number; expiresAt: number };

export class ReservationRateLimiter {
  private readonly attempts = new Map<string, RateLimitEntry>();

  constructor(
    private readonly maximumAttempts: number,
    private readonly windowMilliseconds: number,
  ) {}

  allow(identifier: string, now = Date.now()): boolean {
    const currentEntry = this.attempts.get(identifier);

    if (!currentEntry || currentEntry.expiresAt <= now) {
      this.attempts.set(identifier, {
        count: 1,
        expiresAt: now + this.windowMilliseconds,
      });
      return true;
    }

    if (currentEntry.count >= this.maximumAttempts) {
      return false;
    }

    currentEntry.count += 1;
    return true;
  }
}

export const publicReservationRateLimiter = new ReservationRateLimiter(5, 10 * 60 * 1000);
