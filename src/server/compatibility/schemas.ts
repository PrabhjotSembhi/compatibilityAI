import { z } from "zod";

import { jsonObjectSchema } from "@/server/domain/shared";

export const compatibilityDimensionSchema = z.enum([
  "lifestyle",
  "personality",
  "interests",
  "values",
  "vector",
]);

export const scoringWeightsSchema = z
  .object({
    lifestyle: z.number().min(0).max(100).default(20),
    personality: z.number().min(0).max(100).default(20),
    interests: z.number().min(0).max(100).default(15),
    values: z.number().min(0).max(100).default(25),
    vector: z.number().min(0).max(100).default(20),
  })
  .default({
    lifestyle: 20,
    personality: 20,
    interests: 15,
    values: 25,
    vector: 20,
  });

export const compatibilityScoringConfigSchema = z
  .object({
    weights: scoringWeightsSchema,
    minimumFinalScore: z.number().min(0).max(100).default(0),
    includeLimitedProfiles: z.boolean().default(false),
    persistMatches: z.boolean().default(false),
  })
  .default({
    weights: {
      lifestyle: 20,
      personality: 20,
      interests: 15,
      values: 25,
      vector: 20,
    },
    minimumFinalScore: 0,
    includeLimitedProfiles: false,
    persistMatches: false,
  });

export const evaluateCompatibilitySchema = z.object({
  actorUserId: z.string().min(1),
  actorProfileId: z.string().min(1).optional(),
  relationshipContextId: z.string().min(1).optional(),
  candidateUserIds: z.array(z.string().min(1)).max(500).optional(),
  candidateProfileIds: z.array(z.string().min(1)).max(500).optional(),
  limit: z.number().int().min(1).max(100).default(25),
  config: compatibilityScoringConfigSchema.optional(),
});

export const explainCompatibilitySchema = z.object({
  actorUserId: z.string().min(1).optional(),
  promptTemplateKey: z.string().min(1).default("compatibility.explanation.v1"),
  model: z.string().min(1).optional(),
  evaluation: jsonObjectSchema,
});

export type CompatibilityScoringConfig = z.infer<
  typeof compatibilityScoringConfigSchema
>;
export type EvaluateCompatibilityInput = z.infer<
  typeof evaluateCompatibilitySchema
>;
export type ExplainCompatibilityInput = z.infer<
  typeof explainCompatibilitySchema
>;
