import { NextResponse } from "next/server";

import { toAppError } from "@/server/errors";
import { logger } from "@/server/logger";

export type ApiSuccess<TData> = {
  data: TData;
};

export type ApiFailure = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function ok<TData>(data: TData, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<TData>>({ data }, init);
}

export function fail(error: unknown) {
  const appError = toAppError(error);

  if (appError.status >= 500) {
    logger.error(appError.message, {
      code: appError.code,
      details: appError.details,
    });
  }

  return NextResponse.json<ApiFailure>(
    {
      error: {
        code: appError.code,
        message: appError.message,
        details: appError.details,
      },
    },
    { status: appError.status },
  );
}
