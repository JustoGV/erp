'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CreditCard, ArrowLeft, AlertCircle, Clock, Info, ShoppingCart, ExternalLink } from 'lucide-react'
import { useLocal } from '@/contexts/LocalContext'
import { useCuentasPagar, useResumenCxP } from '@/hooks/useFinanzas'
import Pagination from '@/components/Pagination'

const ESTADOS_CXP = ['TODOS', 'PENDIENTE', 'PARCIAL', 'VENCIDA', 'PAGADA'] as const
type EstadoCxP = typeof ESTADOS_CXP[number]

export default function CuentasPagarPage() {
  const { selectedLocal, isAllLocales } = useLocal()
  const localId = isAllLocales ? undefined : selectedLocal?.id
  const [page, setPage] = useState(1)
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoCxP>('TODOS')
  const [showInfo, setShowInfo] = useState(false)

  const { data, isLoading } = useCuentasPagar({
    localId,
    page,
    limit: 20,
    estado: estadoFiltro === 'TODOS' ? undefined : estadoFiltro,
  })
  const { data: resumenData } = useResumenCxP(localId)

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
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                <CreditCard className="text-white" size={28} />
              </div>
              Cuentas por Pagar
            </h1>
            <p className="text-slate-600 mt-1">Saldos pendientes a proveedores · generadas automáticamente</p>
          </div>
        </div>
        <button
          onClick={() => setShowInfo(i => !i)}
          className={`p-2 rounded-lg transition-colors ${
            showInfo ? 'bg-red-100 text-red-700' : 'hover:bg-red-50 text-red-500'
          }`}
          title="¿Cómo se generan las cuentas por pagar?"
        >
          <Info size={20} />
        </button>
      </div>

      {/* Info panel */}
      {showInfo && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm">
          <p className="font-bold text-red-900 mb-3 flex items-center gap-2">
            <Info size={15} /> ¿Cómo se generan las Cuentas por Pagar?
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3 border border-red-200">
              <p className="font-semibold text-red-800 mb-1">1. Confirmás una orden de compra</p>
              <p className="text-xs text-red-700">Cuando confirmás una orden de compra en el módulo de Compras, el sistema registra automáticamente la deuda al proveedor.</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-red-200">
              <p className="font-semibold text-red-800 mb-1">2. Aparece aquí como PENDIENTE</p>
              <p className="text-xs text-red-700">La cuenta queda en estado PENDIENTE hasta el vencimiento establecido en la orden de compra.</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-red-200">
              <p className="font-semibold text-red-800 mb-1">3. Registrás el pago</p>
              <p className="text-xs text-red-700">Al registrar el pago al proveedor (en Caja o Bancos), el sistema actualiza el saldo y cambia el estado a PAGADA.</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Link
              href="/compras"
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-white border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              <ShoppingCart size={13} /> Ir a Compras <ExternalLink size={11} />
            </Link>
            <p className="text-xs text-red-700">Confirmá una orden de compra para que aparezca aquí automáticamente</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total a Pagar</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{resumen ? fmt(resumen.totalPendiente) : '—'}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg"><CreditCard size={24} className="text-red-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Vencido</p>
              <p className="text-2xl font-bold text-red-700 mt-1">{resumen ? fmt(resumen.totalVencido) : '—'}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg"><AlertCircle size={24} className="text-red-700" /></div>
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
        {ESTADOS_CXP.map(e => (
          <button
            key={e}
            onClick={() => { setEstadoFiltro(e); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              estadoFiltro === e
                ? e === 'TODOS'     ? 'bg-slate-700 text-white'
                : e === 'VENCIDA'   ? 'bg-red-700 text-white'
                : e === 'PENDIENTE' ? 'bg-yellow-500 text-white'
                : e === 'PARCIAL'   ? 'bg-blue-600 text-white'
                :                    'bg-green-600 text-white'
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
                <th>Proveedor</th>
                <th>Orden Compra</th>
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
                    <CreditCard size={32} className="mx-auto mb-2 text-slate-300" />
                    <p>{estadoFiltro === 'TODOS' ? 'No hay cuentas por pagar' : `No hay cuentas en estado ${estadoFiltro}`}</p>
                    <Link href="/compras" className="inline-flex items-center gap-1 mt-3 text-xs text-red-500 hover:text-red-600 font-medium">
                      <ShoppingCart size={13} /> Ir a Compras para crear órdenes <ExternalLink size={11} />
                    </Link>
                  </td>
                </tr>
              ) : (
                cuentas.map(cuenta => (
                  <tr key={cuenta.id} className="table-row-hover">
                    <td className="font-medium">{cuenta.proveedor?.name ?? '—'}</td>
                    <td>
                      {cuenta.ordenCompra ? (
                        <Link href="/compras/ordenes" className="text-blue-600 hover:text-blue-800 font-medium">
                          {cuenta.ordenCompra.numero}
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
                    <td className="text-right font-bold text-red-600">{fmt(cuenta.montoSaldo)}</td>
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


