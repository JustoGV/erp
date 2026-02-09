'use client'

import Link from 'next/link'
import { Scale, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { mockBalanceGeneral, mockPlanCuentas } from '@/lib/mock-data'

export default function BalancePage() {
  const balance = mockBalanceGeneral

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value)
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
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl">
                <Scale className="text-white" size={28} />
              </div>
              Balance General
            </h1>
            <p className="text-slate-600 mt-1">Estado de situación patrimonial al {new Date(balance.fecha).toLocaleDateString('es-AR')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ACTIVOS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200 p-6">
            <h2 className="text-2xl font-bold text-green-900 flex items-center gap-2">
              <TrendingUp size={24} />
              ACTIVOS
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-700 mb-3">Activo Corriente</h3>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Caja y Bancos</span>
                  <span className="font-medium">{formatCurrency(575000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Deudores por Ventas</span>
                  <span className="font-medium">{formatCurrency(250000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Inventarios</span>
                  <span className="font-medium">{formatCurrency(680000)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold">
                  <span>Total Activo Corriente</span>
                  <span className="text-green-600">{formatCurrency(balance.activos.corrientes)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="font-semibold text-slate-700 mb-3">Activo No Corriente</h3>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between text-slate-500">
                  <span>Sin movimientos</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold">
                  <span>Total Activo No Corriente</span>
                  <span>{formatCurrency(balance.activos.noCorrientes)}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 mt-4">
              <div className="flex justify-between text-lg font-bold text-green-900">
                <span>TOTAL ACTIVOS</span>
                <span>{formatCurrency(balance.activos.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PASIVOS Y PATRIMONIO */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-slate-200 p-6">
            <h2 className="text-2xl font-bold text-red-900 flex items-center gap-2">
              <TrendingDown size={24} />
              PASIVOS Y PATRIMONIO
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-700 mb-3">Pasivo Corriente</h3>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Proveedores</span>
                  <span className="font-medium">{formatCurrency(180000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Sueldos a Pagar</span>
                  <span className="font-medium">{formatCurrency(95000)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold">
                  <span>Total Pasivo Corriente</span>
                  <span className="text-red-600">{formatCurrency(balance.pasivos.corrientes)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="font-semibold text-slate-700 mb-3">Pasivo No Corriente</h3>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between text-slate-500">
                  <span>Sin movimientos</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold">
                  <span>Total Pasivo No Corriente</span>
                  <span>{formatCurrency(balance.pasivos.noCorrientes)}</span>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex justify-between font-bold text-red-900">
                <span>TOTAL PASIVOS</span>
                <span>{formatCurrency(balance.pasivos.total)}</span>
              </div>
            </div>

            <div className="border-t-2 border-slate-300 pt-4">
              <h3 className="font-semibold text-slate-700 mb-3">Patrimonio Neto</h3>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Capital Social</span>
                  <span className="font-medium">{formatCurrency(500000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Resultados Acumulados</span>
                  <span className="font-medium">{formatCurrency(350000)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold">
                  <span>Total Patrimonio Neto</span>
                  <span className="text-blue-600">{formatCurrency(balance.patrimonioNeto)}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mt-4">
              <div className="flex justify-between text-lg font-bold text-blue-900">
                <span>TOTAL PASIVO + PATRIMONIO</span>
                <span>{formatCurrency(balance.totalPasivoPatrimonio)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verificación de cuadre */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6">
        <h3 className="font-bold text-blue-900 mb-3">Verificación del Balance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Total Activos</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(balance.activos.total)}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Total Pasivo + Patrimonio</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(balance.totalPasivoPatrimonio)}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Diferencia</p>
            <p className={`text-2xl font-bold ${balance.activos.total === balance.totalPasivoPatrimonio ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance.activos.total - balance.totalPasivoPatrimonio)}
            </p>
          </div>
        </div>
        {balance.activos.total === balance.totalPasivoPatrimonio && (
          <p className="text-green-700 text-center mt-4 font-medium">✓ El balance está cuadrado</p>
        )}
      </div>
    </div>
  )
}

