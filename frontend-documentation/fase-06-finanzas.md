# Fase 06 — Finanzas

## Objetivo

Conectar el módulo de Finanzas al backend real: Plan de Cuentas → Asientos Contables → Cuentas por Cobrar / Pagar → Bancos → Caja → Retenciones.

---

## 0. Contexto previo

- **Fase 01**: `api-client.ts`, tokens, `QueryProvider`.
- **Fase 04**: tipos de Ventas en `api-types.ts` (las facturas generan CxC).
- **Fase 05**: tipos de Compras en `api-types.ts` (las órdenes de compra generan CxP).

---

## 1. Agregar tipos en `lib/api-types.ts`

```typescript
// ─── FINANZAS ──────────────────────────────────────────────

export type TipoCuenta =
  | "ACTIVO"
  | "PASIVO"
  | "PATRIMONIO"
  | "INGRESO"
  | "EGRESO";
export type NaturalezaCuenta = "DEUDORA" | "ACREEDORA";
export type EstadoAsiento = "BORRADOR" | "CONFIRMADO" | "ANULADO";
export type TipoRetencion = "IVA" | "GANANCIAS" | "INGRESOS_BRUTOS" | "OTRAS";
export type EstadoCuentaCobrar =
  | "PENDIENTE"
  | "PARCIAL"
  | "COBRADA"
  | "VENCIDA"
  | "INCOBRABLE";
export type EstadoCuentaPagar = "PENDIENTE" | "PARCIAL" | "PAGADA" | "VENCIDA";

// ---------- Plan de Cuentas ----------

export interface CuentaContable {
  id: string;
  empresaId: string;
  code: string; // código jerárquico, ej: '1.1.01'
  nombre: string;
  tipo: TipoCuenta;
  naturaleza: NaturalezaCuenta;
  nivel: number; // 1 = raíz
  cuentaPadreId?: string;
  imputable: boolean; // solo cuentas imputables reciben asientos
  createdAt: string;
  parent?: { code: string; nombre: string };
  children?: CuentaContable[];
  _count?: { detallesAsiento: number };
}

export interface CreateCuentaDto {
  code: string; // ej: '1.1.01' — debe ser único en la empresa
  nombre: string;
  tipo: TipoCuenta;
  naturaleza: NaturalezaCuenta;
  nivel?: number; // default 1
  cuentaPadreId?: string; // UUID de la cuenta padre (null = raíz)
  imputable?: boolean; // default true
}

export interface MayorContable {
  cuenta: { code: string; nombre: string; naturaleza: NaturalezaCuenta };
  movimientos: Array<{
    id: string;
    cuentaId: string;
    debe: number;
    haber: number;
    descripcion?: string;
    saldoAcumulado: number;
    asiento: { id: string; numero: number; fecha: string; descripcion: string };
  }>;
  totales: { debe: number; haber: number; saldoFinal: number };
}

// ---------- Asientos Contables ----------

export interface DetalleAsiento {
  id: string;
  asientoId: string;
  cuentaId: string;
  debe: number;
  haber: number;
  descripcion?: string;
  cuenta?: { code: string; nombre: string; naturaleza: NaturalezaCuenta };
}

export interface AsientoContable {
  id: string;
  empresaId: string;
  numero: number;
  fecha: string;
  descripcion: string;
  referencia?: string;
  totalDebe: number;
  totalHaber: number;
  estado: EstadoAsiento;
  tipo: string; // 'MANUAL' | 'AUTOMATICO'
  creadoPor: string;
  createdAt: string;
  detalles?: DetalleAsiento[];
  _count?: { detalles: number };
}

export interface DetalleAsientoDto {
  cuentaId: string;
  debe: number; // 0 si es HABER
  haber: number; // 0 si es DEBE
  descripcion?: string;
}

export interface CreateAsientoDto {
  fecha?: string; // ISO date — default: hoy
  descripcion: string;
  referencia?: string;
  detalles: DetalleAsientoDto[]; // mínimo 2; totalDebe DEBE ser igual a totalHaber
}

// ---------- Cuentas por Cobrar ----------

export interface CuentaPorCobrar {
  id: string;
  empresaId: string;
  localId: string;
  clienteId: string;
  facturaId?: string;
  estado: EstadoCuentaCobrar;
  montoOriginal: number;
  montoSaldo: number;
  fechaVencimiento: string;
  diasVencido: number;
  cliente?: { id: string; name: string };
  factura?: { id: string; numero: string; fecha: string };
}

export interface ResumenCxC {
  totalPendiente: number;
  totalVencido: number;
  cantidadPendiente: number;
  cantidadVencida: number;
}

// ---------- Cuentas por Pagar ----------

export interface CuentaPorPagar {
  id: string;
  empresaId: string;
  localId: string;
  proveedorId: string;
  ordenCompraId?: string;
  estado: EstadoCuentaPagar;
  montoOriginal: number;
  montoSaldo: number;
  fechaVencimiento: string;
  diasVencido: number;
  proveedor?: { id: string; name: string };
  ordenCompra?: { id: string; numero: string; fecha: string };
}

export interface ResumenCxP {
  totalPendiente: number;
  totalVencido: number;
  cantidadPendiente: number;
  cantidadVencida: number;
}

// ---------- Bancos ----------

export interface CuentaBancaria {
  id: string;
  empresaId: string;
  numero: string;
  alias?: string;
  tipoCuenta: string;
  saldo: number;
  banco?: { id: string; nombre: string };
  _count?: { movimientos: number };
}

export interface MovimientoBancario {
  id: string;
  empresaId: string;
  cuentaBancariaId: string;
  tipo: "CREDITO" | "DEBITO";
  monto: number;
  fecha: string;
  concepto: string;
  referencia?: string;
  saldoAnterior: number;
  saldoNuevo: number;
  creadoPor: string;
  createdAt: string;
}

export interface CreateMovimientoBancarioDto {
  cuentaBancariaId: string;
  tipo: "CREDITO" | "DEBITO";
  monto: number;
  concepto: string; // requerido
  fecha?: string; // ISO date — default: hoy
  referencia?: string;
}

// ---------- Caja ----------

export interface CajaLocal {
  id: string;
  empresaId: string;
  localId: string;
  saldo: number;
  updatedAt: string;
}

export interface MovimientoCaja {
  id: string;
  empresaId: string;
  localId: string;
  tipo: "INGRESO" | "EGRESO";
  monto: number;
  concepto: string;
  referencia?: string;
  saldoAnterior: number;
  saldoNuevo: number;
  creadoPor: string;
  fecha: string;
  createdAt: string;
}

export interface MovimientoCajaDto {
  tipo: "INGRESO" | "EGRESO";
  monto: number;
  concepto: string; // requerido
  referencia?: string;
}

// ---------- Retenciones ----------

export interface Retencion {
  id: string;
  empresaId: string;
  localId: string;
  tipo: TipoRetencion;
  numero: string;
  fecha: string;
  proveedorNombre?: string;
  clienteNombre?: string;
  importe: number;
  alicuota: number;
  baseImponible: number;
  descripcion?: string;
  creadoPor: string;
  createdAt: string;
}

export interface CreateRetencionDto {
  tipo: TipoRetencion;
  numero: string; // ej: '0001-00001234'
  importe: number;
  alicuota: number; // porcentaje, ej: 3.5
  baseImponible: number;
  fecha?: string; // ISO date — default: hoy
  proveedorNombre?: string;
  clienteNombre?: string;
  descripcion?: string;
}
```

