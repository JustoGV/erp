"use client";

import { useState } from "react";
import { Clock, Plus } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useHoras, useRegistrarHoras, useEmpleados } from "@/hooks/useRRHH";
import { useApiToast } from "@/hooks/useApiToast";
import Pagination from "@/components/Pagination";
import Modal from "@/components/Modal";

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR");
}

export default function HorasPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const { handleError, handleSuccess } = useApiToast();
  const [page, setPage] = useState(1);
  const [filtroEmpleado, setFiltroEmpleado] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useHoras({
    localId,
    page,
    limit: 20,
    empleadoId: filtroEmpleado || undefined,
  });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const { data: empleadosData } = useEmpleados({ localId, limit: 100 });
  const listaEmpleados = empleadosData?.data ?? [];

  const emptyForm = {
    empleadoId: "",
    fecha: "",
    horasNormales: "",
    horasExtra: "",
    descripcion: "",
  };
  const [form, setForm] = useState(emptyForm);
  const registrar = useRegistrarHoras();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registrar.mutateAsync({
        empleadoId: form.empleadoId,
        fecha: form.fecha,
        horasNormales: parseFloat(form.horasNormales),
        horasExtra: form.horasExtra ? parseFloat(form.horasExtra) : undefined,
        descripcion: form.descripcion || undefined,
      });
      handleSuccess("Horas registradas correctamente.");
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
            <Clock size={24} /> Registro de Horas
          </h1>
          <p className="text-slate-500">{total} registros</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Registrar Horas
        </button>
      </div>

      {/* Filtro por empleado */}
      <div className="card p-4 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1 min-w-[240px]">
          <label className="label">Filtrar por empleado</label>
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
        {filtroEmpleado && (
          <button
            onClick={() => {
              setFiltroEmpleado("");
              setPage(1);
            }}
            className="btn btn-secondary text-sm"
          >
            Limpiar filtro
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
                <th>Hs. Normales</th>
                <th>Hs. Extra</th>
                <th>Total</th>
                <th>Descripción</th>
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
                items.map((h) => (
                  <tr key={h.id} className="table-row-hover">
                    <td>{fmtFecha(h.fecha)}</td>
                    <td>
                      <div className="font-medium">
                        {h.empleado?.name ?? "—"}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {h.empleado?.code ?? h.empleadoId.slice(0, 8)}
                      </div>
                    </td>
                    <td className="text-right">{h.horasNormales}</td>
                    <td className="text-right">
                      {h.horasExtra > 0 ? (
                        <span className="font-semibold text-blue-600">
                          {h.horasExtra}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="text-right font-bold">
                      {h.horasNormales + h.horasExtra}
                    </td>
                    <td className="max-w-[200px] truncate text-slate-500">
                      {h.descripcion ?? "—"}
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

      {/* Modal Registrar Horas */}
      <Modal
        open={modalOpen}
        title="Registrar Horas"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Horas normales *</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={form.horasNormales}
                onChange={(e) =>
                  setForm((p) => ({ ...p, horasNormales: e.target.value }))
                }
                required
                className="input"
                placeholder="8"
              />
            </div>
            <div>
              <label className="label">Horas extra</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={form.horasExtra}
                onChange={(e) =>
                  setForm((p) => ({ ...p, horasExtra: e.target.value }))
                }
                className="input"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="label">Descripción</label>
            <input
              type="text"
              value={form.descripcion}
              onChange={(e) =>
                setForm((p) => ({ ...p, descripcion: e.target.value }))
              }
              className="input"
              placeholder="Cierre de mes, guardia nocturna..."
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
              {registrar.isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
