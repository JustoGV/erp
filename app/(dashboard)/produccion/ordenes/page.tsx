"use client";

import { useState, useMemo } from "react";
import { Factory, Plus, Play, CheckCircle2, XCircle } from "lucide-react";
import {
  useOrdenesProduccion,
  useCrearOrden,
  useIniciarOrden,
  useFinalizarOrden,
  useCancelarOrden,
  useBOMs,
} from "@/hooks/useProduccion";
import { useLocal } from "@/contexts/LocalContext";
import { useApiToast } from "@/hooks/useApiToast";
import Modal from "@/components/Modal";
import type { EstadoOrdenProduccion } from "@/lib/types/produccion";

const ESTADO_CONFIG: Record<EstadoOrdenProduccion, { class: string; label: string }> = {
  PLANIFICADA: { class: "badge-secondary", label: "Planificada" },
  EN_PROCESO:  { class: "badge-info",      label: "En Proceso" },
  COMPLETADA:  { class: "badge-success",   label: "Completada" },
  CANCELADA:   { class: "badge-danger",    label: "Cancelada" },
};

const FILTROS = ["TODOS", "PLANIFICADA", "EN_PROCESO", "COMPLETADA", "CANCELADA"] as const;
type Filtro = typeof FILTROS[number];

export default function OrdenesProduccionPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const { handleError, handleSuccess } = useApiToast();

  const { data, isLoading } = useOrdenesProduccion();
  const ordenes = data?.data ?? [];

  const { data: bomsData } = useBOMs();
  const boms = (bomsData?.data ?? []).filter(b => b.activo);

  const crear = useCrearOrden();
  const iniciar = useIniciarOrden();
  const finalizar = useFinalizarOrden();
  const cancelar = useCancelarOrden();

  const [filtro, setFiltro] = useState<Filtro>("TODOS");
  const [modalOpen, setModalOpen] = useState(false);
  const [finalizarModal, setFinalizarModal] = useState<{ id: string; planificada: number } | null>(null);
  const [cancelarModal, setCancelarModal] = useState<string | null>(null);
  const [cantidadRealizada, setCantidadRealizada] = useState("");
  const [motivo, setMotivo] = useState("");

  const [form, setForm] = useState({
    bomId: "", cantidadPlanificada: "", fechaFinPlanificada: "",
    operador: "", notas: "", costoManoObra: "",
  });
  const setField = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const filtered = useMemo(
    () => filtro === "TODOS" ? ordenes : ordenes.filter(o => o.estado === filtro),
    [ordenes, filtro],
  );

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localId) { handleError(new Error("Seleccioná un local.")); return; }
    try {
      await crear.mutateAsync({
        localId,
        dto: {
          bomId: form.bomId,
          cantidadPlanificada: Number(form.cantidadPlanificada),
          fechaFinPlanificada: form.fechaFinPlanificada,
          operador: form.operador || undefined,
          notas: form.notas || undefined,
          costoManoObra: form.costoManoObra ? Number(form.costoManoObra) : undefined,
        },
      });
      handleSuccess("Orden creada", "La orden de producción fue registrada.");
      setModalOpen(false);
      setForm({ bomId: "", cantidadPlanificada: "", fechaFinPlanificada: "", operador: "", notas: "", costoManoObra: "" });
    } catch (err) {
      handleError(err);
    }
  };

  const handleIniciar = async (id: string) => {
    try {
      await iniciar.mutateAsync(id);
      handleSuccess("Orden iniciada", "La orden pasó a EN_PROCESO y se descontaron los materiales.");
    } catch (err) {
      handleError(err);
    }
  };

  const handleFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalizarModal) return;
    try {
      await finalizar.mutateAsync({ id: finalizarModal.id, dto: { cantidadRealizada: Number(cantidadRealizada) } });
      handleSuccess("Orden completada", "El stock del producto terminado fue actualizado.");
      setFinalizarModal(null);
      setCantidadRealizada("");
    } catch (err) {
      handleError(err);
    }
  };

  const handleCancelar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelarModal) return;
    try {
      await cancelar.mutateAsync({ id: cancelarModal, dto: { motivo } });
      handleSuccess("Orden cancelada", "La orden fue cancelada correctamente.");
      setCancelarModal(null);
      setMotivo("");
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Factory size={24} /> Órdenes de Producción
          </h1>
          <p className="text-slate-500">{ordenes.length} órdenes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Nueva Orden
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200 flex gap-2 overflow-x-auto">
          {FILTROS.map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                filtro === f ? "bg-blue-100 text-blue-700 font-medium" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}>
              {f === "TODOS" ? "Todas" : ESTADO_CONFIG[f as EstadoOrdenProduccion].label}
              {" "}({f === "TODOS" ? ordenes.length : ordenes.filter(o => o.estado === f).length})
            </button>
          ))}
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th className="text-right">Cant. Plan.</th>
                <th className="text-right">Cant. Real.</th>
                <th>Operador</th>
                <th>F. Fin Plan.</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-10">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">No se encontraron órdenes.</td></tr>
              ) : filtered.map((o) => {
                const est = ESTADO_CONFIG[o.estado] ?? { class: "badge-secondary", label: o.estado };
                return (
                  <tr key={o.id} className="table-row-hover">
                    <td className="font-mono text-xs">{o.code ?? o.numero ?? "—"}</td>
                    <td className="font-medium">{o.productoNombre ?? o.bom?.producto?.name ?? "—"}</td>
                    <td className="text-right">{o.cantidadPlanificada}</td>
                    <td className="text-right">{o.cantidadProducida ?? o.cantidadRealizada ?? "—"}</td>
                    <td>{o.operador ?? "—"}</td>
                    <td>{o.fechaFinPlanificada?.slice(0, 10) ?? "—"}</td>
                    <td><span className={`badge ${est.class}`}>{est.label}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        {o.estado === "PLANIFICADA" && (
                          <button onClick={() => handleIniciar(o.id)} disabled={iniciar.isPending}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-900 disabled:opacity-50">
                            <Play size={14} /> Iniciar
                          </button>
                        )}
                        {o.estado === "EN_PROCESO" && (
                          <button onClick={() => { setFinalizarModal({ id: o.id, planificada: o.cantidadPlanificada }); setCantidadRealizada(String(o.cantidadPlanificada)); }}
                            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-900">
                            <CheckCircle2 size={14} /> Finalizar
                          </button>
                        )}
                        {(o.estado === "PLANIFICADA" || o.estado === "EN_PROCESO") && (
                          <button onClick={() => setCancelarModal(o.id)}
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                            <XCircle size={14} /> Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Orden */}
      <Modal open={modalOpen} title="Nueva Orden de Producción" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleCrear} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">BOM (Lista de Materiales) *</label>
              <select className="input" required value={form.bomId} onChange={e => setField("bomId", e.target.value)}>
                <option value="">— Seleccionar BOM —</option>
                {boms.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.code} — {b.productoNombre ?? b.producto?.name ?? ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Cantidad a Producir *</label>
              <input type="number" className="input" required min="0.001" step="0.001"
                value={form.cantidadPlanificada} onChange={e => setField("cantidadPlanificada", e.target.value)} />
            </div>
            <div>
              <label className="label">Fecha Fin Planificada *</label>
              <input type="date" className="input" required
                value={form.fechaFinPlanificada} onChange={e => setField("fechaFinPlanificada", e.target.value)} />
            </div>
            <div>
              <label className="label">Operador</label>
              <input type="text" className="input" placeholder="Nombre del operador"
                value={form.operador} onChange={e => setField("operador", e.target.value)} />
            </div>
            <div>
              <label className="label">Costo Mano de Obra</label>
              <input type="number" className="input" placeholder="0.00" min="0" step="0.01"
                value={form.costoManoObra} onChange={e => setField("costoManoObra", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Notas</label>
              <input type="text" className="input" placeholder="Notas adicionales..."
                value={form.notas} onChange={e => setField("notas", e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={crear.isPending}>
              {crear.isPending ? "Guardando..." : "Crear Orden"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Finalizar */}
      <Modal open={!!finalizarModal} title="Finalizar Orden de Producción" onClose={() => setFinalizarModal(null)}>
        <form onSubmit={handleFinalizar} className="space-y-4">
          <p className="text-sm text-slate-600">
            Cantidad planificada: <strong>{finalizarModal?.planificada}</strong>.<br />
            Ingresá la cantidad efectivamente producida (puede diferir por mermas o rechazos).
          </p>
          <div>
            <label className="label">Cantidad Realizada *</label>
            <input type="number" className="input" required min="0.001" step="0.001"
              value={cantidadRealizada} onChange={e => setCantidadRealizada(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => setFinalizarModal(null)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={finalizar.isPending}>
              {finalizar.isPending ? "Guardando..." : "Confirmar Finalización"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Cancelar */}
      <Modal open={!!cancelarModal} title="Cancelar Orden de Producción" onClose={() => setCancelarModal(null)}>
        <form onSubmit={handleCancelar} className="space-y-4">
          <p className="text-sm text-slate-600">
            Si la orden está EN_PROCESO, los materiales descontados serán reintegrados al stock.
          </p>
          <div>
            <label className="label">Motivo de cancelación *</label>
            <input type="text" className="input" required placeholder="Motivo..."
              value={motivo} onChange={e => setMotivo(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => setCancelarModal(null)}>Volver</button>
            <button type="submit" className="btn btn-primary" disabled={cancelar.isPending}>
              {cancelar.isPending ? "Cancelando..." : "Confirmar Cancelación"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
