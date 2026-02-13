'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';

interface Vacacion {
  id: string;
  empleado: string;
  desde: string;
  hasta: string;
  estado: 'SOLICITADA' | 'APROBADA' | 'RECHAZADA';
}

const mockVacaciones: Vacacion[] = [
  { id: '1', empleado: 'Laura Gómez', desde: '2026-02-20', hasta: '2026-03-05', estado: 'APROBADA' },
  { id: '2', empleado: 'Carlos Ruiz', desde: '2026-03-10', hasta: '2026-03-18', estado: 'SOLICITADA' }
];

export default function VacacionesPage() {
  const [vacaciones, setVacaciones] = useState<Vacacion[]>(mockVacaciones);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vacacion | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [formState, setFormState] = useState({ empleado: '', desde: '', hasta: '', estado: 'SOLICITADA' as Vacacion['estado'] });
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(vacaciones.length / pageSize)),
    [vacaciones.length]
  );
  const pagedVacaciones = useMemo(() => {
    const start = (page - 1) * pageSize;
    return vacaciones.slice(start, start + pageSize);
  }, [vacaciones, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openCreate = () => {
    setEditing(null);
    setFormState({ empleado: '', desde: '', hasta: '', estado: 'SOLICITADA' });
    setFormOpen(true);
  };

  const openEdit = (item: Vacacion) => {
    setEditing(item);
    setFormState({ empleado: item.empleado, desde: item.desde, hasta: item.hasta, estado: item.estado });
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar solicitud?')) return;
    setVacaciones(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editing) {
      setVacaciones(prev => prev.map(item => (item.id === editing.id ? { ...item, ...formState } : item)));
    } else {
      setVacaciones(prev => [{ id: Date.now().toString(), ...formState }, ...prev]);
      setPage(1);
    }
    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Vacaciones</h1>
          <p className="text-slate-600 mt-1">Solicitudes y aprobaciones</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Nueva solicitud
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Desde</th>
              <th>Hasta</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagedVacaciones.map(item => (
              <tr key={item.id} className="table-row-hover">
                <td className="font-medium">{item.empleado}</td>
                <td>{item.desde}</td>
                <td>{item.hasta}</td>
                <td>{item.estado}</td>
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
        title={editing ? 'Editar solicitud' : 'Crear solicitud'}
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
            <label className="label">Desde</label>
            <input
              type="date"
              value={formState.desde}
              onChange={(event) => setFormState(prev => ({ ...prev, desde: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Hasta</label>
            <input
              type="date"
              value={formState.hasta}
              onChange={(event) => setFormState(prev => ({ ...prev, hasta: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Estado</label>
            <select
              value={formState.estado}
              onChange={(event) => setFormState(prev => ({ ...prev, estado: event.target.value as Vacacion['estado'] }))}
              className="input"
            >
              <option value="SOLICITADA">SOLICITADA</option>
              <option value="APROBADA">APROBADA</option>
              <option value="RECHAZADA">RECHAZADA</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Guardar cambios' : 'Crear solicitud'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
