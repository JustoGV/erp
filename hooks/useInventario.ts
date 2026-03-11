import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  categoriasService,
  productosService,
  depositosService,
  stockService,
  movimientosService,
} from "@/lib/services/inventario.service";
import type {
  CreateCategoriaDto,
  UpdateCategoriaDto,
  CreateProductoDto,
  UpdateProductoDto,
  FilterProductoDto,
  CreateDepositoDto,
  UpdateDepositoDto,
  AjusteStockDto,
  TransferenciaStockDto,
} from "@/lib/api-types";

// ── Keys ──────────────────────────────────────────────────────
export const CATEGORIAS_KEY = ["categorias"] as const;
export const PRODUCTOS_KEY = ["productos"] as const;
export const DEPOSITOS_KEY = ["depositos"] as const;
export const STOCK_KEY = ["stock"] as const;
export const MOVIMIENTOS_KEY = ["movimientos-stock"] as const;

// ── Categorías ────────────────────────────────────────────────

export function useCategorias() {
  return useQuery({
    queryKey: CATEGORIAS_KEY,
    queryFn: () => categoriasService.getAll(),
  });
}

export function useCreateCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCategoriaDto) => categoriasService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIAS_KEY }),
  });
}

export function useUpdateCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCategoriaDto }) =>
      categoriasService.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIAS_KEY }),
  });
}

// ── Productos ─────────────────────────────────────────────────

export function useProductos(params?: FilterProductoDto) {
  return useQuery({
    queryKey: [...PRODUCTOS_KEY, params],
    queryFn: () => productosService.getAll(params),
  });
}

export function useProducto(id: string) {
  return useQuery({
    queryKey: [...PRODUCTOS_KEY, id],
    queryFn: () => productosService.getOne(id),
    enabled: !!id,
  });
}

export function useCreateProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProductoDto) => productosService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTOS_KEY }),
  });
}

export function useUpdateProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductoDto }) =>
      productosService.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
      qc.invalidateQueries({ queryKey: STOCK_KEY });
    },
  });
}

// ── Depósitos ─────────────────────────────────────────────────

export function useDepositos(params?: { localId?: string; search?: string }) {
  return useQuery({
    queryKey: [...DEPOSITOS_KEY, params],
    queryFn: () => depositosService.getAll(params),
  });
}

export function useCreateDeposito() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateDepositoDto) => depositosService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: DEPOSITOS_KEY }),
  });
}

export function useUpdateDeposito() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDepositoDto }) =>
      depositosService.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: DEPOSITOS_KEY }),
  });
}

// ── Stock ─────────────────────────────────────────────────────

export function useStockPorLocal(localId: string | null) {
  return useQuery({
    queryKey: [...STOCK_KEY, "local", localId],
    queryFn: () => stockService.getByLocal(localId!),
    enabled: !!localId,
  });
}

export function useStockPorProducto(productoId: string) {
  return useQuery({
    queryKey: [...STOCK_KEY, "producto", productoId],
    queryFn: () => stockService.getByProducto(productoId),
    enabled: !!productoId,
  });
}

export function useAlertasStock(localId?: string) {
  return useQuery({
    queryKey: [...STOCK_KEY, "alertas", localId],
    queryFn: () => stockService.getAlertas(localId),
    refetchInterval: 1000 * 60 * 5,
  });
}

export function useAjustarStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dto, localId }: { dto: AjusteStockDto; localId: string }) =>
      stockService.ajustar(dto, localId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STOCK_KEY });
      qc.invalidateQueries({ queryKey: MOVIMIENTOS_KEY });
    },
  });
}

export function useTransferirStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      dto,
      localOrigenId,
    }: {
      dto: TransferenciaStockDto;
      localOrigenId: string;
    }) => stockService.transferir(dto, localOrigenId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STOCK_KEY });
      qc.invalidateQueries({ queryKey: MOVIMIENTOS_KEY });
    },
  });
}

// ── Movimientos ───────────────────────────────────────────────

export function useMovimientosStock(params?: {
  page?: number;
  limit?: number;
  localId?: string;
  tipo?: string;
}) {
  return useQuery({
    queryKey: [...MOVIMIENTOS_KEY, params],
    queryFn: () => movimientosService.getAll(params),
  });
}

export function useMovimientosPorProducto(productoId: string) {
  return useQuery({
    queryKey: [...MOVIMIENTOS_KEY, "producto", productoId],
    queryFn: () => movimientosService.getByProducto(productoId),
    enabled: !!productoId,
  });
}
