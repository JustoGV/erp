# Fase 03 — Inventario: Productos, Stock y Movimientos

## Objetivo

Conectar el módulo de inventario con el backend real. Reemplazar los stats hardcodeados
de la página resumen, y proveer los tipos, servicios y hooks para Categorías, Productos,
Depósitos, Stock y Movimientos de Stock.

---

## 1. Tipos de la API

Agregar al final de `lib/api-types.ts`:

```typescript
// ── Inventario ────────────────────────────────────────────────

export type TipoProducto =
  | "TERMINADO"
  | "SEMI_TERMINADO"
  | "MATERIA_PRIMA"
  | "INSUMO";

export type TipoMovimientoStock =
  | "ENTRADA"
  | "SALIDA"
  | "TRANSFERENCIA"
  | "AJUSTE_POSITIVO"
  | "AJUSTE_NEGATIVO"
  | "PRODUCCION_ENTRADA"
  | "PRODUCCION_SALIDA";

export interface Categoria {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
  empresaId: string;
  createdAt: string;
}

export interface CreateCategoriaDto {
  name: string;
  description?: string;
}

export interface UpdateCategoriaDto extends Partial<CreateCategoriaDto> {
  active?: boolean;
}

export interface Producto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  tipo: TipoProducto;
  unit: string;
  cost: number;
  price: number;
  minStock: number;
  active: boolean;
  empresaId: string;
  categoriaId?: string | null;
  categoria?: Pick<Categoria, "id" | "name"> | null;
  // Campos calculados que el backend agrega en listado:
  stockTotal?: number;
  alertaStockBajo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductoDto {
  code: string;
  name: string;
  description?: string;
  tipo: TipoProducto;
  unit: string;
  cost: number;
  price: number;
  minStock: number;
  categoriaId?: string;
}

export interface UpdateProductoDto extends Partial<CreateProductoDto> {
  active?: boolean;
}

export interface FilterProductoDto {
  page?: number;
  limit?: number;
  search?: string;
  tipo?: TipoProducto;
  categoriaId?: string;
  active?: boolean;
  stockBajo?: boolean;
  localId?: string;
}

export interface Deposito {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  active: boolean;
  localId: string;
  empresaId: string;
  createdAt: string;
}

export interface CreateDepositoDto {
  code: string;
  name: string;
  localId: string;
  address?: string;
}

export interface UpdateDepositoDto extends Partial<CreateDepositoDto> {
  active?: boolean;
}

// Stock de un producto en un local/depósito concreto
export interface StockItem {
  id: string;
  cantidad: number;
  productoId: string;
  localId: string;
  depositoId?: string | null;
  empresaId: string;
  producto?: {
    id: string;
    code: string;
    name: string;
    unit: string;
    minStock: number;
    price: number;
    cost: number;
  };
  deposito?: { id: string; name: string } | null;
  local?: { id: string; name: string; city?: string | null };
  // Campos calculados:
  alertaStockBajo?: boolean;
  valorTotal?: number;
}

export interface StockPorProducto {
  stockPorLocal: StockItem[];
  stockTotal: number;
}

export interface AlertaStock {
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  localId: string;
  localNombre: string;
  stockActual: number;
  stockMinimo: number;
  unidad: string;
  diferencia: number;
}

export interface AjusteStockDto {
  productoId: string;
  tipo: "AJUSTE_POSITIVO" | "AJUSTE_NEGATIVO";
  cantidad: number;
  depositoId?: string;
  observaciones: string;
}

export interface TransferenciaStockDto {
  productoId: string;
  localDestinoId: string;
  cantidad: number;
  observaciones?: string;
}

export interface MovimientoStock {
  id: string;
  tipo: TipoMovimientoStock;
  cantidad: number;
  productoId: string;
  localId: string;
  depositoId?: string | null;
  empresaId: string;
  usuarioId: string;
  observaciones?: string | null;
  referencia?: string | null;
  createdAt: string;
  producto?: Pick<Producto, "id" | "code" | "name" | "unit">;
  local?: { id: string; name: string };
}
```

---

## 2. Servicio API

Crear `lib/services/inventario.service.ts`:

```typescript
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

// ── Categorías ────────────────────────────────────────────────

export const categoriasService = {
  getAll: () =>
    apiClient
      .get<ApiResponse<Categoria[]>>("/categorias")
      .then((r) => r.data.data),

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
  // Stock de todos los productos en un local
  getByLocal: (localId: string) =>
    apiClient
      .get<ApiResponse<StockItem[]>>(`/inventario/stock/${localId}`)
      .then((r) => r.data.data),

  // Stock por local de un producto específico
  getByProducto: (productoId: string) =>
    apiClient
      .get<
        ApiResponse<StockPorProducto>
      >(`/inventario/stock/producto/${productoId}`)
      .then((r) => r.data.data),

  // Alertas de stock bajo (con filtro opcional por local)
  getAlertas: (localId?: string) =>
    apiClient
      .get<ApiResponse<AlertaStock[]>>("/inventario/alertas", {
        params: localId ? { localId } : {},
      })
      .then((r) => r.data.data),

  // Ajuste manual de stock
  ajustar: (dto: AjusteStockDto, localId: string) =>
    apiClient
      .post<ApiResponse<MovimientoStock>>(`/inventario/ajuste`, dto, {
        params: { localId },
      })
      .then((r) => r.data.data),

  // Transferencia entre locales
  transferir: (dto: TransferenciaStockDto, localOrigenId: string) =>
    apiClient
      .post<ApiResponse<MovimientoStock>>("/inventario/transferencia", dto, {
        params: { localId: localOrigenId },
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
```

