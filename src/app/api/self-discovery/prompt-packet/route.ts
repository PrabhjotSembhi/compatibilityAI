import type { NextRequest } from "next/server";

import { fail, ok } from "@/server/api";
import { createPromptPacketSchema } from "@/server/self-discovery/schemas";
import { selfDiscoveryService } from "@/server/self-discovery/service";
import { validateInput } from "@/server/validation";

export async function POST(request: NextRequest) {
  try {
    const input = validateInput(createPromptPacketSchema, await request.json());

    return ok(selfDiscoveryService.createPromptPacket(input));
  } catch (error) {
    return fail(error);
  }
}
