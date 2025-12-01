'use client';

import Link from 'next/link';
import { Plus, Search, Eye, Edit, Trash2, Download, FileText, Building2 } from 'lucide-react';
import { mockFacturas, mockLocales } from '@/lib/mock-data';
import { useLocal } from '@/contexts/LocalContext';
import { useEffect, useState } from 'react';

export default function FacturasPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [facturas, setFacturas] = useState(mockFacturas);
  const [stats, setStats] = useState({
    pagadas: 0,
    pendientes: 0,
    vencidas: 0
  });

  useEffect(() => {
    const filtered = isAllLocales 
      ? mockFacturas 
      : mockFacturas.filter(f => f.localId === selectedLocal?.id);
    
    setFacturas(filtered);
    setStats({
      pagadas: filtered.filter(f => f.status === 'Paid').length,
      pendientes: filtered.filter(f => f.status === 'Pending').length,
      vencidas: filtered.filter(f => f.status === 'Overdue').length
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
          <h1 className="text-3xl font-bold text-slate-900">Facturas</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <FileText size={16} />
            {facturas.length} facturas emitidas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <Download size={18} />
            Exportar
          </button>
          <Link href="/ventas/facturas/nueva" className="btn btn-primary">
            <Plus size={18} />
            Nueva Factura
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Pagadas</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.pagadas}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <FileText size={24} />
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
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Vencidas</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.vencidas}
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
              placeholder="Buscar facturas..."
              className="input pl-11"
            />
          </div>
          <select className="input min-w-[160px]">
            <option value="">Todos los estados</option>
            <option value="paid">Pagadas</option>
            <option value="pending">Pendientes</option>
            <option value="overdue">Vencidas</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Vencimiento</th>
              {isAllLocales && <th>Local</th>}
              <th>Total</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {facturas.map((factura) => (
              <tr key={factura.id} className="table-row-hover">
                <td>
                  <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                    {factura.invoiceNumber}
                  </span>
                </td>
                <td className="font-medium text-slate-900">{factura.customerName}</td>
                <td className="text-slate-700">{new Date(factura.date).toLocaleDateString()}</td>
                <td className="text-slate-700">{new Date(factura.dueDate).toLocaleDateString()}</td>
                {isAllLocales && (
                  <td>
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-700">{getLocalName(factura.localId)}</span>
                    </div>
                  </td>
                )}
                <td className="font-semibold text-slate-900">${factura.total.toLocaleString()}</td>
                <td>
                  <span className={`badge ${
                    factura.status === 'Paid' ? 'badge-success' : 
                    factura.status === 'Pending' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {factura.status === 'Paid' ? 'Pagada' : 
                     factura.status === 'Pending' ? 'Pendiente' : 'Vencida'}
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
                    <button className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
                      <Trash2 size={16} />
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