---

## 3. Hooks React Query

Crear `hooks/useInventario.ts`:

```typescript
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
    // Refrescar cada 5 minutos automáticamente
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
```

---

## 4. Actualizar la página resumen de inventario

La página `app/(dashboard)/inventario/page.tsx` tiene stats hardcodeados
(`'521 productos'`, `'12 alertas activas'`, etc.). Reemplazar con datos reales:

```typescript
"use client";

import Link from "next/link";
import {
  Package,
  Box,
  ArrowRightLeft,
  BarChart3,
  AlertTriangle,
  Boxes,
} from "lucide-react";
import {
  useProductos,
  useAlertasStock,
  useDepositos,
  useMovimientosStock,
} from "@/hooks/useInventario";
import { useLocal } from "@/contexts/LocalContext";

export default function InventarioResumenPage() {
  const { selectedLocal } = useLocal();
  const localId = selectedLocal?.id;

  const { data: productosData } = useProductos({ limit: 1 });
  const { data: alertas } = useAlertasStock(localId);
  const { data: depositosData } = useDepositos(
    localId ? { localId } : undefined,
  );
  const { data: movimientosData } = useMovimientosStock({ limit: 1 });

  const totalProductos = productosData?.meta.total ?? "...";
  const totalAlertas = alertas?.length ?? "...";
  const totalDepositos = depositosData?.meta.total ?? "...";
  const totalMovimientos = movimientosData?.meta.total ?? "...";

  const menuItems = [
    {
      href: "/inventario/productos",
      icon: Package,
      title: "Productos",
      description: "Catálogo de productos y artículos",
      color: "bg-orange-500",
      stats: `${totalProductos} productos`,
    },
    {
      href: "/inventario/depositos",
      icon: Box,
      title: "Depósitos",
      description: "Gestión de depósitos y ubicaciones",
      color: "bg-amber-500",
      stats: `${totalDepositos} depósitos`,
    },
    {
      href: "/inventario/movimientos",
      icon: ArrowRightLeft,
      title: "Movimientos",
      description: "Ingresos, egresos y transferencias",
      color: "bg-blue-500",
      stats: `${totalMovimientos} movimientos`,
    },
    {
      href: "/inventario/stock",
      icon: Boxes,
      title: "Stock",
      description: "Consulta de existencias por depósito",
      color: "bg-green-500",
      stats: "Ver stock actual",
    },
    {
      href: "/inventario/alertas",
      icon: AlertTriangle,
      title: "Alertas",
      description: "Stock bajo y punto de pedido",
      color: totalAlertas > 0 ? "bg-red-500" : "bg-gray-400",
      stats: `${totalAlertas} alertas activas`,
    },
    {
      href: "/inventario/valorizacion",
      icon: BarChart3,
      title: "Valorización",
      description: "Valorización de existencias",
      color: "bg-purple-500",
      stats: "Costo y precio",
    },
  ];

  // ... resto del JSX igual al actual (el map de menuItems no cambia)
}
```

> **Nota:** Solo reemplazar el bloque de `const menuItems` y agregar los 4 hooks al inicio.
> El JSX del return (el `map`) queda exactamente igual.

---

## 5. Guía de uso en páginas de detalle

### Página de productos (`/inventario/productos/page.tsx`)

```typescript
// Patrón para listar con filtros y paginación
const [filtros, setFiltros] = useState<FilterProductoDto>({
  page: 1,
  limit: 20,
});
const { data, isLoading } = useProductos(filtros);
// data.data → array de Producto
// data.meta → { page, limit, total, totalPages }
```

### Página de alertas (`/inventario/alertas/page.tsx`)

```typescript
const { selectedLocal } = useLocal();
const { data: alertas, isLoading } = useAlertasStock(selectedLocal?.id);
// alertas → AlertaStock[]
// Cada item tiene: productoNombre, stockActual, stockMinimo, diferencia
```

### Ajuste de stock (desde cualquier página)

```typescript
const ajustar = useAjustarStock();
const { selectedLocal } = useLocal();

await ajustar.mutateAsync({
  dto: {
    productoId: "uuid",
    tipo: "AJUSTE_POSITIVO",
    cantidad: 50,
    observaciones: "Corrección de conteo",
  },
  localId: selectedLocal!.id,
});
```

### Transferencia entre locales

```typescript
const transferir = useTransferirStock();

await transferir.mutateAsync({
  dto: {
    productoId: "uuid",
    localDestinoId: "uuid-destino",
    cantidad: 20,
    observaciones: "Traslado entre locales",
  },
  localOrigenId: selectedLocal!.id,
});
```

---

## Resumen de archivos creados/modificados

| Archivo                               | Acción                                                          |
| ------------------------------------- | --------------------------------------------------------------- |
| `lib/api-types.ts`                    | **Modificar** — agregar tipos de inventario                     |
| `lib/services/inventario.service.ts`  | **Crear** — servicios API para todos los recursos de inventario |
| `hooks/useInventario.ts`              | **Crear** — todos los hooks React Query de inventario           |
| `app/(dashboard)/inventario/page.tsx` | **Modificar** — stats dinámicos en lugar de hardcodeados        |

---

## Siguiente fase

→ **Fase 04 — Ventas** (clientes, presupuestos, pedidos, facturas, cobranzas)
