"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Save,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Clock,
  CalendarCheck,
  Receipt,
  Palmtree,
} from "lucide-react";
import {
  useEmpleado,
  useResumenHoras,
  useActualizarEmpleado,
} from "@/hooks/useRRHH";
import { useApiToast } from "@/hooks/useApiToast";
import Modal from "@/components/Modal";

function fmtMoneda(n: number) {
  return `$${parseFloat(String(n)).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function EmpleadoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { handleError, handleSuccess } = useApiToast();

  const { data: empleadoRes, isLoading } = useEmpleado(id);
  const empleado = empleadoRes?.data;

  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [anio, setAnio] = useState(now.getFullYear());

  const { data: resumenRes, isLoading: resumenLoading } = useResumenHoras(
    id,
    mes,
    anio,
  );
  const resumen = resumenRes?.data;

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    code: "",
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    salary: "",
    hireDate: "",
    active: true,
  });

  const actualizar = useActualizarEmpleado();

  const openEdit = () => {
    if (!empleado) return;
    setEditForm({
      code: empleado.code,
      name: empleado.name,
      email: empleado.email ?? "",
      phone: empleado.phone ?? "",
      position: empleado.position,
      department: empleado.department,
      salary: String(empleado.salary),
      hireDate: empleado.hireDate.slice(0, 10),
      active: empleado.active,
    });
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await actualizar.mutateAsync({
        id,
        dto: {
          code: editForm.code,
          name: editForm.name,
          email: editForm.email || undefined,
          phone: editForm.phone || undefined,
          position: editForm.position,
          department: editForm.department,
          salary: parseFloat(editForm.salary),
          hireDate: editForm.hireDate,
          active: editForm.active,
        },
      });
      handleSuccess("Empleado actualizado correctamente.");
      setEditOpen(false);
    } catch (err) {
      handleError(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        Cargando...
      </div>
    );
  }

  if (!empleado) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
        <p>Empleado no encontrado.</p>
        <Link href="/rrhh/empleados" className="btn btn-secondary">
          Volver
        </Link>
      </div>
    );
  }

  const stats = [
    {
      label: "Asistencias",
      value: empleado._count?.asistencias ?? 0,
      icon: CalendarCheck,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Reg. Horas",
      value: empleado._count?.horas ?? 0,
      icon: Clock,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Liquidaciones",
      value: empleado._count?.liquidaciones ?? 0,
      icon: Receipt,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Vacaciones",
      value: empleado._count?.vacaciones ?? 0,
      icon: Palmtree,
      color: "bg-teal-100 text-teal-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/rrhh/empleados"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {empleado.name}
            </h1>
            <p className="text-slate-500">
              {empleado.code} · {empleado.position} · {empleado.department}
            </p>
          </div>
          <span
            className={`badge ${empleado.active ? "badge-success" : "badge-secondary"}`}
          >
            {empleado.active ? "Activo" : "Inactivo"}
          </span>
        </div>
        <button onClick={openEdit} className="btn btn-primary">
          <Pencil size={18} /> Editar
        </button>
      </div>

      {/* Info + Stats grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee info card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <User size={18} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Información del Empleado
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5 text-sm">
            <div>
              <p className="text-slate-500 font-medium mb-1 flex items-center gap-1">
                <User size={13} /> Nombre completo
              </p>
              <p className="text-slate-900 font-medium">{empleado.name}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium mb-1">Código</p>
              <p className="text-slate-900 font-mono">{empleado.code}</p>
            </div>
            {empleado.email && (
              <div>
                <p className="text-slate-500 font-medium mb-1 flex items-center gap-1">
                  <Mail size={13} /> Email
                </p>
                <p className="text-slate-900">{empleado.email}</p>
              </div>
            )}
            {empleado.phone && (
              <div>
                <p className="text-slate-500 font-medium mb-1 flex items-center gap-1">
                  <Phone size={13} /> Teléfono
                </p>
                <p className="text-slate-900">{empleado.phone}</p>
              </div>
            )}
            <div>
              <p className="text-slate-500 font-medium mb-1 flex items-center gap-1">
                <Briefcase size={13} /> Cargo
              </p>
              <p className="text-slate-900">{empleado.position}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium mb-1">Departamento</p>
              <p className="text-slate-900">{empleado.department}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium mb-1">Salario bruto</p>
              <p className="text-slate-900 font-semibold text-base">
                {fmtMoneda(empleado.salary)}
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-medium mb-1 flex items-center gap-1">
                <Calendar size={13} /> Fecha de ingreso
              </p>
              <p className="text-slate-900">
                {new Date(empleado.hireDate).toLocaleDateString("es-AR")}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 content-start">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${color}`}>
                  <Icon size={16} />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {label}
                </span>
              </div>
              <span className="text-2xl font-bold text-slate-900">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen Horas */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Clock size={18} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Resumen de Horas y Asistencias
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="input w-auto text-sm py-1.5"
            >
              {MESES.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              min={2020}
              max={2099}
              className="input w-24 text-sm py-1.5"
            />
          </div>
        </div>

        {resumenLoading ? (
          <p className="text-center text-slate-400 py-8">Cargando resumen...</p>
        ) : !resumen ? (
          <p className="text-center text-slate-400 py-8">
            Sin datos para el período seleccionado.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                label: "Período",
                value: resumen.periodo,
                cls: "text-slate-700",
              },
              {
                label: "Hs. Normales",
                value: resumen.totalHorasNormales,
                cls: "text-slate-900",
              },
              {
                label: "Hs. Extra",
                value: resumen.totalHorasExtra,
                cls: "text-blue-700 font-bold",
              },
              {
                label: "Días Presente",
                value: resumen.diasPresente,
                cls: "text-emerald-700 font-bold",
              },
              {
                label: "Días Ausente",
                value: resumen.diasAusente,
                cls: "text-red-600 font-bold",
              },
              {
                label: "Justificados",
                value: resumen.diasJustificados,
                cls: "text-amber-600 font-bold",
              },
            ].map(({ label, value, cls }) => (
              <div
                key={label}
                className="text-center bg-slate-50 rounded-lg p-4"
              >
                <p className="text-xs text-slate-500 mb-2">{label}</p>
                <p className={`text-2xl font-semibold ${cls}`}>{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        open={editOpen}
        title="Editar Empleado"
        onClose={() => setEditOpen(false)}
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Código *</label>
              <input
                type="text"
                value={editForm.code}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, code: e.target.value }))
                }
                required
                className="input"
                maxLength={20}
              />
            </div>
            <div>
              <label className="label">Nombre completo *</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, name: e.target.value }))
                }
                required
                className="input"
                maxLength={200}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, email: e.target.value }))
                }
                className="input"
              />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, phone: e.target.value }))
                }
                className="input"
                maxLength={30}
              />
            </div>
            <div>
              <label className="label">Cargo *</label>
              <input
                type="text"
                value={editForm.position}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, position: e.target.value }))
                }
                required
                className="input"
                maxLength={100}
              />
            </div>
            <div>
              <label className="label">Departamento *</label>
              <input
                type="text"
                value={editForm.department}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, department: e.target.value }))
                }
                required
                className="input"
                maxLength={100}
              />
            </div>
            <div>
              <label className="label">Salario bruto *</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={editForm.salary}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, salary: e.target.value }))
                }
                required
                className="input"
              />
            </div>
            <div>
              <label className="label">Fecha de ingreso *</label>
              <input
                type="date"
                value={editForm.hireDate}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, hireDate: e.target.value }))
                }
                required
                className="input"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="editActive"
              checked={editForm.active}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, active: e.target.checked }))
              }
              className="w-4 h-4 rounded"
            />
            <label htmlFor="editActive" className="label mb-0 cursor-pointer">
              Empleado activo
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={actualizar.isPending}
              className="btn btn-primary"
            >
              <Save size={16} />
              {actualizar.isPending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
