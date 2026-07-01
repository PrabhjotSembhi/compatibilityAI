import { fail, ok } from "@/server/api";
import { explainCompatibilitySchema } from "@/server/compatibility/schemas";
import { compatibilityService } from "@/server/compatibility/service";
import { validateInput } from "@/server/validation";

export async function POST(request: Request) {
  try {
    const input = validateInput(
      explainCompatibilitySchema,
      await request.json(),
    );

    return ok(await compatibilityService.explainWithAi(input));
  } catch (error) {
    return fail(error);
  }
}
