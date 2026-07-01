import type { NextRequest } from "next/server";

import { aiUsageListQuerySchema } from "@/server/ai/schemas";
import { aiInfrastructureService } from "@/server/ai/service";
import { fail, ok } from "@/server/api";
import { validateInput } from "@/server/validation";

export async function GET(request: NextRequest) {
  try {
    const input = validateInput(aiUsageListQuerySchema, {
      userId: request.nextUrl.searchParams.get("userId") ?? undefined,
      featureKey: request.nextUrl.searchParams.get("featureKey") ?? undefined,
      take: request.nextUrl.searchParams.get("take") ?? undefined,
    });

    return ok(await aiInfrastructureService.listUsage(input));
  } catch (error) {
    return fail(error);
  }
}
