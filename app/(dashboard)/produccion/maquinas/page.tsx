'use client';

import { useState } from 'react';
import { Wrench, Plus, Pencil, Trash2 } from 'lucide-react';

interface Maquina {
  id: string;
  nombre: string;
  estado: 'OPERATIVA' | 'MANTENIMIENTO' | 'DETENIDA';
  capacidad: string;
  ultimoMantenimiento: string;
}

const mockMaquinas: Maquina[] = [
  { id: '1', nombre: 'Línea de Ensamble 1', estado: 'OPERATIVA', capacidad: '120 unidades/h', ultimoMantenimiento: '2026-01-20' },
  { id: '2', nombre: 'Cortadora CNC', estado: 'MANTENIMIENTO', capacidad: '45 unidades/h', ultimoMantenimiento: '2026-02-05' },
  { id: '3', nombre: 'Empaquetadora', estado: 'OPERATIVA', capacidad: '200 unidades/h', ultimoMantenimiento: '2026-01-28' }
];

export default function MaquinasPage() {
  const [maquinas, setMaquinas] = useState<Maquina[]>(mockMaquinas);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Maquina | null>(null);
  const [formState, setFormState] = useState({
    nombre: '',
    estado: 'OPERATIVA' as Maquina['estado'],
    capacidad: '',
    ultimoMantenimiento: ''
  });

  const openCreate = () => {
    setEditing(null);
    setFormState({ nombre: '', estado: 'OPERATIVA', capacidad: '', ultimoMantenimiento: '' });
    setFormOpen(true);
  };

  const openEdit = (maquina: Maquina) => {
    setEditing(maquina);
    setFormState({
      nombre: maquina.nombre,
      estado: maquina.estado,
      capacidad: maquina.capacidad,
      ultimoMantenimiento: maquina.ultimoMantenimiento
    });
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar máquina?')) return;
    setMaquinas(prev => prev.filter(maquina => maquina.id !== id));
  };

  const handleStatusChange = (id: string, estado: Maquina['estado']) => {
    setMaquinas(prev => prev.map(maquina => (
      maquina.id === id ? { ...maquina, estado } : maquina
    )));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editing) {
      setMaquinas(prev => prev.map(maquina => {
        if (maquina.id !== editing.id) return maquina;
        return { ...maquina, ...formState };
      }));
    } else {
      setMaquinas(prev => [
        { id: Date.now().toString(), ...formState },
        ...prev
      ]);
    }

    setFormOpen(false);
  };

  const estadoColor = (estado: Maquina['estado']) => {
    if (estado === 'OPERATIVA') return 'bg-green-100 text-green-700';
    if (estado === 'MANTENIMIENTO') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Máquinas y Equipos</h1>
          <p className="text-slate-600 mt-1">Control del estado de equipos de producción</p>
        </div>
        <button
          onClick={openCreate}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          Nueva máquina
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Máquina</th>
              <th>Estado</th>
              <th>Capacidad</th>
              <th>Último mantenimiento</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {maquinas.map(maquina => (
              <tr key={maquina.id} className="table-row-hover">
                <td className="font-medium">{maquina.nombre}</td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${estadoColor(maquina.estado)}`}>
                    {maquina.estado}
                  </span>
                </td>
                <td>{maquina.capacidad}</td>
                <td>{maquina.ultimoMantenimiento}</td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <select
                      value={maquina.estado}
                      onChange={(event) => handleStatusChange(maquina.id, event.target.value as Maquina['estado'])}
                      className="input w-36 py-1.5 px-2 text-xs"
                      aria-label="Cambiar estado"
                    >
                      <option value="OPERATIVA">OPERATIVA</option>
                      <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                      <option value="DETENIDA">DETENIDA</option>
                    </select>
                    <button onClick={() => openEdit(maquina)} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(maquina.id)} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
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
            {editing ? 'Editar máquina' : 'Crear máquina'}
          </h2>
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
              <label className="label">Estado</label>
              <select
                value={formState.estado}
                onChange={(event) => setFormState(prev => ({ ...prev, estado: event.target.value as Maquina['estado'] }))}
                className="input"
              >
                <option value="OPERATIVA">OPERATIVA</option>
                <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                <option value="DETENIDA">DETENIDA</option>
              </select>
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
              <label className="label">Último mantenimiento</label>
              <input
                type="date"
                value={formState.ultimoMantenimiento}
                onChange={(event) => setFormState(prev => ({ ...prev, ultimoMantenimiento: event.target.value }))}
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
                {editing ? 'Guardar cambios' : 'Crear máquina'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!formOpen && (
        <div className="card">
          <div className="flex items-start gap-3">
            <Wrench className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Panel de demo</h3>
              <p className="text-sm text-slate-600">Registra nuevas máquinas o actualiza el estado en tiempo real.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
