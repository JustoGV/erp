"use client";

import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Filter,
  Download,
  Users,
  ChevronDown,
} from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useState } from "react";
import { useClientes } from "@/hooks/useVentas";
import { useApiToast } from "@/hooks/useApiToast";

export default function ClientesPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const { handleError } = useApiToast();

  const { data, isLoading, isError, error } = useClientes({
    localId: isAllLocales ? undefined : selectedLocal?.id,
    search: search || undefined,
    active: activeFilter === "" ? undefined : activeFilter === "true",
    limit: 50,
  });

  if (isError) handleError(error);

  const clientes = data?.data ?? [];
  const total = data?.meta?.total ?? clientes.length;
  const activeClients = clientes.filter((c) => c.active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="text-slate-600 mt-1 flex items-center gap-2">
            <Users size={16} />
            {total} clientes registrados • {activeClients} activos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <Download size={18} />
            Exportar
          </button>
          <Link href="/ventas/clientes/nuevo" className="btn btn-primary">
            <Plus size={18} />
            Nuevo Cliente
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, email, teléfono o CUIT..."
              aria-label="Buscar clientes"
              className="input pl-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary">
            <Filter size={18} />
            Filtros
            <ChevronDown size={16} />
          </button>
          <select
            className="input min-w-[160px]"
            aria-label="Filtrar por estado"
            value={activeFilter}
            onChange={(e) =>
              setActiveFilter(e.target.value as "" | "true" | "false")
            }
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>CUIT/DNI</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-500">
                  Cargando clientes...
                </td>
              </tr>
            ) : clientes.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-400">
                  No se encontraron clientes.
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.id} className="table-row-hover">
                  <td>
                    <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                      {cliente.code}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-sm">
                        {cliente.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {cliente.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {cliente.address ?? cliente.city ?? ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-sm">{cliente.taxId ?? "-"}</td>
                  <td className="text-slate-700">{cliente.email ?? "-"}</td>
                  <td className="text-slate-700">{cliente.phone ?? "-"}</td>
                  <td>
                    <span
                      className={`badge ${cliente.active ? "badge-success" : "badge-neutral"}`}
                    >
                      {cliente.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/ventas/clientes/${cliente.id}`}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-600">
          Mostrando <span className="font-semibold">{clientes.length}</span> de{" "}
          <span className="font-semibold">{total}</span> clientes
        </p>
        <div className="flex gap-2">
          <button className="btn btn-secondary" disabled>
            Anterior
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
            1
          </button>
          <button className="btn btn-secondary" disabled>
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
