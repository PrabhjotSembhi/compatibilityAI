import { ok } from "@/server/api";

export function GET() {
  return ok({
    service: "compatibility-ai",
    status: "ok",
    phase: "core-infrastructure",
  });
}
