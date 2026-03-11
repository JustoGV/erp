# Fase 07 — Módulo RRHH

Conectar el módulo de Recursos Humanos: empleados, asistencias, horas, liquidaciones y vacaciones.

> **Discrepancias críticas vs documentación del backend**  
> Los DTOs del backend documental están **completamente desactualizados**. Los nombres reales de los campos son los de esta guía. Los campos `legajo`, `apellido`, `nombre`, `cuil`, `nroDoc`, `tipoDoc`, `salarioBase`, `cargo`, `categoria`, `horaEntrada`, `horaSalida`, `observaciones`, `periodoDesde`, `periodoHasta`, `conceptos[]` **no existen** en el backend real.

---

## 1. Tipos TypeScript

Crear `lib/types/rrhh.ts`:

```typescript
// ─── Empleado ───────────────────────────────────────────────────────────────

export interface Empleado {
  id: string;
  empresaId: string;
  localId: string;
  code: string;          // código único por empresa, ej. "EMP-001"
  name: string;          // nombre completo
  email?: string;
  phone?: string;
  position: string;      // cargo / puesto
  department: string;    // área / departamento
  salary: number;        // sueldo
  hireDate: string;      // fecha ingreso (ISO string)
  active: boolean;
  createdAt: string;
  updatedAt: string;
  // solo en findOne()
  _count?: {
    asistencias: number;
    liquidaciones: number;
    vacaciones: number;
    horas: number;
  };
}

export interface CreateEmpleadoDto {
  code: string;           // obligatorio, único por empresa
  name: string;           // obligatorio
  email?: string;
  phone?: string;
  position: string;       // obligatorio
  department: string;     // obligatorio
  salary: number;         // obligatorio, >= 0
  hireDate: string;       // obligatorio, formato "YYYY-MM-DD"
  active?: boolean;       // default: true
}

export type UpdateEmpleadoDto = Partial<CreateEmpleadoDto>;

// ─── Asistencia ─────────────────────────────────────────────────────────────
//   Un registro por (empleado + fecha). 
//   presente  = ausente: false
//   ausente   = ausente: true, justificado: false
//   justificado = ausente: true, justificado: true

export interface Asistencia {
  id: string;
  empresaId: string;
  empleadoId: string;
  fecha: string;
  entrada?: string;     // datetime ISO
  salida?: string;      // datetime ISO
  ausente: boolean;
  justificado: boolean;
  notas?: string;
  createdAt: string;
}

export interface CreateAsistenciaDto {
  empleadoId: string;
  fecha: string;            // "YYYY-MM-DD"
  ausente?: boolean;        // default: false
  justificado?: boolean;    // default: false (solo aplica si ausente: true)
  entrada?: string;         // datetime ISO, ej. "2026-02-18T09:05:00Z"
  salida?: string;          // datetime ISO
  notas?: string;
}

// ─── RegistroHoras ──────────────────────────────────────────────────────────
//   Un registro por (empleado + fecha).

export interface RegistroHoras {
  id: string;
  empresaId: string;
  empleadoId: string;
  fecha: string;
  horasNormales: number;
  horasExtra: number;
  descripcion?: string;
  createdAt: string;
}

export interface CreateRegistroHorasDto {
  empleadoId: string;
  fecha: string;            // "YYYY-MM-DD"
  horasNormales: number;    // obligatorio, >= 0
  horasExtra?: number;      // default: 0
  descripcion?: string;
}

// ─── Liquidacion ────────────────────────────────────────────────────────────
//   El backend calcula sueldoNeto = sueldobruto - deducciones.
//   Un registro por (empleado + periodo).

export interface Liquidacion {
  id: string;
  empresaId: string;
  empleadoId: string;
  periodo: string;      // formato "YYYY-MM", ej. "2026-02"
  sueldobruto: number;
  deducciones: number;
  sueldoNeto: number;   // calculado por el backend
  estado: 'BORRADOR' | 'APROBADA';
  fechaPago?: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
  // incluido en findAll y findOne:
  empleado?: Pick<Empleado, 'id' | 'code' | 'name' | 'position' | 'department'>;
}

export interface CreateLiquidacionDto {
  empleadoId: string;
  periodo: string;        // obligatorio, formato "YYYY-MM"
  sueldobruto: number;    // obligatorio, >= 0
  deducciones?: number;   // default: 0
  fechaPago?: string;     // datetime ISO opcional
  notas?: string;
}

// ─── Vacacion ────────────────────────────────────────────────────────────────

export interface Vacacion {
  id: string;
  empresaId: string;
  empleadoId: string;
  fechaDesde: string;
  fechaHasta: string;
  diasHabiles: number;    // calculado por el backend
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  aprobadoPor?: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVacacionDto {
  empleadoId: string;
  fechaDesde: string;   // "YYYY-MM-DD"
  fechaHasta: string;   // "YYYY-MM-DD"
  notas?: string;
}

// ─── ResumenHoras ────────────────────────────────────────────────────────────

export interface ResumenHoras {
  periodo: string;              // ej. "02/2026"
  totalHorasNormales: number;
  totalHorasExtra: number;
  diasPresente: number;         // ausente === false
  diasAusente: number;          // ausente && !justificado
  diasJustificados: number;     // ausente && justificado
}

// ─── Respuestas paginadas ────────────────────────────────────────────────────

export interface PaginatedEmpleados {
  data: Empleado[];
  meta: PaginationMeta;
}

export interface PaginatedAsistencias {
  data: Asistencia[];
  meta: PaginationMeta;
}

export interface PaginatedHoras {
  data: RegistroHoras[];
  meta: PaginationMeta;
}

export interface PaginatedLiquidaciones {
  data: Liquidacion[];
  meta: PaginationMeta;
}

// PaginationMeta definida en fase-01 / tipos compartidos
interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

## 2. Servicio HTTP

Crear `lib/services/rrhh.service.ts`:

```typescript
import { apiClient } from '@/lib/api-client';
import type {
  Empleado,
  CreateEmpleadoDto,
  UpdateEmpleadoDto,
  Asistencia,
  CreateAsistenciaDto,
  RegistroHoras,
  CreateRegistroHorasDto,
  Liquidacion,
  CreateLiquidacionDto,
  Vacacion,
  CreateVacacionDto,
  ResumenHoras,
  PaginatedEmpleados,
  PaginatedAsistencias,
  PaginatedHoras,
  PaginatedLiquidaciones,
} from '@/lib/types/rrhh';

