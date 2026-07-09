import { AppError } from "@/server/errors";

export type JsonRpcId = string | number | null;

export type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: JsonRpcId;
  method: string;
  params?: unknown;
};

export type JsonRpcSuccess = {
  jsonrpc: "2.0";
  id: JsonRpcId;
  result: unknown;
};

export type JsonRpcFailure = {
  jsonrpc: "2.0";
  id: JsonRpcId;
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
};

export function success(id: JsonRpcId, result: unknown): JsonRpcSuccess {
  return {
    jsonrpc: "2.0",
    id,
    result,
  };
}

export function failure(
  id: JsonRpcId,
  code: number,
  message: string,
  data?: unknown,
): JsonRpcFailure {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      data,
    },
  };
}

export function errorToRpc(id: JsonRpcId, error: unknown) {
  if (error instanceof AppError) {
    return failure(id, appErrorToRpcCode(error.code), error.message, {
      code: error.code,
      details: error.details,
    });
  }

  if (error instanceof Error) {
    return failure(id, -32603, "Internal error", {
      message: error.message,
    });
  }

  return failure(id, -32603, "Internal error");
}

function appErrorToRpcCode(code: AppError["code"]) {
  switch (code) {
    case "BAD_REQUEST":
    case "VALIDATION_ERROR":
      return -32602;
    case "UNAUTHORIZED":
      return -32001;
    case "FORBIDDEN":
      return -32003;
    case "NOT_FOUND":
      return -32004;
    case "RATE_LIMITED":
      return -32029;
    default:
      return -32603;
  }
}
