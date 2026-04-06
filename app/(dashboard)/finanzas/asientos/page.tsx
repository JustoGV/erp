'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, ArrowLeft, Plus, CheckCircle, XCircle, FileEdit, Trash2, X, ChevronDown, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'
import { useLocal } from '@/contexts/LocalContext'
import { useAsientos, useAsiento, usePlanCuentas, useCrearAsiento } from '@/hooks/useFinanzas'
import { useApiToast } from '@/hooks/useApiToast'
import Pagination from '@/components/Pagination'
import type { DetalleAsientoDto, CuentaContable } from '@/lib/api-types'

// Subcomponente que carga y muestra las líneas de un asiento
function AsientoDetalle({ id }: { id: string }) {
  const { data, isLoading } = useAsiento(id)
  const detalles = data?.data?.detalles ?? []
  const fmt = (v: number) => v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  if (isLoading) {
    return (
      <tr>
        <td colSpan={8} className="px-6 py-3 bg-slate-50 text-sm text-slate-500 text-center">
          Cargando líneas...
        </td>
      </tr>
    )
  }

  return (
    <>
      <tr>
        <td colSpan={8} className="p-0">
          <div className="bg-slate-50 border-y border-slate-200 px-6 py-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Detalle del asiento</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500">
                  <th className="text-left pb-1 font-medium w-1/3">Cuenta</th>
                  <th className="text-right pb-1 font-medium w-1/6">Debe</th>
                  <th className="text-right pb-1 font-medium w-1/6">Haber</th>
                  <th className="text-left pb-1 font-medium pl-4">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detalles.map(d => (
                  <tr key={d.id}>
                    <td className="py-1.5 font-mono text-xs text-slate-700">
                      {d.cuenta ? `${d.cuenta.code} — ${d.cuenta.nombre}` : d.cuentaId}
                    </td>
                    <td className="py-1.5 text-right">
                      {d.debe > 0
                        ? <span className="inline-flex items-center gap-1 text-blue-700 font-semibold"><TrendingUp size={12} />${fmt(d.debe)}</span>
                        : <span className="text-slate-300">—</span>
                      }
                    </td>
                    <td className="py-1.5 text-right">
                      {d.haber > 0
                        ? <span className="inline-flex items-center gap-1 text-purple-700 font-semibold"><TrendingDown size={12} />${fmt(d.haber)}</span>
                        : <span className="text-slate-300">—</span>
                      }
                    </td>
                    <td className="py-1.5 pl-4 text-slate-500">{d.descripcion ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </td>
      </tr>
    </>
  )
}

function flattenImputables(cuentas: CuentaContable[]): CuentaContable[] {
  const result: CuentaContable[] = []
  for (const c of cuentas) {
    if (c.imputable) result.push(c)
    const hijos = ((c as any).subcuentas ?? c.children ?? []) as CuentaContable[]
    result.push(...flattenImputables(hijos))
  }
  return result
}

const emptyLinea = (): DetalleAsientoDto => ({ cuentaId: '', debe: 0, haber: 0, descripcion: '' })

export default function AsientosPage() {
  const { selectedLocal, isAllLocales } = useLocal()
  const localId = isAllLocales ? undefined : selectedLocal?.id
  const [page, setPage] = useState(1)

  const { data, isLoading } = useAsientos({ localId, page, limit: 20 })
  const asientos = data?.data ?? []
  const totalPages = data?.meta?.totalPages ?? 1

  const { data: planData } = usePlanCuentas()
  const cuentasImputables = flattenImputables(planData?.data ?? [])

  const crearAsiento = useCrearAsiento()
  const { handleError, handleSuccess } = useApiToast()

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id)

  const [showForm, setShowForm] = useState(false)
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [lineas, setLineas] = useState<DetalleAsientoDto[]>([emptyLinea(), emptyLinea()])

  const totalDebe = lineas.reduce((s, l) => s + (l.debe || 0), 0)
  const totalHaber = lineas.reduce((s, l) => s + (l.haber || 0), 0)
  const cuadrado = Math.abs(totalDebe - totalHaber) < 0.001

  const addLinea = () => setLineas(l => [...l, emptyLinea()])
  const removeLinea = (i: number) => setLineas(l => l.filter((_, idx) => idx !== i))
  const updateLinea = (i: number, patch: Partial<DetalleAsientoDto>) =>
    setLineas(l => l.map((li, idx) => idx === i ? { ...li, ...patch } : li))

  const canSubmit = descripcion.trim() && lineas.length >= 2 && cuadrado &&
    lineas.every(l => l.cuentaId)

  const handleSubmit = async () => {
    if (!canSubmit || !localId) return
    try {
      await crearAsiento.mutateAsync({
        dto: { fecha, descripcion, detalles: lineas },
        localId,
      })
      handleSuccess('Asiento creado correctamente')
      setShowForm(false)
      setDescripcion('')
      setFecha(new Date().toISOString().slice(0, 10))
      setLineas([emptyLinea(), emptyLinea()])
    } catch (e) {
      handleError(e)
    }
  }

  const fmt = (v: number) => v.toLocaleString('es-AR', { minimumFractionDigits: 2 })

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
                <FileText className="text-white" size={28} />
              </div>
              Asientos Contables
            </h1>
            <p className="text-slate-600 mt-1">Registro de operaciones contables</p>
          </div>
        </div>
        {localId && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-xl hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-lg"
          >
            <Plus size={20} />
            Nuevo Asiento
          </button>
        )}
      </div>

      {/* Lista de Asientos */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="w-6" />
                <th>#</th>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Tipo</th>
                <th className="text-right">Debe</th>
                <th className="text-right">Haber</th>
                <th>Estado</th>
                <th>Líneas</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="text-center py-10">Cargando...</td></tr>
              ) : asientos.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-slate-400">No hay asientos registrados</td></tr>
              ) : (
                asientos.map(asiento => (
                  <>
                    <tr
                      key={asiento.id}
                      className="table-row-hover cursor-pointer select-none"
                      onClick={() => toggleExpand(asiento.id)}
                    >
                      <td className="pl-3">
                        {expandedId === asiento.id
                          ? <ChevronDown size={16} className="text-slate-400" />
                          : <ChevronRight size={16} className="text-slate-400" />
                        }
                      </td>
                      <td className="font-mono font-bold">{asiento.numero}</td>
                      <td>{new Date(asiento.fecha).toLocaleDateString('es-AR')}</td>
                      <td className="max-w-xs truncate">{asiento.descripcion}</td>
                      <td>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          asiento.tipo === 'MANUAL' ? 'bg-slate-100 text-slate-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {asiento.tipo}
                        </span>
                      </td>
                      <td className="text-right font-semibold text-blue-700">${asiento.totalDebe.toLocaleString('es-AR')}</td>
                      <td className="text-right font-semibold text-purple-700">${asiento.totalHaber.toLocaleString('es-AR')}</td>
                      <td>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          asiento.estado === 'CONFIRMADO' ? 'bg-green-100 text-green-700' :
                          asiento.estado === 'BORRADOR'  ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {asiento.estado === 'CONFIRMADO' && <CheckCircle size={12} />}
                          {asiento.estado === 'BORRADOR'   && <FileEdit size={12} />}
                          {asiento.estado === 'ANULADO'    && <XCircle size={12} />}
                          {asiento.estado}
                        </span>
                      </td>
                      <td className="text-slate-500 text-sm">{asiento._count?.detalles ?? '—'}</td>
                    </tr>
                    {expandedId === asiento.id && <AsientoDetalle key={`det-${asiento.id}`} id={asiento.id} />}
                  </>
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

      {/* Modal Nuevo Asiento */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Nuevo Asiento Contable</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                <input
                  type="date" className="input w-full"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción *</label>
                <input
                  type="text" className="input w-full"
                  placeholder="Descripción del asiento..."
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                />
              </div>
            </div>

            {/* Líneas del asiento */}
            <div className="flex-1 overflow-y-auto mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Partidas (mínimo 2)</span>
                <button
                  onClick={addLinea}
                  className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-800 font-medium"
                >
                  <Plus size={16} /> Agregar línea
                </button>
              </div>

              <div className="space-y-2">
                {/* Encabezados */}
                <div className="grid grid-cols-[2fr_1fr_1fr_2fr_auto] gap-2 text-xs font-semibold text-slate-500 px-2">
                  <span>Cuenta</span>
                  <span>Debe</span>
                  <span>Haber</span>
                  <span>Descripción</span>
                  <span />
                </div>

                {lineas.map((linea, i) => (
                  <div key={i} className="grid grid-cols-[2fr_1fr_1fr_2fr_auto] gap-2 items-center">
                    <select
                      className={`input text-sm ${!linea.cuentaId ? 'border-red-400 bg-red-50' : ''}`}
                      value={linea.cuentaId}
                      onChange={e => updateLinea(i, { cuentaId: e.target.value })}
                    >
                      <option value="">Cuenta...</option>
                      {cuentasImputables.map(c => (
                        <option key={c.id} value={c.id}>{c.code} — {c.nombre}</option>
                      ))}
                    </select>
                    <input
                      type="number" min="0" step="0.01"
                      className="input text-sm text-right"
                      value={linea.debe || ''}
                      onChange={e => updateLinea(i, { debe: parseFloat(e.target.value) || 0 })}
                    />
                    <input
                      type="number" min="0" step="0.01"
                      className="input text-sm text-right"
                      value={linea.haber || ''}
                      onChange={e => updateLinea(i, { haber: parseFloat(e.target.value) || 0 })}
                    />
                    <input
                      type="text"
                      className="input text-sm"
                      placeholder="Descripción..."
                      value={linea.descripcion ?? ''}
                      onChange={e => updateLinea(i, { descripcion: e.target.value })}
                    />
                    {lineas.length > 2 && (
                      <button
                        onClick={() => removeLinea(i)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    {lineas.length <= 2 && <div className="w-6" />}
                  </div>
                ))}
              </div>

              {/* Totales partida doble */}
              <div className="grid grid-cols-[2fr_1fr_1fr_2fr_auto] gap-2 mt-3 pt-3 border-t border-slate-200 px-2">
                <span className="text-sm font-bold text-slate-700">TOTALES</span>
                <span className={`text-right font-bold text-sm ${!cuadrado ? 'text-red-600' : 'text-green-600'}`}>
                  ${fmt(totalDebe)}
                </span>
                <span className={`text-right font-bold text-sm ${!cuadrado ? 'text-red-600' : 'text-green-600'}`}>
                  ${fmt(totalHaber)}
                </span>
                <span className={`text-sm font-medium ${cuadrado ? 'text-green-600' : 'text-red-600'}`}>
                  {cuadrado
                    ? '✓ Partida cuadrada'
                    : `Diferencia: $${fmt(Math.abs(totalDebe - totalHaber))}`
                  }
                </span>
                <span />
              </div>

              {/* Banner de error cuando no cuadra */}
              {!cuadrado && totalDebe > 0 && totalHaber > 0 && (
                <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
                  <span className="font-bold">⚠</span>
                  La suma del DEBE (${fmt(totalDebe)}) debe ser igual a la suma del HABER (${fmt(totalHaber)}) para poder guardar el asiento.
                </div>
              )}
            </div>

            <div className="flex gap-3 flex-col">
              {!canSubmit && (
                <p className="text-xs text-red-600 text-center">
                  {!descripcion.trim()
                    ? '⚠ Ingresá una descripción'
                    : !cuadrado
                    ? `⚠ DEBE ($${fmt(totalDebe)}) ≠ HABER ($${fmt(totalHaber)})`
                    : lineas.some(l => !l.cuentaId)
                    ? '⚠ Todas las líneas deben tener una cuenta seleccionada'
                    : '⚠ Completá todos los campos requeridos'}
                </p>
              )}
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || crearAsiento.isPending}
                  className="btn btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                  title={!cuadrado ? 'El DEBE y el HABER deben ser iguales' : !descripcion.trim() ? 'Ingresá una descripción' : ''}
                >
                  {crearAsiento.isPending ? 'Guardando...' : 'Crear Asiento'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


