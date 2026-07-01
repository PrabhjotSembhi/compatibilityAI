import type { NextRequest } from "next/server";

import { fail, ok } from "@/server/api";
import { readListQuery } from "@/server/domain/shared";
import { createUserSettingsSchema } from "@/server/domain/settings/schemas";
import { userSettingsService } from "@/server/domain/settings/service";
import { validateInput } from "@/server/validation";

export async function GET(request: NextRequest) {
  try {
    return ok(
      await userSettingsService.list(
        readListQuery(request.nextUrl.searchParams),
      ),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = validateInput(createUserSettingsSchema, await request.json());

    return ok(await userSettingsService.create(input), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
