import { prisma } from "@/server/database/prisma";
import type { UserListQuery } from "@/server/domain/users/schemas";

export const userRepository = {
  list(query: UserListQuery) {
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: query.take,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },
};
