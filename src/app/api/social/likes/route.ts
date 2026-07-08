import type { NextRequest } from "next/server";

import { fail, ok } from "@/server/api";
import {
  createLikeSchema,
  listSocialQuerySchema,
  withdrawLikeSchema,
} from "@/server/social/schemas";
import { socialService } from "@/server/social/service";
import { validateInput } from "@/server/validation";

export async function GET(request: NextRequest) {
  try {
    const input = validateInput(
      listSocialQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );

    return ok(await socialService.listLikes(input));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = validateInput(createLikeSchema, await request.json());

    return ok(await socialService.like(input), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const input = validateInput(withdrawLikeSchema, await request.json());

    return ok(await socialService.withdrawLike(input));
  } catch (error) {
    return fail(error);
  }
}
