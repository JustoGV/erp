# Fase 09 — Módulo Reportes

Conectar el módulo de reportes: **Dashboard KPIs**, **Ventas**, **Compras**, **Inventario**, **RRHH** y **Resultados**.

> **Discrepancia con el frontend actual**  
> La página `reportes/page.tsx` tiene tarjetas que enlazan a rutas como `/reportes/ventas-mes`, `/reportes/ventas-cliente`, `/reportes/stock-actual`, etc., que **no existen**.  
> El backend tiene exactamente 5 endpoints de reportes + 1 de dashboard. Todos los filtros (fecha, cliente, proveedor, etc.) se pasan como query params sobre esos 5 endpoints. Las tarjetas falsas deben eliminarse.

---

## 1. Tipos TypeScript

Crear `lib/types/reportes.ts`:

```typescript
// ─── Filtros generales ───────────────────────────────────────────────────────

export interface ReporteFiltros {
  desde?: string;       // "YYYY-MM-DD"
  hasta?: string;       // "YYYY-MM-DD"
  localId?: string;     // UUID
  clienteId?: string;   // UUID
  proveedorId?: string; // UUID
  empleadoId?: string;  // UUID
  formato?: 'json' | 'xlsx'; // default: 'json'
  agrupacion?: string;
}

// ─── Dashboard KPIs ──────────────────────────────────────────────────────────

export interface DashboardKPIs {
  ventasMes: {
    total: number;
    cantidad: number;
  };
  comprasMes: {
    total: number;
    cantidad: number;
  };
  stockAlertas: number;
  ordenesProdPendientes: number;
  empleadosActivos: number;
  cxcVencidas: number;
}

// ─── Reporte Ventas ──────────────────────────────────────────────────────────

export interface FacturaResumen {
  numero: string;
  fecha: string;
  cliente: string;
  taxId: string;
  subtotal: number;
  descuento: number;
  total: number;
  estado: string;
}

export interface ReporteVentas {
  facturas: FacturaResumen[];
  resumen: {
    totalFacturado: number;
    cantidadFacturas: number;
  };
  porCliente: Array<{
    nombre: string;
    total: number;
    cantidad: number;
  }>;
  porMes: Array<{
    nombre: string; // "Enero 2025"
    total: number;
    cantidad: number;
  }>;
}

// ─── Reporte Compras ─────────────────────────────────────────────────────────

export interface OrdenCompraResumen {
  numero: string;
  fecha: string;
  proveedor: string;
  total: number;
  estado: string;
}

export interface ReporteCompras {
  ordenes: OrdenCompraResumen[];
  resumen: {
    totalComprado: number;
    totalPagado: number;
  };
  porProveedor: Array<{
    nombre: string;
    total: number;
    cantidad: number;
  }>;
}

// ─── Reporte Inventario ──────────────────────────────────────────────────────

export interface ItemInventarioResumen {
  sku: string;
  nombre: string;
  categoria: string;
  deposito: string;
  local: string;
  cantidad: number;
  costo: number;
  valorizado: number;    // costo × cantidad
  alertaStock: boolean;
}

export interface ReporteInventario {
  items: ItemInventarioResumen[];
  resumen: {
    valorizacionTotal: number;
    productosConAlerta: number;
  };
}

// ─── Reporte RRHH ────────────────────────────────────────────────────────────

export interface LiquidacionResumen {
  legajo: string;
  nombre: string;
  cargo: string;
  departamento: string;
  periodo: string;       // "2025-01"
  totalBruto: number;
  totalDescuentos: number;
  totalNeto: number;
  estado: string;
}

export interface ReporteRRHH {
  liquidaciones: LiquidacionResumen[];
  resumen: {
    totalBruto: number;
    totalDescuentos: number;
    totalNeto: number;
    cantidad: number;
  };
}

// ─── Reporte Resultados ──────────────────────────────────────────────────────

export interface ReporteResultados {
  periodo: {
    desde: string;
    hasta: string;
  };
  ingresos: number;
  egresos: number;
  resultado: number;    // ingresos - egresos
  esGanancia: boolean;
}
```

---

## 2. Servicio HTTP

Crear `lib/services/reportes.service.ts`:

