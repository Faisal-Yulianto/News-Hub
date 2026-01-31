import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function succesResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400, code?: string) {
  return NextResponse.json({ error: message, code }, { status });
}

export function handleApiEror(error: unknown) {
  console.error("Api Error:", error);
  if (error instanceof ApiError) {
    return errorResponse(error.message, error.statusCode, error.code);
  }
  if (error instanceof Error) {
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }
    return errorResponse(error.message, 400);
  }
  return errorResponse("internal server error", 500, "INTERNAL_ERROR");
}

export const MAX_COMMENT_DEPTH = 5
export const COMMENTS_PER_PAGE = 20
