'use client';

import { useState } from 'react';
import { BarChart3, Plus, Pencil, Trash2 } from 'lucide-react';

interface ValorizacionItem {
  id: string;
  producto: string;
  stock: number;
  costoUnitario: number;
  precioVenta: number;
}

const mockValorizacion: ValorizacionItem[] = [
  { id: '1', producto: 'Producto A - Premium', stock: 45, costoUnitario: 600, precioVenta: 1000 },
  { id: '2', producto: 'Producto B - Standard', stock: 120, costoUnitario: 300, precioVenta: 500 },
  { id: '3', producto: 'Producto C - Economy', stock: 80, costoUnitario: 220, precioVenta: 520 }
];

export default function ValorizacionInventarioPage() {
  const [items, setItems] = useState<ValorizacionItem[]>(mockValorizacion);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ValorizacionItem | null>(null);
  const [formState, setFormState] = useState({
    producto: '',
    stock: 0,
    costoUnitario: 0,
    precioVenta: 0
  });

  const openCreate = () => {
    setEditing(null);
    setFormState({ producto: '', stock: 0, costoUnitario: 0, precioVenta: 0 });
    setFormOpen(true);
  };

  const openEdit = (item: ValorizacionItem) => {
    setEditing(item);
    setFormState({
      producto: item.producto,
      stock: item.stock,
      costoUnitario: item.costoUnitario,
      precioVenta: item.precioVenta
    });
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar item de valorización?')) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editing) {
      setItems(prev => prev.map(item => {
        if (item.id !== editing.id) return item;
        return { ...item, ...formState };
      }));
    } else {
      setItems(prev => [
        {
          id: Date.now().toString(),
          ...formState
        },
        ...prev
      ]);
    }

    setFormOpen(false);
  };

  const valorTotal = (item: ValorizacionItem) => item.stock * item.costoUnitario;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Valorización de Inventario</h1>
          <p className="text-slate-600 mt-1">Cálculo de costo y precio del stock</p>
        </div>
        <button
          onClick={openCreate}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          Nuevo item
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Stock</th>
              <th>Costo unitario</th>
              <th>Precio venta</th>
              <th className="text-right">Valor total</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="table-row-hover">
                <td className="font-medium">{item.producto}</td>
                <td>{item.stock}</td>
                <td>${item.costoUnitario.toLocaleString()}</td>
                <td>${item.precioVenta.toLocaleString()}</td>
                <td className="text-right font-semibold">${valorTotal(item).toLocaleString()}</td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <button onClick={() => openEdit(item)} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className="card">
          <h2 className="card-title mb-4">
            {editing ? 'Editar item' : 'Crear item'}
          </h2>
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
              <label className="label">Costo unitario</label>
              <input
                type="number"
                value={formState.costoUnitario}
                onChange={(event) => setFormState(prev => ({ ...prev, costoUnitario: Number(event.target.value) }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Precio venta</label>
              <input
                type="number"
                value={formState.precioVenta}
                onChange={(event) => setFormState(prev => ({ ...prev, precioVenta: Number(event.target.value) }))}
                className="input"
                required
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editing ? 'Guardar cambios' : 'Crear item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!formOpen && (
        <div className="card">
          <div className="flex items-start gap-3">
            <BarChart3 className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Panel de demo</h3>
              <p className="text-sm text-slate-600">Simula la valorización del stock sin base de datos.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
