"use client";

import { useState } from "react";
import { ClipboardCheck, Plus, CheckCircle, Trash2 } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import {
  useRequerimientos,
  useCrearRequerimiento,
  useAutorizarRequerimiento,
} from "@/hooks/useCompras";
import Pagination from "@/components/Pagination";
import Modal from "@/components/Modal";
import { useApiToast } from "@/hooks/useApiToast";
import type { ItemRequerimientoDto } from "@/lib/api-types";

const ESTADO_CONFIG: Record<string, { class: string; label: string }> = {
  PENDIENTE:  { class: "badge-warning",   label: "Pendiente" },
  AUTORIZADO: { class: "badge-success",   label: "Autorizado" },
  RECHAZADO:  { class: "badge-danger",    label: "Rechazado" },
  COMPLETADO: { class: "badge-info",      label: "Completado" },
  CANCELADO:  { class: "badge-secondary", label: "Cancelado" },
};

const ITEM_EMPTY: ItemRequerimientoDto = {
  descripcion: "", cantidad: 0, unidad: "UNI",
  productoId: undefined, precioEstimado: undefined, observaciones: undefined,
};

export default function RequerimientosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const { handleError, handleSuccess } = useApiToast();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useRequerimientos({ localId, page, limit: 20 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const crear = useCrearRequerimiento();
  const autorizar = useAutorizarRequerimiento();

  const defaultForm = {
    solicitante: "", departamento: "", justificacion: "",
    fechaNecesidad: "", observaciones: "",
  };
  const [form, setForm] = useState(defaultForm);
  const [lineas, setLineas] = useState<ItemRequerimientoDto[]>([{ ...ITEM_EMPTY }]);

  const setField = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const setLinea = (i: number, f: keyof ItemRequerimientoDto, v: string) =>
    setLineas(prev => prev.map((l, idx) =>
      idx === i ? { ...l, [f]: f === "cantidad" || f === "precioEstimado" ? Number(v) : v } : l
    ));

  const addLinea = () => setLineas(p => [...p, { ...ITEM_EMPTY }]);
  const removeLinea = (i: number) => setLineas(p => p.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localId) { handleError(new Error("Selecciona un local.")); return; }
    if (lineas.some(l => !l.descripcion || l.cantidad <= 0)) {
      handleError(new Error("Completá descripción y cantidad en todos los ítems."));
      return;
    }
    try {
      await crear.mutateAsync({
        localId,
        dto: {
          solicitante: form.solicitante,
          departamento: form.departamento,
          justificacion: form.justificacion,
          fechaNecesidad: form.fechaNecesidad,
          observaciones: form.observaciones || undefined,
          items: lineas.map(l => ({
            descripcion: l.descripcion,
            cantidad: l.cantidad,
            unidad: l.unidad,
            precioEstimado: l.precioEstimado || undefined,
            observaciones: l.observaciones || undefined,
          })),
        },
      });
      handleSuccess("Requerimiento creado", "El requerimiento fue registrado correctamente.");
      setModalOpen(false);
      setForm(defaultForm);
      setLineas([{ ...ITEM_EMPTY }]);
    } catch (err) {
      handleError(err);
    }
  };

  const handleAutorizar = async (id: string) => {
    try {
      await autorizar.mutateAsync(id);
      handleSuccess("Requerimiento autorizado", "El estado cambió a AUTORIZADO.");
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck size={24} /> Requerimientos de Compra
          </h1>
          <p className="text-slate-500">{total} requerimientos registrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Nuevo Requerimiento
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Solicitante</th>
                <th>Departamento</th>
                <th>Fecha Necesidad</th>
                <th className="text-center">Ítems</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No se encontraron requerimientos.</td></tr>
              ) : items.map((r) => {
                const est = ESTADO_CONFIG[r.estado] ?? { class: "badge-secondary", label: r.estado };
                return (
                  <tr key={r.id} className="table-row-hover">
                    <td className="font-mono text-xs">{r.numero}</td>
                    <td className="font-medium">{r.solicitante}</td>
                    <td>{r.departamento}</td>
                    <td>{new Date(r.fechaNecesidad).toLocaleDateString()}</td>
                    <td className="text-center">{r._count?.items ?? "—"}</td>
                    <td><span className={`badge ${est.class}`}>{est.label}</span></td>
                    <td>
                      {r.estado === "PENDIENTE" && (
                        <button
                          onClick={() => handleAutorizar(r.id)}
                          disabled={autorizar.isPending}
                          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          <CheckCircle size={14} /> Autorizar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal open={modalOpen} title="Nuevo Requerimiento" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Solicitante *</label>
              <input type="text" className="input" required placeholder="Juan Pérez"
                value={form.solicitante} onChange={e => setField("solicitante", e.target.value)} />
            </div>
            <div>
              <label className="label">Departamento *</label>
              <input type="text" className="input" required placeholder="Producción"
                value={form.departamento} onChange={e => setField("departamento", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Justificación *</label>
              <textarea className="input" required rows={2} placeholder="Motivo del requerimiento..."
                value={form.justificacion} onChange={e => setField("justificacion", e.target.value)} />
            </div>
            <div>
              <label className="label">Fecha Límite *</label>
              <input type="date" className="input" required
                value={form.fechaNecesidad} onChange={e => setField("fechaNecesidad", e.target.value)} />
            </div>
            <div>
              <label className="label">Observaciones</label>
              <input type="text" className="input" placeholder="Notas adicionales..."
                value={form.observaciones} onChange={e => setField("observaciones", e.target.value)} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="label mb-0">Ítems *</span>
              <button type="button" onClick={addLinea} className="text-xs text-blue-600 hover:text-blue-900 flex items-center gap-1">
                <Plus size={14} /> Agregar ítem
              </button>
            </div>
            <div className="space-y-2">
              {lineas.map((l, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <input type="text" className="input text-sm" placeholder="Descripción *"
                      value={l.descripcion} onChange={e => setLinea(i, "descripcion", e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <input type="number" className="input text-sm" placeholder="Cant. *" min="0.001" step="0.001"
                      value={l.cantidad || ""} onChange={e => setLinea(i, "cantidad", e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <input type="text" className="input text-sm" placeholder="Unidad"
                      value={l.unidad} onChange={e => setLinea(i, "unidad", e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <input type="number" className="input text-sm" placeholder="P. Est." min="0" step="0.01"
                      value={l.precioEstimado || ""} onChange={e => setLinea(i, "precioEstimado", e.target.value)} />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {lineas.length > 1 && (
                      <button type="button" onClick={() => removeLinea(i)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={crear.isPending}>
              {crear.isPending ? "Guardando..." : "Crear Requerimiento"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
