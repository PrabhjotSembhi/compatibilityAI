import { z } from "zod";

import { jsonObjectSchema } from "@/server/domain/shared";

export const selfDiscoveryReportTypeSchema = z.enum([
  "personality_analysis",
  "dating_blueprint",
  "relationship_strengths",
  "blind_spots",
  "communication_style",
  "love_language",
  "attachment_style",
  "coaching_tools",
]);

export const createPromptPacketSchema = z.object({
  reportType: selfDiscoveryReportTypeSchema,
  userContext: z.string().min(20).max(20000),
});

export const selfDiscoveryReportOutputSchema = z.object({
  reportType: z.string().min(1),
  title: z.string().min(1).max(160),
  summary: z.string().min(1).max(3000),
  sections: z
    .array(
      z.object({
        heading: z.string().min(1).max(160),
        body: z.string().min(1).max(3000),
      }),
    )
    .min(1),
  insights: z.array(z.string().min(1).max(1000)).default([]),
  actionItems: z.array(z.string().min(1).max(1000)).default([]),
  profileUpdates: jsonObjectSchema.default({}),
  confidence: z.number().min(0).max(1),
});

export const saveSelfDiscoveryReportSchema = z.object({
  userId: z.string().min(1),
  profileId: z.string().min(1).optional(),
  relationshipContextId: z.string().min(1).optional(),
  reportType: selfDiscoveryReportTypeSchema,
  chatgptOutput: selfDiscoveryReportOutputSchema,
  shareable: z.boolean().default(true),
});

export type CreatePromptPacketInput = z.infer<typeof createPromptPacketSchema>;
export type SaveSelfDiscoveryReportInput = z.infer<
  typeof saveSelfDiscoveryReportSchema
>;
