import { prisma } from "@/server/database/prisma";
import type { ListQuery } from "@/server/domain/shared";
import type { CreateReportInput } from "@/server/domain/reports/schemas";

export const reportRepository = {
  list(query: ListQuery) {
    return prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: query.take,
      where: {
        userId: query.userId,
        relationshipContextId: query.relationshipContextId,
        status: query.status as never,
      },
    });
  },

  create(input: CreateReportInput) {
    return prisma.report.create({
      data: input,
    });
  },
};
