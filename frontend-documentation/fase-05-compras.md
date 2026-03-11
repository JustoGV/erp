# Fase 05 — Compras

## Objetivo

Conectar el módulo de Compras al backend real: Proveedores → Requerimientos → Órdenes de Compra → Recepciones → Pagos a Proveedores.

---

## 0. Contexto previo

Las siguientes fases deben estar implementadas:

- **Fase 01**: `api-client.ts`, `QueryProvider`, `AuthContext` real.
- **Fase 02**: `LocalContext` real (proporciona el `localId` activo).
- **Fase 03**: tipos de inventario en `api-types.ts` (la recepción incrementa stock).

---

## 1. Agregar tipos en `lib/api-types.ts`

Añadir al final del archivo:

```typescript
// ─── COMPRAS ───────────────────────────────────────────────

export type EstadoRequerimiento =
  | "PENDIENTE"
  | "AUTORIZADO"
  | "RECHAZADO"
  | "COMPLETADO"
  | "CANCELADO";

export type EstadoOrdenCompra =
  | "BORRADOR"
  | "ENVIADA"
  | "CONFIRMADA"
  | "RECIBIDA_PARCIAL"
  | "RECIBIDA_COMPLETA"
  | "CANCELADA";

// ---------- Proveedor ----------

export interface Proveedor {
  id: string;
  empresaId: string;
  localId: string;
  code: string;
  name: string;
  taxId?: string; // CUIT / RUC
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  paymentTerms: number; // días de pago acordados
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { ordenesCompra: number };
}

export interface CreateProveedorDto {
  code: string;
  name: string;
  localId: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  paymentTerms?: number;
}

export interface UpdateProveedorDto extends Partial<CreateProveedorDto> {
  active?: boolean;
}

export interface DeudaProveedor {
  cuentaId: string;
  ordenId: string;
  ordenNumero: string;
  montoTotal: number;
  montoPagado: number;
  saldoPendiente: number;
  estado: string;
}

export interface DeudaProveedorResponse {
  saldos: DeudaProveedor[];
  totalDeuda: number;
}

// ---------- Requerimiento ----------

export interface ItemRequerimiento {
  id: string;
  requerimientoId: string;
  productoId?: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioEstimado?: number;
  observaciones?: string;
}

export interface Requerimiento {
  id: string;
  empresaId: string;
  localId: string;
  numero: string;
  solicitante: string;
  departamento: string;
  justificacion: string;
  fechaNecesidad: string;
  estado: EstadoRequerimiento;
  observaciones?: string;
  autorizadoPor?: string;
  fechaAutorizacion?: string;
  createdAt: string;
  updatedAt: string;
  items?: ItemRequerimiento[];
  _count?: { items: number };
}

export interface ItemRequerimientoDto {
  productoId?: string; // opcional: si el producto existe en el sistema
  descripcion: string; // nombre/descripción del artículo
  cantidad: number;
  unidad: string; // ej: 'KG', 'UNI', 'CAJA'
  precioEstimado?: number;
  observaciones?: string;
}

export interface CreateRequerimientoDto {
  solicitante: string;
  departamento: string;
  justificacion: string;
  fechaNecesidad: string; // ISO date, ej: '2026-04-01'
  observaciones?: string;
  items: ItemRequerimientoDto[];
}

// ---------- Orden de Compra ----------

export interface ItemOrdenCompra {
  id: string;
  ordenCompraId: string;
  productoId?: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  cantidadRecibida: number;
  producto?: { id: string; code: string; name: string; unit: string };
}

export interface OrdenCompra {
  id: string;
  empresaId: string;
  localId: string;
  numero: string;
  proveedorId: string;
  requerimientoId?: string;
  fechaEntregaEstimada?: string;
  condicionesPago?: string;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  estado: EstadoOrdenCompra;
  observaciones?: string;
  creadoPor: string;
  createdAt: string;
  updatedAt: string;
  proveedor?: { id: string; code: string; name: string };
  requerimiento?: { id: string; numero: string };
  items?: ItemOrdenCompra[];
  recepciones?: RecepcionCompra[];
  pagos?: PagoProveedor[];
  totalPagado?: number; // calculado en findOne
  saldoPendiente?: number; // calculado en findOne
  _count?: { items: number; recepciones: number; pagos: number };
}

export interface ItemOrdenCompraDto {
  productoId?: string; // opcional
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  descuento?: number; // porcentaje, ej: 10 = 10%
}

export interface CreateOrdenCompraDto {
  proveedorId: string;
  requerimientoId?: string;
  fechaEntregaEstimada?: string; // ISO date
  condicionesPago?: string;
  observaciones?: string;
  items: ItemOrdenCompraDto[];
}

// ---------- Recepción ----------

export interface ItemRecepcion {
  id: string;
  recepcionId: string;
  itemOrdenCompraId: string;
  cantidadRecibida: number;
  cantidadRechazada: number;
  motivoRechazo?: string;
  observaciones?: string;
}

export interface RecepcionCompra {
  id: string;
  empresaId: string;
  localId: string;
  ordenCompraId: string;
  nroRemito?: string;
  fecha: string;
  observaciones?: string;
  creadoPor: string;
  createdAt: string;
  items?: ItemRecepcion[];
  ordenCompra?: {
    id: string;
    numero: string;
    proveedor?: { id: string; name: string };
  };
}

export interface ItemRecepcionDto {
  itemOrdenCompraId: string; // ID del ItemOrdenCompra (no del producto)
  cantidadRecibida: number;
  cantidadRechazada?: number;
  motivoRechazo?: string;
  observaciones?: string;
}

export interface CreateRecepcionDto {
  ordenCompraId: string;
  nroRemito?: string;
  observaciones?: string;
  items: ItemRecepcionDto[];
}

// ---------- Pago a Proveedor ----------

export interface PagoProveedor {
  id: string;
  empresaId: string;
  localId: string;
  proveedorId: string;
  fecha: string;
  monto: number;
  metodoPago: string; // 'EFECTIVO' | 'TRANSFERENCIA' | 'CHEQUE' | 'TARJETA' | otro
  referencia?: string;
  notas?: string;
  creadoPor: string;
  createdAt: string;
  ordenCompra?: {
    id: string;
    numero: string;
    proveedor?: { id: string; name: string };
  };
}

export interface CreatePagoProveedorDto {
  proveedorId: string;
  monto: number;
  metodoPago: string;
  fecha?: string; // ISO date
  referencia?: string;
  notas?: string;
}
```

