'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, ArrowLeft, Plus, CheckCircle, XCircle, FileEdit } from 'lucide-react'
import { useLocal } from '@/contexts/LocalContext'
import { mockAsientosContables, type AsientoContable } from '@/lib/mock-data'

export default function AsientosPage() {
  const { selectedLocal } = useLocal()
  const [asientos, setAsientos] = useState<AsientoContable[]>(mockAsientosContables)

  useEffect(() => {
    if (!selectedLocal) {
      setAsientos(mockAsientosContables)
    } else {
      setAsientos(mockAsientosContables.filter(a => a.localId === selectedLocal.id))
    }
  }, [selectedLocal])

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
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-xl hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-lg">
          <Plus size={20} />
          Nuevo Asiento
        </button>
      </div>

      {/* Lista de Asientos */}
      <div className="space-y-4">
        {asientos.map(asiento => (
          <div key={asiento.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header del Asiento */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-slate-900">#{asiento.numero}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      asiento.estado === 'CONFIRMADO' ? 'bg-green-100 text-green-700' :
                      asiento.estado === 'BORRADOR' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {asiento.estado === 'CONFIRMADO' && <CheckCircle size={12} className="inline mr-1" />}
                      {asiento.estado === 'BORRADOR' && <FileEdit size={12} className="inline mr-1" />}
                      {asiento.estado === 'ANULADO' && <XCircle size={12} className="inline mr-1" />}
                      {asiento.estado}
                    </span>
                    {asiento.tipo === 'AUTOMATICO' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        Automático
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 mt-2 font-medium">{asiento.descripcion}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <span>Fecha: {new Date(asiento.fecha).toLocaleDateString('es-AR')}</span>
                    <span>•</span>
                    <span>Por: {asiento.creadoPor}</span>
                    {asiento.origen && (
                      <>
                        <span>•</span>
                        <span>Origen: {asiento.origen}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Total</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${asiento.totalDebe.toLocaleString('es-AR')}
                  </p>
                  {asiento.totalDebe === asiento.totalHaber ? (
                    <span className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <CheckCircle size={12} />
                      Balanceado
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <XCircle size={12} />
                      Desbalanceado
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Detalles del Asiento */}
            <div className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 text-xs font-medium text-slate-500 uppercase">Cuenta</th>
                    <th className="text-left py-2 text-xs font-medium text-slate-500 uppercase">Descripción</th>
                    <th className="text-right py-2 text-xs font-medium text-slate-500 uppercase">Debe</th>
                    <th className="text-right py-2 text-xs font-medium text-slate-500 uppercase">Haber</th>
                  </tr>
                </thead>
                <tbody>
                  {asiento.detalles.map(detalle => (
                    <tr key={detalle.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3">
                        <div className="font-mono text-sm text-blue-600">{detalle.cuentaCode}</div>
                        <div className="text-sm text-slate-700">{detalle.cuentaNombre}</div>
                      </td>
                      <td className="py-3 text-sm text-slate-600">{detalle.descripcion}</td>
                      <td className="py-3 text-right">
                        {detalle.debe > 0 && (
                          <span className="font-semibold text-slate-900">
                            ${detalle.debe.toLocaleString('es-AR')}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {detalle.haber > 0 && (
                          <span className="font-semibold text-slate-900">
                            ${detalle.haber.toLocaleString('es-AR')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-semibold">
                    <td colSpan={2} className="py-3 text-right">TOTALES:</td>
                    <td className="py-3 text-right text-slate-900">
                      ${asiento.totalDebe.toLocaleString('es-AR')}
                    </td>
                    <td className="py-3 text-right text-slate-900">
                      ${asiento.totalHaber.toLocaleString('es-AR')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {asientos.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600">No hay asientos contables registrados</p>
        </div>
      )}
    </div>
  )
}

