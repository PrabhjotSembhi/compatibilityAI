import { prisma } from "@/server/database/prisma";
import type { ListQuery } from "@/server/domain/shared";
import type { CreateRelationshipContextInput } from "@/server/domain/relationship-contexts/schemas";

export const relationshipContextRepository = {
  list(query: ListQuery) {
    return prisma.relationshipContext.findMany({
      orderBy: { createdAt: "desc" },
      take: query.take,
      where: query.status ? { status: query.status as never } : undefined,
    });
  },

  create(input: CreateRelationshipContextInput) {
    return prisma.relationshipContext.create({
      data: input,
    });
  },
};