---

## 2. Crear `lib/services/compras.service.ts`

```typescript
import apiClient from "@/lib/api-client";
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

// ─── Proveedores ──────────────────────────────────────────────

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

  // Cuentas por pagar pendientes con este proveedor
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

// ─── Requerimientos ───────────────────────────────────────────

export const requerimientosService = {
  getAll: (params?: { page?: number; limit?: number; localId?: string }) =>
    apiClient
      .get<PaginatedResponse<Requerimiento>>("/requerimientos", { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<Requerimiento>>(`/requerimientos/${id}`)
      .then((r) => r.data),

  // localId se pasa como query param requerido
  create: (dto: CreateRequerimientoDto, localId: string) =>
    apiClient
      .post<
        ApiResponse<Requerimiento>
      >("/requerimientos", dto, { params: { localId } })
      .then((r) => r.data),

  // Estado pasa a AUTORIZADO
  autorizar: (id: string) =>
    apiClient
      .patch<ApiResponse<Requerimiento>>(`/requerimientos/${id}/autorizar`)
      .then((r) => r.data),
};

// ─── Órdenes de Compra ────────────────────────────────────────

export const ordenesCompraService = {
  getAll: (params?: { page?: number; limit?: number; localId?: string }) =>
    apiClient
      .get<PaginatedResponse<OrdenCompra>>("/ordenes-compra", { params })
      .then((r) => r.data),

  // Incluye totalPagado y saldoPendiente
  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<OrdenCompra>>(`/ordenes-compra/${id}`)
      .then((r) => r.data),

  // localId se pasa como query param requerido; crea en estado BORRADOR
  create: (dto: CreateOrdenCompraDto, localId: string) =>
    apiClient
      .post<
        ApiResponse<OrdenCompra>
      >("/ordenes-compra", dto, { params: { localId } })
      .then((r) => r.data),

  // Estado pasa de BORRADOR → ENVIADA
  aprobar: (id: string) =>
    apiClient
      .patch<ApiResponse<OrdenCompra>>(`/ordenes-compra/${id}/aprobar`)
      .then((r) => r.data),
};

// ─── Recepciones ──────────────────────────────────────────────

export const recepcionesService = {
  getAll: (params?: { page?: number; limit?: number; localId?: string }) =>
    apiClient
      .get<PaginatedResponse<RecepcionCompra>>("/recepciones", { params })
      .then((r) => r.data),

  // Registrar recepción: incrementa stock automáticamente en transacción
  create: (dto: CreateRecepcionDto) =>
    apiClient
      .post<
        ApiResponse<{ recepcion: RecepcionCompra; ordenEstadoNuevo: string }>
      >("/recepciones", dto)
      .then((r) => r.data),
};

// ─── Pagos a Proveedores ──────────────────────────────────────

export const pagosProveedorService = {
  getAll: (params?: { page?: number; limit?: number; localId?: string }) =>
    apiClient
      .get<PaginatedResponse<PagoProveedor>>("/pagos-proveedor", { params })
      .then((r) => r.data),

  create: (dto: CreatePagoProveedorDto) =>
    apiClient
      .post<ApiResponse<PagoProveedor>>("/pagos-proveedor", dto)
      .then((r) => r.data),
};
```

