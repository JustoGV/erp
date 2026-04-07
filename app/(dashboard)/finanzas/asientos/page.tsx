'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FileText, ArrowLeft, Plus, CheckCircle, XCircle, FileEdit, Trash2, X,
  ChevronDown, ChevronRight, TrendingUp, TrendingDown, Scale, Info, AlertTriangle, Check, Pencil
} from 'lucide-react'
import { useLocal } from '@/contexts/LocalContext'
import { useAsientos, useAsiento, usePlanCuentas, useCrearAsiento, useActualizarAsiento, useConfirmarAsiento, useAnularAsiento } from '@/hooks/useFinanzas'
import { asientosService } from '@/lib/services/finanzas.service'
import { useApiToast } from '@/hooks/useApiToast'
import Pagination from '@/components/Pagination'
import type { DetalleAsientoDto, CuentaContable } from '@/lib/api-types'

// Single unified form line with DEBE/HABER toggle
interface LineaForm {
  cuentaId: string
  lado: 'DEBE' | 'HABER'
  monto: number
}

function emptyLinea(lado: 'DEBE' | 'HABER' = 'DEBE'): LineaForm {
  return { cuentaId: '', lado, monto: 0 }
}

function buildDetalles(lineas: LineaForm[]): DetalleAsientoDto[] {
  return lineas.map(l => ({
    cuentaId: l.cuentaId,
    debe:  l.lado === 'DEBE'  ? l.monto : 0,
    haber: l.lado === 'HABER' ? l.monto : 0,
  }))
}

