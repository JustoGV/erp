import { useToast } from "@/contexts/ToastContext";
import { useCallback } from "react";
import { parseApiError, type ParsedApiError } from "@/lib/types/api";

/**
 * Hook que traduce errores de la API a toasts amigables
 * usando el formato real del backend (error codes + requestId).
 *
 * Uso:
 *   const { handleError, handleSuccess } = useApiToast();
 *   const mutation = useMutation({ onError: handleError, onSuccess: () => handleSuccess("Guardado") });
 *
 * handleError devuelve el ParsedApiError para uso opcional (ej: marcar campo).
 */
export function useApiToast() {
  const { addToast } = useToast();

  const handleError = useCallback(
    (err: unknown): ParsedApiError => {
      const parsed = parseApiError(err);

      if (parsed.isNetwork) {
        addToast({
          type: "error",
          title: "Error de conexión",
          message: "No se pudo conectar con el servidor. Verificá tu conexión.",
        });
        return parsed;
      }

      switch (parsed.code) {
        case "VALIDATION_ERROR":
        case "UNPROCESSABLE_ENTITY":
          if (parsed.details.length > 0) {
            addToast({
              type: "warning",
              title: "Datos inválidos",
              message: parsed.details.join(". "),
            });
          } else {
            addToast({
              type: "error",
              title: "No se pudo completar",
              message: parsed.message,
            });
          }
          break;

        case "CONFLICT":
          addToast({
            type: "warning",
            title: "Conflicto",
            message: parsed.message,
          });
          break;

        case "NOT_FOUND":
          addToast({
            type: "warning",
            title: "No encontrado",
            message: parsed.message,
          });
          break;

        case "FORBIDDEN":
          addToast({
            type: "error",
            title: "Sin permisos",
            message: "No tenés acceso a esta acción.",
          });
          break;

        case "UNAUTHORIZED":
          // El interceptor 401 ya redirige a /login, pero por si acaso
          addToast({
            type: "error",
            title: "Sesión expirada",
            message: "Volvé a iniciar sesión.",
          });
          break;

        case "TOO_MANY_REQUESTS":
          addToast({
            type: "warning",
            title: "Demasiadas solicitudes",
            message: "Esperá unos segundos antes de intentar de nuevo.",
          });
          break;

        case "SERVICE_UNAVAILABLE":
          addToast({
            type: "error",
            title: "Servicio no disponible",
            message: "El servidor está en mantenimiento. Intentá más tarde.",
          });
          break;

        case "INTERNAL_SERVER_ERROR":
          addToast({
            type: "error",
            title: "Error del servidor",
            message: parsed.requestId
              ? `Error interno (ID: ${parsed.requestId.slice(0, 8)}…)`
              : "Ocurrió un problema interno. Intentá de nuevo en unos minutos.",
            action: parsed.requestId
              ? {
                  label: "Copiar ID",
                  onClick: () => {
                    navigator.clipboard.writeText(parsed.requestId);
                  },
                }
              : undefined,
          });
          break;

        default:
          addToast({
            type: "error",
            title: "Error",
            message: parsed.message,
          });
      }

      return parsed;
    },
    [addToast],
  );

  const handleSuccess = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "success", title, message });
    },
    [addToast],
  );

  return { handleError, handleSuccess };
}
