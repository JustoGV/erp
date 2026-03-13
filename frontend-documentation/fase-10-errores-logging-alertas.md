# Fase 10 — Manejo de Errores, Logging y Alertas (Frontend ↔ Backend)

Guía completa de cómo el frontend debe comunicarse con el sistema de errores, logging y alertas del backend. Incluye: formato de errores, `requestId` para debugging, manejo de errores Prisma traducidos, toasts automáticos, y patrones de integración.

---

## 1. Formato de errores del backend (NUEVO)

Toda respuesta de error del backend ahora tiene esta estructura:

```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string; // mensaje en español, listo para mostrar al usuario
    details?: Array<{ message: string }>; // solo en errores de validación (400)
    field?: string; // solo en errores Prisma (indica qué campo violó constraint)
  };
  statusCode: number;
  requestId: string; // ← NUEVO: ID único de 8 chars para correlacionar con logs del backend
  path: string;
  timestamp: string;
}

type ErrorCode =
  | "VALIDATION_ERROR" // 400 — datos del formulario inválidos
  | "UNAUTHORIZED" // 401 — token expirado o inválido
  | "FORBIDDEN" // 403 — sin permisos para esta acción
  | "NOT_FOUND" // 404 — recurso no encontrado
  | "CONFLICT" // 409 — registro duplicado o regla de negocio violada
  | "UNPROCESSABLE_ENTITY" // 422 — datos válidos pero lógicamente incorrectos
  | "TOO_MANY_REQUESTS" // 429 — rate limit excedido
  | "INTERNAL_SERVER_ERROR" // 500 — error inesperado
  | "SERVICE_UNAVAILABLE" // 503 — DB caída temporalmente
  | "ERROR"; // otros
```

### Header nuevo: `X-Request-Id`

Cada respuesta (exitosa o error) incluye el header `X-Request-Id`. Este ID también viene en el body de los errores como `requestId`. Sirve para:

- Que el usuario te lo pueda reportar si algo falla
- Buscar en logs del backend con ese ID exacto

---

## 2. Tipos TypeScript para errores

Agregar a `lib/types/api.ts` (o crear si no existe):

```typescript
// ─── Error response del backend ──────────────────────────────────────────────

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: Array<{ message: string }>;
  field?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
  statusCode: number;
  requestId: string;
  path: string;
  timestamp: string;
}

// ─── Helper para extraer datos del error de Axios ────────────────────────────

export function parseApiError(error: unknown): {
  statusCode: number;
  code: string;
  message: string;
  details: string[];
  field?: string;
  requestId: string;
} {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    (error as any).response?.data?.error
  ) {
    const data = (error as any).response.data as ApiErrorResponse;
    return {
      statusCode: data.statusCode,
      code: data.error.code,
      message: data.error.message,
      details: data.error.details?.map((d) => d.message) ?? [],
      field: data.error.field,
      requestId: data.requestId,
    };
  }

  // Error de red o error no estándar
  return {
    statusCode: 0,
    code: "NETWORK_ERROR",
    message: "Error de conexión con el servidor",
    details: [],
    requestId: "—",
  };
}
```

---

## 3. Actualizar `hooks/useApiToast.ts`

El hook actual mapea status codes a toasts genéricos. Ahora que el backend envía mensajes en español y `requestId`, podemos mejorar significativamente:

