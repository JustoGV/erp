'use client';

import { useState } from 'react';
import { AlertTriangle, Plus, Pencil, Trash2 } from 'lucide-react';

interface AlertaStock {
  id: string;
  producto: string;
  deposito: string;
  stockActual: number;
  stockMinimo: number;
  estado: 'CRITICO' | 'BAJO' | 'NORMAL';
}

const mockAlertas: AlertaStock[] = [
  { id: '1', producto: 'Producto A - Premium', deposito: 'Santa Fe', stockActual: 8, stockMinimo: 20, estado: 'CRITICO' },
  { id: '2', producto: 'Producto B - Standard', deposito: 'Paraná', stockActual: 40, stockMinimo: 50, estado: 'BAJO' },
  { id: '3', producto: 'Producto C - Economy', deposito: 'Rosario', stockActual: 60, stockMinimo: 40, estado: 'NORMAL' }
];

export default function AlertasInventarioPage() {
  const [alertas, setAlertas] = useState<AlertaStock[]>(mockAlertas);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AlertaStock | null>(null);
  const [formState, setFormState] = useState({
    producto: '',
    deposito: '',
    stockActual: 0,
    stockMinimo: 0,
    estado: 'BAJO' as AlertaStock['estado']
  });

  const openCreate = () => {
    setEditing(null);
    setFormState({ producto: '', deposito: '', stockActual: 0, stockMinimo: 0, estado: 'BAJO' });
    setFormOpen(true);
  };

  const openEdit = (alerta: AlertaStock) => {
    setEditing(alerta);
    setFormState({
      producto: alerta.producto,
      deposito: alerta.deposito,
      stockActual: alerta.stockActual,
      stockMinimo: alerta.stockMinimo,
      estado: alerta.estado
    });
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar alerta de stock?')) return;
    setAlertas(prev => prev.filter(alerta => alerta.id !== id));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editing) {
      setAlertas(prev => prev.map(alerta => {
        if (alerta.id !== editing.id) return alerta;
        return { ...alerta, ...formState };
      }));
    } else {
      setAlertas(prev => [
        {
          id: Date.now().toString(),
          ...formState
        },
        ...prev
      ]);
    }

    setFormOpen(false);
  };

  const badgeColor = (estado: AlertaStock['estado']) => {
    if (estado === 'CRITICO') return 'bg-red-100 text-red-700';
    if (estado === 'BAJO') return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Alertas de Stock</h1>
          <p className="text-slate-600 mt-1">Controla productos bajo el punto de pedido</p>
        </div>
        <button
          onClick={openCreate}
          className="btn btn-danger"
        >
          <Plus className="h-4 w-4" />
          Nueva alerta
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
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alertas.map(alerta => (
              <tr key={alerta.id} className="table-row-hover">
                <td className="font-medium">{alerta.producto}</td>
                <td>{alerta.deposito}</td>
                <td>{alerta.stockActual}</td>
                <td>{alerta.stockMinimo}</td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeColor(alerta.estado)}`}>
                    {alerta.estado}
                  </span>
                </td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <button onClick={() => openEdit(alerta)} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(alerta.id)} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
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
          <h2 className="card-title mb-4">{editing ? 'Editar alerta' : 'Crear alerta'}</h2>
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
              <label className="label">Stock actual</label>
              <input
                type="number"
                value={formState.stockActual}
                onChange={(event) => setFormState(prev => ({ ...prev, stockActual: Number(event.target.value) }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Stock mínimo</label>
              <input
                type="number"
                value={formState.stockMinimo}
                onChange={(event) => setFormState(prev => ({ ...prev, stockMinimo: Number(event.target.value) }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Estado</label>
              <select
                value={formState.estado}
                onChange={(event) => setFormState(prev => ({ ...prev, estado: event.target.value as AlertaStock['estado'] }))}
                className="input"
              >
                <option value="CRITICO">CRITICO</option>
                <option value="BAJO">BAJO</option>
                <option value="NORMAL">NORMAL</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-danger">
                {editing ? 'Guardar cambios' : 'Crear alerta'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!formOpen && (
        <div className="card">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Panel de demo</h3>
              <p className="text-sm text-slate-600">Crea, edita o elimina alertas de stock. Cambios solo locales.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
