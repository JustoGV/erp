# Fase 02 — Configuración: Empresas, Locales y Usuarios

## Objetivo

Reemplazar el `LocalContext` hardcodeado con datos reales del backend, crear los tipos y
los servicios API para Empresas, Locales y Usuarios, y conectar la página `/configuracion`
con la API real.

---

## 1. Tipos de la API

Agregar al final de `lib/api-types.ts`:

```typescript
// ── Empresa ──────────────────────────────────────────────────
export interface Empresa {
  id: string;
  code: string;
  name: string;
  taxId: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  email?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmpresaDto {
  code: string;
  name: string;
  taxId: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
}

export interface UpdateEmpresaDto extends Partial<CreateEmpresaDto> {
  active?: boolean;
}

// ── Local ─────────────────────────────────────────────────────
export interface Local {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  email?: string | null;
  manager?: string | null;
  active: boolean;
  empresaId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    usuarios: number;
    clientes: number;
  };
}

export interface CreateLocalDto {
  code: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  manager?: string;
}

export interface UpdateLocalDto extends Partial<CreateLocalDto> {
  active?: boolean;
}

// ── Usuario ───────────────────────────────────────────────────
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  active: boolean;
  empresaId: string;
  localId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUsuarioDto {
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  localId?: string;
}

export interface UpdateUsuarioDto {
  nombre?: string;
  email?: string;
  rol?: UserRole;
  localId?: string;
  active?: boolean;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
```

---

## 2. Servicios API

Crear `lib/services/config.service.ts`:

```typescript
import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  PaginatedResponse,
  Empresa,
  CreateEmpresaDto,
  UpdateEmpresaDto,
  Local,
  CreateLocalDto,
  UpdateLocalDto,
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  ChangePasswordDto,
} from "@/lib/api-types";

// ── Empresas ─────────────────────────────────────────────────

export const empresasService = {
  getAll: () =>
    apiClient.get<ApiResponse<Empresa[]>>("/empresas").then((r) => r.data.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<Empresa>>(`/empresas/${id}`)
      .then((r) => r.data.data),

  create: (dto: CreateEmpresaDto) =>
    apiClient
      .post<ApiResponse<Empresa>>("/empresas", dto)
      .then((r) => r.data.data),

  update: (id: string, dto: UpdateEmpresaDto) =>
    apiClient
      .patch<ApiResponse<Empresa>>(`/empresas/${id}`, dto)
      .then((r) => r.data.data),
};

// ── Locales ───────────────────────────────────────────────────

export const localesService = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient
      .get<PaginatedResponse<Local>>("/locales", { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<Local>>(`/locales/${id}`)
      .then((r) => r.data.data),

  create: (dto: CreateLocalDto) =>
    apiClient
      .post<ApiResponse<Local>>("/locales", dto)
      .then((r) => r.data.data),

  update: (id: string, dto: UpdateLocalDto) =>
    apiClient
      .patch<ApiResponse<Local>>(`/locales/${id}`, dto)
      .then((r) => r.data.data),
};

// ── Usuarios ──────────────────────────────────────────────────

export const usuariosService = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient
      .get<PaginatedResponse<Usuario>>("/usuarios", { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<Usuario>>(`/usuarios/${id}`)
      .then((r) => r.data.data),

  create: (dto: CreateUsuarioDto) =>
    apiClient
      .post<ApiResponse<Usuario>>("/usuarios", dto)
      .then((r) => r.data.data),

  update: (id: string, dto: UpdateUsuarioDto) =>
    apiClient
      .patch<ApiResponse<Usuario>>(`/usuarios/${id}`, dto)
      .then((r) => r.data.data),

  changePassword: (id: string, dto: ChangePasswordDto) =>
    apiClient
      .patch<ApiResponse<{ message: string }>>(`/usuarios/${id}/password`, dto)
      .then((r) => r.data.data),
};
```

---

## 3. Hooks React Query