---

## 3. Crear `hooks/useCompras.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  proveedoresService,
  requerimientosService,
  ordenesCompraService,
  recepcionesService,
  pagosProveedorService,
} from "@/lib/services/compras.service";
import type {
  CreateProveedorDto,
  UpdateProveedorDto,
  CreateRequerimientoDto,
  CreateOrdenCompraDto,
  CreateRecepcionDto,
  CreatePagoProveedorDto,
} from "@/lib/api-types";

// ─── Proveedores ──────────────────────────────────────────────

export function useProveedores(params?: {
  page?: number;
  limit?: number;
  localId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["proveedores", params],
    queryFn: () => proveedoresService.getAll(params),
  });
}

export function useProveedor(id: string) {
  return useQuery({
    queryKey: ["proveedores", id],
    queryFn: () => proveedoresService.getOne(id),
    enabled: !!id,
  });
}

export function useProveedorDeuda(id: string) {
  return useQuery({
    queryKey: ["proveedores", id, "deuda"],
    queryFn: () => proveedoresService.getDeuda(id),
    enabled: !!id,
  });
}

export function useCrearProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProveedorDto) => proveedoresService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["proveedores"] }),
  });
}

export function useActualizarProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProveedorDto }) =>
      proveedoresService.update(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["proveedores"] });
      qc.invalidateQueries({ queryKey: ["proveedores", id] });
    },
  });
}

// ─── Requerimientos ───────────────────────────────────────────

export function useRequerimientos(params?: {
  page?: number;
  limit?: number;
  localId?: string;
}) {
  return useQuery({
    queryKey: ["requerimientos", params],
    queryFn: () => requerimientosService.getAll(params),
  });
}

export function useRequerimiento(id: string) {
  return useQuery({
    queryKey: ["requerimientos", id],
    queryFn: () => requerimientosService.getOne(id),
    enabled: !!id,
  });
}

export function useCrearRequerimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      dto,
      localId,
    }: {
      dto: CreateRequerimientoDto;
      localId: string;
    }) => requerimientosService.create(dto, localId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["requerimientos"] }),
  });
}

export function useAutorizarRequerimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requerimientosService.autorizar(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["requerimientos"] });
      qc.invalidateQueries({ queryKey: ["requerimientos", id] });
    },
  });
}

// ─── Órdenes de Compra ────────────────────────────────────────

export function useOrdenesCompra(params?: {
  page?: number;
  limit?: number;
  localId?: string;
}) {
  return useQuery({
    queryKey: ["ordenesCompra", params],
    queryFn: () => ordenesCompraService.getAll(params),
  });
}

export function useOrdenCompra(id: string) {
  return useQuery({
    queryKey: ["ordenesCompra", id],
    queryFn: () => ordenesCompraService.getOne(id),
    enabled: !!id,
  });
}

export function useCrearOrdenCompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      dto,
      localId,
    }: {
      dto: CreateOrdenCompraDto;
      localId: string;
    }) => ordenesCompraService.create(dto, localId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ordenesCompra"] });
      // Si vino de un requerimiento, su estado habrá cambiado
      qc.invalidateQueries({ queryKey: ["requerimientos"] });
    },
  });
}

export function useAprobarOrdenCompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordenesCompraService.aprobar(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["ordenesCompra"] });
      qc.invalidateQueries({ queryKey: ["ordenesCompra", id] });
    },
  });
}

// ─── Recepciones ──────────────────────────────────────────────

