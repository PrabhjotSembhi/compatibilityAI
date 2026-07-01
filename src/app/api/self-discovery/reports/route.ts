import type { NextRequest } from "next/server";

import { fail, ok } from "@/server/api";
import { saveSelfDiscoveryReportSchema } from "@/server/self-discovery/schemas";
import { selfDiscoveryService } from "@/server/self-discovery/service";
import { validateInput } from "@/server/validation";

export async function POST(request: NextRequest) {
  try {
    const input = validateInput(
      saveSelfDiscoveryReportSchema,
      await request.json(),
    );

    return ok(await selfDiscoveryService.saveReport(input), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
