import type { NextRequest } from "next/server";

import {
  aiUsageListQuerySchema,
  createPromptTemplateSchema,
  createPromptVersionSchema,
} from "@/server/ai/schemas";
import { aiInfrastructureService } from "@/server/ai/service";
import { fail, ok } from "@/server/api";
import { validateInput } from "@/server/validation";

export async function GET(request: NextRequest) {
  try {
    const input = validateInput(aiUsageListQuerySchema.pick({ take: true }), {
      take: request.nextUrl.searchParams.get("take") ?? undefined,
    });

    return ok(await aiInfrastructureService.listPromptTemplates(input.take));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const parsed = body as { kind?: string; data?: unknown };

    if (parsed.kind === "version") {
      const input = validateInput(createPromptVersionSchema, parsed.data);
      return ok(await aiInfrastructureService.createPromptVersion(input), {
        status: 201,
      });
    }

    const input = validateInput(
      createPromptTemplateSchema,
      parsed.data ?? body,
    );
    return ok(await aiInfrastructureService.createPromptTemplate(input), {
      status: 201,
    });
  } catch (error) {
    return fail(error);
  }
}
