import type { NextRequest } from "next/server";

import { fail, ok } from "@/server/api";
import { readListQuery } from "@/server/domain/shared";
import { createReportSchema } from "@/server/domain/reports/schemas";
import { reportService } from "@/server/domain/reports/service";
import { validateInput } from "@/server/validation";

export async function GET(request: NextRequest) {
  try {
    return ok(
      await reportService.list(readListQuery(request.nextUrl.searchParams)),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = validateInput(createReportSchema, await request.json());

    return ok(await reportService.create(input), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
