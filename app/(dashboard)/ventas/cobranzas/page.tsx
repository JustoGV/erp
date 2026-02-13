'use client';

import { useEffect, useMemo, useState } from 'react';
import { DollarSign, Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';

interface Cobranza {
  id: string;
  cliente: string;
  fecha: string;
  monto: number;
  metodo: string;
  estado: 'PENDIENTE' | 'COBRADO';
}

const mockCobranzas: Cobranza[] = [
  { id: '1', cliente: 'Empresa ABC S.A.', fecha: '2026-02-08', monto: 25000, metodo: 'Transferencia', estado: 'COBRADO' },
  { id: '2', cliente: 'Mayorista del Sur', fecha: '2026-02-10', monto: 18500, metodo: 'Cheque', estado: 'PENDIENTE' }
];

export default function CobranzasPage() {
  const [cobranzas, setCobranzas] = useState<Cobranza[]>(mockCobranzas);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Cobranza | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [formState, setFormState] = useState({
    cliente: '',
    fecha: '',
    monto: 0,
    metodo: '',
    estado: 'PENDIENTE' as Cobranza['estado']
  });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(cobranzas.length / pageSize)),
    [cobranzas.length]
  );
  const pagedCobranzas = useMemo(() => {
    const start = (page - 1) * pageSize;
    return cobranzas.slice(start, start + pageSize);
  }, [cobranzas, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openCreate = () => {
    setEditing(null);
    setFormState({ cliente: '', fecha: '', monto: 0, metodo: '', estado: 'PENDIENTE' });
    setFormOpen(true);
  };

  const openEdit = (cobranza: Cobranza) => {
    setEditing(cobranza);
    setFormState({
      cliente: cobranza.cliente,
      fecha: cobranza.fecha,
      monto: cobranza.monto,
      metodo: cobranza.metodo,
      estado: cobranza.estado
    });
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar cobranza?')) return;
    setCobranzas(prev => prev.filter(item => item.id !== id));
  };

  const handleStatusChange = (id: string, estado: Cobranza['estado']) => {
    setCobranzas(prev => prev.map(item => (
      item.id === id ? { ...item, estado } : item
    )));
  };

  const formatCurrency = (value: number) => (
    value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editing) {
      setCobranzas(prev => prev.map(item => (item.id === editing.id ? { ...item, ...formState } : item)));
    } else {
      setCobranzas(prev => [{ id: Date.now().toString(), ...formState }, ...prev]);
    }

    setFormOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cobranzas</h1>
          <p className="text-gray-600 mt-1">Gestión de cobros a clientes</p>
        </div>
        <button
          onClick={openCreate}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          Nueva cobranza
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pagedCobranzas.map(cobranza => (
              <tr key={cobranza.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{cobranza.cliente}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{cobranza.fecha}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{cobranza.metodo}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{cobranza.estado}</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">${formatCurrency(cobranza.monto)}</td>
                <td className="px-6 py-4 text-right text-sm">
                  <div className="inline-flex items-center gap-2">
                    <select
                      value={cobranza.estado}
                      onChange={(event) => handleStatusChange(cobranza.id, event.target.value as Cobranza['estado'])}
                      className="input w-32 py-1.5 px-2 text-xs"
                      aria-label="Cambiar estado"
                    >
                      <option value="PENDIENTE">PENDIENTE</option>
                      <option value="COBRADO">COBRADO</option>
                    </select>
                    <button
                      onClick={() => openEdit(cobranza)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cobranza.id)}
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
        title={editing ? 'Editar cobranza' : 'Crear cobranza'}
        onClose={() => setFormOpen(false)}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Cliente</label>
            <input
              value={formState.cliente}
              onChange={(event) => setFormState(prev => ({ ...prev, cliente: event.target.value }))}
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
            <label className="label">Método</label>
            <input
              value={formState.metodo}
              onChange={(event) => setFormState(prev => ({ ...prev, metodo: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Estado</label>
            <select
              value={formState.estado}
              onChange={(event) => setFormState(prev => ({ ...prev, estado: event.target.value as Cobranza['estado'] }))}
              className="input"
            >
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="COBRADO">COBRADO</option>
            </select>
          </div>
          <div>
            <label className="label">Monto</label>
            <input
              type="number"
              value={formState.monto}
              onChange={(event) => setFormState(prev => ({ ...prev, monto: Number(event.target.value) }))}
              className="input"
              required
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Guardar cambios' : 'Crear cobranza'}
            </button>
          </div>
        </form>
      </Modal>

      {!formOpen && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-emerald-900">Panel de demo</h3>
              <p className="text-sm text-emerald-700">Crea y administra cobranzas sin base de datos.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
