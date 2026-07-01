import { prisma } from "@/server/database/prisma";
import type { ListQuery } from "@/server/domain/shared";
import type { CreateProfileInput } from "@/server/domain/profiles/schemas";

export const profileRepository = {
  list(query: ListQuery) {
    return prisma.profile.findMany({
      orderBy: { createdAt: "desc" },
      take: query.take,
      where: {
        userId: query.userId,
        relationshipContextId: query.relationshipContextId,
        status: query.status as never,
      },
    });
  },

  create(input: CreateProfileInput) {
    return prisma.profile.create({
      data: input,
    });
  },
};
