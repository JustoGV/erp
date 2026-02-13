'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'Administrador' | 'Vendedor' | 'Contable';
  estado: 'ACTIVO' | 'INACTIVO';
}

const mockUsuarios: Usuario[] = [
  { id: '1', nombre: 'Admin Principal', email: 'admin@empresa.com', rol: 'Administrador', estado: 'ACTIVO' },
  { id: '2', nombre: 'Vendedor López', email: 'vendedor@empresa.com', rol: 'Vendedor', estado: 'ACTIVO' }
];

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(mockUsuarios);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [formState, setFormState] = useState({ nombre: '', email: '', rol: 'Vendedor' as Usuario['rol'], estado: 'ACTIVO' as Usuario['estado'] });
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(usuarios.length / pageSize)),
    [usuarios.length]
  );
  const pagedUsuarios = useMemo(() => {
    const start = (page - 1) * pageSize;
    return usuarios.slice(start, start + pageSize);
  }, [usuarios, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openCreate = () => {
    setEditing(null);
    setFormState({ nombre: '', email: '', rol: 'Vendedor', estado: 'ACTIVO' });
    setFormOpen(true);
  };

  const openEdit = (usuario: Usuario) => {
    setEditing(usuario);
    setFormState({ nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, estado: usuario.estado });
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar usuario?')) return;
    setUsuarios(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editing) {
      setUsuarios(prev => prev.map(item => (item.id === editing.id ? { ...item, ...formState } : item)));
    } else {
      setUsuarios(prev => [{ id: Date.now().toString(), ...formState }, ...prev]);
      setPage(1);
    }
    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Usuarios</h1>
          <p className="text-slate-600 mt-1">Administración de accesos</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Nuevo usuario
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagedUsuarios.map(usuario => (
              <tr key={usuario.id} className="table-row-hover">
                <td className="font-medium">{usuario.nombre}</td>
                <td>{usuario.email}</td>
                <td>{usuario.rol}</td>
                <td>{usuario.estado}</td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => openEdit(usuario)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(usuario.id)}
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
        title={editing ? 'Editar usuario' : 'Crear usuario'}
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
            <label className="label">Email</label>
            <input
              type="email"
              value={formState.email}
              onChange={(event) => setFormState(prev => ({ ...prev, email: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Rol</label>
            <select
              value={formState.rol}
              onChange={(event) => setFormState(prev => ({ ...prev, rol: event.target.value as Usuario['rol'] }))}
              className="input"
            >
              <option value="Administrador">Administrador</option>
              <option value="Vendedor">Vendedor</option>
              <option value="Contable">Contable</option>
            </select>
          </div>
          <div>
            <label className="label">Estado</label>
            <select
              value={formState.estado}
              onChange={(event) => setFormState(prev => ({ ...prev, estado: event.target.value as Usuario['estado'] }))}
              className="input"
            >
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
