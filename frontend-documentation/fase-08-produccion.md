# Fase 08 — Módulo Producción

Conectar el módulo de producción: **Materiales**, **BOMs**, **Órdenes de Producción** y **Planificación**.

> **Discrepancias críticas vs documentación del backend**  
> La documentación habla de `maquinas` y `depositos` en las órdenes — no existen en el backend real.  
> El campo del BOM se llama `productoId` (no `productoTerminadoId`), y el BOM tiene su propio `code`, `cantidad` y `unidad`.  
> Las ordenes NO tienen `depositoId` ni `maquinaId` — tienen `operador`, `costoManoObra` y `fechaFinPlanificada`.

---

## 1. Tipos TypeScript

Crear `lib/types/produccion.ts`:

```typescript
import type { TipoProducto } from "./inventario"; // o definir aquí

// ─── MaterialProduccion ──────────────────────────────────────────────────────

export interface MaterialProduccion {
  id: string;
  empresaId: string;
  localId: string;
  code: string; // único por empresa
  nombre: string;
  tipo: TipoProducto; // 'TERMINADO' | 'SEMI_TERMINADO' | 'MATERIA_PRIMA' | 'INSUMO'
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
  code: string; // obligatorio, único por empresa
  nombre: string; // obligatorio
  tipo: TipoProducto; // obligatorio
  unidad: string; // obligatorio, ej. "kg", "m", "UNI"
  stockActual?: number;
  stockMinimo?: number;
  stockMaximo?: number;
  costoUnitario?: number;
  proveedorId?: string; // UUID opcional
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
  code: string; // ej. "BOM-SILLA-001"
  productoId: string; // ID del producto terminado (inventario)
  cantidad: number; // cantidad producida por lote
  unidad: string; // unidad del producto terminado
  version?: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  // incluido en findOne():
  producto?: { id: string; name: string; code: string };
  materiales?: BomItem[];
  costoEstimado?: number; // calculado: suma(item.cantidad * material.costoUnitario)
}

export interface BomItemDto {
  materialId: string; // UUID del MaterialProduccion
  cantidad: number; // cantidad requerida por lote, >= 0.0001
  unidad?: string; // opcional, ej. "kg"
}

export interface CreateBomDto {
  code: string; // obligatorio, ej. "BOM-SILLA-001"
  productoId: string; // UUID del producto terminado
  cantidad: number; // cantidad de producto producido por lote
  unidad: string; // unidad del producto, ej. "UNI"
  version?: number; // default: 1
  items: BomItemDto[]; // al menos 1 item
}

// ─── OrdenProduccion ─────────────────────────────────────────────────────────
// Estados: PLANIFICADA → EN_PROCESO → COMPLETADA | CANCELADA

export type EstadoOrdenProduccion =
  | "PLANIFICADA"
  | "EN_PROCESO"
  | "COMPLETADA"
  | "CANCELADA";

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
  // incluido en findAll():
  bom?: {
    producto: { name: string; code: string };
  };
  // incluido en findOne():
  materialesRequeridos?: MaterialRequerido[];
}

export interface MaterialRequerido {
  material: Pick<
    MaterialProduccion,
    "id" | "code" | "nombre" | "costoUnitario"
  >;
  cantidadPorUnidad: number;
  cantidadTotal: number; // cantidadPorUnidad * cantidadPlanificada
  unidad?: string;
}

export interface CreateOrdenProduccionDto {
  bomId: string; // UUID del BOM
  cantidadPlanificada: number; // >= 0.001
  fechaFinPlanificada: string; // "YYYY-MM-DD", obligatorio
  operador?: string;
  notas?: string;
  costoManoObra?: number; // >= 0, default: 0
}

export interface FinalizarOrdenDto {
  cantidadRealizada: number; // puede diferir de cantidadPlanificada
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
```

---

## 2. Servicio HTTP

Crear `lib/services/produccion.service.ts`:

