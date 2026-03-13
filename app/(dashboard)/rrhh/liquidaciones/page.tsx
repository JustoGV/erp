"use client";

import { useState } from "react";
import { Receipt } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useLiquidaciones } from "@/hooks/useRRHH";
import Pagination from "@/components/Pagination";

export default function LiquidacionesPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);

  const { data, isLoading } = useLiquidaciones({ localId, page, limit: 20 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Receipt size={24} /> Liquidaciones de Sueldo
        </h1>
        <p className="text-slate-500">{total} liquidaciones</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Período</th>
                <th>Sueldo Bruto</th>
                <th>Deducciones</th>
                <th>Neto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    Cargando...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No se encontraron liquidaciones.
                  </td>
                </tr>
              ) : (
                items.map((l) => (
                  <tr key={l.id} className="table-row-hover">
                    <td className="font-medium">
                      {l.empleado?.name ?? l.empleadoId}
                    </td>
                    <td>{l.periodo}</td>
                    <td className="text-right">
                      ${l.sueldobruto?.toLocaleString()}
                    </td>
                    <td className="text-right text-red-600">
                      ${l.deducciones?.toLocaleString()}
                    </td>
                    <td className="text-right font-semibold">
                      ${l.sueldoNeto?.toLocaleString()}
                    </td>
                    <td>
                      <span
                        className={`badge ${l.estado === "APROBADA" ? "badge-success" : "badge-warning"}`}
                      >
                        {l.estado === "APROBADA" ? "Aprobada" : "Borrador"}
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
