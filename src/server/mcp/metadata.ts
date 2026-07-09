import { getEnv } from "@/config/env";

export function oauthAuthorizationServerMetadata() {
  const appUrl = getEnv().NEXT_PUBLIC_APP_URL;

  return {
    issuer: appUrl,
    authorization_endpoint: `${appUrl}/api/auth/mcp/authorize`,
    token_endpoint: `${appUrl}/api/auth/mcp/token`,
    jwks_uri: `${appUrl}/api/auth/jwks`,
    registration_endpoint: `${appUrl}/api/auth/mcp/register`,
    scopes_supported: [
      "openid",
      "profile",
      "email",
      "offline_access",
      "mcp:tools",
    ],
    response_types_supported: ["code"],
    response_modes_supported: ["query"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: [
      "client_secret_basic",
      "client_secret_post",
      "none",
    ],
    code_challenge_methods_supported: ["S256"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    claims_supported: [
      "sub",
      "iss",
      "aud",
      "exp",
      "iat",
      "email",
      "email_verified",
      "name",
    ],
  };
}

export function oauthProtectedResourceMetadata() {
  const appUrl = getEnv().NEXT_PUBLIC_APP_URL;

  return {
    resource: `${appUrl}/api/mcp`,
    authorization_servers: [appUrl],
    jwks_uri: `${appUrl}/api/auth/jwks`,
    scopes_supported: ["mcp:tools"],
    bearer_methods_supported: ["header"],
    resource_signing_alg_values_supported: ["RS256"],
  };
}

export function metadataHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
