"use client";

import { useState } from "react";
import { UserCog, Search } from "lucide-react";
import { useUsuarios } from "@/hooks/useUsuarios";
import Pagination from "@/components/Pagination";

const ROL_LABEL: Record<string, string> = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Administrador",
  GERENTE: "Gerente",
  VENDEDOR: "Vendedor",
  INVENTARIO: "Inventario",
  CONTADOR: "Contador",
  RRHH: "RRHH",
  PRODUCCION: "Producción",
  VIEWER: "Solo lectura",
};

export default function UsuariosPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useUsuarios({
    page,
    limit: 20,
    search: search || undefined,
  });
  const usuarios = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UserCog size={24} /> Usuarios
        </h1>
        <p className="text-slate-500">{total} usuarios registrados</p>
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
              placeholder="Buscar usuarios..."
              aria-label="Buscar usuarios"
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
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10">
                    Cargando...
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id} className="table-row-hover">
                    <td className="font-medium">{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="badge badge-info">
                        {ROL_LABEL[u.rol] ?? u.rol}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${u.active ? "badge-success" : "badge-secondary"}`}
                      >
                        {u.active ? "Activo" : "Inactivo"}
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
