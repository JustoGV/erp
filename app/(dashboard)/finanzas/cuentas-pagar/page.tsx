'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CreditCard, ArrowLeft, AlertCircle, Clock, Search } from 'lucide-react';
import { useLocal } from '@/contexts/LocalContext';
import { useCuentasPagar, useResumenCxP } from '@/hooks/useFinanzas';
import type { CuentaPorPagar } from '@/lib/api-types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

const estadoBadge: Record<string, string> = {
  PAGADA: 'badge-success',
  PENDIENTE: 'badge-warning',
  PARCIAL: 'badge-info',
  VENCIDA: 'badge-danger',
};

export default function CuentasPagarPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [estadoFilter, setEstadoFilter] = useState('');
  const [search, setSearch] = useState('');

  const localId = isAllLocales ? undefined : selectedLocal?.id;

  const { data: resumen } = useResumenCxP(localId);
  const { data: cuentasData, isLoading } = useCuentasPagar({
    localId,
    limit: 200,
    estado: estadoFilter || undefined,
  });

  const cuentas: CuentaPorPagar[] = (cuentasData as any)?.data ?? cuentasData ?? [];

  const filtered = search
    ? cuentas.filter((c) =>
        c.proveedor?.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.ordenCompra?.numero?.toLowerCase().includes(search.toLowerCase())
      )
    : cuentas;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/finanzas" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={24} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
              <CreditCard className="text-white" size={28} />
            </div>
            Cuentas por Pagar
          </h1>
          <p className="text-slate-600 mt-1">Gestión de pagos a proveedores</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total a Pagar</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {resumen ? formatCurrency(resumen.totalPendiente) : '—'}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <CreditCard size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Vencido</p>
              <p className="text-2xl font-bold text-red-700 mt-1">
                {resumen ? formatCurrency(resumen.totalVencido) : '—'}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pendientes</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {resumen?.cantidadPendiente ?? '—'}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock size={24} className="text-amber-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Vencidas</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {resumen?.cantidadVencida ?? '—'}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por proveedor u orden..."
              className="input pl-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input min-w-[180px]"
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="PARCIAL">Parcial</option>
            <option value="VENCIDA">Vencida</option>
            <option value="PAGADA">Pagada</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Orden de Compra</th>
              <th>Vencimiento</th>
              <th>Original</th>
              <th>Saldo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j}><div className="h-4 bg-slate-200 animate-pulse rounded" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500">
                  No hay cuentas por pagar con ese criterio
                </td>
              </tr>
            ) : (
              filtered.map((cuenta) => (
                <tr key={cuenta.id} className="table-row-hover">
                  <td className="font-medium text-slate-900">
                    {cuenta.proveedor?.name ?? cuenta.proveedorId}
                  </td>
                  <td>
                    {cuenta.ordenCompra ? (
                      <Link
                        href="/compras/ordenes"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {cuenta.ordenCompra.numero}
                      </Link>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td>
                    <div className={cuenta.diasVencido > 0 ? 'text-red-600 font-medium' : 'text-slate-600'}>
                      {new Date(cuenta.fechaVencimiento).toLocaleDateString('es-AR')}
                      {cuenta.diasVencido > 0 && (
                        <div className="text-xs text-red-500">{cuenta.diasVencido} días vencida</div>
                      )}
                    </div>
                  </td>
                  <td className="font-semibold text-slate-900">
                    {formatCurrency(cuenta.montoOriginal)}
                  </td>
                  <td className="font-bold text-red-600">
                    {formatCurrency(cuenta.montoSaldo)}
                  </td>
                  <td>
                    <span className={`badge ${estadoBadge[cuenta.estado] ?? 'badge-neutral'}`}>
                      {cuenta.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