```typescript
import { useToast } from "@/contexts/ToastContext";
import { parseApiError } from "@/lib/types/api";
import { logger } from "@/lib/logger";

export function useApiToast() {
  const { addToast } = useToast();

  const handleError = (error: unknown) => {
    const parsed = parseApiError(error);

    // Loguear siempre con requestId para debugging
    logger.error("API Error", {
      requestId: parsed.requestId,
      statusCode: parsed.statusCode,
      code: parsed.code,
      message: parsed.message,
      field: parsed.field,
    });

    // Toast según el código de error
    switch (parsed.code) {
      case "VALIDATION_ERROR":
        // Mostrar los detalles de validación (campo por campo)
        if (parsed.details.length > 0) {
          addToast({
            type: "warning",
            title: "Datos inválidos",
            message: parsed.details.slice(0, 3).join(". "),
          });
        } else {
          addToast({
            type: "warning",
            title: "Datos inválidos",
            message: parsed.message,
          });
        }
        break;

      case "CONFLICT":
        // Registro duplicado — el backend ya dice qué campo (ej: "Ya existe un registro con ese valor de email")
        addToast({
          type: "warning",
          title: "Registro duplicado",
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
          message: parsed.message,
        });
        break;

      case "UNAUTHORIZED":
        // No mostrar toast — el interceptor de api-client redirige a /login
        break;

      case "TOO_MANY_REQUESTS":
        addToast({
          type: "warning",
          title: "Demasiadas solicitudes",
          message: "Esperá unos segundos antes de intentar de nuevo",
        });
        break;

      case "SERVICE_UNAVAILABLE":
        addToast({
          type: "error",
          title: "Servicio no disponible",
          message:
            "La base de datos está temporalmente fuera de servicio. Intentá de nuevo en unos momentos.",
        });
        break;

      case "INTERNAL_SERVER_ERROR":
        addToast({
          type: "error",
          title: "Error del servidor",
          message: `Ocurrió un error inesperado. ID: ${parsed.requestId}`,
        });
        break;

      case "NETWORK_ERROR":
        addToast({
          type: "error",
          title: "Error de conexión",
          message:
            "No se pudo conectar con el servidor. Verificá tu conexión a internet.",
        });
        break;

      default:
        addToast({
          type: "error",
          title: "Error",
          message: parsed.message || "Ocurrió un error inesperado",
        });
    }

    return parsed;
  };

  const handleSuccess = (title: string, message?: string) => {
    addToast({ type: "success", title, message: message ?? "" });
  };

  return { handleError, handleSuccess };
}
```

---

## 4. Patrón de errores de validación con campo específico

El backend ahora envía `field` en errores de constraint (unique, FK). Podés usarlo para resaltar el campo del formulario que generó el error:

```tsx
// Ejemplo en un formulario de crear producto
const crear = useCrearProducto();
const { handleError } = useApiToast();
const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

const handleSubmit = async (data: CreateProductoDto) => {
  setFieldErrors({});
  try {
    await crear.mutateAsync({ dto: data, localId });
  } catch (err) {
    const parsed = handleError(err);

    // Si el backend indica qué campo falló, resaltarlo
    if (parsed.field) {
      setFieldErrors({ [parsed.field]: parsed.message });
    }
  }
};

// En el JSX del formulario:
<input
  className={`input ${fieldErrors.code ? "border-red-500" : ""}`}
  {...register("code")}
/>;
{
  fieldErrors.code && (
    <p className="text-sm text-red-600 mt-1">{fieldErrors.code}</p>
  );
}
```

### Errores de validación comunes que envía el backend

| Situación                                   | `error.code`          | `error.field` | `error.message`                                                        |
| ------------------------------------------- | --------------------- | ------------- | ---------------------------------------------------------------------- |
| SKU duplicado                               | `CONFLICT`            | `code`        | "Ya existe un registro con ese valor de code"                          |
| Email duplicado                             | `CONFLICT`            | `email`       | "Ya existe un registro con ese valor de email"                         |
| FK inválida (ej: categoriaId que no existe) | `VALIDATION_ERROR`    | `categoriaId` | "Referencia inválida: no existe el registro relacionado (categoriaId)" |
| No se puede eliminar (tiene dependientes)   | `CONFLICT`            | —             | "No se puede eliminar: existen registros dependientes"                 |
| Stock insuficiente para iniciar orden       | `VALIDATION_ERROR`    | —             | "Stock insuficiente para el material X"                                |
| Orden ya en proceso                         | `CONFLICT`            | —             | "La orden ya está en proceso"                                          |
| Registro no encontrado (ID malo)            | `NOT_FOUND`           | —             | "El registro no fue encontrado o ya fue eliminado"                     |
| DB no disponible                            | `SERVICE_UNAVAILABLE` | —             | "Base de datos temporalmente no disponible, intente nuevamente"        |

