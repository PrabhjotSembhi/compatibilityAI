import type { NextRequest } from "next/server";

import { fail, ok } from "@/server/api";
import { readListQuery } from "@/server/domain/shared";
import { createSubscriptionSchema } from "@/server/domain/subscriptions/schemas";
import { subscriptionService } from "@/server/domain/subscriptions/service";
import { validateInput } from "@/server/validation";

export async function GET(request: NextRequest) {
  try {
    return ok(
      await subscriptionService.list(
        readListQuery(request.nextUrl.searchParams),
      ),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = validateInput(createSubscriptionSchema, await request.json());

    return ok(await subscriptionService.create(input), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
