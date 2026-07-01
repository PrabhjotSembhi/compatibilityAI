import { z } from "zod";

import type { Prisma } from "@/generated/prisma/client";
import { AppError } from "@/server/errors";

export const jsonObjectSchema = z.record(
  z.string(),
  z.unknown(),
) as z.ZodType<Prisma.InputJsonObject>;

export const listQuerySchema = z.object({
  userId: z.string().min(1).optional(),
  relationshipContextId: z.string().min(1).optional(),
  status: z.string().min(1).optional(),
  take: z.coerce.number().int().min(1).max(100).default(50),
});

export type ListQuery = z.infer<typeof listQuerySchema>;

export function readListQuery(searchParams: URLSearchParams): ListQuery {
  const result = listQuerySchema.safeParse({
    userId: searchParams.get("userId") ?? undefined,
    relationshipContextId:
      searchParams.get("relationshipContextId") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    take: searchParams.get("take") ?? undefined,
  });

  if (!result.success) {
    throw new AppError(
      "VALIDATION_ERROR",
      "The request query is invalid.",
      z.flattenError(result.error),
    );
  }

  return result.data;
}
