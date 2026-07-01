import { z } from "zod";

import { jsonObjectSchema } from "@/server/domain/shared";

export const promptTemplateStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "ARCHIVED",
]);

export const createPromptTemplateSchema = z.object({
  key: z.string().min(2).max(120),
  name: z.string().min(1).max(160),
  description: z.string().max(800).optional(),
  status: promptTemplateStatusSchema.default("DRAFT"),
  defaultModel: z.string().max(120).optional(),
  defaultSchema: jsonObjectSchema.optional(),
  metadata: jsonObjectSchema.optional(),
});

export const createPromptVersionSchema = z.object({
  promptTemplateId: z.string().min(1),
  version: z.number().int().min(1),
  systemPrompt: z.string().min(1).max(8000),
  developerPrompt: z.string().max(8000).optional(),
  userPromptTemplate: z.string().min(1).max(8000),
  jsonSchema: jsonObjectSchema.optional(),
  model: z.string().max(120).optional(),
  isActive: z.boolean().default(false),
  changelog: z.string().max(2000).optional(),
});

export const structuredAiRequestSchema = z.object({
  featureKey: z.string().min(2).max(120),
  userId: z.string().min(1).optional(),
  promptTemplateKey: z.string().min(2).max(120),
  variables: jsonObjectSchema.default({}),
  schemaName: z.string().min(1).max(120),
  jsonSchema: jsonObjectSchema,
  model: z.string().max(120).optional(),
  metadata: jsonObjectSchema.optional(),
});

export const aiUsageListQuerySchema = z.object({
  userId: z.string().min(1).optional(),
  featureKey: z.string().min(1).optional(),
  take: z.coerce.number().int().min(1).max(100).default(50),
});

export type CreatePromptTemplateInput = z.infer<
  typeof createPromptTemplateSchema
>;
export type CreatePromptVersionInput = z.infer<
  typeof createPromptVersionSchema
>;
export type StructuredAiRequestInput = z.infer<
  typeof structuredAiRequestSchema
>;
export type AiUsageListQuery = z.infer<typeof aiUsageListQuerySchema>;
