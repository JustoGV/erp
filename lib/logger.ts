/**
 * Sistema de logging estructurado para el ERP.
 *
 * En desarrollo  → imprime en consola con colores.
 * En producción → envía errores críticos al endpoint /api/v1/logs (si existe)
 *                  y silencia debug/info para no ensuciar la consola del usuario.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string; // ej: "api", "auth", "render", "form"
  data?: unknown;
  timestamp: string;
  url?: string;
  userId?: string;
}

const IS_DEV = process.env.NODE_ENV === "development";

// Cola para batching de logs en producción
let logQueue: LogEntry[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function buildEntry(
  level: LogLevel,
  message: string,
  context?: string,
  data?: unknown,
): LogEntry {
  let userId: string | undefined;
  try {
    const raw = localStorage.getItem("erp_user");
    if (raw) userId = JSON.parse(raw)?.id;
  } catch {
    /* SSR o sin acceso */
  }

  return {
    level,
    message,
    context,
    data: sanitize(data),
    timestamp: new Date().toISOString(),
    url: typeof window !== "undefined" ? window.location.pathname : undefined,
    userId,
  };
}

/** Elimina tokens / contraseñas antes de loguear */
function sanitize(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  const obj = data as Record<string, unknown>;
  const cleaned: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (/password|token|secret|authorization/i.test(key)) {
      cleaned[key] = "[REDACTED]";
    } else {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

function printDev(entry: LogEntry) {
  const tag = `[${entry.context ?? "app"}]`;
  const style = {
    debug: "color: #888",
    info: "color: #2563eb",
    warn: "color: #d97706",
    error: "color: #dc2626; font-weight: bold",
  }[entry.level];

  // eslint-disable-next-line no-console
  console[entry.level](`%c${tag} ${entry.message}`, style, entry.data ?? "");
}

function enqueue(entry: LogEntry) {
  logQueue.push(entry);
  if (!flushTimer) {
    flushTimer = setTimeout(flushLogs, 5000);
  }
}

async function flushLogs() {
  flushTimer = null;
  if (logQueue.length === 0) return;

  const batch = logQueue.splice(0);

  try {
    const BASE_URL =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
    await fetch(`${BASE_URL}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logs: batch }),
    }).catch(() => {
      /* endpoint puede no existir aún — silenciar */
    });
  } catch {
    /* noop — no romper la app por logging */
  }
}

/**
 * Acepta dos formas:
 *   log("error", "msg", "ctx", data)          — forma clásica
 *   log("error", "msg", { requestId, ... })    — forma objeto
 */
function log(
  level: LogLevel,
  message: string,
  ctxOrData?: string | Record<string, unknown>,
  data?: unknown,
) {
  let context: string | undefined;
  let extra: unknown;

  if (typeof ctxOrData === "string") {
    context = ctxOrData;
    extra = data;
  } else if (ctxOrData && typeof ctxOrData === "object") {
    context = (ctxOrData as Record<string, unknown>).context as
      | string
      | undefined;
    extra = ctxOrData;
  }

  const entry = buildEntry(level, message, context, extra);

  if (IS_DEV) {
    printDev(entry);
    return;
  }

  // En producción solo warn/error se envían
  if (level === "warn" || level === "error") {
    enqueue(entry);
  }
}

export const logger = {
  debug: (
    msg: string,
    ctxOrData?: string | Record<string, unknown>,
    data?: unknown,
  ) => log("debug", msg, ctxOrData, data),
  info: (
    msg: string,
    ctxOrData?: string | Record<string, unknown>,
    data?: unknown,
  ) => log("info", msg, ctxOrData, data),
  warn: (
    msg: string,
    ctxOrData?: string | Record<string, unknown>,
    data?: unknown,
  ) => log("warn", msg, ctxOrData, data),
  error: (
    msg: string,
    ctxOrData?: string | Record<string, unknown>,
    data?: unknown,
  ) => log("error", msg, ctxOrData, data),
};
