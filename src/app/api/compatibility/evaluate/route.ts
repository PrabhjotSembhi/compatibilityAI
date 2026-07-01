import { fail, ok } from "@/server/api";
import { evaluateCompatibilitySchema } from "@/server/compatibility/schemas";
import { compatibilityService } from "@/server/compatibility/service";
import { validateInput } from "@/server/validation";

export async function POST(request: Request) {
  try {
    const input = validateInput(
      evaluateCompatibilitySchema,
      await request.json(),
    );

    return ok(await compatibilityService.evaluate(input));
  } catch (error) {
    return fail(error);
  }
}
