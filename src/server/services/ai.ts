import { getEnv } from "@/config/env";
import { AppError } from "@/server/errors";

export type GenerateStructuredProfileInput = {
  userText: string;
  schemaName: string;
};

export type GenerateStructuredProfileResult = {
  provider: "openai";
  content: string;
};

export interface AIService {
  generateStructuredProfile(
    input: GenerateStructuredProfileInput,
  ): Promise<GenerateStructuredProfileResult>;
}

export class OpenAIService implements AIService {
  async generateStructuredProfile(
    input: GenerateStructuredProfileInput,
  ): Promise<GenerateStructuredProfileResult> {
    const env = getEnv();

    if (!env.OPENAI_API_KEY) {
      throw new AppError(
        "SERVICE_UNAVAILABLE",
        "AI provider is not configured.",
      );
    }

    return {
      provider: "openai",
      content: `AI infrastructure is configured for ${input.schemaName}, but Phase 4 owns prompt and structured output implementation.`,
    };
  }
}

export const aiService: AIService = new OpenAIService();
