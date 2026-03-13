"use client";

import { useState } from "react";
import { PackageCheck } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useRecepciones } from "@/hooks/useCompras";
import Pagination from "@/components/Pagination";

export default function RecepcionesPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);

  const { data, isLoading } = useRecepciones({ localId, page, limit: 20 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <PackageCheck size={24} /> Recepciones de Compra
        </h1>
        <p className="text-slate-500">{total} recepciones registradas</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>OC Nº</th>
                <th>Proveedor</th>
                <th>Nº Remito</th>
                <th>Fecha</th>
                <th>Creado por</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">No se encontraron recepciones.</td></tr>
              ) : (
                items.map((r) => (
                  <tr key={r.id} className="table-row-hover">
                    <td className="font-mono text-xs">{r.ordenCompra?.numero ?? "—"}</td>
                    <td className="font-medium">{r.ordenCompra?.proveedor?.name ?? "—"}</td>
                    <td>{r.nroRemito ?? "—"}</td>
                    <td>{new Date(r.fecha).toLocaleDateString()}</td>
                    <td>{r.creadoPor}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
