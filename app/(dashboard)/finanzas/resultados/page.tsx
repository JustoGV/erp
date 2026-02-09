'use client'

import Link from 'next/link'
import { TrendingUp, ArrowLeft, DollarSign, Activity } from 'lucide-react'
import { mockEstadoResultados } from '@/lib/mock-data'

export default function ResultadosPage() {
  const estado = mockEstadoResultados

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value)
  }

  const margenBruto = (estado.utilidadBruta / estado.ingresos.total) * 100
  const margenOperativo = (estado.utilidadOperativa / estado.ingresos.total) * 100
  const margenNeto = (estado.utilidadNeta / estado.ingresos.total) * 100

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
                <TrendingUp className="text-white" size={28} />
              </div>
              Estado de Resultados
            </h1>
            <p className="text-slate-600 mt-1">Período: {estado.periodo}</p>
          </div>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-100">Utilidad Bruta</p>
            <DollarSign size={24} />
          </div>
          <p className="text-3xl font-bold mb-1">{formatCurrency(estado.utilidadBruta)}</p>
          <p className="text-green-100 text-sm">Margen: {margenBruto.toFixed(1)}%</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100">Utilidad Operativa</p>
            <Activity size={24} />
          </div>
          <p className="text-3xl font-bold mb-1">{formatCurrency(estado.utilidadOperativa)}</p>
          <p className="text-blue-100 text-sm">Margen: {margenOperativo.toFixed(1)}%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-100">Utilidad Neta</p>
            <TrendingUp size={24} />
          </div>
          <p className="text-3xl font-bold mb-1">{formatCurrency(estado.utilidadNeta)}</p>
          <p className="text-purple-100 text-sm">Margen: {margenNeto.toFixed(1)}%</p>
        </div>
      </div>

      {/* Estado de Resultados Detallado */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900">Detalle del Período</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* INGRESOS */}
          <div>
            <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-green-500 rounded"></div>
              INGRESOS
            </h3>
            <div className="ml-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Ventas</span>
                <span className="font-semibold text-slate-900">{formatCurrency(estado.ingresos.ventas)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Otros Ingresos</span>
                <span className="font-semibold text-slate-900">{formatCurrency(estado.ingresos.otros)}</span>
              </div>
              <div className="border-t-2 border-green-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-green-800">Total Ingresos</span>
                <span className="text-xl font-bold text-green-700">{formatCurrency(estado.ingresos.total)}</span>
              </div>
            </div>
          </div>

          {/* COSTO DE VENTAS */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-orange-700 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-orange-500 rounded"></div>
              COSTO DE VENTAS
            </h3>
            <div className="ml-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Costo de Ventas</span>
                <span className="font-semibold text-red-600">({formatCurrency(estado.egresos.costoVentas)})</span>
              </div>
              <div className="border-t-2 border-green-200 pt-3 flex justify-between items-center bg-green-50 -mx-4 px-4 py-3 rounded-lg">
                <span className="font-bold text-green-800">Utilidad Bruta</span>
                <span className="text-xl font-bold text-green-700">{formatCurrency(estado.utilidadBruta)}</span>
              </div>
            </div>
          </div>

          {/* GASTOS OPERATIVOS */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-red-500 rounded"></div>
              GASTOS OPERATIVOS
            </h3>
            <div className="ml-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Sueldos y Jornales</span>
                <span className="font-semibold text-red-600">({formatCurrency(280000)})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Alquileres</span>
                <span className="font-semibold text-red-600">({formatCurrency(75000)})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Servicios Públicos</span>
                <span className="font-semibold text-red-600">({formatCurrency(35000)})</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                <span className="font-semibold text-slate-800">Total Gastos Operativos</span>
                <span className="font-bold text-red-600">({formatCurrency(estado.egresos.gastosOperativos)})</span>
              </div>
              <div className="border-t-2 border-blue-200 pt-3 flex justify-between items-center bg-blue-50 -mx-4 px-4 py-3 rounded-lg">
                <span className="font-bold text-blue-800">Utilidad Operativa</span>
                <span className="text-xl font-bold text-blue-700">{formatCurrency(estado.utilidadOperativa)}</span>
              </div>
            </div>
          </div>

          {/* RESULTADO FINAL */}
          <div className="border-t-4 border-purple-300 pt-6">
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-purple-900">UTILIDAD NETA</span>
                <span className="text-3xl font-bold text-purple-700">{formatCurrency(estado.utilidadNeta)}</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-purple-700 mb-1">Margen Bruto</p>
                  <p className="text-lg font-bold text-purple-900">{margenBruto.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-purple-700 mb-1">Margen Operativo</p>
                  <p className="text-lg font-bold text-purple-900">{margenOperativo.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-purple-700 mb-1">Margen Neto</p>
                  <p className="text-lg font-bold text-purple-900">{margenNeto.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Análisis de Rentabilidad</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-600">Ingresos Totales</span>
              <span className="font-semibold">{formatCurrency(estado.ingresos.total)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-600">Egresos Totales</span>
              <span className="font-semibold text-red-600">{formatCurrency(estado.egresos.total)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-slate-900">Resultado</span>
              <span className="font-bold text-green-600">{formatCurrency(estado.utilidadNeta)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Distribución de Costos</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Costo de Ventas</span>
                <span className="text-sm font-medium">57.1%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '57.1%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Gastos Operativos</span>
                <span className="text-sm font-medium">42.9%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '42.9%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