---

## 5. Configurar React Query global `onError`

Agregar manejo de errores por defecto en `QueryProvider` para que las queries que no manejen errores explícitamente no fallen silenciosamente:

```typescript
// components/providers/QueryProvider.tsx
'use client';

import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { useState } from 'react';
import { logger } from '@/lib/logger';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: (failureCount, error: any) => {
              const status = error?.response?.status;
              // No reintentar en errores del cliente (4xx)
              if (status && status >= 400 && status < 500) return false;
              // Reintentar 1 vez en errores de servidor
              return failureCount < 1;
            },
            refetchOnWindowFocus: false,
          },
        },
        queryCache: new QueryCache({
          onError: (error, query) => {
            // Loguear queries que fallan (sin toast — el componente puede manejar su UI)
            logger.error('Query failed', {
              queryKey: query.queryKey,
              error: error?.message,
              requestId: (error as any)?.response?.data?.requestId ?? '—',
            });
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            // Loguear mutations que fallan
            logger.error('Mutation failed', {
              mutationKey: mutation.options.mutationKey,
              error: error?.message,
              requestId: (error as any)?.response?.data?.requestId ?? '—',
            });
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Lógica de retry inteligente

| Status        | Acción               | Por qué                                          |
| ------------- | -------------------- | ------------------------------------------------ |
| 400-499       | **No reintentar**    | Errores del cliente — reintentar daría lo mismo  |
| 401           | **No reintentar**    | El interceptor de `api-client` ya maneja refresh |
| 429           | **No reintentar**    | Rate limit — esperá                              |
| 500+          | **Reintentar 1 vez** | Puede ser transitorio                            |
| Network error | **Reintentar 1 vez** | Puede ser pérdida momentánea de conexión         |

---

## 6. Guardar `requestId` para soporte al usuario

Cuando ocurre un error 500, el usuario ve "ID: a3f2b1c9" en el toast. Si te lo reporta, buscás en los logs del backend:

```bash
# En Fly.io logs:
fly logs | grep "a3f2b1c9"
# O en la consola:
grep "a3f2b1c9" logs/*
```

Para facilitar que el usuario copie el ID, podés agregar un botón de copiar en el toast de error:

```tsx
// En el toast de errores 500 / internos:
addToast({
  type: "error",
  title: "Error del servidor",
  message: `Error inesperado. Referencia: ${parsed.requestId}`,
  action: {
    label: "Copiar ID",
    onClick: () => navigator.clipboard.writeText(parsed.requestId),
  },
});
```

---

## 7. Interceptor actualizado: leer `X-Request-Id`

Actualizar el interceptor de respuestas en `lib/api-client.ts` para adjuntar el `requestId` al error de Axios, facilitando su acceso en los hooks:

```typescript
// En api-client.ts — response interceptor de errores
apiClient.interceptors.response.use(
  (response) => {
    // Guardar requestId en la respuesta para acceso fácil
    const requestId = response.headers["x-request-id"];
    if (requestId && response.data) {
      response.data._requestId = requestId;
    }
    return response;
  },
  async (error) => {
    // Adjuntar requestId al error si no viene en el body
    if (error.response) {
      const headerRequestId = error.response.headers?.["x-request-id"];
      if (headerRequestId && error.response.data) {
        error.response.data.requestId =
          error.response.data.requestId ?? headerRequestId;
      }
    }

    // ... (resto del interceptor existente: refresh, logging, etc.)
  },
);
```

---

## 8. Crear `error.tsx` para Next.js (route-level error boundary)

El frontend tiene `ErrorBoundary` como componente, pero le falta `error.tsx` de Next.js que captura errores en el rendering de rutas:

Crear `app/(dashboard)/error.tsx`:

```tsx
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
    logger.error("Dashboard render error", {
      message: error.message,
      digest: error.digest,
      stack: error.stack?.slice(0, 500),
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Algo salió mal
        </h2>
        <p className="text-gray-600 mb-1">
          Ocurrió un error al cargar esta página.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 font-mono">Ref: {error.digest}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button onClick={reset} className="btn btn-primary">
          Reintentar
        </button>
        <a href="/dashboard" className="btn btn-secondary">
          Ir al Dashboard
        </a>
      </div>
    </div>
  );
}
```

Crear `app/global-error.tsx`:

```tsx
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Error crítico
          </h1>
          <p className="text-gray-600 mb-6">
            La aplicación encontró un error inesperado.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 font-mono mb-4">
              Ref: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
```

---

## 9. Patrón completo: conectar hooks con toasts y error handling

Cuando conectes cada página (reemplazando mock-data con hooks reales), usá este patrón:

### Para mutations (crear, editar, eliminar):

```tsx
"use client";

import { useCrearProducto } from "@/hooks/useInventario";
import { useApiToast } from "@/hooks/useApiToast";
import { parseApiError } from "@/lib/types/api";
import { useState } from "react";

export default function NuevoProductoPage() {
  const crear = useCrearProducto();
  const { handleError, handleSuccess } = useApiToast();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (formData: CreateProductoDto) => {
    setFieldErrors({});
    try {
      await crear.mutateAsync({ dto: formData, localId });
      handleSuccess(
        "Producto creado",
        `Se creó "${formData.name}" correctamente`,
      );
      router.push("/inventario/productos");
    } catch (err) {
      const parsed = handleError(err);
      // Marcar campo específico si el backend lo indica
      if (parsed.field) {
        setFieldErrors({ [parsed.field]: parsed.message });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* inputs con fieldErrors[campo] para resaltar errores */}
      <button type="submit" disabled={crear.isPending}>
        {crear.isPending ? "Guardando..." : "Crear producto"}
      </button>
    </form>
  );
}
```

### Para queries (listados, detalles):

```tsx
'use client';

