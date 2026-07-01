import { z } from "zod";

import { jsonObjectSchema } from "@/server/domain/shared";

export const createCompatibilityProfileSchema = z.object({
  userId: z.string().min(1),
  profileId: z.string().min(1).optional(),
  relationshipContextId: z.string().min(1).optional(),
  features: jsonObjectSchema.optional(),
  values: jsonObjectSchema.optional(),
  interests: jsonObjectSchema.optional(),
  dealBreakers: jsonObjectSchema.optional(),
  embedding: z.array(z.number()).default([]),
});

export type CreateCompatibilityProfileInput = z.infer<
  typeof createCompatibilityProfileSchema
>;
