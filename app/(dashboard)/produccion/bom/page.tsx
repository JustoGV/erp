'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, ArrowLeft, Package } from 'lucide-react'
import { useLocal } from '@/contexts/LocalContext'
import { mockBOMs, type BOM } from '@/lib/mock-data'

export default function BOMPage() {
  const { selectedLocal } = useLocal()
  const [boms, setBoms] = useState<BOM[]>(mockBOMs)

  useEffect(() => {
    if (!selectedLocal) {
      setBoms(mockBOMs)
    } else {
      setBoms(mockBOMs.filter(b => b.localId === selectedLocal.id))
    }
  }, [selectedLocal])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/produccion" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={24} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <FileText className="text-white" size={28} />
            </div>
            Lista de Materiales (BOM)
          </h1>
          <p className="text-slate-600 mt-1">Configuración de recetas de producción</p>
        </div>
      </div>

      {/* Lista de BOMs */}
      <div className="grid grid-cols-1 gap-6">
        {boms.map(bom => (
          <div key={bom.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header del BOM */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{bom.productoTerminadoNombre}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Código: {bom.code} | Versión: {bom.version} | 
                    Produce: {bom.cantidad} {bom.unidad}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Costo Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${bom.costoTotal.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Materiales del BOM */}
            <div className="p-6">
              <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Package size={20} className="text-blue-600" />
                Materiales Requeridos
              </h4>
              <div className="space-y-3">
                {bom.materiales.map(material => (
                  <div key={material.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{material.materialNombre}</p>
                        <p className="text-sm text-slate-600">Código: {material.materialCode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {material.cantidad} {material.unidad}
                      </p>
                      <p className="text-sm text-slate-600">
                        ${material.costoUnitario.toLocaleString('es-AR')} × {material.cantidad} = 
                        <span className="font-medium text-blue-600"> ${material.costoTotal.toLocaleString('es-AR')}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {boms.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600">No hay BOMs configurados para este local</p>
        </div>
      )}
    </div>
  )
}
