'use client';

import Link from 'next/link';
import { Plus, Search, Eye, Edit, Trash2, Filter, Download, FileText, CheckCircle, XCircle, Send, Clock } from 'lucide-react';
import { useLocal } from '@/contexts/LocalContext';
import { useEffect, useState } from 'react';
import { mockPresupuestos, type Presupuesto } from '@/lib/mock-data';
import { usePermissions } from '@/hooks/usePermissions';

export default function PresupuestosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const { canCreate } = usePermissions();
  const [presupuestos, setPresupuestos] = useState(mockPresupuestos);

  useEffect(() => {
    const filtered = isAllLocales 
      ? mockPresupuestos 
      : mockPresupuestos.filter(p => p.localId === selectedLocal?.id);
    setPresupuestos(filtered);
  }, [selectedLocal, isAllLocales]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Presupuestos</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <FileText size={16} />
            {presupuestos.length} presupuestos registrados
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <Download size={18} />
            Exportar
          </button>
          <Link href="/ventas/presupuestos/nuevo" className="btn btn-primary">
            <Plus size={18} />
            Nuevo Presupuesto
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar presupuestos..."
              className="input pl-11"
            />
          </div>
          <select className="input min-w-[160px]">
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobados</option>
            <option value="rejected">Rechazados</option>
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
              <th>Válido hasta</th>
              <th>Total</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {presupuestos.map((pres) => (
              <tr key={pres.id} className="table-row-hover">
                <td>
                  <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                    {pres.numero}
                  </span>
                </td>
                <td className="font-medium text-slate-900">{pres.clienteNombre}</td>
                <td className="text-slate-700">{new Date(pres.fecha).toLocaleDateString('es-AR')}</td>
                <td className="text-slate-700">{new Date(pres.fechaVencimiento).toLocaleDateString('es-AR')}</td>
                <td className="font-semibold text-slate-900">${pres.total.toLocaleString('es-AR')}</td>
                <td>
                  <span className={`badge ${
                    pres.estado === 'APROBADO' ? 'badge-success' : 
                    pres.estado === 'ENVIADO' ? 'badge-warning' : 
                    pres.estado === 'BORRADOR' ? 'bg-slate-100 text-slate-700' :
                    'badge-danger'
                  }`}>
                    {pres.estado}
                  </span>
                </td>
                <td>
                  <div className="flex items-center justify-end gap-1">
                    {pres.estado === 'APROBADO' && pres.pedidoGenerado && (
                      <Link href={`/ventas/pedidos/${pres.pedidoGenerado}`} className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all" title="Ver Pedido">
                        <CheckCircle size={16} />
                      </Link>
                    )}
                    <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Ver">
                      <Eye size={16} />
                    </button>
                    {canCreate('ventas') && (
                      <>
                        <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
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
