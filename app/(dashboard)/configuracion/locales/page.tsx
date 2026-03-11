"use client";

import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { useLocales } from "@/hooks/useLocales";
import Pagination from "@/components/Pagination";

export default function LocalesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useLocales({
    page,
    limit: 20,
    search: search || undefined,
  });
  const locales = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MapPin size={24} /> Locales / Sucursales
        </h1>
        <p className="text-slate-500">{total} locales registrados</p>
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
              placeholder="Buscar locales..."
              aria-label="Buscar locales"
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
                <th>Ciudad</th>
                <th>Responsable</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    Cargando...
                  </td>
                </tr>
              ) : locales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    No se encontraron locales.
                  </td>
                </tr>
              ) : (
                locales.map((l) => (
                  <tr key={l.id} className="table-row-hover">
                    <td className="font-mono text-xs">{l.code}</td>
                    <td className="font-medium">{l.name}</td>
                    <td>{l.city ?? "—"}</td>
                    <td>{l.manager ?? "—"}</td>
                    <td>
                      <span
                        className={`badge ${l.active ? "badge-success" : "badge-secondary"}`}
                      >
                        {l.active ? "Activo" : "Inactivo"}
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
