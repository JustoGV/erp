'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';

interface AjusteStock {
  id: string;
  producto: string;
  tipo: 'INGRESO' | 'EGRESO';
  cantidad: number;
  motivo: string;
  fecha: string;
}

const mockAjustes: AjusteStock[] = [
  { id: '1', producto: 'Producto A - Premium', tipo: 'INGRESO', cantidad: 20, motivo: 'Reconteo', fecha: '2026-02-05' },
  { id: '2', producto: 'Producto B - Standard', tipo: 'EGRESO', cantidad: 5, motivo: 'Merma', fecha: '2026-02-07' }
];

export default function AjustesPage() {
  const [ajustes, setAjustes] = useState<AjusteStock[]>(mockAjustes);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AjusteStock | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [formState, setFormState] = useState({
    producto: '',
    tipo: 'INGRESO' as AjusteStock['tipo'],
    cantidad: 0,
    motivo: '',
    fecha: ''
  });
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(ajustes.length / pageSize)),
    [ajustes.length]
  );
  const pagedAjustes = useMemo(() => {
    const start = (page - 1) * pageSize;
    return ajustes.slice(start, start + pageSize);
  }, [ajustes, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openCreate = () => {
    setEditing(null);
    setFormState({ producto: '', tipo: 'INGRESO', cantidad: 0, motivo: '', fecha: '' });
    setFormOpen(true);
  };

  const openEdit = (ajuste: AjusteStock) => {
    setEditing(ajuste);
    setFormState({
      producto: ajuste.producto,
      tipo: ajuste.tipo,
      cantidad: ajuste.cantidad,
      motivo: ajuste.motivo,
      fecha: ajuste.fecha
    });
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar ajuste?')) return;
    setAjustes(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editing) {
      setAjustes(prev => prev.map(item => (item.id === editing.id ? { ...item, ...formState } : item)));
    } else {
      setAjustes(prev => [{ id: Date.now().toString(), ...formState }, ...prev]);
      setPage(1);
    }
    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ajustes de Stock</h1>
          <p className="text-slate-600 mt-1">Correcciones de inventario</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Nuevo ajuste
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Motivo</th>
              <th>Fecha</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagedAjustes.map(ajuste => (
              <tr key={ajuste.id} className="table-row-hover">
                <td className="font-medium">{ajuste.producto}</td>
                <td>{ajuste.tipo}</td>
                <td>{ajuste.cantidad}</td>
                <td>{ajuste.motivo}</td>
                <td>{ajuste.fecha}</td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => openEdit(ajuste)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ajuste.id)}
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
        title={editing ? 'Editar ajuste' : 'Crear ajuste'}
        onClose={() => setFormOpen(false)}
      >
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
            <label className="label">Tipo</label>
            <select
              value={formState.tipo}
              onChange={(event) => setFormState(prev => ({ ...prev, tipo: event.target.value as AjusteStock['tipo'] }))}
              className="input"
            >
              <option value="INGRESO">INGRESO</option>
              <option value="EGRESO">EGRESO</option>
            </select>
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
            <label className="label">Motivo</label>
            <input
              value={formState.motivo}
              onChange={(event) => setFormState(prev => ({ ...prev, motivo: event.target.value }))}
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
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Guardar cambios' : 'Crear ajuste'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
