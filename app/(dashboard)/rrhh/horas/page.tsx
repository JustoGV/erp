'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';

interface HoraTrabajada {
  id: string;
  empleado: string;
  fecha: string;
  horas: number;
}

const mockHoras: HoraTrabajada[] = [
  { id: '1', empleado: 'Laura Gómez', fecha: '2026-02-10', horas: 8 },
  { id: '2', empleado: 'Carlos Ruiz', fecha: '2026-02-10', horas: 7.5 }
];

export default function HorasPage() {
  const [horas, setHoras] = useState<HoraTrabajada[]>(mockHoras);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<HoraTrabajada | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [formState, setFormState] = useState({ empleado: '', fecha: '', horas: 0 });
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(horas.length / pageSize)),
    [horas.length]
  );
  const pagedHoras = useMemo(() => {
    const start = (page - 1) * pageSize;
    return horas.slice(start, start + pageSize);
  }, [horas, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openCreate = () => {
    setEditing(null);
    setFormState({ empleado: '', fecha: '', horas: 0 });
    setFormOpen(true);
  };

  const openEdit = (item: HoraTrabajada) => {
    setEditing(item);
    setFormState({ empleado: item.empleado, fecha: item.fecha, horas: item.horas });
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar registro?')) return;
    setHoras(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editing) {
      setHoras(prev => prev.map(item => (item.id === editing.id ? { ...item, ...formState } : item)));
    } else {
      setHoras(prev => [{ id: Date.now().toString(), ...formState }, ...prev]);
      setPage(1);
    }
    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Horas Trabajadas</h1>
          <p className="text-slate-600 mt-1">Carga de horas y turnos</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Nueva carga
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Fecha</th>
              <th>Horas</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagedHoras.map(item => (
              <tr key={item.id} className="table-row-hover">
                <td className="font-medium">{item.empleado}</td>
                <td>{item.fecha}</td>
                <td>{item.horas}</td>
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
        title={editing ? 'Editar horas' : 'Crear horas'}
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
            <label className="label">Fecha</label>
            <input
              type="date"
              value={formState.fecha}
              onChange={(event) => setFormState(prev => ({ ...prev, fecha: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Horas</label>
            <input
              type="number"
              step="0.5"
              value={formState.horas}
              onChange={(event) => setFormState(prev => ({ ...prev, horas: Number(event.target.value) }))}
              className="input"
              required
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Guardar cambios' : 'Crear horas'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
