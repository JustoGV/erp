"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logger puede no estar disponible si el error es muy temprano,
    // así que usamos console.error como fallback seguro.
    // eslint-disable-next-line no-console
    console.error("[global-error]", error.message, error.digest);
  }, [error]);

  return (
    <html lang="es">
      <body className="bg-gray-50 flex items-center justify-center min-h-screen">
        <div className="rounded-lg border border-red-200 bg-white p-8 max-w-md text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 text-2xl font-bold">
            !
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Error crítico
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            La aplicación encontró un error inesperado. Por favor intentá
            recargar la página.
          </p>
          <button
            onClick={reset}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Recargar
          </button>
        </div>
      </body>
    </html>
  );
}
