import { apiClient } from "@/lib/api-client";
import type {
  MaterialProduccion,
  CreateMaterialProduccionDto,
  UpdateMaterialProduccionDto,
  BOM,
  CreateBomDto,
  OrdenProduccion,
  CreateOrdenProduccionDto,
  FinalizarOrdenDto,
  CancelarOrdenDto,
  CalendarioOrden,
  AlertaMaterial,
  VerificarMaterialesResponse,
  CalendarioProduccionResponse,
} from "@/lib/types/produccion";

// ─── Materiales de Producción ────────────────────────────────────────────────

export const materialesProduccionService = {
  getAll: () =>
    apiClient.get<{ data: MaterialProduccion[] }>("/materiales-produccion"),

  create: (dto: CreateMaterialProduccionDto, localId: string) =>
    apiClient.post<{ data: MaterialProduccion }>(
      "/materiales-produccion",
      dto,
      {
        params: { localId },
      },
    ),

  update: (id: string, dto: UpdateMaterialProduccionDto) =>
    apiClient.patch<{ data: MaterialProduccion }>(
      `/materiales-produccion/${id}`,
      dto,
    ),
};

// ─── BOMs ────────────────────────────────────────────────────────────────────

export const bomService = {
  getAll: () => apiClient.get<{ data: BOM[] }>("/bom"),

  getById: (id: string) => apiClient.get<{ data: BOM }>(`/bom/${id}`),

  create: (dto: CreateBomDto, localId: string) =>
    apiClient.post<{ data: BOM }>("/bom", dto, { params: { localId } }),
};

// ─── Órdenes de Producción ───────────────────────────────────────────────────

export const ordenesProduccionService = {
  getAll: () =>
    apiClient.get<{ data: OrdenProduccion[] }>("/ordenes-produccion"),

  getById: (id: string) =>
    apiClient.get<{ data: OrdenProduccion }>(`/ordenes-produccion/${id}`),

  create: (dto: CreateOrdenProduccionDto, localId: string) =>
    apiClient.post<{ data: OrdenProduccion }>("/ordenes-produccion", dto, {
      params: { localId },
    }),

  iniciar: (id: string) =>
    apiClient.patch<{ data: OrdenProduccion }>(
      `/ordenes-produccion/${id}/iniciar`,
    ),

  finalizar: (id: string, dto: FinalizarOrdenDto) =>
    apiClient.patch<{ data: OrdenProduccion }>(
      `/ordenes-produccion/${id}/finalizar`,
      dto,
    ),

  cancelar: (id: string, dto: CancelarOrdenDto) =>
    apiClient.patch<{ data: OrdenProduccion }>(
      `/ordenes-produccion/${id}/cancelar`,
      dto,
    ),
};

// ─── Planificación ───────────────────────────────────────────────────────────

export const planificacionService = {
  getCalendario: (desde: string, hasta: string) =>
    apiClient.get<CalendarioProduccionResponse>("/planificacion", {
      params: { desde, hasta },
    }),

  verificarMateriales: () =>
    apiClient.get<VerificarMaterialesResponse>("/planificacion/materiales"),
};
