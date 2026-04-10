"use client";

import { useState } from "react";
import { Receipt, Plus, CheckCircle, Eye } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import {
  useLiquidaciones,
  useLiquidacion,
  useCrearLiquidacion,
  useAprobarLiquidacion,
  useEmpleados,
} from "@/hooks/useRRHH";
import { useApiToast } from "@/hooks/useApiToast";
import Pagination from "@/components/Pagination";
import Modal from "@/components/Modal";

function fmtMoneda(n?: number) {
  return `$${parseFloat(String(n ?? 0)).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function LiquidacionesPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const { handleError, handleSuccess } = useApiToast();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useLiquidaciones({ localId, page, limit: 20 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const { data: empleadosData } = useEmpleados({ localId, limit: 100 });
  const listaEmpleados = empleadosData?.data ?? [];

  const emptyForm = {
    empleadoId: "",
    periodo: "",
    sueldobruto: "",
    deducciones: "",
    fechaPago: "",
    notas: "",
  };
  const [form, setForm] = useState(emptyForm);
  const crear = useCrearLiquidacion();
  const aprobar = useAprobarLiquidacion();

  const [detailId, setDetailId] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const { data: detailData } = useLiquidacion(detailId);
  const liqDetail = detailData?.data;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crear.mutateAsync({
        empleadoId: form.empleadoId,
        periodo: form.periodo,
        sueldobruto: parseFloat(form.sueldobruto),
        deducciones: form.deducciones ? parseFloat(form.deducciones) : undefined,
        fechaPago: form.fechaPago || undefined,
        notas: form.notas || undefined,
      });
      handleSuccess("Liquidación creada correctamente.");
      setModalOpen(false);
      setForm(emptyForm);
      setPage(1);
    } catch (err) {
      handleError(err);
    }
  };

  const handleAprobar = async (id: string) => {
    try {
      await aprobar.mutateAsync(id);
      handleSuccess("Liquidación aprobada.");
    } catch (err) {
      handleError(err);
    }
  };

  const netoEstimado =
    parseFloat(form.sueldobruto || "0") - parseFloat(form.deducciones || "0");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt size={24} /> Liquidaciones de Sueldo
          </h1>
          <p className="text-slate-500">{total} liquidaciones</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Nueva Liquidación
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Período</th>
                <th>Bruto</th>
                <th>Deducciones</th>
                <th>Neto</th>
                <th>F. Pago</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    Cargando...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No se encontraron liquidaciones.
                  </td>
                </tr>
              ) : (
                items.map((l) => (
                  <tr key={l.id} className="table-row-hover">
                    <td>
                      <div className="font-medium">
                        {l.empleado?.name ?? l.empleadoId.slice(0, 8)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {l.empleado?.position}
                      </div>
                    </td>
                    <td className="font-mono">{l.periodo}</td>
                    <td className="text-right">{fmtMoneda(l.sueldobruto)}</td>
                    <td className="text-right text-red-600">
                      − {fmtMoneda(l.deducciones)}
                    </td>
                    <td className="text-right font-semibold">
                      {fmtMoneda(l.sueldoNeto)}
                    </td>
                    <td className="text-slate-500">
                      {l.fechaPago
                        ? new Date(l.fechaPago).toLocaleDateString("es-AR")
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={`badge ${l.estado === "APROBADA" ? "badge-success" : "badge-warning"}`}
                      >
                        {l.estado === "APROBADA" ? "Aprobada" : "Borrador"}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => { setDetailId(l.id); setDetailOpen(true); }}
                          className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
                        >
                          <Eye size={14} /> Ver
                        </button>
                        {l.estado === "BORRADOR" && (
                          <button
                            onClick={() => handleAprobar(l.id)}
                            disabled={aprobar.isPending}
                            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-900 disabled:opacity-50"
                          >
                            <CheckCircle size={14} /> Aprobar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Modal Nueva Liquidación */}
      <Modal
        open={modalOpen}
        title="Nueva Liquidación"
        onClose={() => {
          setModalOpen(false);
          setForm(emptyForm);
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Empleado *</label>
            <select
              value={form.empleadoId}
              onChange={(e) =>
                setForm((p) => ({ ...p, empleadoId: e.target.value }))
              }
              required
              className="input"
            >
              <option value="">Seleccioná un empleado...</option>
              {listaEmpleados.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Período * (YYYY-MM)</label>
            <input
              type="month"
              value={form.periodo}
              onChange={(e) =>
                setForm((p) => ({ ...p, periodo: e.target.value }))
              }
              required
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Sueldo bruto *</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.sueldobruto}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sueldobruto: e.target.value }))
                }
                required
                className="input"
                placeholder="280000"
              />
            </div>
            <div>
              <label className="label">Deducciones</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.deducciones}
                onChange={(e) =>
                  setForm((p) => ({ ...p, deducciones: e.target.value }))
                }
                className="input"
                placeholder="0"
              />
            </div>
          </div>

          {form.sueldobruto && (
            <p className="text-sm bg-slate-50 text-slate-700 rounded-lg p-3">
              Sueldo neto estimado:{" "}
              <strong className="text-slate-900">{fmtMoneda(netoEstimado)}</strong>
            </p>
          )}

          <div>
            <label className="label">Fecha de pago</label>
            <input
              type="date"
              value={form.fechaPago}
              onChange={(e) =>
                setForm((p) => ({ ...p, fechaPago: e.target.value }))
              }
              className="input"
            />
          </div>

          <div>
            <label className="label">Notas</label>
            <textarea
              value={form.notas}
              onChange={(e) =>
                setForm((p) => ({ ...p, notas: e.target.value }))
              }
              className="input h-20 resize-none"
              placeholder="Observaciones adicionales..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setForm(emptyForm);
              }}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={crear.isPending}
              className="btn btn-primary"
            >
              {crear.isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detalle Liquidación */}
      <Modal
        open={detailOpen}
        title="Detalle de Liquidación"
        onClose={() => { setDetailOpen(false); setDetailId(""); }}
      >
        {!liqDetail ? (
          <p className="text-center text-slate-400 py-6">Cargando...</p>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="bg-slate-50 rounded-lg p-4 space-y-1">
              <p className="font-semibold text-slate-900 text-base">{liqDetail.empleado?.name}</p>
              <p className="text-slate-500">{liqDetail.empleado?.position} · {liqDetail.empleado?.department}</p>
              <p className="text-xs text-slate-400 font-mono">{liqDetail.empleado?.code}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500 mb-1">Período</p>
                <p className="font-semibold font-mono">{liqDetail.periodo}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Estado</p>
                <span className={`badge ${liqDetail.estado === "APROBADA" ? "badge-success" : "badge-warning"}`}>
                  {liqDetail.estado === "APROBADA" ? "Aprobada" : "Borrador"}
                </span>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Sueldo bruto</p>
                <p className="font-semibold text-slate-900">{fmtMoneda(liqDetail.sueldobruto)}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Deducciones</p>
                <p className="font-semibold text-red-600">− {fmtMoneda(liqDetail.deducciones)}</p>
              </div>
              <div className="col-span-2 bg-emerald-50 rounded-lg p-3">
                <p className="text-slate-500 mb-1">Sueldo neto</p>
                <p className="text-xl font-bold text-emerald-700">{fmtMoneda(liqDetail.sueldoNeto)}</p>
              </div>
              {liqDetail.fechaPago && (
                <div>
                  <p className="text-slate-500 mb-1">Fecha de pago</p>
                  <p>{new Date(liqDetail.fechaPago).toLocaleDateString("es-AR")}</p>
                </div>
              )}
              {liqDetail.notas && (
                <div className="col-span-2">
                  <p className="text-slate-500 mb-1">Notas</p>
                  <p className="text-slate-700">{liqDetail.notas}</p>
                </div>
              )}
            </div>
            {liqDetail.estado === "BORRADOR" && (
              <div className="flex justify-end pt-2 border-t border-slate-200">
                <button
                  onClick={async () => {
                    await handleAprobar(liqDetail.id);
                    setDetailOpen(false);
                  }}
                  disabled={aprobar.isPending}
                  className="btn btn-primary"
                >
                  <CheckCircle size={16} /> Aprobar
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
