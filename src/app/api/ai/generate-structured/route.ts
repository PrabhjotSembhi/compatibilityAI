import type { NextRequest } from "next/server";

import { structuredAiRequestSchema } from "@/server/ai/schemas";
import { aiInfrastructureService } from "@/server/ai/service";
import { fail, ok } from "@/server/api";
import { validateInput } from "@/server/validation";

export async function POST(request: NextRequest) {
  try {
    const input = validateInput(
      structuredAiRequestSchema,
      await request.json(),
    );

    return ok(await aiInfrastructureService.generateStructured(input));
  } catch (error) {
    return fail(error);
  }
}
