import { fail, ok } from "@/server/api";
import { matchingService } from "@/server/matching/service";
import { filterCandidatesSchema } from "@/server/matching/schemas";
import { validateInput } from "@/server/validation";

export async function POST(request: Request) {
  try {
    const input = validateInput(filterCandidatesSchema, await request.json());

    return ok(await matchingService.filterCandidates(input));
  } catch (error) {
    return fail(error);
  }
}