```typescript
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
} from "@/lib/types/produccion";

// ─── Materiales de Producción ────────────────────────────────────────────────

export const materialesProduccionService = {
  /** Lista todos los materiales de la empresa. No paginado. */
  getAll: () =>
    apiClient.get<{ data: MaterialProduccion[] }>("/materiales-produccion"),

  /**
   * Crear material de producción. Requiere localId como query param.
   * code único por empresa.
   */
  create: (dto: CreateMaterialProduccionDto, localId: string) =>
    apiClient.post<{ data: MaterialProduccion }>(
      `/materiales-produccion?localId=${localId}`,
      dto,
    ),

  /** Actualizar material (campos parciales). Solo Administrador. */
  update: (id: string, dto: UpdateMaterialProduccionDto) =>
    apiClient.patch<{ data: MaterialProduccion }>(
      `/materiales-produccion/${id}`,
      dto,
    ),
};

// ─── BOMs ────────────────────────────────────────────────────────────────────

export const bomService = {
  /** Lista todos los BOMs de la empresa. */
  getAll: () => apiClient.get<{ data: BOM[] }>("/bom"),

  /**
   * BOM completo con items, materiales y costo estimado.
   * Incluye: bom.materiales[].material y costo estimado calculado.
   */
  getById: (id: string) => apiClient.get<{ data: BOM }>(`/bom/${id}`),

  /**
   * Crear BOM. Requiere localId como query param. Solo Administrador.
   * productoId: UUID de un producto del inventario (módulo inventario).
   * items: al menos 1 BomItemDto.
   */
  create: (dto: CreateBomDto, localId: string) =>
    apiClient.post<{ data: BOM }>(`/bom?localId=${localId}`, dto),
};

// ─── Órdenes de Producción ───────────────────────────────────────────────────

export const ordenesProduccionService = {
  /** Lista todas las órdenes. Incluye bom.producto. */
  getAll: () =>
    apiClient.get<{ data: OrdenProduccion[] }>("/ordenes-produccion"),

  /**
   * Orden con materiales requeridos calculados.
   * materialesRequeridos[].cantidadTotal = cantidadPorUnidad × cantidadPlanificada
   */
  getById: (id: string) =>
    apiClient.get<{ data: OrdenProduccion }>(`/ordenes-produccion/${id}`),

  /**
   * Crear orden. Requiere localId como query param. Solo Administrador.
   * La orden se crea en estado PLANIFICADA.
   */
  create: (dto: CreateOrdenProduccionDto, localId: string) =>
    apiClient.post<{ data: OrdenProduccion }>(
      `/ordenes-produccion?localId=${localId}`,
      dto,
    ),

  /**
   * Iniciar orden: PLANIFICADA → EN_PROCESO.
   * El sistema descuenta automáticamente los materiales del stock.
   * Solo Administrador.
   */
  iniciar: (id: string) =>
    apiClient.patch<{ data: OrdenProduccion }>(
      `/ordenes-produccion/${id}/iniciar`,
    ),

  /**
   * Finalizar orden: EN_PROCESO → COMPLETADA.
   * El sistema ingresa el producto terminado al stock.
   * cantidadRealizada puede diferir de cantidadPlanificada.
   * Solo Administrador.
   */
  finalizar: (id: string, dto: FinalizarOrdenDto) =>
    apiClient.patch<{ data: OrdenProduccion }>(
      `/ordenes-produccion/${id}/finalizar`,
      dto,
    ),

  /**
   * Cancelar orden. Solo Administrador.
   * Si estaba EN_PROCESO, se reintegran los materiales al stock.
   */
  cancelar: (id: string, dto: CancelarOrdenDto) =>
    apiClient.patch<{ data: OrdenProduccion }>(
      `/ordenes-produccion/${id}/cancelar`,
      dto,
    ),
};

// ─── Planificación ───────────────────────────────────────────────────────────

export const planificacionService = {
  /**
   * Calendario de órdenes de producción en un período.
   * @param desde "YYYY-MM-DD"
   * @param hasta "YYYY-MM-DD"
   */
  getCalendario: (desde: string, hasta: string) =>
    apiClient.get<{ data: CalendarioOrden[] }>("/planificacion", {
      params: { desde, hasta },
    }),

  /**
   * Verifica si el stock actual de materiales alcanza para
   * cubrir todas las órdenes en estado PLANIFICADA.
   */
  verificarMateriales: () =>
    apiClient.get<{ data: AlertaMaterial[] }>("/planificacion/materiales"),
};
```

