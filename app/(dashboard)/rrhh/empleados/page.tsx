'use client';

import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Download, Users, Building2, Mail, Phone } from 'lucide-react';
import { mockEmpleados, mockLocales } from '@/lib/mock-data';
import { useLocal } from '@/contexts/LocalContext';
import { useEffect, useState } from 'react';

export default function EmpleadosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [empleados, setEmpleados] = useState(mockEmpleados);
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    departamentos: 0
  });

  useEffect(() => {
    const filtered = isAllLocales 
      ? mockEmpleados 
      : mockEmpleados.filter(e => e.localId === selectedLocal?.id);
    
    setEmpleados(filtered);
    setStats({
      total: filtered.length,
      activos: filtered.filter(e => e.active).length,
      departamentos: new Set(filtered.map(e => e.department)).size
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
          <h1 className="text-3xl font-bold text-slate-900">Empleados</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <Users size={16} />
            {stats.total} empleados • {stats.activos} activos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <Download size={18} />
            Exportar
          </button>
          <Link href="/rrhh/empleados/nuevo" className="btn btn-primary">
            <Plus size={18} />
            Nuevo Empleado
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Empleados</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Activos</p>
              <p className="text-2xl font-bold text-slate-900">{stats.activos}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Departamentos</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.departamentos}
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
              placeholder="Buscar empleados..."
              className="input pl-11"
            />
          </div>
          <select className="input min-w-[160px]">
            <option value="">Todos los departamentos</option>
            <option value="admin">Administración</option>
            <option value="ventas">Ventas</option>
            <option value="compras">Compras</option>
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
              <th>Puesto</th>
              <th>Departamento</th>
              {isAllLocales && <th>Local</th>}
              <th>Contacto</th>
              <th>Salario</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((empleado) => (
              <tr key={empleado.id} className="table-row-hover">
                <td>
                  <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                    {empleado.code}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-sm">
                      {empleado.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{empleado.name}</p>
                      <p className="text-xs text-slate-500">
                        Desde {new Date(empleado.hireDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="text-slate-700">{empleado.position}</td>
                <td className="text-slate-700">{empleado.department}</td>
                {isAllLocales && (
                  <td>
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-700">{getLocalName(empleado.localId)}</span>
                    </div>
                  </td>
                )}
                <td>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Mail size={12} />
                      {empleado.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Phone size={12} />
                      {empleado.phone}
                    </div>
                  </div>
                </td>
                <td className="font-semibold text-slate-900">${empleado.salary.toLocaleString()}</td>
                <td>
                  <span className={`badge ${empleado.active ? 'badge-success' : 'badge-neutral'}`}>
                    {empleado.active ? 'Activo' : 'Inactivo'}
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
