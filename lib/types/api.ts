/* ── Tipos de error del backend ─────────────────────────── */

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE_ENTITY"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL_SERVER_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "ERROR";

export interface ApiErrorBody {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: { message: string }[];
    field?: string;
  };
  statusCode: number;
  requestId: string;
  path: string;
  timestamp: string;
}

/**
 * Resultado normalizado de parseApiError().
 * Siempre tiene valores seguros (nunca undefined para code/message).
 */
export interface ParsedApiError {
  code: ErrorCode;
  message: string;
  details: string[];
  field?: string;
  statusCode: number;
  requestId: string;
  isNetwork: boolean;
}

/* ── Parser ────────────────────────────────────────────── */

import { AxiosError } from "axios";

/**
 * Convierte un error arbitrario (normalmente AxiosError) en
 * una estructura uniforme ParsedApiError.
 */
export function parseApiError(err: unknown): ParsedApiError {
  if (err instanceof AxiosError && err.response) {
    const body = err.response.data as Partial<ApiErrorBody> | undefined;
    const requestId =
      body?.requestId ??
      (err.response.headers?.["x-request-id"] as string) ??
      "";

    if (body?.error) {
      return {
        code: body.error.code ?? "ERROR",
        message: body.error.message ?? err.message,
        details: body.error.details?.map((d) => d.message) ?? [],
        field: body.error.field,
        statusCode: body.statusCode ?? err.response.status,
        requestId,
        isNetwork: false,
      };
    }

    // Respuesta sin formato estándar (ej: proxy, nginx)
    return {
      code: "ERROR",
      message:
        (body as Record<string, unknown>)?.message?.toString() ?? err.message,
      details: [],
      statusCode: err.response.status,
      requestId,
      isNetwork: false,
    };
  }

  if (err instanceof AxiosError && !err.response) {
    // Error de red / timeout
    return {
      code: "ERROR",
      message: err.message,
      details: [],
      statusCode: 0,
      requestId: "",
      isNetwork: true,
    };
  }

  // Error genérico
  return {
    code: "ERROR",
    message: err instanceof Error ? err.message : String(err),
    details: [],
    statusCode: 0,
    requestId: "",
    isNetwork: false,
  };
}