import { useProductos } from '@/hooks/useInventario';

export default function ProductosPage() {
  const { data, isLoading, error, refetch } = useProductos();

  if (isLoading) return <LoadingSkeleton />;

  // Error de carga — el QueryCache global ya logueó, acá solo la UI
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No se pudieron cargar los productos</p>
        <button onClick={() => refetch()} className="btn btn-primary">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      {data?.data.map(p => (
        // Render productos...
      ))}
    </div>
  );
}
```

---

## 10. Checklist de integración por módulo

Cuando conectes cada módulo (reemplazando mock-data), asegurate de:

- [ ] **Importar el hook** correspondiente (`useProductos`, `useCrearProducto`, etc.)
- [ ] **Usar `useApiToast`** en toda mutation: `onError: handleError` o `try/catch`
- [ ] **Mostrar `fieldErrors`** si el backend envía `field` (constraints de unicidad)
- [ ] **Mostrar estado de carga** (`isLoading` → skeleton, `isPending` → botón deshabilitado)
- [ ] **Mostrar estado de error** en queries con botón "Reintentar"
- [ ] **Eliminar import de mock-data** — ya no se necesita
- [ ] **Loguear acciones** relevantes del usuario (`logger.info('Producto eliminado', { id })`)

---

## 11. Referencia: qué loguea el backend por cada request

Cada vez que el frontend hace un request, el backend genera estos logs:

```
# Request entrante:
→ POST /api/v1/inventario/productos?localId=xxx [a3f2b1c9] user=uuid empresa=uuid body=245b

# Response exitosa:
← POST /api/v1/inventario/productos 201 [a3f2b1c9] 45ms

# Response lenta (>3s):
← GET /api/v1/reportes/ventas 200 [b7c4e2d1] 3450ms ⚠ SLOW

