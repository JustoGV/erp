'use client'

import { useState } from 'react'
import { Landmark, Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { useCuentasBancarias, useMovimientosBancarios, useRegistrarMovimientoBancario } from '@/hooks/useFinanzas'
import Pagination from '@/components/Pagination'
import { useApiToast } from '@/hooks/useApiToast'
import type { CreateMovimientoBancarioDto } from '@/lib/api-types'

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
  const { handleError, handleSuccess } = useApiToast()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<CreateMovimientoBancarioDto>>({})

  const handleRegistrar = async () => {
    if (!form.cuentaBancariaId || !form.tipo || !form.monto || !form.concepto) return
    try {
      await registrar.mutateAsync(form as CreateMovimientoBancarioDto)
      handleSuccess('Movimiento registrado')
      setShowForm(false)
      setForm({})
    } catch (e: any) {
      handleError(e)
    }
  }

  const fmt = (v: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
              <Landmark className="text-white" size={28} />
            </div>
            Bancos
          </h1>
          <p className="text-slate-600 mt-1">Cuentas bancarias y movimientos</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setForm({}) }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg"
        >
          <Plus size={20} />
          Nuevo Movimiento
        </button>
      </div>

      {/* Cuentas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-32 mb-3" />
              <div className="h-8 bg-slate-200 rounded w-40" />
            </div>
          ))
        ) : cuentas.map(cuenta => (
          <button
            key={cuenta.id}
            onClick={() => { setSelectedId(cuenta.id); setMovPage(1) }}
            className={`card p-6 text-left transition-all hover:shadow-md ${
              selectedId === cuenta.id ? 'ring-2 ring-indigo-500' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">{cuenta.banco?.nombre ?? 'Banco'}</span>
              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{cuenta.tipoCuenta}</span>
            </div>
            <p className="font-mono text-sm text-slate-700 mb-2">{cuenta.numero}</p>
            <p className={`text-2xl font-bold ${cuenta.saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {fmt(cuenta.saldo)}
            </p>
            <p className="text-xs text-slate-400 mt-1">{cuenta._count?.movimientos ?? 0} movimientos</p>
          </button>
        ))}
      </div>

      {/* Movimientos de la cuenta seleccionada */}
      {selectedId && (
        <div className="card">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-slate-800">
              Movimientos — {cuentas.find(c => c.id === selectedId)?.banco?.nombre ?? 'Cuenta seleccionada'}
            </h2>
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
                  <tr><td colSpan={6} className="text-center py-8 text-slate-400">Sin movimientos</td></tr>
                ) : (
                  movimientos.map(mov => (
                    <tr key={mov.id} className="table-row-hover">
                      <td>{new Date(mov.fecha).toLocaleDateString('es-AR')}</td>
                      <td>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          mov.tipo === 'CREDITO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {mov.tipo === 'CREDITO' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {mov.tipo}
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

      {/* Modal nuevo movimiento */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Registrar Movimiento Bancario</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cuenta Bancaria</label>
              <select
                className="input w-full"
                value={form.cuentaBancariaId ?? ''}
                onChange={e => setForm(f => ({ ...f, cuentaBancariaId: e.target.value }))}
              >
                <option value="">Seleccionar cuenta...</option>
                {cuentas.map(c => (
                  <option key={c.id} value={c.id}>{c.banco?.nombre} — {c.numero}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select
                className="input w-full"
                value={form.tipo ?? ''}
                onChange={e => setForm(f => ({ ...f, tipo: e.target.value as 'CREDITO' | 'DEBITO' }))}
              >
                <option value="">Seleccionar...</option>
                <option value="CREDITO">CRÉDITO (ingreso)</option>
                <option value="DEBITO">DÉBITO (egreso)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monto</label>
              <input
                type="number" min="0" step="0.01"
                className="input w-full"
                value={form.monto ?? ''}
                onChange={e => setForm(f => ({ ...f, monto: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Concepto</label>
              <input
                type="text" className="input w-full"
                value={form.concepto ?? ''}
                onChange={e => setForm(f => ({ ...f, concepto: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Referencia (opcional)</label>
              <input
                type="text" className="input w-full"
                value={form.referencia ?? ''}
                onChange={e => setForm(f => ({ ...f, referencia: e.target.value || undefined }))}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">Cancelar</button>
              <button
                onClick={handleRegistrar}
                disabled={registrar.isPending}
                className="btn btn-primary flex-1"
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
