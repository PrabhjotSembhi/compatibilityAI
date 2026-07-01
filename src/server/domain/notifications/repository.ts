import { prisma } from "@/server/database/prisma";
import type { ListQuery } from "@/server/domain/shared";
import type { CreateNotificationInput } from "@/server/domain/notifications/schemas";

export const notificationRepository = {
  list(query: ListQuery) {
    return prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: query.take,
      where: {
        userId: query.userId,
        status: query.status as never,
      },
    });
  },

  create(input: CreateNotificationInput) {
    return prisma.notification.create({
      data: input,
    });
  },
};
