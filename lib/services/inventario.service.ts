import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  PaginatedResponse,
  Categoria,
  CreateCategoriaDto,
  UpdateCategoriaDto,
  Producto,
  CreateProductoDto,
  UpdateProductoDto,
  FilterProductoDto,
  Deposito,
  CreateDepositoDto,
  UpdateDepositoDto,
  StockItem,
  StockPorProducto,
  AlertaStock,
  AjusteStockDto,
  TransferenciaStockDto,
  MovimientoStock,
} from "@/lib/api-types";

export interface FilterCategoriaDto {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
}

// ── Categorías ────────────────────────────────────────────────

export const categoriasService = {
  getAll: (params?: FilterCategoriaDto) =>
    apiClient
      .get<PaginatedResponse<Categoria>>("/categorias", { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<Categoria>>(`/categorias/${id}`)
      .then((r) => r.data.data),

  create: (dto: CreateCategoriaDto) =>
    apiClient
      .post<ApiResponse<Categoria>>("/categorias", dto)
      .then((r) => r.data.data),

  update: (id: string, dto: UpdateCategoriaDto) =>
    apiClient
      .patch<ApiResponse<Categoria>>(`/categorias/${id}`, dto)
      .then((r) => r.data.data),
};

// ── Productos ─────────────────────────────────────────────────

export const productosService = {
  getAll: (params?: FilterProductoDto) =>
    apiClient
      .get<PaginatedResponse<Producto>>("/productos", { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<Producto>>(`/productos/${id}`)
      .then((r) => r.data.data),

  create: (dto: CreateProductoDto) =>
    apiClient
      .post<ApiResponse<Producto>>("/productos", dto)
      .then((r) => r.data.data),

  update: (id: string, dto: UpdateProductoDto) =>
    apiClient
      .patch<ApiResponse<Producto>>(`/productos/${id}`, dto)
      .then((r) => r.data.data),
};

// ── Depósitos ─────────────────────────────────────────────────

export const depositosService = {
  getAll: (params?: { localId?: string; search?: string }) =>
    apiClient
      .get<PaginatedResponse<Deposito>>("/depositos", { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<Deposito>>(`/depositos/${id}`)
      .then((r) => r.data.data),

  create: (dto: CreateDepositoDto) =>
    apiClient
      .post<ApiResponse<Deposito>>("/depositos", dto)
      .then((r) => r.data.data),

  update: (id: string, dto: UpdateDepositoDto) =>
    apiClient
      .patch<ApiResponse<Deposito>>(`/depositos/${id}`, dto)
      .then((r) => r.data.data),
};

// ── Stock ─────────────────────────────────────────────────────

export const stockService = {
  getByLocal: (localId: string) =>
    apiClient
      .get<ApiResponse<StockItem[]>>(`/inventario/stock/${localId}`)
      .then((r) => r.data.data),

  getByProducto: (productoId: string) =>
    apiClient
      .get<
        ApiResponse<StockPorProducto>
      >(`/inventario/stock/producto/${productoId}`)
      .then((r) => r.data.data),

  getAlertas: (localId?: string) =>
    apiClient
      .get<ApiResponse<AlertaStock[]>>("/inventario/alertas", {
        params: localId ? { localId } : {},
      })
      .then((r) => r.data.data),

  ajustar: (dto: AjusteStockDto, localId: string) =>
    apiClient
      .post<ApiResponse<MovimientoStock>>(`/inventario/ajuste`, dto, {
        params: { localId },
      })
      .then((r) => r.data.data),

  transferir: (dto: TransferenciaStockDto, localOrigenId: string) =>
    apiClient
      .post<ApiResponse<MovimientoStock>>("/inventario/transferencia", dto, {
        params: { localOrigenId },
      })
      .then((r) => r.data.data),
};

// ── Movimientos ───────────────────────────────────────────────

export const movimientosService = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    localId?: string;
    tipo?: string;
    search?: string;
  }) =>
    apiClient
      .get<PaginatedResponse<MovimientoStock>>("/movimientos-stock", { params })
      .then((r) => r.data),

  getByProducto: (productoId: string) =>
    apiClient
      .get<
        PaginatedResponse<MovimientoStock>
      >(`/movimientos-stock/producto/${productoId}`)
      .then((r) => r.data),
};
