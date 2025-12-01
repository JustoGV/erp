'use client';

import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Download, Users, Building2 } from 'lucide-react';
import { mockProveedores, mockLocales } from '@/lib/mock-data';
import { useLocal } from '@/contexts/LocalContext';
import { useEffect, useState } from 'react';

export default function ProveedoresPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [proveedores, setProveedores] = useState(mockProveedores);

  useEffect(() => {
    const filtered = isAllLocales 
      ? mockProveedores 
      : mockProveedores.filter(p => p.localId === selectedLocal?.id);
    setProveedores(filtered);
  }, [selectedLocal, isAllLocales]);

  const getLocalName = (localId: string) => {
    return mockLocales.find(l => l.id === localId)?.name || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Proveedores</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <Users size={16} />
            {proveedores.length} proveedores registrados
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <Download size={18} />
            Exportar
          </button>
          <Link href="/compras/proveedores/nuevo" className="btn btn-primary">
            <Plus size={18} />
            Nuevo Proveedor
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
              placeholder="Buscar proveedores..."
              className="input pl-11"
            />
          </div>
          <select className="input min-w-[160px]">
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>CUIT</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Condición de Pago</th>
              {isAllLocales && <th>Local</th>}
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((proveedor) => (
              <tr key={proveedor.id} className="table-row-hover">
                <td>
                  <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                    {proveedor.code}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-sm">
                      {proveedor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{proveedor.name}</p>
                      <p className="text-xs text-slate-500">{proveedor.address}</p>
                    </div>
                  </div>
                </td>
                <td className="font-mono text-sm">{proveedor.taxId}</td>
                <td className="text-slate-700">{proveedor.email}</td>
                <td className="text-slate-700">{proveedor.phone}</td>
                <td className="text-slate-700">{proveedor.paymentTerms} días</td>
                {isAllLocales && (
                  <td>
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-700">{getLocalName(proveedor.localId)}</span>
                    </div>
                  </td>
                )}
                <td>
                  <span className={`badge ${proveedor.active ? 'badge-success' : 'badge-neutral'}`}>
                    {proveedor.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="flex items-center justify-end gap-1">
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
