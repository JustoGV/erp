'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, ArrowLeft, ChevronRight, Plus, X } from 'lucide-react'
import { usePlanCuentas, useCrearCuenta } from '@/hooks/useFinanzas'
import { useApiToast } from '@/hooks/useApiToast'
import type { CuentaContable, CreateCuentaDto, TipoCuenta, NaturalezaCuenta } from '@/lib/api-types'

function flattenAll(cuentas: CuentaContable[]): CuentaContable[] {
  const result: CuentaContable[] = []
  for (const c of cuentas) {
    result.push(c)
    const hijos = ((c as any).subcuentas ?? c.children ?? []) as CuentaContable[]
    result.push(...flattenAll(hijos))
  }
  return result
}

const TIPOS_CUENTA: TipoCuenta[] = ['ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'EGRESO']
const NATURALEZAS: NaturalezaCuenta[] = ['DEUDORA', 'ACREEDORA']

const emptyForm = (): Partial<CreateCuentaDto> => ({
  code: '',
  nombre: '',
  tipo: undefined,
  naturaleza: undefined,
  cuentaPadreId: undefined,
  imputable: true,
})

export default function PlanCuentasPage() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<CreateCuentaDto>>(emptyForm())

  const { data, isLoading } = usePlanCuentas()
  const cuentas: CuentaContable[] = data?.data ?? []
  const todasCuentas = flattenAll(cuentas)

  const crearCuenta = useCrearCuenta()
  const { handleError, handleSuccess } = useApiToast()

  const canSubmit = form.code && form.nombre && form.tipo && form.naturaleza

  const handleSubmit = async () => {
    if (!canSubmit) return
    try {
      await crearCuenta.mutateAsync(form as CreateCuentaDto)
      handleSuccess('Cuenta creada correctamente')
      setShowForm(false)
      setForm(emptyForm())
    } catch (e) {
      handleError(e)
    }
  }

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  const getSubcuentas = (c: CuentaContable): CuentaContable[] =>
    ((c as any).subcuentas ?? c.children ?? []) as CuentaContable[]

  const getSaldo = (c: CuentaContable): number | undefined =>
    (c as any).saldo as number | undefined

  const renderCuenta = (cuenta: CuentaContable, nivel: number = 0) => {
    const hijos = getSubcuentas(cuenta)
    const tieneHijos = hijos.length > 0
    const isExpanded = expandedIds.has(cuenta.id)
    const saldo = getSaldo(cuenta)

    return (
      <div key={cuenta.id}>
        <div
          className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-100"
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
                <span className="text-xs text-slate-500">{cuenta.naturaleza}</span>
                {cuenta.imputable && (
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">Imputable</span>
                )}
              </div>
            </div>
          </div>

          {cuenta.imputable && saldo != null && (
            <div className="text-right">
              <p className={`font-semibold ${
                saldo > 0 ? 'text-green-600' : saldo < 0 ? 'text-red-600' : 'text-slate-400'
              }`}>
                ${Math.abs(saldo).toLocaleString('es-AR')}
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
        <button
          onClick={() => { setShowForm(true); setForm(emptyForm()) }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-xl hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-lg"
        >
          <Plus size={20} />
          Nueva Cuenta
        </button>
      </div>

      {/* Árbol de cuentas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">Estructura de Cuentas</h2>
          <p className="text-sm text-slate-600 mt-1">Haz clic en las flechas para expandir/contraer las cuentas</p>
        </div>
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Cargando...</div>
        ) : cuentas.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No hay cuentas registradas</div>
        ) : (
          <div>
            {cuentas.map(cuenta => renderCuenta(cuenta))}
          </div>
        )}
      </div>

      {/* Modal Nueva Cuenta */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Nueva Cuenta Contable</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código *</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="ej: 1.1.01"
                  maxLength={20}
                  value={form.code ?? ''}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Nombre descriptivo"
                  maxLength={150}
                  value={form.nombre ?? ''}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                <select
                  className="input w-full"
                  value={form.tipo ?? ''}
                  onChange={e => setForm(f => ({ ...f, tipo: e.target.value as TipoCuenta || undefined }))}
                >
                  <option value="">Seleccionar...</option>
                  {TIPOS_CUENTA.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Naturaleza *</label>
                <select
                  className="input w-full"
                  value={form.naturaleza ?? ''}
                  onChange={e => setForm(f => ({ ...f, naturaleza: e.target.value as NaturalezaCuenta || undefined }))}
                >
                  <option value="">Seleccionar...</option>
                  {NATURALEZAS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cuenta Padre (opcional)</label>
              <select
                className="input w-full"
                value={form.cuentaPadreId ?? ''}
                onChange={e => setForm(f => ({ ...f, cuentaPadreId: e.target.value || undefined }))}
              >
                <option value="">Ninguna (cuenta raíz)</option>
                {todasCuentas.filter(c => !c.imputable).map(c => (
                  <option key={c.id} value={c.id}>{c.code} — {c.nombre}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="imputable"
                checked={form.imputable ?? true}
                onChange={e => setForm(f => ({ ...f, imputable: e.target.checked }))}
                className="w-4 h-4"
              />
              <label htmlFor="imputable" className="text-sm font-medium text-slate-700">
                Imputable (se puede usar en asientos)
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || crearCuenta.isPending}
                className="btn btn-primary flex-1"
              >
                {crearCuenta.isPending ? 'Guardando...' : 'Crear Cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
