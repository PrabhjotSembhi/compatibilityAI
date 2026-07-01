import type { NextRequest } from "next/server";

import { fail, ok } from "@/server/api";
import { createMatchSchema } from "@/server/domain/matches/schemas";
import { matchService } from "@/server/domain/matches/service";
import { readListQuery } from "@/server/domain/shared";
import { validateInput } from "@/server/validation";

export async function GET(request: NextRequest) {
  try {
    return ok(
      await matchService.list(readListQuery(request.nextUrl.searchParams)),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = validateInput(createMatchSchema, await request.json());

    return ok(await matchService.create(input), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
