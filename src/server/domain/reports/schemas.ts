import { z } from "zod";

import { jsonObjectSchema } from "@/server/domain/shared";

export const reportStatusSchema = z.enum([
  "DRAFT",
  "GENERATING",
  "READY",
  "FAILED",
  "ARCHIVED",
]);

export const createReportSchema = z.object({
  userId: z.string().min(1),
  profileId: z.string().min(1).optional(),
  relationshipContextId: z.string().min(1).optional(),
  type: z.string().min(1).max(120),
  title: z.string().min(1).max(160),
  status: reportStatusSchema.default("DRAFT"),
  summary: z.string().max(2000).optional(),
  payload: jsonObjectSchema.optional(),
  shareable: z.boolean().default(false),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
