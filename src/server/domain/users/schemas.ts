import { z } from "zod";

export const userListQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(100).default(50),
});

export type UserListQuery = z.infer<typeof userListQuerySchema>;
