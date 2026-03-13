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
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: si el token expiró (401), intenta refresh ──
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

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
    // Si el error es 401 y no hemos reintentado ya
    if (status === 401 && !originalRequest._retry) {
      // Si ya hay un refresh en curso, encolar la petición
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("erp_refresh_token");

      if (
        !refreshToken ||
        refreshToken === "null" ||
        refreshToken === "undefined"
      ) {
        isRefreshing = false;
        localStorage.removeItem("erp_refresh_token");
        // No hay refresh token válido → redirigir a login
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        const newAccessToken: string = data.data.accessToken;
        tokenStore.set(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStore.clear();
        localStorage.removeItem("erp_refresh_token");
        localStorage.removeItem("erp_user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
