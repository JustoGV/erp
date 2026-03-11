"use client";

import { useState } from "react";
import { ClipboardCheck, Search } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import { useRequerimientos } from "@/hooks/useCompras";
import Pagination from "@/components/Pagination";

const ESTADO_CONFIG: Record<string, { class: string; label: string }> = {
  PENDIENTE: { class: "badge-warning", label: "Pendiente" },
  AUTORIZADO: { class: "badge-success", label: "Autorizado" },
  RECHAZADO: { class: "badge-danger", label: "Rechazado" },
  COMPLETADO: { class: "badge-info", label: "Completado" },
  CANCELADO: { class: "badge-secondary", label: "Cancelado" },
};

export default function RequerimientosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);

  const { data, isLoading } = useRequerimientos({ localId, page, limit: 20 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardCheck size={24} /> Requerimientos de Compra
        </h1>
        <p className="text-slate-500">{total} requerimientos registrados</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Solicitante</th>
                <th>Departamento</th>
                <th>Fecha Necesidad</th>
                <th>Ítems</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No se encontraron requerimientos.</td></tr>
              ) : (
                items.map((r) => {
                  const est = ESTADO_CONFIG[r.estado] ?? { class: "badge-secondary", label: r.estado };
                  return (
                    <tr key={r.id} className="table-row-hover">
                      <td className="font-mono text-xs">{r.numero}</td>
                      <td className="font-medium">{r.solicitante}</td>
                      <td>{r.departamento}</td>
                      <td>{new Date(r.fechaNecesidad).toLocaleDateString()}</td>
                      <td className="text-center">{r._count?.items ?? "—"}</td>
                      <td><span className={`badge ${est.class}`}>{est.label}</span></td>
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
