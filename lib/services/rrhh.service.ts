import { apiClient } from "@/lib/api-client";
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
} from "@/lib/types/rrhh";

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  localId?: string;
}

// ─── Empleados ───────────────────────────────────────────────────────────────

export const empleadosService = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedEmpleados>("/empleados", { params }),

  getById: (id: string) =>
    apiClient.get<{ data: Empleado }>(`/empleados/${id}`),

  getResumenHoras: (id: string, mes: number, anio: number) =>
    apiClient.get<{ data: ResumenHoras }>(`/empleados/${id}/resumen-horas`, {
      params: { mes, anio },
    }),

  create: (dto: CreateEmpleadoDto, localId: string) =>
    apiClient.post<{ data: Empleado }>("/empleados", dto, {
      params: { localId },
    }),

  update: (id: string, dto: UpdateEmpleadoDto) =>
    apiClient.patch<{ data: Empleado }>(`/empleados/${id}`, dto),
};

// ─── Asistencias ─────────────────────────────────────────────────────────────

export const asistenciasService = {
  getAll: (
    params?: PaginationParams & { empleadoId?: string; fecha?: string },
  ) => apiClient.get<PaginatedAsistencias>("/asistencias", { params }),

  create: (dto: CreateAsistenciaDto) =>
    apiClient.post<{ data: Asistencia }>("/asistencias", dto),
};

// ─── Horas ───────────────────────────────────────────────────────────────────

export const horasService = {
  getAll: (params?: PaginationParams & { empleadoId?: string }) =>
    apiClient.get<PaginatedHoras>("/horas", { params }),

  create: (dto: CreateRegistroHorasDto) =>
    apiClient.post<{ data: RegistroHoras }>("/horas", dto),
};

// ─── Liquidaciones ───────────────────────────────────────────────────────────

export const liquidacionesService = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedLiquidaciones>("/liquidaciones", { params }),

  getById: (id: string) =>
    apiClient.get<{ data: Liquidacion }>(`/liquidaciones/${id}`),

  create: (dto: CreateLiquidacionDto) =>
    apiClient.post<{ data: Liquidacion }>("/liquidaciones", dto),

  aprobar: (id: string) =>
    apiClient.patch<{ data: Liquidacion }>(`/liquidaciones/${id}/aprobar`),
};

// ─── Vacaciones ──────────────────────────────────────────────────────────────

export const vacacionesService = {
  getByEmpleado: (empleadoId: string) =>
    apiClient.get<{ data: Vacacion[]; resumen: { diasTomados: number } }>(
      `/vacaciones/empleado/${empleadoId}`,
    ),

  create: (dto: CreateVacacionDto) =>
    apiClient.post<{ data: Vacacion }>("/vacaciones", dto),

  aprobar: (id: string) =>
    apiClient.patch<{ data: Vacacion }>(`/vacaciones/${id}/aprobar`),

  rechazar: (id: string, motivo: string) =>
    apiClient.patch<{ data: Vacacion }>(`/vacaciones/${id}/rechazar`, {
      motivo,
    }),
};
