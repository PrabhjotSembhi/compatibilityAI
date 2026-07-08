import type { NextRequest } from "next/server";

import { fail, ok } from "@/server/api";
import {
  createSafetyReportSchema,
  listSocialQuerySchema,
} from "@/server/social/schemas";
import { socialService } from "@/server/social/service";
import { validateInput } from "@/server/validation";

export async function GET(request: NextRequest) {
  try {
    const input = validateInput(
      listSocialQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );

    return ok(await socialService.listSafetyReports(input));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = validateInput(createSafetyReportSchema, await request.json());

    return ok(await socialService.createSafetyReport(input), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
