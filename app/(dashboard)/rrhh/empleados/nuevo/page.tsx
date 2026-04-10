"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, User } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useCrearEmpleado } from "@/hooks/useRRHH";
import { useApiToast } from "@/hooks/useApiToast";

export default function NuevoEmpleadoPage() {
  const router = useRouter();
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const { handleError, handleSuccess } = useApiToast();
  const crear = useCrearEmpleado();

  const [form, setForm] = useState({
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

  const set = (key: string, value: string | boolean) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localId) {
      handleError(new Error("Seleccioná un local antes de crear un empleado."));
      return;
    }
    try {
      await crear.mutateAsync({
        dto: {
          code: form.code,
          name: form.name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          position: form.position,
          department: form.department,
          salary: parseFloat(form.salary),
          hireDate: form.hireDate,
          active: form.active,
        },
        localId,
      });
      handleSuccess("Empleado creado correctamente.");
      router.push("/rrhh/empleados");
    } catch (err) {
      handleError(err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/rrhh/empleados"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Nuevo Empleado</h1>
          <p className="text-slate-500">Registrá un nuevo integrante del equipo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <User size={20} />
              </div>
              <h3 className="card-title">Datos del Empleado</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Código *</label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                required
                className="input"
                placeholder="EMP-001"
                maxLength={20}
              />
            </div>

            <div>
              <label className="label">Nombre completo *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="González María Fernanda"
                maxLength={200}
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input"
                placeholder="maria@empresa.com"
              />
            </div>

            <div>
              <label className="label">Teléfono</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="input"
                placeholder="+54 11 1234-5678"
                maxLength={30}
              />
            </div>

            <div>
              <label className="label">Cargo *</label>
              <input
                type="text"
                name="position"
                value={form.position}
                onChange={handleChange}
                required
                className="input"
                placeholder="Asistente Administrativa"
                maxLength={100}
              />
            </div>

            <div>
              <label className="label">Departamento *</label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                required
                className="input"
                placeholder="Administración"
                maxLength={100}
              />
            </div>

            <div>
              <label className="label">Salario bruto *</label>
              <input
                type="number"
                name="salary"
                min={0}
                step={0.01}
                value={form.salary}
                onChange={handleChange}
                required
                className="input"
                placeholder="280000"
              />
            </div>

            <div>
              <label className="label">Fecha de ingreso *</label>
              <input
                type="date"
                name="hireDate"
                value={form.hireDate}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => set("active", e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="active" className="label mb-0 cursor-pointer">
                Empleado activo
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={crear.isPending} className="btn btn-primary">
            <Save size={18} />
            {crear.isPending ? "Guardando..." : "Guardar Empleado"}
          </button>
          <Link href="/rrhh/empleados" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
