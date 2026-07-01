import type { NextRequest } from "next/server";

import { fail, ok } from "@/server/api";
import { userListQuerySchema } from "@/server/domain/users/schemas";
import { userService } from "@/server/domain/users/service";
import { validateInput } from "@/server/validation";

export async function GET(request: NextRequest) {
  try {
    const input = validateInput(userListQuerySchema, {
      take: request.nextUrl.searchParams.get("take") ?? undefined,
    });

    return ok(await userService.list(input));
  } catch (error) {
    return fail(error);
  }
}
