import { ok } from "@/server/api";
import { selfDiscoveryService } from "@/server/self-discovery/service";

export function GET() {
  return ok(selfDiscoveryService.listReportTypes());
}
