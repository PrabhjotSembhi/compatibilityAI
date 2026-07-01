import type { Prisma } from "@/generated/prisma/client";

export type JsonObject = Prisma.InputJsonObject;

export type StructuredAiRequest = {
  featureKey: string;
  userId?: string;
  promptTemplateKey: string;
  variables: JsonObject;
  schemaName: string;
  jsonSchema: JsonObject;
  model?: string;
  metadata?: JsonObject;
};

export type StructuredAiResult = {
  provider: "openai";
  model: string;
  output: unknown;
  rawText?: string;
  requestId?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  latencyMs: number;
};

export type PromptRenderInput = {
  systemPrompt: string;
  developerPrompt?: string | null;
  userPromptTemplate: string;
  variables: JsonObject;
};

export type RenderedPrompt = {
  systemPrompt: string;
  developerPrompt?: string;
  userPrompt: string;
};
