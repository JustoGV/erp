'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';

interface Deposito {
  id: string;
  nombre: string;
  ubicacion: string;
  capacidad: string;
  responsable: string;
}

const mockDepositos: Deposito[] = [
  { id: '1', nombre: 'Depósito Central', ubicacion: 'Santa Fe', capacidad: '1200 m²', responsable: 'Juan Pérez' },
  { id: '2', nombre: 'Depósito Paraná', ubicacion: 'Paraná', capacidad: '800 m²', responsable: 'María González' }
];

export default function DepositosPage() {
  const [depositos, setDepositos] = useState<Deposito[]>(mockDepositos);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Deposito | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [formState, setFormState] = useState({ nombre: '', ubicacion: '', capacidad: '', responsable: '' });
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(depositos.length / pageSize)),
    [depositos.length]
  );
  const pagedDepositos = useMemo(() => {
    const start = (page - 1) * pageSize;
    return depositos.slice(start, start + pageSize);
  }, [depositos, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openCreate = () => {
    setEditing(null);
    setFormState({ nombre: '', ubicacion: '', capacidad: '', responsable: '' });
    setFormOpen(true);
  };

  const openEdit = (deposito: Deposito) => {
    setEditing(deposito);
    setFormState({
      nombre: deposito.nombre,
      ubicacion: deposito.ubicacion,
      capacidad: deposito.capacidad,
      responsable: deposito.responsable
    });
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar depósito?')) return;
    setDepositos(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editing) {
      setDepositos(prev => prev.map(item => (item.id === editing.id ? { ...item, ...formState } : item)));
    } else {
      setDepositos(prev => [{ id: Date.now().toString(), ...formState }, ...prev]);
      setPage(1);
    }
    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Depósitos</h1>
          <p className="text-slate-600 mt-1">Administración de depósitos</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Nuevo depósito
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Ubicación</th>
              <th>Capacidad</th>
              <th>Responsable</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagedDepositos.map(deposito => (
              <tr key={deposito.id} className="table-row-hover">
                <td className="font-medium">{deposito.nombre}</td>
                <td>{deposito.ubicacion}</td>
                <td>{deposito.capacidad}</td>
                <td>{deposito.responsable}</td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => openEdit(deposito)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(deposito.id)}
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
        title={editing ? 'Editar depósito' : 'Crear depósito'}
        onClose={() => setFormOpen(false)}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre</label>
            <input
              value={formState.nombre}
              onChange={(event) => setFormState(prev => ({ ...prev, nombre: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Ubicación</label>
            <input
              value={formState.ubicacion}
              onChange={(event) => setFormState(prev => ({ ...prev, ubicacion: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Capacidad</label>
            <input
              value={formState.capacidad}
              onChange={(event) => setFormState(prev => ({ ...prev, capacidad: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Responsable</label>
            <input
              value={formState.responsable}
              onChange={(event) => setFormState(prev => ({ ...prev, responsable: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Guardar cambios' : 'Crear depósito'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
