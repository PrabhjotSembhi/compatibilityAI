import { fail, ok } from "@/server/api";
import { matchingService } from "@/server/matching/service";
import { recommendMatchesSchema } from "@/server/matching/schemas";
import { validateInput } from "@/server/validation";

export async function POST(request: Request) {
  try {
    const input = validateInput(recommendMatchesSchema, await request.json());

    return ok(await matchingService.recommendMatches(input));
  } catch (error) {
    return fail(error);
  }
}
