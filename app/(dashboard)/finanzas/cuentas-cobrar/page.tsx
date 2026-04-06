'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DollarSign, ArrowLeft, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useLocal } from '@/contexts/LocalContext'
import { useCuentasCobrar, useResumenCxC } from '@/hooks/useFinanzas'
import Pagination from '@/components/Pagination'

export default function CuentasCobrarPage() {
  const { selectedLocal, isAllLocales } = useLocal()
  const localId = isAllLocales ? undefined : selectedLocal?.id
  const [page, setPage] = useState(1)

  const { data, isLoading } = useCuentasCobrar({ localId, page, limit: 20 })
  const { data: resumenData } = useResumenCxC(localId)

  const cuentas = data?.data ?? []
  const totalPages = data?.meta?.totalPages ?? 1
  const resumen = resumenData?.data

  const fmt = (v: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v)

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
            <p className="text-slate-600 mt-1">Gestión de cobros a clientes</p>
          </div>
        </div>
      </div>

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
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No hay cuentas por cobrar</td></tr>
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