// ─── Parámetros comunes de paginación ────────────────────────────────────────

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  localId?: string;
}

// ─── Empleados ───────────────────────────────────────────────────────────────

export const empleadosService = {
  /** Lista de empleados. Búsqueda por name, code, position o department. */
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedEmpleados>('/empleados', { params }),

  /** Legajo completo del empleado con conteos (_count). */
  getById: (id: string) =>
    apiClient.get<{ data: Empleado }>(`/empleados/${id}`),

  /**
   * Resumen de horas y asistencias de un mes.
   * @param mes  1–12
   * @param anio YYYY
   */
  getResumenHoras: (id: string, mes: number, anio: number) =>
    apiClient.get<{ data: ResumenHoras }>(
      `/empleados/${id}/resumen-horas`,
      { params: { mes, anio } }
    ),

  /**
   * Crear empleado. Requiere localId como query param.
   * Únicamente rol Administrador.
   * Genera 409 si ya existe un empleado con ese code en la empresa.
   */
  create: (dto: CreateEmpleadoDto, localId: string) =>
    apiClient.post<{ data: Empleado }>(`/empleados?localId=${localId}`, dto),

  /** Actualizar empleado (campos parciales). Solo Administrador. */
  update: (id: string, dto: UpdateEmpleadoDto) =>
    apiClient.patch<{ data: Empleado }>(`/empleados/${id}`, dto),
};

// ─── Asistencias ─────────────────────────────────────────────────────────────

export const asistenciasService = {
  /**
   * Lista de asistencias.
   * Filtros opcionales: empleadoId, fecha (string "YYYY-MM-DD").
   */
  getAll: (params?: PaginationParams & { empleadoId?: string; fecha?: string }) =>
    apiClient.get<PaginatedAsistencias>('/asistencias', { params }),

  /**
   * Registrar asistencia para un empleado en una fecha.
   * La combinación (empleadoId + fecha) es única.
   * Lógica:
   *   - Presente:     { ausente: false }
   *   - Ausente:      { ausente: true }
   *   - Justificado:  { ausente: true, justificado: true }
   */
  create: (dto: CreateAsistenciaDto) =>
    apiClient.post<{ data: Asistencia }>('/asistencias', dto),
};

// ─── Horas ───────────────────────────────────────────────────────────────────

export const horasService = {
  /** Lista de registros de horas. Filtrar por empleadoId opcional. */
  getAll: (params?: PaginationParams & { empleadoId?: string }) =>
    apiClient.get<PaginatedHoras>('/horas', { params }),

  /**
   * Registrar horas de un empleado en una fecha.
   * La combinación (empleadoId + fecha) es única.
   */
  create: (dto: CreateRegistroHorasDto) =>
    apiClient.post<{ data: RegistroHoras }>('/horas', dto),
};

// ─── Liquidaciones ───────────────────────────────────────────────────────────

export const liquidacionesService = {
  /** Lista de liquidaciones de la empresa/local. */
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedLiquidaciones>('/liquidaciones', { params }),

  /** Detalle de una liquidación. */
  getById: (id: string) =>
    apiClient.get<{ data: Liquidacion }>(`/liquidaciones/${id}`),

  /**
   * Crear liquidación de haberes. Solo Administrador.
   * Genera error 400 si ya existe liquidación para (empleadoId + periodo).
   * sueldoNeto = sueldobruto - (deducciones ?? 0)  — calculado por backend.
   * @example
   *   { empleadoId, periodo: "2026-02", sueldobruto: 280000, deducciones: 39480 }
   */
  create: (dto: CreateLiquidacionDto) =>
    apiClient.post<{ data: Liquidacion }>('/liquidaciones', dto),

  /**
   * Aprobar liquidación (cambia estado a APROBADA). Solo Administrador.
   * Solo funciona si la liquidación está en estado BORRADOR.
   */
  aprobar: (id: string) =>
    apiClient.patch<{ data: Liquidacion }>(`/liquidaciones/${id}/aprobar`),
};

