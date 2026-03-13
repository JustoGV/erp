"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error(`Error de ruta dashboard: ${error.message}`, {
      context: "route",
      digest: error.digest,
      stack: error.stack?.slice(0, 500),
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 text-xl font-bold">
          !
        </div>
        <h2 className="text-lg font-semibold text-red-800 mb-2">
          Algo salió mal
        </h2>
        <p className="text-sm text-red-600 mb-4">
          Ocurrió un error inesperado. Podés intentar de nuevo o volver al
          inicio.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="mb-4 max-h-32 overflow-auto rounded bg-red-100 p-2 text-xs text-left text-red-700">
            {error.message}
          </pre>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Reintentar
          </button>
          <a
            href="/dashboard"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Ir al Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
