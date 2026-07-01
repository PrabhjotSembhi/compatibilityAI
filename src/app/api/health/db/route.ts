import { fail, ok } from "@/server/api";
import { AppError } from "@/server/errors";
import { prisma } from "@/server/database/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return ok({
      database: "ok",
      provider: "postgresql",
    });
  } catch (error) {
    return fail(
      new AppError("SERVICE_UNAVAILABLE", "Database health check failed.", {
        cause: error instanceof Error ? error.message : "Unknown error",
      }),
    );
  }
}
