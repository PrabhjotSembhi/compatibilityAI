import { prisma } from "@/server/database/prisma";
import type { ListQuery } from "@/server/domain/shared";
import type { CreatePersonalityProfileInput } from "@/server/domain/personality-profiles/schemas";

export const personalityProfileRepository = {
  list(query: ListQuery) {
    return prisma.personalityProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: query.take,
      where: {
        userId: query.userId,
      },
    });
  },

  create(input: CreatePersonalityProfileInput) {
    return prisma.personalityProfile.create({
      data: input,
    });
  },
};
