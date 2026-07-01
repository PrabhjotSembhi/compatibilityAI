import type { NextRequest } from "next/server";

import { fail, ok } from "@/server/api";
import { createConversationSchema } from "@/server/domain/conversations/schemas";
import { conversationService } from "@/server/domain/conversations/service";
import { readListQuery } from "@/server/domain/shared";
import { validateInput } from "@/server/validation";

export async function GET(request: NextRequest) {
  try {
    return ok(
      await conversationService.list(
        readListQuery(request.nextUrl.searchParams),
      ),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = validateInput(createConversationSchema, await request.json());

    return ok(await conversationService.create(input), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
