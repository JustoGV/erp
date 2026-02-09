'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, ArrowLeft, ChevronRight, ChevronDown, Plus, Search } from 'lucide-react'
import { mockPlanCuentas, type CuentaContable } from '@/lib/mock-data'
import { usePermissions } from '@/hooks/usePermissions'

export default function PlanCuentasPage() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['1', '2', '3', '4', '5']))
  const [busqueda, setBusqueda] = useState('')
  const { canCreate } = usePermissions()

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  const cuentasFiltradas = busqueda 
    ? mockPlanCuentas.filter(c => 
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.code.includes(busqueda)
      )
    : mockPlanCuentas

  const renderCuenta = (cuenta: CuentaContable, nivel: number = 0) => {
    const hijos = mockPlanCuentas.filter(c => c.cuentaPadreId === cuenta.id)
    const tieneHijos = hijos.length > 0
    const isExpanded = expandedIds.has(cuenta.id)
    
    return (
      <div key={cuenta.id}>
        <div 
          className={`flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 ${
            nivel > 0 ? `ml-${nivel * 8}` : ''
          }`}
          style={{ marginLeft: `${nivel * 32}px` }}
        >
          <div className="flex items-center gap-3 flex-1">
            {tieneHijos ? (
              <button
                onClick={() => toggleExpand(cuenta.id)}
                className="p-1 hover:bg-slate-200 rounded transition-colors"
              >
                <ChevronRight 
                  size={16} 
                  className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                />
              </button>
            ) : (
              <div className="w-6" />
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className={`font-mono text-sm ${
                  cuenta.nivel === 1 ? 'font-bold text-slate-900' :
                  cuenta.nivel === 2 ? 'font-semibold text-slate-800' :
                  'text-slate-700'
                }`}>
                  {cuenta.code}
                </span>
                <span className={`${
                  cuenta.nivel === 1 ? 'font-bold text-lg text-slate-900' :
                  cuenta.nivel === 2 ? 'font-semibold text-slate-800' :
                  'text-slate-700'
                }`}>
                  {cuenta.nombre}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  cuenta.tipo === 'ACTIVO' ? 'bg-blue-100 text-blue-700' :
                  cuenta.tipo === 'PASIVO' ? 'bg-red-100 text-red-700' :
                  cuenta.tipo === 'PATRIMONIO' ? 'bg-purple-100 text-purple-700' :
                  cuenta.tipo === 'INGRESO' ? 'bg-green-100 text-green-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {cuenta.tipo}
                </span>
                <span className="text-xs text-slate-500">
                  {cuenta.naturaleza}
                </span>
                {cuenta.imputable && (
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    Imputable
                  </span>
                )}
              </div>
            </div>
          </div>

          {cuenta.imputable && (
            <div className="text-right">
              <p className={`font-semibold ${
                cuenta.saldo > 0 ? 'text-green-600' :
                cuenta.saldo < 0 ? 'text-red-600' :
                'text-slate-400'
              }`}>
                ${Math.abs(cuenta.saldo).toLocaleString('es-AR')}
              </p>
            </div>
          )}
        </div>

        {tieneHijos && isExpanded && (
          <div>
            {hijos.map(hijo => renderCuenta(hijo, nivel + 1))}
          </div>
        )}
      </div>
    )
  }

  const cuentasRaiz = mockPlanCuentas.filter(c => !c.cuentaPadreId)
  
  const totales = {
    activos: mockPlanCuentas.filter(c => c.tipo === 'ACTIVO' && c.imputable).reduce((sum, c) => sum + c.saldo, 0),
    pasivos: mockPlanCuentas.filter(c => c.tipo === 'PASIVO' && c.imputable).reduce((sum, c) => sum + c.saldo, 0),
    patrimonio: mockPlanCuentas.filter(c => c.tipo === 'PATRIMONIO' && c.imputable).reduce((sum, c) => sum + c.saldo, 0),
    ingresos: mockPlanCuentas.filter(c => c.tipo === 'INGRESO' && c.imputable).reduce((sum, c) => sum + c.saldo, 0),
    egresos: mockPlanCuentas.filter(c => c.tipo === 'EGRESO' && c.imputable).reduce((sum, c) => sum + c.saldo, 0),
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
                <BookOpen className="text-white" size={28} />
              </div>
              Plan de Cuentas
            </h1>
            <p className="text-slate-600 mt-1">Estructura contable de la empresa</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-xl hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-lg">
          <Plus size={20} />
          Nueva Cuenta
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-xs text-blue-700 font-medium mb-1">ACTIVOS</p>
          <p className="text-xl font-bold text-blue-900">${totales.activos.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <p className="text-xs text-red-700 font-medium mb-1">PASIVOS</p>
          <p className="text-xl font-bold text-red-900">${totales.pasivos.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <p className="text-xs text-purple-700 font-medium mb-1">PATRIMONIO</p>
          <p className="text-xl font-bold text-purple-900">${totales.patrimonio.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-xs text-green-700 font-medium mb-1">INGRESOS</p>
          <p className="text-xl font-bold text-green-900">${totales.ingresos.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <p className="text-xs text-orange-700 font-medium mb-1">EGRESOS</p>
          <p className="text-xl font-bold text-orange-900">${totales.egresos.toLocaleString('es-AR')}</p>
        </div>
      </div>

      {/* Árbol de cuentas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">Estructura de Cuentas</h2>
          <p className="text-sm text-slate-600 mt-1">Haz clic en las flechas para expandir/contraer las cuentas</p>
        </div>
        <div>
          {cuentasRaiz.map(cuenta => renderCuenta(cuenta))}
        </div>
      </div>
    </div>
  )
}

