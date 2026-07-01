import { z } from "zod";

import { jsonObjectSchema } from "@/server/domain/shared";

export const createPersonalityProfileSchema = z.object({
  userId: z.string().min(1),
  profileId: z.string().min(1).optional(),
  dimensions: jsonObjectSchema.optional(),
  strengths: jsonObjectSchema.optional(),
  blindSpots: jsonObjectSchema.optional(),
  communicationStyle: z.string().max(120).optional(),
  conflictStyle: z.string().max(120).optional(),
  attachmentStyle: z.string().max(120).optional(),
  source: z.string().max(120).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export type CreatePersonalityProfileInput = z.infer<
  typeof createPersonalityProfileSchema
>;
