"use client";

import { useState } from "react";
import { CalendarCheck, Plus } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import {
  useAsistencias,
  useRegistrarAsistencia,
  useEmpleados,
} from "@/hooks/useRRHH";
import { useApiToast } from "@/hooks/useApiToast";
import Pagination from "@/components/Pagination";
import Modal from "@/components/Modal";

function fmtHora(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR");
}

export default function AsistenciasPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const { handleError, handleSuccess } = useApiToast();
  const [page, setPage] = useState(1);
  const [filtroEmpleado, setFiltroEmpleado] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useAsistencias({
    localId,
    page,
    limit: 20,
    empleadoId: filtroEmpleado || undefined,
    fecha: filtroFecha || undefined,
  });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const { data: empleadosData } = useEmpleados({ localId, limit: 100 });
  const listaEmpleados = empleadosData?.data ?? [];

  const emptyForm = {
    empleadoId: "",
    fecha: "",
    ausente: false,
    justificado: false,
    entrada: "",
    salida: "",
    notas: "",
  };
  const [form, setForm] = useState(emptyForm);
  const registrar = useRegistrarAsistencia();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registrar.mutateAsync({
        empleadoId: form.empleadoId,
        fecha: form.fecha,
        ausente: form.ausente,
        justificado: form.justificado,
        entrada:
          !form.ausente && form.entrada
            ? new Date(form.entrada).toISOString()
            : undefined,
        salida:
          !form.ausente && form.salida
            ? new Date(form.salida).toISOString()
            : undefined,
        notas: form.notas || undefined,
      });
      handleSuccess("Asistencia registrada.");
      setModalOpen(false);
      setForm(emptyForm);
      setPage(1);
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck size={24} /> Asistencias
          </h1>
          <p className="text-slate-500">{total} registros</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Registrar Asistencia
        </button>
      </div>

      {/* Filtros */}
      <div className="card p-4 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1 min-w-[220px]">
          <label className="label">Empleado</label>
          <select
            value={filtroEmpleado}
            onChange={(e) => {
              setFiltroEmpleado(e.target.value);
              setPage(1);
            }}
            className="input"
          >
            <option value="">Todos los empleados</option>
            {listaEmpleados.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="label">Fecha</label>
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => {
              setFiltroFecha(e.target.value);
              setPage(1);
            }}
            className="input"
          />
        </div>
        {(filtroEmpleado || filtroFecha) && (
          <button
            onClick={() => {
              setFiltroEmpleado("");
              setFiltroFecha("");
              setPage(1);
            }}
            className="btn btn-secondary text-sm"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Empleado</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Estado</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    Cargando...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No se encontraron registros.
                  </td>
                </tr>
              ) : (
                items.map((a) => (
                  <tr key={a.id} className="table-row-hover">
                    <td>{fmtFecha(a.fecha)}</td>
                    <td>
                      <div className="font-medium">
                        {a.empleado?.name ?? "—"}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {a.empleado?.code ?? a.empleadoId.slice(0, 8)}
                      </div>
                    </td>
                    <td>{fmtHora(a.entrada)}</td>
                    <td>{fmtHora(a.salida)}</td>
                    <td>
                      {a.ausente ? (
                        a.justificado ? (
                          <span className="badge badge-info">Justificado</span>
                        ) : (
                          <span className="badge badge-danger">Ausente</span>
                        )
                      ) : (
                        <span className="badge badge-success">Presente</span>
                      )}
                    </td>
                    <td className="max-w-[200px] truncate text-slate-500">
                      {a.notas ?? "—"}
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

      {/* Modal Registrar Asistencia */}
      <Modal
        open={modalOpen}
        title="Registrar Asistencia"
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
            <label className="label">Fecha *</label>
            <input
              type="date"
              value={form.fecha}
              onChange={(e) =>
                setForm((p) => ({ ...p, fecha: e.target.value }))
              }
              required
              className="input"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="ausente"
              checked={form.ausente}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  ausente: e.target.checked,
                  justificado: e.target.checked ? p.justificado : false,
                }))
              }
              className="w-4 h-4 rounded"
            />
            <label htmlFor="ausente" className="label mb-0 cursor-pointer">
              Ausente
            </label>
          </div>

          {form.ausente && (
            <div className="flex items-center gap-3 pl-4">
              <input
                type="checkbox"
                id="justificado"
                checked={form.justificado}
                onChange={(e) =>
                  setForm((p) => ({ ...p, justificado: e.target.checked }))
                }
                className="w-4 h-4 rounded"
              />
              <label
                htmlFor="justificado"
                className="label mb-0 cursor-pointer"
              >
                Justificado
              </label>
            </div>
          )}

          {!form.ausente && (
            <>
              <div>
                <label className="label">Hora de entrada</label>
                <input
                  type="datetime-local"
                  value={form.entrada}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, entrada: e.target.value }))
                  }
                  className="input"
                />
              </div>
              <div>
                <label className="label">Hora de salida</label>
                <input
                  type="datetime-local"
                  value={form.salida}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, salida: e.target.value }))
                  }
                  className="input"
                />
              </div>
            </>
          )}

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
              disabled={registrar.isPending}
              className="btn btn-primary"
            >
              {registrar.isPending ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
