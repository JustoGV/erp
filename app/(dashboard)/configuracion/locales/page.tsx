'use client';

import { mockLocales } from '@/lib/mock-data';
import { Building2, MapPin, Phone, Mail, User, Plus, Edit, Power, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function LocalesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Locales</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <Building2 size={16} />
            {mockLocales.length} locales configurados
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          Nuevo Local
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Locales Activos</p>
              <p className="text-2xl font-bold text-slate-900">{mockLocales.filter(l => l.active).length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Provincias</p>
              <p className="text-2xl font-bold text-slate-900">{new Set(mockLocales.map(l => l.state)).size}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <User size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Gerentes Asignados</p>
              <p className="text-2xl font-bold text-slate-900">{mockLocales.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Locales Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockLocales.map((local) => (
          <div key={local.id} className="card hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg">
                  <Building2 size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900">{local.name}</h3>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {local.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={14} />
                    <span>{local.city}, {local.state}</span>
                  </div>
                </div>
              </div>
              <span className={`badge ${local.active ? 'badge-success' : 'badge-neutral'}`}>
                {local.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3 text-sm">
                <MapPin size={16} className="text-slate-400 mt-0.5" />
                <span className="text-slate-700">{local.address}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-slate-400" />
                <span className="text-slate-700">{local.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-slate-400" />
                <span className="text-slate-700">{local.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <User size={16} className="text-slate-400" />
                <div>
                  <span className="text-slate-500">Gerente: </span>
                  <span className="text-slate-700 font-medium">{local.manager}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
              <button className="btn btn-secondary flex-1">
                <Edit size={16} />
                Editar
              </button>
              <button className="btn btn-ghost">
                <Power size={16} />
                {local.active ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Building2 size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">¿Cómo funciona el sistema multi-local?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Cada cliente, producto, factura y empleado está asignado a un local específico</li>
              <li>• Puedes ver datos consolidados de todos los locales o filtrar por local individual</li>
              <li>• Las transferencias de stock entre locales se registran automáticamente</li>
              <li>• Los reportes pueden generarse por local o consolidados</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