// Subcomponente que carga y muestra las líneas de un asiento
function AsientoDetalle({ id }: { id: string }) {
  const { data, isLoading } = useAsiento(id)
  const detalles = data?.data?.detalles ?? []
  const fmt = (v: number) => v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  if (isLoading) {
    return (
      <tr>
        <td colSpan={9} className="px-6 py-3 bg-slate-50 text-sm text-slate-500 text-center">
          Cargando líneas...
        </td>
      </tr>
    )
  }

  const totalDebe  = detalles.reduce((s, d) => s + (parseFloat(String(d.debe)) || 0), 0)
  const totalHaber = detalles.reduce((s, d) => s + (parseFloat(String(d.haber)) || 0), 0)
  const cuadrado   = Math.abs(totalDebe - totalHaber) < 0.001

  return (
    <>
      <tr>
        <td colSpan={9} className="p-0">
          <div className="bg-slate-50 border-y border-slate-200 px-6 py-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Detalle del asiento</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs">
                  <th className="text-left pb-1 font-semibold text-slate-500 w-1/3">Cuenta</th>
                  <th className="text-right pb-1 font-semibold text-blue-600 w-1/6">DEBE</th>
                  <th className="text-right pb-1 font-semibold text-purple-600 w-1/6">HABER</th>
                  <th className="text-left pb-1 font-medium text-slate-500 pl-4">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detalles.map(d => (
                  <tr key={d.id}>
                    <td className="py-1.5 font-mono text-xs text-slate-700">
                      {d.cuenta ? `${d.cuenta.code} — ${d.cuenta.nombre}` : d.cuentaId}
                    </td>
                    <td className="py-1.5 text-right">
                      {Number(d.debe) > 0
                        ? <span className="inline-flex items-center gap-1 text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded"><TrendingUp size={11} />${fmt(Number(d.debe))}</span>
                        : <span className="text-slate-300">—</span>
                      }
                    </td>
                    <td className="py-1.5 text-right">
                      {Number(d.haber) > 0
                        ? <span className="inline-flex items-center gap-1 text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded"><TrendingDown size={11} />${fmt(Number(d.haber))}</span>
                        : <span className="text-slate-300">—</span>
                      }
                    </td>
                    <td className="py-1.5 pl-4 text-slate-500 text-xs">{d.descripcion ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200">
                  <td className="pt-2 text-xs font-bold text-slate-600 uppercase">Totales</td>
                  <td className="pt-2 text-right text-sm font-bold text-blue-700">${fmt(totalDebe)}</td>
                  <td className="pt-2 text-right text-sm font-bold text-purple-700">${fmt(totalHaber)}</td>
                  <td className="pt-2 pl-4">
                    {cuadrado
                      ? <span className="text-xs text-green-600 font-semibold flex items-center gap-1"><Check size={12} /> Cuadrado</span>
                      : <span className="text-xs text-orange-600 font-semibold flex items-center gap-1"><AlertTriangle size={12} /> Diferencia: ${fmt(Math.abs(totalDebe - totalHaber))}</span>
                    }
                  </td>
                </tr>
              </tfoot>
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

export default function AsientosPage() {
  const { selectedLocal, isAllLocales } = useLocal()
  const localId = isAllLocales ? undefined : selectedLocal?.id
  const [page, setPage] = useState(1)

  const { data, isLoading } = useAsientos({ localId, page, limit: 20 })
  const asientos = [...(data?.data ?? [])].sort((a, b) => b.numero - a.numero)
  const totalPages = data?.meta?.totalPages ?? 1

  const { data: planData } = usePlanCuentas()
  const cuentasImputables = flattenImputables(planData?.data ?? [])

  const crearAsiento     = useCrearAsiento()
  const actualizarAsiento = useActualizarAsiento()
  const confirmarAsiento  = useConfirmarAsiento()
  const anularAsiento     = useAnularAsiento()
  const { handleError, handleSuccess } = useApiToast()

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [lineas, setLineas] = useState<LineaForm[]>([emptyLinea('DEBE'), emptyLinea('HABER')])

  const totalDebe  = lineas.filter(l => l.lado === 'DEBE').reduce((s, l)  => s + (l.monto || 0), 0)
  const totalHaber = lineas.filter(l => l.lado === 'HABER').reduce((s, l) => s + (l.monto || 0), 0)
  const diferencia = totalDebe - totalHaber
  const cuadrado   = Math.abs(diferencia) < 0.001

  const updateLinea = (i: number, p: Partial<LineaForm>) =>
    setLineas(ls => ls.map((l, idx) => idx === i ? { ...l, ...p } : l))
  const removeLinea = (i: number) => setLineas(ls => ls.filter((_, idx) => idx !== i))
  const addLinea    = (lado: 'DEBE' | 'HABER') => setLineas(ls => [...ls, emptyLinea(lado)])

  // Fills/adds a counterpart line to balance the entry
  const autoBalance = () => {
    if (Math.abs(diferencia) < 0.001) return
    if (diferencia > 0) {
      const idx = lineas.findIndex(l => l.lado === 'HABER' && l.monto === 0)
      idx >= 0
        ? updateLinea(idx, { monto: diferencia })
        : setLineas(ls => [...ls, { cuentaId: '', lado: 'HABER', monto: diferencia }])
    } else {
      const idx = lineas.findIndex(l => l.lado === 'DEBE' && l.monto === 0)
      idx >= 0
        ? updateLinea(idx, { monto: Math.abs(diferencia) })
        : setLineas(ls => [...ls, { cuentaId: '', lado: 'DEBE', monto: Math.abs(diferencia) }])
    }
  }

  const hayDebe  = lineas.some(l => l.lado === 'DEBE')
  const hayHaber = lineas.some(l => l.lado === 'HABER')
  const camposCompletos = descripcion.trim().length > 0
    && hayDebe && hayHaber
    && lineas.every(l => l.cuentaId && l.monto > 0)
  const canSubmit = camposCompletos

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setDescripcion('')
    setFecha(new Date().toISOString().slice(0, 10))
    setLineas([emptyLinea('DEBE'), emptyLinea('HABER')])
  }

  const handleEditar = async (asiento: { id: string; descripcion: string; fecha: string; detalles?: { cuentaId: string; debe: number; haber: number; descripcion?: string }[] }) => {
    let detalles = asiento.detalles ?? []
    if (detalles.length === 0) {
      const res = await asientosService.getOne(asiento.id)
      detalles = res.data.data?.detalles ?? []
    }
    const loaded: LineaForm[] = [
      ...detalles.filter(d => Number(d.debe)  > 0).map(d => ({ cuentaId: d.cuentaId, lado: 'DEBE'  as const, monto: Number(d.debe) })),
      ...detalles.filter(d => Number(d.haber) > 0).map(d => ({ cuentaId: d.cuentaId, lado: 'HABER' as const, monto: Number(d.haber) })),
    ]
    setLineas(loaded.length > 0 ? loaded : [emptyLinea('DEBE'), emptyLinea('HABER')])
    setDescripcion(asiento.descripcion)
    setFecha(asiento.fecha.slice(0, 10))
    setEditingId(asiento.id)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!canSubmit || !localId) return
    try {
      if (editingId) {
        // Backend doesn't have PATCH /asientos/:id yet — workaround: anular original + crear nuevo
        await anularAsiento.mutateAsync(editingId)
        await crearAsiento.mutateAsync({
          dto: { fecha, descripcion, detalles: buildDetalles(lineas) },
          localId,
        })
        handleSuccess(cuadrado ? 'Borrador reemplazado y cuadrado' : 'Borrador actualizado')
      } else {
        await crearAsiento.mutateAsync({
          dto: { fecha, descripcion, detalles: buildDetalles(lineas) },
          localId,
        })
        handleSuccess(cuadrado ? 'Asiento creado correctamente' : 'Asiento guardado como borrador')
      }
      resetForm()
    } catch (e) {
      handleError(e)
    }
  }

  const handleConfirmar = async (id: string) => {
    try {
      await confirmarAsiento.mutateAsync(id)
      handleSuccess('Asiento confirmado')
    } catch (e) {
      handleError(e)
    }
  }

  const handleAnular = async (id: string) => {
    try {
      await anularAsiento.mutateAsync(id)
      handleSuccess('Asiento anulado')
    } catch (e) {
      handleError(e)
    }
  }

  const fmt = (v: number) => v.toLocaleString('es-AR', { minimumFractionDigits: 2 })

  // For the visual balance bar
  const maxTotal = Math.max(totalDebe, totalHaber, 1)
  const debePercent  = (totalDebe  / maxTotal) * 100
  const haberPercent = (totalHaber / maxTotal) * 100

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
            <p className="text-slate-600 mt-1">Registro de operaciones · Partida doble</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHelp(h => !h)}
            className={`p-2 rounded-lg transition-colors ${showHelp ? 'bg-blue-100 text-blue-700' : 'hover:bg-blue-50 text-blue-500'}`}
            title="¿Cómo funciona la partida doble?"
          >
            <Info size={20} />
          </button>
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
      </div>

      {/* Help panel */}
      {showHelp && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm">
          <p className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Scale size={16} /> Partida Doble — guía rápida
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-blue-100/60 rounded-lg p-3">
              <p className="font-bold text-blue-800 mb-1.5">📥 DEBE (Débito)</p>
              <ul className="space-y-1 text-blue-700 text-xs leading-relaxed">
                <li>• Aumenta <strong>activos</strong> (Caja, Banco, Clientes)</li>
                <li>• Aumenta <strong>gastos y egresos</strong></li>
                <li>• Disminuye pasivos y patrimonio</li>
              </ul>
            </div>
            <div className="bg-purple-100/60 rounded-lg p-3">
              <p className="font-bold text-purple-800 mb-1.5">📤 HABER (Crédito)</p>
              <ul className="space-y-1 text-purple-700 text-xs leading-relaxed">
                <li>• Aumenta <strong>pasivos</strong> (Proveedores, Deudas)</li>
                <li>• Aumenta <strong>ingresos y patrimonio</strong></li>
                <li>• Disminuye activos</li>
              </ul>
            </div>
          </div>
          <p className="mt-3 text-xs text-blue-700 bg-white/70 rounded-lg px-3 py-2 border border-blue-200">
            💡 <strong>Regla fundamental:</strong> Total DEBE = Total HABER. Podés guardar un asiento como <strong>BORRADOR</strong> sin cuadrar y confirmarlo después.
          </p>
        </div>
      )}

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
                <th className="text-right text-blue-700">DEBE</th>
                <th className="text-right text-purple-700">HABER</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="text-center py-10">Cargando...</td></tr>
              ) : asientos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    <Scale size={32} className="mx-auto mb-2 text-slate-300" />
                    <p>No hay asientos registrados</p>
                    {localId && <p className="text-xs mt-1">Hacé clic en "Nuevo Asiento" para comenzar</p>}
                  </td>
                </tr>
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
                      <td className="text-right font-semibold text-blue-700">${asiento.totalDebe.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                      <td className="text-right font-semibold text-purple-700">${asiento.totalHaber.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
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
                      <td onClick={e => e.stopPropagation()}>
                        {asiento.estado === 'BORRADOR' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditar(asiento)}
                              title="Editar borrador"
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium flex items-center gap-1 transition-colors"
                            >
                              <Pencil size={12} /> Editar
                            </button>
                            <button
                              onClick={() => handleConfirmar(asiento.id)}
                              disabled={confirmarAsiento.isPending}
                              title="Confirmar asiento"
                              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium flex items-center gap-1 transition-colors"
                            >
                              <CheckCircle size={12} /> Confirmar
                            </button>
                            <button
                              onClick={() => handleAnular(asiento.id)}
                              disabled={anularAsiento.isPending}
                              title="Anular asiento"
                              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium flex items-center gap-1 transition-colors"
                            >
                              <XCircle size={12} /> Anular
                            </button>
                          </div>
                        )}
                        {asiento.estado === 'CONFIRMADO' && (
                          <button
                            onClick={() => handleAnular(asiento.id)}
                            disabled={anularAsiento.isPending}
                            title="Anular asiento"
                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium flex items-center gap-1 transition-colors"
                          >
                            <XCircle size={12} /> Anular
                          </button>
                        )}
                      </td>
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
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? 'Editar Borrador' : 'Nuevo Asiento Contable'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingId
                    ? 'Modificá las líneas y guardá — podés confirmar cuando esté cuadrado'
                    : <>Se guardará como <span className="font-semibold text-yellow-700">BORRADOR</span> — confirmalo después cuando esté cuadrado</>}
                </p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Header fields */}
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
                  placeholder="Ej: Pago de alquiler marzo, Cobro factura 0001-000123..."
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                />
              </div>
            </div>

            {/* Visual balance widget */}
            <div className={`rounded-xl p-4 mb-4 border-2 transition-colors ${cuadrado ? 'bg-green-50 border-green-300' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-center min-w-[100px]">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">DEBE</p>
                  <p className="text-2xl font-bold text-blue-700">${fmt(totalDebe)}</p>
                </div>
                <div className="flex-1 px-6">
                  <div className="relative h-5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${debePercent}%` }}
                    />
                    <div
                      className="absolute right-0 top-0 h-full bg-purple-500 transition-all duration-300"
                      style={{ width: `${haberPercent}%`, maxWidth: '100%' }}
                    />
                    {cuadrado && totalDebe > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check size={12} className="text-white drop-shadow" />
                      </div>
                    )}
                  </div>
                  <div className="text-center mt-2">
                    {cuadrado && totalDebe > 0
                      ? <span className="text-sm font-bold text-green-600 flex items-center justify-center gap-1"><CheckCircle size={14} /> Partida cuadrada</span>
                      : diferencia !== 0
                        ? <span className="text-xs font-semibold text-orange-600 flex items-center justify-center gap-1">
                            <AlertTriangle size={13} />
                            {diferencia > 0
                              ? `Falta $${fmt(diferencia)} en HABER`
                              : `Falta $${fmt(Math.abs(diferencia))} en DEBE`
                            }
                          </span>
                        : <span className="text-xs text-slate-400">Ingresá los montos para ver el balance</span>
                    }
                  </div>
                </div>
                <div className="text-center min-w-[100px]">
                  <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-1">HABER</p>
                  <p className="text-2xl font-bold text-purple-700">${fmt(totalHaber)}</p>
                </div>
              </div>
              {!cuadrado && diferencia !== 0 && (
                <button
                  onClick={autoBalance}
                  className="w-full text-xs py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-600 font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <Scale size={12} />
                  Auto-balancear — agregar ${fmt(Math.abs(diferencia))} al {diferencia > 0 ? 'HABER' : 'DEBE'}
                </button>
              )}
            </div>

            {/* Lines — unified list */}
            <div className="flex-1 overflow-y-auto mb-4">
              {/* Column headers */}
              <div className="grid grid-cols-[100px_1fr_130px_32px] gap-2 px-1 mb-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tipo</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Cuenta</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide text-right">Monto</span>
                <span />
              </div>

              <div className="space-y-2">
                {lineas.map((linea, i) => (
                  <div key={i} className={`grid grid-cols-[100px_1fr_130px_32px] gap-2 items-center p-2 rounded-xl border transition-colors ${
                    linea.lado === 'DEBE'
                      ? 'bg-blue-50/60 border-blue-200'
                      : 'bg-purple-50/60 border-purple-200'
                  }`}>

                    {/* Toggle button — click to flip DEBE ↔ HABER */}
                    <button
                      type="button"
                      onClick={() => updateLinea(i, { lado: linea.lado === 'DEBE' ? 'HABER' : 'DEBE' })}
                      className={`w-full h-9 rounded-lg text-sm font-bold tracking-wide transition-all ${
                        linea.lado === 'DEBE'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {linea.lado}
                    </button>

                    <select
                      className={`input text-sm ${
                        !linea.cuentaId ? 'border-orange-300 bg-orange-50/60' :
                        linea.lado === 'DEBE' ? 'border-blue-200' : 'border-purple-200'
                      }`}
                      value={linea.cuentaId}
                      onChange={e => updateLinea(i, { cuentaId: e.target.value })}
                    >
                      <option value="">Seleccioná una cuenta...</option>
                      {cuentasImputables.map(c => (
                        <option key={c.id} value={c.id}>{c.code} — {c.nombre}</option>
                      ))}
                    </select>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">$</span>
                      <input
                        type="number" min="0" step="0.01"
                        className={`input text-sm text-right pl-7 w-full ${
                          (!linea.monto || linea.monto <= 0) ? 'border-orange-300 bg-orange-50/60' :
                          linea.lado === 'DEBE' ? 'border-blue-200' : 'border-purple-200'
                        }`}
                        placeholder="0.00"
                        value={linea.monto || ''}
                        onChange={e => updateLinea(i, { monto: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    {lineas.length > 2 ? (
                      <button type="button" onClick={() => removeLinea(i)} className="p-1 text-red-400 hover:text-red-600 rounded">
                        <Trash2 size={15} />
                      </button>
                    ) : <div />}
                  </div>
                ))}
              </div>

              {/* Add line buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => addLinea('DEBE')}
                  className="flex-1 py-2 text-xs font-semibold text-blue-600 hover:text-blue-800 border border-dashed border-blue-300 hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <Plus size={13} /> DEBE
                </button>
                <button
                  type="button"
                  onClick={() => addLinea('HABER')}
                  className="flex-1 py-2 text-xs font-semibold text-purple-600 hover:text-purple-800 border border-dashed border-purple-300 hover:bg-purple-50 rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <Plus size={13} /> HABER
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 flex-col">
              {!canSubmit && (
                <p className="text-xs text-orange-700 text-center bg-orange-50 border border-orange-200 rounded-lg py-2">
                  {!descripcion.trim()
                    ? '⚠ Ingresá una descripción del asiento'
                    : !hayDebe || !hayHaber
                    ? '⚠ Necesitás al menos una línea DEBE y una HABER'
                    : lineas.some(l => !l.cuentaId)
                    ? '⚠ Seleccioná una cuenta en cada línea'
                    : '⚠ Todas las líneas deben tener un monto mayor a cero'}
                </p>
              )}
              {canSubmit && !cuadrado && (
                <p className="text-xs text-amber-700 text-center bg-amber-50 border border-amber-200 rounded-lg py-2">
                  ℹ El asiento no está cuadrado — se guardará como <strong>BORRADOR</strong>. Confirmalo desde la lista cuando esté listo.
                </p>
              )}
              <div className="flex gap-3">
                <button onClick={resetForm} className="btn btn-secondary flex-1">
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || crearAsiento.isPending || actualizarAsiento.isPending}
                  className="btn btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {(crearAsiento.isPending || actualizarAsiento.isPending)
                    ? 'Guardando...'
                    : editingId
                    ? cuadrado ? '✓ Guardar y Cuadrar' : 'Guardar Borrador'
                    : cuadrado ? '✓ Crear Asiento' : 'Guardar como Borrador'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