Crear `hooks/useLocales.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { localesService } from "@/lib/services/config.service";
import type { CreateLocalDto, UpdateLocalDto } from "@/lib/api-types";

export const LOCALES_KEY = ["locales"] as const;

export function useLocales(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: [...LOCALES_KEY, params],
    queryFn: () => localesService.getAll(params),
  });
}

export function useLocal(id: string) {
  return useQuery({
    queryKey: [...LOCALES_KEY, id],
    queryFn: () => localesService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateLocal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateLocalDto) => localesService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: LOCALES_KEY }),
  });
}

export function useUpdateLocal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateLocalDto }) =>
      localesService.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: LOCALES_KEY }),
  });
}
```

Crear `hooks/useUsuarios.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usuariosService } from "@/lib/services/config.service";
import type {
  CreateUsuarioDto,
  UpdateUsuarioDto,
  ChangePasswordDto,
} from "@/lib/api-types";

export const USUARIOS_KEY = ["usuarios"] as const;

export function useUsuarios(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: [...USUARIOS_KEY, params],
    queryFn: () => usuariosService.getAll(params),
  });
}

export function useUsuario(id: string) {
  return useQuery({
    queryKey: [...USUARIOS_KEY, id],
    queryFn: () => usuariosService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateUsuarioDto) => usuariosService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: USUARIOS_KEY }),
  });
}

export function useUpdateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUsuarioDto }) =>
      usuariosService.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: USUARIOS_KEY }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ChangePasswordDto }) =>
      usuariosService.changePassword(id, dto),
  });
}
```

Crear `hooks/useEmpresas.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { empresasService } from "@/lib/services/config.service";
import type { CreateEmpresaDto, UpdateEmpresaDto } from "@/lib/api-types";

export const EMPRESAS_KEY = ["empresas"] as const;

export function useEmpresas() {
  return useQuery({
    queryKey: EMPRESAS_KEY,
    queryFn: () => empresasService.getAll(),
  });
}

export function useEmpresa(id: string) {
  return useQuery({
    queryKey: [...EMPRESAS_KEY, id],
    queryFn: () => empresasService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateEmpresaDto) => empresasService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: EMPRESAS_KEY }),
  });
}

export function useUpdateEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateEmpresaDto }) =>
      empresasService.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: EMPRESAS_KEY }),
  });
}
```

---

## 4. Reemplazar LocalContext

Reemplazar **todo** el contenido de `contexts/LocalContext.tsx`:

```typescript
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { localesService } from '@/lib/services/config.service'
import type { Local } from '@/lib/api-types'

interface LocalContextType {
  selectedLocal: Local | null
  setSelectedLocal: (local: Local | null) => void
  locales: Local[]
  isAllLocales: boolean
  isLoading: boolean
}

const LocalContext = createContext<LocalContextType | undefined>(undefined)

export function LocalProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocal, setSelectedLocalState] = useState<Local | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['locales', 'all'],
    queryFn: () => localesService.getAll({ limit: 100 }),
  })

  const locales = data?.data ?? []

  // Restaurar local seleccionado del localStorage cuando carguen los locales
  useEffect(() => {
    if (locales.length === 0) return

    const savedId = localStorage.getItem('selectedLocalId')
    if (savedId === 'all') {
      setSelectedLocalState(null)
    } else if (savedId) {
      const found = locales.find((l) => l.id === savedId)
      setSelectedLocalState(found ?? locales[0] ?? null)
    } else {
      setSelectedLocalState(locales[0] ?? null)
    }
  }, [locales])

  const setSelectedLocal = (local: Local | null) => {
    setSelectedLocalState(local)
    localStorage.setItem('selectedLocalId', local ? local.id : 'all')
  }

  return (
    <LocalContext.Provider
      value={{
        selectedLocal,
        setSelectedLocal,
        locales,
        isAllLocales: selectedLocal === null,
        isLoading,
      }}
    >
      {children}
    </LocalContext.Provider>
  )
}

export function useLocal() {
  const context = useContext(LocalContext)
  if (!context) throw new Error('useLocal debe ser usado dentro de un LocalProvider')
  return context
}
```

> **Importante:** El tipo `Local` ahora viene de `lib/api-types.ts` y ya no de `lib/mock-data.ts`.
> Cualquier componente que antes importara `type Local` desde `mock-data` debe actualizar el import:
>
> ```typescript
> // Antes:
> import { type Local } from "@/lib/mock-data";
> // Después:
> import type { Local } from "@/lib/api-types";
> ```

