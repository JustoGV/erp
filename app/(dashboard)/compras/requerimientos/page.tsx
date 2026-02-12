'use client';

import { useState } from 'react';
import { FileText, Plus, Check, X, Clock, Package } from 'lucide-react';
import { mockRequerimientosCompra, RequerimientoCompra, EstadoRequerimiento } from '@/lib/mock-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function RequerimientosPage() {
  const [filtroEstado, setFiltroEstado] = useState<EstadoRequerimiento | 'TODOS'>('TODOS');
  const permissions = usePermissions();
  const canCreateCompras = permissions.canCreate('compras');
  const canEditCompras = permissions.canEdit('compras');

  const requerimientosFiltrados = filtroEstado === 'TODOS' 
    ? mockRequerimientosCompra 
    : mockRequerimientosCompra.filter(req => req.estado === filtroEstado);

  const getEstadoBadge = (estado: EstadoRequerimiento) => {
    const badges = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      AUTORIZADO: 'bg-green-100 text-green-800',
      RECHAZADO: 'bg-red-100 text-red-800',
      COMPLETADO: 'bg-blue-100 text-blue-800',
      CANCELADO: 'bg-gray-100 text-gray-800'
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoIcon = (estado: EstadoRequerimiento) => {
    switch (estado) {
      case 'PENDIENTE': return <Clock className="h-4 w-4" />;
      case 'AUTORIZADO': return <Check className="h-4 w-4" />;
      case 'RECHAZADO': return <X className="h-4 w-4" />;
      case 'COMPLETADO': return <Package className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Requerimientos de Compra</h1>
          <p className="text-gray-600 mt-1">Gestión de solicitudes de compra</p>
        </div>
        {canCreateCompras && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nuevo Requerimiento
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFiltroEstado('TODOS')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              filtroEstado === 'TODOS'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos ({mockRequerimientosCompra.length})
          </button>
          <button
            onClick={() => setFiltroEstado('PENDIENTE')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              filtroEstado === 'PENDIENTE'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pendientes ({mockRequerimientosCompra.filter(r => r.estado === 'PENDIENTE').length})
          </button>
          <button
            onClick={() => setFiltroEstado('AUTORIZADO')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              filtroEstado === 'AUTORIZADO'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Autorizados ({mockRequerimientosCompra.filter(r => r.estado === 'AUTORIZADO').length})
          </button>
          <button
            onClick={() => setFiltroEstado('COMPLETADO')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              filtroEstado === 'COMPLETADO'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Completados ({mockRequerimientosCompra.filter(r => r.estado === 'COMPLETADO').length})
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solicitante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Necesidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requerimientosFiltrados.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{req.numero}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {req.fecha}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {req.solicitante}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {req.departamento}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {req.fechaNecesidad}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {req.items.length} item{req.items.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoBadge(req.estado)}`}>
                      {getEstadoIcon(req.estado)}
                      {req.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button className="text-blue-600 hover:text-blue-900">Ver</button>
                      {canEditCompras && req.estado === 'PENDIENTE' && (
                        <>
                          <button className="text-green-600 hover:text-green-900">Autorizar</button>
                          <button className="text-red-600 hover:text-red-900">Rechazar</button>
                        </>
                      )}
                      {req.estado === 'AUTORIZADO' && req.ordenCompraId && (
                        <button className="text-purple-600 hover:text-purple-900">
                          Ver OC
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Flujo de Requerimientos</h3>
            <p className="text-sm text-blue-700 mt-1">
              Los requerimientos pendientes deben ser autorizados por un responsable del área de compras.
              Una vez autorizados, se puede generar una Orden de Compra directamente desde el requerimiento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
