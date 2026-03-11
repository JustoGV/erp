"use client";

import { useState } from "react";
import { Warehouse, Search } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useDepositos } from "@/hooks/useInventario";

export default function DepositosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [search, setSearch] = useState("");

  const { data, isLoading } = useDepositos({
    localId,
    search: search || undefined,
  });
  const depositos = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Warehouse size={24} /> Depósitos
        </h1>
        <p className="text-slate-500">
          {depositos.length} depósitos registrados
        </p>
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
              placeholder="Buscar depósitos..."
              aria-label="Buscar depósitos"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                <th>Dirección</th>
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
              ) : depositos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400">
                    No se encontraron depósitos.
                  </td>
                </tr>
              ) : (
                depositos.map((d) => (
                  <tr key={d.id} className="table-row-hover">
                    <td className="font-mono text-xs">{d.code}</td>
                    <td className="font-medium">{d.name}</td>
                    <td>{d.address ?? "—"}</td>
                    <td>
                      <span
                        className={`badge ${d.active ? "badge-success" : "badge-secondary"}`}
                      >
                        {d.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