---

## 5. Actualizar `app/(dashboard)/layout.tsx`

Agregar `LocalProvider` envolviendo el contenido del dashboard (dentro del layout existente):

```typescript
import { LocalProvider } from '@/contexts/LocalContext'

// Dentro del return, envolver el children:
<LocalProvider>
  {/* ... resto del layout (Sidebar, Header, etc.) ... */}
  {children}
</LocalProvider>
```

---

## 6. Actualizar `usePermissions.ts`

El backend usa estos roles exactos del enum Prisma. Reemplazar `contexts/AuthContext.tsx`
ya exporta `UserRole` con los valores correctos (Fase 01). Actualizar la lógica de permisos
en `hooks/usePermissions.ts` para los nuevos roles:

```typescript
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/api-types";

export interface Permission {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const FULL: Permission = {
  canView: true,
  canCreate: true,
  canEdit: true,
  canDelete: true,
};
const READ: Permission = {
  canView: true,
  canCreate: false,
  canEdit: false,
  canDelete: false,
};
const NONE: Permission = {
  canView: false,
  canCreate: false,
  canEdit: false,
  canDelete: false,
};

const ROLE_PERMISSIONS: Record<UserRole, Record<string, Permission>> = {
  Administrador: { default: FULL },
  Gerente: {
    default: { ...FULL, canDelete: false },
    reportes: READ,
  },
  Vendedor: {
    default: NONE,
    dashboard: FULL,
    ventas: FULL,
    inventario: READ,
    reportes: READ,
  },
  Comprador: {
    default: NONE,
    dashboard: READ,
    compras: FULL,
    inventario: READ,
    reportes: READ,
  },
  Contador: {
    default: NONE,
    dashboard: READ,
    finanzas: FULL,
    compras: READ,
    reportes: READ,
  },
  RRHH: {
    default: NONE,
    dashboard: READ,
    rrhh: FULL,
    reportes: READ,
  },
  Produccion: {
    default: NONE,
    dashboard: READ,
    produccion: FULL,
    inventario: READ,
    reportes: READ,
  },
  Viewer: {
    default: READ,
  },
};

export function usePermissions() {
  const { user } = useAuth();

  const getModulePermissions = (module: string): Permission => {
    if (!user) return NONE;

    const roleMap = ROLE_PERMISSIONS[user.rol];
    if (!roleMap) return NONE;

    // Administrador tiene acceso total a todo
    if (user.rol === "Administrador") return FULL;

    return roleMap[module] ?? roleMap["default"] ?? NONE;
  };

  return { getModulePermissions };
}
```

---

## 7. Eliminar dependencias de mock-data

Una vez que todo funcione con la API real, el archivo `lib/mock-data.ts` puede reducirse
o eliminarse. Los módulos que lo usan actualmente son:

- `contexts/LocalContext.tsx` → **ya migrado** en esta fase
- Páginas específicas de cada módulo → se migran en las fases siguientes

Por ahora **no borrar** `mock-data.ts` hasta que todas las páginas estén migradas.

---

## Resumen de archivos creados/modificados

| Archivo                          | Acción                                                           |
| -------------------------------- | ---------------------------------------------------------------- |
| `lib/api-types.ts`               | **Modificar** — agregar tipos Empresa, Local, Usuario y sus DTOs |
| `lib/services/config.service.ts` | **Crear** — servicios API para empresas, locales y usuarios      |
| `hooks/useLocales.ts`            | **Crear** — hooks React Query para locales                       |
| `hooks/useUsuarios.ts`           | **Crear** — hooks React Query para usuarios                      |
| `hooks/useEmpresas.ts`           | **Crear** — hooks React Query para empresas                      |
| `contexts/LocalContext.tsx`      | **Reemplazar** — usa API real en vez de mock-data                |
| `hooks/usePermissions.ts`        | **Reemplazar** — roles actualizados según el backend             |
| `app/(dashboard)/layout.tsx`     | **Modificar** — agregar LocalProvider                            |

---

## Siguiente fase

→ **Fase 03 — Inventario** (productos, categorías, stock)