---

## 3. React Query Hooks

Crear `hooks/useProduccion.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  materialesProduccionService,
  bomService,
  ordenesProduccionService,
  planificacionService,
} from "@/lib/services/produccion.service";
import type {
  CreateMaterialProduccionDto,
  UpdateMaterialProduccionDto,
  CreateBomDto,
  CreateOrdenProduccionDto,
  FinalizarOrdenDto,
  CancelarOrdenDto,
} from "@/lib/types/produccion";

export const produccionKeys = {
  materiales: {
    all: ["materiales-produccion"] as const,
  },
  bom: {
    all: ["bom"] as const,
    detail: (id: string) => ["bom", id] as const,
  },
  ordenes: {
    all: ["ordenes-produccion"] as const,
    detail: (id: string) => ["ordenes-produccion", id] as const,
  },
  planificacion: {
    calendario: (desde: string, hasta: string) =>
      ["planificacion", "calendario", desde, hasta] as const,
    materiales: ["planificacion", "materiales"] as const,
  },
};

// ─── Materiales ──────────────────────────────────────────────────────────────

export function useMaterialesProduccion() {
  return useQuery({
    queryKey: produccionKeys.materiales.all,
    queryFn: () => materialesProduccionService.getAll(),
  });
}

export function useCrearMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dto,
      localId,
    }: {
      dto: CreateMaterialProduccionDto;
      localId: string;
    }) => materialesProduccionService.create(dto, localId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: produccionKeys.materiales.all,
      });
    },
  });
}

export function useActualizarMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateMaterialProduccionDto;
    }) => materialesProduccionService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: produccionKeys.materiales.all,
      });
    },
  });
}

// ─── BOMs ────────────────────────────────────────────────────────────────────

export function useBOMs() {
  return useQuery({
    queryKey: produccionKeys.bom.all,
    queryFn: () => bomService.getAll(),
  });
}

export function useBOM(id: string) {
  return useQuery({
    queryKey: produccionKeys.bom.detail(id),
    queryFn: () => bomService.getById(id),
    enabled: !!id,
  });
}

export function useCrearBOM() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dto, localId }: { dto: CreateBomDto; localId: string }) =>
      bomService.create(dto, localId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: produccionKeys.bom.all });
    },
  });
}

// ─── Órdenes de Producción ───────────────────────────────────────────────────

export function useOrdenesProduccion() {
  return useQuery({
    queryKey: produccionKeys.ordenes.all,
    queryFn: () => ordenesProduccionService.getAll(),
  });
}

export function useOrdenProduccion(id: string) {
  return useQuery({
    queryKey: produccionKeys.ordenes.detail(id),
    queryFn: () => ordenesProduccionService.getById(id),
    enabled: !!id,
  });
}

export function useCrearOrden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dto,
      localId,
    }: {
      dto: CreateOrdenProduccionDto;
      localId: string;
    }) => ordenesProduccionService.create(dto, localId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: produccionKeys.ordenes.all });
    },
  });
}

export function useIniciarOrden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordenesProduccionService.iniciar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: produccionKeys.ordenes.all });
    },
  });
}

export function useFinalizarOrden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: FinalizarOrdenDto }) =>
      ordenesProduccionService.finalizar(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: produccionKeys.ordenes.all });
      queryClient.invalidateQueries({
        queryKey: produccionKeys.ordenes.detail(id),
      });
    },
  });
}

export function useCancelarOrden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: CancelarOrdenDto }) =>
      ordenesProduccionService.cancelar(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: produccionKeys.ordenes.all });
    },
  });
}

// ─── Planificación ───────────────────────────────────────────────────────────

export function useCalendarioProduccion(desde: string, hasta: string) {
  return useQuery({
    queryKey: produccionKeys.planificacion.calendario(desde, hasta),
    queryFn: () => planificacionService.getCalendario(desde, hasta),
    enabled: !!desde && !!hasta,
  });
}

export function useVerificarMateriales() {
  return useQuery({
    queryKey: produccionKeys.planificacion.materiales,
    queryFn: () => planificacionService.verificarMateriales(),
  });
}
```

