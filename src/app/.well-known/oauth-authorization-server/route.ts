import {
  metadataHeaders,
  oauthAuthorizationServerMetadata,
} from "@/server/mcp/metadata";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(oauthAuthorizationServerMetadata(), {
    headers: metadataHeaders(),
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: metadataHeaders(),
  });
}
