'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Landmark, Plus, TrendingUp, TrendingDown, ArrowLeft, X, Building2, CreditCard } from 'lucide-react'
import { useCuentasBancarias, useMovimientosBancarios, useRegistrarMovimientoBancario, useCrearCuentaBancaria } from '@/hooks/useFinanzas'
import Pagination from '@/components/Pagination'
import { useApiToast } from '@/hooks/useApiToast'
import type { CreateMovimientoBancarioDto, CreateCuentaBancariaDto } from '@/lib/api-types'

const TIPOS_CUENTA = [
  { value: 'CORRIENTE',  label: 'Cuenta Corriente' },
  { value: 'CAJA_AHORRO', label: 'Caja de Ahorros' },
  { value: 'PLAZO_FIJO', label: 'Plazo Fijo' },
  { value: 'OTRA',       label: 'Otra' },
] as const

export default function BancosPage() {
  const { data, isLoading } = useCuentasBancarias()
  const cuentas = data?.data ?? []
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [movPage, setMovPage] = useState(1)

  const { data: movData, isLoading: loadingMov } = useMovimientosBancarios(
    selectedId ?? '',
    { page: movPage, limit: 20 }
  )
  const movimientos = movData?.data ?? []
  const movTotalPages = movData?.meta?.totalPages ?? 1

  const registrar = useRegistrarMovimientoBancario()
  const crearCuenta = useCrearCuentaBancaria()
  const { handleError, handleSuccess } = useApiToast()

  // Modal: nuevo movimiento
  const [showMovForm, setShowMovForm] = useState(false)
  const [movForm, setMovForm] = useState<Partial<CreateMovimientoBancarioDto>>({})

  // Modal: nueva cuenta bancaria
  const [showCuentaForm, setShowCuentaForm] = useState(false)
  const [cuentaForm, setCuentaForm] = useState<Partial<CreateCuentaBancariaDto>>({})

  const handleRegistrarMov = async () => {
    if (!movForm.cuentaBancariaId || !movForm.tipo || !movForm.monto || !movForm.concepto) return
    try {
      await registrar.mutateAsync(movForm as CreateMovimientoBancarioDto)
      handleSuccess('Movimiento registrado')
      setShowMovForm(false)
      setMovForm({})
    } catch (e: any) {
      handleError(e)
    }
  }

  const handleCrearCuenta = async () => {
    if (!cuentaForm.numero || !cuentaForm.tipoCuenta || !cuentaForm.bancoNombre) return
    try {
      const nueva = await crearCuenta.mutateAsync(cuentaForm as CreateCuentaBancariaDto)
      handleSuccess('Cuenta bancaria creada')
      setShowCuentaForm(false)
      setCuentaForm({})
      // Auto-select the new account
      if ((nueva as any)?.id) setSelectedId((nueva as any).id)
    } catch (e: any) {
      handleError(e)
    }
  }

  const selectedCuenta = cuentas.find(c => c.id === selectedId)

  const fmt = (v: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v)

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
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                <Landmark className="text-white" size={28} />
              </div>
              Bancos
            </h1>
            <p className="text-slate-600 mt-1">Cuentas bancarias y movimientos</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowCuentaForm(true); setCuentaForm({}) }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-indigo-300 text-indigo-700 rounded-xl hover:bg-indigo-50 transition-all font-medium text-sm"
          >
            <Building2 size={17} />
            Nueva Cuenta
          </button>
          {cuentas.length > 0 && (
            <button
              onClick={() => {
                setShowMovForm(true)
                setMovForm(selectedId ? { cuentaBancariaId: selectedId } : {})
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg text-sm font-medium"
            >
              <Plus size={17} />
              Nuevo Movimiento
            </button>
          )}
        </div>
      </div>

      {/* Cuentas grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-32 mb-3" />
              <div className="h-8 bg-slate-200 rounded w-40" />
            </div>
          ))}
        </div>
      ) : cuentas.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Landmark size={32} className="text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No hay cuentas bancarias</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            Creá tu primera cuenta bancaria para registrar movimientos y llevar el control de tus saldos.
          </p>
          <button
            onClick={() => { setShowCuentaForm(true); setCuentaForm({}) }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus size={18} /> Crear primera cuenta bancaria
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cuentas.map(cuenta => (
            <button
              key={cuenta.id}
              onClick={() => { setSelectedId(cuenta.id); setMovPage(1) }}
              className={`card p-6 text-left transition-all hover:shadow-md ${
                selectedId === cuenta.id ? 'ring-2 ring-indigo-500 bg-indigo-50/30' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-700">{cuenta.banco?.nombre ?? 'Banco'}</span>
                <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-medium">{cuenta.tipoCuenta.replace('_', ' ')}</span>
              </div>
              {cuenta.alias && <p className="text-xs text-slate-500 mb-1">{cuenta.alias}</p>}
              <p className="font-mono text-sm text-slate-600 mb-3">{cuenta.numero}</p>
              <p className={`text-2xl font-bold ${cuenta.saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {fmt(cuenta.saldo)}
              </p>
              <p className="text-xs text-slate-400 mt-1">{cuenta._count?.movimientos ?? 0} movimientos</p>
            </button>
          ))}
        </div>
      )}

      {/* Movimientos de la cuenta seleccionada */}
      {selectedId && (
        <div className="card">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">
              Movimientos — {selectedCuenta?.banco?.nombre ?? 'Cuenta'}{selectedCuenta?.alias ? ` · ${selectedCuenta.alias}` : ''} <span className="font-mono text-sm text-slate-500 ml-1">{selectedCuenta?.numero}</span>
            </h2>
            <button
              onClick={() => {
                setShowMovForm(true)
                setMovForm({ cuentaBancariaId: selectedId })
              }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Plus size={13} /> Movimiento
            </button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Concepto</th>
                  <th>Referencia</th>
                  <th className="text-right">Monto</th>
                  <th className="text-right">Saldo Parcial</th>
                </tr>
              </thead>
              <tbody>
                {loadingMov ? (
                  <tr><td colSpan={6} className="text-center py-8">Cargando...</td></tr>
                ) : movimientos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      <CreditCard size={28} className="mx-auto mb-2 text-slate-300" />
                      <p>Sin movimientos en esta cuenta</p>
                      <button
                        onClick={() => { setShowMovForm(true); setMovForm({ cuentaBancariaId: selectedId }) }}
                        className="mt-3 text-xs text-indigo-600 hover:underline font-medium"
                      >
                        Registrar primer movimiento
                      </button>
                    </td>
                  </tr>
                ) : (
                  movimientos.map(mov => (
                    <tr key={mov.id} className="table-row-hover">
                      <td>{new Date(mov.fecha).toLocaleDateString('es-AR')}</td>
                      <td>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          mov.tipo === 'CREDITO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {mov.tipo === 'CREDITO' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {mov.tipo === 'CREDITO' ? 'Crédito' : 'Débito'}
                        </span>
                      </td>
                      <td>{mov.concepto}</td>
                      <td className="text-slate-500 text-sm">{mov.referencia ?? '—'}</td>
                      <td className={`text-right font-semibold ${
                        mov.tipo === 'CREDITO' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {mov.tipo === 'CREDITO' ? '+' : '-'}{fmt(mov.monto)}
                      </td>
                      <td className="text-right font-semibold text-slate-900">{fmt(mov.saldoNuevo)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {movTotalPages > 1 && (
            <div className="p-4 border-t border-slate-200">
              <Pagination page={movPage} totalPages={movTotalPages} onPageChange={setMovPage} />
            </div>
          )}
        </div>
      )}

      {/* Modal: Nueva Cuenta Bancaria */}
      {showCuentaForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Nueva Cuenta Bancaria</h3>
                <p className="text-xs text-slate-500 mt-0.5">Agregá una cuenta para registrar movimientos</p>
              </div>
              <button onClick={() => setShowCuentaForm(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Banco *</label>
              <input
                type="text" className="input w-full"
                placeholder="Ej: Banco Nación, Santander, BBVA..."
                value={cuentaForm.bancoNombre ?? ''}
                onChange={e => setCuentaForm(f => ({ ...f, bancoNombre: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de cuenta *</label>
              <select
                className="input w-full"
                value={cuentaForm.tipoCuenta ?? ''}
                onChange={e => setCuentaForm(f => ({ ...f, tipoCuenta: e.target.value as any }))}
              >
                <option value="">Seleccioná un tipo...</option>
                {TIPOS_CUENTA.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Número de cuenta *</label>
              <input
                type="text" className="input w-full"
                placeholder="Ej: 0000000000000000000000"
                value={cuentaForm.numero ?? ''}
                onChange={e => setCuentaForm(f => ({ ...f, numero: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alias (opcional)</label>
              <input
                type="text" className="input w-full"
                placeholder="Ej: Cuenta operativa, Cuenta sueldos..."
                value={cuentaForm.alias ?? ''}
                onChange={e => setCuentaForm(f => ({ ...f, alias: e.target.value || undefined }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Saldo inicial (opcional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">$</span>
                <input
                  type="number" min="0" step="0.01"
                  className="input w-full pl-7"
                  placeholder="0.00"
                  value={cuentaForm.saldoInicial ?? ''}
                  onChange={e => setCuentaForm(f => ({ ...f, saldoInicial: parseFloat(e.target.value) || undefined }))}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowCuentaForm(false)} className="btn btn-secondary flex-1">Cancelar</button>
              <button
                onClick={handleCrearCuenta}
                disabled={!cuentaForm.numero || !cuentaForm.tipoCuenta || !cuentaForm.bancoNombre || crearCuenta.isPending}
                className="btn btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {crearCuenta.isPending ? 'Creando...' : 'Crear Cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nuevo Movimiento */}
      {showMovForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Registrar Movimiento</h3>
              <button onClick={() => setShowMovForm(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cuenta Bancaria *</label>
              <select
                className="input w-full"
                value={movForm.cuentaBancariaId ?? ''}
                onChange={e => setMovForm(f => ({ ...f, cuentaBancariaId: e.target.value }))}
              >
                <option value="">Seleccioná una cuenta...</option>
                {cuentas.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.banco?.nombre}{c.alias ? ` · ${c.alias}` : ''} — {c.numero}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMovForm(f => ({ ...f, tipo: 'CREDITO' }))}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-colors ${
                    movForm.tipo === 'CREDITO'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-500 hover:border-emerald-300'
                  }`}
                >
                  <TrendingUp size={16} /> Crédito (ingreso)
                </button>
                <button
                  type="button"
                  onClick={() => setMovForm(f => ({ ...f, tipo: 'DEBITO' }))}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition-colors ${
                    movForm.tipo === 'DEBITO'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-slate-200 text-slate-500 hover:border-red-300'
                  }`}
                >
                  <TrendingDown size={16} /> Débito (egreso)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monto *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">$</span>
                <input
                  type="number" min="0" step="0.01"
                  className="input w-full pl-7 text-right"
                  placeholder="0.00"
                  value={movForm.monto ?? ''}
                  onChange={e => setMovForm(f => ({ ...f, monto: parseFloat(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Concepto *</label>
              <input
                type="text" className="input w-full"
                placeholder="Ej: Pago proveedor, Cobro cliente, Transferencia..."
                value={movForm.concepto ?? ''}
                onChange={e => setMovForm(f => ({ ...f, concepto: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Referencia (opcional)</label>
              <input
                type="text" className="input w-full"
                placeholder="Nro. de comprobante, cheque, transferencia..."
                value={movForm.referencia ?? ''}
                onChange={e => setMovForm(f => ({ ...f, referencia: e.target.value || undefined }))}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowMovForm(false)} className="btn btn-secondary flex-1">Cancelar</button>
              <button
                onClick={handleRegistrarMov}
                disabled={!movForm.cuentaBancariaId || !movForm.tipo || !movForm.monto || !movForm.concepto || registrar.isPending}
                className="btn btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {registrar.isPending ? 'Guardando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
