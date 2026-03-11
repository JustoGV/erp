"use client";

import { useState } from "react";
import { Banknote } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { usePagosProveedor } from "@/hooks/useCompras";
import Pagination from "@/components/Pagination";

export default function PagosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePagosProveedor({ localId, page, limit: 20 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Banknote size={24} /> Pagos a Proveedores
        </h1>
        <p className="text-slate-500">{total} pagos registrados</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>OC Nº</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Método</th>
                <th>Referencia</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No se encontraron pagos.</td></tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id} className="table-row-hover">
                    <td className="font-medium">{p.ordenCompra?.proveedor?.name ?? "—"}</td>
                    <td className="font-mono text-xs">{p.ordenCompra?.numero ?? "—"}</td>
                    <td>{new Date(p.fecha).toLocaleDateString()}</td>
                    <td className="text-right font-semibold">${p.monto?.toLocaleString()}</td>
                    <td>{p.metodoPago}</td>
                    <td>{p.referencia ?? "—"}</td>
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
