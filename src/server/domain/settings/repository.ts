import { prisma } from "@/server/database/prisma";
import type { ListQuery } from "@/server/domain/shared";
import type { CreateUserSettingsInput } from "@/server/domain/settings/schemas";

export const userSettingsRepository = {
  list(query: ListQuery) {
    return prisma.userSettings.findMany({
      orderBy: { createdAt: "desc" },
      take: query.take,
      where: {
        userId: query.userId,
      },
    });
  },

  create(input: CreateUserSettingsInput) {
    return prisma.userSettings.create({
      data: input,
    });
  },
};
