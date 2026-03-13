# Fase 04 — Ventas

## Objetivo

Conectar el módulo de Ventas al backend real: Clientes → Presupuestos → Pedidos → Facturas → Cobranzas.

---

## 0. Contexto previo

Las siguientes fases deben estar implementadas:

- **Fase 01**: `api-client.ts`, `QueryProvider`, `AuthContext` real.
- **Fase 02**: `LocalContext` real (proporciona el `localId` activo).
- **Fase 03**: tipos de inventario en `api-types.ts` (se usan en items de presupuesto/pedido).

---

## 1. Agregar tipos en `lib/api-types.ts`

Añadir al final del archivo:

```typescript
// ─── VENTAS ────────────────────────────────────────────────

export type EstadoPresupuesto =
  | "BORRADOR"
  | "ENVIADO"
  | "APROBADO"
  | "RECHAZADO"
  | "VENCIDO";

export type EstadoPedido =
  | "PENDIENTE"
  | "CONFIRMADO"
  | "EN_PREPARACION"
  | "LISTO"
  | "ENVIADO"
  | "ENTREGADO"
  | "CANCELADO";

export type EstadoFactura =
  | "PENDIENTE"
  | "PARCIAL"
  | "PAGADA"
  | "VENCIDA"
  | "ANULADA";

// ---------- Cliente ----------

export interface Cliente {
  id: string;
  empresaId: string;
  localId: string;
  code: string;
  name: string;
  taxId?: string; // CUIT / DNI / RUC
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  creditLimit: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClienteDto {
  code: string;
  name: string;
  localId: string;
  taxId?: string;
  address?: string;
  city?: string;
  state?: string;
  email?: string;
  phone?: string;
  creditLimit?: number;
}

export interface UpdateClienteDto extends Partial<
  Omit<CreateClienteDto, "code">
> {
  active?: boolean;
}

export interface FilterClienteDto {
  page?: number;
  limit?: number;
  localId?: string;
  search?: string; // busca en name, code, taxId
  active?: boolean;
}

// ---------- Presupuesto ----------

export interface ItemPresupuesto {
  id: string;
  presupuestoId: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  producto?: { id: string; code: string; name: string; unit: string };
}

export interface Presupuesto {
  id: string;
  empresaId: string;
  localId: string;
  numero: string;
  clienteId: string;
  fecha: string;
  fechaVencimiento: string;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  estado: EstadoPresupuesto;
  notas?: string;
  vendedor: string;
  createdAt: string;
  updatedAt: string;
  cliente?: { id: string; code: string; name: string };
  items?: ItemPresupuesto[];
  _count?: { items: number };
}

export interface ItemPresupuestoDto {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  descuento?: number; // porcentaje, ej: 10 = 10%
}

export interface CreatePresupuestoDto {
  clienteId: string;
  fechaVencimiento?: string; // ISO date, ej: '2026-04-30'
  notas?: string;
  items: ItemPresupuestoDto[];
}

// ---------- Pedido ----------

export interface ItemPedido {
  id: string;
  pedidoId: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  cantidadEntregada: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  producto?: { id: string; code: string; name: string; unit: string };
}

export interface PedidoVenta {
  id: string;
  empresaId: string;
  localId: string;
  numero: string;
  presupuestoId?: string;
  clienteId: string;
  fecha: string;
  fechaEntregaEstimada: string;
  fechaEntregaReal?: string;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  estado: EstadoPedido;
  notas?: string;
  vendedor: string;
  createdAt: string;
  updatedAt: string;
  cliente?: { id: string; code: string; name: string };
  presupuesto?: { id: string; numero: string };
  factura?: { id: string; numero: string; estado: EstadoFactura };
  items?: ItemPedido[];
}

// ---------- Factura ----------

export interface ItemFactura {
  id: string;
  facturaId: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  producto?: { code: string; name: string; unit: string };
}

export interface Factura {
  id: string;
  empresaId: string;
  localId: string;
  numero: string;
  pedidoId?: string;
  clienteId: string;
  fecha: string;
  fechaVencimiento: string;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  estado: EstadoFactura;
  notas?: string;
  createdAt: string;
  updatedAt: string;
  cliente?: { id: string; code: string; name: string };
  pedido?: { id: string; numero: string };
  items?: ItemFactura[];
  cobranzas?: Cobranza[];
  totalCobrado?: number; // calculado por el backend en findOne
  saldoPendiente?: number; // calculado por el backend en findOne
}

export interface CreateFacturaDto {
  pedidoId: string;
  fechaVencimiento?: string;
  notas?: string;
}

// ---------- Cobranza ----------

export interface Cobranza {
  id: string;
  empresaId: string;
  localId: string;
  facturaId: string;
  fecha: string;
  monto: number;
  metodoPago: string; // 'EFECTIVO' | 'TRANSFERENCIA' | 'CHEQUE' | 'TARJETA' | otro
  referencia?: string;
  notas?: string;
  creadoPor: string;
  createdAt: string;
}

export interface CreateCobranzaDto {
  facturaId: string;
  monto: number;
  metodoPago: string;
  fecha?: string; // ISO date, ej: '2026-03-15'
  referencia?: string; // Nro cheque, comprobante, etc.
  notas?: string;
}

// ---------- Saldos cliente ----------

export interface SaldoFactura {
  facturaId: string;
  numero: string;
  fecha: string;
  vencimiento: string;
  total: number;
  cobrado: number;
  saldoPendiente: number;
  vencida: boolean;
}

export interface SaldosCliente {
  saldos: SaldoFactura[];
  totalPendiente: number;
}
```

