import { z } from "zod";

import {
  compatibilityScoringConfigSchema,
  scoringWeightsSchema,
} from "@/server/compatibility/schemas";

const baseMatchingRequestSchema = z.object({
  actorUserId: z.string().min(1),
  actorProfileId: z.string().min(1).optional(),
  relationshipContextId: z.string().min(1).optional(),
  candidateUserIds: z.array(z.string().min(1)).max(500).optional(),
  candidateProfileIds: z.array(z.string().min(1)).max(500).optional(),
  limit: z.number().int().min(1).max(100).default(25),
  includeLimitedProfiles: z.boolean().default(false),
  minimumFinalScore: z.number().min(0).max(100).default(0),
  weights: scoringWeightsSchema.optional(),
});

export const filterCandidatesSchema = baseMatchingRequestSchema;

export const recommendMatchesSchema = baseMatchingRequestSchema.extend({
  persistMatches: z.boolean().default(true),
});

export const createCompatibilityReportSchema = z.object({
  actorUserId: z.string().min(1),
  actorProfileId: z.string().min(1).optional(),
  candidateUserId: z.string().min(1).optional(),
  candidateProfileId: z.string().min(1).optional(),
  relationshipContextId: z.string().min(1).optional(),
  includeLimitedProfiles: z.boolean().default(true),
  includeAiExplanation: z.boolean().default(false),
  promptTemplateKey: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  config: compatibilityScoringConfigSchema.optional(),
});

export type FilterCandidatesInput = z.infer<typeof filterCandidatesSchema>;
export type RecommendMatchesInput = z.infer<typeof recommendMatchesSchema>;
export type CreateCompatibilityReportInput = z.infer<
  typeof createCompatibilityReportSchema
>;
