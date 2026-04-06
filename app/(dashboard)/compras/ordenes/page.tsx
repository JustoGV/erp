"use client";

import { useMemo, useState } from "react";
import { ShoppingCart, CheckCircle, Plus, Trash2, ClipboardList } from "lucide-react";
import {
  useOrdenesCompra,
  useAprobarOrdenCompra,
  useCrearOrdenCompra,
  useOrdenCompra,
  useRegistrarRecepcion,
  useProveedores,
  useRequerimientos,
} from "@/hooks/useCompras";
import { useLocal } from "@/contexts/LocalContext";
import { useApiToast } from "@/hooks/useApiToast";
import Pagination from "@/components/Pagination";
import Modal from "@/components/Modal";
import type { EstadoOrdenCompra, ItemOrdenCompraDto, ItemRecepcionDto } from "@/lib/api-types";

const ESTADO_CONFIG: Record<EstadoOrdenCompra, { class: string; label: string }> = {
  BORRADOR:          { class: "badge-secondary",                  label: "Borrador" },
  ENVIADA:           { class: "badge-info",                       label: "Enviada" },
  CONFIRMADA:        { class: "bg-purple-100 text-purple-700",    label: "Confirmada" },
  RECIBIDA_PARCIAL:  { class: "badge-warning",                    label: "Parcial" },
  RECIBIDA_COMPLETA: { class: "badge-success",                    label: "Recibida" },
  CANCELADA:         { class: "badge-danger",                     label: "Cancelada" },
};

const FILTROS = ["TODOS", "BORRADOR", "ENVIADA", "CONFIRMADA", "RECIBIDA_PARCIAL", "RECIBIDA_COMPLETA", "CANCELADA"] as const;
type Filtro = typeof FILTROS[number];

const ITEM_EMPTY: ItemOrdenCompraDto = {
  descripcion: "", cantidad: 0, unidad: "UNI", precioUnitario: 0,
  productoId: undefined, descuento: 0,
};

