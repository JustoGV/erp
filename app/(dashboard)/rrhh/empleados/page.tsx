"use client";

import { useState } from "react";
import { Users, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useLocal } from "@/contexts/LocalContext";
import { useEmpleados } from "@/hooks/useRRHH";
import Pagination from "@/components/Pagination";

export default function EmpleadosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useEmpleados({
    localId,
    page,
    limit: 20,
    search: search || undefined,
  });
  const empleados = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users size={24} /> Empleados
          </h1>
          <p className="text-slate-500">{total} empleados registrados</p>
        </div>
        <Link href="/rrhh/empleados/nuevo" className="btn btn-primary">
          <Plus size={18} /> Nuevo Empleado
        </Link>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Buscar empleados..."
              aria-label="Buscar empleados"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input pl-10"
            />
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Departamento</th>
                <th>Email</th>
                <th>Ingreso</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    Cargando...
                  </td>
                </tr>
              ) : empleados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No se encontraron empleados.
                  </td>
                </tr>
              ) : (
                empleados.map((e) => (
                  <tr key={e.id} className="table-row-hover">
                    <td className="font-mono text-xs">{e.code}</td>
                    <td className="font-medium">{e.name}</td>
                    <td>{e.position}</td>
                    <td>{e.department}</td>
                    <td>{e.email ?? "—"}</td>
                    <td>{new Date(e.hireDate).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`badge ${e.active ? "badge-success" : "badge-secondary"}`}
                      >
                        {e.active ? "Activo" : "Inactivo"}
                      </span>
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
    </div>
  );
}