---

## 2. Crear `lib/services/finanzas.service.ts`

```typescript
import apiClient from "@/lib/api-client";
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

// ─── Plan de Cuentas ──────────────────────────────────────────

export const planCuentasService = {
  // Devuelve árbol completo (solo raíces, con children anidados)
  getAll: () =>
    apiClient
      .get<ApiResponse<CuentaContable[]>>("/plan-cuentas")
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<CuentaContable>>(`/plan-cuentas/${id}`)
      .then((r) => r.data),

  create: (dto: CreateCuentaDto) =>
    apiClient
      .post<ApiResponse<CuentaContable>>("/plan-cuentas", dto)
      .then((r) => r.data),

  // Mayor: movimientos de una cuenta ordenados por fecha + saldo acumulado
  getMayor: (id: string, params?: { desde?: string; hasta?: string }) =>
    apiClient
      .get<ApiResponse<MayorContable>>(`/plan-cuentas/${id}/mayor`, { params })
      .then((r) => r.data),
};

// ─── Asientos Contables ───────────────────────────────────────

export const asientosService = {
  getAll: (params?: { page?: number; limit?: number }) =>
    apiClient
      .get<PaginatedResponse<AsientoContable>>("/asientos", { params })
      .then((r) => r.data),

  getOne: (id: string) =>
    apiClient
      .get<ApiResponse<AsientoContable>>(`/asientos/${id}`)
      .then((r) => r.data),

  // localId es query param requerido
  create: (dto: CreateAsientoDto, localId: string) =>
    apiClient
      .post<
        ApiResponse<AsientoContable>
      >("/asientos", dto, { params: { localId } })
      .then((r) => r.data),
};

// ─── Cuentas por Cobrar ───────────────────────────────────────

export const cuentasCobrarService = {
  getAll: (params?: { page?: number; limit?: number; localId?: string }) =>
    apiClient
      .get<PaginatedResponse<CuentaPorCobrar>>("/cuentas-cobrar", { params })
      .then((r) => r.data),

  getResumen: () =>
    apiClient
      .get<ApiResponse<ResumenCxC>>("/cuentas-cobrar/resumen")
      .then((r) => r.data),
};

// ─── Cuentas por Pagar ────────────────────────────────────────

export const cuentasPagarService = {
  getAll: (params?: { page?: number; limit?: number; localId?: string }) =>
    apiClient
      .get<PaginatedResponse<CuentaPorPagar>>("/cuentas-pagar", { params })
      .then((r) => r.data),

  getResumen: () =>
    apiClient
      .get<ApiResponse<ResumenCxP>>("/cuentas-pagar/resumen")
      .then((r) => r.data),
};

// ─── Bancos ───────────────────────────────────────────────────

export const bancosService = {
  getCuentas: () =>
    apiClient
      .get<ApiResponse<CuentaBancaria[]>>("/bancos/cuentas")
      .then((r) => r.data),

  getMovimientos: (
    cuentaId: string,
    params?: { page?: number; limit?: number },
  ) =>
    apiClient
      .get<
        PaginatedResponse<MovimientoBancario>
      >(`/bancos/cuentas/${cuentaId}/movimientos`, { params })
      .then((r) => r.data),

  registrarMovimiento: (dto: CreateMovimientoBancarioDto) =>
    apiClient
      .post<
        ApiResponse<{ movimiento: MovimientoBancario; saldoNuevo: number }>
      >("/bancos/movimientos", dto)
      .then((r) => r.data),
};

// ─── Caja ─────────────────────────────────────────────────────

export const cajaService = {
  getSaldo: (localId: string) =>
    apiClient
      .get<ApiResponse<CajaLocal>>(`/caja/${localId}`)
      .then((r) => r.data),

  getMovimientos: (
    localId: string,
    params?: { page?: number; limit?: number },
  ) =>
    apiClient
      .get<
        PaginatedResponse<MovimientoCaja>
      >(`/caja/${localId}/movimientos`, { params })
      .then((r) => r.data),

  registrarMovimiento: (localId: string, dto: MovimientoCajaDto) =>
    apiClient
      .post<
        ApiResponse<{
          movimiento: MovimientoCaja;
          saldoAnterior: number;
          saldoNuevo: number;
        }>
      >(`/caja/${localId}/movimiento`, dto)
      .then((r) => r.data),
};

// ─── Retenciones ──────────────────────────────────────────────

export const retencionesService = {
  getAll: (params?: { page?: number; limit?: number }) =>
    apiClient
      .get<PaginatedResponse<Retencion>>("/retenciones", { params })
      .then((r) => r.data),

  // localId como query param
  create: (dto: CreateRetencionDto, localId: string) =>
    apiClient
      .post<
        ApiResponse<Retencion>
      >("/retenciones", dto, { params: { localId } })
      .then((r) => r.data),
};
```

