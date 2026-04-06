'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, ArrowLeft, DollarSign, TrendingDown } from 'lucide-react'
import { useReporteResultados } from '@/hooks/useReportes'

export default function ResultadosPage() {
  const today = new Date()
  const [desde, setDesde] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
  )
  const [hasta, setHasta] = useState(today.toISOString().slice(0, 10))

  const { data, isLoading } = useReporteResultados({ desde, hasta })
  const estado = data?.data

  const fmt = (v: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v)

  const margenNeto = estado && estado.ingresos > 0
    ? (estado.resultado / estado.ingresos) * 100
    : 0

  return (
    <div className="space-y-6">
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
            {estado && (
              <p className="text-slate-600 mt-1">
                Período: {new Date(estado.periodo.desde).toLocaleDateString('es-AR')} — {new Date(estado.periodo.hasta).toLocaleDateString('es-AR')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Desde</label>
          <input type="date" className="input" value={desde} onChange={e => setDesde(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Hasta</label>
          <input type="date" className="input" value={hasta} onChange={e => setHasta(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="card p-12 text-center text-slate-500">Cargando...</div>
      ) : !estado ? (
        <div className="card p-12 text-center text-slate-400">Sin datos para el período seleccionado</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-100">Ingresos Totales</p>
                <DollarSign size={24} />
              </div>
              <p className="text-3xl font-bold">{fmt(estado.ingresos)}</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-red-100">Egresos Totales</p>
                <TrendingDown size={24} />
              </div>
              <p className="text-3xl font-bold">{fmt(estado.egresos)}</p>
            </div>

            <div className={`bg-gradient-to-br ${
              estado.esGanancia ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'
            } rounded-xl p-6 text-white shadow-lg`}>
              <div className="flex items-center justify-between mb-2">
                <p className="opacity-80">{estado.esGanancia ? 'Ganancia Neta' : 'Pérdida Neta'}</p>
                <TrendingUp size={24} />
              </div>
              <p className="text-3xl font-bold">{fmt(Math.abs(estado.resultado))}</p>
              <p className="opacity-80 text-sm mt-1">Margen: {margenNeto.toFixed(1)}%</p>
            </div>
          </div>

          {/* Detalle */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900">Resumen del Período</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-700 font-medium">Ingresos</span>
                <span className="text-lg font-bold text-green-600">{fmt(estado.ingresos)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-700 font-medium">Egresos</span>
                <span className="text-lg font-bold text-red-600">({fmt(estado.egresos)})</span>
              </div>
              <div className={`flex justify-between items-center p-4 rounded-xl ${
                estado.esGanancia ? 'bg-green-50' : 'bg-orange-50'
              }`}>
                <span className={`text-xl font-bold ${
                  estado.esGanancia ? 'text-green-900' : 'text-orange-900'
                }`}>
                  {estado.esGanancia ? 'RESULTADO POSITIVO' : 'RESULTADO NEGATIVO'}
                </span>
                <span className={`text-2xl font-bold ${
                  estado.esGanancia ? 'text-green-700' : 'text-orange-700'
                }`}>
                  {fmt(Math.abs(estado.resultado))}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

