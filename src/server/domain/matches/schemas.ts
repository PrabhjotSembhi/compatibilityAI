import { z } from "zod";

import { jsonObjectSchema } from "@/server/domain/shared";

export const matchStatusSchema = z.enum([
  "PROPOSED",
  "VISIBLE",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
]);

export const createMatchSchema = z.object({
  relationshipContextId: z.string().min(1).optional(),
  actorUserId: z.string().min(1),
  candidateUserId: z.string().min(1),
  actorProfileId: z.string().min(1).optional(),
  candidateProfileId: z.string().min(1).optional(),
  status: matchStatusSchema.default("PROPOSED"),
  hardFilters: jsonObjectSchema.optional(),
  scoreBreakdown: jsonObjectSchema.optional(),
  finalScore: z.number().min(0).max(100).optional(),
  explanation: jsonObjectSchema.optional(),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;