# Error de validación:
⚠ [VALIDATION] POST /api/v1/inventario/productos 400 [a3f2b1c9] user=uuid message=Error de validación details=[...]

# Error de constraint (duplicado):
🚨 [DB_CONSTRAINT] POST /api/v1/usuarios 409 [c2d3e4f5] user=uuid prismaCode=P2002 target=email message=Ya existe...

# Error 500 (inesperado):
🚨 [INTERNAL] GET /api/v1/reportes/dashboard 500 [d4e5f6a7] user=uuid — Cannot read properties of undefined...
```

---

## 12. Health check para monitoreo

El frontend puede consultar la salud del backend:

```
GET /api/v1/health   (público, no requiere token)
```

Respuesta:

```json
{
  "status": "ok", // "ok" o "degraded"
  "timestamp": "2026-03-11T...",
  "uptime": 86400, // segundos desde el último reinicio
  "version": "1.0.0",
  "database": {
    "status": "ok",
    "latencyMs": 12
  },
  "errors": {
    "total": 3, // errores acumulados desde el reinicio
    "breakdown": {
      "INTERNAL:/api/v1/reportes/ventas": 2,
      "VALIDATION:/api/v1/productos": 1
    }
  },
  "memory": {
    // uso de memoria del proceso Node
    "rss": 120,
    "heapUsed": 65,
    "heapTotal": 90
  }
}
```

Podés usar esto en el dashboard admin para mostrar un indicador de salud del sistema, o para un badge de "Backend: OK/Degraded".

---

## 13. Alertas automáticas del backend

El backend ejecuta chequeos cada 5 minutos. No requieren acción del frontend, pero es bueno que sepas qué detecta:

| Alerta                         | Qué detecta                                        | Para qué sirve                               |
| ------------------------------ | -------------------------------------------------- | -------------------------------------------- |
| `HIGH_ERROR_RATE`              | +10 errores 500 acumulados                         | Algo se rompió en el backend                 |
| `STOCK_BAJO_MINIMO`            | Productos con stock ≤ mínimo                       | El módulo inventario debería mostrar alertas |
| `ORDENES_TRABADAS`             | Órdenes EN_PROCESO +2 días de la fecha planificada | Alguien no finalizó una orden                |
| `LIQUIDACIONES_INCONSISTENTES` | Bruto - descuentos ≠ neto                          | Error de cálculo en nómina                   |
| `DB_SLOW`                      | Query de ping >2s                                  | Performance degradándose                     |
| `DB_UNREACHABLE`               | No se conecta a la base de datos                   | Base de datos caída                          |

---

## 14. Resumen: qué errores ve el usuario y cómo

| Error del backend                     | Toast del frontend                                       | UX adicional               |
| ------------------------------------- | -------------------------------------------------------- | -------------------------- |
| 400 validación (campo X inválido)     | ⚠ "Datos inválidos: campo X debe ser..."                 | Resaltar campo en el form  |
| 400 FK inválida                       | ⚠ "Referencia inválida: no existe (categoriaId)"         | Resaltar campo de select   |
| 401 token expirado                    | — (refresh automático, si falla → redirect login)        | —                          |
| 403 sin permiso                       | ❌ "Sin permisos: mensaje del backend"                   | —                          |
| 404 no encontrado                     | ⚠ "No encontrado: El registro no fue encontrado"         | —                          |
| 409 duplicado                         | ⚠ "Registro duplicado: Ya existe con ese valor de code"  | Resaltar campo `code`      |
| 409 dependientes (no se puede borrar) | ⚠ "No se puede eliminar: existen registros dependientes" | Deshabilitar botón         |
| 429 rate limit                        | ⚠ "Demasiadas solicitudes"                               | —                          |
| 500 error interno                     | ❌ "Error del servidor. ID: a3f2b1c9"                    | El user puede copiar el ID |
| 503 DB caída                          | ❌ "Servicio no disponible, intentá de nuevo"            | —                          |
| Sin red                               | ❌ "Error de conexión"                                   | —                          |