// ─── Vacaciones ──────────────────────────────────────────────────────────────

export const vacacionesService = {
  /**
   * Historial de vacaciones de un empleado.
   * Responde con: { data: Vacacion[], resumen: { diasTomados: number } }
   */
  getByEmpleado: (empleadoId: string) =>
    apiClient.get<{ data: Vacacion[]; resumen: { diasTomados: number } }>(
      `/vacaciones/empleado/${empleadoId}`
    ),

  /**
   * Solicitar vacaciones para un empleado.
   * diasHabiles calculado por el backend (fechaHasta - fechaDesde + 1).
   * Error 400 si se solapa con otra solicitud PENDIENTE o APROBADA.
   */
  create: (dto: CreateVacacionDto) =>
    apiClient.post<{ data: Vacacion }>('/vacaciones', dto),

  /** Aprobar solicitud de vacaciones. Solo Administrador. */
  aprobar: (id: string) =>
    apiClient.patch<{ data: Vacacion }>(`/vacaciones/${id}/aprobar`),

  /**
   * Rechazar solicitud de vacaciones. Solo Administrador.
   * El motivo se guarda en el campo notas de la vacación.
   */
  rechazar: (id: string, motivo: string) =>
    apiClient.patch<{ data: Vacacion }>(`/vacaciones/${id}/rechazar`, { motivo }),
};
```

---

## 3. React Query Hooks

Crear `hooks/useRRHH.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  empleadosService,
  asistenciasService,
  horasService,
  liquidacionesService,
  vacacionesService,
} from '@/lib/services/rrhh.service';
import type {
  CreateEmpleadoDto,
  UpdateEmpleadoDto,
  CreateAsistenciaDto,
  CreateRegistroHorasDto,
  CreateLiquidacionDto,
  CreateVacacionDto,
} from '@/lib/types/rrhh';

// ─────────────────────────── Keys ───────────────────────────────────────────

export const rrhhKeys = {
  empleados: {
    all: ['empleados'] as const,
    list: (params?: object) => ['empleados', 'list', params] as const,
    detail: (id: string) => ['empleados', id] as const,
    resumen: (id: string, mes: number, anio: number) =>
      ['empleados', id, 'resumen-horas', mes, anio] as const,
  },
  asistencias: {
    all: ['asistencias'] as const,
    list: (params?: object) => ['asistencias', 'list', params] as const,
  },
  horas: {
    all: ['horas'] as const,
    list: (params?: object) => ['horas', 'list', params] as const,
  },
  liquidaciones: {
    all: ['liquidaciones'] as const,
    list: (params?: object) => ['liquidaciones', 'list', params] as const,
    detail: (id: string) => ['liquidaciones', id] as const,
  },
  vacaciones: {
    byEmpleado: (empleadoId: string) => ['vacaciones', empleadoId] as const,
  },
};

// ─────────────────────────── Empleados ──────────────────────────────────────

interface EmpleadoParams {
  page?: number;
  limit?: number;
  search?: string;
  localId?: string;
}

export function useEmpleados(params?: EmpleadoParams) {
  return useQuery({
    queryKey: rrhhKeys.empleados.list(params),
    queryFn: () => empleadosService.getAll(params),
  });
}

export function useEmpleado(id: string) {
  return useQuery({
    queryKey: rrhhKeys.empleados.detail(id),
    queryFn: () => empleadosService.getById(id),
    enabled: !!id,
  });
}

export function useResumenHoras(id: string, mes: number, anio: number) {
  return useQuery({
    queryKey: rrhhKeys.empleados.resumen(id, mes, anio),
    queryFn: () => empleadosService.getResumenHoras(id, mes, anio),
    enabled: !!id && !!mes && !!anio,
  });
}

export function useCrearEmpleado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dto, localId }: { dto: CreateEmpleadoDto; localId: string }) =>
      empleadosService.create(dto, localId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rrhhKeys.empleados.all });
    },
  });
}

export function useActualizarEmpleado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateEmpleadoDto }) =>
      empleadosService.update(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: rrhhKeys.empleados.all });
      queryClient.invalidateQueries({ queryKey: rrhhKeys.empleados.detail(id) });
    },
  });
}

// ─────────────────────────── Asistencias ────────────────────────────────────

interface AsistenciaParams {
  page?: number;
  limit?: number;
  localId?: string;
  empleadoId?: string;
  fecha?: string;
}

export function useAsistencias(params?: AsistenciaParams) {
  return useQuery({
    queryKey: rrhhKeys.asistencias.list(params),
    queryFn: () => asistenciasService.getAll(params),
  });
}

export function useRegistrarAsistencia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAsistenciaDto) => asistenciasService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rrhhKeys.asistencias.all });
    },
  });
}

// ─────────────────────────── Horas ──────────────────────────────────────────

interface HorasParams {
  page?: number;
  limit?: number;
  localId?: string;
  empleadoId?: string;
}

export function useHoras(params?: HorasParams) {
  return useQuery({
    queryKey: rrhhKeys.horas.list(params),
    queryFn: () => horasService.getAll(params),
  });
}

export function useRegistrarHoras() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRegistroHorasDto) => horasService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rrhhKeys.horas.all });
    },
  });
}

