import { prisma } from "@/server/database/prisma";
import type { ListQuery } from "@/server/domain/shared";
import type { CreateConversationInput } from "@/server/domain/conversations/schemas";

export const conversationRepository = {
  list(query: ListQuery) {
    return prisma.conversation.findMany({
      include: { messages: true },
      orderBy: { createdAt: "desc" },
      take: query.take,
      where: {
        userId: query.userId,
        relationshipContextId: query.relationshipContextId,
        status: query.status as never,
      },
    });
  },

  create(input: CreateConversationInput) {
    return prisma.conversation.create({
      data: input,
    });
  },
};
