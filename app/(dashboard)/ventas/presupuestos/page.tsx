'use client';

import Link from 'next/link';
import { Plus, Search, Eye, Edit, Trash2, Filter, Download, FileText } from 'lucide-react';
import { useLocal } from '@/contexts/LocalContext';
import { useEffect, useState } from 'react';

// Mock data de presupuestos
const mockPresupuestos = [
  {
    id: '1',
    number: 'PRES-SF-00001',
    customerId: '1',
    customerName: 'Empresa ABC S.A.',
    date: '2025-11-28',
    validUntil: '2025-12-28',
    total: 45000,
    status: 'pending' as const,
    localId: '1',
  },
  {
    id: '2',
    number: 'PRES-PR-00001',
    customerId: '3',
    customerName: 'Distribuidora 123',
    date: '2025-11-25',
    validUntil: '2025-12-25',
    total: 32000,
    status: 'approved' as const,
    localId: '2',
  },
  {
    id: '3',
    number: 'PRES-ROS-00001',
    customerId: '2',
    customerName: 'Comercial XYZ',
    date: '2025-11-20',
    validUntil: '2025-12-20',
    total: 67000,
    status: 'rejected' as const,
    localId: '3',
  },
];

export default function PresupuestosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
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
                    {pres.number}
                  </span>
                </td>
                <td className="font-medium text-slate-900">{pres.customerName}</td>
                <td className="text-slate-700">{new Date(pres.date).toLocaleDateString()}</td>
                <td className="text-slate-700">{new Date(pres.validUntil).toLocaleDateString()}</td>
                <td className="font-semibold text-slate-900">${pres.total.toLocaleString()}</td>
                <td>
                  <span className={`badge ${
                    pres.status === 'approved' ? 'badge-success' : 
                    pres.status === 'pending' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {pres.status === 'approved' ? 'Aprobado' : 
                     pres.status === 'pending' ? 'Pendiente' : 'Rechazado'}
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
