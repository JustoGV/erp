import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  PaginatedResponse,
  Proveedor,
  CreateProveedorDto,
  UpdateProveedorDto,
  DeudaProveedorResponse,
  Requerimiento,
  CreateRequerimientoDto,
  OrdenCompra,
  CreateOrdenCompraDto,
  RecepcionCompra,
  CreateRecepcionDto,
  PagoProveedor,
  CreatePagoProveedorDto,
} from "@/lib/api-types";

// ── Proveedores ───────────────────────────────────────────────

export const proveedoresService = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    localId?: string;
    search?: string;
  }) =>
    apiClient
      .get<PaginatedResponse<Proveedor>>("/proveedores", { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<Proveedor>>(`/proveedores/${id}`)
      .then((r) => r.data),

  getDeuda: (id: string) =>
    apiClient
      .get<ApiResponse<DeudaProveedorResponse>>(`/proveedores/${id}/deuda`)
      .then((r) => r.data),

  create: (dto: CreateProveedorDto) =>
    apiClient
      .post<ApiResponse<Proveedor>>("/proveedores", dto)
      .then((r) => r.data),

  update: (id: string, dto: UpdateProveedorDto) =>
    apiClient
      .patch<ApiResponse<Proveedor>>(`/proveedores/${id}`, dto)
      .then((r) => r.data),
};

// ── Requerimientos ────────────────────────────────────────────

export const requerimientosService = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    localId?: string;
    search?: string;
  }) =>
    apiClient
      .get<PaginatedResponse<Requerimiento>>("/requerimientos", { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<Requerimiento>>(`/requerimientos/${id}`)
      .then((r) => r.data),

  create: (dto: CreateRequerimientoDto, localId: string) =>
    apiClient
      .post<ApiResponse<Requerimiento>>("/requerimientos", dto, {
        params: { localId },
      })
      .then((r) => r.data),

  autorizar: (id: string) =>
    apiClient
      .patch<ApiResponse<Requerimiento>>(`/requerimientos/${id}/autorizar`)
      .then((r) => r.data),
};

// ── Órdenes de Compra ─────────────────────────────────────────

export const ordenesCompraService = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    localId?: string;
    search?: string;
  }) =>
    apiClient
      .get<PaginatedResponse<OrdenCompra>>("/ordenes-compra", { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<OrdenCompra>>(`/ordenes-compra/${id}`)
      .then((r) => r.data),

  create: (dto: CreateOrdenCompraDto, localId: string) =>
    apiClient
      .post<ApiResponse<OrdenCompra>>("/ordenes-compra", dto, {
        params: { localId },
      })
      .then((r) => r.data),

  aprobar: (id: string) =>
    apiClient
      .patch<ApiResponse<OrdenCompra>>(`/ordenes-compra/${id}/aprobar`)
      .then((r) => r.data),
};

// ── Recepciones ───────────────────────────────────────────────

export const recepcionesService = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    localId?: string;
    search?: string;
  }) =>
    apiClient
      .get<PaginatedResponse<RecepcionCompra>>("/recepciones", { params })
      .then((r) => r.data),

  create: (dto: CreateRecepcionDto) =>
    apiClient
      .post<
        ApiResponse<{ recepcion: RecepcionCompra; ordenEstadoNuevo: string }>
      >("/recepciones", dto)
      .then((r) => r.data),
};

// ── Pagos a Proveedores ───────────────────────────────────────

export const pagosProveedorService = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    localId?: string;
    search?: string;
  }) =>
    apiClient
      .get<PaginatedResponse<PagoProveedor>>("/pagos-proveedor", { params })
      .then((r) => r.data),

  create: (dto: CreatePagoProveedorDto) =>
    apiClient
      .post<ApiResponse<PagoProveedor>>("/pagos-proveedor", dto)
      .then((r) => r.data),
};
