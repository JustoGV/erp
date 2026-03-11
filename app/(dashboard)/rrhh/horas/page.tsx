"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useHoras } from "@/hooks/useRRHH";
import Pagination from "@/components/Pagination";

export default function HorasPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);

  const { data, isLoading } = useHoras({ localId, page, limit: 20 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Clock size={24} /> Registro de Horas
        </h1>
        <p className="text-slate-500">{total} registros</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Empleado ID</th>
                <th>Horas Normales</th>
                <th>Horas Extra</th>
                <th>Total</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No se encontraron registros.</td></tr>
              ) : (
                items.map((h) => (
                  <tr key={h.id} className="table-row-hover">
                    <td>{new Date(h.fecha).toLocaleDateString()}</td>
                    <td className="font-mono text-xs">{h.empleadoId}</td>
                    <td className="text-right">{h.horasNormales}</td>
                    <td className="text-right font-semibold text-blue-600">{h.horasExtra}</td>
                    <td className="text-right font-bold">{h.horasNormales + h.horasExtra}</td>
                    <td className="truncate max-w-[200px]">{h.descripcion ?? "—"}</td>
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
