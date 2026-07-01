import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";

import { getEnv } from "@/config/env";
import { prisma } from "@/server/database/prisma";

const env = getEnv();

export const auth = betterAuth({
  appName: "Compatibility AI",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
});
