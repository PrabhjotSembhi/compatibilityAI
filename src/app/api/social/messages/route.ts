import type { NextRequest } from "next/server";

import { fail, ok } from "@/server/api";
import { listMessagesSchema, sendMessageSchema } from "@/server/social/schemas";
import { socialService } from "@/server/social/service";
import { validateInput } from "@/server/validation";

export async function GET(request: NextRequest) {
  try {
    const input = validateInput(
      listMessagesSchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );

    return ok(await socialService.listMessages(input));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = validateInput(sendMessageSchema, await request.json());

    return ok(await socialService.sendMessage(input), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
