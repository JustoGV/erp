'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, Plus, Pencil, Trash2 } from 'lucide-react';
import { mockSeguimientoClientes, SeguimientoCliente, TipoInteraccion } from '@/lib/mock-data';
import { usePermissions } from '@/hooks/usePermissions';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';

const tiposInteraccion: TipoInteraccion[] = [
  'LLAMADA',
  'EMAIL',
  'REUNION',
  'VISITA',
  'COTIZACION',
  'VENTA',
  'RECLAMO',
  'NOTA'
];

export default function SeguimientoPage() {
  const permissions = usePermissions();
  const canCreate = permissions.canCreate('ventas');
  const canEdit = permissions.canEdit('ventas');
  const canDelete = permissions.canDelete('ventas');

  const [interacciones, setInteracciones] = useState<SeguimientoCliente[]>(mockSeguimientoClientes);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SeguimientoCliente | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [formState, setFormState] = useState({
    clienteNombre: '',
    tipo: 'LLAMADA' as TipoInteraccion,
    fecha: '',
    asunto: '',
    descripcion: '',
    vendedor: '',
    proximoSeguimiento: '',
    completado: false
  });

  const totalPendientes = useMemo(
    () => interacciones.filter(item => !item.completado).length,
    [interacciones]
  );
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(interacciones.length / pageSize)),
    [interacciones.length]
  );
  const pagedInteracciones = useMemo(() => {
    const start = (page - 1) * pageSize;
    return interacciones.slice(start, start + pageSize);
  }, [interacciones, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openCreate = () => {
    setEditing(null);
    setFormState({
      clienteNombre: '',
      tipo: 'LLAMADA',
      fecha: '',
      asunto: '',
      descripcion: '',
      vendedor: '',
      proximoSeguimiento: '',
      completado: false
    });
    setFormOpen(true);
  };

  const openEdit = (item: SeguimientoCliente) => {
    setEditing(item);
    setFormState({
      clienteNombre: item.clienteNombre,
      tipo: item.tipo,
      fecha: item.fecha,
      asunto: item.asunto,
      descripcion: item.descripcion,
      vendedor: item.vendedor,
      proximoSeguimiento: item.proximoSeguimiento || '',
      completado: item.completado
    });
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar seguimiento seleccionado?')) return;
    setInteracciones(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editing) {
      setInteracciones(prev => prev.map(item => {
        if (item.id !== editing.id) return item;
        return {
          ...item,
          clienteNombre: formState.clienteNombre,
          tipo: formState.tipo,
          fecha: formState.fecha,
          asunto: formState.asunto,
          descripcion: formState.descripcion,
          vendedor: formState.vendedor,
          proximoSeguimiento: formState.proximoSeguimiento || undefined,
          completado: formState.completado
        };
      }));
    } else {
      const newItem: SeguimientoCliente = {
        id: Date.now().toString(),
        clienteId: 'demo',
        clienteNombre: formState.clienteNombre,
        tipo: formState.tipo,
        fecha: formState.fecha,
        asunto: formState.asunto,
        descripcion: formState.descripcion,
        vendedor: formState.vendedor || 'Demo',
        proximoSeguimiento: formState.proximoSeguimiento || undefined,
        completado: formState.completado,
        localId: '1'
      };
      setInteracciones(prev => [newItem, ...prev]);
      setPage(1);
    }

    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Seguimiento de Clientes</h1>
          <p className="text-slate-600 mt-1">{totalPendientes} seguimientos pendientes</p>
        </div>
        {canCreate && (
          <button
            onClick={openCreate}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4" />
            Nuevo seguimiento
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Asunto</th>
              <th>Vendedor</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagedInteracciones.map((item) => (
              <tr key={item.id} className="table-row-hover">
                <td className="font-medium">{item.clienteNombre}</td>
                <td>{item.tipo}</td>
                <td>{item.fecha}</td>
                <td>{item.asunto}</td>
                <td>{item.vendedor}</td>
                <td>
                  {item.completado ? 'Completado' : 'Pendiente'}
                </td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    {canEdit && (
                      <button
                        onClick={() => openEdit(item)}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
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
        title={editing ? 'Editar seguimiento' : 'Crear seguimiento'}
        onClose={() => setFormOpen(false)}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Cliente</label>
            <input
              value={formState.clienteNombre}
              onChange={(event) => setFormState(prev => ({ ...prev, clienteNombre: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Tipo</label>
            <select
              value={formState.tipo}
              onChange={(event) => setFormState(prev => ({ ...prev, tipo: event.target.value as TipoInteraccion }))}
              className="input"
            >
              {tiposInteraccion.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
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
            <label className="label">Vendedor</label>
            <input
              value={formState.vendedor}
              onChange={(event) => setFormState(prev => ({ ...prev, vendedor: event.target.value }))}
              className="input"
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Asunto</label>
            <input
              value={formState.asunto}
              onChange={(event) => setFormState(prev => ({ ...prev, asunto: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Descripción</label>
            <textarea
              value={formState.descripcion}
              onChange={(event) => setFormState(prev => ({ ...prev, descripcion: event.target.value }))}
              className="input"
              rows={3}
            />
          </div>
          <div>
            <label className="label">Próximo seguimiento</label>
            <input
              type="date"
              value={formState.proximoSeguimiento}
              onChange={(event) => setFormState(prev => ({ ...prev, proximoSeguimiento: event.target.value }))}
              className="input"
            />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={formState.completado}
              onChange={(event) => setFormState(prev => ({ ...prev, completado: event.target.checked }))}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Completado</span>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {editing ? 'Guardar cambios' : 'Crear seguimiento'}
            </button>
          </div>
        </form>
      </Modal>

      {!formOpen && (
        <div className="card">
          <div className="flex items-start gap-3">
            <CalendarCheck className="h-5 w-5 text-cyan-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Panel de demo</h3>
              <p className="text-sm text-slate-600">
                Registra nuevas interacciones para mantener el historial comercial del cliente.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
