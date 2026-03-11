"use client";

import { useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useMovimientosStock } from "@/hooks/useInventario";
import Pagination from "@/components/Pagination";

const TIPO_LABEL: Record<string, { label: string; class: string }> = {
  ENTRADA: { label: "Entrada", class: "badge-success" },
  SALIDA: { label: "Salida", class: "badge-danger" },
  AJUSTE: { label: "Ajuste", class: "badge-warning" },
  TRANSFERENCIA: { label: "Transferencia", class: "badge-info" },
};

export default function MovimientosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMovimientosStock({ localId, page, limit: 20 });
  const movimientos = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ArrowDownUp size={24} /> Movimientos de Stock
        </h1>
        <p className="text-slate-500">{total} movimientos registrados</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Local</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10">Cargando...</td></tr>
              ) : movimientos.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">No se encontraron movimientos.</td></tr>
              ) : (
                movimientos.map((m) => {
                  const tipo = TIPO_LABEL[m.tipo] ?? { label: m.tipo, class: "badge-secondary" };
                  return (
                    <tr key={m.id} className="table-row-hover">
                      <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td><span className={`badge ${tipo.class}`}>{tipo.label}</span></td>
                      <td className="font-medium">{m.producto?.name ?? m.productoId}</td>
                      <td className="text-right font-semibold">{m.cantidad}</td>
                      <td>{m.local?.name ?? "—"}</td>
                    </tr>
                  );
                })
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
