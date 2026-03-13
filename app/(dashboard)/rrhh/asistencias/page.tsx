"use client";

import { useState } from "react";
import { CalendarCheck } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useAsistencias } from "@/hooks/useRRHH";
import Pagination from "@/components/Pagination";

export default function AsistenciasPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAsistencias({ localId, page, limit: 20 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CalendarCheck size={24} /> Asistencias
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
                <th>Entrada</th>
                <th>Salida</th>
                <th>Ausente</th>
                <th>Justificado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No se encontraron registros.</td></tr>
              ) : (
                items.map((a) => (
                  <tr key={a.id} className="table-row-hover">
                    <td>{new Date(a.fecha).toLocaleDateString()}</td>
                    <td className="font-mono text-xs">{a.empleadoId}</td>
                    <td>{a.entrada ?? "—"}</td>
                    <td>{a.salida ?? "—"}</td>
                    <td>
                      {a.ausente ? (
                        <span className="badge badge-danger">Sí</span>
                      ) : (
                        <span className="badge badge-success">No</span>
                      )}
                    </td>
                    <td>
                      {a.justificado ? (
                        <span className="badge badge-info">Sí</span>
                      ) : (
                        <span className="badge badge-secondary">No</span>
                      )}
                    </td>
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
