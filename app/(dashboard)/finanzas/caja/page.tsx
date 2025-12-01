'use client';

import { Plus, Search, DollarSign, TrendingUp, TrendingDown, Building2 } from 'lucide-react';
import { useLocal } from '@/contexts/LocalContext';
import { useEffect, useState } from 'react';

// Mock data de movimientos de caja
const mockMovimientosCaja = [
  {
    id: '1',
    date: '2025-12-01',
    type: 'IN' as const,
    concept: 'Cobro de factura SF-00001',
    amount: 45000,
    balance: 245000,
    localId: '1',
  },
  {
    id: '2',
    date: '2025-12-01',
    type: 'OUT' as const,
    concept: 'Pago a proveedor',
    amount: 15000,
    balance: 230000,
    localId: '1',
  },
  {
    id: '3',
    date: '2025-12-01',
    type: 'IN' as const,
    concept: 'Cobro de factura PR-00001',
    amount: 32000,
    balance: 162000,
    localId: '2',
  },
];

export default function CajaPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [movimientos, setMovimientos] = useState(mockMovimientosCaja);
  const [stats, setStats] = useState({
    ingresos: 0,
    egresos: 0,
    saldo: 0
  });

  useEffect(() => {
    const filtered = isAllLocales 
      ? mockMovimientosCaja 
      : mockMovimientosCaja.filter(m => m.localId === selectedLocal?.id);
    
    const totalIngresos = filtered.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.amount, 0);
    const totalEgresos = filtered.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.amount, 0);
    
    setMovimientos(filtered);
    setStats({
      ingresos: totalIngresos,
      egresos: totalEgresos,
      saldo: totalIngresos - totalEgresos
    });
  }, [selectedLocal, isAllLocales]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Caja</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <DollarSign size={16} />
            Gestión de movimientos de efectivo
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-primary">
            <Plus size={18} />
            Nuevo Movimiento
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Ingresos</p>
              <p className="text-2xl font-bold text-emerald-600">
                ${stats.ingresos.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Egresos</p>
              <p className="text-2xl font-bold text-red-600">
                ${stats.egresos.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Saldo</p>
              <p className="text-2xl font-bold text-blue-600">
                ${stats.saldo.toLocaleString()}
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
              placeholder="Buscar movimientos..."
              className="input pl-11"
            />
          </div>
          <select className="input min-w-[160px]">
            <option value="">Todos los tipos</option>
            <option value="in">Ingresos</option>
            <option value="out">Egresos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Concepto</th>
              <th>Monto</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((mov) => (
              <tr key={mov.id} className="table-row-hover">
                <td className="text-slate-700">
                  {new Date(mov.date).toLocaleDateString()}
                </td>
                <td>
                  <span className={`badge ${mov.type === 'IN' ? 'badge-success' : 'badge-danger'}`}>
                    {mov.type === 'IN' ? 'Ingreso' : 'Egreso'}
                  </span>
                </td>
                <td className="font-medium text-slate-900">{mov.concept}</td>
                <td>
                  <span className={`font-semibold ${
                    mov.type === 'IN' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {mov.type === 'IN' ? '+' : '-'}${mov.amount.toLocaleString()}
                  </span>
                </td>
                <td className="font-semibold text-slate-900">
                  ${mov.balance.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