```typescript
import { apiClient } from '@/lib/api-client';
import type {
  DashboardKPIs,
  ReporteFiltros,
  ReporteVentas,
  ReporteCompras,
  ReporteInventario,
  ReporteRRHH,
  ReporteResultados,
} from '@/lib/types/reportes';

export const reportesService = {
  /**
   * KPIs ejecutivos del mes en curso.
   * Retorna: ventasMes, comprasMes, stockAlertas, ordenesProdPendientes,
   * empleadosActivos, cxcVencidas.
   */
  getDashboard: () =>
    apiClient.get<{ data: DashboardKPIs }>('/reportes/dashboard'),

  /**
   * Reporte de ventas. Soporta export XLSX (formato='xlsx').
   * @param filtros.desde / hasta   rango de fechas
   * @param filtros.localId         filtrar por local
   * @param filtros.clienteId       filtrar por cliente
   */
  getVentas: (filtros?: Omit<ReporteFiltros, 'proveedorId' | 'empleadoId'>) =>
    apiClient.get<{ data: ReporteVentas }>('/reportes/ventas', {
      params: filtros,
    }),

  /**
   * Reporte de compras.
   * @param filtros.proveedorId     filtrar por proveedor
   */
  getCompras: (filtros?: Omit<ReporteFiltros, 'clienteId' | 'empleadoId' | 'localId'>) =>
    apiClient.get<{ data: ReporteCompras }>('/reportes/compras', {
      params: filtros,
    }),

  /**
   * Reporte de inventario valorizado. Soporta export XLSX.
   * @param filtros.localId         filtrar por local
   */
  getInventario: (filtros?: Pick<ReporteFiltros, 'localId' | 'formato'>) =>
    apiClient.get<{ data: ReporteInventario }>('/reportes/inventario', {
      params: filtros,
    }),

  /**
   * Reporte de nómina / liquidaciones. Solo Administrador. Soporta XLSX.
   * @param filtros.empleadoId      filtrar por empleado
   */
  getRRHH: (filtros?: Omit<ReporteFiltros, 'clienteId' | 'proveedorId' | 'localId'>) =>
    apiClient.get<{ data: ReporteRRHH }>('/reportes/rrhh', { params: filtros }),

  /**
   * Estado de resultados (PyG). Solo Administrador y Contable.
   */
  getResultados: (filtros?: Pick<ReporteFiltros, 'desde' | 'hasta'>) =>
    apiClient.get<{ data: ReporteResultados }>('/reportes/resultados', {
      params: filtros,
    }),
};

// ─── Descarga de XLSX ────────────────────────────────────────────────────────
// Ventas, Inventario y RRHH soportan formato=xlsx.
// La respuesta es binaria (application/vnd.openxmlformats) por lo que
// NO usar apiClient.get normal — necesitás un fetch con responseType blob.

export async function downloadReporteXLSX(
  tipo: 'ventas' | 'inventario' | 'rrhh',
  filtros?: ReporteFiltros,
  nombreArchivo?: string
): Promise<void> {
  const params = new URLSearchParams({ ...filtros, formato: 'xlsx' } as Record<string, string>);
  // Obtener el token de donde tu app lo guarda:
  const token = /* tu función de obtener accessToken */ '';

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/reportes/${tipo}?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) throw new Error('Error al descargar el reporte');

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo ?? `reporte-${tipo}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## 3. React Query Hooks

