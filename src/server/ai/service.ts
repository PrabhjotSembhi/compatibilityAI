import { getEnv } from "@/config/env";
import { enforceAiRateLimit } from "@/server/ai/rate-limit";
import { generateOpenAIStructuredOutput } from "@/server/ai/openai-provider";
import { promptRepository } from "@/server/ai/prompt.repository";
import { aiUsageRepository } from "@/server/ai/usage.repository";
import type { StructuredAiRequestInput } from "@/server/ai/schemas";
import { withRetry } from "@/server/ai/retry";
import { AppError } from "@/server/errors";

export const aiInfrastructureService = {
  listPromptTemplates(take = 50) {
    return promptRepository.listTemplates(take);
  },

  createPromptTemplate: promptRepository.createTemplate,

  createPromptVersion: promptRepository.createVersion,

  listUsage: aiUsageRepository.list,

  async generateStructured(input: StructuredAiRequestInput) {
    const env = getEnv();
    const activePrompt = await promptRepository.getActiveVersion(
      input.promptTemplateKey,
    );

    if (!activePrompt) {
      throw new AppError("NOT_FOUND", "No active prompt version found.", {
        promptTemplateKey: input.promptTemplateKey,
      });
    }

    const model =
      input.model ??
      activePrompt.model ??
      activePrompt.promptTemplate.defaultModel ??
      env.OPENAI_MODEL;

    enforceAiRateLimit(input.userId ?? input.featureKey, {
      limit: env.AI_RATE_LIMIT_REQUESTS,
      windowMs: env.AI_RATE_LIMIT_WINDOW_MS,
    });

    try {
      const result = await withRetry(() =>
        generateOpenAIStructuredOutput({
          model,
          schemaName: input.schemaName,
          jsonSchema: input.jsonSchema,
          prompt: {
            systemPrompt: activePrompt.systemPrompt,
            developerPrompt: activePrompt.developerPrompt,
            userPromptTemplate: activePrompt.userPromptTemplate,
            variables: input.variables,
          },
        }),
      );

      await aiUsageRepository.record({
        userId: input.userId,
        promptVersionId: activePrompt.id,
        provider: result.provider,
        model: result.model,
        featureKey: input.featureKey,
        status: "SUCCEEDED",
        requestId: result.requestId,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        totalTokens: result.totalTokens,
        latencyMs: result.latencyMs,
        metadata: input.metadata,
      });

      return result;
    } catch (error) {
      await aiUsageRepository.record({
        userId: input.userId,
        promptVersionId: activePrompt.id,
        provider: "openai",
        model,
        featureKey: input.featureKey,
        status: "FAILED",
        errorCode: error instanceof AppError ? error.code : "UNKNOWN",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        metadata: input.metadata,
      });

      throw error;
    }
  },
};
