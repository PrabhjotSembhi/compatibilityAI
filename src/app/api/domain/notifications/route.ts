import type { NextRequest } from "next/server";

import { fail, ok } from "@/server/api";
import { createNotificationSchema } from "@/server/domain/notifications/schemas";
import { notificationDomainService } from "@/server/domain/notifications/service";
import { readListQuery } from "@/server/domain/shared";
import { validateInput } from "@/server/validation";

export async function GET(request: NextRequest) {
  try {
    return ok(
      await notificationDomainService.list(
        readListQuery(request.nextUrl.searchParams),
      ),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = validateInput(createNotificationSchema, await request.json());

    return ok(await notificationDomainService.create(input), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
