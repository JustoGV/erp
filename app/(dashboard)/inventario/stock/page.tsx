'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { mockProductos } from '@/lib/mock-data';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';

interface StockItem {
  id: string;
  producto: string;
  deposito: string;
  stock: number;
  minimo: number;
}

const initialStock: StockItem[] = mockProductos.slice(0, 4).map((producto, index) => ({
  id: producto.id,
  producto: producto.name,
  deposito: index % 2 === 0 ? 'Santa Fe' : 'Paraná',
  stock: producto.stock,
  minimo: producto.minStock
}));

export default function StockPage() {
  const [items, setItems] = useState<StockItem[]>(initialStock);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StockItem | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [formState, setFormState] = useState({ producto: '', deposito: '', stock: 0, minimo: 0 });
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / pageSize)),
    [items.length]
  );
  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openCreate = () => {
    setEditing(null);
    setFormState({ producto: '', deposito: '', stock: 0, minimo: 0 });
    setFormOpen(true);
  };

  const openEdit = (item: StockItem) => {
    setEditing(item);
    setFormState({ producto: item.producto, deposito: item.deposito, stock: item.stock, minimo: item.minimo });
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar registro de stock?')) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editing) {
      setItems(prev => prev.map(item => (item.id === editing.id ? { ...item, ...formState } : item)));
    } else {
      setItems(prev => [{ id: Date.now().toString(), ...formState }, ...prev]);
      setPage(1);
    }
    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Control de Stock</h1>
          <p className="text-slate-600 mt-1">Existencias por depósito</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Nuevo registro
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Depósito</th>
              <th>Stock</th>
              <th>Mínimo</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagedItems.map(item => (
              <tr key={item.id} className="table-row-hover">
                <td className="font-medium">{item.producto}</td>
                <td>{item.deposito}</td>
                <td>{item.stock}</td>
                <td>{item.minimo}</td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal
        open={formOpen}
        title={editing ? 'Editar stock' : 'Crear stock'}
        onClose={() => setFormOpen(false)}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Producto</label>
            <input
              value={formState.producto}
              onChange={(event) => setFormState(prev => ({ ...prev, producto: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Depósito</label>
            <input
              value={formState.deposito}
              onChange={(event) => setFormState(prev => ({ ...prev, deposito: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Stock</label>
            <input
              type="number"
              value={formState.stock}
              onChange={(event) => setFormState(prev => ({ ...prev, stock: Number(event.target.value) }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Mínimo</label>
            <input
              type="number"
              value={formState.minimo}
              onChange={(event) => setFormState(prev => ({ ...prev, minimo: Number(event.target.value) }))}
              className="input"
              required
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Guardar cambios' : 'Crear stock'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
