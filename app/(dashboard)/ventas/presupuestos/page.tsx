"use client";

import { useState } from "react";
import { FileSpreadsheet, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useLocal } from "@/contexts/LocalContext";
import { usePresupuestos } from "@/hooks/useVentas";
import Pagination from "@/components/Pagination";

const ESTADO_CONFIG: Record<string, { class: string; label: string }> = {
  BORRADOR: { class: "badge-secondary", label: "Borrador" },
  ENVIADO: { class: "badge-info", label: "Enviado" },
  APROBADO: { class: "badge-success", label: "Aprobado" },
  RECHAZADO: { class: "badge-danger", label: "Rechazado" },
  VENCIDO: { class: "badge-warning", label: "Vencido" },
};

export default function PresupuestosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = usePresupuestos({
    localId,
    page,
    limit: 20,
  });
  const presupuestos = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet size={24} /> Presupuestos
          </h1>
          <p className="text-slate-500">{total} presupuestos registrados</p>
        </div>
        <Link href="/ventas/presupuestos/nuevo" className="btn btn-primary">
          <Plus size={18} /> Nuevo Presupuesto
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
              placeholder="Buscar presupuestos..."
              aria-label="Buscar presupuestos"
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
                <th>Número</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Vencimiento</th>
                <th>Total</th>
                <th>Vendedor</th>
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
              ) : presupuestos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No se encontraron presupuestos.
                  </td>
                </tr>
              ) : (
                presupuestos.map((p) => {
                  const est = ESTADO_CONFIG[p.estado] ?? {
                    class: "badge-secondary",
                    label: p.estado,
                  };
                  return (
                    <tr key={p.id} className="table-row-hover">
                      <td className="font-mono text-xs">{p.numero}</td>
                      <td className="font-medium">{p.cliente?.name ?? "—"}</td>
                      <td>{new Date(p.fecha).toLocaleDateString()}</td>
                      <td>
                        {p.fechaVencimiento
                          ? new Date(p.fechaVencimiento).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="text-right font-semibold">
                        ${p.total?.toLocaleString()}
                      </td>
                      <td>{p.vendedor ?? "—"}</td>
                      <td>
                        <span className={`badge ${est.class}`}>
                          {est.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
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