Crear `hooks/useReportes.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { reportesService } from '@/lib/services/reportes.service';
import type { ReporteFiltros } from '@/lib/types/reportes';

export const reportesKeys = {
  dashboard: ['reportes', 'dashboard'] as const,
  ventas: (f?: Partial<ReporteFiltros>) => ['reportes', 'ventas', f] as const,
  compras: (f?: Partial<ReporteFiltros>) => ['reportes', 'compras', f] as const,
  inventario: (f?: Partial<ReporteFiltros>) => ['reportes', 'inventario', f] as const,
  rrhh: (f?: Partial<ReporteFiltros>) => ['reportes', 'rrhh', f] as const,
  resultados: (f?: Partial<ReporteFiltros>) => ['reportes', 'resultados', f] as const,
};

export function useDashboardKPIs() {
  return useQuery({
    queryKey: reportesKeys.dashboard,
    queryFn: () => reportesService.getDashboard(),
  });
}

export function useReporteVentas(filtros?: Parameters<typeof reportesService.getVentas>[0]) {
  return useQuery({
    queryKey: reportesKeys.ventas(filtros),
    queryFn: () => reportesService.getVentas(filtros),
    enabled: true,
  });
}

export function useReporteCompras(filtros?: Parameters<typeof reportesService.getCompras>[0]) {
  return useQuery({
    queryKey: reportesKeys.compras(filtros),
    queryFn: () => reportesService.getCompras(filtros),
    enabled: true,
  });
}

export function useReporteInventario(filtros?: Parameters<typeof reportesService.getInventario>[0]) {
  return useQuery({
    queryKey: reportesKeys.inventario(filtros),
    queryFn: () => reportesService.getInventario(filtros),
    enabled: true,
  });
}

export function useReporteRRHH(filtros?: Parameters<typeof reportesService.getRRHH>[0]) {
  return useQuery({
    queryKey: reportesKeys.rrhh(filtros),
    queryFn: () => reportesService.getRRHH(filtros),
    enabled: true,
  });
}

export function useReporteResultados(filtros?: Parameters<typeof reportesService.getResultados>[0]) {
  return useQuery({
    queryKey: reportesKeys.resultados(filtros),
    queryFn: () => reportesService.getResultados(filtros),
    enabled: true,
  });
}
```

---

## 4. Actualizar `app/(dashboard)/reportes/page.tsx`

Reemplazar la página con tarjetas ficticias por una página con KPIs reales y links a los 5 reportes reales:

```tsx
'use client';

import Link from 'next/link';
import {
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertCircle,
  Factory,
} from 'lucide-react';
import { useDashboardKPIs } from '@/hooks/useReportes';

function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className={`rounded-lg p-5 ${color} text-white`}>
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs opacity-75 mt-1">{sub}</p>}
    </div>
  );
}

const REPORTES = [
  {
    href: '/reportes/ventas',
    icon: BarChart3,
    title: 'Ventas',
    description: 'Facturas por período, cliente o local. Con exportación a Excel.',
    color: 'bg-blue-500',
  },
  {
    href: '/reportes/compras',
    icon: ShoppingCart,
    title: 'Compras',
    description: 'Órdenes de compra por período y proveedor.',
    color: 'bg-orange-500',
  },
  {
    href: '/reportes/inventario',
    icon: Package,
    title: 'Inventario',
    description: 'Stock valorizado con alertas de stock mínimo. Con exportación a Excel.',
    color: 'bg-purple-500',
  },
  {
    href: '/reportes/rrhh',
    icon: Users,
    title: 'Recursos Humanos',
    description: 'Nómina y liquidaciones de sueldos. Con exportación a Excel.',
    color: 'bg-green-500',
    adminOnly: true,
  },
  {
    href: '/reportes/resultados',
    icon: TrendingUp,
    title: 'Estado de Resultados',
    description: 'Ingresos, egresos y resultado neto por período.',
    color: 'bg-indigo-500',
    adminOnly: true,
  },
];

export default function ReportesPage() {
  const { data: kpisData, isLoading } = useDashboardKPIs();
  const kpis = kpisData?.data;

  const fmt = (n?: number) => n != null ? `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0 })}` : '—';

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Reportes y Analítica</h1>
        <p className="text-gray-600 mt-1">Panel ejecutivo y reportes detallados por módulo</p>
      </div>

      {/* KPIs del mes */}
      <section>
        <h2 className="text-lg font-semibold mb-4">KPIs del mes en curso</h2>
        {isLoading ? (
          <div className="text-gray-400">Cargando KPIs...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KpiCard
              label="Ventas del mes"
              value={fmt(kpis?.ventasMes.total)}
              sub={`${kpis?.ventasMes.cantidad ?? 0} facturas`}
              color="bg-blue-600"
            />
            <KpiCard
              label="Compras del mes"
              value={fmt(kpis?.comprasMes.total)}
              sub={`${kpis?.comprasMes.cantidad ?? 0} órdenes`}
              color="bg-orange-600"
            />
            <KpiCard
              label="Alertas de stock"
              value={kpis?.stockAlertas ?? 0}
              sub="productos bajo mínimo"
              color={kpis?.stockAlertas ? 'bg-red-600' : 'bg-gray-500'}
            />
            <KpiCard
              label="Órdenes producción"
              value={kpis?.ordenesProdPendientes ?? 0}
              sub="pendientes"
              color="bg-indigo-600"
            />
            <KpiCard
              label="Empleados activos"
              value={kpis?.empleadosActivos ?? 0}
              sub="en nómina"
              color="bg-green-600"
            />
            <KpiCard
              label="CxC vencidas"
              value={kpis?.cxcVencidas ?? 0}
              sub="facturas impagas"
              color={kpis?.cxcVencidas ? 'bg-red-700' : 'bg-gray-500'}
            />
          </div>
        )}
      </section>

      {/* Reportes disponibles */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Reportes disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REPORTES.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.href}
                href={r.href}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 border border-gray-200 hover:border-blue-300"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 ${r.color} text-white rounded-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{r.title}</h3>
                      {r.adminOnly && (
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{r.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
```

