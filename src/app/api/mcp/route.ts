import { auth } from "@/server/auth/auth";
import { AppError } from "@/server/errors";
import { getEnv } from "@/config/env";
import {
  errorToRpc,
  failure,
  type JsonRpcRequest,
  success,
} from "@/server/mcp/json-rpc";
import type { McpSession } from "@/server/mcp/context";
import { callTool, listTools } from "@/server/mcp/tools";

const protocolVersion = "2025-06-18";
const requiredScope = "mcp:tools";
const appUrl = getEnv().NEXT_PUBLIC_APP_URL;
const resourceMetadataUrl = `${appUrl}/.well-known/oauth-protected-resource/api/mcp`;

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function GET(request: Request) {
  const authResponse = await authenticate(request);

  if (authResponse instanceof Response) {
    return authResponse;
  }

  return Response.json(
    {
      name: "compatibility-ai",
      transport: "streamable-http",
      protocolVersion,
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    },
    { headers: corsHeaders() },
  );
}

export async function POST(request: Request) {
  const session = await authenticate(request);

  if (session instanceof Response) {
    return session;
  }

  if (!hasRequiredScope(session.scopes)) {
    return Response.json(failure(null, -32003, "Missing required scope."), {
      status: 403,
      headers: corsHeaders(),
    });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json(failure(null, -32700, "Parse error"), {
      status: 400,
      headers: corsHeaders(),
    });
  }

  if (Array.isArray(payload)) {
    const responses = (
      await Promise.all(payload.map((item) => handleRequest(item, session)))
    ).filter(Boolean);

    return Response.json(responses, { headers: corsHeaders() });
  }

  const response = await handleRequest(payload, session);

  if (!response) {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  return Response.json(response, { headers: corsHeaders() });
}

async function handleRequest(payload: unknown, session: McpSession) {
  const request = parseRequest(payload);
  const id = request?.id ?? null;

  if (!request) {
    return failure(null, -32600, "Invalid Request");
  }

  if (request.id === undefined) {
    await dispatch(request, session);
    return null;
  }

  try {
    return success(id, await dispatch(request, session));
  } catch (error) {
    return errorToRpc(id, error);
  }
}

async function dispatch(request: JsonRpcRequest, session: McpSession) {
  switch (request.method) {
    case "initialize":
      return {
        protocolVersion,
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
        serverInfo: {
          name: "compatibility-ai",
          version: "0.1.0",
        },
      };
    case "ping":
      return {};
    case "tools/list":
      return listTools();
    case "tools/call":
      return callTool(request.params, session);
    case "resources/list":
      return { resources: [] };
    case "prompts/list":
      return { prompts: [] };
    case "notifications/initialized":
      return {};
    default:
      throw new AppError("NOT_FOUND", `Unknown MCP method: ${request.method}`);
  }
}

function parseRequest(payload: unknown): JsonRpcRequest | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as Partial<JsonRpcRequest>;

  if (candidate.jsonrpc !== "2.0" || typeof candidate.method !== "string") {
    return null;
  }

  return candidate as JsonRpcRequest;
}

function hasRequiredScope(scopes: string | undefined) {
  return scopes?.split(" ").includes(requiredScope) ?? false;
}

async function authenticate(request: Request) {
  const session = await auth.api.getMcpSession({
    request,
    headers: request.headers,
    asResponse: false,
  });

  if (session) {
    return session;
  }

  const challenge = `Bearer resource_metadata="${resourceMetadataUrl}", scope="${requiredScope}"`;

  return Response.json(
    {
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Unauthorized: Authentication required",
        "www-authenticate": challenge,
      },
      id: null,
    },
    {
      status: 401,
      headers: {
        ...corsHeaders(),
        "WWW-Authenticate": challenge,
      },
    },
  );
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Mcp-Session-Id, MCP-Protocol-Version",
    "Access-Control-Expose-Headers": "WWW-Authenticate, Mcp-Session-Id",
  };
}
