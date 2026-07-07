import { fail, ok } from "@/server/api";
import { createCompatibilityReportSchema } from "@/server/matching/schemas";
import { matchingService } from "@/server/matching/service";
import { validateInput } from "@/server/validation";

export async function POST(request: Request) {
  try {
    const input = validateInput(
      createCompatibilityReportSchema,
      await request.json(),
    );

    return ok(await matchingService.createCompatibilityReport(input), {
      status: 201,
    });
  } catch (error) {
    return fail(error);
  }
}