---

## 2. Crear `lib/services/ventas.service.ts`

```typescript
import apiClient from "@/lib/api-client";
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

// ─── Clientes ────────────────────────────────────────────────

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

// ─── Presupuestos ─────────────────────────────────────────────

export const presupuestosService = {
  getAll: (params?: { page?: number; limit?: number; localId?: string }) =>
    apiClient
      .get<PaginatedResponse<Presupuesto>>("/presupuestos", { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<Presupuesto>>(`/presupuestos/${id}`)
      .then((r) => r.data),

  // localId se pasa como query param requerido
  create: (dto: CreatePresupuestoDto, localId: string) =>
    apiClient
      .post<
        ApiResponse<Presupuesto>
      >("/presupuestos", dto, { params: { localId } })
      .then((r) => r.data),

  // Convierte el presupuesto en un PedidoVenta; estado pasa a APROBADO
  convertirAPedido: (id: string) =>
    apiClient
      .post<ApiResponse<PedidoVenta>>(`/presupuestos/${id}/convertir-pedido`)
      .then((r) => r.data),

  cambiarEstado: (id: string, estado: EstadoPresupuesto) =>
    apiClient
      .patch<ApiResponse<Presupuesto>>(`/presupuestos/${id}/estado`, { estado })
      .then((r) => r.data),
};

// ─── Pedidos ──────────────────────────────────────────────────

export const pedidosService = {
  getAll: (params?: { page?: number; limit?: number; localId?: string }) =>
    apiClient
      .get<PaginatedResponse<PedidoVenta>>("/pedidos", { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<PedidoVenta>>(`/pedidos/${id}`)
      .then((r) => r.data),

  // Aprueba un pedido (estado pasa a CONFIRMADO)
  aprobar: (id: string) =>
    apiClient
      .post<ApiResponse<PedidoVenta>>(`/pedidos/${id}/aprobar`)
      .then((r) => r.data),
};

// ─── Facturas ─────────────────────────────────────────────────

export const facturasService = {
  getAll: (params?: { page?: number; limit?: number; localId?: string }) =>
    apiClient
      .get<PaginatedResponse<Factura>>("/facturas", { params })
      .then((r) => r.data),

  // Incluye totalCobrado y saldoPendiente
  getOne: (id: string) =>
    apiClient.get<ApiResponse<Factura>>(`/facturas/${id}`).then((r) => r.data),

  // Genera factura desde un pedido aprobado; descuenta stock automáticamente
  desdePedido: (dto: CreateFacturaDto) =>
    apiClient
      .post<ApiResponse<Factura>>("/facturas/desde-pedido", dto)
      .then((r) => r.data),

  // Anula la factura y revierte el stock (solo si no tiene cobranzas)
  anular: (id: string, motivo: string) =>
    apiClient
      .delete<
        ApiResponse<Factura>
      >(`/facturas/${id}/anular`, { data: { motivo } })
      .then((r) => r.data),
};

// ─── Cobranzas ────────────────────────────────────────────────

export const cobranzasService = {
  getAll: (params?: { page?: number; limit?: number; localId?: string }) =>
    apiClient
      .get<PaginatedResponse<Cobranza>>("/cobranzas", { params })
      .then((r) => r.data),

  create: (dto: CreateCobranzaDto) =>
    apiClient
      .post<ApiResponse<Cobranza>>("/cobranzas", dto)
      .then((r) => r.data),
};
```

