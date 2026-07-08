import type { NextRequest } from "next/server";

import { fail, ok } from "@/server/api";
import { listSocialQuerySchema } from "@/server/social/schemas";
import { socialService } from "@/server/social/service";
import { validateInput } from "@/server/validation";

export async function GET(request: NextRequest) {
  try {
    const input = validateInput(
      listSocialQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );

    return ok(await socialService.listNotifications(input));
  } catch (error) {
    return fail(error);
  }
}
