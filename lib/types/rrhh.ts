// ─── Empleado ───────────────────────────────────────────────────────────────

export interface Empleado {
  id: string;
  empresaId: string;
  localId: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    asistencias: number;
    liquidaciones: number;
    vacaciones: number;
    horas: number;
  };
}

export interface CreateEmpleadoDto {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  active?: boolean;
}

export type UpdateEmpleadoDto = Partial<CreateEmpleadoDto>;

// ─── Asistencia ─────────────────────────────────────────────────────────────

export interface Asistencia {
  id: string;
  empresaId: string;
  empleadoId: string;
  fecha: string;
  entrada?: string;
  salida?: string;
  ausente: boolean;
  justificado: boolean;
  notas?: string;
  createdAt: string;
  empleado?: { id: string; code: string; name: string };
}

export interface CreateAsistenciaDto {
  empleadoId: string;
  fecha: string;
  ausente?: boolean;
  justificado?: boolean;
  entrada?: string;
  salida?: string;
  notas?: string;
}

// ─── RegistroHoras ──────────────────────────────────────────────────────────

export interface RegistroHoras {
  id: string;
  empresaId: string;
  empleadoId: string;
  fecha: string;
  horasNormales: number;
  horasExtra: number;
  descripcion?: string;
  createdAt: string;
  empleado?: { id: string; code: string; name: string };
}

export interface CreateRegistroHorasDto {
  empleadoId: string;
  fecha: string;
  horasNormales: number;
  horasExtra?: number;
  descripcion?: string;
}

// ─── Liquidacion ────────────────────────────────────────────────────────────

export interface Liquidacion {
  id: string;
  empresaId: string;
  empleadoId: string;
  periodo: string;
  sueldobruto: number;
  deducciones: number;
  sueldoNeto: number;
  estado: "BORRADOR" | "APROBADA";
  fechaPago?: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
  empleado?: Pick<Empleado, "id" | "code" | "name" | "position" | "department">;
}

export interface CreateLiquidacionDto {
  empleadoId: string;
  periodo: string;
  sueldobruto: number;
  deducciones?: number;
  fechaPago?: string;
  notas?: string;
}

// ─── Vacacion ────────────────────────────────────────────────────────────────

export interface Vacacion {
  id: string;
  empresaId: string;
  empleadoId: string;
  fechaDesde: string;
  fechaHasta: string;
  diasHabiles: number;
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA";
  aprobadoPor?: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVacacionDto {
  empleadoId: string;
  fechaDesde: string;
  fechaHasta: string;
  notas?: string;
}

// ─── ResumenHoras ────────────────────────────────────────────────────────────

export interface ResumenHoras {
  periodo: string;
  totalHorasNormales: number;
  totalHorasExtra: number;
  diasPresente: number;
  diasAusente: number;
  diasJustificados: number;
}

// ─── Respuestas paginadas ────────────────────────────────────────────────────

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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