---

## 3. Crear `hooks/useVentas.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clientesService,
  presupuestosService,
  pedidosService,
  facturasService,
  cobranzasService,
} from "@/lib/services/ventas.service";
import type {
  FilterClienteDto,
  CreateClienteDto,
  UpdateClienteDto,
  CreatePresupuestoDto,
  EstadoPresupuesto,
  CreateFacturaDto,
  CreateCobranzaDto,
} from "@/lib/api-types";

// ─── Clientes ────────────────────────────────────────────────

export function useClientes(filter?: FilterClienteDto) {
  return useQuery({
    queryKey: ["clientes", filter],
    queryFn: () => clientesService.getAll(filter),
  });
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: ["clientes", id],
    queryFn: () => clientesService.getOne(id),
    enabled: !!id,
  });
}

export function useClienteSaldos(id: string) {
  return useQuery({
    queryKey: ["clientes", id, "saldos"],
    queryFn: () => clientesService.getSaldos(id),
    enabled: !!id,
  });
}

export function useCrearCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateClienteDto) => clientesService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });
}

export function useActualizarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateClienteDto }) =>
      clientesService.update(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
      qc.invalidateQueries({ queryKey: ["clientes", id] });
    },
  });
}

// ─── Presupuestos ─────────────────────────────────────────────

export function usePresupuestos(params?: {
  page?: number;
  limit?: number;
  localId?: string;
}) {
  return useQuery({
    queryKey: ["presupuestos", params],
    queryFn: () => presupuestosService.getAll(params),
  });
}

export function usePresupuesto(id: string) {
  return useQuery({
    queryKey: ["presupuestos", id],
    queryFn: () => presupuestosService.getOne(id),
    enabled: !!id,
  });
}

export function useCrearPresupuesto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      dto,
      localId,
    }: {
      dto: CreatePresupuestoDto;
      localId: string;
    }) => presupuestosService.create(dto, localId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["presupuestos"] }),
  });
}

export function useConvertirPresupuesto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => presupuestosService.convertirAPedido(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["presupuestos"] });
      qc.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });
}

export function useCambiarEstadoPresupuesto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoPresupuesto }) =>
      presupuestosService.cambiarEstado(id, estado),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["presupuestos"] });
      qc.invalidateQueries({ queryKey: ["presupuestos", id] });
    },
  });
}

// ─── Pedidos ──────────────────────────────────────────────────

export function usePedidos(params?: {
  page?: number;
  limit?: number;
  localId?: string;
}) {
  return useQuery({
    queryKey: ["pedidos", params],
    queryFn: () => pedidosService.getAll(params),
  });
}

export function usePedido(id: string) {
  return useQuery({
    queryKey: ["pedidos", id],
    queryFn: () => pedidosService.getOne(id),
    enabled: !!id,
  });
}

export function useAprobarPedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pedidosService.aprobar(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      qc.invalidateQueries({ queryKey: ["pedidos", id] });
    },
  });
}

// ─── Facturas ─────────────────────────────────────────────────

export function useFacturas(params?: {
  page?: number;
  limit?: number;
  localId?: string;
}) {
  return useQuery({
    queryKey: ["facturas", params],
    queryFn: () => facturasService.getAll(params),
  });
}

export function useFactura(id: string) {
  return useQuery({
    queryKey: ["facturas", id],
    queryFn: () => facturasService.getOne(id),
    enabled: !!id,
  });
}

export function useCrearFacturaDesdePedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateFacturaDto) => facturasService.desdePedido(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["facturas"] });
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      // El stock cambia al facturar
      qc.invalidateQueries({ queryKey: ["inventario"] });
    },
  });
}