export function useRecepciones(params?: {
  page?: number;
  limit?: number;
  localId?: string;
}) {
  return useQuery({
    queryKey: ["recepciones", params],
    queryFn: () => recepcionesService.getAll(params),
  });
}

export function useRegistrarRecepcion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRecepcionDto) => recepcionesService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recepciones"] });
      qc.invalidateQueries({ queryKey: ["ordenesCompra"] });
      // El stock sube al recibir mercadería
      qc.invalidateQueries({ queryKey: ["inventario"] });
    },
  });
}

// ─── Pagos ────────────────────────────────────────────────────

export function usePagosProveedor(params?: {
  page?: number;
  limit?: number;
  localId?: string;
}) {
  return useQuery({
    queryKey: ["pagosProveedor", params],
    queryFn: () => pagosProveedorService.getAll(params),
  });
}

export function useRegistrarPagoProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePagoProveedorDto) =>
      pagosProveedorService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pagosProveedor"] });
      qc.invalidateQueries({ queryKey: ["proveedores"] });
      qc.invalidateQueries({ queryKey: ["ordenesCompra"] });
    },
  });
}
```

---

## 4. Actualizar `app/(dashboard)/compras/page.tsx`

Reemplazar el componente completo:

```tsx
"use client";

import Link from "next/link";
import { ShoppingCart, Users, FileText, Truck, CreditCard } from "lucide-react";
import { useProveedores } from "@/hooks/useCompras";
import { useRequerimientos } from "@/hooks/useCompras";
import { useOrdenesCompra } from "@/hooks/useCompras";
import { useRecepciones } from "@/hooks/useCompras";
import { usePagosProveedor } from "@/hooks/useCompras";
import { useLocal } from "@/contexts/LocalContext";

