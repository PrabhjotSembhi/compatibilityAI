import { z } from "zod";

import { jsonObjectSchema } from "@/server/domain/shared";

export const relationshipContextStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "ARCHIVED",
]);

export const createRelationshipContextSchema = z.object({
  slug: z.string().min(2).max(80),
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  status: relationshipContextStatusSchema.default("DRAFT"),
  profileSchema: jsonObjectSchema.optional(),
  scoringConfig: jsonObjectSchema.optional(),
  visibilityPolicy: jsonObjectSchema.optional(),
  consentPolicy: jsonObjectSchema.optional(),
  successMetrics: jsonObjectSchema.optional(),
});

export type CreateRelationshipContextInput = z.infer<
  typeof createRelationshipContextSchema
>;