export function useAnularFactura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      facturasService.anular(id, motivo),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["facturas"] });
      qc.invalidateQueries({ queryKey: ["facturas", id] });
      // Stock se revierte al anular
      qc.invalidateQueries({ queryKey: ["inventario"] });
    },
  });
}

// ─── Cobranzas ────────────────────────────────────────────────

export function useCobranzas(params?: {
  page?: number;
  limit?: number;
  localId?: string;
}) {
  return useQuery({
    queryKey: ["cobranzas", params],
    queryFn: () => cobranzasService.getAll(params),
  });
}

export function useCrearCobranza() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCobranzaDto) => cobranzasService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cobranzas"] });
      qc.invalidateQueries({ queryKey: ["facturas"] });
      // Actualizar saldos del cliente
      qc.invalidateQueries({ queryKey: ["clientes"] });
    },
  });
}
```

---

## 4. Actualizar `app/(dashboard)/ventas/page.tsx`

Reemplazar el componente completo con esta versión que muestra stats reales:

```tsx
"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Users,
  UserCheck,
  FileText,
  ClipboardList,
  Receipt,
  DollarSign,
} from "lucide-react";
import { useClientes } from "@/hooks/useVentas";
import { usePresupuestos } from "@/hooks/useVentas";
import { usePedidos } from "@/hooks/useVentas";
import { useFacturas } from "@/hooks/useVentas";
import { useCobranzas } from "@/hooks/useVentas";
import { useLocal } from "@/contexts/LocalContext"; // provee localId activo

