'use client'

import { useState } from 'react'
import { Plus, DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { useLocal } from '@/contexts/LocalContext'
import { useSaldoCaja, useMovimientosCaja, useRegistrarMovimientoCaja } from '@/hooks/useFinanzas'
import { useApiToast } from '@/hooks/useApiToast'
import Pagination from '@/components/Pagination'
import type { MovimientoCajaDto } from '@/lib/api-types'

export default function CajaPage() {
  const { selectedLocal, isAllLocales } = useLocal()
  const localId = selectedLocal?.id ?? ''
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<MovimientoCajaDto>>({})

  const { data: cajaData, isLoading: loadingCaja } = useSaldoCaja(localId)
  const { data: movData, isLoading: loadingMov } = useMovimientosCaja(localId, { page, limit: 20 })
  const caja = cajaData?.data
  const movimientos = movData?.data ?? []
  const totalPages = movData?.meta?.totalPages ?? 1

  const registrar = useRegistrarMovimientoCaja()
  const { handleError, handleSuccess } = useApiToast()

  const handleRegistrar = async () => {
    if (!localId || !form.tipo || !form.monto || !form.concepto) return
    try {
      await registrar.mutateAsync({ localId, dto: form as MovimientoCajaDto })
      handleSuccess('Movimiento registrado')
      setShowForm(false)
      setForm({})
    } catch (e) {
      handleError(e)
    }
  }

  const fmt = (v: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v)

  if (isAllLocales || !localId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Caja</h1>
          <p className="text-slate-600 mt-1">Gestión de movimientos de efectivo</p>
        </div>
        <div className="card p-12 text-center">
          <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600">Selecioná un local para ver la caja.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Caja</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <DollarSign size={16} />
            Gestión de movimientos de efectivo
          </p>
        </div>
        <button onClick={() => { setShowForm(true); setForm({}) }} className="btn btn-primary">
          <Plus size={18} />
          Nuevo Movimiento
        </button>
      </div>

      {/* Saldo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Saldo Actual</p>
              {loadingCaja ? (
                <div className="h-8 bg-slate-200 rounded w-32 mt-1 animate-pulse" />
              ) : (
                <p className="text-2xl font-bold text-blue-600">{fmt(caja?.saldo ?? 0)}</p>
              )}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Local</p>
              <p className="text-lg font-semibold text-slate-900">{selectedLocal?.name}</p>
              {caja?.updatedAt && (
                <p className="text-xs text-slate-400">
                  Actualizado: {new Date(caja.updatedAt).toLocaleString('es-AR')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Movimientos */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Concepto</th>
                <th>Referencia</th>
                <th className="text-right">Monto</th>
                <th className="text-right">Saldo Nuevo</th>
                <th>Por</th>
              </tr>
            </thead>
            <tbody>
              {loadingMov ? (
                <tr><td colSpan={7} className="text-center py-10">Cargando...</td></tr>
              ) : movimientos.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No hay movimientos de caja</td></tr>
              ) : (
                movimientos.map(mov => (
                  <tr key={mov.id} className="table-row-hover">
                    <td>{new Date(mov.fecha).toLocaleDateString('es-AR')}</td>
                    <td>
                      <span className={`inline-flex items-center gap-1 badge ${
                        mov.tipo === 'INGRESO' ? 'badge-success' : 'badge-danger'
                      }`}>
                        {mov.tipo === 'INGRESO' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {mov.tipo}
                      </span>
                    </td>
                    <td className="font-medium">{mov.concepto}</td>
                    <td className="text-slate-500 text-sm">{mov.referencia ?? '—'}</td>
                    <td className={`text-right font-semibold ${
                      mov.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {mov.tipo === 'INGRESO' ? '+' : '-'}{fmt(mov.monto)}
                    </td>
                    <td className="text-right font-semibold text-slate-900">{fmt(mov.saldoNuevo)}</td>
                    <td className="text-sm text-slate-500">{mov.creadoPor}</td>
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

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Registrar Movimiento de Caja</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select
                className="input w-full"
                value={form.tipo ?? ''}
                onChange={e => setForm(f => ({ ...f, tipo: e.target.value as 'INGRESO' | 'EGRESO' }))}
              >
                <option value="">Seleccionar...</option>
                <option value="INGRESO">INGRESO (entrada)</option>
                <option value="EGRESO">EGRESO (salida)</option>
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

