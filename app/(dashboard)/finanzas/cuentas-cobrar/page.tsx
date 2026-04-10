'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DollarSign, ArrowLeft, AlertCircle, CheckCircle, Clock, Search } from 'lucide-react';
import { useLocal } from '@/contexts/LocalContext';
import { useCuentasCobrar, useResumenCxC } from '@/hooks/useFinanzas';
import type { CuentaPorCobrar } from '@/lib/api-types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

const estadoBadge: Record<string, string> = {
  COBRADA: 'badge-success',
  PENDIENTE: 'badge-warning',
  PARCIAL: 'badge-info',
  VENCIDA: 'badge-danger',
  INCOBRABLE: 'badge-neutral',
};

export default function CuentasCobrarPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [estadoFilter, setEstadoFilter] = useState('');
  const [search, setSearch] = useState('');

  const localId = isAllLocales ? undefined : selectedLocal?.id;

  const { data: resumen } = useResumenCxC(localId);
  const { data: cuentasData, isLoading } = useCuentasCobrar({
    localId,
    limit: 200,
    estado: estadoFilter || undefined,
  });

  const cuentas: CuentaPorCobrar[] = (cuentasData as any)?.data ?? cuentasData ?? [];

  const filtered = search
    ? cuentas.filter((c) =>
        c.cliente?.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.factura?.numero?.toLowerCase().includes(search.toLowerCase())
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
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <DollarSign className="text-white" size={28} />
            </div>
            Cuentas por Cobrar
          </h1>
          <p className="text-slate-600 mt-1">Gestión de cobros a clientes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total a Cobrar</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {resumen ? formatCurrency(resumen.data.totalPendiente) : '—'}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Vencido</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {resumen ? formatCurrency(resumen.data.totalVencido) : '—'}
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
                {resumen?.data?.cantidadPendiente ?? '—'}
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
                {resumen?.data?.cantidadVencida ?? '—'}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <CheckCircle size={24} className="text-red-600" />
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
              placeholder="Buscar por cliente o factura..."
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
            <option value="COBRADA">Cobrada</option>
            <option value="INCOBRABLE">Incobrable</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Factura</th>
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
                  No hay cuentas por cobrar con ese criterio
                </td>
              </tr>
            ) : (
              filtered.map((cuenta) => (
                <tr key={cuenta.id} className="table-row-hover">
                  <td className="font-medium text-slate-900">
                    {cuenta.cliente?.name ?? cuenta.clienteId}
                  </td>
                  <td>
                    {cuenta.factura ? (
                      <Link
                        href={`/ventas/facturas/${cuenta.facturaId}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {cuenta.factura.numero}
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
                  <td className="font-bold text-blue-600">
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
