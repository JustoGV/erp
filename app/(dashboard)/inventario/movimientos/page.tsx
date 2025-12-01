'use client';

import { Plus, Search, Filter, Download, Package, ArrowUpDown, Building2 } from 'lucide-react';
import { mockMovimientosStock, mockLocales, mockProductos } from '@/lib/mock-data';
import { useLocal } from '@/contexts/LocalContext';
import { useEffect, useState } from 'react';

export default function MovimientosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [movimientos, setMovimientos] = useState(mockMovimientosStock);
  const [stats, setStats] = useState({
    entradas: 0,
    salidas: 0,
    transferencias: 0
  });

  useEffect(() => {
    const filtered = isAllLocales 
      ? mockMovimientosStock 
      : mockMovimientosStock.filter(m => m.localId === selectedLocal?.id);
    
    setMovimientos(filtered);
    setStats({
      entradas: filtered.filter(m => m.type === 'IN').length,
      salidas: filtered.filter(m => m.type === 'OUT').length,
      transferencias: filtered.filter(m => m.type === 'TRANSFER').length
    });
  }, [selectedLocal, isAllLocales]);

  const getLocalName = (localId: string) => {
    return mockLocales.find(l => l.id === localId)?.name || '';
  };

  const getProductName = (productId: string) => {
    return mockProductos.find(p => p.id === productId)?.name || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Movimientos de Stock</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <ArrowUpDown size={16} />
            {movimientos.length} movimientos registrados
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <Download size={18} />
            Exportar
          </button>
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
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Entradas</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.entradas}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Salidas</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.salidas}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <ArrowUpDown size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Transferencias</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.transferencias}
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
            <option value="in">Entradas</option>
            <option value="out">Salidas</option>
            <option value="transfer">Transferencias</option>
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
              <th>Producto</th>
              <th>Cantidad</th>
              {isAllLocales && <th>Local</th>}
              <th>Referencia</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((mov) => (
              <tr key={mov.id} className="table-row-hover">
                <td className="text-slate-700">
                  {new Date(mov.date).toLocaleDateString()}
                  <span className="text-xs text-slate-500 block">
                    {new Date(mov.date).toLocaleTimeString()}
                  </span>
                </td>
                <td>
                  <span className={`badge ${
                    mov.type === 'IN' ? 'badge-success' : 
                    mov.type === 'OUT' ? 'badge-danger' : 'badge-info'
                  }`}>
                    {mov.type === 'IN' ? 'Entrada' : 
                     mov.type === 'OUT' ? 'Salida' : 'Transferencia'}
                  </span>
                </td>
                <td className="font-medium text-slate-900">{getProductName(mov.productId)}</td>
                <td>
                  <span className={`font-semibold ${
                    mov.type === 'IN' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {mov.type === 'IN' ? '+' : '-'}{mov.quantity}
                  </span>
                </td>
                {isAllLocales && (
                  <td>
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-700">{getLocalName(mov.localId)}</span>
                    </div>
                  </td>
                )}
                <td className="text-slate-700">{mov.reference}</td>
                <td className="text-slate-600 text-sm max-w-xs truncate">-</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
