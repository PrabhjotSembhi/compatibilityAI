import { prisma } from "@/server/database/prisma";
import type {
  CreatePromptTemplateInput,
  CreatePromptVersionInput,
} from "@/server/ai/schemas";

export const promptRepository = {
  listTemplates(take = 50) {
    return prisma.promptTemplate.findMany({
      include: { versions: { orderBy: { version: "desc" }, take: 5 } },
      orderBy: { createdAt: "desc" },
      take,
    });
  },

  createTemplate(input: CreatePromptTemplateInput) {
    return prisma.promptTemplate.create({
      data: input,
    });
  },

  async createVersion(input: CreatePromptVersionInput) {
    if (input.isActive) {
      await prisma.promptVersion.updateMany({
        data: { isActive: false },
        where: { promptTemplateId: input.promptTemplateId },
      });
    }

    return prisma.promptVersion.create({
      data: input,
    });
  },

  getActiveVersion(templateKey: string) {
    return prisma.promptVersion.findFirst({
      include: { promptTemplate: true },
      orderBy: { version: "desc" },
      where: {
        isActive: true,
        promptTemplate: {
          key: templateKey,
          status: "ACTIVE",
        },
      },
    });
  },
};
