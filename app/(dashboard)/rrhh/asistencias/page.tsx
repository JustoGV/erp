'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';

interface Asistencia {
  id: string;
  empleado: string;
  fecha: string;
  estado: 'PRESENTE' | 'AUSENTE' | 'TARDE';
}

const mockAsistencias: Asistencia[] = [
  { id: '1', empleado: 'Laura Gómez', fecha: '2026-02-10', estado: 'PRESENTE' },
  { id: '2', empleado: 'Carlos Ruiz', fecha: '2026-02-10', estado: 'TARDE' }
];

export default function AsistenciasPage() {
  const [asistencias, setAsistencias] = useState<Asistencia[]>(mockAsistencias);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Asistencia | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [formState, setFormState] = useState({ empleado: '', fecha: '', estado: 'PRESENTE' as Asistencia['estado'] });
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(asistencias.length / pageSize)),
    [asistencias.length]
  );
  const pagedAsistencias = useMemo(() => {
    const start = (page - 1) * pageSize;
    return asistencias.slice(start, start + pageSize);
  }, [asistencias, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openCreate = () => {
    setEditing(null);
    setFormState({ empleado: '', fecha: '', estado: 'PRESENTE' });
    setFormOpen(true);
  };

  const openEdit = (item: Asistencia) => {
    setEditing(item);
    setFormState({ empleado: item.empleado, fecha: item.fecha, estado: item.estado });
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar asistencia?')) return;
    setAsistencias(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editing) {
      setAsistencias(prev => prev.map(item => (item.id === editing.id ? { ...item, ...formState } : item)));
    } else {
      setAsistencias(prev => [{ id: Date.now().toString(), ...formState }, ...prev]);
      setPage(1);
    }
    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Asistencias</h1>
          <p className="text-slate-600 mt-1">Control de presentismo</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Nueva asistencia
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagedAsistencias.map(item => (
              <tr key={item.id} className="table-row-hover">
                <td className="font-medium">{item.empleado}</td>
                <td>{item.fecha}</td>
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
        title={editing ? 'Editar asistencia' : 'Crear asistencia'}
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
            <label className="label">Estado</label>
            <select
              value={formState.estado}
              onChange={(event) => setFormState(prev => ({ ...prev, estado: event.target.value as Asistencia['estado'] }))}
              className="input"
            >
              <option value="PRESENTE">PRESENTE</option>
              <option value="AUSENTE">AUSENTE</option>
              <option value="TARDE">TARDE</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Guardar cambios' : 'Crear asistencia'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
