import type { NextRequest } from "next/server";

import { fail, ok } from "@/server/api";
import { readListQuery } from "@/server/domain/shared";
import { createProfileSchema } from "@/server/domain/profiles/schemas";
import { profileService } from "@/server/domain/profiles/service";
import { validateInput } from "@/server/validation";

export async function GET(request: NextRequest) {
  try {
    return ok(
      await profileService.list(readListQuery(request.nextUrl.searchParams)),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = validateInput(createProfileSchema, await request.json());

    return ok(await profileService.create(input), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
