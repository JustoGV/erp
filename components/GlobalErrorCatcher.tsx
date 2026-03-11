"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

/**
 * Escucha errores globales no capturados:
 * - unhandledrejection (promesas sin catch)
 * - error (errores JS no atrapados)
 *
 * Los loguea para que podamos detectarlos antes de que el usuario reporte.
 */
export function GlobalErrorCatcher() {
  useEffect(() => {
    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      logger.error(`Promesa sin manejar: ${message}`, "global", {
        stack:
          reason instanceof Error ? reason.stack?.slice(0, 500) : undefined,
      });
    };

    const handleError = (e: ErrorEvent) => {
      logger.error(`Error global: ${e.message}`, "global", {
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
      });
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
      window.removeEventListener("error", handleError);
    };
  }, []);

  return null;
}
