export type AppErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE";

const statusByCode: Record<AppErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: AppErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = statusByCode[code];
    this.details = details;
  }
}

export function toAppError(error: unknown) {
  if (error instanceof AppError) {
    return error;
  }

  if (isPrismaConnectionError(error)) {
    return new AppError(
      "SERVICE_UNAVAILABLE",
      "Database is unavailable. Check DATABASE_URL and whether the database is running.",
      readErrorDetails(error),
    );
  }

  if (isPrismaKnownError(error)) {
    return new AppError(
      "INTERNAL_ERROR",
      "Database request failed.",
      readErrorDetails(error),
    );
  }

  return new AppError("INTERNAL_ERROR", "Unexpected server error");
}

function isPrismaConnectionError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = "code" in error ? error.code : undefined;

  return code === "ECONNREFUSED" || code === "P1001";
}

function isPrismaKnownError(error: unknown) {
  return Boolean(
    error &&
    typeof error === "object" &&
    "clientVersion" in error &&
    "code" in error,
  );
}

function readErrorDetails(error: unknown) {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  return {
    name: "name" in error ? error.name : undefined,
    code: "code" in error ? error.code : undefined,
    message: "message" in error ? error.message : undefined,
    meta: "meta" in error ? error.meta : undefined,
  };
}
