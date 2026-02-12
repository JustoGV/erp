'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Package, Truck, CheckCircle, XCircle, FileText } from 'lucide-react';
import { mockOrdenesCompra, EstadoOrdenCompra } from '@/lib/mock-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function OrdenesCompraPage() {
  const [filtroEstado, setFiltroEstado] = useState<EstadoOrdenCompra | 'TODOS'>('TODOS');
  const permissions = usePermissions();
  const canCreateCompras = permissions.canCreate('compras');

  const ordenesFiltradas = filtroEstado === 'TODOS' 
    ? mockOrdenesCompra 
    : mockOrdenesCompra.filter(oc => oc.estado === filtroEstado);

  const getEstadoBadge = (estado: EstadoOrdenCompra) => {
    const badges = {
      BORRADOR: 'bg-gray-100 text-gray-800',
      ENVIADA: 'bg-blue-100 text-blue-800',
      CONFIRMADA: 'bg-purple-100 text-purple-800',
      RECIBIDA_PARCIAL: 'bg-yellow-100 text-yellow-800',
      RECIBIDA_COMPLETA: 'bg-green-100 text-green-800',
      CANCELADA: 'bg-red-100 text-red-800'
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes de Compra</h1>
          <p className="text-gray-600 mt-1">Gestión de órdenes de compra a proveedores</p>
        </div>
        {canCreateCompras && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nueva Orden
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 overflow-x-auto">
          {(['TODOS', 'ENVIADA', 'RECIBIDA_PARCIAL', 'RECIBIDA_COMPLETA'] as const).map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                filtroEstado === estado
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {estado === 'TODOS' ? 'Todas' : estado.replace(/_/g, ' ')} ({
                estado === 'TODOS' 
                  ? mockOrdenesCompra.length 
                  : mockOrdenesCompra.filter(o => o.estado === estado).length
              })
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrega</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordenesFiltradas.map((orden) => (
                <tr key={orden.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{orden.numero}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{orden.proveedorNombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{orden.fecha}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{orden.fechaEntregaEstimada}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">{formatMonto(orden.total)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoBadge(orden.estado)}`}>
                      {orden.estado.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button className="text-blue-600 hover:text-blue-900 mr-2">Ver</button>
                    <button className="text-gray-600 hover:text-gray-900">PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
