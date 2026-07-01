import { prisma } from "@/server/database/prisma";
import type { AiUsageListQuery } from "@/server/ai/schemas";
import type { JsonObject } from "@/server/ai/types";

export type RecordAiUsageInput = {
  userId?: string;
  promptVersionId?: string;
  provider: string;
  model: string;
  featureKey: string;
  status: "SUCCEEDED" | "FAILED";
  requestId?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  latencyMs?: number;
  errorCode?: string;
  errorMessage?: string;
  metadata?: JsonObject;
};

export const aiUsageRepository = {
  list(query: AiUsageListQuery) {
    return prisma.aiUsageEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: query.take,
      where: {
        userId: query.userId,
        featureKey: query.featureKey,
      },
    });
  },

  record(input: RecordAiUsageInput) {
    return prisma.aiUsageEvent.create({
      data: {
        provider: input.provider,
        model: input.model,
        featureKey: input.featureKey,
        status: input.status,
        requestId: input.requestId,
        inputTokens: input.inputTokens,
        outputTokens: input.outputTokens,
        totalTokens: input.totalTokens,
        latencyMs: input.latencyMs,
        errorCode: input.errorCode,
        errorMessage: input.errorMessage,
        metadata: input.metadata,
        user: input.userId ? { connect: { id: input.userId } } : undefined,
        promptVersion: input.promptVersionId
          ? { connect: { id: input.promptVersionId } }
          : undefined,
      },
    });
  },
};
