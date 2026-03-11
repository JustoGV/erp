# Fase 01 — Configuración y Conexión con el Backend

## Objetivo

Instalar las dependencias necesarias, configurar el cliente HTTP con Axios, conectar el
`AuthContext` real al backend, y preparar React Query para todas las fases siguientes.
Al terminar esta fase el login funciona contra el backend real y los tokens se manejan
correctamente (access token en memoria, refresh token en localStorage).

---

## 1. Instalar dependencias

```bash
npm install axios @tanstack/react-query @tanstack/react-query-devtools
npm install react-hook-form @hookform/resolvers zod
```

---

## 2. Variables de entorno

Crear el archivo `.env.local` en la raíz del proyecto (junto a `package.json`):

```env
NEXT_PUBLIC_API_URL=https://erp-backend.fly.dev/api/v1
```

> Para desarrollo local cambiar a `http://localhost:3001/api/v1`.  
> `NEXT_PUBLIC_` es necesario para que Next.js lo exponga al browser.

---

## 3. Tipos base de la API

Crear `lib/api-types.ts`:

```typescript
// Formato estándar de todas las respuestas del backend
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Roles del backend (deben coincidir exactamente con el enum del backend)
export type UserRole =
  | "Administrador"
  | "Gerente"
  | "Vendedor"
  | "Comprador"
  | "Contador"
  | "RRHH"
  | "Produccion"
  | "Viewer";

export interface AuthUser {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  empresaId: string;
  localId: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
}
```

---

## 4. Cliente HTTP (Axios con interceptors)

Crear `lib/api-client.ts`:

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

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

    // Si el error es 401 y no hemos reintentado ya
    if (error.response?.status === 401 && !originalRequest._retry) {
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
```

---

## 5. React Query Provider

Crear `components/providers/QueryProvider.tsx`:

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,   // 5 minutos
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
```

---

## 6. Reemplazar AuthContext

Reemplazar **todo** el contenido de `contexts/AuthContext.tsx`:

```typescript
'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiClient, tokenStore } from '@/lib/api-client'
import type { AuthUser, AuthTokens } from '@/lib/api-types'

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Al montar: restaurar usuario desde localStorage y el access token
  useEffect(() => {
    const storedUser = localStorage.getItem('erp_user')
    const storedRefresh = localStorage.getItem('erp_refresh_token')

    if (storedUser && storedRefresh) {
      // Intentar silenciosamente obtener un nuevo access token
      const savedUser: AuthUser = JSON.parse(storedUser)
      setUser(savedUser)

      apiClient
        .post<{ success: boolean; data: { accessToken: string } }>(
          '/auth/refresh',
          null,
          { headers: { Authorization: `Bearer ${storedRefresh}` } }
        )
        .then(({ data }) => {
          tokenStore.set(data.data.accessToken)
        })
        .catch(() => {
          // Refresh expirado, limpiar sesión
          setUser(null)
          tokenStore.clear()
          localStorage.removeItem('erp_user')
          localStorage.removeItem('erp_refresh_token')
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post<{ success: boolean; data: AuthTokens }>(
      '/auth/login',
      { email, password }
    )

    const { accessToken, refreshToken, user: authUser } = data.data

    tokenStore.set(accessToken)
    localStorage.setItem('erp_refresh_token', refreshToken)
    localStorage.setItem('erp_user', JSON.stringify(authUser))
    setUser(authUser)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // Ignorar errores de logout en el backend
    } finally {
      tokenStore.clear()
      localStorage.removeItem('erp_refresh_token')
      localStorage.removeItem('erp_user')
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
```

> **Nota:** El tipo `UserRole` que viene del backend usa los valores exactos del enum Prisma:
> `Administrador | Gerente | Vendedor | Comprador | Contador | RRHH | Produccion | Viewer`.
> Actualizar el hook `usePermissions.ts` en la siguiente fase para reflejar estos roles.

---

## 7. Actualizar `app/layout.tsx`

Agregar el `QueryProvider` envolviendo al `AuthProvider`:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryProvider } from '@/components/providers/QueryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ERP System - Sistema de Gestión Empresarial',
  description: 'Sistema ERP completo para gestión de ventas, compras, inventario, finanzas y recursos humanos',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
```

---

## 8. Actualizar `app/login/page.tsx`

El `login` ahora lanza una excepción en vez de retornar `boolean`. Actualizar el `handleSubmit`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    await login(email, password);
    router.push("/dashboard");
  } catch {
    setError("Email o contraseña incorrectos");
    setIsLoading(false);
  }
};
```

---

## 9. Middleware de protección de rutas

Crear `middleware.ts` en la raíz del proyecto (junto a `package.json`):

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas: siempre permitidas
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar si hay refresh token en localStorage no es posible desde middleware
  // (middleware corre en el edge, sin acceso a localStorage).
  // La protección real la hace el AuthContext con isLoading + redirect.
  // Aquí solo protegemos rutas que no sean API ni archivos estáticos.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

## 10. Protección de páginas del dashboard

En `app/(dashboard)/layout.tsx` agregar la redirección si no hay usuario:

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
// ... resto de imports existentes ...

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  // ... resto del layout existente ...
}
```

---

## Resumen de archivos creados/modificados

| Archivo                                  | Acción                                               |
| ---------------------------------------- | ---------------------------------------------------- |
| `.env.local`                             | **Crear** — URL del backend                          |
| `lib/api-types.ts`                       | **Crear** — tipos base de la API                     |
| `lib/api-client.ts`                      | **Crear** — axios con interceptors y auto-refresh    |
| `components/providers/QueryProvider.tsx` | **Crear** — React Query provider                     |
| `contexts/AuthContext.tsx`               | **Reemplazar** — login/logout real contra el backend |
| `app/layout.tsx`                         | **Modificar** — agregar QueryProvider                |
| `app/login/page.tsx`                     | **Modificar** — handleSubmit con try/catch           |
| `middleware.ts`                          | **Crear** — matcher de rutas protegidas              |
| `app/(dashboard)/layout.tsx`             | **Modificar** — redirección si no hay usuario        |

---

## Credenciales de prueba (backend real)

El backend no tiene seed automático en producción. Para probar, primero crear un usuario
via `POST /api/v1/auth/register`:

```json
{
  "nombre": "Admin ERP",
  "email": "admin@empresa.com",
  "password": "Admin123!",
  "rol": "Administrador"
}
```

O usar Swagger en `https://erp-backend.fly.dev/api` (solo visible en dev/staging).

---

## Siguiente fase

→ **Fase 02 — Configuración: Empresas, Locales y Usuarios** (reemplazar `LocalContext` con datos reales)
