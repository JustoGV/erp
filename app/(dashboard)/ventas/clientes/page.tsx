'use client';

import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Filter, Download, Users, ChevronDown, Building2 } from 'lucide-react';
import { mockClientes, mockLocales } from '@/lib/mock-data';
import { useLocal } from '@/contexts/LocalContext';
import { useEffect, useState } from 'react';

export default function ClientesPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [clientes, setClientes] = useState(mockClientes);
  
  // Actualizar clientes cuando cambia el local
  useEffect(() => {
    const filteredClientes = isAllLocales 
      ? mockClientes 
      : mockClientes.filter(c => c.localId === selectedLocal?.id);
    setClientes(filteredClientes);
  }, [selectedLocal, isAllLocales]);
  
  const activeClients = clientes.filter(c => c.active).length;
  const totalClients = clientes.length;
  
  // Obtener nombre del local para cada cliente
  const getLocalName = (localId: string) => {
    return mockLocales.find(l => l.id === localId)?.name || '';
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <Users size={16} />
            {totalClients} clientes registrados • {activeClients} activos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <Download size={18} />
            Exportar
          </button>
          <Link href="/ventas/clientes/nuevo" className="btn btn-primary">
            <Plus size={18} />
            Nuevo Cliente
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
              placeholder="Buscar por nombre, email, teléfono o CUIT..."
              className="input pl-11"
            />
          </div>
          <button className="btn btn-secondary">
            <Filter size={18} />
            Filtros
            <ChevronDown size={16} />
          </button>
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
              <th>CUIT/DNI</th>
              <th>Email</th>
              <th>Teléfono</th>
              {isAllLocales && <th>Local</th>}
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="table-row-hover">
                <td>
                  <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                    {cliente.code}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-sm">
                      {cliente.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{cliente.name}</p>
                      <p className="text-xs text-slate-500">{cliente.address}</p>
                    </div>
                  </div>
                </td>
                <td className="font-mono text-sm">{cliente.taxId}</td>
                <td className="text-slate-700">{cliente.email}</td>
                <td className="text-slate-700">{cliente.phone}</td>
                {isAllLocales && (
                  <td>
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-700">{getLocalName(cliente.localId)}</span>
                    </div>
                  </td>
                )}
                <td>
                  <span className={`badge ${cliente.active ? 'badge-success' : 'badge-neutral'}`}>
                    {cliente.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/ventas/clientes/${cliente.id}`}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar"
                      onClick={() => {
                        if (confirm('¿Estás seguro de eliminar este cliente?')) {
                          alert('Cliente eliminado (demo)');
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          Mostrando <span className="font-semibold">1</span> a <span className="font-semibold">{totalClients}</span> de <span className="font-semibold">{totalClients}</span> clientes
        </p>
        <div className="flex gap-2">
          <button className="btn btn-secondary" disabled>
            Anterior
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
            1
          </button>
          <button className="btn btn-secondary" disabled>
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
