import { z } from "zod";

import { jsonObjectSchema } from "@/server/domain/shared";

export const conversationStatusSchema = z.enum(["ACTIVE", "ARCHIVED"]);

export const createConversationSchema = z.object({
  userId: z.string().min(1),
  profileId: z.string().min(1).optional(),
  relationshipContextId: z.string().min(1).optional(),
  topic: z.string().max(160).optional(),
  status: conversationStatusSchema.default("ACTIVE"),
  metadata: jsonObjectSchema.optional(),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
