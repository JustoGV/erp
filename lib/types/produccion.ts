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
  active?: boolean;
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

export type UpdateMaterialProduccionDto = Partial<CreateMaterialProduccionDto> & { active?: boolean };

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
  productoNombre?: string;
  cantidad: number;
  unidad: string;
  version?: number;
  activo: boolean;
  costoTotal?: number;
  costoEstimado?: number;
  createdAt: string;
  updatedAt: string;
  producto?: { id: string; name: string; code: string };
  materiales?: BomItem[];
  _count?: { materiales: number };
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
  numero?: number;
  code?: string;
  bomId: string;
  productoId?: string;
  productoNombre?: string;
  cantidadPlanificada: number;
  cantidadProducida?: number;
  cantidadRealizada?: number;
  fechaFinPlanificada: string;
  fechaInicio?: string;
  fechaFinReal?: string;
  fechaFin?: string;
  estado: EstadoOrdenProduccion;
  operador?: string;
  costoManoObra?: number;
  costoMateriales?: number;
  costoTotal?: number;
  notas?: string;
  createdAt: string;
  updatedAt: string;
  bom?: {
    id?: string;
    code?: string;
    producto: { id?: string; name: string; code: string };
    materiales?: BomItem[];
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
  code: string;
  numero?: number;
  productoNombre?: string;
  estado: EstadoOrdenProduccion;
  fechaInicio?: string;
  fechaFinPlanificada: string;
  cantidadPlanificada: number;
  bom?: { producto: { name: string; code: string } };
}

export interface AlertaMaterial {
  material: Pick<MaterialProduccion, "id" | "code" | "nombre"> & { unidad?: string };
  demandaTotal: number;
  stockDisponible: number;
  suficiente: boolean;
  diferencia: number;
}

export interface VerificarMaterialesResponse {
  data: AlertaMaterial[];
  criticos: AlertaMaterial[];
  tieneFaltantes: boolean;
}

export interface CalendarioProduccionResponse {
  data: CalendarioOrden[];
  resumen: { pendientes: number; enProceso: number; completadas: number };
}
