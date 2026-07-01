import { z } from "zod";

import { AppError } from "@/server/errors";

export function validateInput<TSchema extends z.ZodType>(
  schema: TSchema,
  input: unknown,
): z.infer<TSchema> {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new AppError(
      "VALIDATION_ERROR",
      "The request payload is invalid.",
      z.flattenError(result.error),
    );
  }

  return result.data;
}
