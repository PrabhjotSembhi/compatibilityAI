import { z } from "zod";

import { jsonObjectSchema } from "@/server/domain/shared";

export const notificationChannelSchema = z.enum(["IN_APP", "PUSH"]);
export const notificationStatusSchema = z.enum(["UNREAD", "READ", "ARCHIVED"]);

export const createNotificationSchema = z.object({
  userId: z.string().min(1),
  channel: notificationChannelSchema.default("IN_APP"),
  status: notificationStatusSchema.default("UNREAD"),
  type: z.string().min(1).max(120),
  title: z.string().min(1).max(160),
  body: z.string().max(2000).optional(),
  data: jsonObjectSchema.optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