---

## 5. Patrones de uso por subpágina

### `app/(dashboard)/reportes/ventas/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useReporteVentas } from '@/hooks/useReportes';
import { downloadReporteXLSX } from '@/lib/services/reportes.service';

export default function ReporteVentasPage() {
  const hoy = new Date();
  const primerDia = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
  const [filtros, setFiltros] = useState({ desde: primerDia, hasta: '' });
  const [aplicados, setAplicados] = useState(filtros);

  const { data, isLoading } = useReporteVentas(aplicados);
  const r = data?.data;

  const handleDescargar = () =>
    downloadReporteXLSX('ventas', aplicados, `ventas-${aplicados.desde}.xlsx`);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reporte de Ventas</h1>
        <button onClick={handleDescargar} className="btn btn-secondary">
          Exportar Excel
        </button>
      </div>

      {/* Filtros */}
      <div className="card flex flex-wrap gap-4 items-end">
        <div>
          <label className="label">Desde</label>
          <input type="date" className="input" value={filtros.desde}
            onChange={e => setFiltros(f => ({ ...f, desde: e.target.value }))} />
        </div>
        <div>
          <label className="label">Hasta</label>
          <input type="date" className="input" value={filtros.hasta}
            onChange={e => setFiltros(f => ({ ...f, hasta: e.target.value }))} />
        </div>
        <button className="btn btn-primary" onClick={() => setAplicados(filtros)}>
          Aplicar filtros
        </button>
      </div>

      {isLoading ? (
        <div>Cargando...</div>
      ) : (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <p className="text-sm text-gray-500">Total facturado</p>
              <p className="text-3xl font-bold text-blue-700">
                ${Number(r?.resumen.totalFacturado ?? 0).toLocaleString('es-AR')}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Cantidad de facturas</p>
              <p className="text-3xl font-bold text-blue-700">{r?.resumen.cantidadFacturas ?? 0}</p>
            </div>
          </div>

          {/* Tabla de facturas */}
          <div className="card overflow-x-auto">
            <h3 className="font-semibold mb-4">Facturas ({r?.facturas.length ?? 0})</h3>
            <table className="w-full text-sm">
              <thead>
                <tr><th>Número</th><th>Fecha</th><th>Cliente</th><th>Subtotal</th><th>Descuento</th><th>Total</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {r?.facturas.map((f, i) => (
                  <tr key={i}>
                    <td>{f.numero}</td>
                    <td>{new Date(f.fecha).toLocaleDateString('es-AR')}</td>
                    <td>{f.cliente}</td>
                    <td>${Number(f.subtotal).toLocaleString('es-AR')}</td>
                    <td>${Number(f.descuento).toLocaleString('es-AR')}</td>
                    <td className="font-semibold">${Number(f.total).toLocaleString('es-AR')}</td>
                    <td>{f.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Por cliente */}
          {r?.porCliente && r.porCliente.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-4">Ventas por cliente</h3>
              <table className="w-full text-sm">
                <thead><tr><th>Cliente</th><th>Facturas</th><th>Total</th></tr></thead>
                <tbody>
                  {r.porCliente.map((c, i) => (
                    <tr key={i}>
                      <td>{c.nombre}</td>
                      <td>{c.cantidad}</td>
                      <td>${Number(c.total).toLocaleString('es-AR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

---

### `app/(dashboard)/reportes/inventario/page.tsx`

```tsx
'use client';

import { useReporteInventario } from '@/hooks/useReportes';
import { downloadReporteXLSX } from '@/lib/services/reportes.service';

export default function ReporteInventarioPage() {
  const { data, isLoading } = useReporteInventario();
  const r = data?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reporte de Inventario</h1>
        <button onClick={() => downloadReporteXLSX('inventario')} className="btn btn-secondary">
          Exportar Excel
        </button>
      </div>

      {isLoading ? <div>Cargando...</div> : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="card">
              <p className="text-sm text-gray-500">Valorización total</p>
              <p className="text-3xl font-bold text-purple-700">
                ${Number(r?.resumen.valorizacionTotal ?? 0).toLocaleString('es-AR')}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">Productos con alerta de stock</p>
              <p className={`text-3xl font-bold ${r?.resumen.productosConAlerta ? 'text-red-600' : 'text-green-600'}`}>
                {r?.resumen.productosConAlerta ?? 0}
              </p>
            </div>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr><th>SKU</th><th>Nombre</th><th>Categoría</th><th>Depósito</th><th>Local</th><th>Cantidad</th><th>Costo unit.</th><th>Valorizado</th><th>Alerta</th></tr>
              </thead>
              <tbody>
                {r?.items.map((item, i) => (
                  <tr key={i} className={item.alertaStock ? 'bg-red-50' : ''}>
                    <td>{item.sku}</td>
                    <td>{item.nombre}</td>
                    <td>{item.categoria}</td>
                    <td>{item.deposito}</td>
                    <td>{item.local}</td>
                    <td>{item.cantidad}</td>
                    <td>${Number(item.costo).toLocaleString('es-AR')}</td>
                    <td className="font-semibold">${Number(item.valorizado).toLocaleString('es-AR')}</td>
                    <td>{item.alertaStock ? '⚠ Bajo mínimo' : '✓'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
```

---

### `app/(dashboard)/reportes/resultados/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useReporteResultados } from '@/hooks/useReportes';

export default function ReporteResultadosPage() {
  const hoy = new Date();
  const [filtros, setFiltros] = useState({
    desde: `${hoy.getFullYear()}-01-01`,
    hasta: `${hoy.getFullYear()}-12-31`,
  });
  const [aplicados, setAplicados] = useState(filtros);

  const { data, isLoading } = useReporteResultados(aplicados);
  const r = data?.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Estado de Resultados</h1>

      <div className="card flex gap-4 items-end flex-wrap">
        <div>
          <label className="label">Desde</label>
          <input type="date" className="input" value={filtros.desde}
            onChange={e => setFiltros(f => ({ ...f, desde: e.target.value }))} />
        </div>
        <div>
          <label className="label">Hasta</label>
          <input type="date" className="input" value={filtros.hasta}
            onChange={e => setFiltros(f => ({ ...f, hasta: e.target.value }))} />
        </div>
        <button className="btn btn-primary" onClick={() => setAplicados(filtros)}>
          Consultar
        </button>
      </div>

      {isLoading ? <div>Calculando...</div> : r ? (
        <div className="card max-w-sm space-y-4">
          <h3 className="font-semibold">
            Período: {r.periodo.desde} → {r.periodo.hasta}
          </h3>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Ingresos</span>
            <span className="text-green-700 font-semibold">${Number(r.ingresos).toLocaleString('es-AR')}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Egresos</span>
            <span className="text-red-600 font-semibold">${Number(r.egresos).toLocaleString('es-AR')}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="font-bold text-lg">Resultado neto</span>
            <span className={`font-bold text-2xl ${r.esGanancia ? 'text-green-700' : 'text-red-600'}`}>
              {r.esGanancia ? '+' : '-'}${Math.abs(Number(r.resultado)).toLocaleString('es-AR')}
            </span>
          </div>
          <div className="text-center">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${r.esGanancia ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
              {r.esGanancia ? 'GANANCIA' : 'PÉRDIDA'}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
```

---

## 6. Descarga XLSX — patrón detallado

Los endpoints de ventas, inventario y RRHH envían el binario directamente si `formato=xlsx`. No devuelven JSON, por lo que **no se puede usar `apiClient.get()`** — ese cliente espera un cuerpo JSON.

```typescript
// Versión completa con manejo del accessToken
// Ajustá según cómo tu app expone el token (useAuth, jotai, zustand, etc.)

export async function downloadReporteXLSX(
  tipo: 'ventas' | 'inventario' | 'rrhh',
  filtros: Omit<ReporteFiltros, 'formato'> = {},
  nombreArchivo?: string
): Promise<void> {
  const { getAccessToken } = await import('@/lib/auth'); // ajustar al real
  const token = getAccessToken();

  const params = new URLSearchParams();
  Object.entries({ ...filtros, formato: 'xlsx' }).forEach(([k, v]) => {
    if (v != null && v !== '') params.set(k, String(v));
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
  const response = await fetch(`${baseUrl}/reportes/${tipo}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message ?? `Error ${response.status}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo ?? `reporte-${tipo}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
```

---

## 7. Referencia de endpoints

| Método | Endpoint                    | Descripción                          | Rol                | XLSX |
| ------ | --------------------------- | ------------------------------------ | ------------------ | ---- |
| `GET`  | `/api/v1/reportes/dashboard`  | KPIs del mes en curso               | Todos              | No   |
| `GET`  | `/api/v1/reportes/ventas`     | Reporte de ventas con filtros        | Todos              | ✅   |
| `GET`  | `/api/v1/reportes/compras`    | Reporte de compras con filtros       | Todos              | No   |
| `GET`  | `/api/v1/reportes/inventario` | Stock valorizado                     | Todos              | ✅   |
| `GET`  | `/api/v1/reportes/rrhh`       | Nómina y liquidaciones               | Admin              | ✅   |
| `GET`  | `/api/v1/reportes/resultados` | Estado de resultados (PyG)           | Admin / Contable   | No   |

### Query params disponibles por endpoint

| Param          | dashboard | ventas | compras | inventario | rrhh | resultados |
| -------------- | :-------: | :----: | :-----: | :--------: | :--: | :--------: |
| `desde`        |     —     |  ✅    |   ✅    |     —      |  ✅  |    ✅      |
| `hasta`        |     —     |  ✅    |   ✅    |     —      |  ✅  |    ✅      |
| `localId`      |     —     |  ✅    |    —    |    ✅      |   —  |     —      |
| `clienteId`    |     —     |  ✅    |    —    |     —      |   —  |     —      |
| `proveedorId`  |     —     |   —    |   ✅    |     —      |   —  |     —      |
| `empleadoId`   |     —     |   —    |    —    |     —      |  ✅  |     —      |
| `formato`      |     —     |  ✅    |    —    |    ✅      |  ✅  |     —      |

---

## 8. Errores comunes

| Error                  | Causa                                              | Solución                                      |
| ---------------------- | -------------------------------------------------- | --------------------------------------------- |
| `403 Forbidden`        | `rrhh` o `resultados` con rol Vendedor             | Mostrar sección solo si `user.rol === 'Administrador'` o `'Contable'` |
| `400 Bad Request`      | Formato de fecha inválido (`desde`/`hasta`)        | Usar `YYYY-MM-DD` estrictamente               |
| Blob en lugar de JSON  | Llamada a `/ventas?formato=xlsx` con `apiClient`   | Usar `downloadReporteXLSX()` que hace `fetch` raw |
| `401 Unauthorized`     | Token expirado al descargar XLSX                   | Refrescar token antes de llamar `downloadReporteXLSX` |

---

## 9. Rutas de frontend que deben existir

| Ruta                        | Existe | Acción requerida                             |
| --------------------------- | :----: | -------------------------------------------- |
| `/reportes`                 |  ✅    | Reemplazar con la nueva página de esta fase  |
| `/reportes/ventas`          |  ✅    | Conectar con `useReporteVentas`              |
| `/reportes/compras`         |  ❌    | Crear (patrón similar a ventas sin XLSX)     |
| `/reportes/inventario`      |  ❌    | Crear (ver patrón en sección 5)              |
| `/reportes/rrhh`            |  ❌    | Crear (solo visible para Admin)              |
| `/reportes/resultados`      |  ❌    | Crear (ver patrón en sección 5)              |
| `/reportes/ventas-mes`      |  ❓    | **Eliminar** — no existe en el backend       |
| `/reportes/ventas-cliente`  |  ❓    | **Eliminar** — no existe en el backend       |
| `/reportes/stock-actual`    |  ❓    | **Eliminar** — no existe en el backend       |