---

## 3. Crear `hooks/useFinanzas.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  planCuentasService,
  asientosService,
  cuentasCobrarService,
  cuentasPagarService,
  bancosService,
  cajaService,
  retencionesService,
} from "@/lib/services/finanzas.service";
import type {
  CreateCuentaDto,
  CreateAsientoDto,
  CreateMovimientoBancarioDto,
  MovimientoCajaDto,
  CreateRetencionDto,
} from "@/lib/api-types";

// ─── Plan de Cuentas ──────────────────────────────────────────

export function usePlanCuentas() {
  return useQuery({
    queryKey: ["planCuentas"],
    queryFn: () => planCuentasService.getAll(),
    // El árbol de cuentas cambia poco — cache más largo
    staleTime: 10 * 60 * 1000,
  });
}

export function useCuentaContable(id: string) {
  return useQuery({
    queryKey: ["planCuentas", id],
    queryFn: () => planCuentasService.getOne(id),
    enabled: !!id,
  });
}

export function useMayorContable(
  id: string,
  params?: { desde?: string; hasta?: string },
) {
  return useQuery({
    queryKey: ["mayor", id, params],
    queryFn: () => planCuentasService.getMayor(id, params),
    enabled: !!id,
  });
}

export function useCrearCuenta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCuentaDto) => planCuentasService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["planCuentas"] }),
  });
}

