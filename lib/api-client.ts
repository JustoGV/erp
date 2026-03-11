import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { logger } from "@/lib/logger";

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
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;
    const url = originalRequest?.url ?? "unknown";
    const method = originalRequest?.method?.toUpperCase() ?? "?";

    // ── Log de errores HTTP según el tipo ──
    if (status && status !== 401) {
      const body = error.response?.data as Record<string, unknown> | undefined;
      const msg = (body?.message as string) ?? error.message;

      if (status === 422 || status === 400) {
        // Error de validación — probablemente un dato mal ingresado
        logger.warn(`Validación fallida ${method} ${url}: ${msg}`, "api", {
          status,
          errors: body?.errors,
        });
      } else if (status === 403) {
        logger.warn(`Acceso denegado ${method} ${url}`, "api", { status });
      } else if (status === 404) {
        logger.info(`Recurso no encontrado ${method} ${url}`, "api");
      } else if (status >= 500) {
        logger.error(`Error del servidor ${method} ${url}: ${msg}`, "api", {
          status,
          body: JSON.stringify(body).slice(0, 300),
        });
      }
    } else if (!status) {
      // Error de red / timeout
      logger.error(`Error de red ${method} ${url}: ${error.message}`, "api", {
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

      if (!refreshToken) {
        isRefreshing = false;
        // No hay refresh token → redirigir a login
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
