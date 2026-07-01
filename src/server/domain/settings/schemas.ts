import { z } from "zod";

import { jsonObjectSchema } from "@/server/domain/shared";

export const createUserSettingsSchema = z.object({
  userId: z.string().min(1),
  locale: z.string().max(40).optional(),
  timezone: z.string().max(80).optional(),
  privacy: jsonObjectSchema.optional(),
  notifications: jsonObjectSchema.optional(),
  product: jsonObjectSchema.optional(),
});

export type CreateUserSettingsInput = z.infer<typeof createUserSettingsSchema>;
