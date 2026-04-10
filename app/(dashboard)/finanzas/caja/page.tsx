'use client';

import { useState } from 'react';
import { Plus, Search, DollarSign, TrendingUp, TrendingDown, X, AlertCircle } from 'lucide-react';
import { useLocal } from '@/contexts/LocalContext';
import { useSaldoCaja, useMovimientosCaja, useRegistrarMovimientoCaja } from '@/hooks/useFinanzas';
import { useApiToast } from '@/hooks/useApiToast';
import type { MovimientoCajaDto, MovimientoCaja } from '@/lib/api-types';

function NuevoMovimientoModal({
  onClose,
  localId,
}: {
  onClose: () => void;
  localId: string;
}) {
  const { handleError, handleSuccess } = useApiToast();
  const registrar = useRegistrarMovimientoCaja();
  const [form, setForm] = useState<MovimientoCajaDto>({
    tipo: 'INGRESO',
    monto: 0,
    concepto: '',
    referencia: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registrar.mutate(
      { localId, dto: { ...form, monto: Number(form.monto) } },
      {
        onSuccess: () => {
          handleSuccess('Movimiento registrado');
          onClose();
        },
        onError: (err) => handleError(err),
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-900">Nuevo Movimiento de Caja</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="tipo" className="label">Tipo</label>
            <select
              id="tipo"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as 'INGRESO' | 'EGRESO' })}
              className="input"
              required
            >
              <option value="INGRESO">Ingreso</option>
              <option value="EGRESO">Egreso</option>
            </select>
          </div>
          <div>
            <label htmlFor="monto" className="label">Monto</label>
            <input
              id="monto"
              type="number"
              min="0.01"
              step="0.01"
              value={form.monto || ''}
              onChange={(e) => setForm({ ...form, monto: parseFloat(e.target.value) || 0 })}
              className="input"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label htmlFor="concepto" className="label">Concepto</label>
            <input
              id="concepto"
              type="text"
              value={form.concepto}
              onChange={(e) => setForm({ ...form, concepto: e.target.value })}
              className="input"
              placeholder="Ej: Cobro de factura, Pago de servicio..."
              required
            />
          </div>
          <div>
            <label htmlFor="referencia" className="label">Referencia <span className="text-slate-400">(opcional)</span></label>
            <input
              id="referencia"
              type="text"
              value={form.referencia}
              onChange={(e) => setForm({ ...form, referencia: e.target.value })}
              className="input"
              placeholder="Nro. de factura, recibo, etc."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={registrar.isPending}
              className="btn btn-primary flex-1"
            >
              {registrar.isPending ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CajaPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');

  const localId = selectedLocal?.id ?? '';

  const { data: saldoCaja, isLoading: loadingSaldo } = useSaldoCaja(localId);
  const { data: movimientosData, isLoading: loadingMovs } = useMovimientosCaja(localId, {
    limit: 100,
  });

  const movimientos: MovimientoCaja[] = (movimientosData as any)?.data ?? movimientosData ?? [];

  const filtered = movimientos.filter((m) => {
    const matchSearch = search === '' || m.concepto.toLowerCase().includes(search.toLowerCase()) || m.referencia?.toLowerCase().includes(search.toLowerCase());
    const matchTipo = tipoFilter === '' || m.tipo === tipoFilter;
    return matchSearch && matchTipo;
  });

  const totalIngresos = movimientos.filter((m) => m.tipo === 'INGRESO').reduce((s, m) => s + m.monto, 0);
  const totalEgresos = movimientos.filter((m) => m.tipo === 'EGRESO').reduce((s, m) => s + m.monto, 0);
  const saldoActual = saldoCaja?.data?.saldo ?? 0;

  if (isAllLocales) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Caja</h1>
          <p className="text-slate-600 mt-1">Gestión de movimientos de efectivo</p>
        </div>
        <div className="card flex items-center gap-4 text-amber-700 bg-amber-50 border border-amber-200">
          <AlertCircle size={20} className="flex-shrink-0" />
          <p>Seleccioná un local específico para ver y gestionar la caja.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showModal && localId && (
        <NuevoMovimientoModal localId={localId} onClose={() => setShowModal(false)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Caja</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <DollarSign size={16} />
            {selectedLocal?.name ?? 'Local'} — Movimientos de efectivo
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          disabled={!localId}
        >
          <Plus size={18} />
          Nuevo Movimiento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Ingresos del período</p>
              <p className="text-2xl font-bold text-emerald-600">
                ${totalIngresos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Egresos del período</p>
              <p className="text-2xl font-bold text-red-600">
                ${totalEgresos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Saldo actual</p>
              {loadingSaldo ? (
                <div className="h-8 w-32 bg-slate-200 animate-pulse rounded mt-1" />
              ) : (
                <p className={`text-2xl font-bold ${saldoActual >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ${saldoActual.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por concepto o referencia..."
              className="input pl-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input min-w-[160px]"
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="INGRESO">Ingresos</option>
            <option value="EGRESO">Egresos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Concepto</th>
              <th>Referencia</th>
              <th>Monto</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {loadingMovs ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j}>
                      <div className="h-4 bg-slate-200 animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500">
                  {movimientos.length === 0
                    ? 'No hay movimientos registrados para este local'
                    : 'No se encontraron movimientos con ese filtro'}
                </td>
              </tr>
            ) : (
              filtered.map((mov) => (
                <tr key={mov.id} className="table-row-hover">
                  <td className="text-slate-700">
                    {new Date(mov.fecha).toLocaleDateString('es-AR')}
                  </td>
                  <td>
                    <span className={`badge ${mov.tipo === 'INGRESO' ? 'badge-success' : 'badge-danger'}`}>
                      {mov.tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'}
                    </span>
                  </td>
                  <td className="font-medium text-slate-900">{mov.concepto}</td>
                  <td className="text-slate-500 text-sm">{mov.referencia ?? '—'}</td>
                  <td>
                    <span className={`font-semibold ${mov.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {mov.tipo === 'INGRESO' ? '+' : '-'}${mov.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="font-semibold text-slate-900">
                    ${mov.saldoNuevo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
