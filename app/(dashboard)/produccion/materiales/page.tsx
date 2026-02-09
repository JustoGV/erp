'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import { useLocal } from '@/contexts/LocalContext'
import { mockMateriales, type MaterialProduccion } from '@/lib/mock-data'

export default function MaterialesPage() {
  const { selectedLocal } = useLocal()
  const [materiales, setMateriales] = useState<MaterialProduccion[]>(mockMateriales)

  useEffect(() => {
    if (!selectedLocal) {
      setMateriales(mockMateriales)
    } else {
      setMateriales(mockMateriales.filter(m => m.localId === selectedLocal.id))
    }
  }, [selectedLocal])

  const getStockStatus = (material: MaterialProduccion) => {
    if (material.stockActual < material.stockMinimo) {
      return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: <AlertCircle size={16} />, label: 'Bajo' }
    }
    if (material.stockActual >= material.stockMaximo) {
      return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: <CheckCircle size={16} />, label: 'Máximo' }
    }
    return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: <CheckCircle size={16} />, label: 'Óptimo' }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'MATERIA_PRIMA': return 'Materia Prima'
      case 'INSUMO': return 'Insumo'
      case 'SEMI_TERMINADO': return 'Semi-terminado'
      case 'TERMINADO': return 'Producto Terminado'
      default: return tipo
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/produccion" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={24} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
              <Package className="text-white" size={28} />
            </div>
            Materiales e Insumos
          </h1>
          <p className="text-slate-600 mt-1">Control de materias primas e insumos de producción</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-green-700 font-medium mb-1">Stock Óptimo</p>
          <p className="text-2xl font-bold text-green-900">
            {materiales.filter(m => m.stockActual >= m.stockMinimo && m.stockActual < m.stockMaximo).length}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <p className="text-sm text-red-700 font-medium mb-1">Stock Bajo</p>
          <p className="text-2xl font-bold text-red-900">
            {materiales.filter(m => m.stockActual < m.stockMinimo).length}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <p className="text-sm text-yellow-700 font-medium mb-1">Stock Máximo</p>
          <p className="text-2xl font-bold text-yellow-900">
            {materiales.filter(m => m.stockActual >= m.stockMaximo).length}
          </p>
        </div>
      </div>

      {/* Tabla de Materiales */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stock Actual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mín / Máx</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Costo Unit.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Proveedor</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {materiales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron materiales
                  </td>
                </tr>
              ) : (
                materiales.map(material => {
                  const status = getStockStatus(material)
                  const porcentajeStock = ((material.stockActual - material.stockMinimo) / (material.stockMaximo - material.stockMinimo)) * 100

                  return (
                    <tr key={material.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-blue-600">{material.code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{material.nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                          {getTipoLabel(material.tipo)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{material.stockActual} {material.unidad}</span>
                          <div className="w-20 bg-slate-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                porcentajeStock < 0 ? 'bg-red-500' :
                                porcentajeStock > 100 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(Math.max(porcentajeStock, 0), 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {material.stockMinimo} / {material.stockMaximo} {material.unidad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color} ${status.border} border`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900">
                          ${material.costoUnitario.toLocaleString('es-AR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{material.proveedorNombre}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
