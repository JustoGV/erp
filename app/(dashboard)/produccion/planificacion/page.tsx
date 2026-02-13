'use client';

import { useState } from 'react';
import { TrendingUp, Plus, Pencil, Trash2 } from 'lucide-react';

interface PlanProduccion {
  id: string;
  producto: string;
  cantidad: number;
  fechaInicio: string;
  fechaFin: string;
  estado: 'PLANIFICADO' | 'EN_PROCESO' | 'FINALIZADO';
}

const mockPlanes: PlanProduccion[] = [
  { id: '1', producto: 'Producto A - Premium', cantidad: 1200, fechaInicio: '2026-02-10', fechaFin: '2026-02-18', estado: 'EN_PROCESO' },
  { id: '2', producto: 'Producto B - Standard', cantidad: 800, fechaInicio: '2026-02-15', fechaFin: '2026-02-22', estado: 'PLANIFICADO' },
  { id: '3', producto: 'Producto C - Economy', cantidad: 600, fechaInicio: '2026-02-01', fechaFin: '2026-02-08', estado: 'FINALIZADO' }
];

export default function PlanificacionPage() {
  const [planes, setPlanes] = useState<PlanProduccion[]>(mockPlanes);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PlanProduccion | null>(null);
  const [formState, setFormState] = useState({
    producto: '',
    cantidad: 0,
    fechaInicio: '',
    fechaFin: '',
    estado: 'PLANIFICADO' as PlanProduccion['estado']
  });

  const openCreate = () => {
    setEditing(null);
    setFormState({ producto: '', cantidad: 0, fechaInicio: '', fechaFin: '', estado: 'PLANIFICADO' });
    setFormOpen(true);
  };

  const openEdit = (plan: PlanProduccion) => {
    setEditing(plan);
    setFormState({
      producto: plan.producto,
      cantidad: plan.cantidad,
      fechaInicio: plan.fechaInicio,
      fechaFin: plan.fechaFin,
      estado: plan.estado
    });
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar plan de producción?')) return;
    setPlanes(prev => prev.filter(plan => plan.id !== id));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editing) {
      setPlanes(prev => prev.map(plan => {
        if (plan.id !== editing.id) return plan;
        return { ...plan, ...formState };
      }));
    } else {
      setPlanes(prev => [
        { id: Date.now().toString(), ...formState },
        ...prev
      ]);
    }

    setFormOpen(false);
  };

  const estadoColor = (estado: PlanProduccion['estado']) => {
    if (estado === 'FINALIZADO') return 'bg-green-100 text-green-700';
    if (estado === 'EN_PROCESO') return 'bg-blue-100 text-blue-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Planificación de Producción</h1>
          <p className="text-slate-600 mt-1">Programación de órdenes y capacidad</p>
        </div>
        <button
          onClick={openCreate}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          Nuevo plan
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {planes.map(plan => (
              <tr key={plan.id} className="table-row-hover">
                <td className="font-medium">{plan.producto}</td>
                <td>{plan.cantidad}</td>
                <td>{plan.fechaInicio}</td>
                <td>{plan.fechaFin}</td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${estadoColor(plan.estado)}`}>
                    {plan.estado}
                  </span>
                </td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <button onClick={() => openEdit(plan)} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(plan.id)} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
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
            {editing ? 'Editar plan' : 'Crear plan'}
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
              <label className="label">Cantidad</label>
              <input
                type="number"
                value={formState.cantidad}
                onChange={(event) => setFormState(prev => ({ ...prev, cantidad: Number(event.target.value) }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Fecha inicio</label>
              <input
                type="date"
                value={formState.fechaInicio}
                onChange={(event) => setFormState(prev => ({ ...prev, fechaInicio: event.target.value }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Fecha fin</label>
              <input
                type="date"
                value={formState.fechaFin}
                onChange={(event) => setFormState(prev => ({ ...prev, fechaFin: event.target.value }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Estado</label>
              <select
                value={formState.estado}
                onChange={(event) => setFormState(prev => ({ ...prev, estado: event.target.value as PlanProduccion['estado'] }))}
                className="input"
              >
                <option value="PLANIFICADO">PLANIFICADO</option>
                <option value="EN_PROCESO">EN PROCESO</option>
                <option value="FINALIZADO">FINALIZADO</option>
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
              <button type="submit" className="btn btn-primary">
                {editing ? 'Guardar cambios' : 'Crear plan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!formOpen && (
        <div className="card">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Panel de demo</h3>
              <p className="text-sm text-slate-600">Organiza la producción con planes editables en pantalla.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
