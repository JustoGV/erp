import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  PaginatedResponse,
  Cliente,
  CreateClienteDto,
  UpdateClienteDto,
  FilterClienteDto,
  SaldosCliente,
  Presupuesto,
  CreatePresupuestoDto,
  EstadoPresupuesto,
  PedidoVenta,
  Factura,
  CreateFacturaDto,
  Cobranza,
  CreateCobranzaDto,
} from "@/lib/api-types";

// ── Clientes ──────────────────────────────────────────────────

export const clientesService = {
  getAll: (params?: FilterClienteDto) =>
    apiClient
      .get<PaginatedResponse<Cliente>>("/clientes", { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient.get<ApiResponse<Cliente>>(`/clientes/${id}`).then((r) => r.data),

  getSaldos: (id: string) =>
    apiClient
      .get<ApiResponse<SaldosCliente>>(`/clientes/${id}/saldos`)
      .then((r) => r.data),

  create: (dto: CreateClienteDto) =>
    apiClient.post<ApiResponse<Cliente>>("/clientes", dto).then((r) => r.data),

  update: (id: string, dto: UpdateClienteDto) =>
    apiClient
      .patch<ApiResponse<Cliente>>(`/clientes/${id}`, dto)
      .then((r) => r.data),
};

// ── Presupuestos ──────────────────────────────────────────────

export const presupuestosService = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    localId?: string;
    search?: string;
  }) =>
    apiClient
      .get<PaginatedResponse<Presupuesto>>("/presupuestos", { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<Presupuesto>>(`/presupuestos/${id}`)
      .then((r) => r.data),

  create: (dto: CreatePresupuestoDto, localId: string) =>
    apiClient
      .post<ApiResponse<Presupuesto>>("/presupuestos", dto, {
        params: { localId },
      })
      .then((r) => r.data),

  convertirAPedido: (id: string) =>
    apiClient
      .post<ApiResponse<PedidoVenta>>(`/presupuestos/${id}/convertir-pedido`)
      .then((r) => r.data),

  cambiarEstado: (id: string, estado: EstadoPresupuesto) =>
    apiClient
      .patch<ApiResponse<Presupuesto>>(`/presupuestos/${id}/estado`, {
        estado,
      })
      .then((r) => r.data),
};

// ── Pedidos ───────────────────────────────────────────────────

export const pedidosService = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    localId?: string;
    search?: string;
  }) =>
    apiClient
      .get<PaginatedResponse<PedidoVenta>>("/pedidos", { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<PedidoVenta>>(`/pedidos/${id}`)
      .then((r) => r.data),

  aprobar: (id: string) =>
    apiClient
      .post<ApiResponse<PedidoVenta>>(`/pedidos/${id}/aprobar`)
      .then((r) => r.data),
};

// ── Facturas ──────────────────────────────────────────────────

export const facturasService = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    localId?: string;
    search?: string;
  }) =>
    apiClient
      .get<PaginatedResponse<Factura>>("/facturas", { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient.get<ApiResponse<Factura>>(`/facturas/${id}`).then((r) => r.data),

  desdePedido: (dto: CreateFacturaDto) =>
    apiClient
      .post<ApiResponse<Factura>>("/facturas/desde-pedido", dto)
      .then((r) => r.data),

  anular: (id: string, motivo: string) =>
    apiClient
      .delete<ApiResponse<Factura>>(`/facturas/${id}/anular`, {
        data: { motivo },
      })
      .then((r) => r.data),
};

// ── Cobranzas ─────────────────────────────────────────────────

export const cobranzasService = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    localId?: string;
    search?: string;
  }) =>
    apiClient
      .get<PaginatedResponse<Cobranza>>("/cobranzas", { params })
      .then((r) => r.data),

  create: (dto: CreateCobranzaDto) =>
    apiClient
      .post<ApiResponse<Cobranza>>("/cobranzas", dto)
      .then((r) => r.data),
};
