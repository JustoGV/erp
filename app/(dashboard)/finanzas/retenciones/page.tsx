'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Stamp, ArrowLeft, Plus, X } from 'lucide-react'
import { useLocal } from '@/contexts/LocalContext'
import { useRetenciones, useRegistrarRetencion } from '@/hooks/useFinanzas'
import { useApiToast } from '@/hooks/useApiToast'
import Pagination from '@/components/Pagination'
import type { CreateRetencionDto, TipoRetencion } from '@/lib/api-types'

const TIPOS_RETENCION: TipoRetencion[] = ['IVA', 'GANANCIAS', 'INGRESOS_BRUTOS', 'OTRAS']

const tipoBadge = (tipo: TipoRetencion) => {
  switch (tipo) {
    case 'IVA':            return 'bg-blue-100 text-blue-700'
    case 'GANANCIAS':      return 'bg-purple-100 text-purple-700'
    case 'INGRESOS_BRUTOS': return 'bg-orange-100 text-orange-700'
    case 'OTRAS':          return 'bg-slate-100 text-slate-700'
  }
}

const emptyForm = (): Partial<CreateRetencionDto> => ({
  tipo: undefined,
  numero: '',
  importe: undefined,
  alicuota: undefined,
  baseImponible: undefined,
  fecha: new Date().toISOString().slice(0, 10),
  proveedorNombre: '',
  clienteNombre: '',
  descripcion: '',
})

export default function RetencionesPage() {
  const { selectedLocal, isAllLocales } = useLocal()
  const localId = isAllLocales ? undefined : selectedLocal?.id
  const [page, setPage] = useState(1)
  const [tipoFiltro, setTipoFiltro] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<CreateRetencionDto>>(emptyForm())

  const { data, isLoading } = useRetenciones({
    localId,
    page,
    limit: 20,
    tipo: tipoFiltro || undefined,
  })
  const retenciones = data?.data ?? []
  const totalPages = data?.meta?.totalPages ?? 1

  const registrar = useRegistrarRetencion()
  const { handleError, handleSuccess } = useApiToast()

  const canSubmit = form.tipo && form.numero && form.importe && form.alicuota && form.baseImponible

  const handleSubmit = async () => {
    if (!canSubmit || !localId) return
    try {
      await registrar.mutateAsync({ dto: form as CreateRetencionDto, localId })
      handleSuccess('Retención registrada correctamente')
      setShowForm(false)
      setForm(emptyForm())
    } catch (e) {
      handleError(e)
    }
  }

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
              <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                <Stamp className="text-white" size={28} />
              </div>
              Retenciones Impositivas
            </h1>
            <p className="text-slate-600 mt-1">IVA, Ganancias, Ingresos Brutos y otras</p>
          </div>
        </div>
        {localId && (
          <button
            onClick={() => { setShowForm(true); setForm(emptyForm()) }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg"
          >
            <Plus size={20} />
            Registrar Retención
          </button>
        )}
      </div>

      {/* Filtro por tipo */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium text-slate-700">Filtrar por tipo:</span>
        {['', ...TIPOS_RETENCION].map(t => (
          <button
            key={t}
            onClick={() => { setTipoFiltro(t); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tipoFiltro === t
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t || 'Todos'}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Número</th>
                <th>Fecha</th>
                <th>Proveedor / Cliente</th>
                <th className="text-right">Base Imponible</th>
                <th className="text-right">Alícuota</th>
                <th className="text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-10">Cargando...</td></tr>
              ) : retenciones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No hay retenciones registradas
                  </td>
                </tr>
              ) : (
                retenciones.map(ret => (
                  <tr key={ret.id} className="table-row-hover">
                    <td>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${tipoBadge(ret.tipo)}`}>
                        {ret.tipo.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="font-mono text-sm">{ret.numero}</td>
                    <td>{new Date(ret.fecha).toLocaleDateString('es-AR')}</td>
                    <td className="text-slate-700">
                      {ret.proveedorNombre ?? ret.clienteNombre ?? '—'}
                    </td>
                    <td className="text-right text-slate-700">{fmt(ret.baseImponible)}</td>
                    <td className="text-right text-slate-700">{ret.alicuota.toFixed(2)}%</td>
                    <td className="text-right font-bold text-amber-700">{fmt(ret.importe)}</td>
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

      {/* Aviso si no hay local seleccionado */}
      {!localId && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
          Seleccioná un local para registrar retenciones.
        </div>
      )}

      {/* Modal registrar retención */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg space-y-4 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Registrar Retención</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                <select
                  className="input w-full"
                  value={form.tipo ?? ''}
                  onChange={e => setForm(f => ({ ...f, tipo: e.target.value as TipoRetencion || undefined }))}
                >
                  <option value="">Seleccionar...</option>
                  {TIPOS_RETENCION.map(t => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número *</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="0001-00001234"
                  value={form.numero ?? ''}
                  onChange={e => setForm(f => ({ ...f, numero: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Base Imponible *</label>
                <input
                  type="number" min="0" step="0.01"
                  className="input w-full"
                  value={form.baseImponible ?? ''}
                  onChange={e => setForm(f => ({ ...f, baseImponible: parseFloat(e.target.value) || undefined }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alícuota % *</label>
                <input
                  type="number" min="0" step="0.01"
                  className="input w-full"
                  placeholder="3.50"
                  value={form.alicuota ?? ''}
                  onChange={e => setForm(f => ({ ...f, alicuota: parseFloat(e.target.value) || undefined }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Importe Retenido *</label>
              <input
                type="number" min="0" step="0.01"
                className="input w-full"
                value={form.importe ?? ''}
                onChange={e => setForm(f => ({ ...f, importe: parseFloat(e.target.value) || undefined }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
              <input
                type="date"
                className="input w-full"
                value={form.fecha ?? ''}
                onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Proveedor</label>
              <input
                type="text"
                className="input w-full"
                value={form.proveedorNombre ?? ''}
                onChange={e => setForm(f => ({ ...f, proveedorNombre: e.target.value || undefined }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Cliente</label>
              <input
                type="text"
                className="input w-full"
                value={form.clienteNombre ?? ''}
                onChange={e => setForm(f => ({ ...f, clienteNombre: e.target.value || undefined }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <input
                type="text"
                className="input w-full"
                value={form.descripcion ?? ''}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value || undefined }))}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || registrar.isPending}
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
