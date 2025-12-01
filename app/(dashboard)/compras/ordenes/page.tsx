'use client';

import Link from 'next/link';
import { Plus, Search, Eye, Edit, Download, ShoppingBag, Building2 } from 'lucide-react';
import { mockOrdenesCompra, mockLocales } from '@/lib/mock-data';
import { useLocal } from '@/contexts/LocalContext';
import { useEffect, useState } from 'react';

export default function OrdenesCompraPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [ordenes, setOrdenes] = useState(mockOrdenesCompra);
  const [stats, setStats] = useState({
    pendientes: 0,
    recibidas: 0
  });

  useEffect(() => {
    const filtered = isAllLocales 
      ? mockOrdenesCompra 
      : mockOrdenesCompra.filter(o => o.localId === selectedLocal?.id);
    
    setOrdenes(filtered);
    setStats({
      pendientes: filtered.filter(o => o.status === 'Pending').length,
      recibidas: filtered.filter(o => o.status === 'Received').length
    });
  }, [selectedLocal, isAllLocales]);

  const getLocalName = (localId: string) => {
    return mockLocales.find(l => l.id === localId)?.name || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Órdenes de Compra</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <ShoppingBag size={16} />
            {ordenes.length} órdenes registradas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <Download size={18} />
            Exportar
          </button>
          <Link href="/compras/ordenes/nueva" className="btn btn-primary">
            <Plus size={18} />
            Nueva Orden
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.pendientes}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Recibidas</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.recibidas}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar órdenes..."
              className="input pl-11"
            />
          </div>
          <select className="input min-w-[160px]">
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="received">Recibidas</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Proveedor</th>
              <th>Fecha</th>
              <th>Fecha Esperada</th>
              {isAllLocales && <th>Local</th>}
              <th>Total</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((orden) => (
              <tr key={orden.id} className="table-row-hover">
                <td>
                  <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                    {orden.orderNumber}
                  </span>
                </td>
                <td className="font-medium text-slate-900">{orden.supplierName}</td>
                <td className="text-slate-700">{new Date(orden.date).toLocaleDateString()}</td>
                <td className="text-slate-700">{new Date(orden.expectedDate).toLocaleDateString()}</td>
                {isAllLocales && (
                  <td>
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-700">{getLocalName(orden.localId)}</span>
                    </div>
                  </td>
                )}
                <td className="font-semibold text-slate-900">${orden.total.toLocaleString()}</td>
                <td>
                  <span className={`badge ${orden.status === 'Received' ? 'badge-success' : 'badge-warning'}`}>
                    {orden.status === 'Received' ? 'Recibida' : 'Pendiente'}
                  </span>
                </td>
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Ver">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                      <Edit size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