// ─────────────────────────── Liquidaciones ──────────────────────────────────

interface LiquidacionParams {
  page?: number;
  limit?: number;
  localId?: string;
}

export function useLiquidaciones(params?: LiquidacionParams) {
  return useQuery({
    queryKey: rrhhKeys.liquidaciones.list(params),
    queryFn: () => liquidacionesService.getAll(params),
  });
}

export function useLiquidacion(id: string) {
  return useQuery({
    queryKey: rrhhKeys.liquidaciones.detail(id),
    queryFn: () => liquidacionesService.getById(id),
    enabled: !!id,
  });
}

export function useCrearLiquidacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateLiquidacionDto) => liquidacionesService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rrhhKeys.liquidaciones.all });
    },
  });
}

export function useAprobarLiquidacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => liquidacionesService.aprobar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rrhhKeys.liquidaciones.all });
    },
  });
}

// ─────────────────────────── Vacaciones ─────────────────────────────────────

export function useVacacionesByEmpleado(empleadoId: string) {
  return useQuery({
    queryKey: rrhhKeys.vacaciones.byEmpleado(empleadoId),
    queryFn: () => vacacionesService.getByEmpleado(empleadoId),
    enabled: !!empleadoId,
  });
}

export function useSolicitarVacaciones() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateVacacionDto) => vacacionesService.create(dto),
    onSuccess: () => {
      // Invalidar vacaciones del empleado específico si lo conocemos,
      // o invalidar genéricamente
      queryClient.invalidateQueries({ queryKey: ['vacaciones'] });
    },
  });
}

export function useAprobarVacaciones() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vacacionesService.aprobar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacaciones'] });
    },
  });
}

export function useRechazarVacaciones() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      vacacionesService.rechazar(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacaciones'] });
    },
  });
}
```

---

## 4. Actualizar `app/(dashboard)/rrhh/page.tsx`

Reemplazar la página de RRHH que usa `mockEmpleados` con datos reales del backend:

```tsx
'use client';

import Link from 'next/link';
import { useLocal } from '@/contexts/LocalContext';
import { useEmpleados, useLiquidaciones, useAsistencias } from '@/hooks/useRRHH';

export default function RRHHPage() {
  const { selectedLocal, isAllLocales } = useLocal();

  const localId = isAllLocales ? undefined : selectedLocal?.id;

  // Empleados activos e inactivos
  const { data: empleadosData } = useEmpleados({ localId, limit: 1 });
  const { data: activosData } = useEmpleados({ localId, limit: 1 });

  // Liquidaciones del mes actual
  const periodoActual = (() => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  })();
  const { data: liquidacionesData } = useLiquidaciones({ localId });

  // Asistencias del día de hoy
  const hoy = new Date().toISOString().split('T')[0];
  const { data: ausenciasHoy } = useAsistencias({ localId, fecha: hoy });

  // Calcular stats
  const totalEmpleados = empleadosData?.meta?.total ?? 0;

  const ausenciasMes = ausenciasHoy?.data?.filter(a => a.ausente).length ?? 0;

  const liquidacionesMes = liquidacionesData?.data?.filter(
    l => l.periodo === periodoActual
  ).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recursos Humanos</h1>
          <p className="text-gray-600 mt-1">
            Gestión de empleados, liquidaciones y asistencias
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <QuickStatCard
          title="Empleados"
          value={String(totalEmpleados)}
          href="/rrhh/empleados"
        />
        <QuickStatCard
          title="Liquidaciones (mes)"
          value={String(liquidacionesMes)}
          href="/rrhh/liquidaciones"
        />
        <QuickStatCard
          title="Ausencias (hoy)"
          value={String(ausenciasMes)}
          href="/rrhh/asistencias"
        />
        <QuickStatCard
          title="Registros horas"
          value="—"
          href="/rrhh/horas"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModuleCard
          title="Empleados"
          description="Base de datos de empleados"
          href="/rrhh/empleados"
          buttonText="Ver empleados"
        />
        <ModuleCard
          title="Liquidaciones"
          description="Liquidación de sueldos mensual"
          href="/rrhh/liquidaciones"
          buttonText="Ver liquidaciones"
        />
        <ModuleCard
          title="Asistencias"
          description="Control de asistencias y ausencias"
          href="/rrhh/asistencias"
          buttonText="Ver asistencias"
        />
        <ModuleCard
          title="Horas y Extras"
          description="Registro de horas trabajadas"
          href="/rrhh/horas"
          buttonText="Ver horas"
        />
        <ModuleCard
          title="Vacaciones"
          description="Gestión de solicitudes de vacaciones"
          href="/rrhh/vacaciones"
          buttonText="Ver vacaciones"
        />
      </div>
    </div>
  );
}

function QuickStatCard({
  title,
  value,
  href,
}: {
  title: string;
  value: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="card hover:shadow-lg transition-shadow cursor-pointer">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
    </Link>
  );
}

function ModuleCard({
  title,
  description,
  href,
  buttonText,
}: {
  title: string;
  description: string;
  href: string;
  buttonText: string;
}) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <Link href={href} className="btn btn-primary w-full text-center">
        {buttonText}
      </Link>
    </div>
  );
}
```

---

## 5. Patrones de uso por subpágina

### `app/(dashboard)/rrhh/empleados/page.tsx`

Lista de empleados con búsqueda:

```tsx
'use client';

