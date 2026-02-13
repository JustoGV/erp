'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Local, mockLocales } from '@/lib/mock-data';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';

export default function LocalesPage() {
  const [locales, setLocales] = useState<Local[]>(mockLocales);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Local | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [formState, setFormState] = useState({
    code: '',
    name: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    manager: '',
    active: true
  });
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(locales.length / pageSize)),
    [locales.length]
  );
  const pagedLocales = useMemo(() => {
    const start = (page - 1) * pageSize;
    return locales.slice(start, start + pageSize);
  }, [locales, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openCreate = () => {
    setEditing(null);
    setFormState({ code: '', name: '', address: '', city: '', state: '', phone: '', email: '', manager: '', active: true });
    setFormOpen(true);
  };

  const openEdit = (local: Local) => {
    setEditing(local);
    setFormState({
      code: local.code,
      name: local.name,
      address: local.address,
      city: local.city,
      state: local.state,
      phone: local.phone,
      email: local.email,
      manager: local.manager,
      active: local.active
    });
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar local?')) return;
    setLocales(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editing) {
      setLocales(prev => prev.map(item => (item.id === editing.id ? { ...item, ...formState } : item)));
    } else {
      setLocales(prev => [
        {
          id: Date.now().toString(),
          empresaId: '1',
          ...formState
        },
        ...prev
      ]);
      setPage(1);
    }
    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Locales</h1>
          <p className="text-slate-600 mt-1">Gestión de sucursales</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Nuevo local
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Ciudad</th>
              <th>Responsable</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagedLocales.map(local => (
              <tr key={local.id} className="table-row-hover">
                <td className="font-medium">{local.code}</td>
                <td>{local.name}</td>
                <td>{local.city}</td>
                <td>{local.manager}</td>
                <td>{local.active ? 'Activo' : 'Inactivo'}</td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => openEdit(local)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(local.id)}
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
        title={editing ? 'Editar local' : 'Crear local'}
        onClose={() => setFormOpen(false)}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Código</label>
            <input
              value={formState.code}
              onChange={(event) => setFormState(prev => ({ ...prev, code: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Nombre</label>
            <input
              value={formState.name}
              onChange={(event) => setFormState(prev => ({ ...prev, name: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Dirección</label>
            <input
              value={formState.address}
              onChange={(event) => setFormState(prev => ({ ...prev, address: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Ciudad</label>
            <input
              value={formState.city}
              onChange={(event) => setFormState(prev => ({ ...prev, city: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Provincia</label>
            <input
              value={formState.state}
              onChange={(event) => setFormState(prev => ({ ...prev, state: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input
              value={formState.phone}
              onChange={(event) => setFormState(prev => ({ ...prev, phone: event.target.value }))}
              className="input"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={formState.email}
              onChange={(event) => setFormState(prev => ({ ...prev, email: event.target.value }))}
              className="input"
            />
          </div>
          <div>
            <label className="label">Responsable</label>
            <input
              value={formState.manager}
              onChange={(event) => setFormState(prev => ({ ...prev, manager: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={formState.active}
              onChange={(event) => setFormState(prev => ({ ...prev, active: event.target.checked }))}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Activo</span>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Guardar cambios' : 'Crear local'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
