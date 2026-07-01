import type { NextRequest } from "next/server";

import { fail, ok } from "@/server/api";
import { readListQuery } from "@/server/domain/shared";
import { createPersonalityProfileSchema } from "@/server/domain/personality-profiles/schemas";
import { personalityProfileService } from "@/server/domain/personality-profiles/service";
import { validateInput } from "@/server/validation";

export async function GET(request: NextRequest) {
  try {
    return ok(
      await personalityProfileService.list(
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
      createPersonalityProfileSchema,
      await request.json(),
    );

    return ok(await personalityProfileService.create(input), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
