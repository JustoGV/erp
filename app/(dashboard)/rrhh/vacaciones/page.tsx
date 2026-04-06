"use client";

import { useState } from "react";
import { Palmtree, Plus, CheckCircle, XCircle } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import {
  useEmpleados,
  useVacacionesByEmpleado,
  useSolicitarVacaciones,
  useAprobarVacaciones,
  useRechazarVacaciones,
} from "@/hooks/useRRHH";
import { useApiToast } from "@/hooks/useApiToast";
import Modal from "@/components/Modal";

const ESTADO_CONFIG = {
  PENDIENTE: { label: "Pendiente", cls: "badge-warning" },
  APROBADA: { label: "Aprobada", cls: "badge-success" },
  RECHAZADA: { label: "Rechazada", cls: "badge-danger" },
} as const;

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR");
}

export default function VacacionesPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const { handleError, handleSuccess } = useApiToast();

  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState("");
  const [solicitudModalOpen, setSolicitudModalOpen] = useState(false);
  const [rechazarModalOpen, setRechazarModalOpen] = useState(false);
  const [rechazarId, setRechazarId] = useState("");
  const [motivoRechazo, setMotivoRechazo] = useState("");

  const { data: empleadosData } = useEmpleados({ localId, limit: 100 });
  const listaEmpleados = empleadosData?.data ?? [];

  const { data: vacData, isLoading: vacLoading } =
    useVacacionesByEmpleado(selectedEmpleadoId);
  const vacaciones = vacData?.data ?? [];
  const diasTomados = vacData?.resumen?.diasTomados ?? 0;

  const emptyForm = { fechaDesde: "", fechaHasta: "", notas: "" };
  const [form, setForm] = useState(emptyForm);

  const solicitar = useSolicitarVacaciones();
  const aprobar = useAprobarVacaciones();
  const rechazar = useRechazarVacaciones();

  const calcDias = () => {
    if (!form.fechaDesde || !form.fechaHasta) return null;
    const diff =
      new Date(form.fechaHasta).getTime() - new Date(form.fechaDesde).getTime();
    if (diff < 0) return null;
    return Math.floor(diff / 86400000) + 1;
  };

  const handleSolicitar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await solicitar.mutateAsync({
        empleadoId: selectedEmpleadoId,
        fechaDesde: form.fechaDesde,
        fechaHasta: form.fechaHasta,
        notas: form.notas || undefined,
      });
      handleSuccess("Solicitud de vacaciones registrada.");
      setSolicitudModalOpen(false);
      setForm(emptyForm);
    } catch (err) {
      handleError(err);
    }
  };

  const handleAprobar = async (id: string) => {
    try {
      await aprobar.mutateAsync(id);
      handleSuccess("Vacaciones aprobadas.");
    } catch (err) {
      handleError(err);
    }
  };

  const openRechazarModal = (id: string) => {
    setRechazarId(id);
    setMotivoRechazo("");
    setRechazarModalOpen(true);
  };

  const handleRechazar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await rechazar.mutateAsync({ id: rechazarId, motivo: motivoRechazo });
      handleSuccess("Solicitud rechazada.");
      setRechazarModalOpen(false);
    } catch (err) {
      handleError(err);
    }
  };

  const selectedEmpleado = listaEmpleados.find(
    (e) => e.id === selectedEmpleadoId,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Palmtree size={24} /> Vacaciones
        </h1>
        <p className="text-slate-500">Gestión de solicitudes de vacaciones</p>
      </div>

      {/* Selector de empleado */}
      <div className="card p-4">
        <label className="label">Seleccioná un empleado</label>
        <select
          value={selectedEmpleadoId}
          onChange={(e) => setSelectedEmpleadoId(e.target.value)}
          className="input max-w-md"
        >
          <option value="">— Elegí un empleado —</option>
          {listaEmpleados.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.code}) – {emp.position}
            </option>
          ))}
        </select>
      </div>

      {!selectedEmpleadoId && (
        <div className="card p-12 text-center text-slate-400">
          Seleccioná un empleado para ver su historial de vacaciones.
        </div>
      )}

      {selectedEmpleadoId && (
        <>
          {/* Header empleado + resumen */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 text-teal-600 rounded-xl">
                <Palmtree size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {selectedEmpleado?.name}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedEmpleado?.position} · {selectedEmpleado?.department}
                </p>
              </div>
              <div className="ml-6 px-4 py-2 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-700">{diasTomados}</p>
                <p className="text-xs text-blue-500">días tomados</p>
              </div>
            </div>
            <button
              onClick={() => setSolicitudModalOpen(true)}
              className="btn btn-primary"
            >
              <Plus size={18} /> Solicitar Vacaciones
            </button>
          </div>

          {/* Tabla vacaciones */}
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Desde</th>
                    <th>Hasta</th>
                    <th>Días</th>
                    <th>Estado</th>
                    <th>Aprobado por</th>
                    <th>Notas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {vacLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10">
                        Cargando...
                      </td>
                    </tr>
                  ) : vacaciones.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-10 text-slate-400"
                      >
                        No hay solicitudes de vacaciones.
                      </td>
                    </tr>
                  ) : (
                    vacaciones.map((v) => {
                      const estado =
                        ESTADO_CONFIG[v.estado] ?? {
                          label: v.estado,
                          cls: "badge-secondary",
                        };
                      return (
                        <tr key={v.id} className="table-row-hover">
                          <td>{fmtFecha(v.fechaDesde)}</td>
                          <td>{fmtFecha(v.fechaHasta)}</td>
                          <td className="text-right font-semibold">
                            {v.diasHabiles}
                          </td>
                          <td>
                            <span className={`badge ${estado.cls}`}>
                              {estado.label}
                            </span>
                          </td>
                          <td className="text-slate-500">
                            {v.aprobadoPor ?? "—"}
                          </td>
                          <td className="max-w-[180px] truncate text-slate-500">
                            {v.notas ?? "—"}
                          </td>
                          <td>
                            {v.estado === "PENDIENTE" && (
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleAprobar(v.id)}
                                  disabled={aprobar.isPending}
                                  className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-900 disabled:opacity-50"
                                >
                                  <CheckCircle size={13} /> Aprobar
                                </button>
                                <button
                                  onClick={() => openRechazarModal(v.id)}
                                  className="flex items-center gap-1 text-xs text-red-600 hover:text-red-900"
                                >
                                  <XCircle size={13} /> Rechazar
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal Solicitar Vacaciones */}
      <Modal
        open={solicitudModalOpen}
        title="Solicitar Vacaciones"
        onClose={() => {
          setSolicitudModalOpen(false);
          setForm(emptyForm);
        }}
      >
        <form onSubmit={handleSolicitar} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha desde *</label>
              <input
                type="date"
                value={form.fechaDesde}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fechaDesde: e.target.value }))
                }
                required
                className="input"
              />
            </div>
            <div>
              <label className="label">Fecha hasta *</label>
              <input
                type="date"
                value={form.fechaHasta}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fechaHasta: e.target.value }))
                }
                required
                className="input"
              />
            </div>
          </div>

          {calcDias() !== null && (
            <p className="text-sm bg-blue-50 text-blue-700 rounded-lg p-3">
              Duración estimada:{" "}
              <strong>{calcDias()} días corridos</strong>
            </p>
          )}

          <div>
            <label className="label">Notas</label>
            <textarea
              value={form.notas}
              onChange={(e) =>
                setForm((p) => ({ ...p, notas: e.target.value }))
              }
              className="input h-20 resize-none"
              placeholder="Vacaciones de invierno..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setSolicitudModalOpen(false);
                setForm(emptyForm);
              }}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={solicitar.isPending}
              className="btn btn-primary"
            >
              {solicitar.isPending ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Rechazar */}
      <Modal
        open={rechazarModalOpen}
        title="Rechazar Solicitud"
        onClose={() => setRechazarModalOpen(false)}
      >
        <form onSubmit={handleRechazar} className="space-y-4">
          <div>
            <label className="label">Motivo del rechazo *</label>
            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              required
              className="input h-24 resize-none"
              placeholder="Sin personal suficiente en ese período..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setRechazarModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={rechazar.isPending}
              className="btn btn-danger"
            >
              {rechazar.isPending ? "Rechazando..." : "Confirmar Rechazo"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
