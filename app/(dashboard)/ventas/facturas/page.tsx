"use client";

import { useState } from "react";
import { FileText, Plus, Ban } from "lucide-react";
import EntitySearchBar from "@/components/EntitySearchBar";
import Link from "next/link";
import { useLocal } from "@/contexts/LocalContext";
import { useFacturas, useAnularFactura } from "@/hooks/useVentas";
import { useApiToast } from "@/hooks/useApiToast";
import Modal from "@/components/Modal";
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
  const [textFilter, setTextFilter] = useState({ key: "numero", value: "" });
  const { handleError, handleSuccess } = useApiToast();
  const anular = useAnularFactura();

  const [anularModal, setAnularModal] = useState<{ id: string; numero: string } | null>(null);
  const [motivo, setMotivo] = useState("");

  const openAnular = (id: string, numero: string) => {
    setMotivo("");
    setAnularModal({ id, numero });
  };

  const handleAnular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anularModal) return;
    try {
      await anular.mutateAsync({ id: anularModal.id, motivo });
      handleSuccess("Factura anulada", `La factura ${anularModal.numero} fue anulada.`);
      setAnularModal(null);
    } catch (err) {
      handleError(err);
    }
  };

  const { data, isLoading } = useFacturas({ localId, limit: 100 });
  const allFacturas = data?.data ?? [];
  const filtered = textFilter.value
    ? allFacturas.filter((f) => {
        const q = textFilter.value.toLowerCase();
        switch (textFilter.key) {
          case "cliente":     return f.cliente?.name?.toLowerCase().includes(q);
          case "fecha":       return f.fecha?.includes(textFilter.value);
          case "vencimiento": return f.fechaVencimiento?.includes(textFilter.value);          case "total":       return String(f.total ?? "").includes(q);
          case "estado":      return f.estado?.toLowerCase().includes(q);          default:            return f.numero?.toLowerCase().includes(q);
        }
      })
    : allFacturas;
  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const facturas = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const total = filtered.length;

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
          <EntitySearchBar
            fields={[
              { key: "numero",      label: "Número",      type: "text" },
              { key: "cliente",     label: "Cliente",      type: "text" },
              { key: "fecha",       label: "Fecha",        type: "date" },
              { key: "vencimiento", label: "Vencimiento",  type: "date" },
              { key: "total",       label: "Total",        type: "number" },
              { key: "estado",      label: "Estado",       type: "select", options: [
                { value: "PENDIENTE", label: "Pendiente" },
                { value: "PARCIAL",   label: "Parcial" },
                { value: "PAGADA",    label: "Pagada" },
                { value: "VENCIDA",   label: "Vencida" },
                { value: "ANULADA",   label: "Anulada" },
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
                <th>Vencimiento</th>
                <th>Total</th>
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
              ) : facturas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
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
                      <td>
                        <div className="flex items-center justify-end">
                          {f.estado !== "ANULADA" && (
                            <button
                              onClick={() => openAnular(f.id, f.numero)}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              title="Anular factura"
                            >
                              <Ban size={14} />
                              Anular
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

      {/* Modal anular */}
      <Modal
        open={!!anularModal}
        title={`Anular factura ${anularModal?.numero ?? ""}`}
        onClose={() => setAnularModal(null)}
      >
        <form onSubmit={handleAnular} className="space-y-4">
          <p className="text-sm text-slate-600">
            Esta acción no se puede deshacer. La factura quedará marcada como{" "}
            <span className="font-semibold text-red-600">ANULADA</span>.
          </p>
          <div>
            <label className="label">Motivo de anulación *</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
              rows={3}
              className="input resize-none"
              placeholder="Describe el motivo de la anulación..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setAnularModal(null)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={anular.isPending || !motivo.trim()}
              className="btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {anular.isPending ? "Anulando..." : "Confirmar anulación"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
