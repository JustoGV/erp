'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';

interface PagoProveedor {
  id: string;
  proveedor: string;
  fecha: string;
  monto: number;
  metodo: string;
  estado: 'PENDIENTE' | 'PAGADO';
}

const mockPagos: PagoProveedor[] = [
  { id: '1', proveedor: 'Proveedor Industrial S.A.', fecha: '2026-02-12', monto: 31460, metodo: 'Transferencia', estado: 'PENDIENTE' },
  { id: '2', proveedor: 'Distribuidora Nacional', fecha: '2026-02-15', monto: 18800, metodo: 'Cheque', estado: 'PAGADO' }
];

export default function PagosPage() {
  const [pagos, setPagos] = useState<PagoProveedor[]>(mockPagos);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PagoProveedor | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [formState, setFormState] = useState({
    proveedor: '',
    fecha: '',
    monto: 0,
    metodo: '',
    estado: 'PENDIENTE' as PagoProveedor['estado']
  });
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(pagos.length / pageSize)),
    [pagos.length]
  );
  const pagedPagos = useMemo(() => {
    const start = (page - 1) * pageSize;
    return pagos.slice(start, start + pageSize);
  }, [pagos, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openCreate = () => {
    setEditing(null);
    setFormState({ proveedor: '', fecha: '', monto: 0, metodo: '', estado: 'PENDIENTE' });
    setFormOpen(true);
  };

  const openEdit = (pago: PagoProveedor) => {
    setEditing(pago);
    setFormState({
      proveedor: pago.proveedor,
      fecha: pago.fecha,
      monto: pago.monto,
      metodo: pago.metodo,
      estado: pago.estado
    });
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar pago?')) return;
    setPagos(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editing) {
      setPagos(prev => prev.map(item => (item.id === editing.id ? { ...item, ...formState } : item)));
    } else {
      setPagos(prev => [{ id: Date.now().toString(), ...formState }, ...prev]);
      setPage(1);
    }

    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pagos a Proveedores</h1>
          <p className="text-slate-600 mt-1">Administración de pagos</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus className="h-4 w-4" />
          Nuevo pago
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Fecha</th>
              <th>Método</th>
              <th>Estado</th>
              <th className="text-right">Monto</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagedPagos.map(pago => (
              <tr key={pago.id} className="table-row-hover">
                <td className="font-medium">{pago.proveedor}</td>
                <td>{pago.fecha}</td>
                <td>{pago.metodo}</td>
                <td>{pago.estado}</td>
                <td className="text-right font-semibold">${pago.monto.toLocaleString()}</td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => openEdit(pago)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pago.id)}
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
        title={editing ? 'Editar pago' : 'Crear pago'}
        onClose={() => setFormOpen(false)}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Proveedor</label>
            <input
              value={formState.proveedor}
              onChange={(event) => setFormState(prev => ({ ...prev, proveedor: event.target.value }))}
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
              onChange={(event) => setFormState(prev => ({ ...prev, estado: event.target.value as PagoProveedor['estado'] }))}
              className="input"
            >
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="PAGADO">PAGADO</option>
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
              {editing ? 'Guardar cambios' : 'Crear pago'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
