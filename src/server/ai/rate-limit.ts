import { AppError } from "@/server/errors";

type MemoryBucket = {
  count: number;
  windowEndsAt: number;
};

const buckets = new Map<string, MemoryBucket>();

export function enforceAiRateLimit(
  key: string,
  options: { limit: number; windowMs: number },
) {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.windowEndsAt <= now) {
    buckets.set(key, {
      count: 1,
      windowEndsAt: now + options.windowMs,
    });
    return;
  }

  if (existing.count >= options.limit) {
    throw new AppError("RATE_LIMITED", "AI rate limit exceeded.", {
      key,
      retryAfterMs: existing.windowEndsAt - now,
    });
  }

  existing.count += 1;
}