// ─── Asientos ─────────────────────────────────────────────────

export function useAsientos(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["asientos", params],
    queryFn: () => asientosService.getAll(params),
  });
}

export function useAsiento(id: string) {
  return useQuery({
    queryKey: ["asientos", id],
    queryFn: () => asientosService.getOne(id),
    enabled: !!id,
  });
}

export function useCrearAsiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      dto,
      localId,
    }: {
      dto: CreateAsientoDto;
      localId: string;
    }) => asientosService.create(dto, localId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["asientos"] });
      // Los asientos afectan el mayor de las cuentas
      qc.invalidateQueries({ queryKey: ["mayor"] });
    },
  });
}

// ─── Cuentas por Cobrar ───────────────────────────────────────

export function useCuentasCobrar(params?: {
  page?: number;
  limit?: number;
  localId?: string;
}) {
  return useQuery({
    queryKey: ["cuentasCobrar", params],
    queryFn: () => cuentasCobrarService.getAll(params),
  });
}

export function useResumenCxC() {
  return useQuery({
    queryKey: ["cuentasCobrar", "resumen"],
    queryFn: () => cuentasCobrarService.getResumen(),
  });
}

// ─── Cuentas por Pagar ────────────────────────────────────────

export function useCuentasPagar(params?: {
  page?: number;
  limit?: number;
  localId?: string;
}) {
  return useQuery({
    queryKey: ["cuentasPagar", params],
    queryFn: () => cuentasPagarService.getAll(params),
  });
}

export function useResumenCxP() {
  return useQuery({
    queryKey: ["cuentasPagar", "resumen"],
    queryFn: () => cuentasPagarService.getResumen(),
  });
}

// ─── Bancos ───────────────────────────────────────────────────

export function useCuentasBancarias() {
  return useQuery({
    queryKey: ["bancos", "cuentas"],
    queryFn: () => bancosService.getCuentas(),
  });
}

export function useMovimientosBancarios(
  cuentaId: string,
  params?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: ["bancos", "movimientos", cuentaId, params],
    queryFn: () => bancosService.getMovimientos(cuentaId, params),
    enabled: !!cuentaId,
  });
}

export function useRegistrarMovimientoBancario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMovimientoBancarioDto) =>
      bancosService.registrarMovimiento(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bancos"] });
    },
  });
}

// ─── Caja ─────────────────────────────────────────────────────

export function useSaldoCaja(localId: string) {
  return useQuery({
    queryKey: ["caja", localId, "saldo"],
    queryFn: () => cajaService.getSaldo(localId),
    enabled: !!localId,
  });
}

export function useMovimientosCaja(
  localId: string,
  params?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: ["caja", localId, "movimientos", params],
    queryFn: () => cajaService.getMovimientos(localId, params),
    enabled: !!localId,
  });
}

export function useRegistrarMovimientoCaja() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      localId,
      dto,
    }: {
      localId: string;
      dto: MovimientoCajaDto;
    }) => cajaService.registrarMovimiento(localId, dto),
    onSuccess: (_data, { localId }) => {
      qc.invalidateQueries({ queryKey: ["caja", localId] });
    },
  });
}

// ─── Retenciones ──────────────────────────────────────────────

export function useRetenciones(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["retenciones", params],
    queryFn: () => retencionesService.getAll(params),
  });
}

export function useRegistrarRetencion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      dto,
      localId,
    }: {
      dto: CreateRetencionDto;
      localId: string;
    }) => retencionesService.create(dto, localId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["retenciones"] }),
  });
}
```

---

## 4. Actualizar `app/(dashboard)/finanzas/page.tsx`

```tsx
"use client";

