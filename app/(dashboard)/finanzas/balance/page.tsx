'use client'

import Link from 'next/link'
import { Scale, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { usePlanCuentas } from '@/hooks/useFinanzas'
import type { CuentaContable } from '@/lib/api-types'

function flattenTree(cuentas: CuentaContable[]): CuentaContable[] {
  const result: CuentaContable[] = []
  for (const c of cuentas) {
    result.push(c)
    const hijos = ((c as any).subcuentas ?? c.children ?? []) as CuentaContable[]
    result.push(...flattenTree(hijos))
  }
  return result
}

export default function BalancePage() {
  const { data, isLoading } = usePlanCuentas()
  const todas = flattenTree(data?.data ?? [])
  const imputables = todas.filter(c => c.imputable)

  const fmt = (v: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v)

  const sumaGroup = (tipo: string) =>
    imputables.filter(c => c.tipo === tipo)
      .reduce((s, c) => s + ((c as any).saldo as number ?? 0), 0)

  const totalActivos = sumaGroup('ACTIVO')
  const totalPasivos = sumaGroup('PASIVO')
  const totalPatrimonio = sumaGroup('PATRIMONIO')
  const totalPasivoPatrimonio = totalPasivos + totalPatrimonio

  const renderGroup = (tipo: string) =>
    imputables.filter(c => c.tipo === tipo).map(c => {
      const saldo = (c as any).saldo as number ?? 0
      return (
        <div key={c.id} className="flex justify-between items-center">
          <span className="text-slate-600 text-sm">{c.code} — {c.nombre}</span>
          <span className="font-medium text-sm">{fmt(saldo)}</span>
        </div>
      )
    })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/finanzas" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={24} className="text-slate-600" />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Balance General</h1>
        </div>
        <div className="card p-12 text-center text-slate-500">Cargando...</div>
      </div>
    )
  }

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
                <Scale className="text-white" size={28} />
              </div>
              Balance General
            </h1>
            <p className="text-slate-600 mt-1">Situación patrimonial derivada del plan de cuentas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ACTIVOS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200 p-6">
            <h2 className="text-2xl font-bold text-green-900 flex items-center gap-2">
              <TrendingUp size={24} /> ACTIVOS
            </h2>
          </div>
          <div className="p-6 space-y-2">
            {renderGroup('ACTIVO')}
            <div className="border-t-2 border-green-200 pt-3 mt-3">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex justify-between text-lg font-bold text-green-900">
                  <span>TOTAL ACTIVOS</span>
                  <span>{fmt(totalActivos)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PASIVOS Y PATRIMONIO */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-slate-200 p-6">
            <h2 className="text-2xl font-bold text-red-900 flex items-center gap-2">
              <TrendingDown size={24} /> PASIVOS Y PATRIMONIO
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-700 mb-2">Pasivos</h3>
              <div className="space-y-2 ml-2">{renderGroup('PASIVO')}</div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold mt-2">
                <span>Total Pasivos</span>
                <span className="text-red-600">{fmt(totalPasivos)}</span>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <h3 className="font-semibold text-slate-700 mb-2">Patrimonio Neto</h3>
              <div className="space-y-2 ml-2">{renderGroup('PATRIMONIO')}</div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold mt-2">
                <span>Total Patrimonio</span>
                <span className="text-blue-600">{fmt(totalPatrimonio)}</span>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between text-lg font-bold text-blue-900">
                <span>TOTAL PASIVO + PATRIMONIO</span>
                <span>{fmt(totalPasivoPatrimonio)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verificación */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6">
        <h3 className="font-bold text-blue-900 mb-3">Verificación del Balance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Total Activos</p>
            <p className="text-2xl font-bold text-green-600">{fmt(totalActivos)}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Total Pasivo + Patrimonio</p>
            <p className="text-2xl font-bold text-blue-600">{fmt(totalPasivoPatrimonio)}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Diferencia</p>
            <p className={`text-2xl font-bold ${
              Math.abs(totalActivos - totalPasivoPatrimonio) < 0.01 ? 'text-green-600' : 'text-red-600'
            }`}>
              {fmt(totalActivos - totalPasivoPatrimonio)}
            </p>
          </div>
        </div>
        {Math.abs(totalActivos - totalPasivoPatrimonio) < 0.01 && (
          <p className="text-green-700 text-center mt-4 font-medium">✓ El balance está cuadrado</p>
        )}
      </div>
    </div>
  )
}


