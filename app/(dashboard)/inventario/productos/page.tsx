'use client';

import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Filter, Download, Package, Building2, AlertTriangle } from 'lucide-react';
import { mockProductos, mockLocales } from '@/lib/mock-data';
import { useLocal } from '@/contexts/LocalContext';
import { useEffect, useState } from 'react';

export default function ProductosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [productos, setProductos] = useState(mockProductos);
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalStock: 0,
    stockBajo: 0
  });

  useEffect(() => {
    const filtered = isAllLocales 
      ? mockProductos 
      : mockProductos.filter(p => p.localId === selectedLocal?.id);
    
    setProductos(filtered);
    setStats({
      totalProductos: filtered.length,
      totalStock: filtered.reduce((sum, p) => sum + p.stock, 0),
      stockBajo: filtered.filter(p => p.stock < p.minStock).length
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
          <h1 className="text-3xl font-bold text-slate-900">Productos</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <Package size={16} />
            {stats.totalProductos} productos • {stats.totalStock} unidades en stock
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <Download size={18} />
            Exportar
          </button>
          <Link href="/inventario/productos/nuevo" className="btn btn-primary">
            <Plus size={18} />
            Nuevo Producto
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Productos</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalProductos}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Stock Total</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalStock}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Stock Bajo</p>
              <p className="text-2xl font-bold text-slate-900">{stats.stockBajo}</p>
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
              placeholder="Buscar productos..."
              className="input pl-11"
            />
          </div>
          <select className="input min-w-[160px]">
            <option value="">Todas las categorías</option>
            <option value="cat1">Categoría 1</option>
            <option value="cat2">Categoría 2</option>
            <option value="cat3">Categoría 3</option>
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
              <th>Categoría</th>
              <th>Precio</th>
              <th>Costo</th>
              {isAllLocales && <th>Local</th>}
              <th>Stock</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => {
              const stockBajo = producto.stock < producto.minStock;
              return (
                <tr key={producto.id} className="table-row-hover">
                  <td>
                    <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                      {producto.code}
                    </span>
                  </td>
                  <td>
                    <div>
                      <p className="font-semibold text-slate-900">{producto.name}</p>
                      <p className="text-xs text-slate-500">{producto.description}</p>
                    </div>
                  </td>
                  <td className="text-slate-700">{producto.category}</td>
                  <td className="font-semibold text-slate-900">${producto.price.toLocaleString()}</td>
                  <td className="text-slate-700">${producto.cost.toLocaleString()}</td>
                  {isAllLocales && (
                    <td>
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-700">{getLocalName(producto.localId)}</span>
                      </div>
                    </td>
                  )}
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${stockBajo ? 'text-red-600' : 'text-slate-900'}`}>
                        {producto.stock}
                      </span>
                      {stockBajo && (
                        <span title="Stock bajo">
                          <AlertTriangle size={14} className="text-red-500" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${producto.active ? 'badge-success' : 'badge-neutral'}`}>
                      {producto.active ? 'Activo' : 'Inactivo'}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
