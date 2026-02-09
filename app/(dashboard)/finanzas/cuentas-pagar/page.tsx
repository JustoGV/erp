'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CreditCard, ArrowLeft, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useLocal } from '@/contexts/LocalContext'
import { mockCuentasPorPagar, type CuentaPorPagar } from '@/lib/mock-data'

export default function CuentasPagarPage() {
  const { selectedLocal } = useLocal()
  const [cuentas, setCuentas] = useState<CuentaPorPagar[]>(mockCuentasPorPagar)

  useEffect(() => {
    if (!selectedLocal) {
      setCuentas(mockCuentasPorPagar)
    } else {
      setCuentas(mockCuentasPorPagar.filter(c => c.localId === selectedLocal.id))
    }
  }, [selectedLocal])

  const totalPendiente = cuentas.reduce((sum, c) => sum + c.montoSaldo, 0)
  const totalPagado = cuentas.reduce((sum, c) => sum + c.montoPagado, 0)

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PAGADA': return 'bg-green-100 text-green-700'
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-700'
      case 'PARCIAL': return 'bg-blue-100 text-blue-700'
      case 'VENCIDA': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
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
            <p className="text-slate-600 mt-1">Gestión de pagos a proveedores</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total a Pagar</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalPendiente)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <CreditCard size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pagado</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalPagado)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Cuentas</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{cuentas.length}</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              <Clock size={24} className="text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Proveedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Orden Compra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Vencimiento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Saldo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {cuentas.map(cuenta => (
                <tr key={cuenta.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{cuenta.proveedorNombre}</td>
                  <td className="px-6 py-4">
                    <Link href={`/compras/ordenes`} className="text-blue-600 hover:text-blue-800 font-medium">
                      {cuenta.ordenCompraNumero}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(cuenta.fechaVencimiento).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{formatCurrency(cuenta.montoTotal)}</td>
                  <td className="px-6 py-4 font-bold text-red-600">{formatCurrency(cuenta.montoSaldo)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(cuenta.estado)}`}>
                      {cuenta.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
