'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Factory, Plus, Search, Filter, ArrowLeft, Clock, CheckCircle, Play, XCircle } from 'lucide-react'
import { useLocal } from '@/contexts/LocalContext'
import { mockOrdenesProduccion, type OrdenProduccion } from '@/lib/mock-data'

export default function OrdenesProduccionPage() {
  const { selectedLocal } = useLocal()
  const [ordenes, setOrdenes] = useState<OrdenProduccion[]>(mockOrdenesProduccion)
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    let filtered = mockOrdenesProduccion

    if (selectedLocal) {
      filtered = filtered.filter(o => o.localId === selectedLocal.id)
    }

    if (filtroEstado !== 'TODOS') {
      filtered = filtered.filter(o => o.estado === filtroEstado)
    }

    if (busqueda) {
      filtered = filtered.filter(o => 
        o.code.toLowerCase().includes(busqueda.toLowerCase()) ||
        o.productoNombre.toLowerCase().includes(busqueda.toLowerCase())
      )
    }

    setOrdenes(filtered)
  }, [selectedLocal, filtroEstado, busqueda])

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'COMPLETADA': return 'bg-green-100 text-green-700'
      case 'EN_PROCESO': return 'bg-yellow-100 text-yellow-700'
      case 'PLANIFICADA': return 'bg-blue-100 text-blue-700'
      case 'CANCELADA': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'COMPLETADA': return <CheckCircle size={16} />
      case 'EN_PROCESO': return <Play size={16} />
      case 'PLANIFICADA': return <Clock size={16} />
      case 'CANCELADA': return <XCircle size={16} />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/produccion"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl">
                <Factory className="text-white" size={28} />
              </div>
              Órdenes de Producción
            </h1>
            <p className="text-slate-600 mt-1">Gestión de órdenes de manufactura</p>
          </div>
        </div>
        <Link
          href="/produccion/ordenes/nueva"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-xl hover:from-yellow-700 hover:to-yellow-800 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          Nueva Orden
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por código o producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Filtro Estado */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="PLANIFICADA">Planificada</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="COMPLETADA">Completada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cantidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Progreso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Operador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha Inicio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Costo Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {ordenes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron órdenes de producción
                  </td>
                </tr>
              ) : (
                ordenes.map(orden => {
                  const progreso = orden.cantidadPlanificada > 0 
                    ? (orden.cantidadProducida / orden.cantidadPlanificada) * 100 
                    : 0

                  return (
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
                        <span className="text-slate-900 font-medium">{orden.cantidadProducida}</span>
                        <span className="text-slate-500"> / {orden.cantidadPlanificada} {orden.unidad}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[100px]">
                            <div 
                              className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all"
                              style={{ width: `${progreso}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-600 font-medium">{progreso.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(orden.estado)}`}>
                          {getEstadoIcon(orden.estado)}
                          {orden.estado.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900">{orden.operador}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        {new Date(orden.fechaInicio).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900">
                          ${orden.costoTotal.toLocaleString('es-AR')}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="text-sm text-blue-700 font-medium mb-1">Planificadas</div>
          <div className="text-2xl font-bold text-blue-900">
            {ordenes.filter(o => o.estado === 'PLANIFICADA').length}
          </div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <div className="text-sm text-yellow-700 font-medium mb-1">En Proceso</div>
          <div className="text-2xl font-bold text-yellow-900">
            {ordenes.filter(o => o.estado === 'EN_PROCESO').length}
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="text-sm text-green-700 font-medium mb-1">Completadas</div>
          <div className="text-2xl font-bold text-green-900">
            {ordenes.filter(o => o.estado === 'COMPLETADA').length}
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <div className="text-sm text-slate-700 font-medium mb-1">Total Órdenes</div>
          <div className="text-2xl font-bold text-slate-900">{ordenes.length}</div>
        </div>
      </div>
    </div>
  )
}