export default function VentasResumenPage() {
  const { localId } = useLocal();

  const { data: clientesData } = useClientes({
    localId,
    active: true,
    limit: 1,
  });
  const { data: presupuestosData } = usePresupuestos({ localId, limit: 1 });
  const { data: pedidosData } = usePedidos({ localId, limit: 1 });
  const { data: facturasData } = useFacturas({ localId, limit: 1 });
  const { data: cobranzasData } = useCobranzas({ localId, limit: 1 });

  const totalClientes = clientesData?.meta?.total ?? "—";
  const totalPresupuestos = presupuestosData?.meta?.total ?? "—";
  const pedidosPendientes = pedidosData?.meta?.total ?? "—";
  const totalFacturas = facturasData?.meta?.total ?? "—";
  const totalCobranzas = cobranzasData?.meta?.total ?? "—";

  const menuItems = [
    {
      href: "/ventas/clientes",
      icon: Users,
      title: "Clientes",
      description: "Gestión de clientes y cuentas",
      color: "bg-blue-500",
      stats: `${totalClientes} clientes activos`,
    },
    {
      href: "/ventas/seguimiento",
      icon: UserCheck,
      title: "Seguimiento",
      description: "Seguimiento de clientes e interacciones",
      color: "bg-cyan-500",
      stats: "Ver interacciones",
    },
    {
      href: "/ventas/presupuestos",
      icon: FileText,
      title: "Presupuestos",
      description: "Cotizaciones y presupuestos",
      color: "bg-purple-500",
      stats: `${totalPresupuestos} presupuestos`,
    },
    {
      href: "/ventas/pedidos",
      icon: ClipboardList,
      title: "Pedidos",
      description: "Órdenes de venta y pedidos",
      color: "bg-indigo-500",
      stats: `${pedidosPendientes} pedidos`,
    },
    {
      href: "/ventas/facturas",
      icon: Receipt,
      title: "Facturas",
      description: "Facturación y comprobantes",
      color: "bg-green-500",
      stats: `${totalFacturas} facturas`,
    },
    {
      href: "/ventas/cobranzas",
      icon: DollarSign,
      title: "Cobranzas",
      description: "Gestión de cobros y pagos",
      color: "bg-emerald-500",
      stats: `${totalCobranzas} cobranzas`,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Módulo de Ventas</h1>
        <p className="text-gray-600 mt-1">
          Gestión completa del área de comercialización
        </p>
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
          <ShoppingBag className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Flujo de Ventas
            </h3>
            <p className="text-sm text-blue-700">
              El módulo de ventas administra el ciclo completo de
              comercialización.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-blue-800">
              <span className="font-medium">Flujo:</span>
              <span className="px-2 py-1 bg-blue-100 rounded">Seguimiento</span>
              <span>→</span>
              <span className="px-2 py-1 bg-blue-100 rounded">Presupuesto</span>
              <span>→</span>
              <span className="px-2 py-1 bg-blue-100 rounded">Pedido</span>
              <span>→</span>
              <span className="px-2 py-1 bg-blue-100 rounded">Factura</span>
              <span>→</span>
              <span className="px-2 py-1 bg-blue-100 rounded">Cobranza</span>
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

### 5.1 Listar clientes con búsqueda y filtro de activos

```tsx
// app/(dashboard)/ventas/clientes/page.tsx
"use client";
import { useState } from "react";
import { useClientes } from "@/hooks/useVentas";
import { useLocal } from "@/contexts/LocalContext";

export default function ClientesPage() {
  const { localId } = useLocal();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useClientes({
    localId,
    search,
    active: true,
    limit: 20,
  });

  if (isLoading) return <p>Cargando...</p>;

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nombre, código o CUIT..."
      />
      <ul>
        {data?.data.map((c) => (
          <li key={c.id}>
            {c.code} — {c.name}
          </li>
        ))}
      </ul>
      <p>Total: {data?.meta.total}</p>
    </div>
  );
}
```

### 5.2 Crear un presupuesto

```tsx
import { useCrearPresupuesto } from "@/hooks/useVentas";
import { useLocal } from "@/contexts/LocalContext";

function NuevoPresupuestoForm({ clienteId }: { clienteId: string }) {
  const { localId } = useLocal();
  const { mutate, isPending, error } = useCrearPresupuesto();

  const handleSubmit = () => {
    mutate({
      localId,
      dto: {
        clienteId,
        fechaVencimiento: "2026-04-30",
        notas: "Válido por 30 días",
        items: [
          {
            productoId: "uuid-producto",
            cantidad: 5,
            precioUnitario: 1200,
            descuento: 10,
          },
        ],
      },
    });
  };

  return (
    <button onClick={handleSubmit} disabled={isPending}>
      {isPending ? "Guardando..." : "Crear presupuesto"}
    </button>
  );
}
```

### 5.3 Flujo completo: Presupuesto → Pedido → Factura → Cobranza

```tsx
import {
  useConvertirPresupuesto,
  useAprobarPedido,
  useCrearFacturaDesdePedido,
  useCrearCobranza,
} from "@/hooks/useVentas";

// 1. Convertir presupuesto a pedido
const convertir = useConvertirPresupuesto();
convertir.mutate(presupuestoId); // estado presupuesto → APROBADO, crea PedidoVenta

// 2. Aprobar el pedido (estado → CONFIRMADO)
const aprobar = useAprobarPedido();
aprobar.mutate(pedidoId);

// 3. Generar factura (descuenta stock automáticamente)
const facturar = useCrearFacturaDesdePedido();
facturar.mutate({ pedidoId, fechaVencimiento: "2026-04-30" });

// 4. Registrar cobranza parcial
const cobrar = useCrearCobranza();
cobrar.mutate({
  facturaId,
  monto: 5000,
  metodoPago: "TRANSFERENCIA",
  referencia: "CBU 0123456789",
});
```

### 5.4 Consultar saldos de un cliente

```tsx
import { useClienteSaldos } from "@/hooks/useVentas";

function SaldosCliente({ clienteId }: { clienteId: string }) {
  const { data } = useClienteSaldos(clienteId);
  const saldos = data?.data;

  return (
    <div>
      <p>Total pendiente: ${saldos?.totalPendiente.toFixed(2)}</p>
      {saldos?.saldos.map((s) => (
        <div key={s.facturaId} className={s.vencida ? "text-red-600" : ""}>
          Factura #{s.numero} — Saldo: ${s.saldoPendiente.toFixed(2)}
          {s.vencida && " ⚠ VENCIDA"}
        </div>
      ))}
    </div>
  );
}
```

### 5.5 Anular una factura

```tsx
import { useAnularFactura } from "@/hooks/useVentas";

function AnularFacturaButton({ facturaId }: { facturaId: string }) {
  const { mutate, isPending } = useAnularFactura();

  const handleAnular = () => {
    const motivo = window.prompt("Motivo de anulación:");
    if (motivo) mutate({ id: facturaId, motivo });
  };

  return (
    <button
      onClick={handleAnular}
      disabled={isPending}
      className="text-red-600"
    >
      {isPending ? "Anulando..." : "Anular factura"}
    </button>
  );
}
```

---

## 6. Referencia rápida de endpoints

| Acción              | Método   | Endpoint                             |
| ------------------- | -------- | ------------------------------------ |
| Listar clientes     | `GET`    | `/clientes?localId=&search=&active=` |
| Obtener cliente     | `GET`    | `/clientes/:id`                      |
| Saldos de cliente   | `GET`    | `/clientes/:id/saldos`               |
| Crear cliente       | `POST`   | `/clientes`                          |
| Actualizar cliente  | `PATCH`  | `/clientes/:id`                      |
| Listar presupuestos | `GET`    | `/presupuestos?localId=`             |
| Obtener presupuesto | `GET`    | `/presupuestos/:id`                  |
| Crear presupuesto   | `POST`   | `/presupuestos?localId=UUID`         |
| Convertir a pedido  | `POST`   | `/presupuestos/:id/convertir-pedido` |
| Cambiar estado      | `PATCH`  | `/presupuestos/:id/estado`           |
| Listar pedidos      | `GET`    | `/pedidos?localId=`                  |
| Obtener pedido      | `GET`    | `/pedidos/:id`                       |
| Aprobar pedido      | `POST`   | `/pedidos/:id/aprobar`               |
| Listar facturas     | `GET`    | `/facturas?localId=`                 |
| Obtener factura     | `GET`    | `/facturas/:id`                      |
| Crear desde pedido  | `POST`   | `/facturas/desde-pedido`             |
| Anular factura      | `DELETE` | `/facturas/:id/anular`               |
| Listar cobranzas    | `GET`    | `/cobranzas?localId=`                |
| Registrar cobranza  | `POST`   | `/cobranzas`                         |

---

## 7. Valores de estado

### `EstadoPresupuesto`

| Valor       | Descripción              |
| ----------- | ------------------------ |
| `BORRADOR`  | Recién creado (default)  |
| `ENVIADO`   | Enviado al cliente       |
| `APROBADO`  | Convertido a pedido      |
| `RECHAZADO` | Rechazado por el cliente |
| `VENCIDO`   | Expiró sin respuesta     |

### `EstadoPedido`

| Valor            | Descripción                     |
| ---------------- | ------------------------------- |
| `PENDIENTE`      | Recién creado desde presupuesto |
| `CONFIRMADO`     | Aprobado internamente           |
| `EN_PREPARACION` | En proceso de armado            |
| `LISTO`          | Listo para despachar            |
| `ENVIADO`        | En camino al cliente            |
| `ENTREGADO`      | Entregado                       |
| `CANCELADO`      | Cancelado                       |

### `EstadoFactura`

| Valor       | Descripción                   |
| ----------- | ----------------------------- |
| `PENDIENTE` | Sin cobranzas (default)       |
| `PARCIAL`   | Cobrada parcialmente          |
| `PAGADA`    | Cobrada en su totalidad       |
| `VENCIDA`   | Fecha de vencimiento superada |
| `ANULADA`   | Anulada (stock revertido)     |

### `metodoPago` (string libre)

Valores convencionales: `'EFECTIVO'`, `'TRANSFERENCIA'`, `'CHEQUE'`, `'TARJETA'`, `'MERCADOPAGO'`.

---

## 8. Notas importantes

1. **`localId` en presupuestos**: Se pasa como query param `?localId=UUID`, no en el body.
2. **Stock y facturas**: Al emitir una factura (`/facturas/desde-pedido`) el backend descuenta stock automáticamente. Al anularla, lo repone. Por eso `useCrearFacturaDesdePedido` y `useAnularFactura` invalidan la queryKey `['inventario']`.
3. **Anular facturas con cobranzas**: El backend devuelve `400` si la factura ya tiene cobranzas. Mostrar el error al usuario.
4. **`totalCobrado` y `saldoPendiente`**: Solo están disponibles en `GET /facturas/:id` (findOne), no en el listado.
5. **Saldos del cliente**: `GET /clientes/:id/saldos` solo devuelve facturas en estado `PENDIENTE` o `PARCIAL`. Las pagadas o anuladas no aparecen.
6. **`creditLimit`**: Campo informativo, no lo valida el backend en ninguna transacción.
