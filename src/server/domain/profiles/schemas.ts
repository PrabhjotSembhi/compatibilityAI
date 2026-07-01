import { z } from "zod";

import { jsonObjectSchema } from "@/server/domain/shared";

export const profileVisibilitySchema = z.enum([
  "PRIVATE",
  "LIMITED",
  "DISCOVERABLE",
]);

export const profileStatusSchema = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]);

export const createProfileSchema = z.object({
  userId: z.string().min(1),
  relationshipContextId: z.string().min(1).optional(),
  displayName: z.string().max(120).optional(),
  bio: z.string().max(2000).optional(),
  locale: z.string().max(40).optional(),
  city: z.string().max(120).optional(),
  country: z.string().max(120).optional(),
  languages: z.array(z.string().min(1).max(80)).default([]),
  visibility: profileVisibilitySchema.default("PRIVATE"),
  status: profileStatusSchema.default("DRAFT"),
  attributes: jsonObjectSchema.optional(),
  preferences: jsonObjectSchema.optional(),
  constraints: jsonObjectSchema.optional(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
