"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FileSpreadsheet, Plus, ArrowRightCircle, ChevronDown } from "lucide-react";
import EntitySearchBar from "@/components/EntitySearchBar";
import Link from "next/link";
import { useLocal } from "@/contexts/LocalContext";
import {
  usePresupuestos,
  useConvertirPresupuesto,
  useCambiarEstadoPresupuesto,
} from "@/hooks/useVentas";
import { useApiToast } from "@/hooks/useApiToast";
import Pagination from "@/components/Pagination";
import type { EstadoPresupuesto } from "@/lib/api-types";

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
  const [textFilter, setTextFilter] = useState({ key: "numero", value: "" });
  const { handleError, handleSuccess } = useApiToast();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggleDropdown = (id: string, btn: HTMLButtonElement) => {
    if (openDropdown === id) {
      setOpenDropdown(null);
      return;
    }
    const rect = btn.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setOpenDropdown(id);
  };

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    if (openDropdown) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [openDropdown]);

  const convertir = useConvertirPresupuesto();
  const cambiarEstado = useCambiarEstadoPresupuesto();

  const { data, isLoading } = usePresupuestos({ localId, limit: 100 });
  const allPresupuestos = data?.data ?? [];
  const filtered = textFilter.value
    ? allPresupuestos.filter((p) => {
        const q = textFilter.value.toLowerCase();
        switch (textFilter.key) {
          case "cliente":    return p.cliente?.name?.toLowerCase().includes(q);
          case "fecha":      return p.fecha?.includes(textFilter.value);
          case "vencimiento":return p.fechaVencimiento?.includes(textFilter.value);
          case "total":      return String(p.total ?? "").includes(q);
          case "vendedor":   return (p.vendedor ?? "").toLowerCase().includes(q);
          case "estado":     return p.estado?.toLowerCase().includes(q);
          default:           return p.numero?.toLowerCase().includes(q);
        }
      })
    : allPresupuestos;
  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const presupuestos = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const total = filtered.length;

  const handleConvertir = async (id: string) => {
    try {
      await convertir.mutateAsync(id);
      handleSuccess("Pedido creado", "El presupuesto fue convertido a pedido.");
    } catch (err) {
      handleError(err);
    }
  };

  const handleCambiarEstado = async (id: string, estado: EstadoPresupuesto) => {
    try {
      await cambiarEstado.mutateAsync({ id, estado });
      handleSuccess("Estado actualizado", `El presupuesto pasó a ${estado}.`);
    } catch (err) {
      handleError(err);
    }
  };

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
          <EntitySearchBar
            fields={[
              { key: "numero",      label: "Número",      type: "text" },
              { key: "cliente",     label: "Cliente",      type: "text" },
              { key: "fecha",       label: "Fecha",        type: "date" },
              { key: "vencimiento", label: "Vencimiento",  type: "date" },
              { key: "total",       label: "Total",        type: "number" },
              { key: "vendedor",    label: "Vendedor",     type: "text" },
              { key: "estado",      label: "Estado",       type: "select", options: [
                { value: "BORRADOR",   label: "Borrador" },
                { value: "ENVIADO",    label: "Enviado" },
                { value: "APROBADO",   label: "Aprobado" },
                { value: "RECHAZADO",  label: "Rechazado" },
                { value: "VENCIDO",    label: "Vencido" },
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
                <th>Vendedor</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    Cargando...
                  </td>
                </tr>
              ) : presupuestos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No se encontraron presupuestos.
                  </td>
                </tr>
              ) : (
                presupuestos.map((p) => {
                  const est = ESTADO_CONFIG[p.estado] ?? {
                    class: "badge-secondary",
                    label: p.estado,
                  };
                  const isPending = convertir.isPending || cambiarEstado.isPending;
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
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          {p.estado === "APROBADO" && (
                            <button
                              onClick={() => handleConvertir(p.id)}
                              disabled={isPending}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                              title="Convertir a Pedido"
                            >
                              <ArrowRightCircle size={14} />
                              Convertir
                            </button>
                          )}
                          {(p.estado === "BORRADOR" || p.estado === "ENVIADO") && (
                            <div className="relative">
                              <button
                                onClick={(e) => handleToggleDropdown(p.id, e.currentTarget)}
                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                title="Cambiar estado"
                              >
                                <ChevronDown size={14} /> Estado
                              </button>
                            </div>
                          )}
                          {openDropdown === p.id && typeof window !== "undefined" && createPortal(
                            <div
                              ref={dropdownRef}
                              style={{ position: "fixed", top: dropdownPos.top, right: dropdownPos.right }}
                              className="w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-[9999]"
                            >
                              {p.estado === "BORRADOR" && (
                                <button
                                  onClick={() => { handleCambiarEstado(p.id, "ENVIADO"); setOpenDropdown(null); }}
                                  disabled={isPending}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-slate-700"
                                >
                                  Marcar Enviado
                                </button>
                              )}
                              {p.estado === "ENVIADO" && (
                                <>
                                  <button
                                    onClick={() => { handleCambiarEstado(p.id, "APROBADO"); setOpenDropdown(null); }}
                                    disabled={isPending}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-emerald-700"
                                  >
                                    Aprobar
                                  </button>
                                  <button
                                    onClick={() => { handleCambiarEstado(p.id, "RECHAZADO"); setOpenDropdown(null); }}
                                    disabled={isPending}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-red-600"
                                  >
                                    Rechazar
                                  </button>
                                </>
                              )}
                            </div>,
                            document.body
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