import { useState } from 'react';
import { useLocal } from '@/contexts/LocalContext';
import { useEmpleados } from '@/hooks/useRRHH';

export default function EmpleadosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const localId = isAllLocales ? undefined : selectedLocal?.id;

  const { data, isLoading } = useEmpleados({ localId, search, page, limit: 20 });

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Empleados</h1>
        <a href="/rrhh/empleados/nuevo" className="btn btn-primary">
          + Nuevo empleado
        </a>
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre, código, cargo o área..."
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        className="input w-full max-w-md"
      />

      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Cargo</th>
            <th>Área</th>
            <th>Sueldo</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map(emp => (
            <tr key={emp.id}>
              <td>{emp.code}</td>
              <td>{emp.name}</td>
              <td>{emp.position}</td>
              <td>{emp.department}</td>
              <td>${Number(emp.salary).toLocaleString('es-AR')}</td>
              <td>{emp.active ? 'Activo' : 'Inactivo'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación: data?.meta.totalPages */}
    </div>
  );
}
```

---

### `app/(dashboard)/rrhh/empleados/nuevo/page.tsx`

Formulario de alta de empleado:

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLocal } from '@/contexts/LocalContext';
import { useCrearEmpleado } from '@/hooks/useRRHH';

export default function NuevoEmpleadoPage() {
  const router = useRouter();
  const { selectedLocal } = useLocal();
  const crearEmpleado = useCrearEmpleado();

  const [form, setForm] = useState({
    code: '',
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: 0,
    hireDate: '',
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocal?.id) return;

    await crearEmpleado.mutateAsync({
      dto: {
        ...form,
        salary: Number(form.salary),
      },
      localId: selectedLocal.id,
    });
    router.push('/rrhh/empleados');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-bold">Nuevo empleado</h1>

      {/* code — único por empresa */}
      <div>
        <label className="label">Código *</label>
        <input
          className="input w-full"
          value={form.code}
          onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
          placeholder="EMP-001"
          required
        />
      </div>

      {/* name — nombre completo */}
      <div>
        <label className="label">Nombre completo *</label>
        <input
          className="input w-full"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input w-full"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div>
          <label className="label">Teléfono</label>
          <input
            className="input w-full"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Cargo / Puesto *</label>
          <input
            className="input w-full"
            value={form.position}
            onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">Área / Departamento *</label>
          <input
            className="input w-full"
            value={form.department}
            onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Sueldo *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="input w-full"
            value={form.salary}
            onChange={e => setForm(f => ({ ...f, salary: +e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">Fecha de ingreso *</label>
          <input
            type="date"
            className="input w-full"
            value={form.hireDate}
            onChange={e => setForm(f => ({ ...f, hireDate: e.target.value }))}
            required
          />
        </div>
      </div>

      {crearEmpleado.isError && (
        <p className="text-red-600 text-sm">
          Error al crear el empleado. Verificá que el código no esté duplicado.
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={crearEmpleado.isPending || !selectedLocal?.id}
      >
        {crearEmpleado.isPending ? 'Guardando...' : 'Crear empleado'}
      </button>
    </form>
  );
}
```

---

### `app/(dashboard)/rrhh/asistencias/page.tsx`

Registrar y listar asistencias, con filtro por fecha y empleado:

```tsx
'use client';

import { useState } from 'react';
import { useLocal } from '@/contexts/LocalContext';
import { useAsistencias, useRegistrarAsistencia, useEmpleados } from '@/hooks/useRRHH';

export default function AsistenciasPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;

  // Filtro por fecha (hoy por defecto)
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  const { data: asistenciasData, isLoading } = useAsistencias({ localId, fecha });
  const { data: empleadosData } = useEmpleados({ localId, limit: 100 });
  const registrar = useRegistrarAsistencia();

  const handleRegistrar = async (
    empleadoId: string,
    tipo: 'presente' | 'ausente' | 'justificado'
  ) => {
    await registrar.mutateAsync({
      empleadoId,
      fecha,
      ausente: tipo !== 'presente',
      justificado: tipo === 'justificado',
    });
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Asistencias</h1>

      <div className="flex items-center gap-4">
        <label className="label">Fecha:</label>
        <input
          type="date"
          className="input"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
        />
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Empleado</th>
            <th>Código</th>
            <th>Estado</th>
            <th>Entrada</th>
            <th>Salida</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {asistenciasData?.data.map(a => (
            <tr key={a.id}>
              {/* Para mostrar el nombre buscar en empleadosData */}
              <td>{a.empleadoId}</td>
              <td>
                {a.ausente
                  ? a.justificado
                    ? 'Justificado'
                    : 'Ausente'
                  : 'Presente'}
              </td>
              <td>{a.entrada ?? '—'}</td>
              <td>{a.salida ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formulario para registrar asistencia de un empleado */}
      <div className="card max-w-md">
        <h3 className="font-semibold mb-4">Registrar asistencia</h3>
        {/* Seleccionar empleado + botones Presente / Ausente / Justificado */}
        {/* llamar: handleRegistrar(empleadoId, 'presente' | 'ausente' | 'justificado') */}
      </div>
    </div>
  );
}
```

