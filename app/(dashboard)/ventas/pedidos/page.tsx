'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Plus, Pencil, Trash2 } from 'lucide-react';
import { mockPedidosVenta, PedidoVenta, EstadoPedido } from '@/lib/mock-data';
import { usePermissions } from '@/hooks/usePermissions';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';

const estadosPedido: EstadoPedido[] = [
  'PENDIENTE',
  'CONFIRMADO',
  'EN_PREPARACION',
  'LISTO',
  'ENVIADO',
  'ENTREGADO',
  'CANCELADO'
];

export default function PedidosPage() {
  const permissions = usePermissions();
  const canCreate = permissions.canCreate('ventas');
  const canEdit = permissions.canEdit('ventas');
  const canDelete = permissions.canDelete('ventas');

  const [pedidos, setPedidos] = useState<PedidoVenta[]>(mockPedidosVenta);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PedidoVenta | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [formState, setFormState] = useState({
    numero: '',
    clienteNombre: '',
    fecha: '',
    fechaEntregaEstimada: '',
    total: 0,
    estado: 'PENDIENTE' as EstadoPedido,
    notas: ''
  });

  const totalPedidos = useMemo(() => pedidos.length, [pedidos]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(pedidos.length / pageSize)),
    [pedidos.length]
  );
  const pagedPedidos = useMemo(() => {
    const start = (page - 1) * pageSize;
    return pedidos.slice(start, start + pageSize);
  }, [page, pedidos]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openCreate = () => {
    setEditing(null);
    setFormState({
      numero: '',
      clienteNombre: '',
      fecha: '',
      fechaEntregaEstimada: '',
      total: 0,
      estado: 'PENDIENTE',
      notas: ''
    });
    setFormOpen(true);
  };

  const openEdit = (pedido: PedidoVenta) => {
    setEditing(pedido);
    setFormState({
      numero: pedido.numero,
      clienteNombre: pedido.clienteNombre,
      fecha: pedido.fecha,
      fechaEntregaEstimada: pedido.fechaEntregaEstimada,
      total: pedido.total,
      estado: pedido.estado,
      notas: pedido.notas || ''
    });
    setFormOpen(true);
  };

  const handleDelete = (pedidoId: string) => {
    if (!confirm('¿Eliminar el pedido seleccionado?')) return;
    setPedidos(prev => prev.filter(pedido => pedido.id !== pedidoId));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editing) {
      setPedidos(prev => prev.map(pedido => {
        if (pedido.id !== editing.id) return pedido;
        return {
          ...pedido,
          numero: formState.numero,
          clienteNombre: formState.clienteNombre,
          fecha: formState.fecha,
          fechaEntregaEstimada: formState.fechaEntregaEstimada,
          total: Number(formState.total),
          estado: formState.estado,
          notas: formState.notas
        };
      }));
    } else {
      const newPedido: PedidoVenta = {
        id: Date.now().toString(),
        numero: formState.numero,
        clienteId: 'demo',
        clienteNombre: formState.clienteNombre,
        fecha: formState.fecha,
        fechaEntregaEstimada: formState.fechaEntregaEstimada,
        items: [],
        subtotal: Number(formState.total),
        descuento: 0,
        impuestos: 0,
        total: Number(formState.total),
        estado: formState.estado,
        notas: formState.notas,
        vendedor: 'Demo',
        localId: '1'
      };
      setPedidos(prev => [newPedido, ...prev]);
      setPage(1);
    }

    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pedidos de Venta</h1>
          <p className="text-slate-600 mt-1">{totalPedidos} pedidos registrados</p>
        </div>
        {canCreate && (
          <button
            onClick={openCreate}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4" />
            Nuevo pedido
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Entrega</th>
              <th>Estado</th>
              <th className="text-right">Total</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagedPedidos.map((pedido) => (
              <tr key={pedido.id} className="table-row-hover">
                <td className="font-medium">{pedido.numero}</td>
                <td>{pedido.clienteNombre}</td>
                <td>{pedido.fecha}</td>
                <td>{pedido.fechaEntregaEstimada}</td>
                <td>{pedido.estado.replace(/_/g, ' ')}</td>
                <td className="text-right font-semibold">${pedido.total.toLocaleString()}</td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    {canEdit && (
                      <button
                        onClick={() => openEdit(pedido)}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(pedido.id)}
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
        title={editing ? 'Editar pedido' : 'Crear pedido'}
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
            <label className="label">Cliente</label>
            <input
              value={formState.clienteNombre}
              onChange={(event) => setFormState(prev => ({ ...prev, clienteNombre: event.target.value }))}
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
            <label className="label">Entrega estimada</label>
            <input
              type="date"
              value={formState.fechaEntregaEstimada}
              onChange={(event) => setFormState(prev => ({ ...prev, fechaEntregaEstimada: event.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Estado</label>
            <select
              value={formState.estado}
              onChange={(event) => setFormState(prev => ({ ...prev, estado: event.target.value as EstadoPedido }))}
              className="input"
            >
              {estadosPedido.map(estado => (
                <option key={estado} value={estado}>{estado.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Total</label>
            <input
              type="number"
              value={formState.total}
              onChange={(event) => setFormState(prev => ({ ...prev, total: Number(event.target.value) }))}
              className="input"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Notas</label>
            <textarea
              value={formState.notas}
              onChange={(event) => setFormState(prev => ({ ...prev, notas: event.target.value }))}
              className="input"
              rows={3}
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
            <button
              type="submit"
              className="btn btn-primary"
            >
              {editing ? 'Guardar cambios' : 'Crear pedido'}
            </button>
          </div>
        </form>
      </Modal>

      {!formOpen && (
        <div className="card">
          <div className="flex items-start gap-3">
            <ClipboardList className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Acciones de demo</h3>
              <p className="text-sm text-slate-600">
                Usa los botones para crear, editar o eliminar pedidos. Los cambios quedan solo en pantalla.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
