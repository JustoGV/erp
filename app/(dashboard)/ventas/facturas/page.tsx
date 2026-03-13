"use client";

import { useState } from "react";
import { FileText, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useLocal } from "@/contexts/LocalContext";
import { useFacturas } from "@/hooks/useVentas";
import Pagination from "@/components/Pagination";

const ESTADO_CONFIG: Record<string, { class: string; label: string }> = {
  PENDIENTE: { class: "badge-warning", label: "Pendiente" },
  PARCIAL: { class: "badge-info", label: "Parcial" },
  PAGADA: { class: "badge-success", label: "Pagada" },
  VENCIDA: { class: "badge-danger", label: "Vencida" },
  ANULADA: { class: "badge-secondary", label: "Anulada" },
};

export default function FacturasPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useFacturas({
    localId,
    page,
    limit: 20,
    search: search || undefined,
  });
  const facturas = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText size={24} /> Facturas
          </h1>
          <p className="text-slate-500">{total} facturas registradas</p>
        </div>
        <Link href="/ventas/facturas/nueva" className="btn btn-primary">
          <Plus size={18} /> Nueva Factura
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
              placeholder="Buscar facturas..."
              aria-label="Buscar facturas"
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
              ) : facturas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No se encontraron facturas.
                  </td>
                </tr>
              ) : (
                facturas.map((f) => {
                  const est = ESTADO_CONFIG[f.estado] ?? {
                    class: "badge-secondary",
                    label: f.estado,
                  };
                  return (
                    <tr key={f.id} className="table-row-hover">
                      <td className="font-mono text-xs">{f.numero}</td>
                      <td className="font-medium">{f.cliente?.name ?? "—"}</td>
                      <td>{new Date(f.fecha).toLocaleDateString()}</td>
                      <td>
                        {f.fechaVencimiento
                          ? new Date(f.fechaVencimiento).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="text-right font-semibold">
                        ${f.total?.toLocaleString()}
                      </td>
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