---

## 4. Actualizar `app/(dashboard)/produccion/page.tsx`

Reemplazar los stats hardcodeados con datos reales:

```tsx
"use client";

import Link from "next/link";
import {
  Factory,
  FileText,
  Package,
  ClipboardCheck,
  TrendingUp,
} from "lucide-react";
import {
  useOrdenesProduccion,
  useMaterialesProduccion,
  useBOMs,
} from "@/hooks/useProduccion";

export default function ProduccionResumenPage() {
  const { data: ordenesData } = useOrdenesProduccion();
  const { data: materialesData } = useMaterialesProduccion();
  const { data: bomsData } = useBOMs();

  const ordenesActivas =
    ordenesData?.data.filter(
      (o) => o.estado === "PLANIFICADA" || o.estado === "EN_PROCESO",
    ).length ?? 0;

  const totalMateriales = materialesData?.data.length ?? 0;
  const totalBOMs = bomsData?.data.length ?? 0;

  const menuItems = [
    {
      href: "/produccion/ordenes",
      icon: FileText,
      title: "Órdenes de Producción",
      description: "Gestión de órdenes de manufactura",
      color: "bg-blue-500",
      stats: `${ordenesActivas} órdenes activas`,
    },
    {
      href: "/produccion/bom",
      icon: ClipboardCheck,
      title: "Lista de Materiales (BOM)",
      description: "Estructuras y fórmulas de productos",
      color: "bg-green-500",
      stats: `${totalBOMs} BOMs definidas`,
    },
    {
      href: "/produccion/materiales",
      icon: Package,
      title: "Materiales",
      description: "Insumos y materias primas",
      color: "bg-purple-500",
      stats: `${totalMateriales} materiales`,
    },
    {
      href: "/produccion/planificacion",
      icon: TrendingUp,
      title: "Planificación",
      description: "Plan de producción y verificación de stock",
      color: "bg-indigo-500",
      stats: "Ver plan",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Módulo de Producción
        </h1>
        <p className="text-gray-600 mt-1">Gestión de manufactura y procesos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 border border-gray-200 hover:border-blue-300"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 ${item.color} text-white rounded-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.description}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {item.stats}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Factory className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Control de Manufactura
            </h3>
            <p className="text-sm text-blue-700">
              El módulo de producción permite planificar, ejecutar y controlar
              órdenes de manufactura, consumo de materiales y tiempos de
              producción.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

> **Nota:** La página de `/produccion/maquinas` del frontend no tiene endpoint en el backend — el módulo `materiales-produccion` reemplaza esa funcionalidad. Podés redirigir ese link a `/produccion/materiales` o eliminarlo.

---

## 5. Patrones de uso por subpágina

### `app/(dashboard)/produccion/materiales/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { useLocal } from "@/contexts/LocalContext";
import {
  useMaterialesProduccion,
  useCrearMaterial,
  useActualizarMaterial,
} from "@/hooks/useProduccion";
import type { TipoProducto } from "@/lib/types/inventario"; // o definir localmente

