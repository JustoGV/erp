'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Factory, FileText, Package, TrendingUp, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react'
import { useLocal } from '@/contexts/LocalContext'
import { mockOrdenesProduccion, mockBOMs, mockMateriales } from '@/lib/mock-data'

export default function ProduccionPage() {
  const { selectedLocal } = useLocal()
  const [ordenes, setOrdenes] = useState(mockOrdenesProduccion)
  const [boms, setBoms] = useState(mockBOMs)
  const [materiales, setMateriales] = useState(mockMateriales)

  useEffect(() => {
    if (!selectedLocal) {
      // Todos los locales
      setOrdenes(mockOrdenesProduccion)
      setBoms(mockBOMs)
      setMateriales(mockMateriales)
    } else {
      // Filtrar por local seleccionado
      setOrdenes(mockOrdenesProduccion.filter(o => o.localId === selectedLocal.id))
      setBoms(mockBOMs.filter(b => b.localId === selectedLocal.id))
      setMateriales(mockMateriales.filter(m => m.localId === selectedLocal.id))
    }
  }, [selectedLocal])

  const ordenesActivas = ordenes.filter(o => o.estado !== 'COMPLETADA' && o.estado !== 'CANCELADA')
  const ordenesCompletadas = ordenes.filter(o => o.estado === 'COMPLETADA')
  const materialesStockBajo = materiales.filter(m => m.stockActual < m.stockMinimo)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl">
              <Factory className="text-white" size={28} />
            </div>
            Producción
          </h1>
          <p className="text-slate-600 mt-1">Gestión de manufactura y órdenes de producción</p>
        </div>
        <Link
          href="/produccion/ordenes/nueva"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-xl hover:from-yellow-700 hover:to-yellow-800 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Nueva Orden
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Órdenes Activas</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{ordenesActivas.length}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Completadas</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{ordenesCompletadas.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">BOMs Activos</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{boms.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Stock Bajo</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{materialesStockBajo.length}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/produccion/ordenes"
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg hover:shadow-xl group"
        >
          <Factory size={32} className="mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-bold mb-2">Órdenes de Producción</h3>
          <p className="text-yellow-100 text-sm">Gestionar órdenes de producción</p>
          <p className="text-2xl font-bold mt-3">{ordenes.length}</p>
        </Link>

        <Link
          href="/produccion/bom"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl group"
        >
          <FileText size={32} className="mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-bold mb-2">Lista de Materiales (BOM)</h3>
          <p className="text-blue-100 text-sm">Configurar recetas de producción</p>
          <p className="text-2xl font-bold mt-3">{boms.length}</p>
        </Link>

        <Link
          href="/produccion/materiales"
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl group"
        >
          <Package size={32} className="mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-bold mb-2">Materiales e Insumos</h3>
          <p className="text-orange-100 text-sm">Control de materias primas</p>
          <p className="text-2xl font-bold mt-3">{materiales.length}</p>
        </Link>
      </div>

      {/* Alertas */}
      {materialesStockBajo.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-red-900 flex items-center gap-2 mb-4">
            <AlertCircle size={20} />
            Materiales con Stock Bajo
          </h3>
          <div className="space-y-2">
            {materialesStockBajo.map(material => (
              <div key={material.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div>
                  <p className="font-semibold text-slate-900">{material.nombre}</p>
                  <p className="text-sm text-slate-600">
                    Stock: {material.stockActual} {material.unidad} (mínimo: {material.stockMinimo})
                  </p>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                  Bajo
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Órdenes Recientes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Órdenes de Producción Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cantidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Operador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha Inicio</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {ordenes.slice(0, 5).map(orden => (
                <tr key={orden.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/produccion/ordenes/${orden.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                      {orden.code}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{orden.productoNombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-slate-900">{orden.cantidadProducida} / {orden.cantidadPlanificada} {orden.unidad}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      orden.estado === 'COMPLETADA' ? 'bg-green-100 text-green-700' :
                      orden.estado === 'EN_PROCESO' ? 'bg-yellow-100 text-yellow-700' :
                      orden.estado === 'PLANIFICADA' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {orden.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-900">{orden.operador}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">{new Date(orden.fechaInicio).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 text-center">
          <Link href="/produccion/ordenes" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
            Ver todas las órdenes →
          </Link>
        </div>
      </div>
    </div>
  )
}
