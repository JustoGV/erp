import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { logger } from "@/lib/logger";
import { parseApiError } from "@/lib/types/api";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

// Token en memoria (no en localStorage para mayor seguridad)
let accessToken: string | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
  },
  clear: () => {
    accessToken = null;
  },
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Request interceptor: agrega el Bearer token a cada petición ──
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  let token = tokenStore.get();

  // Fallback: si el módulo fue reseteado por HMR/Fast Refresh, recuperar de localStorage
  if (!token && typeof window !== "undefined") {
    const stored = localStorage.getItem("erp_access_token");
    if (stored && stored !== "null" && stored !== "undefined") {
      tokenStore.set(stored);
      token = stored;
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: maneja errores y expiracion de token ──

apiClient.interceptors.response.use(
  (response) => {
    // Propagar X-Request-Id en la respuesta exitosa
    const requestId = response.headers?.["x-request-id"];
    if (requestId && response.data && typeof response.data === "object") {
      response.data._requestId = requestId;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;
    const url = originalRequest?.url ?? "unknown";
    const method = originalRequest?.method?.toUpperCase() ?? "?";

    // ── Log estructurado según el tipo de error ──
    if (status && status !== 401) {
      const parsed = parseApiError(error);

      if (status === 422 || status === 400) {
        logger.warn(`Validación fallida ${method} ${url}: ${parsed.message}`, {
          context: "api",
          code: parsed.code,
          requestId: parsed.requestId,
          field: parsed.field,
          details: parsed.details,
        });
      } else if (status === 403) {
        logger.warn(`Acceso denegado ${method} ${url}`, {
          context: "api",
          requestId: parsed.requestId,
        });
      } else if (status === 404) {
        logger.info(`Recurso no encontrado ${method} ${url}`, {
          context: "api",
          requestId: parsed.requestId,
        });
      } else if (status === 429) {
        logger.warn(`Rate limit ${method} ${url}`, {
          context: "api",
          requestId: parsed.requestId,
        });
      } else if (status >= 500) {
        logger.error(`Error del servidor ${method} ${url}: ${parsed.message}`, {
          context: "api",
          code: parsed.code,
          requestId: parsed.requestId,
          statusCode: status,
        });
      }
    } else if (!status) {
      logger.error(`Error de red ${method} ${url}: ${error.message}`, {
        context: "api",
        code: error.code,
      });
    }
    // Si el error es 401, el backend no soporta refresh → forzar login
    if (status === 401) {
      tokenStore.clear();
      if (typeof window !== "undefined") {
        localStorage.removeItem("erp_access_token");
        localStorage.removeItem("erp_user");
        // Usar history.pushState para navegación sin hard reload
        window.history.pushState(null, "", "/login");
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    }

    return Promise.reject(error);
  },
);
