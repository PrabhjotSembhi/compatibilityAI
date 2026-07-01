import { prisma } from "@/server/database/prisma";
import type { ListQuery } from "@/server/domain/shared";
import type { CreateMatchInput } from "@/server/domain/matches/schemas";

export const matchRepository = {
  list(query: ListQuery) {
    return prisma.match.findMany({
      orderBy: { createdAt: "desc" },
      take: query.take,
      where: {
        relationshipContextId: query.relationshipContextId,
        status: query.status as never,
        OR: query.userId
          ? [{ actorUserId: query.userId }, { candidateUserId: query.userId }]
          : undefined,
      },
    });
  },

  create(input: CreateMatchInput) {
    return prisma.match.create({
      data: input,
    });
  },
};
