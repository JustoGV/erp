'use client';

import { useEffect, useMemo, useState } from 'react';
import { PackageCheck, Plus, Pencil, Trash2 } from 'lucide-react';
import { AvisoRecepcion, mockAvisosRecepcion } from '@/lib/mock-data';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';

export default function RecepcionesPage() {
  const [recepciones, setRecepciones] = useState<AvisoRecepcion[]>(mockAvisosRecepcion);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AvisoRecepcion | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [formState, setFormState] = useState({
    numero: '',
    ordenCompraNumero: '',
    proveedorNombre: '',
    fechaRecepcion: '',
    recibidoPor: '',
    conformidad: true
  });
    const totalPages = useMemo(
      () => Math.max(1, Math.ceil(recepciones.length / pageSize)),
      [recepciones.length]
    );
    const pagedRecepciones = useMemo(() => {
      const start = (page - 1) * pageSize;
      return recepciones.slice(start, start + pageSize);
    }, [recepciones, page]);

    useEffect(() => {
      if (page > totalPages) {
        setPage(totalPages);
      }
    }, [page, totalPages]);

    const openCreate = () => {
      setEditing(null);
      setFormState({ numero: '', ordenCompraNumero: '', proveedorNombre: '', fechaRecepcion: '', recibidoPor: '', conformidad: true });
      setFormOpen(true);
    };

    const openEdit = (recepcion: AvisoRecepcion) => {
      setEditing(recepcion);
      setFormState({
        numero: recepcion.numero,
        ordenCompraNumero: recepcion.ordenCompraNumero,
        proveedorNombre: recepcion.proveedorNombre,
        fechaRecepcion: recepcion.fechaRecepcion,
        recibidoPor: recepcion.recibidoPor,
        conformidad: recepcion.conformidad
      });
      setFormOpen(true);
    };

    const handleDelete = (id: string) => {
      if (!confirm('¿Eliminar aviso de recepción?')) return;
      setRecepciones(prev => prev.filter(item => item.id !== id));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (editing) {
        setRecepciones(prev => prev.map(item => (item.id === editing.id ? { ...item, ...formState } : item)));
      } else {
        const newRecepcion: AvisoRecepcion = {
          id: Date.now().toString(),
          numero: formState.numero,
          ordenCompraId: 'demo',
          ordenCompraNumero: formState.ordenCompraNumero,
          proveedorNombre: formState.proveedorNombre,
          fechaRecepcion: formState.fechaRecepcion,
          items: [],
          recibidoPor: formState.recibidoPor,
          conformidad: formState.conformidad,
          localId: '1',
          empresaId: '1'
        };
        setRecepciones(prev => [newRecepcion, ...prev]);
        setPage(1);
      }

      setFormOpen(false);
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Recepciones</h1>
            <p className="text-slate-600 mt-1">Avisos de recepción de mercadería</p>
          </div>
          <button onClick={openCreate} className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Nueva recepción
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Orden</th>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th>Recibido por</th>
                <th>Conformidad</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagedRecepciones.map(recepcion => (
                <tr key={recepcion.id} className="table-row-hover">
                  <td className="font-medium">{recepcion.numero}</td>
                  <td>{recepcion.ordenCompraNumero}</td>
                  <td>{recepcion.proveedorNombre}</td>
                  <td>{recepcion.fechaRecepcion}</td>
                  <td>{recepcion.recibidoPor}</td>
                  <td>{recepcion.conformidad ? 'Conforme' : 'Observada'}</td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => openEdit(recepcion)} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(recepcion.id)} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
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
          title={editing ? 'Editar recepción' : 'Crear recepción'}
          onClose={() => setFormOpen(false)}
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Número</label>
              <input
                value={formState.numero}
                onChange={(event) => setFormState(prev => ({ ...prev, numero: event.target.value }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Orden de compra</label>
              <input
                value={formState.ordenCompraNumero}
                onChange={(event) => setFormState(prev => ({ ...prev, ordenCompraNumero: event.target.value }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Proveedor</label>
              <input
                value={formState.proveedorNombre}
                onChange={(event) => setFormState(prev => ({ ...prev, proveedorNombre: event.target.value }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Fecha recepción</label>
              <input
                type="date"
                value={formState.fechaRecepcion}
                onChange={(event) => setFormState(prev => ({ ...prev, fechaRecepcion: event.target.value }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Recibido por</label>
              <input
                value={formState.recibidoPor}
                onChange={(event) => setFormState(prev => ({ ...prev, recibidoPor: event.target.value }))}
                className="input"
                required
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={formState.conformidad}
                onChange={(event) => setFormState(prev => ({ ...prev, conformidad: event.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Conforme</span>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setFormOpen(false)} className="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editing ? 'Guardar cambios' : 'Crear recepción'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }
