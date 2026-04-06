"use client";

import { useState } from "react";
import { PackageCheck, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useLocal } from "@/contexts/LocalContext";
import {
  useRecepciones,
  useRegistrarRecepcion,
  useOrdenesCompra,
  useOrdenCompra,
} from "@/hooks/useCompras";
import Pagination from "@/components/Pagination";
import Modal from "@/components/Modal";
import { useApiToast } from "@/hooks/useApiToast";
import type { ItemRecepcionDto } from "@/lib/api-types";

export default function RecepcionesPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const { handleError, handleSuccess } = useApiToast();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Datos de lista
  const { data, isLoading } = useRecepciones({ localId, page, limit: 20 });
  const items = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  // Formulario
  const registrar = useRegistrarRecepcion();
  const [ordenSeleccionadaId, setOrdenSeleccionadaId] = useState("");
  const [nroRemito, setNroRemito] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [lineas, setLineas] = useState<ItemRecepcionDto[]>([]);

  // Órdenes disponibles para seleccionar (estados válidos para recepcionar)
  const { data: ordenesData } = useOrdenesCompra({ localId, limit: 100 });
  const ordenesValidas = (ordenesData?.data ?? []).filter(o =>
    ["ENVIADA", "CONFIRMADA", "RECIBIDA_PARCIAL"].includes(o.estado)
  );

  // Carga ítems de la orden seleccionada
  const { data: ordenDetalle } = useOrdenCompra(ordenSeleccionadaId);
  const itemsOrden = ordenDetalle?.data?.items ?? [];

  const handleOrdenChange = (id: string) => {
    setOrdenSeleccionadaId(id);
    setLineas([]);
  };

  const addLinea = (itemOrdenCompraId: string) => {
    if (lineas.some(l => l.itemOrdenCompraId === itemOrdenCompraId)) return;
    setLineas(p => [...p, {
      itemOrdenCompraId,
      cantidadRecibida: 0,
      cantidadRechazada: 0,
      motivoRechazo: undefined,
      observaciones: undefined,
    }]);
  };

  const removeLinea = (id: string) =>
    setLineas(p => p.filter(l => l.itemOrdenCompraId !== id));

  const setLineaField = (id: string, field: keyof ItemRecepcionDto, value: string) =>
    setLineas(p => p.map(l => l.itemOrdenCompraId !== id ? l : {
      ...l,
      [field]: (field === "cantidadRecibida" || field === "cantidadRechazada")
        ? Number(value)
        : value || undefined,
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordenSeleccionadaId) { handleError(new Error("Seleccioná una orden de compra.")); return; }
    if (lineas.length === 0) { handleError(new Error("Agregá al menos un ítem a recepcionar.")); return; }
    try {
      await registrar.mutateAsync({
        ordenCompraId: ordenSeleccionadaId,
        nroRemito: nroRemito || undefined,
        observaciones: observaciones || undefined,
        items: lineas,
      });
      handleSuccess("Recepción registrada", "La mercadería fue recibida y el stock actualizado.");
      setModalOpen(false);
      setOrdenSeleccionadaId("");
      setNroRemito("");
      setObservaciones("");
      setLineas([]);
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <PackageCheck size={24} /> Recepciones de Compra
          </h1>
          <p className="text-slate-500">{total} recepciones registradas</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Nueva Recepción
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nº / Remito</th>
                <th>OC Nº</th>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th>Recibido por</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">No se encontraron recepciones.</td></tr>
              ) : items.map((r) => (
                <>
                  <tr
                    key={r.id}
                    className="table-row-hover cursor-pointer select-none"
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  >
                    <td className="font-mono text-xs">
                      <span className="inline-flex items-center gap-1">
                        {expandedId === r.id ? <ChevronDown size={13} className="text-slate-400" /> : <ChevronRight size={13} className="text-slate-400" />}
                        {r.numero}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-blue-600">{r.ordenCompra?.numero ?? "—"}</td>
                    <td className="font-medium">{r.ordenCompra?.proveedor?.name ?? "—"}</td>
                    <td>{r.fechaRecepcion?.slice(0, 10) ?? r.createdAt?.slice(0, 10) ?? "—"}</td>
                    <td>{r.recibidoPor ?? "—"}</td>
                  </tr>
                  {expandedId === r.id && (
                    <tr key={`${r.id}-detail`}>
                      <td colSpan={5} className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                        {r.observaciones && (
                          <p className="text-xs text-slate-500 mb-3 italic flex items-center gap-1">
                            <span className="font-medium text-slate-600">Obs:</span> {r.observaciones}
                          </p>
                        )}
                        {(r.items ?? []).length === 0 ? (
                          <p className="text-xs text-slate-400">Sin detalle de ítems.</p>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {(r.items ?? []).map((item) => {
                              const ordenada = Number(item.cantidadOrdenada);
                              const aceptada = Number(item.cantidadAceptada);
                              const rechazada = Number(item.cantidadRechazada);
                              // Pendiente real = acumulado desde el item de la orden
                              const itemOrden = (r.ordenCompra?.items ?? []).find(i => i.id === item.itemOrdenCompraId);
                              const totalOrdenado = itemOrden ? Number(itemOrden.cantidad) : ordenada;
                              const totalRecibidoAcum = itemOrden ? Number(itemOrden.cantidadRecibida) : aceptada;
                              const pendienteReal = Math.max(0, totalOrdenado - totalRecibidoAcum);
                              const pct = totalOrdenado > 0 ? Math.round((totalRecibidoAcum / totalOrdenado) * 100) : 0;
                              return (
                                <div key={item.id} className="bg-white rounded-lg border border-slate-200 px-4 py-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-800">{item.descripcion}</span>
                                    <span className="text-xs text-slate-400">{pct}% recibido del total</span>
                                  </div>
                                  {/* Barra de progreso */}
                                  <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
                                    <div
                                      className="h-1.5 rounded-full bg-emerald-500 transition-all"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <div className="grid grid-cols-5 gap-2 text-center">
                                    <div className="bg-slate-50 rounded-lg py-2 px-1">
                                      <p className="text-xs text-slate-400 mb-0.5">Total OC</p>
                                      <p className="text-sm font-bold text-slate-700">{totalOrdenado}</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg py-2 px-1">
                                      <p className="text-xs text-blue-500 mb-0.5">Esta recep.</p>
                                      <p className="text-sm font-bold text-blue-700">{aceptada}</p>
                                    </div>
                                    <div className="bg-emerald-50 rounded-lg py-2 px-1">
                                      <p className="text-xs text-emerald-600 mb-0.5">Recibido total</p>
                                      <p className="text-sm font-bold text-emerald-700">{totalRecibidoAcum}</p>
                                    </div>
                                    <div className={`rounded-lg py-2 px-1 ${pendienteReal > 0 ? "bg-amber-50" : "bg-slate-50"}`}>
                                      <p className={`text-xs mb-0.5 ${pendienteReal > 0 ? "text-amber-600" : "text-slate-400"}`}>Pendientes</p>
                                      <p className={`text-sm font-bold ${pendienteReal > 0 ? "text-amber-700" : "text-slate-400"}`}>
                                        {pendienteReal > 0 ? pendienteReal : "✓"}
                                      </p>
                                    </div>
                                    <div className={`rounded-lg py-2 px-1 ${rechazada > 0 ? "bg-red-50" : "bg-slate-50"}`}>
                                      <p className={`text-xs mb-0.5 ${rechazada > 0 ? "text-red-500" : "text-slate-400"}`}>Rechazadas</p>
                                      <p className={`text-sm font-bold ${rechazada > 0 ? "text-red-600" : "text-slate-400"}`}>
                                        {rechazada > 0 ? rechazada : "—"}
                                      </p>
                                    </div>
                                  </div>
                                  {item.motivoRechazo && (
                                    <p className="mt-2 text-xs text-red-500 italic">Rechazo: {item.motivoRechazo}</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal open={modalOpen} title="Nueva Recepción de Mercadería" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Orden de Compra *</label>
              <select className="input" required value={ordenSeleccionadaId} onChange={e => handleOrdenChange(e.target.value)}>
                <option value="">— Seleccionar —</option>
                {ordenesValidas.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.numero} — {o.proveedor?.name ?? "Sin proveedor"} ({o.estado})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Nº Remito</label>
              <input type="text" className="input" placeholder="0001-00012345"
                value={nroRemito} onChange={e => setNroRemito(e.target.value)} />
            </div>
            <div>
              <label className="label">Observaciones</label>
              <input type="text" className="input" placeholder="Llegó en buen estado..."
                value={observaciones} onChange={e => setObservaciones(e.target.value)} />
            </div>
          </div>

          {ordenSeleccionadaId && itemsOrden.length > 0 && (
            <div>
              <p className="label mb-2">Ítems de la Orden</p>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2">
                {itemsOrden.map(item => {
                  const pendiente = item.cantidad - item.cantidadRecibida;
                  const enLinea = lineas.find(l => l.itemOrdenCompraId === item.id);
                  return (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!enLinea}
                        onChange={() => enLinea ? removeLinea(item.id) : addLinea(item.id)} />
                      <span className="flex-1 truncate">{item.descripcion}</span>
                      <span className="text-slate-500 text-xs whitespace-nowrap">Pend: {pendiente} {item.unidad}</span>
                    </div>
                  );
                })}
              </div>
              {lineas.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-slate-600">Cantidades a recepcionar:</p>
                  {lineas.map(l => {
                    const item = itemsOrden.find(i => i.id === l.itemOrdenCompraId);
                    return (
                      <div key={l.itemOrdenCompraId} className="grid grid-cols-12 gap-2 items-center text-sm">
                        <span className="col-span-4 truncate text-xs">{item?.descripcion}</span>
                        <div className="col-span-3">
                          <input type="number" className="input text-xs" placeholder="Recibida" min="0.001" step="0.001"
                            value={l.cantidadRecibida || ""}
                            onChange={e => setLineaField(l.itemOrdenCompraId, "cantidadRecibida", e.target.value)} />
                        </div>
                        <div className="col-span-3">
                          <input type="number" className="input text-xs" placeholder="Rechazada" min="0" step="0.001"
                            value={l.cantidadRechazada || ""}
                            onChange={e => setLineaField(l.itemOrdenCompraId, "cantidadRechazada", e.target.value)} />
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <button type="button" onClick={() => removeLinea(l.itemOrdenCompraId)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={registrar.isPending}>
              {registrar.isPending ? "Registrando..." : "Registrar Recepción"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

