"use client";

import { useState } from "react";
import { Truck, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useLocal } from "@/contexts/LocalContext";
import { useProveedores } from "@/hooks/useCompras";
import Pagination from "@/components/Pagination";

export default function ProveedoresPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useProveedores({
    localId,
    page,
    limit: 20,
    search: search || undefined,
  });
  const proveedores = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Truck size={24} /> Proveedores
          </h1>
          <p className="text-slate-500">{total} proveedores registrados</p>
        </div>
        <Link href="/compras/proveedores/nuevo" className="btn btn-primary">
          <Plus size={18} /> Nuevo Proveedor
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
              placeholder="Buscar proveedores..."
              aria-label="Buscar proveedores"
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
                <th>CUIT / RUT</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Cond. Pago</th>
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
              ) : proveedores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No se encontraron proveedores.
                  </td>
                </tr>
              ) : (
                proveedores.map((p) => (
                  <tr key={p.id} className="table-row-hover">
                    <td className="font-mono text-xs">{p.code}</td>
                    <td className="font-medium">{p.name}</td>
                    <td>{p.taxId ?? "—"}</td>
                    <td>{p.email ?? "—"}</td>
                    <td>{p.phone ?? "—"}</td>
                    <td>{p.paymentTerms ?? "—"}</td>
                    <td>
                      <span
                        className={`badge ${p.active ? "badge-success" : "badge-secondary"}`}
                      >
                        {p.active ? "Activo" : "Inactivo"}
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
