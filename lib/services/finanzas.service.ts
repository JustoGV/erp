import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  PaginatedResponse,
  CuentaContable,
  CreateCuentaDto,
  MayorContable,
  AsientoContable,
  CreateAsientoDto,
  CuentaPorCobrar,
  ResumenCxC,
  CuentaPorPagar,
  ResumenCxP,
  CuentaBancaria,
  MovimientoBancario,
  CreateMovimientoBancarioDto,
  CajaLocal,
  MovimientoCaja,
  MovimientoCajaDto,
  Retencion,
  CreateRetencionDto,
} from "@/lib/api-types";

// ── Plan de Cuentas ───────────────────────────────────────────────────────────

export const planCuentasService = {
  getAll: (empresaId?: string) =>
    apiClient.get<ApiResponse<CuentaContable[]>>("/plan-cuentas", {
      params: { empresaId },
    }),

  getOne: (id: string) =>
    apiClient.get<ApiResponse<CuentaContable>>(`/plan-cuentas/${id}`),

  getMayor: (cuentaId: string, params?: { desde?: string; hasta?: string }) =>
    apiClient.get<ApiResponse<MayorContable>>(
      `/plan-cuentas/${cuentaId}/mayor`,
      { params },
    ),

  create: (dto: CreateCuentaDto) =>
    apiClient.post<ApiResponse<CuentaContable>>("/plan-cuentas", dto),
};

// ── Asientos Contables ────────────────────────────────────────────────────────

export const asientosService = {
  getAll: (params?: {
    localId?: string;
    page?: number;
    limit?: number;
    estado?: string;
    desde?: string;
    hasta?: string;
  }) =>
    apiClient.get<PaginatedResponse<AsientoContable>>("/asientos", { params }),

  getOne: (id: string) =>
    apiClient.get<ApiResponse<AsientoContable>>(`/asientos/${id}`),

  create: (dto: CreateAsientoDto, localId: string) =>
    apiClient.post<ApiResponse<AsientoContable>>("/asientos", dto, {
      params: { localId },
    }),

  confirmar: (id: string) =>
    apiClient.patch<ApiResponse<AsientoContable>>(`/asientos/${id}/confirmar`),

  anular: (id: string) =>
    apiClient.patch<ApiResponse<AsientoContable>>(`/asientos/${id}/anular`),
};

// ── Cuentas por Cobrar ────────────────────────────────────────────────────────

export const cuentasCobrarService = {
  getAll: (params?: {
    localId?: string;
    page?: number;
    limit?: number;
    estado?: string;
  }) =>
    apiClient.get<PaginatedResponse<CuentaPorCobrar>>("/cuentas-cobrar", {
      params,
    }),

  getResumen: (localId?: string) =>
    apiClient.get<ApiResponse<ResumenCxC>>("/cuentas-cobrar/resumen", {
      params: { localId },
    }),
};

// ── Cuentas por Pagar ─────────────────────────────────────────────────────────

export const cuentasPagarService = {
  getAll: (params?: {
    localId?: string;
    page?: number;
    limit?: number;
    estado?: string;
  }) =>
    apiClient.get<PaginatedResponse<CuentaPorPagar>>("/cuentas-pagar", {
      params,
    }),

  getResumen: (localId?: string) =>
    apiClient.get<ApiResponse<ResumenCxP>>("/cuentas-pagar/resumen", {
      params: { localId },
    }),
};

// ── Bancos ────────────────────────────────────────────────────────────────────

export const bancosService = {
  getCuentas: () =>
    apiClient.get<ApiResponse<CuentaBancaria[]>>("/bancos/cuentas"),

  getMovimientos: (
    cuentaBancariaId: string,
    params?: { page?: number; limit?: number; desde?: string; hasta?: string },
  ) =>
    apiClient.get<PaginatedResponse<MovimientoBancario>>(
      `/bancos/cuentas/${cuentaBancariaId}/movimientos`,
      { params },
    ),

  registrarMovimiento: (dto: CreateMovimientoBancarioDto) =>
    apiClient.post<ApiResponse<MovimientoBancario>>("/bancos/movimientos", dto),
};

// ── Caja ──────────────────────────────────────────────────────────────────────

export const cajaService = {
  getSaldo: (localId: string) =>
    apiClient.get<ApiResponse<CajaLocal>>(`/caja/${localId}`),

  getMovimientos: (
    localId: string,
    params?: { page?: number; limit?: number; desde?: string; hasta?: string },
  ) =>
    apiClient.get<PaginatedResponse<MovimientoCaja>>(
      `/caja/${localId}/movimientos`,
      { params },
    ),

  registrarMovimiento: (localId: string, dto: MovimientoCajaDto) =>
    apiClient.post<ApiResponse<MovimientoCaja>>(
      `/caja/${localId}/movimientos`,
      dto,
    ),
};

// ── Retenciones ───────────────────────────────────────────────────────────────

export const retencionesService = {
  getAll: (params?: {
    localId?: string;
    page?: number;
    limit?: number;
    tipo?: string;
  }) => apiClient.get<PaginatedResponse<Retencion>>("/retenciones", { params }),

  create: (dto: CreateRetencionDto, localId: string) =>
    apiClient.post<ApiResponse<Retencion>>("/retenciones", dto, {
      params: { localId },
    }),
};