export default function ComprasResumenPage() {
  const { localId } = useLocal();

  const { data: proveedoresData } = useProveedores({ localId, limit: 1 });
  const { data: requerimientosData } = useRequerimientos({ localId, limit: 1 });
  const { data: ordenesData } = useOrdenesCompra({ localId, limit: 1 });
  const { data: recepcionesData } = useRecepciones({ localId, limit: 1 });
  const { data: pagosData } = usePagosProveedor({ localId, limit: 1 });

  const totalProveedores = proveedoresData?.meta?.total ?? "—";
  const totalRequerimientos = requerimientosData?.meta?.total ?? "—";
  const totalOrdenes = ordenesData?.meta?.total ?? "—";
  const totalRecepciones = recepcionesData?.meta?.total ?? "—";
  const totalPagos = pagosData?.meta?.total ?? "—";

  const menuItems = [
    {
      href: "/compras/proveedores",
      icon: Users,
      title: "Proveedores",
      description: "Gestión de proveedores y cuentas",
      color: "bg-purple-500",
      stats: `${totalProveedores} proveedores`,
    },
    {
      href: "/compras/requerimientos",
      icon: FileText,
      title: "Requerimientos",
      description: "Solicitudes de compra",
      color: "bg-yellow-500",
      stats: `${totalRequerimientos} requerimientos`,
    },
    {
      href: "/compras/ordenes",
      icon: ShoppingCart,
      title: "Órdenes de Compra",
      description: "Órdenes a proveedores",
      color: "bg-indigo-500",
      stats: `${totalOrdenes} órdenes`,
    },
    {
      href: "/compras/recepciones",
      icon: Truck,
      title: "Recepciones",
      description: "Avisos de recepción de mercadería",
      color: "bg-green-500",
      stats: `${totalRecepciones} recepciones`,
    },
    {
      href: "/compras/pagos",
      icon: CreditCard,
      title: "Pagos",
      description: "Gestión de pagos a proveedores",
      color: "bg-red-500",
      stats: `${totalPagos} pagos registrados`,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Módulo de Compras</h1>
        <p className="text-gray-600 mt-1">
          Gestión completa del área de adquisiciones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 border border-gray-200 hover:border-purple-300"
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

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <ShoppingCart className="h-6 w-6 text-purple-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              Flujo de Compras
            </h3>
            <p className="text-sm text-purple-700">
              El módulo de compras gestiona el ciclo completo de adquisiciones.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-purple-800">
              <span className="font-medium">Flujo:</span>
              <span className="px-2 py-1 bg-purple-100 rounded">
                Requerimiento
              </span>
              <span>→</span>
              <span className="px-2 py-1 bg-purple-100 rounded">Orden</span>
              <span>→</span>
              <span className="px-2 py-1 bg-purple-100 rounded">Recepción</span>
              <span>→</span>
              <span className="px-2 py-1 bg-purple-100 rounded">Pago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Patrones de uso

### 5.1 Listar proveedores con búsqueda

```tsx
"use client";
import { useState } from "react";
import { useProveedores } from "@/hooks/useCompras";
import { useLocal } from "@/contexts/LocalContext";

export default function ProveedoresPage() {
  const { localId } = useLocal();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useProveedores({ localId, search, limit: 20 });

  if (isLoading) return <p>Cargando...</p>;

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nombre, código o CUIT..."
      />
      {data?.data.map((p) => (
        <div key={p.id}>
          {p.code} — {p.name} ({p.paymentTerms} días)
        </div>
      ))}
    </div>
  );
}
```

### 5.2 Ver deuda pendiente con un proveedor

```tsx
import { useProveedorDeuda } from "@/hooks/useCompras";

function DeudaProveedor({ proveedorId }: { proveedorId: string }) {
  const { data } = useProveedorDeuda(proveedorId);
  const deuda = data?.data;

  return (
    <div>
      <p className="font-bold">Deuda total: ${deuda?.totalDeuda.toFixed(2)}</p>
      {deuda?.saldos.map((s) => (
        <div key={s.cuentaId}>
          OC #{s.ordenNumero} — Saldo: ${s.saldoPendiente.toFixed(2)} (
          {s.estado})
        </div>
      ))}
    </div>
  );
}
```

### 5.3 Crear un requerimiento de compra

```tsx
import { useCrearRequerimiento } from "@/hooks/useCompras";
import { useLocal } from "@/contexts/LocalContext";

function NuevoRequerimientoForm() {
  const { localId } = useLocal();
  const { mutate, isPending } = useCrearRequerimiento();

  const handleSubmit = () => {
    mutate({
      localId,
      dto: {
        solicitante: "Juan Pérez",
        departamento: "Producción",
        justificacion: "Reposición mensual de insumos",
        fechaNecesidad: "2026-04-01",
        items: [
          {
            descripcion: "Tornillos M8 x 30mm",
            cantidad: 500,
            unidad: "UNI",
            precioEstimado: 2.5,
          },
          {
            productoId: "uuid-producto-existente", // si está en el sistema
            descripcion: "Aceite lubricante",
            cantidad: 20,
            unidad: "LT",
          },
        ],
      },
    });
  };

  return (
    <button onClick={handleSubmit} disabled={isPending}>
      {isPending ? "Guardando..." : "Crear requerimiento"}
    </button>
  );
}
```

### 5.4 Flujo completo: Requerimiento → Orden → Recepción → Pago

```tsx
import {
  useAutorizarRequerimiento,
  useCrearOrdenCompra,
  useAprobarOrdenCompra,
  useRegistrarRecepcion,
  useRegistrarPagoProveedor,
} from "@/hooks/useCompras";

// 1. Autorizar requerimiento (PENDIENTE → AUTORIZADO)
const autorizar = useAutorizarRequerimiento();
autorizar.mutate(requerimientoId);

// 2. Crear OC vinculada al requerimiento (estado inicial: BORRADOR)
const crearOC = useCrearOrdenCompra();
crearOC.mutate({
  localId,
  dto: {
    proveedorId,
    requerimientoId, // opcional: vincula con el requerimiento
    fechaEntregaEstimada: "2026-04-15",
    condicionesPago: "30 días neto",
    items: [
      {
        descripcion: "Tornillos M8 x 30mm",
        cantidad: 500,
        unidad: "UNI",
        precioUnitario: 2.5,
      },
    ],
  },
});

// 3. Aprobar OC (BORRADOR → ENVIADA)
const aprobar = useAprobarOrdenCompra();
aprobar.mutate(ordenCompraId);

// 4. Registrar recepción (incrementa stock automáticamente)
//    itemOrdenCompraId = id del ItemOrdenCompra (viene en orden.items[].id)
const recepcionar = useRegistrarRecepcion();
recepcionar.mutate({
  ordenCompraId,
  nroRemito: "0001-00012345",
  items: [{ itemOrdenCompraId: "uuid-item-oc", cantidadRecibida: 500 }],
});

// 5. Registrar pago (se asocia al proveedor, puede ser independiente de la OC)
const pagar = useRegistrarPagoProveedor();
pagar.mutate({
  proveedorId,
  monto: 1250,
  metodoPago: "TRANSFERENCIA",
  referencia: "CBU 0000123456789",
  fecha: "2026-04-20",
});
```

### 5.5 Crear OC manualmente (sin requerimiento)

```tsx
crearOC.mutate({
  localId,
  dto: {
    proveedorId: "uuid-proveedor",
    items: [
      {
        productoId: "uuid-producto", // si existe en el sistema
        descripcion: "Materia prima A",
        cantidad: 100,
        unidad: "KG",
        precioUnitario: 150,
        descuento: 5, // 5% de descuento
      },
    ],
  },
});
```

---

## 6. Referencia rápida de endpoints

| Acción                   | Método  | Endpoint                        |
| ------------------------ | ------- | ------------------------------- |
| Listar proveedores       | `GET`   | `/proveedores?localId=&search=` |
| Obtener proveedor        | `GET`   | `/proveedores/:id`              |
| Deuda con proveedor      | `GET`   | `/proveedores/:id/deuda`        |
| Crear proveedor          | `POST`  | `/proveedores`                  |
| Actualizar proveedor     | `PATCH` | `/proveedores/:id`              |
| Listar requerimientos    | `GET`   | `/requerimientos?localId=`      |
| Obtener requerimiento    | `GET`   | `/requerimientos/:id`           |
| Crear requerimiento      | `POST`  | `/requerimientos?localId=UUID`  |
| Autorizar requerimiento  | `PATCH` | `/requerimientos/:id/autorizar` |
| Listar órdenes de compra | `GET`   | `/ordenes-compra?localId=`      |
| Obtener OC               | `GET`   | `/ordenes-compra/:id`           |
| Crear OC                 | `POST`  | `/ordenes-compra?localId=UUID`  |
| Aprobar OC               | `PATCH` | `/ordenes-compra/:id/aprobar`   |
| Listar recepciones       | `GET`   | `/recepciones?localId=`         |
| Registrar recepción      | `POST`  | `/recepciones`                  |
| Listar pagos             | `GET`   | `/pagos-proveedor?localId=`     |
| Registrar pago           | `POST`  | `/pagos-proveedor`              |

---

## 7. Valores de estado

### `EstadoRequerimiento`

| Valor        | Descripción                 |
| ------------ | --------------------------- |
| `PENDIENTE`  | Recién creado (default)     |
| `AUTORIZADO` | Aprobado — puede generar OC |
| `RECHAZADO`  | No aprobado                 |
| `COMPLETADO` | Ya generó una OC            |
| `CANCELADO`  | Cancelado                   |

### `EstadoOrdenCompra`

| Valor               | Descripción                         |
| ------------------- | ----------------------------------- |
| `BORRADOR`          | Recién creada (default)             |
| `ENVIADA`           | Enviada al proveedor (tras aprobar) |
| `CONFIRMADA`        | Confirmada por el proveedor         |
| `RECIBIDA_PARCIAL`  | Al menos una recepción parcial      |
| `RECIBIDA_COMPLETA` | Todo el pedido recibido             |
| `CANCELADA`         | Cancelada                           |

---

## 8. Notas importantes

1. **`localId` en requerimientos y OC**: Se pasa como query param `?localId=UUID`, no en el body.
2. **Stock automático en recepciones**: Al registrar una recepción, el backend incrementa el stock de cada producto recibido dentro de una transacción. Por eso `useRegistrarRecepcion` invalida `['inventario']`.
3. **`itemOrdenCompraId`** en recepciones: Es el `id` del objeto `ItemOrdenCompra` (viene en `orden.items[].id`), NO el `productoId`. Hay que obtener los items de la OC primero con `useOrdenCompra(id)`.
4. **Items sin producto en sistema**: En requerimientos y OC, `productoId` es opcional. Se puede crear un item con solo `descripcion`, `cantidad`, `unidad` y `precioUnitario` para artículos que no están en el catálogo.
5. **Pago a proveedor independiente**: `CreatePagoProveedorDto` requiere `proveedorId` (no `ordenCompraId`). El pago se registra contra el proveedor y el backend lo asocia a las cuentas por pagar pendientes.
6. **Costo del producto actualizado**: Al recibir una OC, el backend actualiza el campo `cost` del `Producto` con el precio unitario de la OC (precio de la última compra).
