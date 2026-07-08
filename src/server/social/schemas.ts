import { z } from "zod";

import { jsonObjectSchema } from "@/server/domain/shared";

export const socialLikeStatusSchema = z.enum(["ACTIVE", "WITHDRAWN"]);
export const safetyReportStatusSchema = z.enum([
  "OPEN",
  "REVIEWING",
  "RESOLVED",
  "DISMISSED",
]);

export const listSocialQuerySchema = z.object({
  userId: z.string().min(1).optional(),
  relationshipContextId: z.string().min(1).optional(),
  status: z.string().min(1).optional(),
  take: z.coerce.number().int().min(1).max(100).default(50),
});

export const createLikeSchema = z.object({
  actorUserId: z.string().min(1),
  targetUserId: z.string().min(1),
  relationshipContextId: z.string().min(1).optional(),
  matchId: z.string().min(1).optional(),
  metadata: jsonObjectSchema.optional(),
});

export const withdrawLikeSchema = z.object({
  actorUserId: z.string().min(1),
  targetUserId: z.string().min(1),
  relationshipContextId: z.string().min(1).optional(),
});

export const sendMessageSchema = z.object({
  senderUserId: z.string().min(1),
  recipientUserId: z.string().min(1),
  conversationId: z.string().min(1).optional(),
  profileId: z.string().min(1).optional(),
  relationshipContextId: z.string().min(1).optional(),
  matchId: z.string().min(1).optional(),
  content: z.string().min(1).max(4000),
  metadata: jsonObjectSchema.optional(),
});

export const listMessagesSchema = z.object({
  userId: z.string().min(1),
  conversationId: z.string().min(1).optional(),
  relationshipContextId: z.string().min(1).optional(),
  take: z.coerce.number().int().min(1).max(100).default(50),
});

export const conversationStartersSchema = z.object({
  userId: z.string().min(1),
  matchId: z.string().min(1).optional(),
  relationshipContextId: z.string().min(1).optional(),
  context: jsonObjectSchema.optional(),
  count: z.number().int().min(1).max(10).default(5),
});

export const createSafetyReportSchema = z.object({
  reporterUserId: z.string().min(1),
  subjectUserId: z.string().min(1).optional(),
  relationshipContextId: z.string().min(1).optional(),
  matchId: z.string().min(1).optional(),
  conversationId: z.string().min(1).optional(),
  reason: z.string().min(1).max(120),
  details: z.string().max(4000).optional(),
  evidence: jsonObjectSchema.optional(),
});

export type ListSocialQuery = z.infer<typeof listSocialQuerySchema>;
export type CreateLikeInput = z.infer<typeof createLikeSchema>;
export type WithdrawLikeInput = z.infer<typeof withdrawLikeSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ListMessagesInput = z.infer<typeof listMessagesSchema>;
export type ConversationStartersInput = z.infer<
  typeof conversationStartersSchema
>;
export type CreateSafetyReportInput = z.infer<typeof createSafetyReportSchema>;