import Link from "next/link";
import {
  DollarSign,
  BookOpen,
  FileText,
  TrendingUp,
  Receipt,
  CreditCard,
  Building2,
  Lock,
} from "lucide-react";
import { usePlanCuentas } from "@/hooks/useFinanzas";
import { useAsientos } from "@/hooks/useFinanzas";
import { useResumenCxC } from "@/hooks/useFinanzas";
import { useResumenCxP } from "@/hooks/useFinanzas";

export default function FinanzasResumenPage() {
  const { data: planData } = usePlanCuentas();
  const { data: asientosData } = useAsientos({ limit: 1 });
  const { data: resumenCxC } = useResumenCxC();
  const { data: resumenCxP } = useResumenCxP();

  // Plan de cuentas devuelve árbol (no paginado) → contar cuentas raíz
  const totalCuentas = planData?.data?.length ?? "—";
  const totalAsientos = asientosData?.meta?.total ?? "—";

  const totalCobrar =
    resumenCxC?.data?.totalPendiente != null
      ? `$${resumenCxC.data.totalPendiente.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`
      : "—";

  const totalPagar =
    resumenCxP?.data?.totalPendiente != null
      ? `$${resumenCxP.data.totalPendiente.toLocaleString("es-AR", { minimumFractionDigits: 0 })}`
      : "—";

  const menuItems = [
    {
      href: "/finanzas/plan-cuentas",
      icon: BookOpen,
      title: "Plan de Cuentas",
      description: "Estructura contable de la empresa",
      color: "bg-blue-500",
      stats: `${totalCuentas} cuentas raíz`,
    },
    {
      href: "/finanzas/asientos",
      icon: FileText,
      title: "Asientos Contables",
      description: "Registro de operaciones contables",
      color: "bg-purple-500",
      stats: `${totalAsientos} asientos`,
    },
    {
      href: "/finanzas/cuentas-cobrar",
      icon: DollarSign,
      title: "Cuentas por Cobrar",
      description: "Créditos pendientes de clientes",
      color: "bg-emerald-500",
      stats: `${totalCobrar} pendiente`,
    },
    {
      href: "/finanzas/cuentas-pagar",
      icon: CreditCard,
      title: "Cuentas por Pagar",
      description: "Deudas pendientes con proveedores",
      color: "bg-red-500",
      stats: `${totalPagar} pendiente`,
    },
    {
      href: "/finanzas/bancos",
      icon: Building2,
      title: "Bancos",
      description: "Cuentas bancarias y movimientos",
      color: "bg-indigo-500",
      stats: "Ver cuentas",
    },
    {
      href: "/finanzas/caja",
      icon: Lock,
      title: "Caja",
      description: "Movimientos de caja del local",
      color: "bg-yellow-500",
      stats: "Ver saldo",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Módulo de Finanzas</h1>
        <p className="text-gray-600 mt-1">Contabilidad y gestión financiera</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 border border-gray-200 hover:border-green-300"
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

      {resumenCxC?.data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">CxC pendiente</p>
            <p className="text-lg font-bold text-emerald-600">
              $
              {resumenCxC.data.totalPendiente.toLocaleString("es-AR", {
                minimumFractionDigits: 0,
              })}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">CxC vencida</p>
            <p className="text-lg font-bold text-red-600">
              $
              {resumenCxC.data.totalVencido.toLocaleString("es-AR", {
                minimumFractionDigits: 0,
              })}
            </p>
          </div>
          {resumenCxP?.data && (
            <>
              <div className="bg-white border rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">CxP pendiente</p>
                <p className="text-lg font-bold text-orange-600">
                  $
                  {resumenCxP.data.totalPendiente.toLocaleString("es-AR", {
                    minimumFractionDigits: 0,
                  })}
                </p>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">CxP vencida</p>
                <p className="text-lg font-bold text-red-700">
                  $
                  {resumenCxP.data.totalVencido.toLocaleString("es-AR", {
                    minimumFractionDigits: 0,
                  })}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <DollarSign className="h-6 w-6 text-green-600 mt-1 shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Contabilidad en Tiempo Real
            </h3>
            <p className="text-sm text-green-700">
              El módulo financiero registra automáticamente todas las
              operaciones del sistema. Las facturas de ventas generan CxC; las
              órdenes de compra generan CxP.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Patrones de uso

### 5.1 Mostrar árbol de cuentas contables

```tsx
import { usePlanCuentas } from "@/hooks/useFinanzas";

function PlanCuentasTree() {
  const { data, isLoading } = usePlanCuentas();

  function renderCuenta(cuenta: CuentaContable, depth = 0) {
    return (
      <div key={cuenta.id} style={{ paddingLeft: depth * 16 }}>
        <div className="flex items-center gap-2 py-1">
          <span className="font-mono text-sm text-gray-500">{cuenta.code}</span>
          <span className={cuenta.imputable ? "font-medium" : "text-gray-700"}>
            {cuenta.nombre}
          </span>
          <span className="text-xs text-gray-400">{cuenta.tipo}</span>
        </div>
        {cuenta.children?.map((c) => renderCuenta(c, depth + 1))}
      </div>
    );
  }

  if (isLoading) return <p>Cargando...</p>;

  return <div>{data?.data.map((c) => renderCuenta(c))}</div>;
}
```

### 5.2 Mayor contable con filtro de fechas

```tsx
import { useMayorContable } from "@/hooks/useFinanzas";

function MayorPage({ cuentaId }: { cuentaId: string }) {
  const { data } = useMayorContable(cuentaId, {
    desde: "2026-01-01",
    hasta: "2026-03-31",
  });

  const mayor = data?.data;

  return (
    <div>
      <h2>
        {mayor?.cuenta.code} — {mayor?.cuenta.nombre}
      </h2>
      <table>
        <thead>
          <tr>
            <th>Asiento</th>
            <th>Debe</th>
            <th>Haber</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>
          {mayor?.movimientos.map((m) => (
            <tr key={m.id}>
              <td>
                #{m.asiento.numero} {m.asiento.descripcion}
              </td>
              <td>{m.debe > 0 ? m.debe.toFixed(2) : "—"}</td>
              <td>{m.haber > 0 ? m.haber.toFixed(2) : "—"}</td>
              <td className="font-mono">{m.saldoAcumulado.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>TOTALES</td>
            <td>{mayor?.totales.debe.toFixed(2)}</td>
            <td>{mayor?.totales.haber.toFixed(2)}</td>
            <td className="font-bold">
              {mayor?.totales.saldoFinal.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
```

### 5.3 Crear asiento manual (partida doble)

```tsx
import { useCrearAsiento, usePlanCuentas } from "@/hooks/useFinanzas";
import { useLocal } from "@/contexts/LocalContext";

function NuevoAsientoForm() {
  const { localId } = useLocal();
  const { mutate, isPending, isError, error } = useCrearAsiento();

  const handleSubmit = () => {
    mutate({
      localId,
      dto: {
        descripcion: "Cobro en efectivo — Factura B 0001-000456",
        referencia: "FAC-0001-000456",
        detalles: [
          // Caja (ACTIVO/DEUDORA): aumenta con DEBE
          { cuentaId: "uuid-cuenta-caja", debe: 5000, haber: 0 },
          // Ventas (INGRESO/ACREEDORA): aumenta con HABER
          { cuentaId: "uuid-cuenta-ventas", debe: 0, haber: 5000 },
        ],
      },
    });
  };

  return (
    <div>
      {isError && (
        // El backend devuelve 400 si DEBE ≠ HABER o cuentas no imputables
        <p className="text-red-600">
          {(error as any)?.response?.data?.error?.message}
        </p>
      )}
      <button onClick={handleSubmit} disabled={isPending}>
        {isPending ? "Guardando..." : "Registrar asiento"}
      </button>
    </div>
  );
}
```

### 5.4 Saldo y movimientos de caja

```tsx
import {
  useSaldoCaja,
  useMovimientosCaja,
  useRegistrarMovimientoCaja,
} from "@/hooks/useFinanzas";
import { useLocal } from "@/contexts/LocalContext";

function CajaPage() {
  const { localId } = useLocal();
  const { data: saldoData } = useSaldoCaja(localId);
  const { data: movimientos } = useMovimientosCaja(localId, { limit: 20 });
  const { mutate } = useRegistrarMovimientoCaja();

  const ingreso = () =>
    mutate({
      localId,
      dto: {
        tipo: "INGRESO",
        monto: 10000,
        concepto: "Cobro efectivo factura B 0001-000456",
      },
    });

  const egreso = () =>
    mutate({
      localId,
      dto: {
        tipo: "EGRESO",
        monto: 2500,
        concepto: "Pago proveedor — efectivo",
      },
    });

  return (
    <div>
      <p className="text-2xl font-bold">
        Saldo: ${saldoData?.data.saldo.toFixed(2)}
      </p>
      <button onClick={ingreso}>Registrar ingreso</button>
      <button onClick={egreso}>Registrar egreso</button>

      {movimientos?.data.map((m) => (
        <div
          key={m.id}
          className={m.tipo === "INGRESO" ? "text-green-600" : "text-red-600"}
        >
          {m.tipo} ${m.monto.toFixed(2)} — {m.concepto}
        </div>
      ))}
    </div>
  );
}
```

### 5.5 Movimiento bancario

```tsx
import {
  useCuentasBancarias,
  useRegistrarMovimientoBancario,
} from "@/hooks/useFinanzas";

function BancosPage() {
  const { data: cuentasData } = useCuentasBancarias();
  const { mutate } = useRegistrarMovimientoBancario();

  const registrarCredito = (cuentaBancariaId: string) => {
    mutate({
      cuentaBancariaId,
      tipo: "CREDITO", // acredita saldo
      monto: 50000,
      concepto: "Cobro transferencia cliente",
      referencia: "TRF-00012345",
    });
  };

  return (
    <div>
      {cuentasData?.data.map((c) => (
        <div key={c.id}>
          <span>
            {c.banco?.nombre} — {c.numero}
          </span>
          <span className="font-bold">${c.saldo.toFixed(2)}</span>
          <button onClick={() => registrarCredito(c.id)}>Acreditar</button>
        </div>
      ))}
    </div>
  );
}
```

### 5.6 Resumen de CxC y CxP

```tsx
import { useResumenCxC, useResumenCxP } from "@/hooks/useFinanzas";

function ResumenFinanciero() {
  const { data: cxc } = useResumenCxC();
  const { data: cxp } = useResumenCxP();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white border rounded p-4">
        <h3>Cuentas por Cobrar</h3>
        <p>Pendiente: ${cxc?.data.totalPendiente.toFixed(2)}</p>
        <p className="text-red-600">
          Vencida: ${cxc?.data.totalVencido.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500">
          {cxc?.data.cantidadPendiente} facturas pendientes
        </p>
      </div>
      <div className="bg-white border rounded p-4">
        <h3>Cuentas por Pagar</h3>
        <p>Pendiente: ${cxp?.data.totalPendiente.toFixed(2)}</p>
        <p className="text-red-600">
          Vencida: ${cxp?.data.totalVencido.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500">
          {cxp?.data.cantidadPendiente} órdenes pendientes
        </p>
      </div>
    </div>
  );
}
```

### 5.7 Registrar retención

```tsx
import { useRegistrarRetencion } from "@/hooks/useFinanzas";
import { useLocal } from "@/contexts/LocalContext";

function RetencionForm() {
  const { localId } = useLocal();
  const { mutate } = useRegistrarRetencion();

  mutate({
    localId,
    dto: {
      tipo: "GANANCIAS",
      numero: "0001-00001234",
      importe: 1050,
      alicuota: 3.5,
      baseImponible: 30000,
      proveedorNombre: "Insumos S.A.",
      descripcion: "Retención OC #0042",
    },
  });
}
```

---

## 6. Páginas de balance y resultados

Las páginas `/finanzas/balance` y `/finanzas/resultados` **no tienen un endpoint dedicado** en el backend. Deben derivarse de los datos del plan de cuentas.

Para implementarlas en el futuro, la lógica es:

1. Llamar a `GET /plan-cuentas` para obtener el árbol completo.
2. Para cada cuenta imputable, llamar a `GET /plan-cuentas/:id/mayor` con el período deseado.
3. Agrupar las cuentas por `tipo` (ACTIVO/PASIVO/PATRIMONIO para balance; INGRESO/EGRESO para resultados) y sumar los `totales.saldoFinal`.

Por ahora estas páginas pueden mantenerse estáticas o mostrar un mensaje de "próximamente".

---

## 7. Referencia rápida de endpoints

| Acción                  | Método | Endpoint                                |
| ----------------------- | ------ | --------------------------------------- |
| Árbol plan de cuentas   | `GET`  | `/plan-cuentas`                         |
| Obtener cuenta          | `GET`  | `/plan-cuentas/:id`                     |
| Crear cuenta            | `POST` | `/plan-cuentas`                         |
| Mayor contable          | `GET`  | `/plan-cuentas/:id/mayor?desde=&hasta=` |
| Listar asientos         | `GET`  | `/asientos?page=&limit=`                |
| Obtener asiento         | `GET`  | `/asientos/:id`                         |
| Crear asiento           | `POST` | `/asientos?localId=UUID`                |
| Listar CxC              | `GET`  | `/cuentas-cobrar?localId=`              |
| Resumen CxC             | `GET`  | `/cuentas-cobrar/resumen`               |
| Listar CxP              | `GET`  | `/cuentas-pagar?localId=`               |
| Resumen CxP             | `GET`  | `/cuentas-pagar/resumen`                |
| Cuentas bancarias       | `GET`  | `/bancos/cuentas`                       |
| Movimientos bancarios   | `GET`  | `/bancos/cuentas/:id/movimientos`       |
| Registrar mov. bancario | `POST` | `/bancos/movimientos`                   |
| Saldo caja              | `GET`  | `/caja/:localId`                        |
| Movimientos caja        | `GET`  | `/caja/:localId/movimientos`            |
| Registrar mov. caja     | `POST` | `/caja/:localId/movimiento`             |
| Listar retenciones      | `GET`  | `/retenciones`                          |
| Registrar retención     | `POST` | `/retenciones?localId=`                 |

---

## 8. Valores de enums

### `TipoCuenta`

| Valor        | Descripción         |
| ------------ | ------------------- |
| `ACTIVO`     | Bienes y derechos   |
| `PASIVO`     | Obligaciones        |
| `PATRIMONIO` | Capital neto        |
| `INGRESO`    | Ingresos operativos |
| `EGRESO`     | Gastos y costos     |

### `NaturalezaCuenta`

| Valor       | Saldo aumenta con...        |
| ----------- | --------------------------- |
| `DEUDORA`   | DEBE (ej: ACTIVO)           |
| `ACREEDORA` | HABER (ej: PASIVO, INGRESO) |

### `TipoMovCaja`

| Valor     | Efecto en saldo                       |
| --------- | ------------------------------------- |
| `INGRESO` | Saldo + monto                         |
| `EGRESO`  | Saldo - monto (falla si insuficiente) |

### `TipoMovBancario`

| Valor     | Efecto en saldo                       |
| --------- | ------------------------------------- |
| `CREDITO` | Saldo + monto                         |
| `DEBITO`  | Saldo - monto (falla si insuficiente) |

### `TipoRetencion`

`IVA` | `GANANCIAS` | `INGRESOS_BRUTOS` | `OTRAS`

---

## 9. Notas importantes

1. **`POST /asientos` necesita `?localId=UUID`** — es un query param requerido (no en el body). Omitirlo genera error 500.
2. **Partida doble**: El backend rechaza con `400` si `totalDebe ≠ totalHaber`. Asegurarse de que la suma de todos los `debe` sea igual a la suma de todos los `haber` antes de enviar.
3. **Cuentas imputables**: Solo se pueden usar en `detalles` de un asiento las cuentas con `imputable: true`. Las cuentas de agrupación (padre/subtotal) son `imputable: false`.
4. **`code` en cuentas** — el campo del DTO es `code` (no `codigo` como indica la documentación del backend).
5. **`cuentaPadreId`** — el campo del DTO es `cuentaPadreId` (no `parentId`).
6. **`monto` en caja y bancos** — ambos DTOs usan `monto` (no `importe` como indica la documentación).
7. **`concepto` es requerido** en `MovimientoCajaDto` y `CreateMovimientoBancarioDto`.
8. **`POST /retenciones` necesita `?localId=`** — query param.
9. **CxC y CxP son de solo lectura**: No hay endpoints de creación en el frontend. Se crean automáticamente al facturar (CxC desde `POST /facturas`) o al aprobar una OC (CxP desde `PATCH /ordenes-compra/:id/aprobar`).
10. **Plan de cuentas no es paginado**: `GET /plan-cuentas` devuelve `{ data: CuentaContable[] }` — no `meta` ni `total`. Para contar cuentas usar `data.length`.