> **Nota:** La combinación `(empleadoId + fecha)` es única en la base de datos. Si intentás registrar dos veces el mismo empleado en el mismo día obtendrás un error 500/400. Antes de crear, verificá si ya existe un registro con `useAsistencias({ empleadoId, fecha })`.

---

### `app/(dashboard)/rrhh/horas/page.tsx`

Registrar horas normales y extras:

```tsx
'use client';

import { useState } from 'react';
import { useLocal } from '@/contexts/LocalContext';
import { useHoras, useRegistrarHoras, useEmpleados } from '@/hooks/useRRHH';

export default function HorasPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;

  const [empleadoId, setEmpleadoId] = useState('');
  const { data: horasData } = useHoras({ localId, empleadoId: empleadoId || undefined });
  const { data: empleadosData } = useEmpleados({ localId, limit: 100 });
  const registrar = useRegistrarHoras();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await registrar.mutateAsync({
      empleadoId: fd.get('empleadoId') as string,
      fecha: fd.get('fecha') as string,
      horasNormales: Number(fd.get('horasNormales')),
      horasExtra: Number(fd.get('horasExtra')) || undefined,
      descripcion: (fd.get('descripcion') as string) || undefined,
    });
    e.currentTarget.reset();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Registro de Horas</h1>

      <form onSubmit={handleSubmit} className="card max-w-lg space-y-4">
        <h3 className="font-semibold">Registrar horas trabajadas</h3>

        <select name="empleadoId" className="input w-full" required>
          <option value="">Seleccionar empleado...</option>
          {empleadosData?.data.map(e => (
            <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
          ))}
        </select>

        <input type="date" name="fecha" className="input w-full" required />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Horas normales *</label>
            <input
              type="number"
              name="horasNormales"
              min="0"
              step="0.5"
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="label">Horas extra</label>
            <input
              type="number"
              name="horasExtra"
              min="0"
              step="0.5"
              className="input w-full"
            />
          </div>
        </div>

        <input
          type="text"
          name="descripcion"
          placeholder="Descripción (opcional)"
          className="input w-full"
        />

        <button
          type="submit"
          className="btn btn-primary"
          disabled={registrar.isPending}
        >
          {registrar.isPending ? 'Guardando...' : 'Registrar'}
        </button>
      </form>

      {/* Lista de registros filtrada por empleado */}
      <div>
        <select
          className="input mb-4"
          value={empleadoId}
          onChange={e => setEmpleadoId(e.target.value)}
        >
          <option value="">Todos los empleados</option>
          {empleadosData?.data.map(e => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>

        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Empleado ID</th>
              <th>Fecha</th>
              <th>Normales</th>
              <th>Extra</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {horasData?.data.map(h => (
              <tr key={h.id}>
                <td>{h.empleadoId}</td>
                <td>{h.fecha}</td>
                <td>{Number(h.horasNormales)}</td>
                <td>{Number(h.horasExtra)}</td>
                <td>{h.descripcion ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

> **Nota:** La combinación `(empleadoId + fecha)` es única. Igual que en asistencias, verificar antes de registrar.

---

### `app/(dashboard)/rrhh/liquidaciones/page.tsx`

Listar liquidaciones y crear una nueva:

```tsx
'use client';

import { useState } from 'react';
import { useLocal } from '@/contexts/LocalContext';
import {
  useLiquidaciones,
  useCrearLiquidacion,
  useAprobarLiquidacion,
  useEmpleados,
} from '@/hooks/useRRHH';

