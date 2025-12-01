'use client';

import { Download, TrendingUp, DollarSign, ShoppingCart, Users, Building2 } from 'lucide-react';
import { mockFacturas, mockClientes, mockLocales, mockStatsByLocal, mockStats } from '@/lib/mock-data';
import { useLocal } from '@/contexts/LocalContext';
import { useEffect, useState } from 'react';

export default function ReportesVentasPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [stats, setStats] = useState(mockStats);

  useEffect(() => {
    const newStats = isAllLocales ? mockStats : mockStatsByLocal[selectedLocal?.id || '1'];
    setStats(newStats);
  }, [selectedLocal, isAllLocales]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reportes de Ventas</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <TrendingUp size={16} />
            Análisis de ventas {isAllLocales ? 'consolidadas' : `- ${selectedLocal?.name}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <Download size={18} />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Ventas del Mes</p>
              <p className="text-2xl font-bold text-slate-900">
                ${stats.ventasMes.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
              <ShoppingCart size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Facturas Emitidas</p>
              <p className="text-2xl font-bold text-slate-900">
                {mockFacturas.filter(f => !isAllLocales ? f.localId === selectedLocal?.id : true).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Clientes Activos</p>
              <p className="text-2xl font-bold text-slate-900">{stats.clientesActivos}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl shadow-lg">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Ticket Promedio</p>
              <p className="text-2xl font-bold text-slate-900">
                ${Math.round(stats.ventasMes / mockFacturas.length).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ventas por local (solo si está en modo consolidado) */}
      {isAllLocales && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Ventas por Local</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockLocales.map((local) => {
                const localStats = mockStatsByLocal[local.id];
                const percentage = (localStats.ventasMes / mockStats.ventasMes) * 100;
                return (
                  <div key={local.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-slate-400" />
                        <span className="font-medium text-slate-900">{local.name}</span>
                      </div>
                      <span className="text-lg font-bold text-slate-900">
                        ${localStats.ventasMes.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>{percentage.toFixed(1)}% del total</span>
                      <span>{localStats.clientesActivos} clientes activos</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de tendencia */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Evolución de Ventas</h2>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl">
            <p className="text-slate-500">Gráfico de ventas mensuales</p>
          </div>
        </div>
      </div>
    </div>
  );
}
