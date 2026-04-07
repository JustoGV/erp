'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DollarSign, ArrowLeft, AlertCircle, Clock, Info, FileText, ExternalLink } from 'lucide-react'
import { useLocal } from '@/contexts/LocalContext'
import { useCuentasCobrar, useResumenCxC } from '@/hooks/useFinanzas'
import Pagination from '@/components/Pagination'

const ESTADOS_CXC = ['TODOS', 'PENDIENTE', 'PARCIAL', 'VENCIDA', 'COBRADA', 'INCOBRABLE'] as const
type EstadoCxC = typeof ESTADOS_CXC[number]

export default function CuentasCobrarPage() {
  const { selectedLocal, isAllLocales } = useLocal()
  const localId = isAllLocales ? undefined : selectedLocal?.id
  const [page, setPage] = useState(1)
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoCxC>('TODOS')
  const [showInfo, setShowInfo] = useState(false)

  const { data, isLoading } = useCuentasCobrar({
    localId,
    page,
    limit: 20,
    estado: estadoFiltro === 'TODOS' ? undefined : estadoFiltro,
  })
  const { data: resumenData } = useResumenCxC(localId)

  const cuentas = data?.data ?? []
  const totalPages = data?.meta?.totalPages ?? 1
  const resumen = resumenData?.data

  const fmt = (v: unknown) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(parseFloat(String(v ?? 0)) || 0)

  const estadoColor = (estado: string) => {
    switch (estado) {
      case 'PAGADA':    return 'bg-green-100 text-green-700'
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-700'
      case 'PARCIAL':   return 'bg-blue-100 text-blue-700'
      case 'VENCIDA':   return 'bg-red-100 text-red-700'
      default:          return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <p className="text-slate-600 mt-1">Saldos pendientes de clientes · generadas automáticamente</p>
          </div>
        </div>
        <button
          onClick={() => setShowInfo(i => !i)}
          className={`p-2 rounded-lg transition-colors ${
            showInfo ? 'bg-green-100 text-green-700' : 'hover:bg-green-50 text-green-600'
          }`}
          title="¿Cómo se generan las cuentas por cobrar?"
        >
          <Info size={20} />
        </button>
      </div>

      {/* Info panel */}
      {showInfo && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-sm">
          <p className="font-bold text-green-900 mb-3 flex items-center gap-2">
            <Info size={15} /> ¿Cómo se generan las Cuentas por Cobrar?
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <p className="font-semibold text-green-800 mb-1">1. Emitís una factura de venta</p>
              <p className="text-xs text-green-700">Cuando confirmás una factura en el módulo de Ventas, el sistema registra automáticamente la deuda del cliente.</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <p className="font-semibold text-green-800 mb-1">2. Aparece aquí como PENDIENTE</p>
              <p className="text-xs text-green-700">La cuenta queda en estado PENDIENTE hasta la fecha de vencimiento configurada en la factura.</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <p className="font-semibold text-green-800 mb-1">3. Registrás el cobro</p>
              <p className="text-xs text-green-700">Al registrar el pago del cliente (en Caja o Bancos), el sistema actualiza el saldo y cambia el estado a COBRADA.</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Link
              href="/ventas"
              className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-white border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
            >
              <FileText size={13} /> Ir a Ventas <ExternalLink size={11} />
            </Link>
            <p className="text-xs text-green-700">Creá una factura de venta para que aparezca aquí automáticamente</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total a Cobrar</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{resumen ? fmt(resumen.totalPendiente) : '—'}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg"><DollarSign size={24} className="text-blue-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Vencido</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{resumen ? fmt(resumen.totalVencido) : '—'}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg"><AlertCircle size={24} className="text-red-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Ctas. Pendientes</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{resumen?.cantidadPendiente ?? '—'}</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg"><Clock size={24} className="text-slate-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Ctas. Vencidas</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{resumen?.cantidadVencida ?? '—'}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg"><AlertCircle size={24} className="text-red-600" /></div>
          </div>
        </div>
      </div>

      {/* Estado filter */}
      <div className="flex flex-wrap gap-2">
        {ESTADOS_CXC.map(e => (
          <button
            key={e}
            onClick={() => { setEstadoFiltro(e); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              estadoFiltro === e
                ? e === 'TODOS'        ? 'bg-slate-700 text-white'
                : e === 'VENCIDA'      ? 'bg-red-600 text-white'
                : e === 'PENDIENTE'    ? 'bg-yellow-500 text-white'
                : e === 'PARCIAL'      ? 'bg-blue-600 text-white'
                : e === 'COBRADA'      ? 'bg-green-600 text-white'
                :                       'bg-slate-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Factura</th>
                <th>Vencimiento</th>
                <th className="text-right">Original</th>
                <th className="text-right">Saldo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10">Cargando...</td></tr>
              ) : cuentas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <DollarSign size={32} className="mx-auto mb-2 text-slate-300" />
                    <p>{estadoFiltro === 'TODOS' ? 'No hay cuentas por cobrar' : `No hay cuentas en estado ${estadoFiltro}`}</p>
                    <Link href="/ventas" className="inline-flex items-center gap-1 mt-3 text-xs text-green-600 hover:text-green-700 font-medium">
                      <FileText size={13} /> Ir a Ventas para crear facturas <ExternalLink size={11} />
                    </Link>
                  </td>
                </tr>
              ) : (
                cuentas.map(cuenta => (
                  <tr key={cuenta.id} className="table-row-hover">
                    <td className="font-medium">{cuenta.cliente?.name ?? '—'}</td>
                    <td>
                      {cuenta.factura ? (
                        <Link href={`/ventas/facturas/${cuenta.facturaId}`} className="text-blue-600 hover:text-blue-800 font-medium">
                          {cuenta.factura.numero}
                        </Link>
                      ) : '—'}
                    </td>
                    <td>
                      <div className={cuenta.diasVencido > 0 ? 'text-red-600 font-medium' : 'text-slate-600'}>
                        {new Date(cuenta.fechaVencimiento).toLocaleDateString('es-AR')}
                        {cuenta.diasVencido > 0 && (
                          <div className="text-xs text-red-500">Vencida {cuenta.diasVencido} días</div>
                        )}
                      </div>
                    </td>
                    <td className="text-right font-semibold">{fmt(cuenta.montoOriginal)}</td>
                    <td className="text-right font-bold text-blue-600">{fmt(cuenta.montoSaldo)}</td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${estadoColor(cuenta.estado)}`}>
                        {cuenta.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  )
}


