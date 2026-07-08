import { fail, ok } from "@/server/api";
import { conversationStartersSchema } from "@/server/social/schemas";
import { socialService } from "@/server/social/service";
import { validateInput } from "@/server/validation";

export async function POST(request: Request) {
  try {
    const input = validateInput(
      conversationStartersSchema,
      await request.json(),
    );

    return ok(await socialService.createConversationStarters(input));
  } catch (error) {
    return fail(error);
  }
}