const TIPOS: TipoProducto[] = [
  "MATERIA_PRIMA",
  "INSUMO",
  "SEMI_TERMINADO",
  "TERMINADO",
];

export default function MaterialesPage() {
  const { selectedLocal } = useLocal();
  const { data, isLoading } = useMaterialesProduccion();
  const crear = useCrearMaterial();

  const [form, setForm] = useState({
    code: "",
    nombre: "",
    tipo: "MATERIA_PRIMA" as TipoProducto,
    unidad: "",
    stockActual: 0,
    stockMinimo: 0,
    costoUnitario: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocal?.id) return;
    await crear.mutateAsync({ dto: form, localId: selectedLocal.id });
    setForm({
      code: "",
      nombre: "",
      tipo: "MATERIA_PRIMA",
      unidad: "",
      stockActual: 0,
      stockMinimo: 0,
      costoUnitario: 0,
    });
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Materiales de Producción</h1>

      <form onSubmit={handleSubmit} className="card max-w-2xl space-y-4">
        <h3 className="font-semibold">Nuevo material</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Código *</label>
            <input
              className="input w-full"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Nombre *</label>
            <input
              className="input w-full"
              value={form.nombre}
              onChange={(e) =>
                setForm((f) => ({ ...f, nombre: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="label">Tipo *</label>
            <select
              className="input w-full"
              value={form.tipo}
              onChange={(e) =>
                setForm((f) => ({ ...f, tipo: e.target.value as TipoProducto }))
              }
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Unidad *</label>
            <input
              className="input w-full"
              placeholder="kg, UNI, m..."
              value={form.unidad}
              onChange={(e) =>
                setForm((f) => ({ ...f, unidad: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="label">Stock actual</label>
            <input
              type="number"
              min="0"
              step="0.001"
              className="input w-full"
              value={form.stockActual}
              onChange={(e) =>
                setForm((f) => ({ ...f, stockActual: +e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label">Stock mínimo</label>
            <input
              type="number"
              min="0"
              step="0.001"
              className="input w-full"
              value={form.stockMinimo}
              onChange={(e) =>
                setForm((f) => ({ ...f, stockMinimo: +e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label">Costo unitario</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input w-full"
              value={form.costoUnitario}
              onChange={(e) =>
                setForm((f) => ({ ...f, costoUnitario: +e.target.value }))
              }
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={crear.isPending || !selectedLocal?.id}
        >
          {crear.isPending ? "Guardando..." : "Crear material"}
        </button>
      </form>

      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Unidad</th>
            <th>Stock</th>
            <th>Stock Mín.</th>
            <th>Costo Unit.</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((m) => (
            <tr
              key={m.id}
              className={
                m.stockActual != null &&
                m.stockMinimo != null &&
                m.stockActual <= m.stockMinimo
                  ? "bg-red-50"
                  : ""
              }
            >
              <td>{m.code}</td>
              <td>{m.nombre}</td>
              <td>{m.tipo}</td>
              <td>{m.unidad}</td>
              <td>{m.stockActual ?? "—"}</td>
              <td>{m.stockMinimo ?? "—"}</td>
              <td>
                {m.costoUnitario != null
                  ? `$${Number(m.costoUnitario).toLocaleString("es-AR")}`
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### `app/(dashboard)/produccion/bom/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { useLocal } from "@/contexts/LocalContext";
import {
  useBOMs,
  useCrearBOM,
  useMaterialesProduccion,
} from "@/hooks/useProduccion";
import type { BomItemDto } from "@/lib/types/produccion";

export default function BomPage() {
  const { selectedLocal } = useLocal();
  const { data: bomsData, isLoading } = useBOMs();
  const { data: materialesData } = useMaterialesProduccion();
  const crear = useCrearBOM();

  const [items, setItems] = useState<BomItemDto[]>([
    { materialId: "", cantidad: 1 },
  ]);

  const agregarItem = () =>
    setItems((prev) => [...prev, { materialId: "", cantidad: 1 }]);
  const quitarItem = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedLocal?.id) return;
    const fd = new FormData(e.currentTarget);
    await crear.mutateAsync({
      dto: {
        code: fd.get("code") as string,
        productoId: fd.get("productoId") as string,
        cantidad: Number(fd.get("cantidad")),
        unidad: fd.get("unidad") as string,
        version: Number(fd.get("version")) || 1,
        items: items.filter((i) => i.materialId),
      },
      localId: selectedLocal.id,
    });
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Lista de Materiales (BOM)</h1>

      <form onSubmit={handleSubmit} className="card max-w-2xl space-y-4">
        <h3 className="font-semibold">Nuevo BOM</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Código BOM *</label>
            <input
              name="code"
              className="input w-full"
              placeholder="BOM-SILLA-001"
              required
            />
          </div>
          <div>
            <label className="label">ID Producto terminado *</label>
            <input
              name="productoId"
              className="input w-full"
              placeholder="UUID del producto"
              required
            />
          </div>
          <div>
            <label className="label">Cantidad por lote *</label>
            <input
              type="number"
              name="cantidad"
              min="0.001"
              step="0.001"
              className="input w-full"
              defaultValue={1}
              required
            />
          </div>
          <div>
            <label className="label">Unidad del producto *</label>
            <input
              name="unidad"
              className="input w-full"
              placeholder="UNI, kg..."
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="label">Materiales requeridos</label>
            <button
              type="button"
              onClick={agregarItem}
              className="btn btn-sm btn-secondary"
            >
              + Agregar material
            </button>
          </div>
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select
                className="input flex-1"
                value={item.materialId}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((it, idx) =>
                      idx === i ? { ...it, materialId: e.target.value } : it,
                    ),
                  )
                }
              >
                <option value="">Seleccionar material...</option>
                {materialesData?.data.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} ({m.code})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0.0001"
                step="0.0001"
                className="input w-24"
                placeholder="Cant."
                value={item.cantidad}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((it, idx) =>
                      idx === i ? { ...it, cantidad: +e.target.value } : it,
                    ),
                  )
                }
              />
              <input
                className="input w-20"
                placeholder="Unidad"
                value={item.unidad ?? ""}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((it, idx) =>
                      idx === i ? { ...it, unidad: e.target.value } : it,
                    ),
                  )
                }
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => quitarItem(i)}
                  className="text-red-500"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={crear.isPending || !selectedLocal?.id}
        >
          {crear.isPending ? "Creando..." : "Crear BOM"}
        </button>
      </form>

      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Código</th>
            <th>Producto</th>
            <th>Cantidad lote</th>
            <th>Unidad</th>
            <th>Versión</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {bomsData?.data.map((b) => (
            <tr key={b.id}>
              <td>{b.code}</td>
              <td>{b.producto?.name ?? b.productoId}</td>
              <td>{b.cantidad}</td>
              <td>{b.unidad}</td>
              <td>{b.version ?? 1}</td>
              <td>{b.activo ? "Activo" : "Inactivo"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### `app/(dashboard)/produccion/ordenes/page.tsx`

Listar y gestionar el ciclo de vida de órdenes:

```tsx
"use client";

import { useLocal } from "@/contexts/LocalContext";
import {
  useOrdenesProduccion,
  useIniciarOrden,
  useFinalizarOrden,
  useCancelarOrden,
} from "@/hooks/useProduccion";
import Link from "next/link";

const BADGE: Record<string, string> = {
  PLANIFICADA: "bg-yellow-100 text-yellow-800",
  EN_PROCESO: "bg-blue-100 text-blue-800",
  COMPLETADA: "bg-green-100 text-green-800",
  CANCELADA: "bg-gray-100 text-gray-600",
};

export default function OrdenesPage() {
  const { data, isLoading } = useOrdenesProduccion();
  const iniciar = useIniciarOrden();
  const finalizar = useFinalizarOrden();
  const cancelar = useCancelarOrden();

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Órdenes de Producción</h1>
        <Link href="/produccion/ordenes/nueva" className="btn btn-primary">
          + Nueva orden
        </Link>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Producto</th>
            <th>Cant. Plan.</th>
            <th>Cant. Real.</th>
            <th>Fecha Fin Plan.</th>
            <th>Estado</th>
            <th>Operador</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((o) => (
            <tr key={o.id}>
              <td>{o.numero}</td>
              <td>{o.bom?.producto.name ?? o.bomId}</td>
              <td>{o.cantidadPlanificada}</td>
              <td>{o.cantidadRealizada ?? "—"}</td>
              <td>
                {new Date(o.fechaFinPlanificada).toLocaleDateString("es-AR")}
              </td>
              <td>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${BADGE[o.estado]}`}
                >
                  {o.estado}
                </span>
              </td>
              <td>{o.operador ?? "—"}</td>
              <td className="flex gap-1">
                {o.estado === "PLANIFICADA" && (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => iniciar.mutate(o.id)}
                    disabled={iniciar.isPending}
                  >
                    Iniciar
                  </button>
                )}
                {o.estado === "EN_PROCESO" && (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => {
                      const cant = Number(
                        prompt(
                          "Cantidad realizada:",
                          String(o.cantidadPlanificada),
                        ),
                      );
                      if (cant > 0)
                        finalizar.mutate({
                          id: o.id,
                          dto: { cantidadRealizada: cant },
                        });
                    }}
                    disabled={finalizar.isPending}
                  >
                    Finalizar
                  </button>
                )}
                {(o.estado === "PLANIFICADA" || o.estado === "EN_PROCESO") && (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      const motivo = prompt("Motivo de cancelación:");
                      if (motivo)
                        cancelar.mutate({ id: o.id, dto: { motivo } });
                    }}
                    disabled={cancelar.isPending}
                  >
                    Cancelar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### `app/(dashboard)/produccion/planificacion/page.tsx`

```tsx
"use client";

import { useState } from "react";
import {
  useCalendarioProduccion,
  useVerificarMateriales,
} from "@/hooks/useProduccion";

export default function PlanificacionPage() {
  const hoy = new Date();
  const [desde, setDesde] = useState(
    `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-01`,
  );
  const [hasta, setHasta] = useState(
    `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate()}`,
  );

  const { data: calendario } = useCalendarioProduccion(desde, hasta);
  const { data: alertas } = useVerificarMateriales();

  const conDeficit = alertas?.data.filter((a) => !a.suficiente) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Planificación de Producción</h1>

      {/* Calendario */}
      <div className="card">
        <h3 className="font-semibold mb-4">Calendario de órdenes</h3>
        <div className="flex gap-4 mb-4">
          <div>
            <label className="label">Desde</label>
            <input
              type="date"
              className="input"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Hasta</label>
            <input
              type="date"
              className="input"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Fecha fin plan.</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {calendario?.data.map((o) => (
              <tr key={o.id}>
                <td>{o.numero}</td>
                <td>{o.bom.producto.name}</td>
                <td>{o.cantidadPlanificada}</td>
                <td>
                  {new Date(o.fechaFinPlanificada).toLocaleDateString("es-AR")}
                </td>
                <td>{o.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alertas de materiales */}
      <div className="card">
        <h3 className="font-semibold mb-4">
          Verificación de materiales vs demanda planificada
          {conDeficit.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
              {conDeficit.length} con déficit
            </span>
          )}
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Material</th>
              <th>Unidad</th>
              <th>Stock actual</th>
              <th>Demanda planificada</th>
              <th>Déficit</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {alertas?.data.map((a) => (
              <tr
                key={a.material.id}
                className={!a.suficiente ? "bg-red-50" : ""}
              >
                <td>
                  {a.material.nombre} ({a.material.code})
                </td>
                <td>{a.material.unidad}</td>
                <td>{a.stockActual}</td>
                <td>{a.demandaPlanificada}</td>
                <td
                  className={
                    !a.suficiente
                      ? "text-red-600 font-semibold"
                      : "text-green-600"
                  }
                >
                  {!a.suficiente ? `-${a.deficit}` : "OK"}
                </td>
                <td>{a.suficiente ? "✓ Suficiente" : "⚠ Insuficiente"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 6. Referencia de endpoints

| Método  | Endpoint                                     | Descripción                                   | Rol   |
| ------- | -------------------------------------------- | --------------------------------------------- | ----- |
| `GET`   | `/api/v1/materiales-produccion`              | Listar materiales                             | Todos |
| `POST`  | `/api/v1/materiales-produccion?localId=UUID` | Crear material                                | Admin |
| `PATCH` | `/api/v1/materiales-produccion/:id`          | Actualizar material                           | Admin |
| `GET`   | `/api/v1/bom`                                | Listar BOMs                                   | Todos |
| `GET`   | `/api/v1/bom/:id`                            | BOM con items y costo estimado                | Todos |
| `POST`  | `/api/v1/bom?localId=UUID`                   | Crear BOM                                     | Admin |
| `GET`   | `/api/v1/ordenes-produccion`                 | Listar órdenes                                | Todos |
| `GET`   | `/api/v1/ordenes-produccion/:id`             | Orden con materiales requeridos               | Todos |
| `POST`  | `/api/v1/ordenes-produccion?localId=UUID`    | Crear orden (estado: PLANIFICADA)             | Admin |
| `PATCH` | `/api/v1/ordenes-produccion/:id/iniciar`     | Iniciar → descuenta materiales del stock      | Admin |
| `PATCH` | `/api/v1/ordenes-produccion/:id/finalizar`   | Finalizar → ingresa producto terminado        | Admin |
| `PATCH` | `/api/v1/ordenes-produccion/:id/cancelar`    | Cancelar → reintegra materiales si EN_PROCESO | Admin |
| `GET`   | `/api/v1/planificacion?desde=&hasta=`        | Calendario de órdenes por período             | Todos |
| `GET`   | `/api/v1/planificacion/materiales`           | Stock vs demanda planificada                  | Todos |

---

## 7. Flujo de estado de una orden

```
PLANIFICADA ──[iniciar]──► EN_PROCESO ──[finalizar]──► COMPLETADA
     │                          │
     └──────[cancelar]──────────┴──────────────────────► CANCELADA
```

- **iniciar**: Descuenta `(item.cantidad × cantidadPlanificada)` de cada material. Si no hay stock suficiente, el backend lanza error 400.
- **finalizar**: Ingresa `cantidadRealizada` unidades del producto terminado al stock. Calcula `costoTotal = costoManoObra + Σ(item.cantidad × cantidadPlanificada × material.costoUnitario)`.
- **cancelar**: Si la orden estaba EN_PROCESO, reintegra los materiales. Si estaba PLANIFICADA, no hay movimiento de stock.

---

## 8. Discrepancias: docs vs código real

| Docs decían                        | Código real                         |
| ---------------------------------- | ----------------------------------- |
| `productoTerminadoId` (BOM)        | `productoId`                        |
| `version: string` ("BOM-SILLA-V1") | `code: string` + `version?: number` |
| `depositoId` en CreateOrdenDto     | **no existe**                       |
| `maquinaId` en CreateOrdenDto      | **no existe**                       |
| `observaciones` en CreateOrdenDto  | `notas`                             |
| módulo `maquinas/`                 | módulo `materiales-produccion/`     |
| endpoint `/maquinas`               | endpoint `/materiales-produccion`   |
