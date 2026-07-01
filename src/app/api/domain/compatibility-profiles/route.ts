import type { NextRequest } from "next/server";

import { fail, ok } from "@/server/api";
import { readListQuery } from "@/server/domain/shared";
import { compatibilityProfileService } from "@/server/domain/compatibility-profiles/service";
import { createCompatibilityProfileSchema } from "@/server/domain/compatibility-profiles/schemas";
import { validateInput } from "@/server/validation";

export async function GET(request: NextRequest) {
  try {
    return ok(
      await compatibilityProfileService.list(
        readListQuery(request.nextUrl.searchParams),
      ),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = validateInput(
      createCompatibilityProfileSchema,
      await request.json(),
    );

    return ok(await compatibilityProfileService.create(input), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
