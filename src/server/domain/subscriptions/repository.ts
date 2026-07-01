import { prisma } from "@/server/database/prisma";
import type { ListQuery } from "@/server/domain/shared";
import type { CreateSubscriptionInput } from "@/server/domain/subscriptions/schemas";

export const subscriptionRepository = {
  list(query: ListQuery) {
    return prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      take: query.take,
      where: {
        userId: query.userId,
        status: query.status as never,
      },
    });
  },

  create(input: CreateSubscriptionInput) {
    return prisma.subscription.create({
      data: input,
    });
  },
};
