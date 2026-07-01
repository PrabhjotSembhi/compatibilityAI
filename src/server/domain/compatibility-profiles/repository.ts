import { prisma } from "@/server/database/prisma";
import type { ListQuery } from "@/server/domain/shared";
import type { CreateCompatibilityProfileInput } from "@/server/domain/compatibility-profiles/schemas";

export const compatibilityProfileRepository = {
  list(query: ListQuery) {
    return prisma.compatibilityProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: query.take,
      where: {
        userId: query.userId,
        relationshipContextId: query.relationshipContextId,
      },
    });
  },

  create(input: CreateCompatibilityProfileInput) {
    return prisma.compatibilityProfile.create({
      data: input,
    });
  },
};