export default function LiquidacionesPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;

  const { data, isLoading } = useLiquidaciones({ localId });
  const { data: empleadosData } = useEmpleados({ localId, limit: 100 });
  const crearLiq = useCrearLiquidacion();
  const aprobarLiq = useAprobarLiquidacion();

  const [form, setForm] = useState({
    empleadoId: '',
    periodo: '',     // formato "YYYY-MM"
    sueldobruto: 0,
    deducciones: 0,
    notas: '',
  });

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    await crearLiq.mutateAsync({
      empleadoId: form.empleadoId,
      periodo: form.periodo,
      sueldobruto: Number(form.sueldobruto),
      deducciones: Number(form.deducciones) || undefined,
      notas: form.notas || undefined,
    });
    setForm({ empleadoId: '', periodo: '', sueldobruto: 0, deducciones: 0, notas: '' });
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Liquidaciones de Haberes</h1>

      {/* Formulario de nueva liquidación */}
      <form onSubmit={handleCrear} className="card max-w-lg space-y-4">
        <h3 className="font-semibold">Nueva liquidación</h3>

        <select
          className="input w-full"
          value={form.empleadoId}
          onChange={e => setForm(f => ({ ...f, empleadoId: e.target.value }))}
          required
        >
          <option value="">Seleccionar empleado...</option>
          {empleadosData?.data.map(e => (
            <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
          ))}
        </select>

        {/* periodo: "YYYY-MM" — usar type="month" para comodidad */}
        <div>
          <label className="label">Período (YYYY-MM) *</label>
          <input
            type="month"
            className="input w-full"
            value={form.periodo}
            onChange={e => setForm(f => ({ ...f, periodo: e.target.value }))}
            required
          />
          {/* input[type=month] devuelve "YYYY-MM" que es exactamente lo que espera la API */}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Sueldo bruto *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input w-full"
              value={form.sueldobruto}
              onChange={e => setForm(f => ({ ...f, sueldobruto: +e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Deducciones</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input w-full"
              value={form.deducciones}
              onChange={e => setForm(f => ({ ...f, deducciones: +e.target.value }))}
            />
          </div>
        </div>

        <p className="text-sm text-gray-600">
          Sueldo neto estimado:{' '}
          <strong>
            ${(Number(form.sueldobruto) - Number(form.deducciones)).toLocaleString('es-AR')}
          </strong>
        </p>

        <textarea
          className="input w-full"
          placeholder="Notas (opcional)"
          value={form.notas}
          onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
          rows={2}
        />

        {crearLiq.isError && (
          <p className="text-red-600 text-sm">
            Error. Verificá que no exista ya una liquidación para ese empleado y período.
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={crearLiq.isPending}
        >
          {crearLiq.isPending ? 'Creando...' : 'Crear liquidación'}
        </button>
      </form>

      {/* Tabla de liquidaciones */}
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Empleado</th>
            <th>Período</th>
            <th>Bruto</th>
            <th>Deducciones</th>
            <th>Neto</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map(liq => (
            <tr key={liq.id}>
              <td>{liq.empleado?.name ?? liq.empleadoId}</td>
              <td>{liq.periodo}</td>
              <td>${Number(liq.sueldobruto).toLocaleString('es-AR')}</td>
              <td>${Number(liq.deducciones).toLocaleString('es-AR')}</td>
              <td>${Number(liq.sueldoNeto).toLocaleString('es-AR')}</td>
              <td>
                <span className={liq.estado === 'APROBADA' ? 'text-green-600' : 'text-yellow-600'}>
                  {liq.estado}
                </span>
              </td>
              <td>
                {liq.estado === 'BORRADOR' && (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => aprobarLiq.mutate(liq.id)}
                    disabled={aprobarLiq.isPending}
                  >
                    Aprobar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### `app/(dashboard)/rrhh/vacaciones/page.tsx`

Solicitar vacaciones y gestionar solicitudes:

```tsx
'use client';

import { useState } from 'react';
import { useLocal } from '@/contexts/LocalContext';
import {
  useSolicitarVacaciones,
  useAprobarVacaciones,
  useRechazarVacaciones,
  useVacacionesByEmpleado,
  useEmpleados,
} from '@/hooks/useRRHH';

export default function VacacionesPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;

  const [empleadoId, setEmpleadoId] = useState('');
  const { data: empleadosData } = useEmpleados({ localId, limit: 100 });
  const { data: vacData } = useVacacionesByEmpleado(empleadoId);

  const solicitar = useSolicitarVacaciones();
  const aprobar = useAprobarVacaciones();
  const rechazar = useRechazarVacaciones();

  const handleSolicitar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await solicitar.mutateAsync({
      empleadoId: fd.get('empleadoId') as string,
      fechaDesde: fd.get('fechaDesde') as string,
      fechaHasta: fd.get('fechaHasta') as string,
      notas: (fd.get('notas') as string) || undefined,
    });
    e.currentTarget.reset();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Vacaciones</h1>

      {/* Formulario de solicitud */}
      <form onSubmit={handleSolicitar} className="card max-w-lg space-y-4">
        <h3 className="font-semibold">Nueva solicitud de vacaciones</h3>

        <select name="empleadoId" className="input w-full" required>
          <option value="">Seleccionar empleado...</option>
          {empleadosData?.data.map(e => (
            <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Desde *</label>
            <input type="date" name="fechaDesde" className="input w-full" required />
          </div>
          <div>
            <label className="label">Hasta *</label>
            <input type="date" name="fechaHasta" className="input w-full" required />
          </div>
        </div>

        <textarea
          name="notas"
          className="input w-full"
          placeholder="Notas (opcional)"
          rows={2}
        />

        {solicitar.isError && (
          <p className="text-red-600 text-sm">
            Error. Verificá que las fechas no se solapen con otra solicitud.
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={solicitar.isPending}
        >
          {solicitar.isPending ? 'Enviando...' : 'Solicitar vacaciones'}
        </button>
      </form>

      {/* Historial del empleado seleccionado */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <label className="label">Ver historial de:</label>
          <select
            className="input"
            value={empleadoId}
            onChange={e => setEmpleadoId(e.target.value)}
          >
            <option value="">Seleccionar...</option>
            {empleadosData?.data.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        {vacData && (
          <p className="text-sm text-gray-600 mb-2">
            Días tomados (aprobados): <strong>{vacData.resumen.diasTomados}</strong>
          </p>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Desde</th>
              <th>Hasta</th>
              <th>Días</th>
              <th>Estado</th>
              <th>Notas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vacData?.data.map(v => (
              <tr key={v.id}>
                <td>{v.fechaDesde}</td>
                <td>{v.fechaHasta}</td>
                <td>{v.diasHabiles}</td>
                <td>
                  <span
                    className={
                      v.estado === 'APROBADA'
                        ? 'text-green-600'
                        : v.estado === 'RECHAZADA'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }
                  >
                    {v.estado}
                  </span>
                </td>
                <td>{v.notas ?? '—'}</td>
                <td className="flex gap-2">
                  {v.estado === 'PENDIENTE' && (
                    <>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => aprobar.mutate(v.id)}
                      >
                        Aprobar
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() =>
                          rechazar.mutate({
                            id: v.id,
                            motivo: 'Rechazado por administración',
                          })
                        }
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 6. Referencia de endpoints

| Método  | Endpoint                                           | Descripción                            | Rol        |
| ------- | -------------------------------------------------- | -------------------------------------- | ---------- |
| `GET`   | `/api/v1/empleados`                                | Listar empleados (paginado + búsqueda) | Todos      |
| `GET`   | `/api/v1/empleados/:id`                            | Detalle con `_count`                   | Todos      |
| `GET`   | `/api/v1/empleados/:id/resumen-horas?mes=&anio=`   | Resumen mensual horas/asistencias      | Todos      |
| `POST`  | `/api/v1/empleados?localId=UUID`                   | Crear empleado                         | Admin      |
| `PATCH` | `/api/v1/empleados/:id`                            | Actualizar empleado                    | Admin      |
| `GET`   | `/api/v1/asistencias?empleadoId=&fecha=`           | Listar asistencias                     | Todos      |
| `POST`  | `/api/v1/asistencias`                              | Registrar asistencia                   | Todos      |
| `GET`   | `/api/v1/horas?empleadoId=`                        | Listar registros de horas              | Todos      |
| `POST`  | `/api/v1/horas`                                    | Registrar horas                        | Todos      |
| `GET`   | `/api/v1/liquidaciones`                            | Listar liquidaciones                   | Todos      |
| `GET`   | `/api/v1/liquidaciones/:id`                        | Detalle de liquidación                 | Todos      |
| `POST`  | `/api/v1/liquidaciones`                            | Crear liquidación                      | Admin      |
| `PATCH` | `/api/v1/liquidaciones/:id/aprobar`                | Aprobar liquidación                    | Admin      |
| `GET`   | `/api/v1/vacaciones/empleado/:id`                  | Historial vacaciones de un empleado    | Todos      |
| `POST`  | `/api/v1/vacaciones`                               | Solicitar vacaciones                   | Todos      |
| `PATCH` | `/api/v1/vacaciones/:id/aprobar`                   | Aprobar solicitud                      | Admin      |
| `PATCH` | `/api/v1/vacaciones/:id/rechazar`                  | Rechazar solicitud (body: `{motivo}`)  | Admin      |

---

## 7. Errores frecuentes

| Situación                                      | Código | Causa                                              |
| ---------------------------------------------- | ------ | -------------------------------------------------- |
| Crear empleado con `code` duplicado            | 409    | Ya existe ese código en la empresa                 |
| Registrar asistencia con misma fecha/empleado  | 5xx    | Unique constraint `[empleadoId, fecha]`            |
| Registrar horas con misma fecha/empleado       | 5xx    | Unique constraint `[empleadoId, fecha]`            |
| Crear liquidación con mismo periodo/empleado   | 400    | Ya existe liquidación para ese período             |
| Aprobar liquidación ya aprobada                | 404    | El backend busca con `estado: BORRADOR`            |
| Crear vacaciones con solapamiento              | 400    | Se solapa con PENDIENTE o APROBADA                 |
| Aprobar/rechazar vacaciones no pendientes      | 404    | El backend busca con `estado: PENDIENTE`           |
| `POST /empleados` sin `?localId=`              | 400    | `localId` es requerido como query param            |

---

## 8. Resumen de discrepancias: docs vs código real

| Campo docs                | Campo real         | Entidad      |
| ------------------------- | ------------------ | ------------ |
| `legajo`                  | `code`             | Empleado     |
| `apellido` + `nombre`     | `name`             | Empleado     |
| `telefono`                | `phone`            | Empleado     |
| `cargo`                   | `position`         | Empleado     |
| `categoria: CategoriaLaboral` | `department` (string libre) | Empleado |
| `salarioBase`             | `salary`           | Empleado     |
| `fechaIngreso`            | `hireDate`         | Empleado     |
| `estado: EstadoEmpleado`  | `active: boolean`  | Empleado     |
| `fechaEgreso`             | **no existe**      | Empleado     |
| `estado: EstadoAsistencia`| `ausente` + `justificado` (booleans) | Asistencia |
| `horaEntrada`             | `entrada`          | Asistencia   |
| `horaSalida`              | `salida`           | Asistencia   |
| `observaciones`           | `notas`            | Asistencia, Liquidacion, Vacacion |
| `concepto`                | `descripcion`      | RegistroHoras |
| `periodoDesde` + `periodoHasta` | `periodo: "YYYY-MM"` | Liquidacion |
| `conceptos: []` (array)   | `sueldobruto` + `deducciones` (campos directos) | Liquidacion |
| `totalBruto`              | `sueldobruto`      | Liquidacion  |
| `totalDescuentos`         | `deducciones`      | Liquidacion  |
| `totalNeto`               | `sueldoNeto`       | Liquidacion  |
