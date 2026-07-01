import type { NextRequest } from "next/server";

import { fail, ok } from "@/server/api";
import { readListQuery } from "@/server/domain/shared";
import { relationshipContextService } from "@/server/domain/relationship-contexts/service";
import { createRelationshipContextSchema } from "@/server/domain/relationship-contexts/schemas";
import { validateInput } from "@/server/validation";

export async function GET(request: NextRequest) {
  try {
    return ok(
      await relationshipContextService.list(
        readListQuery(request.nextUrl.searchParams),
      ),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = validateInput(
      createRelationshipContextSchema,
      await request.json(),
    );

    return ok(await relationshipContextService.create(input), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
