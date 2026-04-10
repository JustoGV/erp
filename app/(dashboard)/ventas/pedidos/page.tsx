"use client";

import { useState } from "react";
import { ClipboardList, CheckCircle, Plus } from "lucide-react";
import EntitySearchBar from "@/components/EntitySearchBar";
import Link from "next/link";
import { useLocal } from "@/contexts/LocalContext";
import { usePedidos, useAprobarPedido } from "@/hooks/useVentas";
import { useApiToast } from "@/hooks/useApiToast";
import Pagination from "@/components/Pagination";

const ESTADO_CONFIG: Record<string, { class: string; label: string }> = {
  PENDIENTE: { class: "badge-warning", label: "Pendiente" },
  CONFIRMADO: { class: "badge-info", label: "Confirmado" },
  EN_PREPARACION: { class: "badge-info", label: "En preparación" },
  LISTO: { class: "badge-success", label: "Listo" },
  ENVIADO: { class: "badge-info", label: "Enviado" },
  ENTREGADO: { class: "badge-success", label: "Entregado" },
  CANCELADO: { class: "badge-danger", label: "Cancelado" },
};

export default function PedidosPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const [page, setPage] = useState(1);
  const [textFilter, setTextFilter] = useState({ key: "numero", value: "" });
  const { handleError, handleSuccess } = useApiToast();
  const aprobar = useAprobarPedido();

  const handleAprobar = async (id: string) => {
    try {
      await aprobar.mutateAsync(id);
      handleSuccess("Pedido aprobado", "El pedido pasó a estado CONFIRMADO.");
    } catch (err) {
      handleError(err);
    }
  };

  const { data, isLoading } = usePedidos({ localId, limit: 100 });
  const allPedidos = data?.data ?? [];
  const filtered = textFilter.value
    ? allPedidos.filter((p) => {
        const q = textFilter.value.toLowerCase();
        switch (textFilter.key) {
          case "cliente":  return p.cliente?.name?.toLowerCase().includes(q);
          case "fecha":    return p.fecha?.includes(textFilter.value);
          case "total":    return String(p.total ?? "").includes(q);
          case "vendedor": return (p.vendedor ?? "").toLowerCase().includes(q);
          case "estado":   return p.estado?.toLowerCase().includes(q);
          default:         return p.numero?.toLowerCase().includes(q);
        }
      })
    : allPedidos;
  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pedidos = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const total = filtered.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList size={24} /> Pedidos de Venta
          </h1>
          <p className="text-slate-500">{total} pedidos registrados</p>
        </div>
        {!isAllLocales && (
          <Link href="/ventas/pedidos/nuevo" className="btn btn-primary">
            <Plus size={18} /> Nuevo Pedido
          </Link>
        )}
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <EntitySearchBar
            fields={[
              { key: "numero",   label: "Número",   type: "text" },
              { key: "cliente",  label: "Cliente",   type: "text" },
              { key: "fecha",    label: "Fecha",     type: "date" },
              { key: "total",    label: "Total",     type: "number" },
              { key: "vendedor", label: "Vendedor",  type: "text" },
              { key: "estado",   label: "Estado",    type: "select", options: [
                { value: "PENDIENTE",       label: "Pendiente" },
                { value: "CONFIRMADO",      label: "Confirmado" },
                { value: "EN_PREPARACION",  label: "En preparación" },
                { value: "LISTO",           label: "Listo" },
                { value: "ENVIADO",         label: "Enviado" },
                { value: "ENTREGADO",       label: "Entregado" },
                { value: "CANCELADO",       label: "Cancelado" },
              ]},
            ]}
            onSearch={(key, value) => { setTextFilter({ key, value }); setPage(1); }}
          />
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Vendedor</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    Cargando...
                  </td>
                </tr>
              ) : pedidos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No se encontraron pedidos.
                  </td>
                </tr>
              ) : (
                pedidos.map((p) => {
                  const est = ESTADO_CONFIG[p.estado] ?? {
                    class: "badge-secondary",
                    label: p.estado,
                  };
                  return (
                    <tr key={p.id} className="table-row-hover">
                      <td>
                        <Link
                          href={`/ventas/pedidos/${p.id}`}
                          className="font-mono text-xs text-blue-600 hover:underline"
                        >
                          {p.numero}
                        </Link>
                      </td>
                      <td className="font-medium">{p.cliente?.name ?? "—"}</td>
                      <td>{new Date(p.fecha).toLocaleDateString()}</td>
                      <td className="text-right font-semibold">
                        ${p.total?.toLocaleString()}
                      </td>
                      <td>{p.vendedor ?? "—"}</td>
                      <td>
                        <span className={`badge ${est.class}`}>
                          {est.label}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end">
                          {p.estado === "PENDIENTE" && (
                            <button
                              onClick={() => handleAprobar(p.id)}
                              disabled={aprobar.isPending}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                              title="Aprobar pedido"
                            >
                              <CheckCircle size={14} />
                              Aprobar
                            </button>
                          )}
                        </div>
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
