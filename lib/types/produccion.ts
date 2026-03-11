import type { TipoProducto } from "@/lib/api-types";

export type { TipoProducto };

// ─── MaterialProduccion ──────────────────────────────────────────────────────

export interface MaterialProduccion {
  id: string;
  empresaId: string;
  localId: string;
  code: string;
  nombre: string;
  tipo: TipoProducto;
  unidad: string;
  stockActual?: number;
  stockMinimo?: number;
  stockMaximo?: number;
  costoUnitario?: number;
  proveedorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialProduccionDto {
  code: string;
  nombre: string;
  tipo: TipoProducto;
  unidad: string;
  stockActual?: number;
  stockMinimo?: number;
  stockMaximo?: number;
  costoUnitario?: number;
  proveedorId?: string;
}

export type UpdateMaterialProduccionDto = Partial<CreateMaterialProduccionDto>;

// ─── BOM (Lista de Materiales) ───────────────────────────────────────────────

export interface BomItem {
  id: string;
  BOMId: string;
  materialId: string;
  cantidad: number;
  unidad?: string;
  material?: Pick<
    MaterialProduccion,
    "id" | "code" | "nombre" | "costoUnitario"
  >;
}

export interface BOM {
  id: string;
  empresaId: string;
  localId: string;
  code: string;
  productoId: string;
  cantidad: number;
  unidad: string;
  version?: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  producto?: { id: string; name: string; code: string };
  materiales?: BomItem[];
  costoEstimado?: number;
}

export interface BomItemDto {
  materialId: string;
  cantidad: number;
  unidad?: string;
}

export interface CreateBomDto {
  code: string;
  productoId: string;
  cantidad: number;
  unidad: string;
  version?: number;
  items: BomItemDto[];
}

// ─── OrdenProduccion ─────────────────────────────────────────────────────────

export type EstadoOrdenProduccion =
  | "PLANIFICADA"
  | "EN_PROCESO"
  | "COMPLETADA"
  | "CANCELADA";

export interface MaterialRequerido {
  material: Pick<
    MaterialProduccion,
    "id" | "code" | "nombre" | "costoUnitario"
  >;
  cantidadPorUnidad: number;
  cantidadTotal: number;
  unidad?: string;
}

export interface OrdenProduccion {
  id: string;
  empresaId: string;
  localId: string;
  numero: number;
  bomId: string;
  cantidadPlanificada: number;
  cantidadRealizada?: number;
  fechaFinPlanificada: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado: EstadoOrdenProduccion;
  operador?: string;
  costoManoObra?: number;
  notas?: string;
  createdAt: string;
  updatedAt: string;
  bom?: {
    producto: { name: string; code: string };
  };
  materialesRequeridos?: MaterialRequerido[];
}

export interface CreateOrdenProduccionDto {
  bomId: string;
  cantidadPlanificada: number;
  fechaFinPlanificada: string;
  operador?: string;
  notas?: string;
  costoManoObra?: number;
}

export interface FinalizarOrdenDto {
  cantidadRealizada: number;
}

export interface CancelarOrdenDto {
  motivo: string;
}

// ─── Planificacion ───────────────────────────────────────────────────────────

export interface CalendarioOrden {
  id: string;
  numero: number;
  estado: EstadoOrdenProduccion;
  fechaFinPlanificada: string;
  cantidadPlanificada: number;
  bom: { producto: { name: string; code: string } };
}

export interface AlertaMaterial {
  material: Pick<MaterialProduccion, "id" | "code" | "nombre" | "unidad">;
  stockActual: number;
  demandaPlanificada: number;
  deficit: number;
  suficiente: boolean;
}
