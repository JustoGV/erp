'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';

interface Liquidacion {
  id: string;
  empleado: string;
  periodo: string;
  total: number;
  estado: 'PENDIENTE' | 'PAGADO';
}

const mockLiquidaciones: Liquidacion[] = [
  { id: '1', empleado: 'Laura Gómez', periodo: 'Febrero 2026', total: 320000, estado: 'PENDIENTE' },
  { id: '2', empleado: 'Carlos Ruiz', periodo: 'Febrero 2026', total: 280000, estado: 'PAGADO' }
];

export default function LiquidacionesPage() {
  const [liquidaciones, setLiquidaciones] = useState<Liquidacion[]>(mockLiquidaciones);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Liquidacion | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [formState, setFormState] = useState({ empleado: '', periodo: '', total: 0, estado: 'PENDIENTE' as Liquidacion['estado'] });
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(liquidaciones.length / pageSize)),
    [liquidaciones.length]
  );
  const pagedLiquidaciones = useMemo(() => {
    const start = (page - 1) * pageSize;
    return liquidaciones.slice(start, start + pageSize);
  }, [liquidaciones, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openCreate = () => {
    setEditing(null);
    setFormState({ empleado: '', periodo: '', total: 0, estado: 'PENDIENTE' });
    setFormOpen(true);
  };

  const openEdit = (item: Liquidacion) => {
    setEditing(item);
    setFormState({ empleado: item.empleado, periodo: item.periodo, total: item.total, estado: item.estado });
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar liquidación?')) return;
    setLiquidaciones(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editing) {
      setLiquidaciones(prev => prev.map(item => (item.id === editing.id ? { ...item, ...formState } : item)));
    } else {
      setLiquidaciones(prev => [{ id: Date.now().toString(), ...formState }, ...prev]);
      setPage(1);
    }
    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Liquidaciones</h1>
          <p className="text-slate-600 mt-1">Liquidación de haberes</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Nueva liquidación
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Periodo</th>
              <th>Estado</th>
              <th className="text-right">Total</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagedLiquidaciones.map(item => (
              <tr key={item.id} className="table-row-hover">
                <td className="font-medium">{item.empleado}</td>
                <td>{item.periodo}</td>
                <td>{item.estado}</td>
                <td className="text-right font-semibold">${item.total.toLocaleString()}</td>
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
        title={editing ? 'Editar liquidación' : 'Crear liquidación'}
        onClose={() => setFormOpen(false)}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Empleado</label>
            <input
              value={formState.empleado}
              onChange={(event) => setFormState(prev => ({ ...prev, empleado: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Periodo</label>
            <input
              value={formState.periodo}
              onChange={(event) => setFormState(prev => ({ ...prev, periodo: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Estado</label>
            <select
              value={formState.estado}
              onChange={(event) => setFormState(prev => ({ ...prev, estado: event.target.value as Liquidacion['estado'] }))}
              className="input"
            >
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="PAGADO">PAGADO</option>
            </select>
          </div>
          <div>
            <label className="label">Total</label>
            <input
              type="number"
              value={formState.total}
              onChange={(event) => setFormState(prev => ({ ...prev, total: Number(event.target.value) }))}
              className="input"
              required
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Guardar cambios' : 'Crear liquidación'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
