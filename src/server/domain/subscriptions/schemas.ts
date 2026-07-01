import { z } from "zod";

import { jsonObjectSchema } from "@/server/domain/shared";

export const subscriptionStatusSchema = z.enum([
  "FREE",
  "TRIALING",
  "ACTIVE",
  "PAST_DUE",
  "CANCELED",
]);

export const billingProviderSchema = z.enum(["INTERNAL", "STRIPE", "RAZORPAY"]);

export const createSubscriptionSchema = z.object({
  userId: z.string().min(1),
  status: subscriptionStatusSchema.default("FREE"),
  plan: z.string().min(1).max(80).default("free"),
  provider: billingProviderSchema.default("INTERNAL"),
  providerCustomerId: z.string().max(160).optional(),
  providerSubscriptionId: z.string().max(160).optional(),
  currentPeriodEnd: z.coerce.date().optional(),
  metadata: jsonObjectSchema.optional(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
