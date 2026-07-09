import {
  metadataHeaders,
  oauthProtectedResourceMetadata,
} from "@/server/mcp/metadata";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(oauthProtectedResourceMetadata(), {
    headers: metadataHeaders(),
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: metadataHeaders(),
  });
}
