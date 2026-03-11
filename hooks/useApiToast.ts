import { AxiosError } from "axios";
import { useToast } from "@/contexts/ToastContext";
import { useCallback } from "react";

/**
 * Hook utilitario que traduce errores de la API a toasts amigables.
 *
 * Uso:
 *   const { handleError, handleSuccess } = useApiToast();
 *   const mutation = useMutation({ onError: handleError, onSuccess: () => handleSuccess("Guardado") });
 */
export function useApiToast() {
  const { addToast } = useToast();

  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof AxiosError) {
        const status = err.response?.status;
        const body = err.response?.data as Record<string, unknown> | undefined;
        const msg = (body?.message as string) ?? err.message;

        if (status === 422 || status === 400) {
          addToast("warning", "Datos inválidos", msg);
        } else if (status === 403) {
          addToast("error", "Sin permisos", "No tenés acceso a esta acción.");
        } else if (status === 404) {
          addToast("warning", "No encontrado", "El recurso ya no existe.");
        } else if (status && status >= 500) {
          addToast(
            "error",
            "Error del servidor",
            "Ocurrió un problema interno. Intentá de nuevo en unos minutos.",
          );
        } else {
          // Error de red / timeout
          addToast(
            "error",
            "Error de conexión",
            "No se pudo conectar con el servidor. Verificá tu conexión.",
          );
        }
      } else {
        addToast("error", "Error inesperado", String(err));
      }
    },
    [addToast],
  );

  const handleSuccess = useCallback(
    (title: string, message?: string) => {
      addToast("success", title, message);
    },
    [addToast],
  );

  return { handleError, handleSuccess };
}