export default function OrdenesCompraPage() {
  const { selectedLocal, isAllLocales } = useLocal();
  const localId = isAllLocales ? undefined : selectedLocal?.id;
  const { handleError, handleSuccess } = useApiToast();
  const [page, setPage] = useState(1);
  const [filtro, setFiltro] = useState<Filtro>("TODOS");
  const [modalOpen, setModalOpen] = useState(false);

  const aprobar = useAprobarOrdenCompra();
  const crear = useCrearOrdenCompra();
  const registrar = useRegistrarRecepcion();

  // Estado modal recepción
  const [recepcionModalOpen, setRecepcionModalOpen] = useState(false);
  const [recepcionOrdenId, setRecepcionOrdenId] = useState("");
  const [nroRemito, setNroRemito] = useState("");
  const [obsRecepcion, setObsRecepcion] = useState("");
  const [lineasRec, setLineasRec] = useState<ItemRecepcionDto[]>([]);

  const { data: ordenDetalle } = useOrdenCompra(recepcionOrdenId);
  const itemsOrden = ordenDetalle?.data?.items ?? [];

  const openRecepcionModal = (ordenId: string) => {
    setRecepcionOrdenId(ordenId);
    setNroRemito("");
    setObsRecepcion("");
    setLineasRec([]);
    setRecepcionModalOpen(true);
  };

  const addLineaRec = (itemOrdenCompraId: string) => {
    if (lineasRec.some(l => l.itemOrdenCompraId === itemOrdenCompraId)) return;
    setLineasRec(p => [...p, { itemOrdenCompraId, cantidadRecibida: 0, cantidadRechazada: 0 }]);
  };
  const removeLineaRec = (id: string) => setLineasRec(p => p.filter(l => l.itemOrdenCompraId !== id));
  const setLineaRecField = (id: string, field: keyof ItemRecepcionDto, value: string) =>
    setLineasRec(p => p.map(l => l.itemOrdenCompraId !== id ? l : {
      ...l,
      [field]: (field === "cantidadRecibida" || field === "cantidadRechazada") ? Number(value) : value || undefined,
    }));

  const handleRecepcionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lineasRec.length === 0) { handleError(new Error("Agregá al menos un ítem.")); return; }
    try {
      await registrar.mutateAsync({
        ordenCompraId: recepcionOrdenId,
        nroRemito: nroRemito || undefined,
        observaciones: obsRecepcion || undefined,
        items: lineasRec,
      });
      handleSuccess("Recepción registrada", "La mercadería fue recibida y el stock actualizado.");
      setRecepcionModalOpen(false);
    } catch (err) {
      handleError(err);
    }
  };

  const { data, isLoading } = useOrdenesCompra({ localId, page, limit: 20 });
  const ordenes = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const total = data?.meta?.total ?? 0;

  // Datos para el formulario
  const { data: proveedoresData } = useProveedores({ localId, limit: 100 });
  const proveedores = (proveedoresData?.data ?? []).filter(p => p.active);
  const { data: requerimientosData } = useRequerimientos({ localId, limit: 100 });
  const requerimientos = (requerimientosData?.data ?? []).filter(r => r.estado === "AUTORIZADO");

  const items = useMemo(
    () => filtro === "TODOS" ? ordenes : ordenes.filter(o => o.estado === filtro),
    [ordenes, filtro],
  );

  // Formulario
  const defaultForm = {
    proveedorId: "", requerimientoId: "",
    fechaEntregaEstimada: "", condicionesPago: "", observaciones: "",
  };
  const [form, setForm] = useState(defaultForm);
  const [lineas, setLineas] = useState<ItemOrdenCompraDto[]>([{ ...ITEM_EMPTY }]);
  const setField = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const setLinea = (i: number, f: keyof ItemOrdenCompraDto, v: string) =>
    setLineas(prev => prev.map((l, idx) =>
      idx !== i ? l : {
        ...l,
        [f]: (f === "cantidad" || f === "precioUnitario" || f === "descuento")
          ? Number(v)
          : v || undefined,
      }
    ));

  const addLinea = () => setLineas(p => [...p, { ...ITEM_EMPTY }]);
  const removeLinea = (i: number) => setLineas(p => p.filter((_, idx) => idx !== i));

  const subtotal = lineas.reduce(
    (acc, l) => acc + l.cantidad * l.precioUnitario * (1 - (l.descuento ?? 0) / 100), 0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localId) { handleError(new Error("Seleccioná un local.")); return; }
    if (!form.proveedorId) { handleError(new Error("Seleccioná un proveedor.")); return; }
    if (lineas.some(l => !l.descripcion || l.cantidad <= 0 || l.precioUnitario < 0)) {
      handleError(new Error("Completá descripción, cantidad y precio en todos los ítems."));
      return;
    }
    try {
      await crear.mutateAsync({
        localId,
        dto: {
          proveedorId: form.proveedorId,
          requerimientoId: form.requerimientoId || undefined,
          fechaEntregaEstimada: form.fechaEntregaEstimada || undefined,
          condicionesPago: form.condicionesPago || undefined,
          observaciones: form.observaciones || undefined,
          items: lineas,
        },
      });
      handleSuccess("Orden creada", "La orden de compra fue registrada como BORRADOR.");
      setModalOpen(false);
      setForm(defaultForm);
      setLineas([{ ...ITEM_EMPTY }]);
    } catch (err) {
      handleError(err);
    }
  };

  const handleAprobar = async (id: string) => {
    try {
      await aprobar.mutateAsync(id);
      handleSuccess("Orden aprobada", "La orden pasó a estado ENVIADA.");
    } catch (err) {
      handleError(err);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart size={24} /> Órdenes de Compra
          </h1>
          <p className="text-slate-500">{total} órdenes registradas</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Nueva Orden
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200 flex gap-2 overflow-x-auto">
          {FILTROS.map(f => (
            <button
              key={f}
              onClick={() => { setFiltro(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                filtro === f
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f === "TODOS" ? "Todas" : ESTADO_CONFIG[f as EstadoOrdenCompra].label}
              {" "}({f === "TODOS" ? ordenes.length : ordenes.filter(o => o.estado === f).length})
            </button>
          ))}
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th>Entrega Est.</th>
                <th className="text-right">Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-10">Cargando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No hay órdenes de compra.</td></tr>
              ) : items.map((oc) => {
                const cfg = ESTADO_CONFIG[oc.estado] ?? { class: "badge-secondary", label: oc.estado };
                return (
                  <tr key={oc.id} className="table-row-hover">
                    <td className="font-mono text-xs">{oc.numero}</td>
                    <td className="font-medium">{oc.proveedor?.name ?? "—"}</td>
                    <td>{oc.createdAt?.slice(0, 10) ?? "—"}</td>
                    <td>{oc.fechaEntregaEstimada?.slice(0, 10) ?? "—"}</td>
                    <td className="text-right font-semibold">{fmt(oc.total)}</td>
                    <td><span className={`badge ${cfg.class}`}>{cfg.label}</span></td>
                    <td className="flex items-center gap-2">
                      {oc.estado === "BORRADOR" && (
                        <button
                          onClick={() => handleAprobar(oc.id)}
                          disabled={aprobar.isPending}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          <CheckCircle size={14} /> Aprobar
                        </button>
                      )}
                      {(oc.estado === "ENVIADA" || oc.estado === "CONFIRMADA" || oc.estado === "RECIBIDA_PARCIAL") && (
                        <a
                          href="/compras/recepciones"
                          className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-900"
                        >
                          <ClipboardList size={14} /> Registrar Recepción
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Modal Nueva Orden */}
      <Modal open={modalOpen} title="Nueva Orden de Compra" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Encabezado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Proveedor *</label>
              <select className="input" required value={form.proveedorId} onChange={e => setField("proveedorId", e.target.value)}>
                <option value="">— Seleccionar —</option>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Requerimiento (opcional)</label>
              <select className="input" value={form.requerimientoId} onChange={e => setField("requerimientoId", e.target.value)}>
                <option value="">— Ninguno —</option>
                {requerimientos.map(r => (
                  <option key={r.id} value={r.id}>{r.numero} — {r.solicitante}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Fecha Entrega Estimada</label>
              <input type="date" className="input"
                value={form.fechaEntregaEstimada} onChange={e => setField("fechaEntregaEstimada", e.target.value)} />
            </div>
            <div>
              <label className="label">Condiciones de Pago</label>
              <input type="text" className="input" placeholder="30 días neto"
                value={form.condicionesPago} onChange={e => setField("condicionesPago", e.target.value)} />
            </div>
            <div>
              <label className="label">Observaciones</label>
              <input type="text" className="input" placeholder="Notas internas..."
                value={form.observaciones} onChange={e => setField("observaciones", e.target.value)} />
            </div>
          </div>

          {/* Líneas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="label mb-0">Ítems *</span>
              <button type="button" onClick={addLinea}
                className="text-xs text-blue-600 hover:text-blue-900 flex items-center gap-1">
                <Plus size={14} /> Agregar ítem
              </button>
            </div>

            {/* Cabecera de columnas */}
            <div className="grid grid-cols-12 gap-2 mb-1 px-1 text-xs font-medium text-slate-500">
              <span className="col-span-4">Descripción *</span>
              <span className="col-span-2">Cantidad *</span>
              <span className="col-span-1">Unidad</span>
              <span className="col-span-2">Precio Unit. *</span>
              <span className="col-span-2">Desc. %</span>
              <span className="col-span-1" />
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {lineas.map((l, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <input type="text" className="input text-sm" placeholder="Descripción"
                      value={l.descripcion}
                      onChange={e => setLinea(i, "descripcion", e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <input type="number" className="input text-sm" placeholder="0" min="0.001" step="0.001"
                      value={l.cantidad || ""}
                      onChange={e => setLinea(i, "cantidad", e.target.value)} />
                  </div>
                  <div className="col-span-1">
                    <input type="text" className="input text-sm" placeholder="UNI"
                      value={l.unidad}
                      onChange={e => setLinea(i, "unidad", e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <input type="number" className="input text-sm" placeholder="0.00" min="0" step="0.01"
                      value={l.precioUnitario || ""}
                      onChange={e => setLinea(i, "precioUnitario", e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <input type="number" className="input text-sm" placeholder="0" min="0" max="100" step="0.01"
                      value={l.descuento || ""}
                      onChange={e => setLinea(i, "descuento", e.target.value)} />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {lineas.length > 1 && (
                      <button type="button" onClick={() => removeLinea(i)}
                        className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal */}
            <div className="flex justify-end pt-3 border-t border-slate-100 mt-3">
              <span className="text-sm text-slate-500 mr-2">Subtotal:</span>
              <span className="text-sm font-semibold text-slate-800">{fmt(subtotal)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={crear.isPending}>
              {crear.isPending ? "Guardando..." : "Crear Orden"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Registrar Recepción */}
      <Modal open={recepcionModalOpen} title="Registrar Recepción de Mercadería" onClose={() => setRecepcionModalOpen(false)}>
        <form onSubmit={handleRecepcionSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nº Remito</label>
              <input type="text" className="input" placeholder="0001-00012345"
                value={nroRemito} onChange={e => setNroRemito(e.target.value)} />
            </div>
            <div>
              <label className="label">Observaciones</label>
              <input type="text" className="input" placeholder="Notas..."
                value={obsRecepcion} onChange={e => setObsRecepcion(e.target.value)} />
            </div>
          </div>

          {itemsOrden.length > 0 ? (
            <div>
              <p className="label mb-2">Ítems de la Orden</p>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2">
                {itemsOrden.map(item => {
                  const pendiente = Number(item.cantidad) - Number(item.cantidadRecibida);
                  const enLinea = lineasRec.find(l => l.itemOrdenCompraId === item.id);
                  return (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!enLinea}
                        onChange={() => enLinea ? removeLineaRec(item.id) : addLineaRec(item.id)} />
                      <span className="flex-1 truncate">{item.descripcion}</span>
                      <span className="text-slate-500 text-xs whitespace-nowrap">Pend: {pendiente} {item.unidad}</span>
                    </div>
                  );
                })}
              </div>
              {lineasRec.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-slate-600">Cantidades:</p>
                  {lineasRec.map(l => {
                    const item = itemsOrden.find(i => i.id === l.itemOrdenCompraId);
                    return (
                      <div key={l.itemOrdenCompraId} className="grid grid-cols-12 gap-2 items-center">
                        <span className="col-span-4 text-xs truncate">{item?.descripcion}</span>
                        <div className="col-span-3">
                          <input type="number" className="input text-xs" placeholder="Recibida" min="0.001" step="0.001"
                            value={l.cantidadRecibida || ""}
                            onChange={e => setLineaRecField(l.itemOrdenCompraId, "cantidadRecibida", e.target.value)} />
                        </div>
                        <div className="col-span-3">
                          <input type="number" className="input text-xs" placeholder="Rechazada" min="0" step="0.001"
                            value={l.cantidadRechazada || ""}
                            onChange={e => setLineaRecField(l.itemOrdenCompraId, "cantidadRechazada", e.target.value)} />
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <button type="button" onClick={() => removeLineaRec(l.itemOrdenCompraId)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : recepcionOrdenId ? (
            <p className="text-sm text-slate-400 text-center py-4">Cargando ítems...</p>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setRecepcionModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={registrar.isPending}>
              {registrar.isPending ? "Registrando..." : "Registrar Recepción"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

