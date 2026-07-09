import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import { jwt, mcp } from "better-auth/plugins";

import { getEnv } from "@/config/env";
import { prisma } from "@/server/database/prisma";

const env = getEnv();
const appUrl = env.NEXT_PUBLIC_APP_URL;

export const auth = betterAuth({
  appName: "Compatibility AI",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    jwt({
      jwks: {
        jwksPath: "/jwks",
        keyPairConfig: {
          alg: "RS256",
          modulusLength: 2048,
        },
      },
      jwt: {
        issuer: appUrl,
      },
    }),
    mcp({
      loginPage: "/auth/login",
      resource: `${appUrl}/api/mcp`,
      oidcConfig: {
        loginPage: "/auth/login",
        consentPage: "/auth/consent",
        requirePKCE: true,
        allowDynamicClientRegistration: true,
        defaultScope: "openid profile email offline_access mcp:tools",
        scopes: ["mcp:tools"],
        metadata: {
          issuer: appUrl,
          authorization_endpoint: `${appUrl}/api/auth/mcp/authorize`,
          token_endpoint: `${appUrl}/api/auth/mcp/token`,
          jwks_uri: `${appUrl}/api/auth/jwks`,
          registration_endpoint: `${appUrl}/api/auth/mcp/register`,
          code_challenge_methods_supported: ["S256"],
          token_endpoint_auth_methods_supported: [
            "client_secret_basic",
            "client_secret_post",
            "none",
          ],
        },
      },
    }),
  ],
});
